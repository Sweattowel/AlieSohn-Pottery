// Litterally just a self made man in the middle attack lmao

import axios from "axios";
import { useMyContext } from "../Context/ContextProvider";

const API = axios.create({
    baseURL: process.env.REACT_APP_SERVER_ADDRESS,
});

function fetchToken(user: boolean, admin: boolean){
    const choice = admin ? 'sutoken' : user ? 'token' : null;
    if (!choice) return null;

    const cookie = document.cookie.split(';').find(c => c.trim().startsWith(`${choice}=`))

    return cookie ? cookie.split('=')[1] : null
}

API.interceptors.request.use((config) => {
    const [
        ,
        ,
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
    const token = fetchToken(authenticated, superAuthenticated);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error)
})

export const deleteAccount = async (userID:number, userName: string) => {
    return API.post(`/api/deleteAccount/${userID}`, { userID, userName });
}

export default API