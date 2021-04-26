import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import LoginBox from './Components/LoginBox/LoginBox';
import HomeBox from './Components/HomeBox/HomeBox';
import './App.css';

function App() {
  return (
    <div className='App'>
      <Router>
        <Switch>
          <Route exact path='/faculty/'>
            <LoginBox />
          </Route>
          <Route path='/faculty/home'>
            <HomeBox />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;

