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
  const itemsPerPage = 4;
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
    <div className="w-[80%] h-[85vh] m-auto border-2 border-black bg-gray-500 text-gray-200">
      {currentItems.length > 0 ? (
        currentItems.map((item: storeItem, index: number) => (
          <div key={index} className="h-[20%] border p-2 m-2 flex bg-gray-600">
            <div className="mr-2">
              <div className="border-b-2 border-black">ID: {item.itemID}</div>
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
              </Button>
            </div>
            <img
              className="h-full border-black border-2"
              style={{ maxWidth: '50%'}}
              src={url.resolve(serverAddress, item.imagePath)}
              alt={item.itemName}
              onError={() => console.error(`Image not found: ${item.imagePath}`)}
            />
            <div className="border-black border-2 w-[200px] ml-[1%] text-center">
              <span className="border-b-black border-b-2">
                Description:
              </span>
              <br />
              {item.itemDescription}
            </div>
          </div>
        ))
      ) : (
        <h1 className="ml-2 mt-5 mb-5 bg-blue-800 rounded w-[100%] h-[80%] flex justify-center text-center">
          <div className="mt-[15%]">
            Store offline // experiencing difficulties please try again later
          </div>
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

export default StoreFront;
