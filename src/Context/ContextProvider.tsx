import React, { ReactNode, createContext, useContext, useState } from "react";

interface MyContextProps {
  cart: any[];
  setCart: React.Dispatch<React.SetStateAction<any[]>>,
  userID: number,
  setUserID: React.Dispatch<React.SetStateAction<number>>,
  authenticated: boolean, 
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>, 
  superAuthenticated:boolean, 
  setSuperAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  userName: string,
  setUserName: React.Dispatch<React.SetStateAction<string>>
}

const MyContext = createContext<MyContextProps | undefined>(undefined);

export function ContextProvider({ children }: { children: ReactNode}) {
  const [cart, setCart] = useState<any[]>([]);
  const [userID, setUserID] = useState<number>(0)
  const [authenticated, setAuthenticated] = useState<boolean>(false)
  const [superAuthenticated, setSuperAuthenticated] = useState<boolean>(false)
  const [userName, setUserName] = useState<string>('')

  return (
    <MyContext.Provider value={{ cart, setCart, userID, setUserID, authenticated, setAuthenticated, superAuthenticated, setSuperAuthenticated, userName, setUserName }}>
      {children}
    </MyContext.Provider>
  );
}

export function useMyContext() {
  const context = useContext(MyContext);

  if (!context){
    throw new Error('useContext must be used within a MyContextProvider')
  }
  const { cart, setCart, userID, setUserID, authenticated, setAuthenticated, superAuthenticated, setSuperAuthenticated, userName, setUserName  } = context

  return [ cart, setCart, userID, setUserID, authenticated, setAuthenticated, superAuthenticated, setSuperAuthenticated, userName, setUserName ] as const
}
