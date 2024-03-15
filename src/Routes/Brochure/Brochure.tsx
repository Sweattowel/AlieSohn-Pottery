import React, { useState, useEffect } from "react";
import { useMyContext } from "../../Context/ContextProvider";
import axios from 'axios';
import url from 'url'
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

interface StoreItem {
    itemID: number;
    itemName: string;
    itemPrice: number;
    imagePath: string;
    itemDescription: string;
}

function Brochure() {
    const serverAddress =`${process.env.REACT_APP_SERVER_ADDRESS}`
    const [ allItems, setAllItemscart, setCart, userID, setUserID, authenticated, setAuthenticated, superAuthenticated, setSuperAuthenticated] = useMyContext();

    const collectStoreItems = async () => {
        try {
            const response = await axios.post<StoreItem[]>(`${serverAddress}/api/storeItems`);

            if (response.status === 200) {
                setAllItemscart(response.data);
            } else if (response.status === 404) {
                console.log("No items available");
            } else {
                console.log("Internal Server Error");
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (allItems.length == 0){
            collectStoreItems();
        }
    }, []);

    // react slick settings and configuration
    const settings = {
        dots: true,
        speed: 2000,
        slidesToShow: 3,
        slidesToScroll: 1,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 4000,
      };

    return (
        <div className="text-BLACK h-[85vh] w-[50%] m-auto text-center">
            <h1 className="font-serif text-4xl mt-2 mb-8 border-BLACK bg-BACKGROUND rounded text-WHITE h-[5%]">Most popular Items</h1>
            <Slider {...settings}>
                    {allItems.map((item: StoreItem, index: number) => (
                        <div className="border-BLACK text-center w-[80%] m-auto flex">    
                            <img
                                key={item.itemID}
                                src={url.resolve(serverAddress, item.imagePath)}
                                alt={item.itemName}
                                style={{maxHeight: '600px', width: '90%', margin: 'auto'}}
                            />
                            <div className="bg-WHITE text-BLACK w-[90%] m-auto">
                                <h1 className="text-2xl font-serif">{item.itemName}</h1>
                                <div>${item.itemPrice}</div>                                
                            </div>

                        </div> 
                    ))}
                
            </Slider>

        </div>
    );
}

export default Brochure;