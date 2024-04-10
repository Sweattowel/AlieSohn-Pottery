import { Button, Pagination } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useMyContext } from "../../../Context/ContextProvider";

interface storeItem {
  itemID: number;
  itemName: string;
  itemPrice: number;
  imagePath: string;
  itemDescription: string;
}
interface RemoveItemProps {
  storeItemID: number;
}
function Removeitem() {
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
  const serverAddress = process.env.REACT_APP_SERVER_ADDRESS;
  const [locked, setLocked] = useState(true);
  const [storeItems, setStoreItems] = useState<any[]>([]);
  // pagination handling
  const [currentPage, setCurrentPage] = useState(1);
  const [itemCount, setItemCount] = useState(0);
  const itemsPerPage = 8;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = storeItems.slice(indexOfFirstItem, indexOfLastItem);
  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setCurrentPage(newPage);
  };
  //
  const collectStoreItems = async () => {
    try {
      const response = await axios.post<storeItem[]>(
        `${serverAddress}/api/storeItems`
      );

      if (response.status === 200) {
        setStoreItems(response.data);
        setItemCount(response.data.length);
      } else if (response.status === 404) {
        console.log("No items available to purchase");
      } else {
        console.log("Internal Server Error");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const removeStoreItems = async ({ storeItemID }: RemoveItemProps) => {
    if (locked) {
      return;
    }
    const storedToken = localStorage.getItem('sutoken');
    if (!storedToken){
      console.log('No authorization found');
      return;
    }
    try {
      const response = await axios.post(`${serverAddress}/api/removeItem`, {
        storeItemID, 
      }, 
      {
        headers: {
          authorization: `Bearer ${storedToken}`
        }
      });
      if (response.status === 200) {
        console.log("Item successfully removed");
        collectStoreItems();
      } else if (response.status === 404) {
        console.log("Item does not exist");
      } else {
        console.log("Internal Server Error");
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    collectStoreItems();
  }, []);
  ///////////////////////////////////////////////////////////////////
  return (
    <div>
      {superAuthenticated ? (
      <div className="w-[40vw] h-[60vh] bg-WHITE text-WHITE">
      <div className="h-full mb-20">
        <h1 className="bg-BACKGROUND rounded text-WHITE text-center w-[100%] m-auto mb-2 h-[30px]">
          Remove store Item
        </h1>
        <button
          className={locked ? 'w-full text-BACKGROUND bg-BLACK border-BLACK border' : 'w-full text-BACKGROUND bg-WHITE border-BLACK border shadow-lg rounded'}
          onClick={() => setLocked(!locked)}
        >
          {locked ? "LOCKED" : "UNLOCKED"}
        </button>
        <div
          className={
            !locked
              ? "text-WHITE w-[80%] h-[70%] m-auto text-center mt-2"
              : "opacity-60 text-BLACK w-[80%] h-[70%] m-auto text-center mt-2"
          }
        >
          {currentItems.map((item: storeItem, index: number) => (
            <div key={index} className="bg-BACKGROUND m-auto flex items-center mb-1 text-[0.7rem] text-WHITE rounded border-b-2 border-BLACK hover:text-BLACK">
              <div className=" rounded justify-center flex w-[20%] h-full align-middle ">
                ID: {item.itemID}
              </div>
              <div className="w-[50%]">{item.itemName}</div>
              {locked ? (
                <button className="border border-BLACK hover:text-BLACK hover:opacity-60 bg-WHITE shadow-lg text-BACKGROUND w-full rounded-r">
                  Unlock to remove
                </button>
              ) : (
                <button
                  className="border border-BLACK hover:text-BLACK hover:opacity-60 bg-WHITE shadow-lg text-BACKGROUND w-full rounded-r"
                  onClick={() => removeStoreItems({ storeItemID: item.itemID })}
                >
                  Remove Item from store
                </button>
              )}
            </div>
          ))}
          <Pagination
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
            count={Math.ceil(itemCount / itemsPerPage)}
            page={currentPage}
            onChange={handleChangePage}
            variant="outlined"
          />
        </div>
      </div>
    </div>) : (<div className="bg-BACKGROUND text-center">no access</div>)}
    </div>
    
  );
}

export default Removeitem;
