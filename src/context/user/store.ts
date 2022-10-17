import { createContext } from 'react';
import { USER_STATE } from './AuthProvider';

export interface Store extends USER_STATE {
  auth_user: (user: any) => void;
};

export const AuthContext = createContext<Store>( {} as Store );

export const { Provider } = AuthContext;