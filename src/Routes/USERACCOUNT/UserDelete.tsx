import React, { useState } from "react";
import { useMyContext } from "../../Context/ContextProvider";
import axios from "axios";
import API from "../../INTERCEPTOR/API";

export default function UserDelete()
{
  const [
    ,
    ,
    ,
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
    if (!userID || !userName) return;

    try {
      const response = await API.post(`${serverAddress}/api/deleteAccount/${userID}`, { userID, userName });

      if (response.status === 200) {
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
    <div className="w-[30%] ml-auto mr-auto mt-[10vh] h-[20vh] space-y-2 bg-WHITE text-BLACK shadow-lg rounded">
      <h1 className="text-center rounded">
        Delete your account?
      </h1>
      {locked ? (
        <button className="bg-HIGHLIGHT w-[80%] m-auto flex text-center justify-center rounded border border-BLACK opacity-60 hover:opacity-50">
          Unlock to delete
        </button>
      ) : (
        <button
          onClick={() => deleteAccount()}
          className="bg-HIGHLIGHT w-[80%] m-auto flex text-center justify-center rounded border border-BLACK text-BLACK hover:opacity-80"
        >
          DELETE
        </button>
      )}
      <div>
        {locked ? (
          <button
            onClick={() => setLocked(!locked)}
            className="bg-WHITE text-BLACK shadow-lg w-[80%] m-auto flex text-center justify-center rounded border border-BLACK hover:opacity-40"
          >
            LOCKED
          </button>
        ) : (
          <button
            onClick={() => setLocked(!locked)}
            className="bg-BLACK text-WHITE shadow-lg w-[100%] m-auto flex text-center justify-center rounded border border-BLACK hover:opacity-40"
          >
            UNLOCKED
          </button>
        )}
      </div>
    </div>
  );
}
