// React imports.
import React from "react";
import { Container } from "react-bootstrap";
import Button from "react-bootstrap/Button";

import * as Messages from "../Messages";
import * as Images from "../Images";
import { IUser } from "../Users";
import { IMessage } from "../Messages";

type MyProps = { setState; user: IUser; contact: IUser };
type MyState = {
  messagesList: JSX.Element[];
  newMessage: string;
  messages: IMessage[];
};

class MessagesView extends React.Component<MyProps, MyState> {
  timerID: NodeJS.Timer;
  messagesEnd: any;
  constructor(props) {
    super(props);
    this.state = {
      messagesList: [],
      newMessage: "",
      messages: [],
    };
    this.handleChangeNewMessage = this.handleChangeNewMessage.bind(this);
    this.handleKeyEnter = this.handleKeyEnter.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.gotoContacts = this.gotoContacts.bind(this);
    this.setMessages = this.setMessages.bind(this);
  }

  //set list of messages html element
  setMessages(messages: IMessage[], contactImg) {
    this.setState({
      messagesList: messages.map((message) => (
        <div key={message._id}>
          {message.userId1 == this.props.user._id && (
            <Container className="d-flex flex-row justify-content-start mb-4">
              <img
                src={this.props.user.userImg}
                alt="user image"
                style={{
                  borderRadius: "50%",
                  width: "45px",
                  height: "100%",
                }}
              />
              <div>
                <p
                  className="small p-2 ms-3 mb-1 rounded-3"
                  style={{ backgroundColor: "#f5f6f7" }}
                >
                  {message.content}
                </p>
                <p className="small ms-3 mb-3 rounded-3 text-muted">
                  {this.toDate(message.date).getUTCDate().toLocaleString() +
                    "/" +
                    (
                      this.toDate(message.date).getUTCMonth() + 1
                    ).toLocaleString() +
                    " " +
                    this.toDate(message.date).getHours().toLocaleString() +
                    ":" +
                    this.toDate(message.date).getMinutes().toLocaleString()}
                </p>
              </div>
            </Container>
          )}
          {message.userId1 != this.props.user._id && (
            <Container className="d-flex flex-row justify-content-end mb-4">
              <div>
                <p className="small p-2 me-3 mb-1 text-white rounded-3 bg-primary">
                  {message.content}
                </p>
                <p className="small me-3 mb-3 rounded-3 text-muted d-flex justify-content-end">
                  {this.toDate(message.date).getUTCDate().toLocaleString() +
                    "/" +
                    (
                      this.toDate(message.date).getUTCMonth() + 1
                    ).toLocaleString() +
                    " " +
                    this.toDate(message.date).getHours().toLocaleString() +
                    ":" +
                    this.toDate(message.date).getMinutes().toLocaleString()}
                </p>
              </div>
              <img
                src={contactImg}
                alt="avatar 1"
                style={{ borderRadius: "50%", width: "45px", height: "100%" }}
              />
            </Container>
          )}
          <br></br>
        </div>
      )),
    });
  }

  // Checks if there's new messages from the contact side
  // if not simply returns
  // else builds the new messages
  async tick() {
    const imagesWorker: Images.Worker = new Images.Worker();
    const messagesWorker: Messages.Worker = new Messages.Worker();
    const messages: IMessage[] = (
      await messagesWorker.listMessages(
        this.props.user._id,
        this.props.contact._id
      )
    ).sort(function (a, b) {
      return a.date - b.date;
    });
    this.timerID = setTimeout(() => this.tick(), 2000);
    if (
      messages.length === 0 || 
      // IF THERE ARE NEW MESSAGES
      messages[messages.length - 1]._id ===
      this.state.messages[this.state.messagesList.length - 1]._id
    )
      return;
    const contactImg = await imagesWorker.downloadUserImg(
      this.props.contact._id
    );
    this.setMessages(messages, contactImg);
    this.setState({ messages: messages });
  }

