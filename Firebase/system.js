import {initializeApp} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {getDatabase} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";
import {firebaseConfig} from './config.js';

class System{
  constructor(){
    this.app = initializeApp(firebaseConfig); // Connect firebase app
    this.db = getDatabase(this.app); // Get database for this specific app
  }
}

export{System};
