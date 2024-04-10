import React, { useEffect, useState } from "react";
import { useMyContext } from "../../Context/ContextProvider";
import { Button, Pagination } from "@mui/material";
import url from "url";
import axios from "axios";
import CardHandle from "./Dependencies/CardHandle";
import InfoIcon from '@mui/icons-material/Info';
import './Dependencies/Cart.css'
import { AnimatePresence, motion } from "framer-motion";

interface CartItem {
  itemID: number;
  itemName: string;
  itemPrice: number;
  imagePath: string;
  itemDescription: string;
  itemCount: number;
}

function Cart() {
  const [
    allItems,
    setAllItems,
    cart,
    setCart,
    userID,
    setUserID,
    authenticated,
    setAuthenticated,
    superAuthenticated,
    setSuperAuthenticated,
    userName,
    setUserName,
  ] = useMyContext();
  const serverAddress = `${process.env.REACT_APP_SERVER_ADDRESS}`;
  const [showCardHandle, setShowCardHandle] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [error, setError] = useState('')

  function removeFromCart(id: number) {
    setCart((prevItems) =>
      prevItems.filter((item) => item.itemID !== id)
    );
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = cart.slice(indexOfFirstItem, indexOfLastItem);
  const [selectedStoreItem, setSelectedStoreItem] = useState({
    itemID: -1,
    itemName: "",
    itemPrice: 0,
    imagePath: "",
    itemDescription: "",
  });
  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setCurrentPage(newPage);
  };

  const sendOrder = async () => {
    if (cart.length == 0){
      console.log('No items in cart')
      return
    }
    setShowCardHandle(true); 
  };

  const handleCardConfirm = () => {
    setShowCardHandle(false); // Hide card handling component on confirmation
    createOrder(); // Proceed with creating the order
  };
  const createOrder = async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken){
      console.log('No authorization found');
      return;
    }
  
    try {
      const itemIDs = [];
      for (let i = 0; i < cart.length; i++) {
        for (let j = 0; j < cart[i].itemCount; j++) {
          itemIDs.push(cart[i].itemID);
        }
      }
      const orderDate = new Date();
      const response = await axios.post(
        `${serverAddress}/api/createOrder`,
        {
          userID,
          userName,
          itemIDs,
          orderDate
        },
        {
          headers: {
            Authorization: `Bearer ${storedToken}`
          }
        }
      );
  
      if( response.status === 401 ){
        console.log('Unauthorized, please log in')
        setError('Unauthorized, please log in')
      } else if (response.status === 200) {
        console.log("Successfully made order");
        setCart([]);
      } else {
        console.log("Failed to make order");
      }
    } catch (error) {
      setError('Unauthorized, please relog')
    }
  };
  
  // decrement and increment the specified item's amount
  const increment = (id: number) => {
    setCart((prevItems) =>
      prevItems.map((item, i) =>
        item.itemID === id ? { ...item, itemCount: item.itemCount + 1 } : item
      )
    );
  };

  const decrement = (id: number) => {
    setCart((prevItems) =>
      prevItems.map((item, i) =>
        item.itemID === id
          ? { ...item, itemCount: Math.max(1, item.itemCount - 1) }
          : item
      )
    );
  };

  const [confirmationMessages, setConfirmationMessages] = useState<{ index: number; id: number, type: string }[]>([]);

