import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import LoginBox from './Components/LoginBox/LoginBox';
import HomeBox from './Components/HomeBox/HomeBox';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      isAdmin: window.sessionStorage.getItem('isAdmin') === null ? false : window.sessionStorage.getItem('isAdmin')
    }
    this.goToHome = this.goToHome.bind(this);
  }

  goToHome(isAdmin) {
    this.setState({isAdmin:isAdmin}, ()=> {
      window.sessionStorage.setItem('isAdmin', this.state.isAdmin);
      window.location.href = (window.location + 'home'); 
    });
  }
  render() {
    return (
      <div className='App'>
        <Router>
          <Switch>
            <Route exact path='/faculty/'>
              <LoginBox goToHome={this.goToHome}/>
            </Route>
            <Route path='/faculty/home'>
              <HomeBox isAdmin={this.state.isAdmin}/>
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;

