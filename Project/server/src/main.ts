import path from "path";
import express, { Express, NextFunction, Request, Response } from "express";
import Busboy from "busboy";
import fs from "fs";

import * as Users from "./users";
import { IUser } from "./users";
import * as Messages from "./messages";
import { IMessage } from "./messages";

const app: Express = express();

app.use(express.json()); // a applicação só vai receber requests com o header '
// Content-type: application/json', ou seja so recebe requests com body json
// se o body estiver codificado ele descodifica

app.use("/", express.static(path.join(__dirname, "../../client/dist"))); // client file location

//set headers
app.use(function (
  inRequest: Request,
  inResponse: Response,
  inNext: NextFunction
) {
  inResponse.header("Access-Control-Allow-Origin", "*"); //indica que a resposta pode ser partilhada, para qualquer origem do request
  inResponse.header(
    "Access-Control-Allow-Methods",
    "GET,POST,DELETE,OPTIONS,SEARCH"
  ); //allowed methods header in the request
  inResponse.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept"
  ); //allowed headers in the request
  inNext();
});

//get public assets
app.use(express.static(__dirname + "/public"));

//add userImages
app.post("/images", function (req, res) {
  var busboy = Busboy({ headers: req.headers });
  busboy.on("file", function (name, file, info) {
    const { filename, encoding, mimeType } = info;
    var saveTo = __dirname + "/public/userImages/" + filename + ".jpg";
    file.pipe(fs.createWriteStream(saveTo));
  });
  busboy.on("finish", function () {
    res.writeHead(200, { Connection: "close" });
    res.end("Success");
  });
  return req.pipe(busboy);
});

app.post("/users", async (inRequest: Request, inResponse: Response) => {
  try {
    const usersWorker: Users.Worker = new Users.Worker(); //create new Users worker
    const user: IUser = await usersWorker.addUser(inRequest.body); //add User with atributes specified in request body
    inResponse.json(user); // send added contact as json
  } catch (inError) {
    console.log(inError);
    inResponse.send("error");
  }
});

app.get(
  "/users/:userName",
  async (inRequest: Request, inResponse: Response) => {
    try {
      const usersWorker: Users.Worker = new Users.Worker();
      const user: IUser = await usersWorker.getUser(inRequest.params.userName);
      inResponse.json(user);
    } catch (inError) {
      console.log(inError);
      inResponse.send("error");
    }
  }
);

app.search("/users/auth", async (inRequest: Request, inResponse: Response) => {
  try {
    const usersWorker: Users.Worker = new Users.Worker();
    const user: IUser = await usersWorker.authUser(
      inRequest.body.userName,
      inRequest.body.userPwd
    );
    inResponse.json(user);
  } catch (inError) {
    console.log(inError);
    inResponse.send("error");
  }
});

app.post("/messages", async (inRequest: Request, inResponse: Response) => {
  try {
    const messagesWorker: Messages.Worker = new Messages.Worker(); //create messages worker
    const message: IMessage = await messagesWorker.addMessage(inRequest.body); // object created by express .json middleware // send request body to server specified in serverInfo
    inResponse.json(message); //confirmation
  } catch (inError) {
    inResponse.send("error");
  }
});

app.get(
  "/messages/:userId1-:userId2",
  async (inRequest: Request, inResponse: Response) => {
    try {
      const messagesWorker: Messages.Worker = new Messages.Worker();
      const messages: IMessage[] = await messagesWorker.listMessages(
        inRequest.params.userId1,
        inRequest.params.userId2
      ); //list messages between two users with userId1 and userId2
      inResponse.json(messages);
    } catch (inError) {
      console.log(inError);
      inResponse.send("error");
    }
  }
);

app.post("/contacts", async (inRequest: Request, inResponse: Response) => {
  try {
    const contactsWorker: Users.Worker = new Users.Worker();
    const user: IUser = await contactsWorker.addContact(
      inRequest.body.userName,
      inRequest.body.contactName
    ); //add contact with atributes specified in request body to User specified by userId
    inResponse.json(user); // send added contact as json
  } catch (inError) {
    console.log(inError);
    inResponse.send("error");
  }
});

//on delete request with /contacts/:id end point
app.delete(
  "/contacts/:userName-:contactName",
  async (inRequest: Request, inResponse: Response) => {
    try {
      const contactsWorker: Users.Worker = new Users.Worker(); //create new Users worker
      await contactsWorker.removeContact(
        inRequest.params.userName,
        inRequest.params.contactName
      ); //delete contact with anme:contactName to User with name:userName
      inResponse.status(200).json("Success");
    } catch (inError) {
      console.log(inError);
      inResponse.send("error");
    }
  }
);

console.log("Running...");

app.listen(8080); //listen for connections on port 8080
