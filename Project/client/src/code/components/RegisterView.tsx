// React imports.
import React from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Image } from "react-bootstrap-icons";
import ImageUploading from "react-images-uploading";

import * as Users from "../Users";
import { IUser } from "../Users";
import * as Images from "../Images";

import userDefaultImg from "../../assets/userDefault.png";

type MyProps = { setState };
type MyState = {
  userName: string;
  password: string;
  confirmPassword: string;
  userImg: any;
  rememberMe: boolean;
};

class RegisterView extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props);
    this.state = {
      userName: "",
      password: "",
      confirmPassword: "",
      userImg: userDefaultImg,
      rememberMe: false,
    };

    this.handleChangeName = this.handleChangeName.bind(this);
    this.handleChangePwd = this.handleChangePwd.bind(this);
    this.handleChangeConfPwd = this.handleChangeConfPwd.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.validateRegister = this.validateRegister.bind(this);
    this.changeImg = this.changeImg.bind(this);
    this.rememberMe = this.rememberMe.bind(this);
  }

  handleChangeName(event) {
    this.setState({ userName: event.target.value });
  }
  handleChangePwd(event) {
    this.setState({ password: event.target.value });
  }
  handleChangeConfPwd(event) {
    this.setState({ confirmPassword: event.target.value });
  }
  rememberMe() {
    if (!this.state.rememberMe) this.setState({ rememberMe: true });
    else this.setState({ rememberMe: false });
  }
  handleRegister() {
    this.props.setState({
      view: "login",
      user: {
        name: this.state.userName,
        encryptedPassword: this.state.password,
      },
    });
  }

  async changeImg(imageList, addUpdateIndex) {
    this.setState({ userImg: imageList[0]["data_url"] });
  }

  // Validates the information given by the user for the registration
  async validateRegister() {
    if(this.state.userName === '' || this.state.password === '' || this.state.confirmPassword === '') {
      alert("Fields were left empty")
      return;
    }
    if (this.state.password != this.state.confirmPassword) {
      alert("Passwords are different")
      return;
    }
    const usersWorker: Users.Worker = new Users.Worker();
    const imagesWorker: Images.Worker = new Images.Worker();
    try {
      if (!(await usersWorker.getUser(this.state.userName))) { // user is new
        const user = await usersWorker.addUser(this.state.userName, this.state.password, this.state.rememberMe);
        if (this.state.userImg !== userDefaultImg) { // if user uploaded img
          await imagesWorker.uploadUserImg(   
            this.state.userImg,
            this.state.userName
          );
          this.props.setState({ // redirects to the contacts view
            view: "contacts",
            user: {
              ...user,
              userImg: this.state.userImg
            },
          });
        } else { // else default image
          this.props.setState({
            view: "contacts",
            user: {
              ...user,
              userImg: userDefaultImg
            },
          });
        }
      } else {
        alert("Username already exists")
      }
    } catch (e) {
      console.log(e);
      console.log("register failed");
    }
  }

  userImg = () => ( // image upload
    <div
      className="mx-auto bg-image hover-overlay"
      style={{ borderRadius: "50%", width: "100px", height: "100px" }}
      // onClick={this.changeImg}
    >
      <ImageUploading
        value={null}
        dataURLKey="data_url"
        onChange={this.changeImg}
      >
        {({ onImageUpdate }) => (
          <>
            <img src={this.state.userImg} width="100" />
            <div
              className="mask d-flex justify-content-center flex-column text-center"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
              onClick={() => onImageUpdate(0)}
            >
              <Image className="mx-auto" color="white" size={35}></Image>
            </div>
          </>
        )}
      </ImageUploading>
    </div>
  );

  registerForm = () => (
    <Form>
      <div className="container">
        <div className="row g-3 px-5">
          <Form.Group className="col-md-6">
            <Form.Label>User name</Form.Label>
            <Form.Control
              value={this.state.userName}
              placeholder="Enter user name"
              onChange={this.handleChangeName}
            />
          </Form.Group>
          <Form.Group className="col-md-6">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={this.state.password}
              placeholder="Password"
              onChange={this.handleChangePwd}
            />
          </Form.Group>
          <Form.Group className="col-md-6">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              value={this.state.confirmPassword}
              placeholder="Confirm Password"
              onChange={this.handleChangeConfPwd}
            />
          </Form.Group>
          <Form.Group className="float-center" onChange={this.rememberMe}>
            <Form.Check type="checkbox" label="Remember Me" />
          </Form.Group>
          <div className="col-md-23 text-center">
            <Button
              className="float-center"
              variant="primary"
              onClick={this.validateRegister}
            >
              Submit
            </Button>
            <a
              href="#"
              onClick={this.handleRegister}
              className="float-center ms-3"
            >
              Already have an account?
            </a>
          </div>
        </div>
      </div>
    </Form>
  );

  render() {
    return (
      <>
        <p className="text-center mt-4 fs-1">Register</p>
        {this.userImg()}
        {this.registerForm()}
      </>
    );
  }
}

export default RegisterView;
