import React from 'react';
import {login} from './loginHandler';
import './login.css';

export class LoginBox extends React.Component {

  constructor(props) {
    super(props)

    this.handleChangeNID = this.handleChangeNID.bind(this);
    this.handleChangePass = this.handleChangePass.bind(this);
    this.handleLogin = this.handleLogin.bind(this);

    this.state = {
      nID:'',
      pass:'',
      loading:false
    }

    window.sessionStorage.clear();
  }

  componentDidMount() {
    this.setState({
        nID:document.getElementById('nID').textContent,
        pass:document.getElementById('password').textContent
    });
  }

  handleChangeNID(e) {
    this.setState({nID:e.target.value});
  }

  handleChangePass(e) {
    this.setState({pass:e.target.value});
  }

  handleLogin(e) {
    e.preventDefault();
    this.setState({loading:true}, ()=> {
      login(this.state.nID, this.state.pass, (response)=> {
        if (response.success) {
          this.setState({loading:false}, ()=> {
            window.sessionStorage.setItem('token', response.token);
            window.location.href = (window.location + 'home');
          });
        } else {
          this.setState({loading:false}, ()=> {
            alert(response.message);
            console.log(response.error);
          });
        }
      });
    });
  }

  render() {
    return (
      <div>
        <h1>
        KnugBot Faculty Login
        </h1>
        <div className='login-box'>
          <div className='login-form'>
            <form onSubmit={this.handleLogin}>
              <div className='input-group'>
                <label htmlFor='nID'>Account</label>
                <input className='login-text' id='nID' type='text' placeholder='Username: NID' onChange={this.handleChangeNID}/>
              </div>
              <div className='input-group'>
                <label htmlFor='password'>Password</label>
              <input className='login-text' id='password' type='password' placeholder='Password' onChange={this.handleChangePass}/>
              </div>
              <input className='btn' type='submit' value='Sign On'/>
            </form>
          </div>
        </div>

        {/* Displays a loading animation while the login API waits for a response. Otherwise displayes nothing. */}
        {this.state.loading ? 'Logging In...' : ''}
      </div>
    )
  }
}

export default LoginBox;
