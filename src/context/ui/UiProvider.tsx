import { useReducer } from "react"
import { Provider } from "./store"
import { uiReducer } from "./uiReducer";

export interface STATE_ {
  status: boolean;
  isLoading: boolean;
}

const initialState: STATE_ = {
  status: false,
  isLoading: false,
};

export const UiProvider: React.FC<{ children: JSX.Element }> = ({ children }) => {

  const [ state, dispatch ] = useReducer( uiReducer, initialState );

  const setStatus = (status: boolean) => {
    dispatch({ type: 'setStatus', payload: status });
  }

  const setIsLoading = (status: boolean) => {
    dispatch({ type: 'setIsLoading', payload: status });
  }

  return (
    <Provider value={{ ...state, setStatus, setIsLoading}}>
      { children }
    </Provider>
  )
}
