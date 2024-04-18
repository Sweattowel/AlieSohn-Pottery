import React, { useEffect, useState } from "react";
import { useMyContext } from "../../../Context/ContextProvider";
import axios from "axios";
import { Button, Checkbox, Pagination } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number>(-1);
  const [
    cart,
    setCart,
    userID,
    setUserID,
    authenticated,
    setAuthenticated,
    superAuthenticated,
    setSuperAuthenticated,
  ] = useMyContext();
  const serverAddress = process.env.REACT_APP_SERVER_ADDRESS;

  const getOrders = async () => {
    const storedToken = localStorage.getItem('sutoken');
    if (!storedToken){
        console.log('No authorization found');
        return;
    }

    try {
        const response = await axios.get(`${serverAddress}/api/orders/${selectedCustomer}`, {
            headers: {
                Authorization: `Bearer ${storedToken}`
            }
        });
        if (response.status === 200) {
            const data = response.data;
            setOrders(data);
        } else if (response.status === 404) {
            console.log("No orders to collect");
        }
    } catch (error) {
        console.log(error);
    }
};

  const getUsers = async () => {
    const storedToken = localStorage.getItem('sutoken');
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

  //////////////////////////////////////
  const usersPerPage = 6;
  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  const [userCount, setUserCount] = useState(0);

  const handleChangeUsersPage = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setCurrentUsersPage(newPage);
  };
  //////////////////////////////////////
  const ordersPerPage = 8;
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  const [orderCount, setOrderCount] = useState(0);

  const handleChangeOrdersPage = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setCurrentOrdersPage(newPage);
  };
  //////////////////////////////////////
  const completeOrder = async (orderID: number, decision: boolean) => {
    const storedToken = localStorage.getItem('sutoken');
    if (!storedToken){
      console.log('No authorization found');
      return;
    }
    try {
      if (!selectedCustomer) {
        return;
      }
      const response = await axios.post(`${serverAddress}/api/completeOrder`, {
        userID: selectedCustomer,
        orderID: orderID,
        completed: decision,
      },       
      {
        headers: {
          authorization: `Bearer ${storedToken}`
        }
      });
      if (response.status === 200) {
        decision
          ? console.log("Successfully completed order")
          : console.log("Successfully rewrote order");
        getOrders();
      } else {
        console.log("Failed to set post");
      }
    } catch (error) {
      console.log(error);
    }
  };

  //////////////////////////////////////
  useEffect(() => {
    if (selectedCustomer !== -1) {
      getOrders();
    }
    setCurrentOrdersPage(1);
  }, [selectedCustomer]);

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    console.log("Orders:", orders);
    if (orders) {
      console.log("Orders length:", orders.length);
      setOrderCount(orders.length);
    }
  }, [orders, currentOrdersPage]);
  
  useEffect(() => {
    console.log("Users:", users);
    if (users) {
      console.log("Users length:", users.length);
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
              onChange={handleChangeUsersPage}
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
              onChange={handleChangeOrdersPage}
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
                    className={
                      !order.completed
                        ? "m-2 flex bg-SELECTED text-WHITE justify-center text-center hover:text-BLACK hover:opacity-90 w-[40vw] text-[0.5rem] md:text-base items-center"
                        : "opacity-60 m-2 flex bg-BACKGROUND text-BLACK justify-center text-center items-center w-[40vw] text-[0.5rem] md:text-base"
                    }
                  >
                    <h1 className="w-[20%]">
                      <>Item : {order.itemID}</>
                      <br />
                      <>Order {order.orderID}</>{" "}
                    </h1>
                    <h1 className="w-[20%]">{order.itemName} </h1>
                    <h1 className="w-[20%]">{order.completed ? "SUCC" : "NOT"} </h1>
                    <button
                      onClick={() => {
                        completeOrder(
                          order.orderID,
                          !order.completed ? true : false
                        );
                      }}
                      className="w-[25%] bg-WHITE text-BACKGROUND border border-BLACK h-full w-[25%] shadow-lg hover:opacity-60"
                    >
                      {order.completed ? 
                      <CheckIcon /> : 
                      <ClearIcon />}
                    </button>
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
