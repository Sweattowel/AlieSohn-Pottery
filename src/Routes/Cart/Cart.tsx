import React, { useEffect, useState } from "react";
import { useMyContext } from "../../Context/ContextProvider";
import { Button, Pagination } from "@mui/material";
import url from 'url'
import axios from "axios";

interface CartItem {
  itemID: number;
  itemName: string;
  itemPrice: number;
  imagePath: string;
  itemDescription: string;
  itemCount: number
}

function Cart() {
  const [ cart, setCart, userID, setUserID, authenticated, setAuthenticated, superAuthenticated, setSuperAuthenticated, userName, setUserName ] = useMyContext()
  const serverAddress = `${process.env.REACT_APP_SERVER_ADDRESS}`

  const [totalCost, setTotalCost] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  function removeFromCart(id: number, deleteIndex: number) {
    setCart((prevItems) =>
      prevItems.filter((item, index) => item.itemID !== id || index !== deleteIndex)
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

  useEffect(() => {
    setTotalCost(0);
    cart.forEach((item) => setTotalCost((prevTotal) => prevTotal + parseFloat(item.itemPrice ) * item.itemCount));
    setItemCount(cart.length);
  }, [cart]);

  const sendOrder = async () => {
    console.log(cart)
    try {
      //const itemIDs = cart.map(item => item.itemID);
      const itemIDs = []
      for (let i = 0; i < cart.length; i++){
        for (let j = 0; j < cart[i].itemCount; j++){
          itemIDs.push(cart[i].itemID)
        }
      }
      const response = await axios.post(`${serverAddress}/api/createOrder`, { userID, userName, itemIDs } )

      if (response.status === 200){
        console.log('successful made order')
        setCart([])
      } else {
        console.log('Failed to make order')
      }
    } catch (error) {
      console.log(error)
    }
  }
///////////////////////////////////////////////////////////////////
  return (
    <div className="w-[80%] h-[85vh] m-auto border-2 border-black bg-gray-400 text-white">
      <div className="flex bg-SELECTED">
        <h1 className="ml-2 mt-5 mb-5 rounded w-[20%] text-center">
          Total cost: ${totalCost}
          <br />
          Item count: {itemCount} items
        </h1>
        {authenticated ? (
          <Button style={{ color: 'white', backgroundColor: '#dc2626', marginTop: 'auto', marginBottom: 'auto', marginLeft: '4em', width: '20%', height: '100%', border: '1px solid black'}} onClick={() => sendOrder()}> Create Order </Button> 
        ) : (
          <div className="mt-[auto] mb-[auto] ml-[2em] bg-gray-600 h-[50px] w-[40%] flex justify-center items-center rounded-lg">
            Please Create an account and log in to create an order
          </div>
        )}
        
      </div>

      {currentItems.length > 0 ? (
        currentItems.map((item: CartItem, index: number) => (
          <div
            key={index}
            className="h-[20%] border p-2 ml-2 mr-2 mb-2 flex bg-gray-600"
          >
            <div className="mr-2">
              <div className="border-b-2 border-black">ID: {item.itemID} | Quantity: {item.itemCount}</div>
              <div className="border-b-2 border-black">Name: {item.itemName}</div>
              <div className="border-b-2 border-black mb-2">
                Price: ${item.itemPrice}
              </div>
              <Button
                style={{
                  color: "white",
                  backgroundColor: "black",
                  border: "2px solid gray",
                  font: "1em",
                  height: "4em",
                  width: "10em",
                }}
                variant="outlined"
                onClick={() => removeFromCart(item.itemID, index)}
              >
                Remove from Cart
              </Button>
            </div>
            <img
              className="h-full border-black border-2"
              style={{ maxWidth: '50%'}}
              src={url.resolve(serverAddress, item.imagePath)}
              alt={item.itemName}
              onError={() => console.error(`Image not found: ${item.imagePath}`)}
            />
            <div className="flex-grow text-right mr-[20%] text-center">
              Description
              <br />
              {item.itemDescription}
            </div>
          </div>
        ))
      ) : (
        <h1 className="ml-2 mt-5 mb-5 bg-gray-800 rounded w-[80%] ml-auto mr-auto h-[80%] flex justify-center text-center">
          <div className="mt-[15%] text-5xl">Buy some pots now</div>
        </h1>
      )}
      <Pagination
        style={{ display: "flex", width: "100%", justifyContent: "center" }}
        count={Math.ceil(itemCount / itemsPerPage)}
        page={currentPage}
        onChange={handleChangePage}
        variant="outlined"
      />
    </div>
  );
}

export default Cart;
