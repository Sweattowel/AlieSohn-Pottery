import React, { useState, useEffect } from "react";
import { useMyContext } from "../../Context/ContextProvider";
import { Button, Pagination } from "@mui/material";
import axios from "axios";
import url from 'url'
//%%^$%
interface storeItem {
  itemID: number;
  itemName: string;
  itemPrice: number;
  imagePath: string;
  itemDescription: string;
}

function StoreFront() {
  const [ allItems, setAllItemscart, cart, setCart, userID, setUserID, authenticated, setAuthenticated, superAuthenticated, setSuperAuthenticated] = useMyContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemCount, setItemCount] = useState(0);
  const itemsPerPage = 8;
  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setCurrentPage(newPage);
  };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allItems.slice(indexOfFirstItem, indexOfLastItem);
  const [count, setCount] = useState<number>(0) //count of all items for use in left hand information
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const serverAddress =`${process.env.REACT_APP_SERVER_ADDRESS}`
  const [clickedItemIndex, setClickedItemIndex] = useState<number | null>(null); 
  const [selectedStoreItem, setSelectedStoreItem] = useState({
    itemID: -1,
    itemName: "",
    itemPrice: 0,
    imagePath: "",
    itemDescription: ""
  })

  const collectStoreItems = async () => {
    try {
      const response = await axios.post<storeItem[]>(`${serverAddress}/api/storeItems`);

      if (response.status === 200) {
        setAllItemscart(response.data);
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
    if (allItems.length === 0){
      collectStoreItems();
    }
    
  }, []);
  useEffect(() => {
    setItemCount(allItems.length);
  }, [allItems]);

  useEffect(() => {
    let totalCount = 0;
    let totalPrice = 0;
  
    cart.forEach((item) => {
      totalCount += item.itemCount;
      totalPrice += item.itemPrice * item.itemCount;
    });
  
    setCount(totalCount);
    setTotalPrice(totalPrice);
  }, [cart]); 

  useEffect(() => {
    const handleScroll = () => {
        setSelectedStoreItem({
            itemID: -1,
            itemName: "",
            itemPrice: 0,
            imagePath: "",
            itemDescription: ""
        });
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
}, []);
  ///////////////////////////////////////////
  return (
    <div className="w-[90%] m-auto text-white flex flex-wrap justify-center mb-20">

      {currentItems.length > 0 ? (
        currentItems.map((item: storeItem, index: number) => (
          <div key={index} className="border-WHITE border text-BLACK w-[20%] h-[40vh] min-w-44 p-2 mt-2 ml-2">
            
              <div className="text-center mb-2 font-serif text-[1em] bg-BACKGROUND rounded text-WHITE">{item.itemName}</div>            
           
            <img
              className="h-[60%] border-BLACK border-2"
              style={{ maxHeight: '55%', maxWidth: '90%', margin: 'auto'}}
              src={url.resolve(serverAddress, item.imagePath)}
              alt={item.itemName}
              onError={() => console.error(`Image not found: ${item.imagePath}`)}
              onClick={() => setSelectedStoreItem(item)}
            />
              <div className="mb-2 text-center">
                Price: ${item.itemPrice}
              </div>            
            <button
                className={ clickedItemIndex === index ? "flex m-auto bg-BACKGROUND mt-2 justify-center text-BLACK text-center w-[80%] rounded opacity-70 border-b-2 border-l-2 border border-BLACK" : "text-WHITE flex m-auto bg-BACKGROUND mt-2 justify-center text-center w-[80%] rounded hover:text-BLACK hover:opacity-90 border-b-2 border-l-2 border border-BLACK"}
                onClick={() => {
                  addToCart(
                    item.itemID,
                    item.itemName,
                    item.itemPrice,
                    item.imagePath,
                    item.itemDescription
                  );
                  setClickedItemIndex(index);
                  setTimeout(() => setClickedItemIndex(null), 500); // Reset after 1 second
                }}
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
      <div className="flex  m-auto mt-10 w-[60vw] h-[6vh]  text-center rounded  text-WHITE text-[0.7em] justify-center items-center">
        <div className="bg-BACKGROUND rounded w-[10vw]">
        Current Items in cart:
        <br /> 
            {count} item/s
            <br />
            ${totalPrice.toFixed(2)}
        </div> 
          <Pagination
            style={{display: "flex", justifyContent: "center", alignItems: 'center' }}
            count={Math.ceil(itemCount / itemsPerPage)}
            page={currentPage}
            onChange={handleChangePage}
            variant="outlined"
          />  
      </div>
      {selectedStoreItem.itemID !== -1 ? (
        <div className="fixed w-full h-full bg-WHITE top-0 left-0" style={{ backgroundColor: "rgba(255,255,255,0.9)" }} onClick={() => setSelectedStoreItem({
          itemID: -1,
          itemName: "",
          itemPrice: 0,
          imagePath: "",
          itemDescription: ""
        })}>
          <img
          style={{
            display: 'flex',
            margin:'auto',
            marginTop: '10vh',
            justifyContent: 'center',
            alignItems: 'center',
            width: '40vw',
            borderTopLeftRadius:'2%',
            borderTopRightRadius:'2%'
          }}
            src={url.resolve(serverAddress, selectedStoreItem.imagePath)}
          />

          <div className="bg-BACKGROUND m-auto text-center w-[40vw]">
            <h1 className="text-bold font-serif border-b border-WHITE w-[80%] m-auto">
              The {selectedStoreItem.itemName} for only ${selectedStoreItem.itemPrice}
            </h1>            
            {selectedStoreItem.itemDescription}
          </div>
        </div>        
      ) : (null)}

    </div>   
  );

}

export default StoreFront;
