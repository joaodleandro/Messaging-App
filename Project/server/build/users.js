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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
const path = __importStar(require("path"));
const nedb_1 = __importDefault(require("nedb"));
class Worker {
    constructor() {
        this.db = new nedb_1.default({
            filename: path.join(__dirname, "users.db"),
            autoload: true,
        });
    }
    addUser(inUser) {
        return new Promise((inResolve, inReject) => {
            this.db.insert(inUser, (inError, inNewDoc) => {
                // insert user into data base, inserted value is returned as inNewDoc
                if (inError) {
                    inReject(inError);
                }
                else {
                    inResolve(inNewDoc);
                }
            });
        });
    }
    addContact(userName, contactName) {
        return new Promise((inResolve, inReject) => {
            this.db.update({ _id: userName }, { $push: { contacts: contactName } }, { returnUpdatedDocs: true }, (inError, numberOfupdated, affectedDocs) => {
                // insert contact into user in data base, inserted value is returned as inNewDoc
                if (inError) {
                    inReject(inError);
                }
                else {
                    inResolve(affectedDocs);
                }
            });
        });
    }
    removeContact(userName, contactName) {
        return new Promise((inResolve, inReject) => {
            this.db.update({ _id: userName }, { $pull: { contacts: contactName } }, {}, (inError, numberOfupdated) => {
                // insert contact into user in data base, inserted value is returned as inNewDoc
                if (inError) {
                    inReject(inError);
                }
                else {
                    inResolve();
                }
            });
        });
    }
    getUser(userName) {
        return new Promise((inResolve, inReject) => {
            this.db.findOne({ _id: userName }, (inError, inDocs) => {
                // find user in database, and put them in inDocs
                if (inError) {
                    inReject(inError);
                }
                else {
                    inResolve(inDocs);
                }
            });
        });
    }
    authUser(userName, userPwd) {
        return new Promise((inResolve, inReject) => {
            this.db.findOne({ _id: userName, encryptedPassword: userPwd }, (inError, inDocs) => {
                if (inError) {
                    inReject(inError);
                }
                else {
                    inResolve(inDocs);
                }
            });
        });
    }
}
exports.Worker = Worker;