///////////////////////////////////////////////////////////////////////
useEffect(() => {
  let totalCost = 0;
  let itemCount = 0;

  cart.forEach((item) => {
    totalCost += parseFloat(item.itemPrice) * item.itemCount;
    itemCount += item.itemCount;
  });
  setCurrentPage(currentPage)
  setTotalCost(totalCost);
  setItemCount(itemCount);
}, [cart]);
  
  ///////////////////////////////////////////////////////////////////
  return (
    <div className="w-[90vw] h-full m-auto mb-20">
      <div className="flex rounded-b h-[10vh] bg-BACKGROUND">
        <h1 className="flex m-auto rounded w-[40%] text-center text-WHITE justify-center items-center bg-BACKGROUND">
          Total cost: ${totalCost.toFixed(2)} Item count: {itemCount} items
          <br />
          {error}
        </h1>
        {authenticated ? (
          <button
            className="text-BLACK border-BLACK border w-[20vw] bg-WHITE rounded m-auto justify-center text-center text-BACKGROUND items-center flex hover:opacity-90 hover:border-BLACK hover:shadow-lg"
            onClick={() => sendOrder()}
          >
            Create Order
          </button>
        ) : (
          <div className="text-WHITE mt-[auto] mb-[auto] ml-[1em] h-[50px] w-[40vw] text-center flex justify-center items-center rounded-lg bg-BACKGROUND text-[0.8em]">
            Please Create an account and log in to create an order
          </div>
        )}
      </div>
      <div className="w-[90%] m-auto text-white flex flex-wrap justify-center mb-20">
        {currentItems.length > 0 ? (
          currentItems.map((item: CartItem, index: number) => (
            <div
              key={index}
              className="border-WHITE border text-BLACK w-[20vw] h-[40vh] md:h-[60vh] min-w-40 mt-1 ml-1 bg-BACKGROUND rounded flex flex-col mb-14 hover:shadow-2xl"
            >
            <div className="flex items-center font-serif text-[1em] bg-BACKGROUND rounded-t text-WHITE h-[13%] md:h-[5%]">
              <span className="relative left-2 hover:opacity-90">
                <InfoIcon               
                  onClick={() => setSelectedStoreItem(item)}
                />
              </span>            
              <div className="flex-grow text-center justify-center items-center flex">
                {item.itemName}
              </div>
            </div>
              <div className="text-center text-[0.8em] text-WHITE">
                ${(item.itemPrice * item.itemCount).toFixed(2)} For {item.itemCount} item/s
              </div>
              <img
                className="w-full border-BLACK border-b border-t h-[60%] md:h-[80%] bg-WHITE"
                src={url.resolve(serverAddress, item.imagePath)}
                alt={item.itemName}
                onError={() => console.error(`Image not found: ${item.imagePath}`)}
              />
             <div className="flex items-center justify-center text-center text-BACKGROUND bg-BACKGROUND flex-grow text-[0.6em] md:text-[0.7em] w-[90%] m-auto relative">
              <button
                onClick={() => {
                  removeFromCart(item.itemID);
                  setConfirmationMessages(prev => [...prev, { index, id: Date.now(), type: 'Removed' }]);
                  setTimeout(() => setConfirmationMessages(prev => prev.filter(msg => msg.id !== prev[0]?.id)), 2000);
                }}
                className="border rounded bg-WHITE mr-1 hover:opacity-90 flex-grow shadow-lg border border-BLACK"
              >
                Remove from cart
              </button>
              <button
                onClick={() => {
                  increment(item.itemID);
                  setConfirmationMessages(prev => [...prev, { index, id: Date.now(), type: '+' }]);
                  setTimeout(() => setConfirmationMessages(prev => prev.filter(msg => msg.id !== prev[0]?.id)), 2000);
                }}
                className="border rounded hover:opacity-70 flex-grow bg-WHITE mr-1 shadow-lg border border-BLACK"
              >
                ++
              </button>
              <button
                onClick={() => {
                  decrement(item.itemID);
                  setConfirmationMessages(prev => [...prev, { index, id: Date.now(), type: '-' }]);
                  setTimeout(() => setConfirmationMessages(prev => prev.filter(msg => msg.id !== prev[0]?.id)), 2000);
                }}
                className="border rounded hover:opacity-70 flex-grow bg-WHITE shadow-lg border border-BLACK"
              >
                --
              </button>
              {confirmationMessages.map((msg, i) => {
                const itemCount = cart.find(item => item.itemID === currentItems[msg.index].itemID)?.itemCount;
                return msg.index === index && (
                  <div key={msg.id} className="absolute top-0 right-0 text-WHITE p-1 rounded animate-floatAway">
                    {msg.type}{msg.type !== 'Removed' && itemCount} 
                  </div>
                );
              })}
            </div>
            </div>
          ))
          
        ) : (
          <h1 className="ml-2 mt-5 mb-5 text-BLACK rounded w-[80%] ml-auto mr-auto h-[80%] flex justify-center text-center">
            <div className="mt-[15%]">
              <h1 className="text-5xl font-serif">Empty Cart</h1>
              <div className="mt-8 border-b-2">
                To fill your cart please head to the storefront located at the
                top right
              </div>
            </div>
          </h1>
        )}
        {showCardHandle && (
          <CardHandle onConfirm={handleCardConfirm} onCancel={() => setShowCardHandle(false)} />
        )}
        
        <Pagination
          style={{
            position: "fixed",
            bottom: "10%",
            display: "flex",
            justifyContent: "center",
          }}
          count={Math.ceil(cart.length / itemsPerPage)}
          page={currentPage}
          onChange={handleChangePage}
          variant="outlined"
        />
      </div>
      <AnimatePresence>
        {selectedStoreItem.itemID != -1 && (
          <motion.div 
            className="fixed top-0 left-[10%] w-[80%] h-full m-auto justify-center flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-BACKGROUND p-4 rounded shadow-lg text-WHITE"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              transition={{ duration: 0.3 }}
            >        
              <img className="w-full border-BLACK border  h-[60vh] md:h-[70vh] bg-WHITE" src={url.resolve(serverAddress, selectedStoreItem.imagePath)} />
              <motion.h2 className="justify-center w-[80%] m-auto flex items-center text-2xl border-b border-BLACK">
                {selectedStoreItem.itemName}
              </motion.h2>
              <motion.h5 className="justify-center w-[80%] m-auto flex items-center">
                {selectedStoreItem.itemDescription}
              </motion.h5>

              <motion.button 
                className="flex rounded bg-WHITE text-BACKGROUND justify-center m-auto w-[20%] hover:opacity-90 border border-BLACK" 
                onClick={() => setSelectedStoreItem({
                  itemID: -1,
                  itemName: "",
                  itemPrice: 0,
                  imagePath: "",
                  itemDescription: "",
                })}
              >
                Close
              </motion.button>            

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Cart;
