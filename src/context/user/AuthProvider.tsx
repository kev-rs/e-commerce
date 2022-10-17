import { useReducer, useEffect, Reducer } from 'react';
import { Provider } from './store';
import { Role, UserStatus, prisma } from '../../server/db';
import { authReducer, TypeActions } from './authReducer';
import { trpc } from '../../utils/trpc';

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
  const { data, isSuccess } = trpc.auth.user.useQuery();

  useEffect(() => {
    console.log(state)
  },[state])
  useEffect(() => {
    if(!isSuccess) return;
    dispatch({ type: '[auth] - Load user', paylaoad: data });
  }, [ data, isSuccess ]);

  const auth_user = (user: User) => {
    dispatch({ type: '[auth] - User', paylaoad: { user, status: 'online' }});
  }

  return (
    <Provider value={{...state, auth_user}}>
      { children }
    </Provider>
  )
}
