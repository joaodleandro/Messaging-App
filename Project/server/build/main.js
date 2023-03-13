"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const busboy_1 = __importDefault(require("busboy"));
const fs_1 = __importDefault(require("fs"));
const Users = __importStar(require("./users"));
const Messages = __importStar(require("./messages"));
const app = (0, express_1.default)();
app.use(express_1.default.json()); // a applicação só vai receber requests com o header '
// Content-type: application/json', ou seja so recebe requests com body json
// se o body estiver codificado ele descodifica
app.use("/", express_1.default.static(path_1.default.join(__dirname, "../../client/dist"))); // client file location
//set headers
app.use(function (inRequest, inResponse, inNext) {
    inResponse.header("Access-Control-Allow-Origin", "*"); //indica que a resposta pode ser partilhada, para qualquer origem do request
    inResponse.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS,SEARCH"); //allowed methods header in the request
    inResponse.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept"); //allowed headers in the request
    inNext();
});
//get public assets
app.use(express_1.default.static(__dirname + "/public"));
//add userImages
app.post("/images", function (req, res) {
    var busboy = (0, busboy_1.default)({ headers: req.headers });
    busboy.on("file", function (name, file, info) {
        const { filename, encoding, mimeType } = info;
        var saveTo = __dirname + "/public/userImages/" + filename + ".jpg";
        file.pipe(fs_1.default.createWriteStream(saveTo));
    });
    busboy.on("finish", function () {
        res.writeHead(200, { Connection: "close" });
        res.end("Success");
    });
    return req.pipe(busboy);
});
app.post("/users", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usersWorker = new Users.Worker(); //create new Users worker
        const user = yield usersWorker.addUser(inRequest.body); //add User with atributes specified in request body
        inResponse.json(user); // send added contact as json
    }
    catch (inError) {
        console.log(inError);
        inResponse.send("error");
    }
}));
app.get("/users/:userName", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usersWorker = new Users.Worker();
        const user = yield usersWorker.getUser(inRequest.params.userName);
        inResponse.json(user);
    }
    catch (inError) {
        console.log(inError);
        inResponse.send("error");
    }
}));
app.search("/users/auth", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usersWorker = new Users.Worker();
        const user = yield usersWorker.authUser(inRequest.body.userName, inRequest.body.userPwd);
        inResponse.json(user);
    }
    catch (inError) {
        console.log(inError);
        inResponse.send("error");
    }
}));
app.post("/messages", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messagesWorker = new Messages.Worker(); //create messages worker
        const message = yield messagesWorker.addMessage(inRequest.body); // object created by express .json middleware // send request body to server specified in serverInfo
        inResponse.json(message); //confirmation
    }
    catch (inError) {
        inResponse.send("error");
    }
}));
app.get("/messages/:userId1-:userId2", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messagesWorker = new Messages.Worker();
        const messages = yield messagesWorker.listMessages(inRequest.params.userId1, inRequest.params.userId2); //list messages between two users with userId1 and userId2
        inResponse.json(messages);
    }
    catch (inError) {
        console.log(inError);
        inResponse.send("error");
    }
}));
app.post("/contacts", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contactsWorker = new Users.Worker();
        const user = yield contactsWorker.addContact(inRequest.body.userName, inRequest.body.contactName); //add contact with atributes specified in request body to User specified by userId
        inResponse.json(user); // send added contact as json
    }
    catch (inError) {
        console.log(inError);
        inResponse.send("error");
    }
}));
//on delete request with /contacts/:id end point
app.delete("/contacts/:userName-:contactName", (inRequest, inResponse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contactsWorker = new Users.Worker(); //create new Users worker
        yield contactsWorker.removeContact(inRequest.params.userName, inRequest.params.contactName); //delete contact with anme:contactName to User with name:userName
        inResponse.status(200).json("Success");
    }
    catch (inError) {
        console.log(inError);
        inResponse.send("error");
    }
}));
console.log("Running...");
app.listen(8080); //listen for connections on port 8080
