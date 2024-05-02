import React, { useEffect, useState } from "react";
import { useMyContext } from "../../Context/ContextProvider";
import axios from "axios";
import { Pagination } from "@mui/material";

export default function UserAccount()
{
  const serverAddress = process.env.REACT_APP_SERVER_ADDRESS;
  const [
    ,
    ,
    ,
    ,
    userID,
    ,
    authenticated,
    ,
    superAuthenticated,
    ,
    userName,
    ,
  ] = useMyContext();
  const [orders, setOrders] = useState<any[]>([]);
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
      if (choice === 1) {
        setGroupSettingChoice(1)
        setOrders(orders.sort(
          (a, b) =>
            new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
        ))
      } else if (choice === 2) {
        setGroupSettingChoice(2)
        setOrders(orders.sort(
          (a, b) =>
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        ));
      }
    };
    // PAGINATION
    static handleChangeOrdersPage = (
      event: React.ChangeEvent<unknown>,
      newPage: number
    ) =>
    {
      setCurrentOrdersPage(newPage);
    };
  }

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
  // useEffect to fetch orders when component mounts
  useEffect(() => 
  {
    OrderHandle.getOrders();
  }, []);

  return (
    <div className="w-[55%] m-auto h-[120vh] text-LIGHT rounded-lg justify-center mt-2">
      <div className="bg-DARK py-2 justify-center">
        <h1 className="justify-center text-center w-[50%] m-auto rounded font-serif text-2xl">
          <div className="bg-HIGHLIGHT rounded-t">
            User: {userName || "N/a"} History
          </div>
        </h1>
        <div className="rounded-b w-[50%] m-auto bg-HIGHLIGHT text-LIGHT mt-1 mb-1 flex justify-center items-center">
          Group by?
        </div>
        <div className="rounded-b w-[50%] m-auto text-LIGHT mt-1 mb-1 flex justify-center items-center">
          <button className={groupSettingChoice === 1 ? "bg-HIGHLIGHT w-[50%] opacity-90 hover:opacity-80 hover:text-BLACK border-BLACK border shadow-lg" : "bg-HIGHLIGHT w-[33%] hover:opacity-80 hover:text-BLACK border-BLACK border shadow-lg"} onClick={() => OrderHandle.sortDate(1)} >DESC</button>
          <button className={groupSettingChoice === 2 ? "bg-HIGHLIGHT w-[50%] opacity-90 hover:opacity-80 hover:text-BLACK border-BLACK border shadow-lg" : "bg-HIGHLIGHT w-[33%] hover:opacity-80 hover:text-BLACK border-BLACK border shadow-lg"} onClick={() => OrderHandle.sortDate(2)} >ASC</button>
        </div>
        <Pagination
          style={{
            justifyContent: "center",
            display: "flex",
            alignContent: "center",
            color: 'white'
          }}
          count={Math.ceil(orderCount / ordersPerPage)}
          page={currentOrdersPage}
          onChange={OrderHandle.handleChangeOrdersPage}
          variant="outlined"
        />
        <div className="m-2 bg-HIGHLIGHT flex flex-grow flex-row text-[0.7rem] md:text-lg border-b border-BLACK">
          <div className="w-[25%] text-center border-r border-BLACK">ITEM ID</div>
          <div className="w-[25%] text-center border-r border-BLACK">NAME</div>
          <div className="w-[25%] text-center border-r border-BLACK">STATUS</div>
          <div className="w-[25%] text-center border-r border-BLACK">PLACED</div>
        </div>
        {authenticated && !superAuthenticated
          ? orders
            .slice(
              (currentOrdersPage - 1) * ordersPerPage,
              currentOrdersPage * ordersPerPage
            )
            .map((order: any, index: number) => (
              <div
                key={index}
                className={`${order.itemState === 2 ? "opacity-80" : ""} text-BLACK shadow-lg rounded  bg-LIGHT flex justify-between mt-1 mb-1`}
              >
                <h1 className="text-center items-center justify-center flex w-[25%] text-[0.7rem] md:text-lg">
                  {order.itemID}{" "}
                </h1>
                <h1 className="text-center items-center justify-center flex w-[25%] text-[0.7rem] md:text-lg">
                  {order.itemName}{" "}
                </h1>
                <h1 className="text-center items-center justify-center flex w-[25%] text-[0.7rem] md:text-lg">
                  {order.itemState == 0 || order.itemState > 3 ? ("ERROR") : ("")}
                  {order.itemState == 1 ? ("PENDING") : ("")}
                  {order.itemState == 2 ? ("COMPLETE") : ("")}
                  {order.itemState == 3 ? ("DELETED") : ("")}
                </h1>
                {order.orderDate ? (
                  <h1 className="text-center items-center justify-center flex w-[25%] text-[0.7rem] md:text-lg">
                    {order.orderDate.split('T')[0]}
                  </h1>
                ) : (
                  <div className="w-[0%] text-[0.7rem] md:text-lg"></div>
                )}
              </div>
            ))
          : null}
      </div>
    </div>
  );
}
