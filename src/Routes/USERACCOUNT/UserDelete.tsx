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

  async function deleteAccount() {
    if (!userID || !userName) {
      return;
    }
    const storedToken = localStorage.getItem('token');
    if (!storedToken){
      console.log('No authorization found');
      return;
    }
    if (!authenticated) {
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
