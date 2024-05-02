import React, { useEffect, useState } from 'react';
import { useMyContext } from '../../Context/ContextProvider';
import { Pagination } from '@mui/material';
import url from 'url';
import axios from 'axios';
import CardHandle from './Dependencies/CardHandle';
import InfoIcon from '@mui/icons-material/Info';
import './Dependencies/Cart.css';
import { AnimatePresence, motion } from 'framer-motion';

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
  const [selectedStoreItem, setSelectedStoreItem] = useState({
    itemID: -1,
    itemName: '',
    itemPrice: 0,
    imagePath: '',
    itemDescription: '',
  });
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
      setShowCardHandle(true);
    };
    // END PAYMENT
    static handleCardConfirm = () =>
    {
      setShowCardHandle(false); // Hide card handling component on confirmation
      OrderHandle.createOrder(); // Proceed with creating the order
    };
  }

  // CART HANDLE
  class CartHandle
  {
    // INCREMENTS ARE REDUNDANT AS DEFINED BY NEW REQUIREMENTS
    /*/ INCREMENT ITEMCOUNT BY 1
    static increment = (id: number) => {
      setCart((prevItems) =>
        prevItems.map((item, i) =>
          item.itemID === id ? { ...item, itemCount: item.itemCount + 1 } : item
        )
      );
    };
    // DECREMENT ITEMCOUNT BY 1
    static decrement = (id: number) => {
      setCart((prevItems) =>
        prevItems.map((item, i) =>
          item.itemID === id
            ? { ...item, itemCount: Math.max(1, item.itemCount - 1) }
            : item
        )
      );
    };
    */
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
    <div className='bg-LIGHT w-full h-full md:mt-0 mt-[5vh]'>
      <div className='bg-WHITE w-[90%] h-full flex flex-col m-auto justify-evenly shadow-lg'>
        <h1 className='text-LIGHT bg-DARK text-[2rem] text-center w-[60%] m-auto mb-5 mt-5 ring ring-HIGHLIGHT rounded font-serif'>
          My Cart
        </h1>
        <div className='flex md:flex-row flex-col shadow-lg w-full h-full justify-evenly mb-5'>
          <div className='md:w-[40%] w-full h-full shadow-lg'>
            <h1 className='text-LIGHT bg-HIGHLIGHT rounded text-[1.5rem] w-full text-center'>
              Your items:
            </h1>
            <div className='divide-y text-DARK h-[100vh]'>
              {currentItems.map((item: CartItem, index: number) => (
                <div className='h-[25vh] flex flex-row justify-evenly' key={index}>
                  <img className='shadow-lg h-[80%] w-[35%] flex justify-center m-auto' src={url.resolve(serverAddress, item.imagePath)} alt="storeItem" />
                  <div className='flex flex-col h-full w-[25%] text-center justify-center items-center'>
                    <div className='md:text-[1.25rem] text-[0.7rem] bg-HIGHLIGHT text-LIGHT p-2 rounded'>{item.itemName}</div>
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
                        className="border rounded bg-LIGHT mr-1 hover:opacity-90 flex-grow shadow-lg border border-BLACK p-2"
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
            </div>
          </div>
          <div className='md:w-[40%] w-full h-full shadow-lg bg-DARK text-center rounded'>
            <div>
              <div className="text-LIGHT">
                Enter Delivery location
                <div className="rounded h-[12vh] flex flex-col justify-center items-center text-BLACK">
                  <input
                    onChange={(e) =>
                      setAddress({ ...address, houseNumber: e.target.value })
                    }
                    className="rounded border border-BLACK shadow-lg text-center"
                    type="text"
                    name="houseNumber"
                    id="houseNumber"
                    placeholder="houseNumber"
                  />
                  <input
                    onChange={(e) =>
                      setAddress({ ...address, street: e.target.value })
                    }
                    className="rounded border border-BLACK shadow-lg text-center"
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
                  className="text-BLACK border-BLACK border w-[50vw] md:w-[20vw] bg-LIGHT rounded m-auto justify-center text-center text-HIGHLIGHT items-center flex hover:opacity-90 hover:border-BLACK hover:shadow-lg"
                  onClick={() => OrderHandle.sendOrder()}
                >
                  Create Order
                </button>
                <div className="text-LIGHT w-full">
                  Delivering to
                  <div className="bg-LIGHT h-[3vh] w-[80%] mb-2 m-auto text-BLACK rounded text-center">
                    {address.houseNumber} {address.street} {address.city}{' '}
                    {address.state}
                  </div>
                  {error}
                </div>
              </div>
            ) : (
              <div className="text-LIGHT m-auto mb-2 h-full w-[80%] text-center flex justify-center items-center rounded-lg bg-HIGHLIGHT text-[0.8em]">
                Please Create an account and log in to create an order
              </div>
            )}
            <div className='bg-LIGHT w-[50%] m-auto flex justify-center rounded mb-2'>
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

    </div>
  );
}

