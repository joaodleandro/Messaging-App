// React imports.
import React from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import * as Users from "../Users";
import { IUser } from "../Users";
import * as Images from "../Images";
import userDefaultImg from "../../assets/userDefault.png";

type MyProps = { setState };
type MyState = { userName: string; password: string; rememberMe: boolean };

class LoginView extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props);
    this.state = { userName: "", password: "", rememberMe: false };

    this.handleChangeName = this.handleChangeName.bind(this);
    this.handleChangePwd = this.handleChangePwd.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.validateLogin = this.validateLogin.bind(this);
    this.rememberMe = this.rememberMe.bind(this);
  }

  handleChangeName(event) {
    this.setState({ userName: event.target.value });
  }
  handleChangePwd(event) {
    this.setState({ password: event.target.value });
  }
  rememberMe() {
    if (!this.state.rememberMe) this.setState({ rememberMe: true });
    else this.setState({ rememberMe: false });
  }
  handleRegister() {
    this.props.setState({
      view: "register",
      user: {
        name: this.state.userName,
        encryptedPassword: this.state.password,
      },
    });
  }

  async validateLogin() {
    if(this.state.userName === '' || this.state.password === '') {
      alert("Fields were left empty")
      return;
    }
    const usersWorker: Users.Worker = new Users.Worker();
    const imagesWorker: Images.Worker = new Images.Worker();
    try {
      const user: IUser = await usersWorker.authUser(
        this.state.userName,
        this.state.password,
        this.state.rememberMe
      );
      if (user) {
        var userImg;
        if (
          !(userImg = await imagesWorker.downloadUserImg(this.state.userName))
        )
          userImg = userDefaultImg;
        this.props.setState({
          view: "contacts",
          user: {
            ...user,
            userImg: userImg,
          },
        });
      } else {
        alert("user name doesn't exist or password is wrong")
      }
    } catch (e) {
      console.log("login failed: " + e);
    }
  }

  render() {
    return (
      <Form>
        <p className="text-center mt-4 fs-1">Log in</p>
        <div className="container">
          <div className="row g-3 px-5">
            <Form.Group className="col-md-6">
              <Form.Label>User name</Form.Label>
              <Form.Control
                type="text"
                value={this.state.userName}
                placeholder="Enter user name"
                onChange={this.handleChangeName}
              />
            </Form.Group>
            <Form.Group className="col-md-6" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={this.state.password}
                placeholder="Password"
                onChange={this.handleChangePwd}
              />
            </Form.Group>
            <Form.Group className="float-center" onChange={this.rememberMe}>
              <Form.Check type="checkbox" label="Remember Me" />
            </Form.Group>
            <div className="col-md-23 text-center">
              <Button
                // className="float-center"
                variant="primary"
                onClick={this.validateLogin}
              >
                Submit
              </Button>
              <a
                href="#"
                onClick={this.handleRegister}
                className="link-primary float-center ms-3"
              >
                Dont have an account?
              </a>
            </div>
          </div>
        </div>
      </Form>
    );
  }
}

export default LoginView;
