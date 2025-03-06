# connect-shipping-integration-ingrid
This repository provides a [connect](https://docs.commercetools.com/connect) for integration to Ingrid delivery solution provider.

## Features
- Typescript language supported.
- Uses Fastify and Express as web server framework in different modules.
- Uses [commercetools SDK](https://docs.commercetools.com/sdk/js-sdk-getting-started) for the commercetools-specific communication.
- Includes local development utilities in npm commands to build, start, test, lint & prettify code.

## Overview
The Ingrid-integration connector contains three modules :  
- Enabler: Acts as a wrapper implementation in which frontend components from Ingrid embedded. It gives control to checkout product on when and how to load the connector frontend based on business configuration. In cases connector is used directly and not through Checkout product, the connector library can be loaded directly on frontend than the PSP one.
- Processor : Acts as backend services which is middleware to integrate with Ingrid platform. It is mainly responsible for managing session initialized in Ingrid platform and updating cart entity in composable commerce.  Also the request context, commercetools checkout sessions and other tools necessary to transact are all maintained inside this module.
- Event Handler: As named, it provides a handling to manage event messages from commercetools composable commerce in asynchronous mode. The connector subscribes order creation event in commercetools composable commerce and use it to complete Ingrid session in the delivery platform as well as changing shipment state for commercetools order.

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
        
    end
    subgraph shipping["Ingrid"]
        session.complete
    end
    
    checkout("Checkout Page")--"1.Create order"-->order-->subscription
    subscription--"2.send orderCreated message"-->event-handler
    event-handler--"3.fetch Ingrid session"-->coco
    event-handler--"4.complete session"-->shipping
    event-handler--"5.change order shipment state"-->order
   
    style coco height:280
    style order height:120, text-align:center
    style subscription height:50, text-align:center  
```

1. commercetools Checkout sends request of order creation to commercetools composable commerce, and subscription listens to order creation event.
2. The commercetools subscription sends message containing order ID to the `eventHandler` inside connector.
3. The `eventHandler` makes use the order ID to fetch the Ingrid session ID stored inside the cart as custom field.
4. The `eventHandler` sends request with the the Ingrid session ID to Ingrid platform to complete the delivery session.
5. The `eventHandler` change the shipment state inside the cart to either `ready` or `canceled` based on the result of delivery session completion.