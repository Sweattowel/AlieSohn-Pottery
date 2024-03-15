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
    <nav className="m-auto h-[11vh] flex border-BLACK border-b-2 w-[80%]">
      <div className="flex  w-full mb-2">
        {authenticated && !superAuthenticated ? (
          <img
            className="h-[63px] mr-2"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaTYzo8bURp5Bgcmi6qUgZA09Bc9daAa_E4jvlb60J9g&s"
          />
        ) : null}
        {authenticated && superAuthenticated ? (
          <img
            className="h-[63px] mr-2"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYpARmcDnD6YGkauJskZc4CtgEZvMfjRPkddCFk_9tMQ&s"
          />
        ) : null}
        <div className="w-[50%] m-3 ml-[5%]  text-2xl">
          <h1 className="font-serif h-[50%] rounded w-[350px] justify-center text-center text-4xl text-WHITE bg-BACKGROUND">
            AlieSohn Pottery
          </h1>
        </div>
        <ul className="flex space-x-1 m-2">
          {authenticated ? (
            <li>
              <Link to="/MyAccount">
                <Button
                  color="primary"
                  style={
                    page === 5
                      ? {
                          borderBottom: "2px solid white",
                          backgroundColor: "#dc2626",
                          color: "white",
                          width: "150px",
                        }
                      : {
                          borderBottom: "2px solid #fca5a5",
                          color: "black",
                          width: "150px",
                        }
                  }
                  onClick={() => {
                    setPage(5);
                  }}
                >
                  MyAccount
                </Button>
              </Link>
            </li>
          ) : null}
          {superAuthenticated ? (
            <li>
              <Link to="/ADMIN">
                <Button
                  color="primary"
                  style={
                    page === 4
                      ? {
                          borderBottom: "2px solid white",
                          backgroundColor: "#dc2626",
                          color: "white",
                          width: "150px",
                        }
                      : {
                          borderBottom: "2px solid #fca5a5",
                          color: "black",
                          width: "150px",
                        }
                  }
                  onClick={() => {
                    setPage(4);
                  }}
                >
                  ADMIN
                </Button>
              </Link>
            </li>
          ) : null}
          <li>
            <Link to="/">
              <Button
                color="primary"
                style={
                  page === 1
                    ? {
                        borderBottom: "2px solid white",
                        backgroundColor: "#dc2626",
                        color: "white",
                        width: "150px",
                      }
                    : {
                        borderBottom: "2px solid #fca5a5",
                        color: "black",
                        width: "150px",
                      }
                }
                onClick={() => {
                  setPage(1);
                }}
              >
                Brochure
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/StoreFront">
              <Button
                color="primary"
                style={
                  page === 2
                    ? {
                        borderBottom: "2px solid white",
                        backgroundColor: "#dc2626",
                        color: "white",
                        width: "150px",
                      }
                    : {
                        borderBottom: "2px solid #fca5a5",
                        color: "black",
                        width: "150px",
                      }
                }
                onClick={() => {
                  setPage(2);
                }}
              >
                Store Front
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/Cart">
              <Button
                color="primary"
                style={
                  page === 3
                    ? {
                        borderBottom: "2px solid white",
                        backgroundColor: "#dc2626",
                        color: "white",
                        width: "150px",
                      }
                    : {
                        borderBottom: "2px solid #fca5a5",
                        color: "black",
                        width: "150px",
                      }
                }
                onClick={() => {
                  setPage(3);
                }}
              >
                Cart
              </Button>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
