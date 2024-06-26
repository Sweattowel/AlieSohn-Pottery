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
    <div className="h-full w-full border mt-[20%] md:mt-0 bg-gradient-to-b from-GREY to-WHITE">
      <div className="mb-[10vh]">
        {/* WHY DOES THIS KEEP HAPPENING */}
      </div>
      <div>
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

    </div>
  );
}

export default Admin;
