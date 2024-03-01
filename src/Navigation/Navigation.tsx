import { Button } from '@mui/material';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyContext } from '../Context/ContextProvider';

function Navigation() {
    const [ cart, setCart, userID, setUserID, authenticated, setAuthenticated, superAuthenticated, setSuperAuthenticated ] = useMyContext()

    const [page, setPage] = useState(1)
    return (
            <nav className='w-full flex'>
                <div className="flex bg-gray-500 w-full mb-2 border-b-2 border-black border-solid">
                    {(authenticated && !superAuthenticated) ? (
                        <img className='h-[63px] mr-2' src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaTYzo8bURp5Bgcmi6qUgZA09Bc9daAa_E4jvlb60J9g&s'/>
                    ) : (null)}
                    {(authenticated && superAuthenticated) ? (
                        <img className='h-[63px] mr-2' src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYpARmcDnD6YGkauJskZc4CtgEZvMfjRPkddCFk_9tMQ&s'/>
                    ) : (null)}                       
                    <div className='w-[50%] m-3 ml-[5%] text-white text-2xl'>
                        <h1 className='bg-gray-600 h-[40px] w-[200px] justify-center text-center border-b-4 border-black border-solid rounded-t'>
                            Pottery
                        </h1>
                    </div>            
                    <ul className='flex space-x-1 m-2'>
                    {!authenticated ? (
                        <li>
                        <Link to="/MyAccount">
                            <Button
                            variant='outlined'
                            color="primary"
                            style={ page === 5 ? { border: '2px solid white', backgroundColor: 'black', color: 'white', width: '150px' } : { border: '2px solid black', backgroundColor: 'gray', color: '#ffffff', width: '150px' }}
                            onClick={() => {setPage(5)}}
                            >
                            MyAccount
                            </Button>
                        </Link>
                        </li>                            
                        ) : (null)}                     
                        {!superAuthenticated ? (
                        <li>
                        <Link to="/ADMIN">
                            <Button
                            variant='outlined'
                            color="primary"
                            style={ page === 4 ? { border: '2px solid white', backgroundColor: 'black', color: 'white', width: '150px' } : { border: '2px solid black', backgroundColor: 'gray', color: '#ffffff', width: '150px' }}
                            onClick={() => {setPage(4)}}
                            >
                            ADMIN
                            </Button>
                        </Link>
                        </li>                            
                        ) : (null)}
                        <li>
                        <Link to="/">
                            <Button
                            variant='outlined'
                            color="primary"
                            style={ page === 1 ? { border: '2px solid white', backgroundColor: 'black', color: 'white', width: '150px' } : { border: '2px solid black', backgroundColor: 'gray', color: '#ffffff', width: '150px' }}
                            onClick={() => {setPage(1)}}
                            >
                            Brochure
                            </Button>
                        </Link>
                        </li>
                        <li>
                        <Link to="/StoreFront">
                        <Button
                            variant='outlined'
                            color="primary"
                            style={ page === 2 ? { border: '2px solid white', backgroundColor: 'black', color: 'white', width: '150px' } : { border: '2px solid black', backgroundColor: 'gray', color: '#ffffff', width: '150px' }}
                            onClick={() => {setPage(2)}}
                            >
                            Store Front
                            </Button>
                        </Link>
                        </li>
                        <li>
                        <Link to="/Cart">
                        <Button
                            variant='outlined'
                            color="primary"
                            style={ page === 3 ? { border: '2px solid white', backgroundColor: 'black', color: 'white', width: '150px' } : { border: '2px solid black', backgroundColor: 'gray', color: '#ffffff', width: '150px' }}
                            onClick={() => {setPage(3)}}
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
