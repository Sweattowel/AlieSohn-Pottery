import React, { useEffect, useState } from "react";
import { useMyContext } from "../../../Context/ContextProvider";
import axios from "axios";
import { Pagination } from "@mui/material";

function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number>(-1);
  const [
    ,
    ,
    ,
    ,
    authenticated,
    ,
    superAuthenticated,
    ,
  ] = useMyContext();
  const serverAddress = process.env.REACT_APP_SERVER_ADDRESS;
  const usersPerPage = 6;
  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  const [userCount, setUserCount] = useState(0);
  const ordersPerPage = 8;
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  const [orderCount, setOrderCount] = useState(0);

  // ORDER HANDLE 
  class OrderHandle 
  {
    // GET ORDERS
    static getOrders = async () => 
      {
        const choice = superAuthenticated ? 'sutoken' : authenticated ? 'token' : 'Null'
        const storedToken = getToken(choice);
        
        if (!storedToken){
            console.log('No authorization found');
            return;
        }
        console.log('Getting orders')
        try {
            const response = await axios.get(`${serverAddress}/api/orders/${selectedCustomer}`, {
                headers: {
                    Authorization: `Bearer ${storedToken}`
                }
            });
            if (response.status === 200) {
                const data = response.data;
                console.log(data)
                setOrders(data);
            } else if (response.status === 404) {
                console.log("No orders to collect");
            }
        } catch (error) {
            console.log(error);
        }
      };
    // COMPLETE ORDER
    static adjustOrder = async (orderID: number, NewItemState: number, itemID: number) => 
      {
        const choice = superAuthenticated ? 'sutoken' : authenticated ? 'token' : 'Null'
        const storedToken = getToken(choice);
        
        if (!storedToken){
          console.log('No authorization found');
          return;
        }
        try {
          if (!selectedCustomer) {
            return;
          }
          const response = await axios.post(`${serverAddress}/api/adjustOrder`, {
            userID: selectedCustomer,
            orderID: orderID,
            NewItemState: NewItemState,
            ItemID: itemID
          },       
          {
            headers: {
              authorization: `Bearer ${storedToken}`
            }
          });
          if (response.status === 200) {
            console.log("Successfully adjusted order to ", NewItemState)
            OrderHandle.getOrders();
          } else {
            console.log("Failed to set post");
          }
        } catch (error) {
          console.log(error);
        }
      };    
  }


  const getUsers = async () => 
  {
    const choice = superAuthenticated ? 'sutoken' : authenticated ? 'token' : 'Null'
    const storedToken = getToken(choice);
    
    if (!storedToken){
      console.log('No authorization found');
      return;
    }
    try {
      const response = await axios.post(`${serverAddress}/api/getUsers`, {},        
      {
        headers: {
          Authorization: `Bearer ${storedToken}`
        }
      });
      if (response.status === 200) {
        setUsers(response.data);
      } else {
        console.log("Failed to get users");
        setUsers([]);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // HANDLE PAGINATION
  class HandlePagination 
  {
    static handleChangeUsersPage = (
      event: React.ChangeEvent<unknown>,
      newPage: number
    ) => {
      setCurrentUsersPage(newPage);
    };  

    static handleChangeOrdersPage = (
      event: React.ChangeEvent<unknown>,
      newPage: number
    ) => {
      setCurrentOrdersPage(newPage);
    };
  }
  // TOKEN HANDLE
  function getToken(choice: string) 
  {
    if (choice === 'Null') return
    
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(`${choice}=`)) { // Corrected condition
        return cookie.substring(`${choice}=`.length); // Corrected substring index
      }
    }
    return null;
  }

  //////////////////////////////////////
  useEffect(() => {
    if (selectedCustomer !== -1) {
      OrderHandle.getOrders();
    }
    setCurrentOrdersPage(1);
  }, [selectedCustomer]);

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    //console.log("Orders:", orders);
    if (orders) {
      //console.log("Orders length:", orders.length);
      setOrderCount(orders.length);
    }
  }, [orders, currentOrdersPage]);
  
  useEffect(() => {
    //console.log("Users:", users);
    if (users) {
      //console.log("Users length:", users.length);
      setUserCount(users.length);
    }
  }, [users]);
  /////////////////////////////////////
  return (
    <div>
      {superAuthenticated ? (
          <div className="w-[40vw] h-full bg-WHITE text-WHITE mt-0.5 ml-0.5">
          <h1 className="bg-BACKGROUND text-center rounded mb-2 text-white h-[30px]">
            Orders
          </h1>
          {selectedCustomer === -1 ? (
            <div className="mt-2">
              {users
                .slice(
                  (currentUsersPage - 1) * usersPerPage,
                  currentUsersPage * usersPerPage
                )
                .map((user: any, index: number) => (
                  <button
                    key={index}
                    className="bg-WHITE text-BACKGROUND shadow-lg rounded mb-2 w-[80%] flex justify-center m-auto hover:text-BLACK hover:opacity-90 border-b-2 border-l-2 border border-BLACK"
                    onClick={() => setSelectedCustomer(user.userID)}
                  >
                    {user.userName}
                  </button>
                ))}{" "}
            </div>
          ) : (
            <button
              className="border flex border-BLACK text-BACKGROUND bg-WHITE shadow-lg rounded w-[80%] m-auto justify-center mb-2 hover:opacity-60"
              onClick={() => setSelectedCustomer(-1)}
            >
              BACK
            </button>
          )}
          {selectedCustomer === -1 ? (
            <Pagination
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
              }}
              count={Math.ceil(userCount / usersPerPage)}
              page={currentUsersPage}
              boundaryCount={0}
              siblingCount={1}
              onChange={HandlePagination.handleChangeUsersPage}
              variant="outlined"
            />
          ) : (
            <Pagination
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
              }}
              count={Math.ceil(orderCount / ordersPerPage)}
              page={currentOrdersPage}
              boundaryCount={0}
              siblingCount={1}
              onChange={HandlePagination.handleChangeOrdersPage}
              variant="outlined"
            />
          )}
    
          {selectedCustomer !== -1
            ? orders
                .slice(
                  (currentOrdersPage - 1) * ordersPerPage,
                  currentOrdersPage * ordersPerPage
                )
                .map((order: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center  justify-center text-center md:flex-row flex-col bg-BACKGROUND w-full h-[12rem] md:h-[3rem] rounded mt-1 mb-2 justify-center items-center"
                  >
                    <h1 className="w-full md:w-[20%]">
                      <>Item : {order.itemID}</>
                      <br />
                      <>Order {order.orderID}</>{" "}
                    </h1>
                    <h1 className="w-full md:w-[25%]">{order.itemName} </h1>
                    
                    <div className="w-full md:w-[25%] bg-WHITE text-BACKGROUND border border-BLACK h-[80%]shadow-lg hover:opacity-60 rounded text-center justify-center items-center flex">
                      {order.itemState == 0 || order.itemState > 3 ? ("ERROR") : ("")}
                      {order.itemState == 1 ? ("PENDING") : ("")}
                      {order.itemState == 2 ? ("COMPLETE") : ("")}
                      {order.itemState == 3 ? ("DELETED") : ("")}
                    </div>
                    <div className="flex flex-col md:flex-row h-[50%] w-full md:w-[25%] ml-1">
                      <button
                        onClick={async () => {
                          if (order.itemState === 0) return
                          await OrderHandle.adjustOrder(order.orderID, 0, order.itemID);
                          OrderHandle.getOrders();
                        }}
                        className="text-[0.5rem] bg-WHITE text-BLACK border-BLACK border h-full w-[80%] m-auto md:w-[25%] rounded shadow-lg"
                    >
                      REMOVE
                    </button>
                    <button
                        onClick={async () => {
                          if (order.itemState === 1) return
                          await OrderHandle.adjustOrder(order.orderID, 1, order.itemID);
                          OrderHandle.getOrders();
                        }}
                        className="text-[0.5rem] bg-WHITE text-BLACK border-BLACK border h-full w-[80%] m-auto md:w-[25%] rounded shadow-lg"
                    >
                      PEND
                    </button>
                    <button
                        onClick={async () => {
                          if (order.itemState === 2) return
                          await OrderHandle.adjustOrder(order.orderID, 2, order.itemID);
                          OrderHandle.getOrders();
                        }}
                        className="text-[0.5rem] bg-WHITE text-BLACK border-BLACK border h-full w-[80%] m-auto md:w-[25%] rounded shadow-lg"
                    >
                      COMP
                    </button>
                    <button
                        onClick={async () => {
                          if (order.itemState === 3) return
                          await OrderHandle.adjustOrder(order.orderID, 3, order.itemID);
                          OrderHandle.getOrders();
                        }}
                        className="text-[0.5rem] bg-WHITE text-BLACK border-BLACK border h-full w-[80%] m-auto md:w-[25%] rounded shadow-lg"
                    >
                      DEL
                    </button>
                    </div>
                    
                  </div>
                ))
            : null}
        </div>
      ) : (
        <div className="bg-BACKGROUND text-center">
          no access
        </div>
      )}
    </div>
    
  );
}

export default Orders;
