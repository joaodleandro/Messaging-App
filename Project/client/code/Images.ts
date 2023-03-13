// Library imports.
import axios from "axios"; //sever comunication
import localforage from "localforage"; //client side local storage

// App imports.
import { config } from "./config";

import userDefaultImg from "../assets/userDefault.png"; // image for user, if user does not set custom image

class LocalDataService {
  //create data store with name images
  static store = localforage.createInstance({
    name: "images"
  });

  
  async getData(key: string): Promise<any> {
    try {
      const result = await LocalDataService.store.getItem(key);
      return result;
    } catch (e) {
      console.log(e)
      return null;
    }
  }

  async setData(key: string, value): Promise<any> {
    try {
      const result = await LocalDataService.store.setItem(key, value);
      return result;
    } catch (e) {
      console.log(e)
      return null;
    }
  }

  async removeData(key: string): Promise<boolean> {
    try {
      await LocalDataService.store.removeItem(key);
      return true;
    } catch (e) {
      console.log(e)
      return false;
    }
  }

}

export class Worker {

  /**
   * Upload custom user image to server, saved as a Blob object
   * 
   * @param   dataUrl A URL object base64 coded, representing an image.
   * @param   fileName The name with which the file will be saved.
   * @return  true on success, false on failure.
   */
  public async uploadUserImg(dataUrl: URL, fileName: string): Promise<boolean> {
    try {
      console.log(dataUrl)
      const blob: Blob = await (await fetch(dataUrl)).blob(); //convert dataUrl to an http response and the response to Blob object
      const form = new FormData();
  
      form.append("file", blob, fileName); //append Blob object containing image to a form of type "file"
      await axios.post(
        `${config.serverAddress}/images`,
        form
      );
      return true;
    } catch(e) {
      console.log("error uploading img:" + e)
      return false
    }
  } 

  /**
   * Download custom user image from server and store it locally,
   * unless its already stored
   * 
   * @param   userName A user's name, with which the file is saved.
   * @return  A string containing a URL pointing to an image.
   */
  public async downloadUserImg(userName: string): Promise<string> {
    const api = new LocalDataService();
    try {
      const userImg = await api.getData(userName);
      if (userImg) {
        if(userImg === 'default') return userDefaultImg
        else return URL.createObjectURL(userImg as Blob);
      } else {
        const foo = await fetch(`${config.serverAddress}/userImages/${userName}.jpg`)
        const blob = await (
          foo
        ).blob();
        //if there are no images with userName in server, means user did not set custom image,
        //response returns with error, and blob representation of response is of type "text/html"
        //using this information we return userDefaultImg
        if(blob.type === 'text/html') { 
          await api.setData(userName, 'default');
          return userDefaultImg;
        }
        else {
          await api.setData(userName, blob);
          return URL.createObjectURL(blob);
        }
      }
    } catch (e) {
      console.log("download Img error: " + e);
    }
  } 

}