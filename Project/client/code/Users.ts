// Library imports.
import axios, { AxiosResponse } from "axios"; //sever comunication
import { enc, MD5 } from "crypto-js"; //encoding
import localforage from "localforage"; //client side local storage

// App imports.
import { config } from "./config";


// Define interface to describe a user. a user is created without contacts so it is optional,
// and image is also optional
export interface IUser {
  _id: string;
  encryptedPassword: string;
  contacts?: string[];
  userImg?: string;
}

class LocalDataService {
  //create data store with name users
  static store = localforage.createInstance({
    name: "users",
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
      const result = await LocalDataService.store.removeItem(key);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}

export class Worker {

  //Check if rememberMe token is set, to bypass login
  public async checkRememberUser(): Promise<string> {
    const api = new LocalDataService();
    const userName = await api.getData("rememberMe");
    if (userName) {
      return userName as string;
    } else return null;
  }

  //unset rememberMe on logout
  public async unsetRememberUser(): Promise<boolean> {
    const api = new LocalDataService();
    return await api.removeData("rememberMe");
  } 

  /**
   * Get a user from the server, unless user information is already
   * stored locally
   * @param   userName The user's name.
   * @return  The User object.
   */
  public async getUser(userName: string): Promise<IUser> {
    const api = new LocalDataService();
    try {
      const user = await api.getData(userName);
      if (user) {
        return user;
      } else {
        const response: AxiosResponse = await axios.get(
          `${config.serverAddress}/users/${userName}`
        );
        if(response.data) {
          await api.setData(userName, response.data);
        }
        return response.data;
      }
    } catch (e) {
      console.log("get user error: " + e);
    }
  } 

  /**
   * Authenticate a user, checking if user name and password exist in server data base,
   * also if rememberUser is true, sets rememberMe token
   *
   * @param   inName The name of the user.
   * @param   userPwd The unencrypted user password.
   * @param   rememberUser Boolean to remember user or not.
   * @return  The inUser object, but now with a _id field added.
   */
  public async authUser(userName: string, userPwd: string, rememberUser: boolean): Promise<IUser> {
    let encryptedPwd = MD5(userPwd).toString(enc.Hex);

    const response: AxiosResponse = await axios({
      method: "search",
      url: `${config.serverAddress}/users/auth`,
      data: { userName: userName, userPwd: encryptedPwd },
    });
    if (response.data && rememberUser) {
      const api = new LocalDataService(); // set rememberUser
      await api.setData("rememberMe", response.data._id);
      await api.setData(userName, response.data);
    }
    return response.data;
  } 

  /**
   * Add a user to the server.
   *
   * @param   inUser The contact to add.
   * @return  The inUser object, but now with a _id field added.
   */
  public async addUser(userName: string, userPwd: string, rememberUser: boolean): Promise<IUser> {

    let encryptedPwd = MD5(userPwd).toString(enc.Hex);

    const response: AxiosResponse = await axios.post(
      `${config.serverAddress}/users`,
      { _id: userName, encryptedPassword: encryptedPwd }
    );
    if (response.data && rememberUser) {
      const api = new LocalDataService(); // set rememberUser
      await api.setData("rememberMe", response.data._id);
    }
    return response.data;
  } 

  /**
   * Add a contact to a user on the server.
   *
   * @param   userName the id of the user to which the contact will be added
   * @param   contactId the id of the user which will be added as a contact to a user
   */
  public async addContact(
    userName: string,
    contactName: string
  ): Promise<string> {
    if (await this.getUser(contactName)) {
      let response = await axios.post(`${config.serverAddress}/contacts`, {
        userName: userName,
        contactName: contactName,
      });
      return response.data;
    } else {
      return "contact doesnt exist";
    }
  } 

  /**
   * Returns a list of a users contacts from the server.
   * @param   user a User object representing the user whose contacts will be returned
   * @return An array of objects, one per contact.
   */
  public async listContacts(user: IUser): Promise<IUser[]> {
    return await Promise.all(
      user.contacts.map(async (contactName) => {
        return await this.getUser(contactName);
    }))
  } 

  /**
   * Delete a contact from the server.
   * @param   userName the name of the user from which the contact will be deleted
   * @param   contactName the name of the user which will be deleted from the user
   */
  public async deleteContact(
    userName: string,
    contactName: string
  ): Promise<void> {
    await axios.delete(
      `${config.serverAddress}/users/${userName}-${contactName}`
    );
  } 
} 
