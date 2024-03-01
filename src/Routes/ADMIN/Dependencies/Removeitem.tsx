import { Button, Pagination } from "@mui/material";
import axios from "axios"
import React, { useEffect, useState } from "react"

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
function Removeitem(){
    const serverAddress = process.env.REACT_APP_SERVER_ADDRESS
    const [locked, setLocked ] = useState(true)
    const [storeItems, setStoreItems] = useState<any[]>([])    
    // pagination handling
    const [currentPage, setCurrentPage] = useState(1);
    const [itemCount, setItemCount] = useState(0);    
    const itemsPerPage = 5;    
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
          const response = await axios.post<storeItem[]>(`${serverAddress}/api/storeItems`);
    
          if (response.status === 200) {
            setStoreItems(response.data);
            setItemCount(response.data.length)
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
        if (locked){
            return
        }
        try {
            const response = await axios.post(`${serverAddress}/api/removeItem`, {storeItemID})
            if (response.status === 200){
                console.log('Item successfully removed')
                collectStoreItems()
            } else if (response.status === 404) {
                console.log('Item does not exist')
            } else {
                console.log('Internal Server Error')
            }
            
        } catch (error) {
            console.log(error)
        }
    }
useEffect(() => {
    collectStoreItems()
}, [])
///////////////////////////////////////////////////////////////////
    return (
        <div className="ml-auto w-[80%] h-[50%]">
            <div className="bg-gray-400 mr-auto h-full border-r-1 border-l-2 border-t-2 border-b-2 border-black">
                <h1 className="text-center bg-gray-600 border-black mb-2 text-white h-[30px]" >
                                Remove store Item
                </h1>
                <Button style={ locked ?  { color: 'white', backgroundColor: 'black', width: '100%'} : {color: 'black', backgroundColor: 'white', width: '80%', margin: 'auto', display: 'flex'}} variant="outlined" onClick={() => setLocked(!locked)}>
                    {locked ? ('LOCKED') : ("UNLOCKED")}
                </Button>
                <div className={ !locked ? "text-white w-[80%] h-[80%] m-auto text-center" : "opacity-60 text-grey w-[80%] h-[80%] m-auto text-center"}>
                    {currentItems.map((item: storeItem, index: number) => (
                        <div className="w-[80%] m-auto flex items-center border-black border-2">
                                <div className="bg-gray-800 items-center text-center flex w-[20%] h-[50px]">
                                    {item.itemID}
                                </div>
                                <div className="w-[50%] text-black">
                                    {item.itemName}
                                </div>       
                                {locked ? (
                                <Button variant="outlined" style={{color: 'black', width: '25%', fontSize: 9, backgroundColor: 'grey'}}>
                                    Remove Item from store    
                                </Button>  
                                ) : (
                                <Button variant="outlined" style={{color: 'black', width: '25%', fontSize: 9, backgroundColor: 'grey'}} onClick={() => removeStoreItems({storeItemID: item.itemID})}>
                                    Remove Item from store    
                                </Button> 
                                )}                   
                        </div>

                    ))}
                </div>
                <Pagination
                    style={{ display: "flex", width: "100%", justifyContent: "center" }}
                    count={Math.ceil(itemCount / itemsPerPage)}
                    page={currentPage}
                    onChange={handleChangePage}
                    variant="outlined"
                />                
            </div>

        </div>
    )
}

export default Removeitem