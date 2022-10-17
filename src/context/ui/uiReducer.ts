import { STATE_ } from "./UiProvider";

type TypeActions = 
  | { type: 'setStatus', payload: boolean }
  | { type: 'setIsLoading', payload: boolean }

export const uiReducer = ( state: STATE_, action: TypeActions): STATE_ => {
  switch(action.type) {
    case 'setStatus':
      return { ...state, status: action.payload }
    case 'setIsLoading':
      return { ...state, isLoading: action.payload }
    default:
      return state;
  }
}