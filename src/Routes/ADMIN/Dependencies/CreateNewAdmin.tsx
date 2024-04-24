import axios from "axios";
import React, { useEffect, useState } from "react";
import { useMyContext } from "../../../Context/ContextProvider";

export default function CreateNewAdmin() {
  const [
    ,
    ,
    ,
    ,
    ,
    ,
    authenticated,
    ,
    superAuthenticated,
    ,
  ] = useMyContext();
  const serverAddress = process.env.REACT_APP_SERVER_ADDRESS;
  const [userName, setNewUserName] = useState<string>("");
  const [passWord, setNewPassWordName] = useState<string>("");
  const [check, setCheck] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [adminAttempts, setAdminAttempts] = useState<number>(4);
  const [userNameAttempt, setUserNameAttempt] = useState<string>("");
  const [passWordAttempt, setPassWordAttempt] = useState<string>("");
  // HANDLE LOGIN
  const superLogin = async () => {
    if (adminAttempts === 0) {
      setError("Notifying cyberpolice");
      return;
    }
    if (userNameAttempt === "" || passWordAttempt === "") {
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
  // HANDLE LOGIN
  const createAdmin = async () => {
    if (userName === "" || passWord === "") {
      setError('please enter details')
      console.log("Please finish entering details")
      return
    }
    const choice = superAuthenticated ? 'sutoken' : authenticated ? 'token' : 'Null'
    const storedToken = getToken(choice);
    
    if (!storedToken){
      console.log('No authorization found');
      return;
    }
    try {
      const response = await axios.post(
        `${serverAddress}/api/adminRegistration`,
        { 
          UserName: userName,
          Password: passWord 
        },
        {
          headers: {
            authorization: `Bearer ${storedToken}`
          }
        }
      );

      if (response.status === 200) {
        console.log("Created admin");
        setUserNameAttempt('')
        setNewPassWordName('')
        setCheck(false)
      } else if (response.status === 400){
        setError('Bad input, please adjust')
        console.log('Failed to create admin')
      }
    } catch (error) {
      setError("Failed to create admin");
      console.log(error)
    }
  };
  // TOKEN HANDLE
  function getToken(choice: string) 
  {
    if (choice === 'Null') return
    
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(`${choice}=`)) { // Corrected condition
        return cookie.substring(`${choice}=`.length); // Corrected substring index
      }
    }
    return null;
  }
// USEEFFECT
useEffect(() => {
  console.log(userName, passWord)
}, [userName, passWord])

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
                    <h1 className="m-auto flex text-center justify-center bg-BACKGROUND mb-1 rounded">
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
                        {adminAttempts}
                        <br />
                        {error || <div>Please enter details</div>}
                    </div>
                </div>
            )
        ) : (
            <div className="bg-BACKGROUND text-center">No access</div>
        )}
    </div>
);

}