  //scroll to bottom
  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView(); //scrolls to invisible element at the end of the messages
  };

  componentDidUpdate() {
    this.scrollToBottom();
  }

   // Gets list of messages, sorts them by date, gets contact image,
   // sets list of messages html element,
   // and sets a timeout of 2secs to check for new messages
  async componentDidMount() {
    this.scrollToBottom();

    const imagesWorker: Images.Worker = new Images.Worker();
    const messagesWorker: Messages.Worker = new Messages.Worker();
    this.setState({
      messages: (
        await messagesWorker.listMessages(
          this.props.user._id,
          this.props.contact._id
        )
      ).sort((a, b) => {
        return a.date - b.date;
      }),
    });
    const contactImg = await imagesWorker.downloadUserImg(
      this.props.contact._id
    );
    if (this.state.messages) {
      this.setMessages(this.state.messages, contactImg);
    }
    this.timerID = setTimeout(() => this.tick(), 2000);
  }

  // clear timer to check for new messages when leaving page
  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  //convert from milisecs to Date object
  toDate(number) {
    return new Date(number);
  }

  handleChangeNewMessage(event) {
    this.setState({ newMessage: event.target.value });
  }

  gotoContacts() {
    this.props.setState({
      view: "contacts",
      user: this.props.user,
    });
  }

  async handleKeyEnter(event) {
    if (event.key === "Enter") {
      await this.sendMessage();
      this.setState({ newMessage: "" });
      event.preventDefault();
    }
  }

  // Sends new message to server and adds the new message HTML in messagesList for display
  async sendMessage() {
    const messagesWorker: Messages.Worker = new Messages.Worker();
    try {
      const newMsg = await messagesWorker.addMessage(
        this.state.newMessage,
        this.props.user._id,
        this.props.contact._id
      );
      this.setState({
        messages: [...this.state.messages, newMsg],
        messagesList: [
          ...this.state.messagesList,
          <Container
            key={newMsg._id}
            className="d-flex flex-row justify-content-start mb-4"
          >
            <img
              src={this.props.user.userImg}
              alt="avatar 2"
              style={{ borderRadius: "50%", width: "45px", height: "100%" }}
            />
            <div>
              <p
                className="small p-2 ms-3 mb-1 rounded-3"
                style={{ backgroundColor: "#f5f6f7" }}
              >
                {this.state.newMessage}
              </p>
              <p className="small me-3 mb-3 rounded-3 text-muted d-flex justify-content-end">
                {new Date().getUTCDate().toLocaleString() +
                  "/" +
                  (new Date().getUTCMonth() + 1).toLocaleString() +
                  " " +
                  new Date().getHours().toLocaleString() +
                  ":" +
                  new Date().getMinutes().toLocaleString()}
              </p>
            </div>
          </Container>,
        ],
      });
    } catch (e) {
      console.log("Error in Sending Message");
      console.log(e);
    }
  }

  messagesInterface = () => (
    <Container className="container py-5">
      <div className="row d-flex justify-content-center">
        <div className="col-md-10 col-lg-8 col-xl-6">
          <div className="card" id="chat2">
            <div className="card-header d-flex justify-content-between align-items-center p-3">
              <h5 className="mb-0">{this.props.contact._id}</h5>
              <Button
                className="btn btn-primary btn-sm"
                data-mdb-ripple-color="dark"
                onClick={this.gotoContacts}
              >
                Contacts
              </Button>
            </div>
            <div
              className="card-body"
              data-mdb-perfect-scrollbar="true"
              style={{
                position: "relative",
                height: "400px",
                overflowY: "scroll",
              }}
            >
              {this.state.messagesList}
              <div
                style={{ float: "left", clear: "both" }}
                ref={(el) => {
                  this.messagesEnd = el;
                }}
              ></div>
            </div>
            <div className="card-footer text-muted d-flex justify-content-start align-items-center p-3">
              <img
                src={this.props.user.userImg}
                alt="avatar 3"
                style={{ borderRadius: "50%", width: "40px", height: "100%" }}
              />
              <input
                type="text"
                className="form-control form-control-lg pl-5"
                value={this.state.newMessage}
                onChange={this.handleChangeNewMessage}
                id="FormControlInput1"
                placeholder="Type message"
                onKeyDown={this.handleKeyEnter}
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );

  render() {
    return <>{this.messagesInterface()}</>;
  }
}

export default MessagesView;
