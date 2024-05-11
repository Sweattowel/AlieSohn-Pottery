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
        <div className="flex bg-gradient-to-b from-GREY to-WHITE h-full w-full">

                {authenticated &&
                    <>
                        <UserAccount />
                        <UserDelete />
                    </>
                }                

        </div>
    )
}