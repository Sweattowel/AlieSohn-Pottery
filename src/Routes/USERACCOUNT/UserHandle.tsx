import React from "react";
import UserAccount from "./UserAccount";
import UserDelete from "./UserDelete";

export default function UserHandle() {
    return (
        <div className="flex">
            <UserAccount />
            <UserDelete />
        </div>
    )
}