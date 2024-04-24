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
        <div className="flex flex-row">
            <div className="w-[70%] text-xl bg-BACKGROUND">
                <h1 className="font-serif h-[8vh] md:h-[5vh] rounded w-full text-center flex items-center justify-center text-[2rem] md:text-[3rem] text-WHITE ">
                    AlieSohn
                </h1>
            </div>
            <div className="w-[30%] text-xl bg-BACKGROUND ">
                <h1 onClick={() => setWanted(!wanted)} className="font-serif h-[8vh] md:h-[5vh] w-full text-center flex items-center justify-center text-[2rem] md:text-[3rem] border-BACKGROUND border bg-BACKGROUND text-BLACK  rounded-lg">
                    <div className={ wanted ? "bg-WHITE m-2 border-BLACK border w-[80%] h-[80%] flex items-center justify-center rounded shadow-lg opacity-90" : "bg-WHITE m-2 border-BLACK border w-[80%] h-[80%] flex items-center justify-center rounded shadow-lg"}>
                        <MenuIcon />
                    </div>
                </h1>
            </div>
            {wanted ? (
            <motion.ul 
                initial="hidden"
                animate="visible"   
                variants={container}         
                className={`fixed top-[10vh] right-0 h-[45vh] bg-BACKGROUND w-[35vw] z-10  rounded-lg `}>
            
                <motion.ul         
    
                    className="flex flex-col h-full w-full justify-center  flex-column flex border border-BLACK rounded-lg "
                >
                    <div onClick={() => setWanted(!wanted)}  className="border border-BLACK bg-WHITE text-BLACK w-[80%] flex ml-auto mr-auto mb-2 text-center items-center justify-center font-serif rounded shadow-lg">
                        Menu
                    </div>
                    <motion.li variants={itemded}>
                    {authenticated ? (
                        <Link to={`/MyAccount/${userID}`}>
                                <button
                                className={
                                    page === 5
                                    ? "text-BLACK  md:h-[5vh] h-[8vh] md:w-[13vw] w-[80%] flex text-center justify-center items-center bg-WHITE  text-BLACK  rounded  shadow-lg m-auto text-base md:text-xl border-BLACK border opacity-90"
                                    : "text-BLACK h-[8vh] md:w-[13vw] w-[80%] md:h-[5vh] text-base md:text-xl hover:text-BLACK m-auto border-BLACK border flex text-center justify-center items-center bg-WHITE  rounded  shadow-lg"
                                }
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
                                className={
                                page === 4
                                ? "text-BLACK  md:h-[5vh] h-[8vh] md:w-[13vw] w-[80%] flex text-center justify-center items-center bg-WHITE  text-BLACK  rounded  shadow-lg m-auto text-base md:text-xl border-BLACK border opacity-90"
                                : "text-BLACK h-[8vh] md:w-[13vw] w-[80%] md:h-[5vh] text-base md:text-xl hover:text-BLACK m-auto border-BLACK border flex text-center justify-center items-center bg-WHITE  rounded  shadow-lg"
                                }
                                onClick={() => {
                                setPage(4);
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
                            className={
                            page === 1
                            ? "text-BLACK  md:h-[5vh] h-[8vh] md:w-[13vw] w-[80%] flex text-center justify-center items-center bg-WHITE  text-BLACK  rounded  shadow-lg m-auto text-base md:text-xl border-BLACK border opacity-90"
                            : "text-BLACK h-[8vh] md:w-[13vw] w-[80%] md:h-[5vh] text-base md:text-xl hover:text-BLACK m-auto border-BLACK border flex text-center justify-center items-center bg-WHITE  rounded  shadow-lg"
                            }
                            onClick={() => {
                            setPage(1);
                            }}
                        >
                            Brochure
                        </button>
                        </Link>
                    </motion.li>
                    <motion.li variants={itemded}>
                    <Link to="/StoreFront">
                        <button
                            className={
                            page === 2
                            ? "text-BLACK  md:h-[5vh] h-[8vh] md:w-[13vw] w-[80%] flex text-center justify-center items-center bg-WHITE  text-BLACK  rounded  shadow-lg m-auto text-base md:text-xl border-BLACK border opacity-90"
                            : "text-BLACK h-[8vh] md:w-[13vw] w-[80%] md:h-[5vh] text-base md:text-xl hover:text-BLACK m-auto border-BLACK border flex text-center justify-center items-center bg-WHITE  rounded  shadow-lg"
                            }
                            onClick={() => {
                            setPage(2);
                            }}
                        >
                            Store Front
                        </button>
                        </Link>
                    </motion.li>
                    <motion.li variants={itemded}>
                    <Link to="/Cart">
                        <button
                            className={
                            page === 3
                            ? "text-BLACK  md:h-[5vh] h-[8vh] md:w-[13vw] w-[80%] flex text-center justify-center items-center bg-WHITE  text-BLACK  rounded  shadow-lg m-auto text-base md:text-xl border-BLACK border opacity-90"
                            : "text-BLACK h-[8vh] md:w-[13vw] w-[80%] md:h-[5vh] text-base md:text-xl hover:text-BLACK m-auto border-BLACK border flex text-center justify-center items-center bg-WHITE  rounded  shadow-lg"
                            }
                            onClick={() => {
                            setPage(3);
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