import React, { useState, useEffect } from "react";
import { useMyContext } from "../../Context/ContextProvider";
import { Button, Pagination } from "@mui/material";
import axios from "axios";
import url from 'url'

interface storeItem {
  itemID: number;
  itemName: string;
  itemPrice: number;
  imagePath: string;
  itemDescription: string;
}

function StoreFront() {
  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemCount, setItemCount] = useState(0);
  const itemsPerPage = 3;
  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setCurrentPage(newPage);
  };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = storeItems.slice(indexOfFirstItem, indexOfLastItem);
  const [cart, setCart] = useMyContext();
  const serverAddress =`${process.env.REACT_APP_SERVER_ADDRESS}`


  const collectStoreItems = async () => {
    try {
      const response = await axios.post<storeItem[]>(`${serverAddress}/api/storeItems`);

      if (response.status === 200) {
        setStoreItems(response.data);
      } else if (response.status === 404) {
        console.log("No items available to purchase");
      } else {
        console.log("Internal Server Error");
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  function addToCart(
    itemID: number,
    itemName: string,
    itemPrice: number,
    imagePath: string,
    itemDescription: string
  ) {
    const existingItem = cart.find((item) => item.itemID === itemID);
    if (existingItem) {
      setCart((prevItems) =>
        prevItems.map((item) =>
          item.itemID === itemID
            ? { ...item, itemCount: item.itemCount + 1 }
            : item
        )
      );
    } else {
      setCart((prevItems) => [
        ...prevItems,
        { itemID, itemName, itemPrice, imagePath, itemDescription, itemCount: 1 },
      ]);
    }
  }
  
  ///////////////////////////////////////////
  useEffect(() => {
    collectStoreItems();
  }, []);
  useEffect(() => {
    setItemCount(storeItems.length);
  }, [storeItems]);
  ///////////////////////////////////////////
  return (
    <div className="w-[80%] h-[90vh] m-auto text-white flex wrap justify-center">
      {currentItems.length > 0 ? (
        currentItems.map((item: storeItem, index: number) => (
          <div key={index} className="w-[400px] h-[500px] p-2 mt-2 ml-2">
            <div className="mr-2">
              <div className="border-t-2 border-BLACK text-center">ID: {item.itemID}</div>
              <div className="text-center">Name: {item.itemName}</div>
              <div className="mb-2 text-center">
                Price: ${item.itemPrice}
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
              style={{ maxHeight: '55%', maxWidth: '80%', margin: 'auto'}}
              src={url.resolve(serverAddress, item.imagePath)}
              alt={item.itemName}
              onError={() => console.error(`Image not found: ${item.imagePath}`)}
            />
              <button
                className="flex m-auto bg-BACKGROUND mt-2 justify-center text-center border-b-2 border-BLACK w-[80%]"
                onClick={() =>
                  addToCart(
                    item.itemID,
                    item.itemName,
                    item.itemPrice,
                    item.imagePath,
                    item.itemDescription
                  )
                }
              >
                Add to cart
              </button>
          </div>
        ))
      ) : (
        <h1 className="mt-5 mb-5 bg-blue-800 rounded w-[100%] h-[80%] flex justify-center text-center">
          <div className="mt-[15%]">
            Store offline // experiencing difficulties please try again later
          </div>
        </h1>
      )}
      <Pagination
        style={{ position: 'absolute',bottom:'10%', width: '20%', display: "flex", justifyContent: "center" }}
        count={Math.ceil(itemCount / itemsPerPage)}
        page={currentPage}
        onChange={handleChangePage}
        variant="outlined"
      />  
    </div>   
  );

}

export default StoreFront;
