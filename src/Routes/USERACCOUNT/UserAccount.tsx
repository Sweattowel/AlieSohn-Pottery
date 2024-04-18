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

  const handleChangeOrdersPage = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setCurrentOrdersPage(newPage);
  };

  const getOrders = async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken || storedToken == null){
        console.log('No authorization found');
        return;
    }
    console.log(storedToken)
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

  const sortDate = (choice: any) => {
    let sortedOrders = [...originalOrders]; // Use the original orders data for sorting/grouping

    if (choice === 1) {
      sortedOrders.sort(
        (a, b) =>
          new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
      );
    } else if (choice === 2) {
      sortedOrders.sort(
        (a, b) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      );
    } else if (choice === 3) {
      const items: any = {};

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

  // useEffect to fetch orders when component mounts
  useEffect(() => {
    getOrders();
  }, []);

  return (
    <div className="w-[55%] m-auto h-[120vh] text-WHITE rounded-lg justify-center">
      <div className="bg-WHITE py-2 justify-center">
        <h1 className="justify-center text-center w-[50%] m-auto rounded font-serif text-2xl">
          <div className="bg-BACKGROUND rounded-t">
            User: {userName || "N/a"} History
          </div>
        </h1>
        <div className="rounded-b w-[50%] m-auto text-BLACK mt-1 mb-1">
          <Select
            label="SORT BY"
            style={{
              width: "200px",
              height: "2rem",
              display: "flex",
              margin: "auto",
              backgroundColor: "beige",
            }}
          >
            <MenuItem onClick={() => sortDate(1)} >DATE DESC</MenuItem>
            <MenuItem onClick={() => sortDate(2)} >DATE ASC</MenuItem>
            <MenuItem onClick={() => sortDate(3)} >GROUP BY</MenuItem>
          </Select>
        </div>
        <Pagination
          style={{
            justifyContent: "center",
            display: "flex",
            alignContent: "center",
          }}
          count={Math.ceil(orderCount / ordersPerPage)}
          page={currentOrdersPage}
          onChange={handleChangeOrdersPage}
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
                  <h1 className="bg-BACKGROUND  w-[25%]">
                    Item ID : {order.itemID}{" "}
                  </h1>
                  <h1 className="bg-BACKGROUND  w-[25%]">
                    Item : {order.itemName}{" "}
                  </h1>
                  <h1 className="bg-BACKGROUND  w-[25%]">
                    Completed : {order.completed ? "TRUE" : "FALSE"}{" "}
                  </h1>
                  {order.orderDate ? (
                    <h1 className="bg-BACKGROUND  w-[25%]">
                      Date : {order.orderDate.split('T')[0]}
                    </h1>
                  ) : (
                    <div className="bg-BACKGROUND w-[25%]"></div>
                  )}
                  {order.count && (
                    <h1 className="bg-BACKGROUND  w-[25%]">
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
