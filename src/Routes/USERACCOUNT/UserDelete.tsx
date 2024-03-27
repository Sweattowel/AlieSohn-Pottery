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

    try {
      const response = await axios.post(`${serverAddress}/api/deleteAccount`, {
        userID: userID,
        userName: userName,
      });

      if (response.status == 200) {
        console.log("Account deleted");
        setAuthenticated(false);
        setCart([]);
        setUserID(0);
        setSuperAuthenticated(false);
        setUserName("");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="w-[40%] m-auto h-[20vh] space-y-2">
      <h1 className="bg-BACKGROUND text-center rounded">
        Delete your account?
      </h1>
      {locked ? (
        <button className="bg-BACKGROUND w-[80%] m-auto flex text-center justify-center rounded border border-BLACK opacity-60">
          DELETE
        </button>
      ) : (
        <button
          onClick={() => deleteAccount()}
          className="bg-BACKGROUND w-[80%] m-auto flex text-center justify-center rounded border border-BLACK text-BLACK"
        >
          DELETE
        </button>
      )}
      <div>
        {locked ? (
          <button
            onClick={() => setLocked(!locked)}
            className="bg-BACKGROUND w-[80%] m-auto flex text-center justify-center rounded border border-BLACK"
          >
            UNLOCK
          </button>
        ) : (
          <button
            onClick={() => setLocked(!locked)}
            className="bg-BACKGROUND w-[100%] m-auto flex text-center justify-center rounded border border-BLACK"
          >
            LOCK
          </button>
        )}
      </div>
    </div>
  );
}
