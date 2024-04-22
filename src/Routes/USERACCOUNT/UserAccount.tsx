import React, { useEffect, useState } from "react";
import { useMyContext } from "../../Context/ContextProvider";
import axios from "axios";
import { MenuItem, Pagination, Select } from "@mui/material";

export default function UserAccount() {
  const serverAddress = process.env.REACT_APP_SERVER_ADDRESS;
  const [
    ,
    ,
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
  const [orders, setOrders] = useState<any[]>([]);
  const [originalOrders, setOriginalOrders] = useState<any[]>([]);
  const ordersPerPage = 15;
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  const [orderCount, setOrderCount] = useState(0);
  const [groupSettingChoice, setGroupSettingChoice] = useState(1)

  class OrderHandle
  {
    // GET ORDERS
    static getOrders = async () => 
      {
        const choice = superAuthenticated ? 'sutoken' : authenticated ? 'token' : 'Null'
        const storedToken = getToken(choice);
        
        try {
            const response = await axios.get(`${serverAddress}/api/orders/${userID}`, {
                headers: {
                    Authorization: `Bearer ${storedToken}`
                }
            });
            if (response.status === 200) {
                const data = response.data;
                setOrders(data);
                setOriginalOrders(data); 
                setOrderCount(data.length);
            } else if (response.status === 404) {
                console.log("No orders to collect");
            } else if (response.status === 401) {
                console.log('Unauthorized')
            }
        } catch (error) {
            console.log(error);
        }
    }; 
    // CHANGE ORDER ORDERING
    static sortDate = (choice: any) => 
      {
      let sortedOrders = [...originalOrders]; // Use the original orders data for sorting/grouping

      if (choice === 1) {
        setGroupSettingChoice(1)
        sortedOrders.sort(
          (a, b) =>
            new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
        );
      } else if (choice === 2) {
        setGroupSettingChoice(2)
        sortedOrders.sort(
          (a, b) =>
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
      } else if (choice === 3) {
        const items: any = {};
        setGroupSettingChoice(3)
        for (let i = 0; i < originalOrders.length; i++) {
          const currentOrder = originalOrders[i];
          if (!currentOrder) {
            console.error(`Invalid order at index ${i}:`, currentOrder);
            continue; // Skip this iteration and continue to the next one
          }
          const itemID = currentOrder.itemID;
          if (!items[itemID]) {
            items[itemID] = {
              itemID: itemID,
              itemName: currentOrder.itemName,
              count: 0,
            };
          }
          items[itemID].count++;
        }

        // Convert items object back into an array
        sortedOrders = Object.values(items);
      }

      setOrders(sortedOrders);
    };       
    // PAGINATION
    static handleChangeOrdersPage = (
      event: React.ChangeEvent<unknown>,
      newPage: number
    ) => {
      setCurrentOrdersPage(newPage);
    };
  }

  function getToken(choice: string) 
  {
    if (choice == 'Null') return
    
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(`${choice}=`)) { // Corrected condition
        return cookie.substring(`${choice}=`.length); // Corrected substring index
      }
    }
    return null;
  }
  // useEffect to fetch orders when component mounts
  useEffect(() => {
    OrderHandle.getOrders();
  }, []);

  return (
    <div className="w-[55%] m-auto h-[120vh] text-WHITE rounded-lg justify-center">
      <div className="bg-WHITE py-2 justify-center">
        <h1 className="justify-center text-center w-[50%] m-auto rounded font-serif text-2xl">
          <div className="bg-BACKGROUND rounded-t">
            User: {userName || "N/a"} History
          </div>
        </h1>
        <div className="rounded-b w-[50%] m-auto bg-BACKGROUND text-WHITE mt-1 mb-1 flex justify-center items-center">
          Group by?
        </div>
        <div className="rounded-b w-[50%] m-auto text-WHITE mt-1 mb-1 flex justify-center items-center">
          
            <button className={ groupSettingChoice == 1 ? "bg-BACKGROUND w-[33%] opacity-90 hover:opacity-80 hover:text-BLACK" : "bg-BACKGROUND w-[33%] hover:opacity-80 hover:text-BLACK"} onClick={() => OrderHandle.sortDate(1)} >DESC</button>
            <button className={ groupSettingChoice == 2 ? "bg-BACKGROUND w-[33%] opacity-90 hover:opacity-80 hover:text-BLACK" : "bg-BACKGROUND w-[33%] hover:opacity-80 hover:text-BLACK"} onClick={() => OrderHandle.sortDate(2)} >ASC</button>
            <button className={ groupSettingChoice == 3 ? "bg-BACKGROUND w-[33%] opacity-90 hover:opacity-80 hover:text-BLACK" : "bg-BACKGROUND w-[33%] hover:opacity-80 hover:text-BLACK"} onClick={() => OrderHandle.sortDate(3)} >GRP</button>
          
        </div>
        <Pagination
          style={{
            justifyContent: "center",
            display: "flex",
            alignContent: "center",
          }}
          count={Math.ceil(orderCount / ordersPerPage)}
          page={currentOrdersPage}
          onChange={OrderHandle.handleChangeOrdersPage}
          variant="outlined"
        />
        {authenticated && !superAuthenticated
          ? orders
              .slice(
                (currentOrdersPage - 1) * ordersPerPage,
                currentOrdersPage * ordersPerPage
              )
              .map((order: any, index: number) => (
                <div
                  key={index}
                  className={
                    !order.completed
                      ? "m-2 flex text-white justify-center text-center hover:opacity-90 hover:text-BLACK"
                      : "opacity-60 m-2 flex  text-white justify-center text-center"
                  }
                >
                  <h1 className="bg-BACKGROUND  w-[25%] text-[0.7rem] md:text-lg">
                    Item ID : {order.itemID}{" "}
                  </h1>
                  <h1 className="bg-BACKGROUND  w-[25%] text-[0.7rem] md:text-m">
                    Item : {order.itemName}{" "}
                  </h1>
                  <h1 className="bg-BACKGROUND  w-[25%] text-[0.7rem] md:text-lg">
                    Completed : {order.completed ? "TRUE" : "FALSE"}{" "}
                  </h1>
                  {order.orderDate ? (
                    <h1 className="bg-BACKGROUND  w-[25%] text-[0.7rem] md:text-lg">
                      Date : {order.orderDate.split('T')[0]}
                    </h1>
                  ) : (
                    <div className="bg-BACKGROUND w-[25%] text-[0.7rem] md:text-lg"></div>
                  )}
                  {order.count && (
                    <h1 className="bg-BACKGROUND  w-[25%] text-[0.7rem] md:text-lg">
                      COUNT : {order.count}
                    </h1>
                  )}
                </div>
              ))
          : null}
      </div>
    </div>
  );
}
