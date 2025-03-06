# connect-shipping-integration-ingrid
This repository provides a [connect](https://docs.commercetools.com/connect) for integration to Ingrid delivery solution provider.
- [Feature](#Features)
- [Overview](#Overview)
- [Prerequisite](#Prerequisite)
- [Development Guide](#development-guide)

## Features
- Typescript language supported.
- Uses Fastify and Express as web server framework in different modules.
- Uses [commercetools SDK](https://docs.commercetools.com/sdk/js-sdk-getting-started) for the commercetools-specific communication.
- Includes local development utilities in npm commands to build, start, test, lint & prettify code.

## Overview
The Ingrid-integration connector contains three modules :  
- Enabler: Acts as a wrapper implementation in which frontend components from Ingrid embedded. It gives control to checkout product on when and how to load the connector frontend based on business configuration. In cases connector is used directly and not through Checkout product, the connector library can be loaded directly on frontend instead of communicating with Ingrid platform from fronted.
- Processor : Acts as backend services which is middleware to integrate with Ingrid platform. It is mainly responsible for managing session initialized in Ingrid platform and updating cart entity in composable commerce.  Also the request context, commercetools checkout sessions and other tools necessary to transact are all maintained inside this module.
- Event Handler: It processes event messages from commercetools composable commerce in asynchronous mode. The connector subscribes order creation event in commercetools composable commerce and uses it to complete the delivery session in the Ingrid platform followed by changing shipment state for commercetools order.

### Intial Flow
```mermaid

flowchart TD
    node1(( ))
    node2(( ))
    user("User")-->checkout("Checkout Page")
    subgraph connector
        enabler
        processor
    end
    subgraph coco["Commercetools Composable Commerce"]
        cart
        session
    end
    subgraph shipping["Ingrid"]
        session.create
    end
    checkout----node1
    
    node1--"0.Create cart & checkout session"------>coco
    
    checkout("Checkout Page")----node2
    processor("processor (APIs)")--"2.fetch cart"-->coco
    node2--"1.init Ingrid session"-->enabler("enabler(Javascript SDK)")-->processor("processor (APIs)")--"3.create Ingrid session with cart"-->shipping("Ingrid")--"4.return HTML widget"-->processor("processor (APIs)")
    style coco height:150
    style cart height:80, text-align:center
    style session height:80, text-align:center
```

0. It is supposed that merchant creates the cart and [checkout session](https://docs.commercetools.com/checkout/installing-checkout#create-checkout-sessions) in commercetools composable commerce before initialize delivery session on Ingrid platform.
1. commercetools Checkout retrieves SDK as static assets from `enabler` in connector. After downloading the SDK, commercetools Checkout sends request via the SDK to endpoints exposed by `processor` to trigger Ingrid session initialization.
2. The `processor` fetches the latest cart from commercetools composable commerce by the provided commercetools checkout session.
3. Ingrid receives the cart details from the `processor` and initialize a delivery session on Ingrid platform.
4. Ingrid platform returns HTML snippet of the widget, which contains a form for filling shipping address and shipping options. The HTML snippet is returned back to frontend checkout page for display purpose.

### Update Flow
```mermaid

flowchart TD
    node1(( ))
    user("User")-->checkout("Checkout Page")
    subgraph connector
        enabler
        processor
    end
    subgraph coco["Commercetools Composable Commerce"]
        cart
        session
        
    end
    subgraph shipping["Ingrid"]
        session.get
    end
    
    checkout("Checkout Page")----node1
    processor("processor (APIs)")--"3.update shipping info"-->coco
    node1--"1.Update cart"-->enabler("enabler(Javascript SDK)")-->processor("processor (APIs)")
    shipping("Ingrid")--"2.fetch Ingrid shipping options"-->processor("processor (APIs)")
    processor("processor (APIs)")--"4.Synchronize tax-included price"-->shipping("Ingrid")
    style coco height:150
    style cart height:80, text-align:center
    style session height:80, text-align:center
```

1. commercetools Checkout sends request via the SDK to endpoints exposed by `processor` to trigger update cart process.
2. The `processor` fetches the up-to-date shipping info from the Ingrid platform collected through the widget.
3. Shipping info is saved to the cart in commercetools composable commerce.
4. If the price stored in the Ingrid platform is different from the tax-included price in commercetools cart, this price is sychronized to the Ingrid platform.

### Completion Flow

```mermaid
flowchart TD
    user("User")-->checkout("Checkout Page")
    subgraph connector
        event-handler
    end
    subgraph coco["Commercetools Composable Commerce"]
        order
        subscription
        cart
    end
    subgraph shipping["Ingrid"]
        session.complete
    end
    
    checkout("Checkout Page")--"1.Create order"-->order-->subscription
    subscription--"2.send orderCreated message"-->event-handler
    event-handler--"3.fetch Ingrid session"-->cart
    event-handler--"4.complete session"-->shipping
    event-handler--"5.change order shipment state"-->order
   
    style coco height:640
    style order height:120, text-align:center
    style subscription height:50, text-align:center  
```

1. commercetools Checkout sends request of order creation to commercetools composable commerce, and subscription listens to order creation event.
2. The commercetools subscription sends message containing order ID to the `eventHandler` inside connector.
3. The `eventHandler` makes use the order ID to fetch the Ingrid session ID stored inside the cart as custom field.
4. The `eventHandler` sends request with the the Ingrid session ID to Ingrid platform to complete the delivery session.
5. The `eventHandler` change the shipment state inside the cart to either `ready` or `canceled` based on the result of delivery session completion.

## Prerequisite
#### 1. commercetools composable commerce API client
Users are expected to create API client responsible for cart management in composable commerce project. Details of the API client are taken as input as environment variables/ configuration for connect such as `CTP_PROJECT_KEY` , `CTP_CLIENT_ID`, `CTP_CLIENT_SECRET`. For details, please read [Deployment Configuration](./README.md#deployment-configuration).
In addition, please make sure the API client should have enough scope to be able to manage checkout session, cart and order. For details, please refer to [Running Application](./processor/README.md#running-application)

#### 2. various URLs from commercetools composable commerce
Various URLs from commercetools platform are required to be configured so that the connect application can handle session and authentication process for endpoints.
Their values are taken as input as environment variables/ configuration for connect with variable names `CTP_API_URL`, `CTP_AUTH_URL` and `CTP_SESSION_URL`.

#### 3. Ingrid API credentials
Various account data provided by Ingrid are necessary to be configured so that the requests from the connect application can be authenticated by Ingrid platform within the integration.
Their values are taken as input as environment variables/ configuration for connect with variable names `INGRID_ENVIRONMENT`, `INGRID_API_KEY`.

#### 4. Keys of commercetools composable commerce resources
The connector requires tax category and custom type defined in commercetools composable commerce project. The key of these resources can be input as environment variables/ configuration for connect with variable names `INGRID_SESSION_CUSTOM_TYPE_KEY`, `INGRID_SPECIFIC_TAX_CATEGORY_KEY`.

## Development Guide
Regarding the development of enabler module, please refer to the following documentations:
- [Development of Enabler](./enabler/README.md)

Regarding the development of processor module, please refer to the following documentations:
- [Development of Processor](./processor/README.md)

Regarding the development of processor module, please refer to the following documentations:
- [Development of Event Handler](./event-handler/README.md)

#### Deployment Configuration
In order to deploy your customized connector application on commercetools Connect, it needs to be published. For details, please refer to [documentation about commercetools Connect](https://docs.commercetools.com/connect/concepts)
In addition, in order to support connect, the adyen payment integration connector has a folder structure as listed below
```
├── enabler
│   ├── src
│   ├── test
│   └── package.json
├── processor
│   ├── src
│   ├── test
│   └── package.json
├── event-handler
│   ├── src
│   ├── tests
│   └── package.json
└── connect.yaml
```

Connect deployment configuration is specified in `connect.yaml` which is required information needed for publishing of the application. Following is the deployment configuration used by enabler, processor and event-handler modules

```
deployAs:
  - name: enabler
    applicationType: assets
  - name: processor
    applicationType: service
    endpoint: /
    scripts:
      postDeploy: npm install && npm run connector:post-deploy
      preUndeploy: npm install && npm run connector:pre-undeploy
    configuration:
      standardConfiguration:
        - key: CTP_PROJECT_KEY
          description: commercetools project key
          required: true
        - key: CTP_CLIENT_ID
          description: commercetools client ID
          required: true
        - key: CTP_AUTH_URL
          description: commercetools Auth URL
          required: true
          default: https://auth.europe-west1.gcp.commercetools.com
        - key: CTP_API_URL
          description: commercetools API URL
          required: true
          default: https://api.europe-west1.gcp.commercetools.com
        - key: CTP_SESSION_URL
          description: Session API URL
          required: true
          default: https://session.europe-west1.gcp.commercetools.com
        - key: INGRID_ENVIRONMENT
          description: Ingrid environment (STAGING or PRODUCTION)
          required: true
          default: STAGING
        - key: INGRID_SESSION_CUSTOM_TYPE_KEY
          description: Key of CustomType to store ingrid session inside cart
          required: false
          default: ingrid-session
        - key: INGRID_SPECIFIC_TAX_CATEGORY_KEY
          description: Key of TaxCategory to be used for shipping tax calculation
          required: false
          default: ingrid-tax
      securedConfiguration:
        - key: INGRID_API_KEY
          description: the key used to connect to the Ingrid instance
          required: true
        - key: CTP_CLIENT_SECRET
          description: commercetools client secret
          required: true
  - name: event-handler
    applicationType: event
    endpoint: /
    scripts:
      postDeploy: npm install && npm run connector:post-deploy
      preUndeploy: npm install && npm run connector:pre-undeploy
    configuration:
      standardConfiguration:
        - key: CTP_PROJECT_KEY
          description: commercetools project key
          required: true
        - key: CTP_CLIENT_ID
          description: commercetools client ID
          required: true
        - key: CTP_REGION
          description: commercetools Composable Commerce API region
          required: true
        - key: CTP_SCOPE
          description: commercetools Composable Commerce client scope
          required: true
        - key: INGRID_ENVIRONMENT
          description: Ingrid environment (STAGING or PRODUCTION)
          required: true
          default: STAGING
      securedConfiguration:
        - key: INGRID_API_KEY
          description: the key used to connect to the Ingrid instance
          required: true
        - key: CTP_CLIENT_SECRET
          description: commercetools client secret
          required: true
```          

Here you can see the details about various variables in configuration
- `CTP_PROJECT_KEY`: The key of commercetools composable commerce project.
- `CTP_CLIENT_ID`: The client ID of your commercetools composable commerce user account. It is used in commercetools client to communicate with commercetools composable commerce via SDK. Expected scopes are: `manage_orders` `view_sessions` `view_api_clients` `introspect_oauth_tokens`.
- `CTP_CLIENT_SECRET`: The client secret of commercetools composable commerce user account. It is used in commercetools client to communicate with commercetools composable commerce via SDK.
- `CTP_AUTH_URL`: The URL for authentication in commercetools platform. It is used to generate OAuth 2.0 token which is required in every API call to commercetools composable commerce. The default value is `https://auth.europe-west1.gcp.commercetools.com`. For details, please refer to documentation [here](https://docs.commercetools.com/tutorials/api-tutorial#authentication).
- `CTP_API_URL`: The URL for commercetools composable commerce API. Default value is `https://api.europe-west1.gcp.commercetools.com`.
- `CTP_SESSION_URL`: The URL for session creation in commercetools platform. Connectors relies on the session created to be able to share information between enabler and processor. The default value is `https://session.europe-west1.gcp.commercetools.com`.
- `CTP_REGION`: commercetools Composable Commerce API region. For details, please refer to documentation [here](https://docs.commercetools.com/api/general-concepts#regions)
- `CTP_SCOPE`: commercetools Composable Commerce client scope. Expected scopes are: `manage_orders` `view_sessions` `view_api_clients` `introspect_oauth_tokens`. For details, please refer to documentation [here](https://docs.commercetools.com/api/scopes)
- `INGRID_ENVIRONMENT`: It represents the environment of Ingrid platform to communicate with the connector. It can be either `STAGING` or `PRODUCTION`.
- `INGRID_API_KEY`: The key used to connect to the Ingrid instance. When connector communicates with Ingrid platform, this key becomes a token inside request header for authentication done by Ingrid endpoints.
- `INGRID_SESSION_CUSTOM_TYPE_KEY`: It represents the key of the `customType` defined in commercetools composable commerce. If the commercetools project itself has already defined a `customType`, the key of this `customType` can be provided to the connector given that it contains a field definition called `ingridSessionId`. This custom field allows the commercetools cart to store the value of delivery session ID generated by Ingrid platform. If the value of this configuration is not provided, the connector will create a new `customType` for customer with a pre-defined key `ingrid-session`.
- `INGRID_SPECIFIC_TAX_CATEGORY_KEY`: It represents the key of the `taxCategory` defined in commercetools composable commerce. If the commercetools project itself has already defined a `taxCategory`, the key of this `taxCategory` can be provided to the connector. This tax category is used for applying tax on the shipping cost. If the value of this configuration is not provided, the connector will create a new `taxCategory` for customer with a pre-defined key `ingrid-tax`.

### Local Development
In order to get started developing this connector certain configuration are necessary, most of which involve updating environment variables in all applications (enabler, processor, event-handler).

#### Configuration steps

#### 1. Environment Variable Setup

Navigate to each service directory and duplicate the .env.template file, renaming the copy to .env. Populate the newly created .env file with the appropriate values.

```bash
cp .env.template .env
```

#### 2. Spin Up Components via Docker Compose
With the help of docker compose, you are able to spin up all necessary components required for developing the connector by running the following command from the root directory;

```bash
docker compose up
```

This command would start 3 required services, necessary for development
1. Enabler
2. Processor
3. Event Handler
4. Dev checkout page (Loading Javascript SDK from localhost)