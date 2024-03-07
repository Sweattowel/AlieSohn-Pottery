import React, { useEffect, useState } from "react";
import { useMyContext } from "../../Context/ContextProvider";
import { Button, Pagination } from "@mui/material";
import url from "url";
import axios from "axios";

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
        i === index
          ? { ...item, itemCount: item.itemCount + 1 }
          : item
      )
    );
  };

  const decrement = (index: number) => {
    setCart((prevItems) =>
      prevItems.map((item, i) =>
        i === index
          ? { ...item, itemCount: Math.max(1, item.itemCount - 1 ) }
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
    setItemCount(cart.length);
  }, [cart]);  
  ///////////////////////////////////////////////////////////////////
  return (
    <div className="w-[80%] h-[90vh] m-auto">
      <div className="flex">
        <h1 className="ml-2 mt-5 mb-5 rounded w-[20%] text-center ">
          Total cost: ${totalCost}
          <br />
          Item count: {itemCount} items
        </h1>
        {authenticated ? (
          <Button
            style={{
              color: "white",
              marginTop: "auto",
              marginBottom: "auto",
              marginLeft: "4em",
              width: "20%",
              height: "100%",
              border: "1px solid black",
            }}
            onClick={() => sendOrder()}
          >
            {" "}
            Create Order{" "}
          </Button>
        ) : (
          <div className="mt-[auto] mb-[auto] ml-[2em] h-[50px] w-[40%] flex justify-center items-center rounded-lg">
            Please Create an account and log in to create an order
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-center">
        {currentItems.length > 0 ? (
          currentItems.map((item: CartItem, index: number) => (
            <div key={index} className="w-[400px] h-[500px] p-2 mt-2 ml-2 ">
              <div className="mr-2">
                <div className="border-t-2 border-BLACK text-center">
                  ID: {item.itemID}
                </div>
                <div className="text-center">Name: {item.itemName}</div>
                <div className="mb-2 text-center">
                  Price: ${item.itemPrice * item.itemCount} For {item.itemCount} item/s
                </div>
                <div className="w-[90%] m-auto text-center">
                  <span className="border-b-BLACK border-b-2">
                    Description:
                  </span>
                  <br />
                  {item.itemDescription}
                </div>
              </div>
              <img
                className="h-[60%] border-BLACK border-2"
                style={{ maxHeight: "55%", maxWidth: "80%", margin: "auto" }}
                src={url.resolve(serverAddress, item.imagePath)}
                alt={item.itemName}
                onError={() =>
                  console.error(`Image not found: ${item.imagePath}`)
                }
              />
              <div className="flex m-auto bg-BACKGROUND mt-2 justify-center text-center border-b-2 border-BLACK w-[80%]">
                <button
                  className="w-[50%]"
                  onClick={() => removeFromCart(item.itemID, index)}
                >
                  Remove from cart
                </button>          
                <button onClick={() => increment(index)} className="w-[25%] border-l">
                  ++ 
                </button>      
                <button onClick={() => decrement(index)} className="w-[25%] border-l">
                  --
                </button> 
              </div>
  
            </div>
          ))
        ) : (
          <h1 className="ml-2 mt-5 mb-5 bg-gray-800 rounded w-[80%] ml-auto mr-auto h-[80%] flex justify-center text-center">
            <div className="mt-[15%] text-5xl">Buy some pots now</div>
          </h1>
        )}
      <Pagination
        style={{ position: 'absolute', bottom: '10%', display: "flex", justifyContent: "center" }}
        count={Math.ceil(itemCount / itemsPerPage)}
        page={currentPage}
        onChange={handleChangePage}
        variant="outlined"
      />        
      </div>

    </div>
  );
}

export default Cart;
