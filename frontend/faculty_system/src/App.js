import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import LoginBox from './LoginBox';
import HomeBox from './HomeBox';
import './App.css';
import axios from axios


function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/">
            <LoginBox />
          </Route>
          <Route path="/home">
            <HomeBox />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;

