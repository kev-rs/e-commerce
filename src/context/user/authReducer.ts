import { Reducer } from "react";
import { User, USER_STATE } from "./AuthProvider";

export type TypeActions = 
  | { type: '[auth] - User', payload: { status: 'online' | 'offline'; user:  User} }
  | { type: '[auth] - Load user', payload: { status: 'online' | 'offline'; user:  User} }


export const authReducer: Reducer<USER_STATE, TypeActions> = ( state, action ): USER_STATE => {
  switch(action.type) {
    case '[auth] - User':
      return { ...state, status: action.payload.status, user: { ...action.payload.user } }
    case '[auth] - Load user':
      return { ...state, status: action.payload.status, user: {...action.payload.user} };
    default:
      return state;
  }
}
