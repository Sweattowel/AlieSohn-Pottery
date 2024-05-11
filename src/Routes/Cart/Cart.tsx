import React, { useEffect, useState } from 'react';
import { useMyContext } from '../../Context/ContextProvider';
import { Card, Pagination } from '@mui/material';
import url from 'url';
import axios from 'axios';
import CardHandle from './Dependencies/CardHandle';
import './Dependencies/Cart.css';


interface CartItem
{
  itemID: number;
  itemName: string;
  itemPrice: number;
  imagePath: string;
  itemDescription: string;
  itemCount: number;
}

function Cart()
{
  const [
    ,
    ,
    cart,
    setCart,
    userID,
    ,
    authenticated,
    ,
    superAuthenticated,
    ,
    userName,
    ,
  ] = useMyContext();
  const serverAddress = `${process.env.REACT_APP_SERVER_ADDRESS}`;
  const [showCardHandle, setShowCardHandle] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [error, setError] = useState('');
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = cart.slice(indexOfFirstItem, indexOfLastItem);

  const [confirmationMessages, setConfirmationMessages] = useState<
    { index: number; id: number; type: string }[]
  >([]);
  const [conflicts, setConflicts] = useState<number[]>([]);
  const [address, setAddress] = useState({
    houseNumber: '',
    street: '',
    city: '',
    state: '',
  });
  // TOKEN HANDLE
  function getToken(choice: string)
  {
    if (choice === 'Null') return;

    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(`${choice}=`)) {
        // Corrected condition
        return cookie.substring(`${choice}=`.length); // Corrected substring index
      }
    }
    return null;
  }
  // ORDER HANDLE
  class OrderHandle
  {
    // CREATE ORDER
    static createOrder = async () =>
    {
      const choice = superAuthenticated
        ? 'sutoken'
        : authenticated
          ? 'token'
          : 'Null';
      const storedToken = getToken(choice);

      if (!storedToken) {
        console.log('No authorization found');
        return;
      }

      try {
        const itemIDs = [];
        for (let i = 0; i < cart.length; i++) {
          itemIDs.push(cart[i].itemID);
        }
        const orderDate = new Date();
        const response = await axios.post(
          `${serverAddress}/api/createOrder`,
          {
            userID,
            userName,
            itemIDs,
            orderDate,
          },
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          },
        );

        if (response.status === 401) {
          console.log('Unauthorized, please log in');
          setError('Unauthorized, please log in');
        } else if (response.status === 200) {
          // PLACE BOUGHT ITEMS INTO STORAGE
          const prev: string[] = JSON.parse(
            localStorage.getItem('BOUGHTIDS') || '[]',
          );
          localStorage.setItem(
            `BOUGHTIDS${userID}`,
            JSON.stringify([...prev, ...itemIDs]),
          );
          console.log('Successfully made order');
          setCart([]);
        } else if (response.status === 409) {
          console.log('Items have already been purchased');
          setConflicts(response.data);
        } else {
          console.log('Failed to make order');
        }
      } catch (error) {
        setError('Unauthorized, please relog');
      }
    };
    // BEGIN PAYMENT
    static sendOrder = async () =>
    {
      if (cart.length === 0) {
        console.log('No items in cart');
        return;
      }
      if (
        address.city == '' ||
        address.houseNumber == '' ||
        address.state == '' ||
        address.street == ''
      ) {
        setError('Invalid address');
        return;
      }
      setError('')
      setShowCardHandle(true);
    };
    // END PAYMENT
    static handleCardConfirm = () =>
    {
      setShowCardHandle(false); // Hide card handling component on confirmation
      OrderHandle.createOrder(); // Proceed with creating the order
    };
    static handleCardCancel = () => 
    {
      setShowCardHandle(false)
      setError("Order Cancelled")
    }
  }

  // CART HANDLE
  class CartHandle
  {
    // REMOVE ITEM FROM CART IN FULL
    static removeFromCart(id: number)
    {
      setCart((prevItems) => prevItems.filter((item) => item.itemID !== id));
    }
  }

  class HandlePage
  {
    static handleChangePage = (
      event: React.ChangeEvent<unknown>,
      newPage: number,
    ) =>
    {
      setCurrentPage(newPage);
    };
  }

  ///////////////////////////////////////////////////////////////////////
  useEffect(() =>
  {
    let totalCost = 0;
    let itemCount = 0;

    cart.forEach((item) =>
    {
      totalCost += parseFloat(item.itemPrice);
      itemCount += 1;
    });
    setCurrentPage(currentPage);
    setTotalCost(totalCost);
    setItemCount(itemCount);
  }, [cart]);

  useEffect(() =>
  {
    const boughtIds = localStorage.getItem('BOUGHTIDS');
    if (!boughtIds) {
      localStorage.setItem('BOUGHTIDS', JSON.stringify([]));
    }
  }, []);

  ///////////////////////////////////////////////////////////////////
  return (
    <div className='w-full h-full md:mt-0 mt-[5vh] bg-gradient-to-b from-GREY to-WHITE'>
      {showCardHandle &&
        <CardHandle onCancel={OrderHandle.handleCardCancel} onConfirm={OrderHandle.handleCardConfirm} />      
      }

      <div className='h-[8vh]'>
        {/* Fucking move cunt */}
      </div>
        <h1 className='text-[2rem] text-center w-[60%] m-auto mb-5 text-BLACK font-serif'>
          My Cart
        </h1>
        <div className='flex md:flex-row flex-col w-full h-full justify-evenly mb-5'>
          <div className='md:w-[40%] w-full h-full'>
            <h1 className='text-BLACK bg-WHITE shadow-lg rounded text-[1.5rem] w-full text-center'>
              Your items:
            </h1>
            <div className='divide-y text-BLACK h-[100vh]'>
              {currentItems.map((item: CartItem, index: number) => (
                <div className='h-[25vh] flex flex-row justify-evenly' key={index}>
                  <img className='shadow-lg h-[80%] w-[35%] flex justify-center m-auto' src={url.resolve(serverAddress, item.imagePath)} alt="storeItem" />
                  <div className='flex flex-col h-full w-[25%] text-center justify-center items-center'>
                    <div className='md:text-[1.25rem] text-[0.7rem] bg-GREY text-BLACK p-2 rounded'>{item.itemName}</div>
                    <div className='md:text-[1rem] text-[0.7rem]'>{item.itemDescription}</div>
                  </div>
                  <div className='flex flex-col h-[60%] m-auto w-[25%] text-center justify-center items-center border-l'>
                    <div>${item.itemPrice}</div>
                    <div>
                      <button
                        onClick={() =>
                        {
                          CartHandle.removeFromCart(item.itemID);
                          setConfirmationMessages((prev) => [
                            ...prev,
                            { index, id: Date.now(), type: 'Removed' },
                          ]);
                          setTimeout(
                            () =>
                              setConfirmationMessages((prev) =>
                                prev.filter((msg) => msg.id !== prev[0]?.id),
                              ),
                            2000,
                          );
                        }}
                        className="border rounded mr-1 hover:opacity-90 flex-grow hover:shadow-lg border border-BLACK p-2"
                      >
                        {conflicts.includes(item.itemID) ? (
                          <>Please Remove</>
                        ) : (
                          <>Remove</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div>
                {currentItems.length === 0 ? (
                  <h1 className='text-[1.5rem] text-center mt-10'>
                    Please visit our store to fill out your cart
                  </h1>
                ) : (null)}
              </div>
            </div>
          </div>
          <div className='md:w-[40%] w-full h-[40vh] text-center rounded bg-WHITE shadow-lg'>
            <div>
              <div className="text-BLACK">
                <h2 className='text-[1.5rem]'>
                  Enter Delivery location
                </h2>

                <div className="rounded h-[12vh] flex flex-col justify-center items-center text-BLACK">
                  <input
                    onChange={(e) =>
                      setAddress({ ...address, houseNumber: e.target.value })
                    }
                    className="rounded border border-BLACK text-center"
                    type="text"
                    name="houseNumber"
                    id="houseNumber"
                    placeholder="houseNumber"
                  />
                  <input
                    onChange={(e) =>
                      setAddress({ ...address, street: e.target.value })
                    }
                    className="rounded border border-BLACK text-center"
                    type="text"
                    name="street"
                    id="street"
                    placeholder="street"
                  />
                  <input
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                    className="rounded border border-BLACK shadow-lg text-center"
                    type="text"
                    name="city"
                    id="city"
                    placeholder="city"
                  />
                  <input
                    onChange={(e) =>
                      setAddress({ ...address, state: e.target.value })
                    }
                    className="rounded border border-BLACK shadow-lg text-center"
                    type="text"
                    name="state"
                    id="state"
                    placeholder="state"
                  />
                </div>
              </div>
            </div>

            {authenticated ? (
              <div className="flex flex-col m-auto">
                <button
                  className="text-BLACK border-BLACK border w-[50vw] md:w-[20vw] bg-WHITE rounded m-auto justify-center text-center text-BLACK items-center flex hover:opacity-90 hover:border-BLACK hover:shadow-lg"
                  onClick={() => OrderHandle.sendOrder()}
                >
                  Create Order
                </button>
                <div className="text-BLACK w-full">
                  Delivering to
                  <div className="bg-WHITE h-[3vh] w-[80%] mb-2 m-auto text-BLACK rounded text-center">
                    {address.houseNumber} {address.street} {address.city}{' '}
                    {address.state}
                  </div>
                  {error}
                </div>
              </div>
            ) : (
              <div className="text-BLACK m-4 w-[95%] text-center flex justify-center items-center rounded-lg bg-GREY text-[0.8em]">
                Please Create an account and log in to create an order
              </div>
            )}
            <div className='bg-WHITE w-[50%] m-auto flex justify-center rounded mb-2'>
              <Pagination
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
                count={Math.ceil(cart.length / itemsPerPage)}
                page={currentPage}
                onChange={HandlePage.handleChangePage}
                variant="outlined"
              />              
            </div>

          </div>
        </div>
      </div>
  );
}

export default Cart;