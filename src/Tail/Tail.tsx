import { Button, Input, TextareaAutosize } from "@mui/material";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useMyContext } from "../Context/ContextProvider";

function Tail() {
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

  const [wantLogin, setWantLogin] = useState<boolean>(false);
  const [userNameAttempt, setUserNameAttempt] = useState<string>("");
  const [passWordAttempt, setPassWordAttempt] = useState<string>("");
  const [caste, setCaste] = useState<string>("waiting");
  const [attempts, setAttempts] = useState<number>(4);
  const [adminAttempts, setAdminAttempts] = useState<number>(4);
  const [registrationAttempts, setRegistrationAttempts] = useState<number>(4);
  const [error, setError] = useState<string>("");

  const Login = async () => {
    if (attempts == 0) {
      setError("Out of attempts");
      //return
    }
    if (userNameAttempt == "" || passWordAttempt == "") {
      setError("Please finish inputting details");
      return;
    }
    try {
      const response = await axios.post(`${serverAddress}/api/login`, {
        UserName: userNameAttempt,
        PassWord: passWordAttempt,
      });
      if (response.status === 200) {
        setAuthenticated(true);
        setSuperAuthenticated(false);
        setUserID(response.data.userID);
        localStorage.setItem('token', response.data.token)
        setUserName(userNameAttempt);
        setWantLogin(false);
        setUserNameAttempt("");
        setPassWordAttempt("");
        console.log("Logged in successfully");
      } else {
        setError("Failed to log in");
      }
    } catch (error) {
      setAttempts((prevAttempts) => Math.max(prevAttempts - 1, 0));
      setError(`No account exists, ${attempts} attempts remaining`);
    }
  };
  const superLogin = async () => {
    if (adminAttempts == 0) {
      setError("Notifying cyberpolice");
      //return;
    }
    if (userNameAttempt == "" || passWordAttempt == "") {
      setError("Please finish inputting details");
      return;
    }
    try {
      const ResponseSir = await axios.post(`${serverAddress}/api/adminLogin`, {
        UserName: userNameAttempt,
        PassWord: passWordAttempt,
      });
      if (ResponseSir.status === 200) {
        setAuthenticated(true);
        setSuperAuthenticated(true);
        setUserID(-ResponseSir.data.adminID);
        setWantLogin(false);
        localStorage.setItem('sutoken', ResponseSir.data.token)
        setUserNameAttempt("");
        setPassWordAttempt("");
        console.log("Logged in successfully Sir");
      } else {
        console.log("Failed to log in");
      }
    } catch (error) {
      setAdminAttempts((prevAttempts) => Math.max(prevAttempts - 1, 0));
      setError(`False Prophet, You are running out of time ${adminAttempts}`);
    }
  };

  const logOut = () => {
    setAuthenticated(false);
    setSuperAuthenticated(false);
    setUserID(-1);
    setUserName("");
    setUserNameAttempt("");
    setPassWordAttempt("");
    setCaste("waiting");
    localStorage.setItem('token', 'Null')
    localStorage.setItem('sutoken', 'Null')
  };
  const register = async () => {
    if (userNameAttempt == "" || passWordAttempt == "") {
      setError(`Please finish inputting details`);
      return;
    }
    try {
      const response = await axios.post(`${serverAddress}/api/register`, {
        UserName: userNameAttempt,
        PassWord: passWordAttempt,
      });
      if (response.status === 200) {
        console.log("Registered successfully");
        Login();
        setWantLogin(false);
      } else if (response.status === 409) {
        console.log(
          "Username already exists. Please choose a different username."
        );
      } else {
        console.log("Failed to create account");
      }
    } catch (error) {
      setRegistrationAttempts((prevAttempts) => Math.max(prevAttempts - 1, 0));
      setError(`Failed to register ${registrationAttempts}`);
    }
  };

  const GetRefreshToken = async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken){
      console.log('No authorization found');
      return;
    }

    const response = await axios.post(
      `${serverAddress}/api/TokenRefresh`,{
        UserID: userID,
        UserName: userName
      },
      {
        headers: {
          Authorization: `Bearer ${storedToken}`
        }
      }
    );
    const token = response.data
    if (response.status == 200){
      return token
    } else {
      console.log('Failed to refresh please relog into site')
      return storedToken
    }
  }
  /////////////////////////////////////
  useEffect(() => {
    const refreshToken = async () => {
      if (!authenticated && !superAuthenticated){
        return
      }
      try {
        console.log("RefreshingToken")
        let enterToken;
        if (superAuthenticated) {
          enterToken = await GetRefreshToken();
          if (enterToken){
            console.log("Token refreshed")
            localStorage.setItem('sutoken', enterToken);            
          }

        } else {
          enterToken = await GetRefreshToken();
          if (enterToken){
            console.log("Token refreshed")
            localStorage.setItem('token', enterToken);            
          }
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    };
  
    // Call refreshToken initially
    refreshToken();
  
    // Refresh token every 10 minutes
    const intervalId = setInterval(refreshToken, 5 * 60 * 1000);
  
    // Clean up the interval when the component unmounts or when dependencies change
    return () => clearInterval(intervalId);
  }, [authenticated, superAuthenticated]);

  useEffect(() => {
    setPassWordAttempt("");
    setUserNameAttempt("");
  }, [wantLogin]);
  return (
    <>
      {wantLogin ? (
        <div
          onClick={() => setWantLogin(false)}
          className="fixed inset-0 w-full h-full flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-WHITE fixed bottom-[20%] rounded-lg border-black border-2 text-center justify-center w-[80%] h-[60%] text-BLACK opacity-100"
          >
            <h1 className="text-2xl border-b-2 border-black bg-BACKGROUND rounded-t">
              LOGIN MENU
            </h1>
            <h1 className="mt-10">UserName</h1>
            <Input onChange={(e) => setUserNameAttempt(e.target.value)} />
            <h1 className="mt-10">PassWord</h1>
            <Input
              className="mb-10"
              onChange={(e) => setPassWordAttempt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  Login();
                }
              }}
              type="password"
            />
            <br />
            <button
              onClick={() => Login()}
              className="border-b-2 border-l-2 border border-BLACK hover:text-BLACK hover:opacity-90 flex m-auto bg-BACKGROUND mt-2 mb-4 justify-center text-center text-WHITE w-[40%] rounded"
            >
              Login
            </button>
            <button
              onClick={() => superLogin()}
              className="border-b-2 border-l-2 border border-BLACK hover:text-BLACK hover:opacity-90 flex m-auto bg-BACKGROUND mt-2 justify-center text-center text-WHITE w-[40%] rounded"
            >
              Admin
            </button>
            <br />
            <br />
            <button
              onClick={() => register()}
              className="border-b-2 border-l-2 border border-BLACK hover:text-BLACK hover:opacity-90 flex m-auto bg-BACKGROUND mt-2 justify-center text-center text-WHITE w-[60%] text-2xl rounded"
            >
              Register
            </button>
            {error.length > 0 ? (
              <div className="mt-10 font-bold">{error}</div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="w-[100vw] text-center text-[0.7rem] justify-center mt-2 fixed bottom-0 text-BLACK border-t-2 border-BLACK bg-WHITE z-10">
        <div className="flex justify-center m-auto w-[80%]">
          Unoffical private web app for educational purposes, i do not own any
          of the content used
        </div>
        <div className="w-[125px] text-center mb-2 rounded justify-center w-full">
          {authenticated || superAuthenticated ? (
            <button
              onClick={() => logOut()}
              className="bg-WHITE font-bold border border-BLACK w-[15%] rounded text-BACKGROUND hover:opacity-70 shadow-lg"
            >
              Log out
            </button>
          ) : (
            <button
              onClick={() => setWantLogin((prevWantLogin) => !prevWantLogin)}
              className="bg-WHITE font-bold border border-BLACK w-[15%] rounded text-BACKGROUND hover:opacity-70 shadow-lg"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default Tail;
