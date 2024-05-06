import { Button } from "@mui/material";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMyContext } from "../Context/ContextProvider";

function Navigation()
{
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

  const location = useLocation();

  return (
    <nav className=" fixed h-[5vh] max-h-[5vh] flex flex-row justify-evenly items-center text-WHITE w-full shadow-xl">
        <h1 className="font-serif h-[80%] rounded w-[20%] text-center flex items-center justify-center text-[2rem] text-WHITE italic">
          AlieSohn
        </h1>
        <ul className="flex flex-row w-[60%] justify-evenly items-center text-center">
          {authenticated && !superAuthenticated ? (
            <NavItem to={`/MyAccount/${userID}`} currentPathname={location.pathname}><button>My Account</button></NavItem>
          ) : null}
          {superAuthenticated ? (
            <NavItem to="/ADMIN" currentPathname={location.pathname}><button>Admin</button></NavItem>
          ) : null}
            <NavItem to="/" currentPathname={location.pathname}><button>Brochure</button></NavItem>
            <NavItem to="/StoreFront" currentPathname={location.pathname}><button>Store Front</button></NavItem>
            <NavItem to="/Cart" currentPathname={location.pathname}><button>CART</button></NavItem>
        </ul>
    </nav>
  );
}

export default Navigation;

// Individual NavItems Assist in creating a nice user experience
function NavItem({ to, children, currentPathname }: { to: string, children: React.ReactNode, currentPathname: string })
{
  const isActive = currentPathname === to;

  const linkClass = isActive ? "bg-RED text-WHITE" : "";

  return (
    <li className={`${linkClass} rounded p-2 hover:bg-RED`}>
      <Link to={to}>
        <button>{children}</button>
      </Link>
    </li>
  );
}
