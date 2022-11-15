import { useReducer, useEffect } from 'react';
import { ICart } from '../../interfaces';
import { cartReducer } from './cartReducer';
import { Provider } from './store';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
// import Cookie from 'js-cookie';

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
    // @ts-ignore
    console.log({ Provider: JSON.parse(getCookie('cart') || '[]') })
  }, []);
  
  useEffect(() => {
    // @ts-ignore
    const info = getCookie('user-info') ? JSON.parse(getCookie('user-info')!) : {};
    dispatch({ type: 'load-user-address', payload: info })
  }, []);

  useEffect(() => {
    try {
      // @ts-ignore
      const cart = getCookie('cart') ? JSON.parse(getCookie('cart')!) : [];
      dispatch({ type: 'load', payload: cart });
    } catch (err) {
      dispatch({ type: 'load', payload: [] });
    }
  }, []);

  useEffect(() => {
    setCookie('cart', JSON.stringify(state.cart));
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

  const addProduct = (product: ICart): void => {
    
    const check = state.cart.some((p) => p.id === product.id);
    if (!check) {
      return dispatch({ type: 'add', payload: [...state.cart, product] });
    }

    const check2 = state.cart.some((p) => p.id === product.id && p.size === product.size);
    if (!check2) {
      return dispatch({ type: 'add', payload: [...state.cart, product] });
    }

    const updatedProducts = state.cart.map((p) => {
      if (p.id !== product.id) return p;
      if (p.size !== product.size) return p;

      p.amount += product.amount;
      return p;
    });

    dispatch({ type: 'add', payload: updatedProducts });
  }

  const updateAddress = (info: UserInfo) => {
    setCookie('user-info', JSON.stringify(info));
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
