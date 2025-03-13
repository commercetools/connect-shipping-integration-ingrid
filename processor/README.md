# Shipping Integration Processor
This module provides an application based on [commercetools Connect](https://docs.commercetools.com/connect), which is triggered by HTTP requests from Checkout UI for shipment operations.

The corresponding cart details including line items would be fetched from composable commerce platform, and then be sent to Ingrid delivery platform for shipment session initialization. In additions, the processor also supports synchonization of the latest shipment option collected in Ingrid delivery platform back to the `cart` in commercetools composable commerce, so that the cart details includes the shipment option and delivery address.

The module also provides template scripts for post-deployment and pre-undeployment action. After deployment or before undeployment via connect service completed, customized actions can be performed based on users' needs.

## Getting Started

These instructions will get you up and running on your local machine for development and testing purposes.
Please run following npm commands under `processor` folder.

#### Install dependencies
```
$ npm install
```
#### Build the application in local environment. NodeJS source codes are then generated under dist folder
```
$ npm run build
```
#### Run automation test
```
$ npm run test
```
#### Run the application in local environment. Remind that the application has been built before it runs
```
$ npm run start
```
#### Fix the code style
```
$ npm run lint:fix
```
#### Verify the code style
```
$ npm run lint
```
#### Run post-deploy script in local environment
```
$ npm run connector:post-deploy
```
#### Run pre-undeploy script in local environment
```
$ npm run connector:pre-undeploy
```

## Running application

Setup correct environment variables: check `processor/src/config/config.ts` for default values.

Make sure commercetools client credential have at least the following permissions:

* `manage_orders`
* `view_sessions`
* `introspect_oauth_tokens`
* `view_api_clients` 

```
$ npm run dev
```

## Authentication

Some of the services have authentication mechanism. 

* `oauth2`: Relies on commercetools OAuth2 server
* `session`: Relies on commercetools session service

### OAuth2
OAuth2 token can be obtained from commercetools OAuth2 server. It requires API Client created beforehand. For details, please refer to [Requesting an access token using the Composable Commerce OAuth 2.0 service](https://docs.commercetools.com/api/authorization#requesting-an-access-token-using-the-composable-commerce-oauth-20-service).

### Session
Shipping connectors relies on session to be able to share information between `enabler` and `processor`.
To create session before sharing information between these two modules, please execute following request to commercetools session service
```
POST https://session.<region>.commercetools.com/<commercetools-project-key>/sessions
Authorization: Bearer <oauth token with manage_sessions scope>

{
  "cart": {
    "cartRef": {
      "id": "<cart-id>" 
    }
  },
  "metadata": {
    // define various properties here if necessary
  }
}
```

For details about checkout session creation, please refer to [commercetools checkout documentation](https://docs.commercetools.com/checkout/installing-checkout#create-checkout-sessions)

Afterwards, session ID can be obtained from response, which is necessary to be put as `x-session-id` inside request header when sending request to endpoints such as `/sessions/init` and `/sessions/update`.

## APIs
The processor exposes following endpoints to execute various operations with Ingrid platform:

### Create Ingrid delivery session
It fetches `cart` resource from commercetools composable commerce and create shipping session in Ingrid platform
#### Endpoint
`POST /sessions/init`

#### Request Parameters
It doesn't require any request body. The endpoint makes use of the checkout session ID inside the request header to get the corresponding `cart` from commercetools composable commerce platform.

Afterwards, the endpoint submits the following the cart information to Ingrid platform to start delivery session opened by Ingrid.
- Cart
    - LineItems
    - Discount
    - Discounted Cart price including tax
- Locale
- Country
- Currency

For details about the request of Ingrid delivery session creation, please refer to [Ingrid documentation](https://developer.ingrid.com/delivery_checkout/backend_integration/index.html#create-checkout-session)

After delivery session has been created in Ingrid, the Ingrid session ID is stored as a custom field `ingridSessionId` inside commercetools composable commerce `cart`.

#### Response Parameters
- ingridSessionId: The identifier of delivery session [adyen checkout create session response](https://docs.adyen.com/api-explorer/Checkout/71/post/sessions#responses) returned by Ingrid platform after Ingrid delivery session created.  
- success: A boolean flag indicates the result of the initialization process.
- ingridHtml: The HTML snippets of a widget generated by Ingrid platform. The widget is rendered in frontend to enable end-user to input shipping information in web page.
- cartVersion: The latest version number of `cart` in commercetools composable commerce. Merchant can use it for further operations on cart if required after Ingrid delivery session has been created.

### Update cart
It mainly handles the following operations:
- It synchronizes the up-to-date shipping adress and option from Ingrid platform back to the `cart` in commercetools composable commerce.
- After the shipping adress is updated to the `cart` in commercetools composable commerce, the cart price may get recalculated due to tax category related to the shipping country. If the cart price is different from the price collected by Ingrid platform, the cart price as well as line item price including discount is uploaded to Ingrid platform again.

#### Endpoint
`POST /sessions/update`

#### Request Parameters
It doesn't require any request body. The endpoint makes use of the checkout session ID inside the request header to get the Ingrid session ID from the the corresponding `cart` inside commercetools composable commerce platform.

#### Response Parameters
- ingridSessionId: The identifier of delivery session [adyen checkout create session response](https://docs.adyen.com/api-explorer/Checkout/71/post/sessions#responses) returned by Ingrid platform after Ingrid delivery session created.  
- success: A boolean flag indicates the result of the initialization process.
- cartVersion: The latest version number of `cart` in commercetools composable commerce. Merchant can use it for further operations on `cart` if required after Ingrid delivery session has been created.

## Post-Deployment Script
After depolyment of the Ingrid shipping connector, script is executed in order to perform customzied actions based on users' needs. We have also prepared following actions to pre-define some mandatory settings for this shipping connector.
- Create/Update `type` in commercetools composable commerce
- Cretae/Update `taxCategory` for shipmennt cost

### Custom Type for Ingrid
If merchant has already maintained their own custom type for order resource in commercetools composable commerce, its key can be provided as an environment variable `INGRID_SESSION_CUSTOM_TYPE_KEY` during deployment. The post-deployment script then adds a custom field definition `ingridSessionId` into the specified `customType`. If the key of `customType` is not provided, the post-deploy script create a new `customType` for `order` resource during script execution.

The custom field definition `ingridSessionId` is essential to enable `cart` in commercetools composable commerce to store the Ingrid session ID.

### Tax Category for Ingrid shipping cost
If merchant has already maintained `taxCategory` in commercetools composable commerce, its key can be provided as an environment variable `INGRID_SPECIFIC_TAX_CATEGORY_KEY` during deployment. If it is not provided, the post-deploy script create a new `taxCategory` with key `ingrid-tax` during script execution. This newly created `taxCategory` will have zero tax rate for all countries maintained in the current commercetools project, therefore merchant is suggested to update the desired tax rate after deployment if no `taxCategory` key is provided for deployment

This `taxCateory` is required to calculate the shipping cost tax rate when update the shipping information from Ingrid platform to the `cart` in commercetools composable commerce. For details, please refer to the [documetation about setting custom shipping method](https://docs.commercetools.com/api/projects/carts#set-custom-shippingmethod)