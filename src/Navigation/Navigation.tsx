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
    <nav className="m-auto h-[11vh] flex border-BLACK border-b-2 w-[80vw]">
      <div className="flex  w-full mb-2">
        <div className="w-[50%] m-auto   text-2xl">
        <h1 className="font-serif h-full rounded w-[25vw] mr-2 text-center flex items-center justify-center text-[1.3rem] text-WHITE bg-BACKGROUND">
          AlieSohn Pottery
        </h1>

        </div>
        <ul className="flex space-x-1 h-full w-[80vw] justify-center items-center text-[0.6em]">
          {authenticated  && superAuthenticated ? (
            <li>
              <Link to={`/MyAccount/${userID}`}>
                <button
                  className={page === 5 ? "font-bold text-WHITE bg-BACKGROUND min-w-[10vw] max-w-[50vw] h-[5vh] rounded" : "border-b border-SELECTED text-BLACK bg-WHITE min-w-[10vw] max-w-[50vw] h-[5vh] rounded"}
                  onClick={() => {
                    setPage(5);
                  }}
                >
                  MyAccount
                </button>
              </Link>
            </li>
          ) : null}
          {superAuthenticated ? (
            <li>
              <Link to="/ADMIN">
                <button
                  className={page === 4 ? "font-bold text-WHITE bg-BACKGROUND min-w-[10vw] max-w-[50vw] h-[5vh] rounded" : "border-b border-SELECTED text-BLACK bg-WHITE min-w-[10vw] max-w-[50vw] h-[5vh] rounded"}
                  onClick={() => {
                    setPage(4);
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
                  className={page === 1 ? "font-bold text-WHITE bg-BACKGROUND min-w-[10vw] max-w-[50vw] h-[5vh] rounded" : "border-b border-SELECTED text-BLACK bg-WHITE min-w-[10vw] max-w-[50vw] h-[5vh] rounded"}
                  onClick={() => {
                    setPage(1);
                  }}
                >
                  Brochure
                </button>
            </Link>
          </li>
          <li>
            <Link to="/StoreFront">
            <button
                  className={page === 2 ? "font-bold text-WHITE bg-BACKGROUND min-w-[10vw] max-w-[50vw] h-[5vh] rounded" : "border-b border-SELECTED text-BLACK bg-WHITE min-w-[10vw] max-w-[50vw] h-[5vh] rounded"}
                  onClick={() => {
                    setPage(2);
                  }}
                >
                  StoreFront
                </button>
            </Link>
          </li>
          <li>
            <Link to="/Cart">
            <button
                  className={page === 3 ? "font-bold text-WHITE bg-BACKGROUND min-w-[10vw] max-w-[50vw] h-[5vh] rounded" : "border-b border-SELECTED text-BLACK bg-WHITE min-w-[10vw] max-w-[50vw] h-[5vh] rounded"}
                  onClick={() => {
                    setPage(3);
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
