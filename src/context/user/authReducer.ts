import { Reducer } from "react";
import { User, USER_STATE } from "./AuthProvider";

export type TypeActions = 
  | { type: '[auth] - User', paylaoad: { status: 'online' | 'offline'; user:  User} }
  | { type: '[auth] - Load user', paylaoad: { status: 'online' | 'offline'; user:  User} }


export const authReducer: Reducer<USER_STATE, TypeActions> = ( state, action ): USER_STATE => {
  switch(action.type) {
    case '[auth] - User':
      return { ...state, status: action.paylaoad.status, user: { ...action.paylaoad.user } }
    case '[auth] - Load user':
      return { ...state, status: action.paylaoad.status, user: {...action.paylaoad.user} };
    default:
      return state;
  }
}
