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
import UserAccount from './Routes/USERACCOUNT/UserAccount';

const rootElement: HTMLElement | null = document.getElementById('root');

if (rootElement) {
  ReactDOM.render(
    <React.StrictMode>
      <ContextProvider >
        <Router>
          <Navigation />
          <Routes>
            <Route path='/ADMIN' Component={Admin}/>
            <Route path='/MyAccount' Component={UserAccount}/>
            <Route path="/" Component={Brochure}/>
            <Route path="/StoreFront" Component={StoreFront}/>
            <Route path="/Cart" Component={Cart}/>            
          </Routes>
        </Router>
        <Tail />
      </ContextProvider>
    </React.StrictMode>,
    rootElement
  );
}