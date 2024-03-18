import { Button, Input } from "@mui/material"
import axios from "axios";
import React, { ChangeEvent, useState } from "react"

interface Item {
    title: string,
    description: string,
    price: string,
    picture: File | null,
}

function CreateItem(){
    const serverAddress = process.env.REACT_APP_SERVER_ADDRESS

    const [item, setItem] = useState<Item>({
        title: "",
        description: "",
        price: '0',
        picture: null
    })

    const handleInputChange = (field: keyof Item, value: string) => {
        setItem((prevItem) => ({ ...prevItem, [field]: value}))
    }
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null
        setItem((prevItem) => ({ ...prevItem, picture: file}))
    }
///////////////////////////////////////////////////////////////
    const createStoreItem = async () => {
        if (!item.picture || !item.title || !item.description || !item.price){
            console.log('Incomplete StoreItem')
            return
        }
        const formData = new FormData()
        formData.append("title", item.title)
        formData.append("description", item.description)
        formData.append("price", item.price)
        formData.append("picture", item.picture)

        try {
            const response = await axios.post(`${serverAddress}/api/createItem`, formData)
            if (response.status === 200){
                console.log('Successfully added to store')
            } else {
                console.log('Failed to upload to store')
            }
        } catch (error) {
            console.log(error)
        }
    }

    ///////////////////////////////////////////////////////////////
    return (
        <div className="ml-auto w-[80%] h-[50%] bg-WHITE text-WHITE m-auto">
                <div className="mr-auto h-full border-r-1 border-l-2 border-t-2">
                    <h1 className="text-center bg-SELECTED border-black mb-2 text-white h-[30px] rounded" >
                        Create store Item
                    </h1>
                    <div className=" w-[80%] h-[80%] m-auto text-center">
                        <h1 className="bg-BACKGROUND rounded text-WHITE w-[50%] m-auto mt-2"> 
                            Item title
                        </h1>
                        <Input value={item.title} onChange={(e) => handleInputChange("title", e.target.value)}/>
                        <h1 className="bg-BACKGROUND rounded text-WHITE w-[50%] m-auto mt-2"> 
                            Item Description 
                        </h1>
                        <Input value={item.description} onChange={(e) => handleInputChange("description", e.target.value)}/>
                        <h1 className="bg-BACKGROUND rounded text-WHITE w-[50%] m-auto mt-2"> 
                            Item Price
                        </h1>
                        <Input value={item.price} onChange={(e) => handleInputChange("price", e.target.value)} />
                        <h1> 
                            Item Picture
                        </h1>
                        <Input type="file" onChange={handleFileChange} />  
                        <br />
                        <button className="border-b-2 border-l-2 border border-BLACK bg-BACKGROUND w-[60%] rounded mt-4 hover:text-BLACK hover:opacity-90" onClick={createStoreItem}>Create Item</button>   
   
           
                    </div>

                </div>
        </div>
    )
}
export default CreateItem