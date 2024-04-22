import React, { useState } from "react";
import { useMyContext } from "../../Context/ContextProvider";
import axios from "axios";

export default function UserDelete() {
  const [
    allItems,
    setAllItems,
    cart,
    setCart,
    userID,
    setUserID,
    authenticated,
    setAuthenticated,
    superAuthenticated,
    setSuperAuthenticated,
    userName,
    setUserName,
  ] = useMyContext();
  const serverAddress = process.env.REACT_APP_SERVER_ADDRESS;

  const [locked, setLocked] = useState<boolean>(true);

  async function deleteAccount() 
  {
    if (!userID || !userName) 
    {
      return;
    }
    const choice = superAuthenticated ? 'sutoken' : authenticated ? 'token' : 'Null'
    const storedToken = getToken(choice);

    if (!storedToken)
    {
      console.log('No authorization found');
      return;
    }

    if (!authenticated) 
    {
      return;
    }

    try {
      const response = await axios.post(`${serverAddress}/api/deleteAccount/${userID}`, {
        userID: userID,
        userName: userName,
      }, 
      {
        headers: {
          authorization: `Bearer ${storedToken}`
        }
      }
      );

      if (response.status == 200) {
        console.log("Account deleted");
        setAuthenticated(false);
        setCart([]);
        setUserID(0);
        setSuperAuthenticated(false);
        setUserName("");
      }
    } catch (error) {
      console.log('Failed to delete account');
    }
  }

  function getToken(choice: string) {
    if (choice == 'Null') return
    
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(`${choice}=`)) { // Corrected condition
        return cookie.substring(`${choice}=`.length); // Corrected substring index
      }
    }
    return null;
  }

  return (
    <div className="w-[30%] ml-auto mr-auto mt-2 h-[20vh] space-y-2">
      <h1 className="bg-BACKGROUND text-center rounded">
        Delete your account?
      </h1>
      {locked ? (
        <button className="bg-BACKGROUND w-[80%] m-auto flex text-center justify-center rounded border border-BLACK opacity-60 hover:opacity-50">
          DELETE
        </button>
      ) : (
        <button
          onClick={() => deleteAccount()}
          className="bg-BACKGROUND w-[80%] m-auto flex text-center justify-center rounded border border-BLACK text-BLACK hover:opacity-80"
        >
          DELETE
        </button>
      )}
      <div>
        {locked ? (
          <button
            onClick={() => setLocked(!locked)}
            className="bg-WHITE text-BACKGROUND shadow-lg w-[80%] m-auto flex text-center justify-center rounded border border-BLACK hover:opacity-40"
          >
            LOCKED
          </button>
        ) : (
          <button
            onClick={() => setLocked(!locked)}
            className="bg-BLACK text-BACKGROUND shadow-lg w-[100%] m-auto flex text-center justify-center rounded border border-BLACK hover:opacity-40"
          >
            UNLOCKED
          </button>
        )}
      </div>
    </div>
  );
}
