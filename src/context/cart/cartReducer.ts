import { ICart } from '../../interfaces';
import { UserInfo } from '../../pages/checkout/address';
import { CartState } from './CartProvider';

type Actions =
  | { type: 'add'; payload: ICart[] }
  | { type: 'update'; payload: ICart }
  | { type: 'remove'; payload: ICart }
  | { type: 'load'; payload: ICart[] }
  | { type: 'load-user-address'; payload: UserInfo }
  | { type: 'order-done' }
  | {
      type: 'summary';
      payload: {
        numberOfItems: number;
        subTotal: number;
        taxes: number;
        total: number;
      };
    };

export const cartReducer = (state: CartState, action: Actions): CartState => {
  switch (action.type) {
    case 'add':
      return { ...state, cart: [...action.payload] };
    case 'remove':
      return {
        ...state,
        cart: state.cart.filter((p) => !(p.id === action.payload.id && p.size === action.payload.size)),
        // ...state, cart: state.cart.filter((p) => {
        //   if(p.id === action.payload.id && p.size === action.payload.size) {
        //     return false;
        //   }
        //   return true;
        // })
      };
    case 'load-user-address':
      return {...state, shippingAddress: {...action.payload}}
    case 'summary':
      return { ...state, ...action.payload }
    case 'load':
      return { ...state, cart: [...action.payload] };
    case 'update':
      return {
        ...state,
        cart: state.cart.map((p) => {
          if (p.id !== action.payload.id) return p;
          if (p.size !== action.payload.size) return p;

          return action.payload;
        }),
      };
    case 'order-done':
      return {
        ...state, cart: [], numberOfItems: 0, subTotal: 0, taxes: 0, total: 0
      }
    default:
      return state;
  }
};
