import { createContext } from "react";

interface Store {
  status: boolean;
  setStatus: (status: boolean) => void;
  isLoading: boolean
  setIsLoading: (status: boolean) => void;
}

export const UIContext = createContext<Store>( {} as Store );

export const { Provider } = UIContext;