import { useReducer, useEffect, Reducer } from 'react';
import { Provider } from './store';
import { Role, UserStatus, prisma } from '../../server/db';
import { authReducer, TypeActions } from './authReducer';
import { trpc } from '../../utils/trpc';
import { useSession } from 'next-auth/react';

export type User = {
  email?: string;
  name?: string;
  status?: UserStatus;
  id?: string;
  role?: Role,
  token?: string;
} | null;

export interface USER_STATE {
  status: UserStatus;
  user?: User;
}

export const USER_INITIAL_STATE: USER_STATE = {
  status: 'offline',
  user: null,
}

const init = (): USER_STATE => {
  return {
    status: 'offline',
    user: null
  }
}

export const AuthProvider: React.FC<{ children: JSX.Element }> = ({ children }) => {

  const [ state, dispatch ] = useReducer<Reducer<USER_STATE, TypeActions>, USER_STATE>(authReducer, USER_INITIAL_STATE, init);
  const { data: session, status } = useSession();

  useEffect(() => {
    if(status === 'authenticated') {
      dispatch({ type: '[auth] - Load user', payload: { user: session.user as User, status: 'online' } })
    }
  }, [ status, session ]);

  const auth_user = (user: User) => {
    dispatch({ type: '[auth] - User', payload: { user, status: 'online' }});
  }

  return (
    <Provider value={{...state, auth_user}}>
      { children }
    </Provider>
  )
}
