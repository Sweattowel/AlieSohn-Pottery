import React, { useEffect, useState } from "react";
import { useMyContext } from "../../../Context/ContextProvider";
import axios from "axios";
import { Button, Checkbox, Pagination } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number>(-1);
  const [cart, setCart, userID, setUserID, authenticated, setAuthenticated, superAuthenticated, setSuperAuthenticated] = useMyContext();
  const serverAddress = process.env.REACT_APP_SERVER_ADDRESS

  
  const getOrders = async () => {
    try {
      setOrders([])
      const response = await axios.post(`${serverAddress}/api/getOrders`, { userID: selectedCustomer });
      if (response.status === 200) {
        console.log('Response Data:', response.data);
        let data = response.data
        setOrders(data)

      } else if (response.status === 404) {
        console.log('No orders to collect');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getUsers = async () => {
    try {
      const response = await axios.post(`${serverAddress}/api/getUsers`);
      if (response.status === 200) {
        console.log('Response Data:', response.data);
        setUsers(response.data.data);
      } else {
        console.log('Failed to get users');
        setUsers([])
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
  useEffect(() => {
    if (selectedCustomer !== -1) {
      getOrders();  
    }
              
  }, [selectedCustomer]);

  useEffect(() => {
        getUsers();
  }, []);

  useEffect(() => {
        setOrderCount(orders.length);
  }, [orders, currentOrdersPage]);
  
useEffect(() => {
    setUserCount(users.length)
}, [users])
/////////////////////////////////////
  return (
    <div className="mr-auto w-[50%] h-full border-2 border-BLACK">
        <h1 className="text-center border-black mb-2 text-white h-[30px]" >
            Orders
        </h1>
      {selectedCustomer === -1 ? (
        <Pagination
            style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            }}
            count={Math.ceil(userCount / usersPerPage)}
            page={currentUsersPage}
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
            onChange={handleChangeOrdersPage}
            variant="outlined"
        />
        )}
       
      {selectedCustomer === -1 ? (
            users.slice((currentUsersPage - 1) * usersPerPage, currentUsersPage * usersPerPage).map((user: any, index: number) => (
            <Button style={
              { 
                margin: "8px", 
                borderBottom: "2px solid #000",
                color: "white",
                textAlign: "center",
                cursor: "pointer",
              }
            } onClick={() => setSelectedCustomer(user.userID)}>
              User {user.userName}
            </Button>
            )) 
        ) : (
            <Button
            className="m-2 border-2 border-BLACK text-white text-center"
            style={{ 
                display: 'flex',
                margin: "auto",
                marginTop: '10px', 
                border: "2px solid #000",
                color: "white",
                textAlign: "center",
                cursor: "pointer",
                width: '80%'
                          
            }}
            onClick={() => setSelectedCustomer(-1)}
            >
            BACK
            </Button>
        )}


      {selectedCustomer !== -1 ? (
        orders.slice((currentOrdersPage - 1) * ordersPerPage, currentOrdersPage * ordersPerPage).map((order: any, index: number) => (
          <div key={index} className={ !order.completed ? "m-2 flex bg-SELECTED text-white justify-center text-center" : "opacity-60 m-2 flex bg-SELECTED text-white justify-center text-center"}>
            <h1 className="border-BLACK border-2 w-[25%]">Item ID : {order.itemID} </h1>
            <h1 className="border-BLACK border-2 w-[25%]">Quantity : {order.quantity} </h1>
            <h1 className="border-BLACK border-2 w-[25%]">Completed : {order.completed ? 'TRUE' : "FALSE"} </h1>
            <Button style={{width: '25%', border: '1px solid black'}}>{ order.completed ? <CheckIcon /> : <ClearIcon />}</Button>
            
          </div>
        ))
      ) : null}
    </div>
  );
}

export default Orders;
