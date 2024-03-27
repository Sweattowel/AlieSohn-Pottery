import React, { useEffect, useState } from "react";
import { useMyContext } from "../../Context/ContextProvider";
import { Button, Pagination } from "@mui/material";
import url from "url";
import axios from "axios";
import CardHandle from "./Dependencies/CardHandle";

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
    setShowCardHandle(true); // Show card handling component when "Create Order" is clicked
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
      const response = await axios.post(`${serverAddress}/api/createOrder`, {
        userID,
        userName,
        itemIDs,
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
      <div className="flex rounded h-[10vh]">
        <h1 className="flex m-auto rounded w-[40%] text-center justify-center items-center bg-BACKGROUND">
          Total cost: ${totalCost.toFixed(2)} Item count: {itemCount} items
          <br />
        </h1>
        {authenticated ? (
          <button
            className="border-BLACK border w-[20vw] bg-BACKGROUND rounded m-auto justify-center text-center items-center flex hover:opacity-90 hover:text-BLACK hover:border-BLACK"
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
      <div className="flex flex-wrap justify-center">
        {currentItems.length > 0 ? (
          currentItems.map((item: CartItem, index: number) => (
            <div
              key={index}
              className="border-WHITE border text-BLACK w-[20%] h-[40vh] min-w-44 p-2 mt-2 ml-2 mb-20"
            >
              <div className="mr-2">
                <div className="text-center text-[1em] text-WHITE font-serif bg-BACKGROUND rounded">
                  {item.itemName}
                </div>
                <div className="text-center text-[0.8em]">
                  ${(item.itemPrice * item.itemCount).toFixed(2)} For{" "}
                  {item.itemCount} item/s
                </div>
                <div className="w-[80%] m-auto text-center">
                  <br />
                </div>
              </div>
              <img
                className="h-[60%] border-BLACK border-2"
                style={{ maxHeight: "55%", maxWidth: "90%", margin: "auto" }}
                src={url.resolve(serverAddress, item.imagePath)}
                alt={item.itemName}
                onError={() =>
                  console.error(`Image not found: ${item.imagePath}`)
                }
              />
              <div className="flex m-auto mt-2 justify-center text-center text-WHITE text-[0.8em] rounded w-[80%]">
                <button
                  className="rounded bg-BACKGROUND mr-1 hover:text-BLACK hover:opacity-90 w-[50%] shadow-lg"
                  onClick={() => removeFromCart(item.itemID, index)}
                >
                  Remove from cart
                </button>
                <button
                  onClick={() => increment(index)}
                  className="rounded w-[25%] hover:text-BLACK hover:opacity-70 bg-BACKGROUND mr-1 shadow-lg"
                >
                  ++
                </button>
                <button
                  onClick={() => decrement(index)}
                  className="rounded w-[25%] hover:text-BLACK hover:opacity-70 bg-BACKGROUND shadow-lg "
                >
                  --
                </button>
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
    </div>
  );
}

export default Cart;
