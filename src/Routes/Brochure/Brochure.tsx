import React, { useState, useEffect } from "react";
import axios from "axios";
import url from "url";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {motion} from 'framer-motion'
import { Rating } from "@mui/material";

interface StoreItem {
  itemID: number;
  itemName: string;
  itemPrice: number;
  imagePath: string;
}

function Brochure() {
  const serverAddress = `${process.env.REACT_APP_SERVER_ADDRESS}`;
  const [brochure, setBrochure] = useState<any[]>([]);

  // PREWRITTEN REVIEWS DONT HATE
  const [ reviews, setReviews ] = useState([
    {
      rating: 4,
      reviewer: 'Renata',
      reviewText: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam accusantium necessitatibus voluptas consequatur sint, veniam excepturi at quos itaque sequi molestiae unde cum delectus eius iusto fugiat reprehenderit quaerat sapiente.' 
    },
    {
      rating: 5,
      reviewer: 'Gloria',
      reviewText: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam accusantium necessitatibus voluptas consequatur sint, veniam excepturi at quos itaque sequi molestiae unde cum delectus eius iusto fugiat reprehenderit quaerat sapiente.' 
    },
    {
      rating: 4.5,
      reviewer: 'Martin',
      reviewText: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam accusantium necessitatibus voluptas consequatur sint, veniam excepturi at quos itaque sequi molestiae unde cum delectus eius iusto fugiat reprehenderit quaerat sapiente.' 
    }
  ])
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
    if (brochure.length === 0) {
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
    <div className="md:h-[250vh] h-[300vh] flex flex-col justify-between md:mt-0 mt-[25%]  w-full">
      <div className="h-[70vh] flex items-center justify-center text-BLACK w-[90vw] m-auto">
        <div className="md:w-[70%] w-full h-full shadow-lg flex md:flex-row flex-col rounded-lg text-center">
          <img src="https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg?size=626&ext=jpg&ga=GA1.1.1224184972.1714003200&semt=sph" 
            alt="Profile Picture" 
            className="md:w-[50%] w-[80%] h-[60%] md:ml-5 m-auto flex justify-center items-center rounded-lg " 
          />
          <div className="flex flex-col items-center justify-center h-[70%] m-auto">
            <h2 className="font-serif text-2xl text-BACKGROUND">
              ABOUT ME
            </h2>
            <div className="m-auto w-[80%]">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam accusantium necessitatibus voluptas consequatur sint, veniam excepturi at quos itaque sequi molestiae unde cum delectus eius iusto fugiat reprehenderit quaerat sapiente.
            </div>            
            <h2 className="font-serif text-2xl text-BACKGROUND">
              EMAIL
            </h2>
            <div className="m-auto w-[80%]">
              test@test@fakemail.com.au
            </div>      
            <h2 className="font-serif text-2xl text-BACKGROUND">
              PH
            </h2>
            <div className="m-auto w-[80%]">
              000 000 000
            </div>        
          </div>
        </div>
      </div>
      <div className="w-full md:h-[70vh] h-[130vh] flex flex-col justify-evenly">
            {reviews.map((review: any, index: number) => (
              <div key={index} className=" md:mb-0 mb-2 md:w-[50%] w-[80%] md:h-40 h-70 m-auto flex md:flex-row flex-col shadow-lg rounded-lg bg-BACKGROUND text-WHITE">     
                <div className="flex items-center">             
                  <img src="https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg?size=626&ext=jpg&ga=GA1.1.1224184972.1714003200&semt=sph" 
                  alt="Profile Picture" 
                  className="w-[90%] h-[90%] m-auto flex justify-center  rounded-lg " 
                  />
                </div>
                <div className="w-full flex-col flex justify-evenly mt-2">
                  <div className="font-bold text-lg font-serif justify-evenly flex ">
                    {review.reviewer}
                    <Rating name="half-rating-read" defaultValue={review.rating} precision={0.5} readOnly />
                  </div>
                  <div className="w-[80%] m-auto flex md:text-[0.8rem] text-[0.65rem]">
                    {review.reviewText}
                  </div>                  
                </div>                
              </div>
            ))}          
          </div>
      <div className="h-[100vh] w-[80%] m-auto ">
        <h1 className="font-serif text-[2em] border-BLACK bg-BACKGROUND rounded text-WHITE h-[5vh] h-[10vh] items-center justify-center flex">
          Our Unique Selection
        </h1>
        <Slider {...settings}>
          {brochure.map((item: StoreItem, index: number) => item.imagePath && (
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
              </div>
            </motion.div>
          ))}
        </Slider>        
      </div>
    </div>
    
  );
}

export default Brochure;
/**
 

<div className="text-BLACK h-[150vh] w-[90vw] m-auto text-center mt-[50vh] md:mt-0">
      <div className="md:flex-row flex-col flex mt-20 items-center justify-center h-[70vh] border border-BLACK">

        <div className="md:w-[50%] w-full h-[80%] items-center flex md:mt-0 mt-40 md:mb-0 mb-20 border-black border">
          <div className="w-full h-full flex flex-col justify-evenly">
            {reviews.map((review: any, index: number) => (
              <div key={index} className=" w-[90%] h-40 m-auto flex flex shadow-lg rounded-lg bg-BACKGROUND text-WHITE mb-2 md:mb-0">     
                <div className="flex items-center">             
                  <img src="https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg?size=626&ext=jpg&ga=GA1.1.1224184972.1714003200&semt=sph" 
                  alt="Profile Picture" 
                  className="w-[90%] h-[90%] m-auto flex justify-center  rounded-lg " 
                  />
                </div>
                <div className="w-full flex-col flex justify-evenly mt-2">
                  <div className="font-bold text-lg font-serif justify-evenly flex ">
                    {review.reviewer}
                    <Rating name="half-rating-read" defaultValue={review.rating} precision={0.5} readOnly />
                  </div>
                  
                  <div className="w-[80%] m-auto flex md:text-[0.8rem] text-[0.65rem]">
                    {review.reviewText}
                  </div>                  
                </div>                

              </div>
            ))}          
          </div>          
        </div>
      </div>
      <div className="border border-BLACK">
        <h1 className="font-serif text-[2em] md:mt-[10vh] mt-[40vh] mb-8 border-BLACK bg-BACKGROUND rounded text-WHITE h-[5vh] h-[10vh] items-center justify-center flex">
          Our Unique Selection
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
                <div className="text-sm">{item.orderCount} Orders</div>
              </div>
            </motion.div>
          ))}
        </Slider>        
      </div>

    </div>
 */