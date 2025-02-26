import { memo, useEffect, useState, useSyncExternalStore } from 'react';
import cocoSessionStore from '../stores/cocoSessionStore';
import client from '../coco';
import type { Cart } from '@commercetools/platform-sdk';

const OrderCreationButton = memo(function OrderCreationButton() {
  const [orderCreation, setOrderCreation] = useState(false);
  const session = useSyncExternalStore(
    cocoSessionStore.subscribe,
    cocoSessionStore.getSnapshot,
  );

  useEffect(() => {
    const cartString = localStorage.getItem('cart');
    const cart = cartString ? JSON.parse(cartString) as Cart : undefined;
    if (orderCreation && cart) {

      const cartId = cart.id;
      let cartVersion: number;
      setTimeout(() => {

        client
          .carts().withId({ ID: cartId })
          .get()
          .execute()
          .then((result) => {
            console.log('Cart feteched', result);
            cartVersion = result?.body.version as number;
            return cartVersion;
          }).then((cartVersion) => {
          console.log('Create order from cart');
          client
            .orders()
            .post({
              body: {
                'cart': {
                  'id': cartId,
                  'typeId': 'cart',
                },
                'version': cartVersion,
              },
            })
            .execute();
        }).then((result) => {
          console.log('Order created', result);
        })
          .catch((e) => console.error('something went wrong:', e));
      }, 500);

    }
  }, [orderCreation]);

  return session ? (
    <div>
      <button onClick={() => setOrderCreation((e) => !e)}>
        Create Order from Cart
      </button>
    </div>
  ) : null;
});

export default OrderCreationButton;
