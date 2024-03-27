import axios from "axios";
import React, { useState } from "react";
import { useMyContext } from "../../../Context/ContextProvider";

export default function CreateNewAdmin() {
  const [
    allItems,
    setAllItemscart,
    cart,
    setCart,
    userID,
    setUserID,
    authenticated,
    setAuthenticated,
    superAuthenticated,
    setSuperAuthenticated,
  ] = useMyContext();
  const serverAddress = process.env.REACT_APP_SERVER_ADDRESS;
  const [userName, setNewUserName] = useState<string>("");
  const [passWord, setNewPassWordName] = useState<string>("");
  const [check, setCheck] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [adminAttempts, setAdminAttempts] = useState<number>(4);
  const [userNameAttempt, setUserNameAttempt] = useState<string>("");
  const [passWordAttempt, setPassWordAttempt] = useState<string>("");

  const superLogin = async () => {
    if (adminAttempts == 0) {
      setError("Notifying cyberpolice");
      return;
    }
    if (userNameAttempt == "" || passWordAttempt == "") {
      setError("Please finish inputting details");
      return;
    }
    try {
      const ResponseSir = await axios.post(`${serverAddress}/api/adminLogin`, {
        userName: userNameAttempt,
        passWord: passWordAttempt,
      });
      if (ResponseSir.status === 200) {
        setCheck(true);
        console.log("Verified");
        setUserNameAttempt("");
        setPassWordAttempt("");
        setNewPassWordName("");
        setNewUserName("");
      } else {
        setAdminAttempts((prevAttempts) => Math.max(prevAttempts - 1, 0));
        console.log("Failed to verify");
      }
    } catch (error) {
      setAdminAttempts((prevAttempts) => Math.max(prevAttempts - 1, 0));
      setError(`False Prophet, You are running out of time ${adminAttempts}`);
    }
  };
  const createAdmin = async () => {
    if (userName == "" || passWord == "") {
      return;
    }
    try {
      const response = await axios.post(
        `${serverAddress}/api/adminRegistration`,
        { userName: userName, passWord: passWord }
      );

      if (response.status == 200) {
        console.log("Created admin");
      } else {
        console.log("Failed to create admin");
      }
    } catch (error) {
      console.log("Failed to create admin");
    }
  };

  return (
    <div>
        {superAuthenticated ? (
            check ? (
                <div className="w-full text-WHITE justify-center items-center border rounded mb-10">
                    <h1 className="m-auto flex justify-center bg-BACKGROUND mb-1 rounded">
                        CREATE NEW ADMIN
                    </h1>
                    <div className="m-auto w-[80%] flex justify-center bg-BACKGROUND rounded">
                        NewAdminName:
                    </div>
                    <input
                        value={userName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="text-BLACK m-auto w-[60%] flex justify-center border border-BLACK mt-1 mb-1"
                    />
                    <div className="m-auto w-[80%] flex justify-center bg-BACKGROUND rounded">
                        NewAdminPass:
                    </div>
                    <input
                        value={passWord}
                        type="password"
                        onChange={(e) => setNewPassWordName(e.target.value)}
                        className="text-BLACK m-auto w-[60%] flex justify-center border border-BLACK mt-1 mb-1"
                    />
                    <button
                        className="shadow-lg bg-BACKGROUND m-auto flex w-[60%] text-center items-center justify-center hover:opacity-90 hover:text-BLACK mb-2 rounded"
                        onClick={() => createAdmin()}
                    >
                        SEND REQUEST
                    </button>
                </div>
            ) : (
                <div className="w-full text-WHITE justify-center items-center border rounded mb-10 ">
                    <h1 className="m-auto flex text-center justify-center bg-BACKGROUND mb-1 rounded opacity-60">
                        CREATE NEW ADMIN
                        <br />
                        you must log in first to create any admins
                    </h1>
                    <div className="m-auto w-[80%] flex justify-center bg-BACKGROUND rounded">
                        AdminName
                    </div>
                    <input
                        value={userNameAttempt}
                        onChange={(e) => setUserNameAttempt(e.target.value)}
                        className="text-BLACK m-auto w-[60%] flex justify-center border border-BLACK mt-1 mb-1"
                    />
                    <div className="m-auto w-[80%] flex justify-center bg-BACKGROUND rounded">
                        AdminPass:
                    </div>
                    <input
                        value={passWordAttempt}
                        type="password"
                        onChange={(e) => setPassWordAttempt(e.target.value)}
                        className="text-BLACK m-auto w-[60%] flex justify-center border border-BLACK mt-1 mb-1"
                    />
                    <button
                        className="shadow-lg bg-BACKGROUND m-auto flex w-[60%] border border-BLACK text-center items-center justify-center hover:opacity-90 hover:text-BLACK mb-2 rounded"
                        onClick={() => superLogin()}
                    >
                        ADMIN LOGIN
                    </button>
                    <div className="w-[60%] m-auto text-center rounded bg-BACKGROUND h-[12vh]">
                        test
                        <br />
                        {adminAttempts}
                        <br />
                        {error}
                    </div>
                </div>
            )
        ) : (
            <div className="bg-BACKGROUND text-center">No access</div>
        )}
    </div>
);

}
