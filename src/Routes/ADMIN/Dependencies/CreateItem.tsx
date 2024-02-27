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
        <div className="bg-gray-600 ml-auto w-[80%] h-[50%]">
                <div className="bg-gray-400 mr-auto h-full border-r-1 border-l-2 border-t-2 border-b-2 border-black">
                    <h1 className="text-center bg-gray-600 border-black mb-2 text-white h-[30px]" >
                        Create store Item
                    </h1>
                    <div className="text-white w-[80%] h-[80%] bg-gray-600 m-auto text-center">
                        <h1> 
                            Item title
                        </h1>
                        <Input value={item.title} onChange={(e) => handleInputChange("title", e.target.value)}/>
                        <h1> 
                            Item Description 
                        </h1>
                        <Input value={item.description} onChange={(e) => handleInputChange("description", e.target.value)}/>
                        <h1> 
                            Item Price
                        </h1>
                        <Input value={item.price} onChange={(e) => handleInputChange("price", e.target.value)} />
                        <h1> 
                            Item Picture
                        </h1>
                        <Input type="file" onChange={handleFileChange} />  
                        <br />
                        <Button style={{color: 'white', width: '50%', backgroundColor:'gray', marginTop: '2em'}} variant="outlined" onClick={createStoreItem}>Create Item</Button>   
   
           
                    </div>

                </div>
        </div>
    )
}
export default CreateItem