import React, { useState, useEffect } from "react";
import { useMyContext } from "../../Context/ContextProvider";
import axios from "axios";
import url from "url";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {motion} from 'framer-motion'

interface StoreItem {
  itemID: number;
  itemName: string;
  itemPrice: number;
  imagePath: string;
  order_count: number;
}

function Brochure() {
  const serverAddress = `${process.env.REACT_APP_SERVER_ADDRESS}`;
  const [
    allItems,
    setAllItemscart,
    setCart,
    userID,
    setUserID,
    authenticated,
    setAuthenticated,
    superAuthenticated,
    setSuperAuthenticated,
  ] = useMyContext();
  const [brochure, setBrochure] = useState<any[]>([]);

  const getBrochure = async () => {
    try {
      const response = await axios.post<StoreItem[]>(
        `${serverAddress}/api/getBrochure`
      );
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
  ///////////////////////////////////////// USEEFFECT
  useEffect(() => {
    if (brochure.length == 0) {
      getBrochure();
    }
  }, []);
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const slidesToShow = screenWidth < 768 ? 1 : 3; // Adjust this threshold as per your design
      setSettings({
        ...settings,
        slidesToShow: slidesToShow,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  // react slick settings and configuration
  const [settings, setSettings] = useState({
    dots: true,
    speed: 2000,
    slidesToShow: 3,
    slidesToScroll: 1,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
  });

  return (
    <div className="text-BLACK h-[80vh] w-[90vw] m-auto text-center">
      <h1 className="font-serif text-[2em] mt-2 mb-8 border-BLACK bg-BACKGROUND rounded text-WHITE h-[5vh] h-[10vh] items-center justify-center flex">
        Our Top Sellers!
      </h1>
      <Slider {...settings}>
        {brochure.map((item: StoreItem, index: number) => (
          <motion.div key={index} className="border-BLACK text-center m-auto flex mt-5 p-10 pt-20 pb-20" whileHover={{scale: 1.2}}>
            <img
              key={item.itemID}
              src={url.resolve(serverAddress, item.imagePath)}
              alt={item.itemName}
              className="h-[45vh] max-h-[500px] w-[90%] md:w-[80%] m-auto"
            />
            <div className="text-BLACK w-[90%] md:w-[80%] m-auto">
              <h1 className="text-[1.5em] text-WHITE h-[8vh] font-serif bg-BACKGROUND rounded-b-lg justify-center items-center flex">
                {item.itemName}
              </h1>
              <div>${item.itemPrice} </div>
              <div className="text-sm">Happy customers {item.order_count}</div>
            </div>
          </motion.div>
        ))}
      </Slider>
    </div>
  );
}

export default Brochure;
