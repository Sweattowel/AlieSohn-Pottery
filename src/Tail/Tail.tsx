import { Button, Input, TextareaAutosize } from "@mui/material";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useMyContext } from "../Context/ContextProvider";

function Tail() {
    const [allItems, setAllItems, cart, setCart, userID, setUserID, authenticated, setAuthenticated, superAuthenticated, setSuperAuthenticated, userName, setUserName] = useMyContext();
    const serverAddress = process.env.REACT_APP_SERVER_ADDRESS

    const [wantLogin, setWantLogin] = useState<boolean>(false)
    const [userNameAttempt, setUserNameAttempt] = useState<string>('')
    const [passWordAttempt, setPassWordAttempt] = useState<string>('')
    const [caste, setCaste] = useState<string>('waiting')

    const Login = async () => {
            try {
                const response = await axios.post(`${serverAddress}/api/login`, { userName: userNameAttempt, passWord: passWordAttempt });
                if (response.status === 200){
                    setAuthenticated(true);
                    setSuperAuthenticated(false)
                    setUserID(response.data.userID);
                    setUserName(userNameAttempt);
                    setWantLogin(false)
                    setUserNameAttempt('')
                    setPassWordAttempt('')
                    console.log('Logged in successfully');
                } else if (response.status === 404) {
                    console.log('No account exists');
                } else {
                    console.log('Failed to log in');
                }
            } catch (error) {
                console.log(error);
            }
    }
    const superLogin = async () => {
            try {
                const ResponseSir = await axios.post(`${serverAddress}/api/adminLogin`, { userName: userNameAttempt, passWord: passWordAttempt });
                if (ResponseSir.status === 200){
                    setAuthenticated(true);
                    setSuperAuthenticated(true);
                    setUserID(-(ResponseSir.data.adminID));
                    setWantLogin(false)
                    setUserNameAttempt('')
                    setPassWordAttempt('')
                    console.log('Logged in successfully Sir');
                } else if (ResponseSir.status === 404) {
                    console.log('No account exists, please prepare to be terminated');
                } else {
                    console.log('Failed to log in');
                }
            } catch (error) {
                console.log(error);
            }
        }

    const logOut = () => {
        setAuthenticated(false)
        setSuperAuthenticated(false)
        setUserID(-1)
        setUserName('')
        setUserNameAttempt('')
        setPassWordAttempt('')
        setCaste('waiting')
    }
    const register = async () => {
        try {
            const response = await axios.post(`${serverAddress}/api/register`, { userName: userNameAttempt, passWord: passWordAttempt } )
            if (response.status === 200){
                console.log('Registered successfully');
                Login()
                setWantLogin(false)
            }  else if (response.status === 409){
                console.log('Username already exists. Please choose a different username.');
            } else {
                console.log('Failed to create account');
            }
        } catch (error) {
            console.log(error)
        }
    }

  return (
    <>
        { wantLogin ? (
            <div onClick={() => setWantLogin(false)} className="fixed inset-0 w-full h-full flex items-center justify-center z-50">
                <div onClick={(e) => e.stopPropagation()} className="bg-WHITE fixed bottom-[20%] rounded-lg left-[40%] border-black border-2 text-center justify-center w-[20%] h-[60%] text-BLACK">
                    <h1 className="text-2xl border-b-2 border-black bg-BACKGROUND rounded-t">
                        LOGIN MENU                
                    </h1>
                    <h1 className="mt-10">
                        UserName
                    </h1>
                    <Input onChange={(e) => setUserNameAttempt(e.target.value)} />
                    <h1 className="mt-10">
                        PassWord
                    </h1>
                    <Input className="mb-10" onChange={(e) => setPassWordAttempt(e.target.value)} type="password"/>
                    <br />
                    <button
                        onClick={() => Login()}
                        className="flex m-auto bg-BACKGROUND mt-2 mb-4 justify-center text-center text-WHITE w-[40%] rounded"
                    >
                    Login
                    </button>
                    <button
                        onClick={() => superLogin()}
                        className="flex m-auto bg-BACKGROUND mt-2 justify-center text-center text-WHITE w-[40%] rounded"
                    >
                    Admin
                    </button>
                    <br />
                    <br />
                    <button
                        onClick={() => register()}
                        className="flex m-auto bg-BACKGROUND mt-2 justify-center text-center text-WHITE w-[60%] text-2xl rounded"
                    >
                    Register
                    </button>
                    </div> 
            </div>

           
            ) : (null)}

        
        <div className="w-[80%] ml-[10%] mr-[10%] text-center justify-center mt-2 fixed bottom-0 text-BLACK border-t-2 border-BLACK">
        <div>
            Unoffical private web app for educational purposes, i do not own any of
            the content used
        </div>
        <div className="w-[125px] text-center m-2 rounded justify-center w-full">
            {authenticated || superAuthenticated ? (
                <button
                    onClick={() => logOut()}
                    className="bg-BACKGROUND w-[15%] rounded text-WHITE"
                    >
                        Log out
                    </button>
            ) : 
            (
            <button
                onClick={() => setWantLogin((prevWantLogin) => !prevWantLogin)}
                className="bg-BACKGROUND w-[15%] rounded text-WHITE"
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
