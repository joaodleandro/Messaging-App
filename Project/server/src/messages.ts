import * as path from "path";
import Datastore from "nedb";

export interface IMessage {
  _id?: string;
  content: string;
  date?: number;
  userId1: string;
  userId2: string;
}

export class Worker {
  private db: Nedb;
  constructor() {
    this.db = new Datastore({
      filename: path.join(__dirname, "messages.db"), // database file path
      autoload: true,
    });
  }

  public addMessage(message: IMessage): Promise<IMessage> {
    return new Promise((inResolve, inReject) => {
      this.db.insert(message, (inError: Error | null, inNewDoc: IMessage) => {
        // insert message into data base, inserted value is returned as inNewDoc
        if (inError) {
          inReject(inError);
        } else {
          inResolve(inNewDoc);
        }
      });
    });
  }

  public listMessages(userId1: string, userId2: string): Promise<IMessage[]> {
    return new Promise((inResolve, inReject) => {
      this.db.find(
        {
          $or: [
            { userId1: userId1, userId2: userId2 },
            { userId1: userId2, userId2: userId1 },
          ],
        },
        (inError: Error | null, inDocs: IMessage[]) => {
          // find messages in database between two users with userId1 and userId2, and put them in inDocs
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
