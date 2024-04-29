import { Input } from "@mui/material";
import axios from "axios";
import React, { ChangeEvent, useState } from "react";
import { useMyContext } from "../../../Context/ContextProvider";

interface Item
{
  ItemName: string;
  description: string;
  price: string;
  picture: File | null;
}

function CreateItem()
{
  const serverAddress = process.env.REACT_APP_SERVER_ADDRESS;
  const [
    ,
    setAllItems,
    ,
    ,
    ,
    ,
    authenticated,
    ,
    superAuthenticated,
    ,
    ,
    ,
  ] = useMyContext();
  const [item, setItem] = useState<Item>({
    ItemName: "",
    description: "",
    price: "0",
    picture: null,
  });

  const handleInputChange = (field: keyof Item, value: string) =>
  {
    setItem((prevItem) => ({ ...prevItem, [field]: value }));
  };
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) =>
  {
    const file = event.target.files?.[0] || null;
    setItem((prevItem) => ({ ...prevItem, picture: file }));
  };
  ///////////////////////////////////////////////////////////////
  const createStoreItem = async () =>
  {
    if (!item.picture || !item.ItemName || !item.description || !item.price) {
      console.log("Incomplete StoreItem");
      return;
    }

    const choice = superAuthenticated ? 'sutoken' : authenticated ? 'token' : 'Null'
    const storedToken = getToken(choice);

    if (!storedToken) {
      console.log('No authorization found');
      return;
    }

    const formData = new FormData();
    formData.append("ItemName", item.ItemName);
    formData.append("ItemDescription", item.description);
    formData.append("ItemPrice", item.price);
    formData.append("Picture", item.picture);

    try {
      const response = await axios.post(
        `${serverAddress}/api/createItem`,
        formData,
        {
          headers: {
            authorization: `Bearer ${storedToken}`
          }
        }
      );
      if (response.status === 200) {
        console.log("Successfully added to store");
        setItem({
          ItemName: "",
          description: "",
          price: "0",
          picture: null,
        });
        setAllItems([]);
      } else {
        console.log("Failed to upload to store");
      }
    } catch (error) {
      console.log(error);
    }
  };

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

  ///////////////////////////////////////////////////////////////
  return (
    <div>
      {superAuthenticated ? (
        <div className="ml-auto w-[40vw] h-[50vh] bg-WHITE text-WHITE m-auto">
          <div className="mr-auto h-full border-r-1 border-l-2 border-t-2">
            <h1 className="text-center bg-SELECTED border-black mb-2 text-white h-[30px] rounded">
              Create store Item
            </h1>
            <div className=" w-[40vw] h-[80%] m-auto text-center">
              <h1 className="bg-BACKGROUND rounded text-WHITE w-[80%] md:w-[50%] h-[2rem] m-auto mt-2">
                Name
              </h1>
              <Input
                value={item.ItemName}
                onChange={(e) => handleInputChange("ItemName", e.target.value)}
              />
              <h1 className="bg-BACKGROUND rounded text-WHITE w-[80%] md:w-[50%] h-[2rem] m-auto mt-2">
                Description
              </h1>
              <Input
                value={item.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
              <h1 className="bg-BACKGROUND rounded text-WHITE w-[80%] md:w-[50%] h-[2rem] m-auto mt-2">
                Price
              </h1>
              <Input
                value={item.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
              />
              <h1>Picture</h1>
              <Input type="file" onChange={handleFileChange} />
              <br />
              <button
                className="border-b-2 border-l-2 border border-BLACK bg-WHITE text-BACKGROUND w-[60%] rounded mt-4 hover:opacity-60 shadow-lg"
                onClick={createStoreItem}
              >
                Create Item
              </button>
            </div>
          </div>
        </div>
      ) : (<div className="bg-BACKGROUND text-center">no access</div>)}
    </div>
  );
}
export default CreateItem;
