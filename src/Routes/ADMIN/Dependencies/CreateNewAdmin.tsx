import axios from "axios"
import React, {useState} from "react"
import { useMyContext } from "../../../Context/ContextProvider";

export default function CreateNewAdmin(){
    const [ allItems, setAllItemscart, cart, setCart, userID, setUserID, authenticated, setAuthenticated, superAuthenticated, setSuperAuthenticated] = useMyContext();
    const serverAddress = process.env.REACT_APP_SERVER_ADDRESS
    const [userName, setUserName] = useState<string>('thoams')
    const [passWord, setPassWordName] = useState<string>('Ganggangstyle25*87')

    const createAdmin = async () => {
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
        <div className="w-full h-full bg-BACKGROUND text-WHITE">
            test
            <button onClick={() => createAdmin()}>
                CREATE ADMIN
            </button>
        </div>
    )
}