import axios from "axios"
import React, {useState} from "react"
import { useMyContext } from "../../../Context/ContextProvider";

export default function CreateNewAdmin(){
    const [ allItems, setAllItemscart, cart, setCart, userID, setUserID, authenticated, setAuthenticated, superAuthenticated, setSuperAuthenticated] = useMyContext();
    const serverAddress = process.env.REACT_APP_SERVER_ADDRESS
    const [userName, setUserName] = useState<string>('')
    const [passWord, setPassWordName] = useState<string>('')

    const createAdmin = async () => {
        if (userName == '' || passWord == ''){
            return
        }
        try {
            const response = await axios.post(`${serverAddress}/api/adminRegistration`, ({userName: userName, passWord: passWord}))

            if (response.status == 200){
                console.log('Created admin')
            } else {
                console.log('Failed to create admin')
            }
        } catch (error) {
            console.log('Failed to create admin')
        }
        
    }
    
    return (
        <div className="w-full text-WHITE justify-center items-center border rounded mb-10">
            <h1 className="m-auto flex justify-center bg-BACKGROUND mb-1 rounded">
                CREATE NEW ADMIN
            </h1>
            <div className="m-auto w-[80%] flex justify-center bg-BACKGROUND rounded">
                NewAdminName: 
            </div>
            <input className="m-auto w-[80%] flex justify-center border border-BLACK mt-1 mb-1" />
            <div className="m-auto w-[80%] flex justify-center bg-BACKGROUND rounded">
                NewAdminPass: 
            </div>
            <input className="m-auto w-[80%] flex justify-center border border-BLACK mt-1 mb-1" />
            <button 
                className="bg-BACKGROUND m-auto flex w-[80%] text-center items-center justify-center hover:opacity-90 hover:text-BLACK mb-2 rounded"
                onClick={() => createAdmin()}>
                SEND REQUEST
            </button>
        </div>
    )
}