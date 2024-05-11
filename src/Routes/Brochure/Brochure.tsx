import React, { useState, useEffect } from "react";
import axios from "axios";
import url from "url";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from 'framer-motion'
import { Rating } from "@mui/material";

interface StoreItem
{
  itemID: number;
  itemName: string;
  itemPrice: number;
  imagePath: string;
}

function Brochure()
{
  const serverAddress = `${process.env.REACT_APP_SERVER_ADDRESS}`;
  const [brochure, setBrochure] = useState<any[]>([]);

  // PREWRITTEN REVIEWS DONT HATE
  const [reviews, setReviews] = useState([
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
  const getBrochure = async () =>
  {
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
  useEffect(() =>
  {
    if (brochure.length === 0) {
      getBrochure();
    }
  }, []);
  useEffect(() =>
  {
    const handleResize = () =>
    {
      const screenWidth = window.innerWidth;
      const slidesToShow = screenWidth < 768 ? 1 : 3; // Adjust this threshold as per your design
      setSettings({
        ...settings,
        slidesToShow: slidesToShow,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () =>
    {
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
    <div className="md:h-full h-full flex flex-col justify-evenly bg-gradient-to-b from-GREY to-WHITE w-full shadow-inner">
        
        <div className="w-full md:h-[100vh] h-[50vh] flex text-center mt-[5vh]">
          <img src="https://m.atostogoskaime.lt/data/gallery/large/puodininkyste_16_.jpg"
            alt="Profile Picture"
            className="w-full md:h-full"
          />

          <div className="absolute right-10 md:bottom-10 top-[7vh] flex flex-col items-center md:h-[70%] h-[45%] w-[50%] text-WHITE text-[0.7rem] bg-transparent backdrop-brightness-50 m-auto z-1">
              <h2 className="font-serif text-[2rem] rounded p-2 w-[60%]">
                ABOUT US
              </h2>
              <div className="m-auto md:w-[60%] w-[90%] ">
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam accusantium necessitatibus voluptas consequatur sint, veniam excepturi at quos itaque sequi molestiae unde cum delectus eius iusto fugiat reprehenderit quaerat sapiente.
              </div>
              <h2 className="font-serif text-2xl rounded p-2 md:w-[60%]">
                EMAIL
              </h2>
              <div className="m-auto w-[80%]">
                test@test@fakemail.com.au
              </div>
              <h2 className="font-serif text-2xl rounded p-2 w-[60%]">
                PH
              </h2>
              <div className="m-auto w-[80%]">
                000 000 000
              </div>
          </div>
        </div>

        {brochure.length > 0 && (
          <div className="h-[95vh] w-[90%] m-auto">
            <h1 className="font-serif text-[2em] border-BLACK text-BLACK h-[5vh] h-[10vh] items-center justify-center flex">
              Our Unique Selection
            </h1>
            <Slider {...settings}>
              {brochure.map((item: StoreItem, index: number) => item.imagePath && (
                <motion.div key={index} className="border-BLACK text-center m-auto flex mt-5 p-10 pt-20 pb-20" whileHover={{ scale: 1.2 }}>
                  <img
                    key={item.itemID}
                    src={url.resolve(serverAddress, item.imagePath)}
                    alt={item.itemName}
                    className="h-[45vh] max-h-[500px] w-[90%] md:w-[80%] m-auto"
                  />
                  <div className="text-BLACK w-[90%] md:w-[80%] m-auto">
                    <h1 className="text-[1.5em] text-BLACK h-[8vh] font-serif bg-GREY rounded-b-lg justify-center items-center flex">
                      {item.itemName}
                    </h1>
                    <div>${item.itemPrice} </div>
                  </div>
                </motion.div>
              ))}
            </Slider>
          </div>   
                  
        )}

        <div className="w-full md:h-[95vh] h-full justify-evenly flex flex-col text-BLACK divide-y ">
            <h1 className="w-[80%] text-BLACK text-center text-[2rem] m-auto ">
              Our customers wanted to say
            </h1>
          {reviews.map((review: any, index: number) => (
            <div key={index} className={`w-[80%] md:h-[30vh] h-[80vh] m-auto flex ${ index % 2 !== 0 ? "md:flex-row-reverse" : "md:flex-row"}  flex-col p-2 rounded justify-evenly items-center`}>
              <img src="https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg?size=626&ext=jpg&ga=GA1.1.1224184972.1714003200&semt=sph"
                alt="Profile Picture"
                className="rounded-full ring ring-GREY  md:h-[10vh]"
              />
              <div className="w-[60%] md:w-[50%] h-[100%] text-center flex flex-col justify-center items-center">
                <div className="text-[1.5rem] text-BLACK text-bold flex flex-row items-center justify-evenly md:bg-GREY rounded w-full">
                  <p>
                    {review.reviewer}
                  </p>
                  
                  <Rating name="half-rating-read" defaultValue={review.rating} precision={0.5} readOnly />
                </div>  
                <div className="mt-[2vh]">
                  {review.reviewText}
                </div>       
                
              </div>
            </div>
          ))}
        </div>             

    </div>
  );
}

export default Brochure;