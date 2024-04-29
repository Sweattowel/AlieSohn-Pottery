import React from "react";
import CreateItem from "./Dependencies/CreateItem";
import Orders from "./Dependencies/Orders";
import { useMyContext } from "../../Context/ContextProvider";
import Removeitem from "./Dependencies/Removeitem";
import CreateNewAdmin from "./Dependencies/CreateNewAdmin";

function Admin()
{
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
    <div className="mt-[20%] md:mt-0">
      {superAuthenticated ? (
        <div className="flex h-[165vh] w-[100%] m-auto">
          <div className="w-[50%] mr-2">
            <CreateItem />
            <Removeitem />
            <CreateNewAdmin />
          </div>
          <div className="w-[50%] ">
            <Orders />
          </div>
        </div>
      ) : (
        <>NO ACCESS</>
      )}
    </div>
  );
}

export default Admin;
