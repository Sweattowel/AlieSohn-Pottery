import React from "react";
import CreateItem from "./Dependencies/CreateItem";
import Orders from "./Dependencies/Orders";
import { useMyContext } from "../../Context/ContextProvider";
import Removeitem from "./Dependencies/Removeitem";
import CreateNewAdmin from "./Dependencies/CreateNewAdmin";

function Admin(){
    const [ cart, setCart, userID, setUserID, authenticated, setAuthenticated, superAuthenticated, setSuperAuthenticated ] = useMyContext()

    return (
        <>
            {superAuthenticated ? (
                <div className="flex h-[120vh] w-[80%] m-auto">
                    <div className="w-[50%]">
                        <CreateItem />     
                        <Removeitem />   
                        <CreateNewAdmin />                             
                    </div>

                    <Orders />        
                </div>             
            ) : (
                <>
                    NO ACCESS
                </>)}        
        </>

       
    )


}

export default Admin