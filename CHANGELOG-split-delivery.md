# Split Delivery/Shipment Support — Changelog

## Context

The Ingrid connector previously threw `MULTIPLE_DELIVERY_GROUPS_NOT_SUPPORTED` whenever Ingrid returned more than one delivery group. Both Ingrid and commercetools APIs fully support split deliveries — the gap was only in this connector's mapping layer.

**Strategy chosen**: Backward-compatible. Single delivery group uses the existing `Single` shipping mode flow unchanged. Multiple groups use commercetools `Multiple` shipping mode via `addCustomShippingMethod` actions.

---

## Changes by File

### 1. Ingrid Type Definitions

**Files:**
- `processor/src/clients/ingrid/types/ingrid.client.type.ts`
- `event-handler/src/client/ingrid/types/ingrid.client.type.ts`

**What:** Added `IngridCartGroup` type and changed `IngridCart.groups` from `unknown[]` to `IngridCartGroup[]`.

**Why:** The `groups` field was untyped (`unknown[]`), meaning any future code that needs to send cart groups to Ingrid (e.g., to explicitly split items) would have no type safety. Typing it now prepares for Step 7 (cart-to-Ingrid group mapping, deferred) and makes the API contract explicit.

---

### 2. Shipping Custom Type Fields (Post-Deploy)

**File:** `processor/src/connectors/actions.ts`

**What:** Added 5 new fields to the `ingrid-shipping` custom type: `ingridExtMethodId`, `ingridPickupPointId`, `ingridDeliveryAddons`, `ingridInstaboxToken`, `ingridGroupId`.

**Why:** In `Single` shipping mode, metadata like external method ID and pickup point ID are stored as cart-level custom fields on the `ingrid-session` type. In `Multiple` mode, each shipping entry is independent — we need per-shipping-entry metadata. The `shipping` resource type's custom fields are the commercetools mechanism for this. The existing `updateType` logic already handles adding missing fields to existing types, so this is additive and non-breaking on deploy.

---

### 3. Transform Layer — Multi-Group Support

**File:** `processor/src/services/helpers/transformIngridToCommercetoolsDTOs.ts`

**What:**
- Removed the `MULTIPLE_DELIVERY_GROUPS_NOT_SUPPORTED` error throw (lines 45-50)
- Added `MultipleDeliveryGroupPayload` type
- Added `transformMultipleDeliveryGroups()` function
- Kept existing `transformIngridDeliveryGroupsToCommercetoolsDataTypes()` unchanged for backward compat

**Why:** The existing single-group function extracts one billing address, one delivery address, and one shipping method. For multiple groups, we need an array of per-group payloads, each with its own `shippingKey` (format: `ingrid-${group_id}`), delivery address, and shipping method. Billing address is taken from the first group since commercetools has one billing address per cart. A warning is logged if billing addresses differ across groups.

**Design decision:** We kept both functions rather than refactoring the single-group function. This avoids touching the well-tested single-group path and eliminates regression risk.

---

### 4. commercetools API Client — Multiple Shipping Method

**File:** `processor/src/clients/commercetools/api.client.ts`

**What:** Added `updateCartWithMultipleCustomShippingMethods()` method.

**Why:** The existing `updateCartWithAddressAndShippingMethod()` uses `setCustomShippingMethod` (singular) which works in `Single` mode. For `Multiple` mode, we need `addCustomShippingMethod` (plural) — a different cart update action. The new method:
1. Removes existing Ingrid shipping entries (keys starting with `ingrid-`) to handle re-updates
2. Sets billing address
3. Issues `addCustomShippingMethod` per group with per-entry custom fields

All actions go in a single `post()` call to avoid version conflicts.

**Design decision:** Remove-then-add in the same call handles the case where a user re-triggers update after Ingrid changes from 2 groups to 3 (or vice versa). Without removal, stale shipping entries would persist.

---

### 5. Shipping Service — Single vs Multiple Routing

**File:** `processor/src/services/ingrid-shipping.service.ts`

**What:** Refactored `update()` to branch on `delivery_groups.length`:
- `=== 1`: Delegates to `updateCartWithSingleGroup()` (extracted from original code, unchanged logic)
- `> 1`: Delegates to `updateCartWithMultipleGroups()` (new path)

