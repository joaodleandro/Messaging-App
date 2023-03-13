// Library imports.
import axios, { AxiosResponse } from "axios"; //sever comunication
import localforage from "localforage"; //client side local storage

// App imports.
import { config } from "./config";

// Define interface to describe a message.
export interface IMessage {
  _id?: string;
  content: string;
  date?: number;
  userId1: string;
  userId2: string;
}

class LocalDataService {
  //create data store with name messages
  static store = localforage.createInstance({
    name: "messages",
  });

  async getData(key: string): Promise<any> {
    try {
      const result = await LocalDataService.store.getItem(key);
      return result;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async setData(key: string, value): Promise<any> {
    try {
      const result = await LocalDataService.store.setItem(key, value);
      return result;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async removeData(key: string): Promise<boolean> {
    try {
      await LocalDataService.store.removeItem(key);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}

// The worker that will perform user operations.
export class Worker {
  /**
   * Add a message to the server
   *
   * @param   message The message to add.
   * @param   userId1 a user's id participating in the message.
   * @param   userId2 the other user's id participating in the message.
   * @return  The message object, but now with a _id field added.
   */
  public async addMessage(
    message: string,
    userId1: string,
    userId2: string
  ): Promise<IMessage> {

    const response: AxiosResponse = await axios.post(
      `${config.serverAddress}/messages`,
      { content: message, date: Date.now(), userId1: userId1, userId2: userId2 }
    );
    return response.data;
  }

  /**
   * Returns a list of messages between 2 users from the server,
   * if there is no connection to the server gets data locally
   * @param   userId the id of a user
   * @param   contactId the id of another user
   * @return An array of objects, one per message.
   */
  public async listMessages(
    userName: string,
    contactName: string
  ): Promise<IMessage[]> {
    const api = new LocalDataService();
    try {
      const response: AxiosResponse = await axios.get(
        `${config.serverAddress}/messages/${userName}-${contactName}`
      );
      api.setData(
        JSON.stringify({ userName: userName, contactName: contactName }),
        response.data
      );
      return response.data;
    } catch (e) {
      return api.getData(
        JSON.stringify({ userName: userName, contactName: contactName })
      );
    }
  } 
} 
