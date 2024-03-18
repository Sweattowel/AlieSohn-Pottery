import React, { useEffect, useState } from "react";
import { useMyContext } from "../../Context/ContextProvider";
import axios from "axios";
import { Pagination } from "@mui/material";

export default function UserAccount() {
    const serverAddress = process.env.REACT_APP_SERVER_ADDRESS
    const [, ,cart, setCart, userID, setUserID, authenticated, setAuthenticated, superAuthenticated, setSuperAuthenticated, userName, setUserName] = useMyContext();
    const [orders, setOrders] = useState<any[]>([])
    const ordersPerPage = 15;
    const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
    const [orderCount, setOrderCount] = useState(0);

    const handleChangeOrdersPage = (
        event: React.ChangeEvent<unknown>,
        newPage: number
      ) => {
        setCurrentOrdersPage(newPage);
    };

    const getOrders = async () => {
      if (!authenticated){
        return
      }
        try {
          setOrders([])
          const response = await axios.post(`${serverAddress}/api/getOrders`, { userID: userID });
          if (response.status === 200) {
            let data = response.data
            setOrders(data)
            setOrderCount(data.length)
          } else if (response.status === 404) {
            console.log('No orders to collect');
          }
        } catch (error) {
          console.log(error);
        }
      };

      useEffect(() => {
        getOrders()
      },[])

      return (
        <div className="w-[80%] h-[80vh] m-auto text-WHITE rounded-lg justify-center">
          <div className="bg-WHITE py-2 justify-center">
            <h1 className="justify-center text-center w-[50%] m-auto rounded font-serif text-2xl bg-BACKGROUND"> User: {userName || 'N/a'} Order History:</h1>

            {authenticated && !superAuthenticated ? (
                orders.slice((currentOrdersPage - 1) * ordersPerPage, currentOrdersPage * ordersPerPage).map((order: any, index: number) => (
                <div key={index} className={ !order.completed ? "m-2 flex text-white justify-center text-center hover:opacity-90 hover:text-BLACK" : "opacity-60 m-2 flex  text-white justify-center text-center"}>
                    <h1 className="bg-BACKGROUND  w-[25%]">Item ID : {order.itemID} </h1>
                    <h1 className="bg-BACKGROUND  w-[25%]">Item : {order.itemName} </h1>
                    <h1 className="bg-BACKGROUND  w-[25%]">Completed : {order.completed ? 'TRUE' : "FALSE"} </h1>
                </div>
                ))
            ) : null}
          </div>
            <Pagination
                style={{ justifyContent: 'center', display: 'flex', alignContent: 'center' }}
                count={Math.ceil(orderCount / ordersPerPage)}
                page={currentOrdersPage}
                onChange={handleChangeOrdersPage}
                variant="outlined"
            />          
        </div>
      );
}