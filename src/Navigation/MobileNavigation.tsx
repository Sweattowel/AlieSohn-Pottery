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
  const [see, isSee] = useState<boolean>(false);
  return (
    <nav className="z-20 fixed top-0 left-0 h-[5vh] flex flex-row justify-evenly items-center bg-WHITE text-BLACK w-full">
        <h1 className="font-serif h-[80%] rounded w-[50%] text-center flex items-center justify-center text-[1rem] md:text-HIGHLIGHT text-BLACK ">
          AlieSohn
        </h1>
        <button>
            <img onClick={() => isSee(!see)} className={`${see ? "bg-HIGHLIGHT rounded rotate-90 duration-9999" : ""} w-[6vw] h-full`} src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Hamburger_icon.svg/1200px-Hamburger_icon.svg.png" alt="Burger" />
        </button>
        {see ? (
            <ul className="fixed right-0 top-[5vh] flex flex-col w-[25%] h-[55vh] divide-y justify-evenly items-center text-center bg-GREY">
            {authenticated && !superAuthenticated ? (
                <NavItem to={`/MyAccount/${userID}`} currentPathname={location.pathname}><button onClick={() => isSee(false)}>My Account</button></NavItem>
            ) : null}
            {superAuthenticated ? (
                <NavItem to="/ADMIN" currentPathname={location.pathname}><button onClick={() => isSee(false)}>Admin</button></NavItem>
            ) : null}
                <NavItem to="/" currentPathname={location.pathname}><button onClick={() => isSee(false)}>Brochure</button></NavItem>
                <NavItem to="/StoreFront" currentPathname={location.pathname}><button onClick={() => isSee(false)}>Store Front</button></NavItem>
                <NavItem to="/Cart" currentPathname={location.pathname}><button onClick={() => isSee(false)}>CART</button></NavItem>
            </ul>            
        ) : (null)}

    </nav>
  );
}

export default Navigation;

// Individual NavItems Assist in creating a nice user experience
function NavItem({ to, children, currentPathname }: { to: string, children: React.ReactNode, currentPathname: string })
{
  const isActive = currentPathname === to;

  const linkClass = isActive ? "bg-WHITE" : "";

  return (
    <li className={`${linkClass} p-2 w-full h-full flex text-center items-center text-center justify-center shadow-inner`}>
      <Link to={to}>
        {children}
      </Link>
    </li>
  );
}
