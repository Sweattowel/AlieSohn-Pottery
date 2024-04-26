import { Button } from "@mui/material";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMyContext } from "../Context/ContextProvider";

function Navigation() {
  const [
    ,
    ,
    cart,
    setCart,
    userID,
    setUserID,
    authenticated,
    setAuthenticated,
    superAuthenticated,
    setSuperAuthenticated,
  ] = useMyContext();

  const [page, setPage] = useState(1);

  
  return (
    <nav className="m-auto h-[5vh] flex bg-BACKGROUND border-BLACK border-b-2 w-full bg-60 rounded-b">
      <div className="flex  w-full mb-2">
        <div className="w-[50%] m-auto   text-xl">
          <h1 className="font-serif h-[8vh] md:h-[5vh] rounded w-[25vw] mr-3 text-center flex items-center justify-center text-[2rem] md:text-[2rem] text-WHITE ">
            AlieSohn
          </h1>
        </div>
        <ul className="flex space-x-1 h-full w-[80vw] justify-center items-center text-[0.6em]">
          {authenticated && !superAuthenticated ? (
            <li>
              <Link to={`/MyAccount/${userID}`}>
                <button
                  className={`text-${page === 1 ? 'BLACK' : 'WHITE'} h-[8vh] md:w-[13vw] w-[15vw] md:h-[5vh] text-base md:text-l hover:text-BLACK`}
    
                  onClick={() => {
                    setPage(1);
                  }}
                >
                  My Account
                </button>
              </Link>
            </li>
          ) : null}
          {superAuthenticated ? (
            <li>
              <Link to="/ADMIN">
                <button
                  className={`text-${page === 2 ? 'BLACK' : 'WHITE'} h-[8vh] md:w-[13vw] w-[15vw] md:h-[5vh] text-base md:text-l hover:text-BLACK`}
                  onClick={() => {
                    setPage(2);
                  }}
                >
                  Admin
                </button>
              </Link>
            </li>
          ) : null}
          <li>
            <Link to="/">
              <button
                className={`text-${page === 3 ? 'BLACK' : 'WHITE'} h-[8vh] md:w-[13vw] w-[15vw] md:h-[5vh] text-base md:text-l hover:text-BLACK`}
                onClick={() => {
                  setPage(3);
                }}
              >
                Brochure
              </button>
            </Link>
          </li>
          <li>
            <Link to="/StoreFront">
              <button
                className={`text-${page === 4 ? 'BLACK' : 'WHITE'} h-[8vh] md:w-[13vw] w-[15vw] md:h-[5vh] text-base md:text-l hover:text-BLACK`}
                onClick={() => {
                  setPage(4);
                }}
              >
                Store Front
              </button>
            </Link>
          </li>
          <li>
            <Link to="/Cart">
              <button
                className={`text-${page === 5 ? 'BLACK' : 'WHITE'} h-[8vh] md:w-[13vw] w-[15vw] md:h-[5vh] text-base md:text-l hover:text-BLACK`}
                onClick={() => {
                  setPage(5);
                }}
              >
                CART
              </button>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
