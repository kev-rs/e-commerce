import { createContext } from 'react';
import { ICart } from '../../interfaces';
import { UserInfo } from '../../pages/checkout/address';

interface Store {
  cart: ICart[];
  numberOfItems: number;
  subTotal: number;
  taxes: number;
  total: number;
  shippingAddress?: UserInfo
  addProduct: (product: ICart) => void;
  updateProduct: (product: ICart) => void;
  removeProduct: (product: ICart) => void;
  updateAddress: (info: UserInfo) => void;
  reset: () => void;
}

export const CartContext = createContext<Store>({} as Store);

export const { Provider } = CartContext;
