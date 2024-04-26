import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMyContext } from "../Context/ContextProvider";
import MenuIcon from '@mui/icons-material/Menu';
import { motion } from 'framer-motion'

function MobileNavigation(){
    
    const [
        ,
        ,
        ,
        ,
        userID,
        ,
        authenticated,
        ,
        superAuthenticated,
        ,
    ] = useMyContext();
    const [page, setPage] = useState(1);
    const [wanted, setWanted] = useState(false)
    const container = {
        hidden: { opacity: 1, scale: 0 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: {
            delayChildren: 0.1,
            staggerChildren: 0.1
          }
        }
      };
      
      const itemded = {
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1
        }
      };

    return (
        <div className="flex flex-row fixed top-0 left-0 w-full">
            <div className="w-[70%] text-xl bg-BACKGROUND ">
                <h1 className="font-serif h-[8vh] md:h-[5vh] rounded w-full text-center flex items-center justify-center text-[2rem] md:text-[3rem] text-WHITE ">
                    AlieSohn
                </h1>
            </div>
            <div className="w-[30%] text-xl bg-BACKGROUND ">
                <h1 onClick={() => setWanted(!wanted)} className="font-serif h-[8vh] md:h-[5vh] w-full text-center flex items-center justify-center text-[2rem] md:text-[3rem] border-BACKGROUND border bg-BACKGROUND text-BLACK  rounded-lg">
                    <div className={ `${wanted ? ' opacity-80': ''} text-WHITE m-2 w-[80%] h-[80%] flex items-center justify-center rounded`}>
                        <MenuIcon />
                    </div>
                </h1>
            </div>
            {wanted ? (
            <motion.ul 
                initial="hidden"
                animate="visible"   
                variants={container}         
                className={`fixed top-[10vh] right-10 bg-BACKGROUND w-[30vw] z-20  rounded-lg `}>
            
                <motion.ul         
    
                    className="flex flex-col h-full w-full justify-evenly  flex-column flex rounded shadow-lg"
                >
                    <motion.li variants={itemded}>
                    {authenticated ? (
                        <Link to={`/MyAccount/${userID}`}>
                                <button
                                className={`text-${page === 5 ? 'BLACK bg-WHITE' : 'WHITE'} h-[8vh] w-full text-[0.7rem] bg-BACKGROUND rounded-t`}
                                onClick={() => {
                                    setPage(5);
                                }}
                                >
                                My Account
                                </button>
                        </Link>                        
                    ) : (null)}   

                    </motion.li>
                    <motion.li variants={itemded}>
                    {superAuthenticated ? (
                        <li>
                            <Link to="/ADMIN">
                            <button
                                className={`text-${page === 4 ? 'BLACK bg-WHITE' : 'WHITE'} h-[8vh] w-full text-[0.7rem] bg-BACKGROUND rounded-t`}
                                onClick={() => {
                                setPage(4);
                                setWanted(false);
                                }}
                            >
                                Admin
                            </button>
                            </Link>
                        </li>
                        ) : null}
                    </motion.li>
                    <motion.li variants={itemded}>
                    <Link to="/">
                        <button
                            className={`text-${page === 1 ? 'BLACK bg-WHITE' : 'WHITE'} h-[8vh] w-full text-[0.7rem] bg-BACKGROUND rounded-t`}
                            onClick={() => {
                            setPage(1);
                            setWanted(false);
                            }}
                        >
                            Brochure
                        </button>
                        </Link>
                    </motion.li>
                    <motion.li variants={itemded}>
                    <Link to="/StoreFront">
                        <button
                            className={`text-${page === 2 ? 'BLACK bg-WHITE' : 'WHITE'} h-[8vh] w-full text-[0.7rem] bg-BACKGROUND`}
                            onClick={() => {
                            setPage(2);
                            setWanted(false)
                            }}
                        >
                            Store Front
                        </button>
                        </Link>
                    </motion.li>
                    <motion.li variants={itemded}>
                    <Link to="/Cart">
                        <button
                            className={`text-${page === 3 ? 'BLACK bg-WHITE' : 'WHITE'} h-[8vh] w-full text-[0.7rem] bg-BACKGROUND rounded-b`}
                            onClick={() => {
                            setPage(3);
                            setWanted(false)
                            }}
                        >
                            CART
                        </button>
                        </Link>
                    </motion.li>

                </motion.ul>
            </motion.ul>) : (
                null
            )}
        </div>
    );
}
export default MobileNavigation