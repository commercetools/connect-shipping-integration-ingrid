# TODOs in processor

## TODOs in src/clients/commercetools

### api.client.ts (Lines 94-97)

- Determine whether the merchant or enabler will set the ingridSessionId on the cart, or if the processor handles the type logic
  - Reference: [PR Discussion](https://github.com/commercetools/connect-shipping-integration-ingrid/pull/16#discussion_r1935235022)

### api.client.ts (Line 215)

- Review if there's a need for the custom type field definition to be dynamic (currently hardcoded)

## TODOs in src/connectors

### post-deploy.ts (Lines 22-78)

- Refactor the checkIfIngridCustomTypeExists function as logic is currently inside service

## TODOs in src/services/helpers

### transformCommercetoolsToIngridDTOs.ts (Line 20)

- Determine how to include/map tax

### transformCommercetoolsToIngridDTOs.ts (Lines 25-26)

- Evaluate if external_id is needed when cartId is set as cart_id
