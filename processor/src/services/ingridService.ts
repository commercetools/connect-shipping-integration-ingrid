import axios , {AxiosError} from 'axios';
import { API_KEY, API_URL } from '../config';

export const createIngridSession = async () => {
    const payload = {
        purchase_country: "GB",
        purchase_currency: "GBP",
        cart: {
          total_value: 10000,
          items: [
            {
              sku: "SKU12345",
              name: "Saucony Shadow 6000",
              quantity: 1
            }
          ],
          cart_id: "123456"
        },
        locales: ["en-GB"]
      };
    
  try {
    const response = await axios.post(
      `${API_URL}/session.create`,
      payload,
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );
    return response.data;
  }  catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data || 'Error creating Ingrid session');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};