export default Cart;
/**
<div className='h-full bg-LIGHT'>
      <div className='bg-WHITE w-[90%] h-full m-auto shadow-lg'>
        <div className="flex rounded p-10 h-[50%] w-[40%] m-auto bg-DARK">
          <div className="rounded h-[80%] w-[80%] flex flex-col justify-center items-center m-auto bg-HIGHLIGHT">
            <h1 className="flex m-auto rounded w-full text-center text-LIGHT justify-center items-center bg-HIGHLIGHT flex-col">
              Total cost: ${totalCost.toFixed(2)} Item count: {itemCount} items
              <br />
              <div className="text-LIGHT">
                Enter Delivery location
                <div className="rounded h-[12vh] flex flex-col justify-center items-center text-BLACK">
                  <input
                    onChange={(e) =>
                      setAddress({ ...address, houseNumber: e.target.value })
                    }
                    className="rounded border border-BLACK shadow-lg text-center"
                    type="text"
                    name="houseNumber"
                    id="houseNumber"
                    placeholder="houseNumber"
                  />
                  <input
                    onChange={(e) =>
                      setAddress({ ...address, street: e.target.value })
                    }
                    className="rounded border border-BLACK shadow-lg text-center"
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
            </h1>
            {authenticated ? (
              <div className="flex flex-col m-auto">
                <button
                  className="text-BLACK border-BLACK border w-[50vw] md:w-[20vw] bg-LIGHT rounded m-auto justify-center text-center text-HIGHLIGHT items-center flex hover:opacity-90 hover:border-BLACK hover:shadow-lg"
                  onClick={() => OrderHandle.sendOrder()}
                >
                  Create Order
                </button>
                <div className="text-LIGHT w-full">
                  Delivering to
                  <div className="bg-LIGHT h-[3vh] text-BLACK rounded text-center">
                    {address.houseNumber} {address.street} {address.city}{' '}
                    {address.state}
                  </div>
                  {error}
                </div>
              </div>
            ) : (
              <div className="text-LIGHT mt-[auto] mb-[auto] ml-[1em] h-full w-[full] text-center flex justify-center items-center rounded-lg bg-HIGHLIGHT text-[0.8em]">
                Please Create an account and log in to create an order
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-[80%] h-[130vh] m-auto text-white flex flex-wrap justify-center mb-20">
          {currentItems.length > 0 ? (
            currentItems.map((item: CartItem, index: number) => (
              <div
                key={index}
                className="border-LIGHT border text-BLACK w-[20vw] h-[40vh] md:h-[60vh] min-w-40 mt-1 ml-1 bg-HIGHLIGHT rounded flex flex-col mb-14 hover:shadow-2xl"
              >
                <div className="flex items-center font-serif text-[1em] bg-HIGHLIGHT rounded-t text-LIGHT h-[13%] md:h-[5%]">
                  <span className="relative left-2 hover:opacity-90">
                    <InfoIcon onClick={() => setSelectedStoreItem(item)} />
                  </span>
                  <div className="flex-grow text-center justify-center items-center flex">
                    {item.itemName}
                  </div>
                </div>
                <div className="text-center text-[0.8em] text-LIGHT">
                  ${item.itemPrice.toFixed(2)}
                </div>
                <img
                  className="w-full border-BLACK border-b border-t h-[60%] md:h-[80%] bg-LIGHT"
                  src={url.resolve(serverAddress, item.imagePath)}
                  alt={item.itemName}
                  onError={() =>
                    console.error(`Image not found: ${item.imagePath}`)
                  }
                />
                <div className="flex items-center justify-center text-center text-HIGHLIGHT bg-HIGHLIGHT flex-grow text-[0.6em] md:text-[0.7em] w-[90%] m-auto relative">
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
                    className="border rounded bg-LIGHT mr-1 hover:opacity-90 flex-grow shadow-lg border border-BLACK"
                  >
                    {conflicts.includes(item.itemID) ? (
                      <>Please Remove from cart</>
                    ) : (
                      <>Remove from cart</>
                    )}
                  </button>

                  {confirmationMessages.map((msg, i) =>
                  {
                    return (
                      msg.index === index && (
                        <div
                          key={msg.id}
                          className="absolute top-0 right-0 text-LIGHT p-1 rounded animate-floatAway"
                        >
                          {msg.type}
                          {msg.type !== 'Removed'}
                        </div>
                      )
                    );
                  })}
                </div>

              </div>
            ))
          ) : (
            <h1 className="ml-2 mt-5 text-BLACK rounded w-[80%] ml-auto mr-auto flex justify-center text-center">
              <div className="mt-[10%]">
                <h1 className="text-5xl font-serif">Empty Cart</h1>
                <div className="mt-8 border-b-2">
                  To fill your cart please head to the storefront located at the
                  top right
                </div>
              </div>
            </h1>
          )}
          {showCardHandle && (
            <CardHandle
              onConfirm={OrderHandle.handleCardConfirm}
              onCancel={() => setShowCardHandle(false)}
            />
          )}
        </div>
        <AnimatePresence>
          {selectedStoreItem.itemID !== -1 && (
            <motion.div
              className="fixed top-0 left-[10%] w-[80%] h-full m-auto justify-center flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-HIGHLIGHT p-4 rounded shadow-lg text-LIGHT"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.5 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  alt={`${selectedStoreItem.imagePath}`}
                  className="w-full border-BLACK border  h-[60vh] md:h-[70vh] bg-LIGHT"
                  src={url.resolve(serverAddress, selectedStoreItem.imagePath)}
                />
                <motion.h2 className="justify-center w-[80%] m-auto flex items-center text-2xl border-b border-BLACK">
                  {selectedStoreItem.itemName}
                </motion.h2>
                <motion.h5 className="justify-center w-[80%] m-auto flex items-center">
                  {selectedStoreItem.itemDescription}
                </motion.h5>

                <motion.button
                  className="flex rounded bg-LIGHT text-HIGHLIGHT justify-center m-auto w-[20%] hover:opacity-90 border border-BLACK"
                  onClick={() =>
                    setSelectedStoreItem({
                      itemID: -1,
                      itemName: '',
                      itemPrice: 0,
                      imagePath: '',
                      itemDescription: '',
                    })
                  }
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
 */