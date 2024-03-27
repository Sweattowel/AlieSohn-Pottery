import React from "react";
import CreateItem from "./Dependencies/CreateItem";
import Orders from "./Dependencies/Orders";
import { useMyContext } from "../../Context/ContextProvider";
import Removeitem from "./Dependencies/Removeitem";
import CreateNewAdmin from "./Dependencies/CreateNewAdmin";

function Admin() {
  const [
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
    <>
      {superAuthenticated ? (
        <div className="flex h-[165vh] w-[80%] m-auto">
          <div className="w-[50%] mr-2">
            <CreateItem />
            <Removeitem />
            <CreateNewAdmin />
          </div>
          <div className="border-l border-BLACK">
            <Orders />
          </div>
        </div>
      ) : (
        <>NO ACCESS</>
      )}
    </>
  );
}

export default Admin;
