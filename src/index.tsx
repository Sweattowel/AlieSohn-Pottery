import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ContextProvider } from './Context/ContextProvider';

import Navigation from './Navigation/Navigation';
import Brochure from './Routes/Brochure/Brochure';
import StoreFront from './Routes/StoreFront/StoreFront';
import Cart from './Routes/Cart/Cart';
import Tail from './Tail/Tail';
import Admin from './Routes/ADMIN/Admin';
import UserHandle from './Routes/USERACCOUNT/UserHandle';
import MobileNavigation from './Navigation/MobileNavigation';

const rootElement: HTMLElement | null = document.getElementById('root');

if (rootElement) {
  ReactDOM.render(
    <React.StrictMode>
      <ContextProvider >
        <Router>
          {window.innerWidth > 768 ? <Navigation /> : <MobileNavigation />}
          <Routes>
            <Route path='/ADMIN' Component={Admin}/>
            <Route path='/MyAccount/:userID' Component={UserHandle}/>
            <Route path="/" Component={Brochure}/>
            <Route path="/StoreFront" Component={StoreFront}/>
            <Route path="/Cart" Component={Cart}/>            
          </Routes>
        <Tail />  
        </Router>
        
      </ContextProvider>
    </React.StrictMode>,
    rootElement
  );
}