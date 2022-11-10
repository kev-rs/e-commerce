import { useReducer, useEffect } from 'react';
import { ICart } from '../../interfaces';
import { cartReducer } from './cartReducer';
import { Provider } from './store';
import Cookie from 'js-cookie';
// import { UserInfo } from '../../pages/checkout/address';
// import { Order } from '../../server/db';
// import { trpc } from '../../utils/trpc';

interface UserInfo {
  name: string;
  lastName: string;
  address:  string;
  address2: string;
  postal: string;
  city: string;
  country:  string;
  country_code: string;
  phone:  string;
}

export interface CartState {
  cart: ICart[];
  numberOfItems: number;
  subTotal: number;
  taxes: number;
  total: number;
  shippingAddress: UserInfo | null
}

const CART_INITIAL_STATE: CartState = {
  cart: [],
  numberOfItems: 0,
  subTotal: 0,
  taxes: 0,
  total: 0,
  shippingAddress: null,
}

export const CartProvider: React.FC<{ children: JSX.Element }> = ({ children }) => {

  const [ state, dispatch ] = useReducer(cartReducer, CART_INITIAL_STATE);
  
  useEffect(() => {
    const info = Cookie.get('user-info') ? JSON.parse(Cookie.get('user-info')!) : {};
    dispatch({ type: 'load-user-address', payload: info })
  }, []);

  useEffect(() => {
    try {
      const cart = Cookie.get('cart') ? JSON.parse(Cookie.get('cart')!) : [];
      dispatch({ type: 'load', payload: cart });
    } catch (err) {
      dispatch({ type: 'load', payload: [] });
    }
  }, []);

  useEffect(() => {
    Cookie.set('cart', JSON.stringify(state.cart), {
      path: '/', sameSite: 'strict', secure: process.env.NODE_ENV === 'production'
    });
  }, [state.cart]);

  useEffect(() => {
    const numberOfItems = state.cart.reduce((prev, current) => current.amount + prev, 0);
    const subTotal = state.cart.reduce((prev, current) => (current.amount * current.price) + prev, 0);
    const taxRate = Number(process.env.NEXT_PUBLIC_TAX_RATE || 0);

    const orderSummary = {
      numberOfItems,
      subTotal,
      taxes: (subTotal * taxRate),
      total: (subTotal * taxRate) + subTotal,
    }

    dispatch({ type: 'summary', payload: { ...orderSummary } })

  }, [state.cart]);

  const removeProduct = (product: ICart) => {
    dispatch({ type: 'remove', payload: product });
  }

  const updateProduct = (product: ICart) => {
    dispatch({ type: 'update', payload: product });
  }

  const addProduct = (product: ICart) => {
    const check = state.cart.some((p) => p.id === product.id);
    if (!check) return dispatch({ type: 'add', payload: [...state.cart, product] });

    const check2 = state.cart.some((p) => p.id === product.id && p.size === product.size);
    if (!check2) return dispatch({ type: 'add', payload: [...state.cart, product] });

    const updatedProducts = state.cart.map((p) => {
      if (p.id !== product.id) return p;
      if (p.size !== product.size) return p;

      p.amount += product.amount;
      return p;
    });

    dispatch({ type: 'add', payload: updatedProducts });
  }

  const updateAddress = (info: UserInfo) => {
    Cookie.set('user-info', JSON.stringify(info));
    dispatch({ type: 'load-user-address', payload: info })
  }

  const reset = () => {
    dispatch({ type: 'order-done' });
  }

  return (
    <Provider value={{ ...state, addProduct, updateProduct, removeProduct, updateAddress, reset }}>
      {children}
    </Provider>
  )
}
