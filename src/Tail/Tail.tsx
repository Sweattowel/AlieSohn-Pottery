import { Button, Input, TextareaAutosize } from "@mui/material";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useMyContext } from "../Context/ContextProvider";

function Tail() {
    const [cart, setCart, userID, setUserID, authenticated, setAuthenticated, superAuthenticated, setSuperAuthenticated, userName, setUserName] = useMyContext();
    const serverAddress = process.env.REACT_APP_SERVER_ADDRESS

    const [wantLogin, setWantLogin] = useState<boolean>(false)
    const [userNameAttempt, setUserNameAttempt] = useState<string>('')
    const [passWordAttempt, setPassWordAttempt] = useState<string>('')
    const [caste, setCaste] = useState<string>('waiting')

    const Login = async (ChosenCaste: string) => {
        if (ChosenCaste === 'regularJackoff'){
            try {
                const response = await axios.post(`${serverAddress}/api/login`, { userName: userNameAttempt, passWord: passWordAttempt });
                if (response.status === 200){
                    setAuthenticated(true);
                    setUserID(response.data.userID);
                    setUserName(userNameAttempt);
                    setWantLogin(false)
                    console.log('Logged in successfully');
                } else if (response.status === 404) {
                    console.log('No account exists');
                } else {
                    console.log('Failed to log in');
                }
            } catch (error) {
                console.log(error);
            }
        } else if (ChosenCaste === 'King'){
            try {
                const ResponseSir = await axios.post(`${serverAddress}/api/adminLogin`, { userName: userNameAttempt, passWord: passWordAttempt });
                if (ResponseSir.status === 200){
                    setAuthenticated(true);
                    setSuperAuthenticated(true);
                    setUserID(-(ResponseSir.data.adminID));
                    setWantLogin(false)
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
    }
    const logOut = () => {
        setAuthenticated(false)
        setSuperAuthenticated(false)
        setUserID(-1)
    }
    const register = async () => {
        try {
            const response = await axios.post(`${serverAddress}/api/register`, { userName: userNameAttempt, passWord: passWordAttempt } )
            if (response.status === 200){
                console.log('Registered successfully');
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
            <div onSubmit={() => Login(caste)} className="fixed bottom-[10%] rounded-lg left-[20%] border-black border-2 text-center justify-center w-[60%] h-[80%] bg-gray-600 text-white">
                <h1 style={{ fontSize: '2em', width: '80%', margin: 'auto', borderBottom: '2px solid black' }}>
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
                <Button
                onClick={() => Login('regularJackoff')}
                style={{
                    width: "125px",
                    height: '50px',
                    color: "white",
                    backgroundColor: "gray",
                    fontSize: "0.5em",
                    borderRight: "1px solid black",
                }}
                >
                Regular Jackoff Login
                </Button>
                <Button
                    onClick={() => Login('King')}
                style={{
                    width: "125px",
                    height: '50px',
                    color: "white",
                    backgroundColor: "gray",
                    fontSize: "0.5em",
                    borderLeft: "1px solid black",
                }}
                >
                Secret Login
                </Button>
                <br />
                <br />
                <Button
                    onClick={() => register()}
                style={{
                    width: "125px",
                    height: '50px',
                    color: "white",
                    backgroundColor: "gray",
                    fontSize: "0.5em",
                    borderLeft: "1px solid black",
                }}
                >
                Register
                </Button>
                </div>            
            ) : (null)}

        
        <div className="w-[90%] ml-[5%] mr-[5%] text-center bg-gray-500 mt-2 fixed bottom-0 rounded-t border-t-2 border-r-2 border-l-2 border-black">
        <div>
            Unoffical private web app for educational purposes, i do not own any of
            the content used
        </div>
        <div className="bg-black border-black border-2 w-[125px] justify-center flex text-center m-auto mb-1 rounded">
            {authenticated || superAuthenticated ? (
                <Button
                    onClick={() => logOut()}
                    style={{
                        width: "125px",
                        color: "white",
                        backgroundColor: "gray",
                        fontSize: "0.5em",
                        borderRight: "1px solid black",
                    }}
                    >
                        Log out
                    </Button>
            ) : 
            (
            <Button
                onClick={() => setWantLogin((prevWantLogin) => !prevWantLogin)}
            style={{
                width: "125px",
                color: "white",
                backgroundColor: "gray",
                fontSize: "0.5em",
                borderRight: "1px solid black",
            }}
            >
                Login
            </Button>
            )}
        </div>
        </div>
    </>
  );
}

export default Tail;
