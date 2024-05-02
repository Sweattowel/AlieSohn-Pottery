import React from "react";
import UserAccount from "./UserAccount";
import UserDelete from "./UserDelete";
import { useMyContext } from "../../Context/ContextProvider";

export default function UserHandle()
{
    const [
        ,
        ,
        ,
        ,
        ,
        ,
        authenticated,
        ,
        ,
        ,
    ] = useMyContext();

    return (
        <div className="flex flex-col bg-LIGHT">
            <div className="bg-WHITE h-full w-[90%] flex m-auto">
                {!authenticated &&
                    <>
                        <UserAccount />
                        <UserDelete />
                    </>
                }                
            </div>

        </div>
    )
}