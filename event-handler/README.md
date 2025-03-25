# Shipping Integration Processor
This module provides an application based on [commercetools Connect](https://docs.commercetools.com/connect), which performs task in asynchronous mode when order has been created in commercetools composable commerce.

The event handler relies on subscription in commercetools composable commerce to listen to the order creation event. The handler receives the message from subscription with the created order details and therefore Ingrid session ID can be obtained. Then a request will be sent to Ingrid platform for Ingrid session completion. In case of success, the order shipment state is updated as `ready`, otherwise it will be updated as `canceled`. 

The module also provides template scripts for post-deployment and pre-undeployment action. After deployment or before undeployment via connect service completed, customized actions can be performed based on users' needs.

## Getting Started

These instructions will get you up and running on your local machine for development and testing purposes.
Please run following npm commands under `event-handler` folder.

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
#### Run the application in local environment. 
Remind that the application has been built before it runs. Also, setup correct environment variables: check `event-handler/src/utils/config.utils.ts` for default values.
```
$ npm run start
```

#### Prettify the code style
```
$ npm run prettier
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