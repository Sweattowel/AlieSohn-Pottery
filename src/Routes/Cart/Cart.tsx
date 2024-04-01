import React, { useEffect, useState } from "react";
import { useMyContext } from "../../Context/ContextProvider";
import { Button, Pagination } from "@mui/material";
import url from "url";
import axios from "axios";
import CardHandle from "./Dependencies/CardHandle";
import InfoIcon from '@mui/icons-material/Info';
import './Dependencies/Cart.css'

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

  function removeFromCart(id: number, deleteIndex: number) {
    setCart((prevItems) =>
      prevItems.filter(
        (item, index) => item.itemID !== id || index !== deleteIndex
      )
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
    console.log(cart);
    try {
      //const itemIDs = cart.map(item => item.itemID);
      const itemIDs = [];
      for (let i = 0; i < cart.length; i++) {
        for (let j = 0; j < cart[i].itemCount; j++) {
          itemIDs.push(cart[i].itemID);
        }
      }
      const orderDate = new Date()
      const response = await axios.post(`${serverAddress}/api/createOrder`, {
        userID,
        userName,
        itemIDs,
        orderDate
      });

      if (response.status === 200) {
        console.log("successful made order");
        setCart([]);
      } else {
        console.log("Failed to make order");
      }
    } catch (error) {
      console.log(error);
    }
  };
  // decrement and increment the specified item's amount
  const increment = (index: number) => {
    setCart((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, itemCount: item.itemCount + 1 } : item
      )
    );
  };

  const decrement = (index: number) => {
    setCart((prevItems) =>
      prevItems.map((item, i) =>
        i === index
          ? { ...item, itemCount: Math.max(1, item.itemCount - 1) }
          : item
      )
    );
  };

  const [confirmationMessages, setConfirmationMessages] = useState<{ index: number; id: number, type: string }[]>([]);

///////////////////////////////////////////////////////////////////////
  useEffect(() => {
    setTotalCost(0);
    cart.forEach((item) =>
      setTotalCost(
        (prevTotal) => prevTotal + parseFloat(item.itemPrice) * item.itemCount
      )
    );
    setItemCount(0);
    cart.forEach((item) =>
      setItemCount((prevTotal) => prevTotal + item.itemCount)
    );
  }, [cart]);
  ///////////////////////////////////////////////////////////////////
  return (
    <div className="w-[90vw] h-full m-auto mb-20">
      <div className="flex rounded-b h-[10vh] bg-BACKGROUND">
        <h1 className="flex m-auto rounded w-[40%] text-center justify-center items-center bg-BACKGROUND">
          Total cost: ${totalCost.toFixed(2)} Item count: {itemCount} items
          <br />
        </h1>
        {authenticated ? (
          <button
            className="border-BLACK border w-[20vw] bg-WHITE rounded m-auto justify-center text-center text-BACKGROUND items-center flex hover:opacity-90 hover:border-BLACK"
            onClick={() => sendOrder()}
          >
            Create Order
          </button>
        ) : (
          <div className="mt-[auto] mb-[auto] ml-[1em] h-[50px] w-[40vw] text-center flex justify-center items-center rounded-lg bg-BACKGROUND text-[0.8em]">
            Please Create an account and log in to create an order
          </div>
        )}
      </div>
      <div className="w-[90%] m-auto text-white flex flex-wrap justify-center mb-20">
        {currentItems.length > 0 ? (
          currentItems.map((item: CartItem, index: number) => (
            <div
              key={index}
              className="border-WHITE border text-BLACK w-[20vw] h-[40vh] md:h-[60vh] min-w-40 mt-1 ml-1 bg-BACKGROUND rounded flex flex-col mb-14"
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
                  removeFromCart(item.itemID, index);
                  setConfirmationMessages(prev => [...prev, { index, id: Date.now(), type: 'Removed' }]);
                  setTimeout(() => setConfirmationMessages(prev => prev.filter(msg => msg.id !== prev[0]?.id)), 2000);
                }}
                className="border rounded bg-WHITE mr-1 hover:opacity-90 flex-grow shadow-lg"
              >
                Remove from cart
              </button>
              <button
                onClick={() => {
                  increment(index);
                  setConfirmationMessages(prev => [...prev, { index, id: Date.now(), type: '++' }]);
                  setTimeout(() => setConfirmationMessages(prev => prev.filter(msg => msg.id !== prev[0]?.id)), 2000);
                }}
                className="border rounded hover:opacity-70 flex-grow bg-WHITE mr-1 shadow-lg"
              >
                ++
              </button>
              <button
                onClick={() => {
                  decrement(index);
                  setConfirmationMessages(prev => [...prev, { index, id: Date.now(), type: '--' }]);
                  setTimeout(() => setConfirmationMessages(prev => prev.filter(msg => msg.id !== prev[0]?.id)), 2000);
                }}
                className="border rounded hover:opacity-70 flex-grow bg-WHITE shadow-lg"
              >
                --
              </button>
              {confirmationMessages.map((msg, i) => msg.index === index && (
                <div key={msg.id} className="absolute top-0 right-0 mt-1 bg-white text-WHITE p-1 rounded animate-floatAway">
                  {msg.type}
                </div>
              ))}
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
      {selectedStoreItem.itemID !== -1 ? (
        <div
          className="fixed top-0 left-0 flex w-full h-full bg-WHITE items-center"
          style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
          onClick={() =>
            setSelectedStoreItem({
              itemID: -1,
              itemName: "",
              itemPrice: 0,
              imagePath: "",
              itemDescription: "",
            })
          }
        >
          <div className="m-auto w-[60%] md:w-[25%]">      
            <img
              className="flex m-auto w-[100%] rounded-t"
              src={url.resolve(serverAddress, selectedStoreItem.imagePath)}
            />
            <div className="bg-BACKGROUND m-auto text-center w-full rounded-b border-t border-BLACK">
              <h1 className="text-bold font-serif border-b border-WHITE w-[80%] m-auto">
                The {selectedStoreItem.itemName} for only ${selectedStoreItem.itemPrice}
              </h1>
              <div className="w-[90%] m-auto">
                {selectedStoreItem.itemDescription}
              </div>
              
            </div>   
          </div>
      </div>
      ) : null}
    </div>
  );
}

export default Cart;
