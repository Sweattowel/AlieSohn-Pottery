import React from "react";
import UserAccount from "./UserAccount";
import UserDelete from "./UserDelete";
import { useMyContext } from "../../Context/ContextProvider";

export default function UserHandle() {
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
      
    return (
        <div className="flex">
            { authenticated && 
            <>
                <UserAccount />
                <UserDelete />            
            </>
            }
        </div>
    )
}