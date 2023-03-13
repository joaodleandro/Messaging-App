// React imports.
import React from "react";

import * as Users from "../Users";
import * as Images from "../Images";

type MyProps = { setState };
type MyState = { };

class LandingView extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props);
  }

  // Checks in for user in Local Data Service
  // if exists logs in
  // else redirects to login view
  // Meanwhile is placed a blank page
  async componentDidMount() {
    const usersWorker: Users.Worker = new Users.Worker();
    const imagesWorker: Images.Worker = new Images.Worker();
    const userName = await usersWorker.checkRememberUser();

    if(userName) {
      const user = await usersWorker.getUser(userName);
      this.props.setState({view: "contacts", user: {...user, userImg: await imagesWorker.downloadUserImg(userName)}});
    }
    else {
      this.props.setState({view: "login"});
    }
  }

  render() {
    return (
      <>
      </>
    )
  }
}

export default LandingView;
