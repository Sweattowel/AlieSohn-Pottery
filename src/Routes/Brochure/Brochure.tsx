import React, { useState, useEffect } from "react";
import { useMyContext } from "../../Context/ContextProvider";
import axios from 'axios';
import url from 'url'
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

interface StoreItem {
    itemID: number;
    itemName: string;
    itemPrice: number;
    imagePath: string;
    order_count: number;
}

function Brochure() {
    const serverAddress =`${process.env.REACT_APP_SERVER_ADDRESS}`
    const [ allItems, setAllItemscart, setCart, userID, setUserID, authenticated, setAuthenticated, superAuthenticated, setSuperAuthenticated] = useMyContext();
    const [ brochure, setBrochure ] = useState<any[]>([])


    const getBrochure = async () => {
        try {
            const response = await axios.post<StoreItem[]>(`${serverAddress}/api/getBrochure`);
            if (response.status === 200) {
                setBrochure(response.data);

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
        if (brochure.length == 0){
            getBrochure();            
        }

    }, []);

    // react slick settings and configuration
    const settings = {
        dots: true,
        speed: 2000,
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 4000,
      };

    return (
        <div className="text-BLACK h-[80vh] w-[80vw] m-auto text-center">
            <h1 className="font-serif text-[2em] mt-2 mb-8 border-BLACK bg-BACKGROUND rounded text-WHITE h-[5vh] h-[10vh] items-center justify-center flex">Our Top Sellers!</h1>
            <Slider {...settings}>
                    {brochure.map((item: StoreItem, index: number) => (
                        <div key={index} className="border-BLACK text-center m-auto flex">    
                            <img
                                key={item.itemID}
                                src={url.resolve(serverAddress, item.imagePath)}
                                alt={item.itemName}
                                style={{height:'40vh', maxHeight: '400px', width: '80%', margin: 'auto'}}
                            />
                            <div className="text-BLACK w-[80%] m-auto">
                                <h1 className="text-[1.5em] text-WHITE h-[8vh] font-serif bg-BACKGROUND rounded-b-lg justify-center items-center flex">{item.itemName}</h1>
                                <div>${item.itemPrice} </div>   
                                <div className="text-sm">Happy customers {item.order_count}</div>                             
                            </div>

                        </div> 
                    ))}
                
            </Slider>

        </div>
    );
}

export default Brochure;