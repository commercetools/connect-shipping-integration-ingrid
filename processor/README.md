# TODOs in processor

## src/clients/commercetools

### [api.client.ts (Lines 94-97)](./src/clients/commercetools/api.client.ts#L94-L97)

- [ ] Determine whether the merchant or enabler will set the ingridSessionId on the cart, or if the processor handles the type logic
  - Reference: [PR Discussion](https://github.com/commercetools/connect-shipping-integration-ingrid/pull/16#discussion_r1935235022)

### [api.client.ts (Line 215)](./src/clients/commercetools/api.client.ts#L215)

- [ ] Review if there's a need for the custom type field definition to be dynamic (currently hardcoded)

## src/connectors

### [post-deploy.ts (Lines 22-78)](./src/connectors/post-deploy.ts#L22-L78)

- [ ] Refactor the checkIfIngridCustomTypeExists function as logic is currently inside service

## src/services/helpers

### [transformCommercetoolsToIngridDTOs.ts (Line 20)](./src/services/helpers/transformCommercetoolsToIngridDTOs.ts#L20)

- [ ] Determine how to include/map tax

### [transformCommercetoolsToIngridDTOs.ts (Lines 25-26)](./src/services/helpers/transformCommercetoolsToIngridDTOs.ts#L25-L26)

- [ ] Evaluate if external_id is needed when cartId is set as cart_id
