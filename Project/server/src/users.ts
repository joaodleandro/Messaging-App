import * as path from "path";
import Datastore from "nedb";

export interface IUser {
  _id: string;
  encryptedPassword: string;
  contacts?: string[];
}

export class Worker {
  private db: Nedb;
  constructor() {
    this.db = new Datastore({
      filename: path.join(__dirname, "users.db"), // database file path
      autoload: true,
    });
  }

  public addUser(inUser: IUser): Promise<IUser> {
    return new Promise((inResolve, inReject) => {
      this.db.insert(inUser, (inError: Error | null, inNewDoc: IUser) => {
        // insert user into data base, inserted value is returned as inNewDoc
        if (inError) {
          inReject(inError);
        } else {
          inResolve(inNewDoc);
        }
      });
    });
  }

  public addContact(userName: string, contactName: string): Promise<IUser> {
    return new Promise((inResolve, inReject) => {
      this.db.update(
        { _id: userName },
        { $push: { contacts: contactName } },
        { returnUpdatedDocs: true },
        (
          inError: Error | null,
          numberOfupdated: number,
          affectedDocs: IUser
        ) => {
          // insert contact into user in data base, inserted value is returned as inNewDoc
          if (inError) {
            inReject(inError);
          } else {
            inResolve(affectedDocs);
          }
        }
      );
    });
  }

  public removeContact(userName: string, contactName: string): Promise<void> {
    return new Promise((inResolve, inReject) => {
      this.db.update(
        { _id: userName },
        { $pull: { contacts: contactName } },
        {},
        (inError: Error | null, numberOfupdated: number) => {
          // insert contact into user in data base, inserted value is returned as inNewDoc
          if (inError) {
            inReject(inError);
          } else {
            inResolve();
          }
        }
      );
    });
  }

  public getUser(userName: string): Promise<IUser> {
    return new Promise((inResolve, inReject) => {
      this.db.findOne(
        { _id: userName },
        (inError: Error | null, inDocs: IUser) => {
          // find user in database, and put them in inDocs
          if (inError) {
            inReject(inError);
          } else {
            inResolve(inDocs);
          }
        }
      );
    });
  }

  public authUser(userName: string, userPwd: string): Promise<IUser> {
    return new Promise((inResolve, inReject) => {
      this.db.findOne(
        { _id: userName, encryptedPassword: userPwd },
        (inError: Error | null, inDocs: IUser) => {
          if (inError) {
            inReject(inError);
          } else {
            inResolve(inDocs);
          }
        }
      );
    });
  }
}