Also added `keyOfIngridShippingCustomType` to config (`processor/src/config/index.ts`).

**Why:** The routing decision is simple and clean — Ingrid tells us how many groups there are, and we pick the matching commercetools shipping mode. Address validation was moved before the branch so it applies to all groups uniformly.

**Design decision:** The price comparison logic (`ingridTotalValue !== commercetoolsTotalTaxedValue`) works unchanged for both paths because `updatedCart.taxedPrice.totalGross` reflects the total including all shipping costs regardless of mode.

---

### 6. Event Handler — Multi-Group Completion

**Files:**
- `event-handler/src/client/commercetools/update.client.ts`
- `event-handler/src/controllers/event.controller.ts`

**What:**
- `setTransportOrderId`: Added optional `shippingKey` parameter. When provided, includes `shippingKey` in the `setShippingCustomType` action to target a specific shipping entry.
- Event controller: After Ingrid session completion, checks `delivery_groups.length`. For multiple groups, loops over all groups calling `setTransportOrderId` per group with `shippingKey: ingrid-${group_id}`. Each call returns an updated order version used for the next call.

**Why:** In `Single` mode, `setShippingCustomType` without a `shippingKey` targets the single shipping entry. In `Multiple` mode, we must specify which shipping entry to target. The `shippingKey` parameter in the commercetools API was designed for exactly this. `changeShipmentState` stays at order level (it's an order-level state, not per-shipping).

---

### 7. Config & Mock Updates

**Files:**
- `processor/src/config/index.ts`: Added `keyOfIngridShippingCustomType` (defaults to `ingrid-shipping`)
- `event-handler/test/mock/mock-configuration.ts`: Added `ingridShippingCustomTypeKey`

**Why:** The processor service needs to know the shipping custom type key to pass it to `addCustomShippingMethod` custom fields. The event handler already had this in its config (`readConfiguration().ingridShippingCustomTypeKey`), but the processor didn't expose it.

---

### 8. Tests

**Processor tests:**
- `test/services/helpers.spec.ts`: Replaced "should throw error for multiple groups" with 3 tests: single-group passthrough, multi-group transform, empty groups error
- `test/services/ingrid-shipping.service.spec.ts`: Added test for `update()` with 2 delivery groups verifying `updateCartWithMultipleCustomShippingMethods` is called with correct shippingKeys and groupIds
- `test/mock/mock-ingrid-client-objects.ts`: Added `mockIngridCheckoutSessionWithMultipleGroups` (2 groups: Standard + Express, different delivery addresses)
- `test/mock/mock-cart.ts`: Added `cartWithMultipleShipping` (Multiple mode, 2 shipping entries)

**Event handler tests:**
- `test/controllers/event.controller.spec.ts`: Added test with 2 delivery groups verifying `setTransportOrderId` called per group with correct `shippingKey` and version chaining (v1 -> v2 -> v3)

**Result:** Processor 119/119 tests pass, Event Handler 69/69 tests pass, both type check clean.

---

## What's NOT Changed (and why)

| Area | Reason |
|---|---|
| `init()` flow | Session creation is unaffected — Ingrid decides the groups |
| Enabler (frontend) | The widget is Ingrid's — it handles split UI internally |
| `transformCommercetoolsToIngridDTOs.ts` | Step 7 (cart-to-Ingrid groups) is deferred. Without explicit groups, Ingrid returns a single group (current behavior). Splitting is driven by Ingrid-side config |
| Environment variables | No new required env vars. `INGRID_SHIPPING_CUSTOM_TYPE_KEY` already existed |
| API client scopes | `manage_orders` already covers `addCustomShippingMethod` |

## Deployment Notes

- **Post-deploy handles everything**: The existing `post-deploy.ts` calls `handleShippingCustomTypeAction` which auto-adds missing fields to the `ingrid-shipping` type
- **Backward compatible**: Existing single-group orders and carts are unaffected
- **Ingrid prerequisite**: Split delivery must be enabled on Ingrid's side for the connector to receive >1 delivery group
