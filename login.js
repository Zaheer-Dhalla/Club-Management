//import {User, Coordinator, Coach} from "./users.js"
import { System } from "./Firebase/system.js"
import { update, ref, onValue } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js';

const system = new System();
document.getElementById('attemptLogin').addEventListener('click', () => attemptLogin())


function attemptLogin() {

  let username = document.getElementById('username').value;
  let password = document.getElementById('password').value;
  if (username == "" || password == "") {
    alert("Please enter a username and password");
  }
  else {
    // Loop over all database entries until the account is found
    onValue(ref(system.db, "/allUsers"), (snapshot) => {
      for (let i = 0; i < Object.keys(snapshot.val()).length - 3; i++) {
        if (username == snapshot.val()[i].userObject.fname && password == snapshot.val()[i].userObject.password) {
          let userLoggedIn = snapshot.val()[i].userObject;
          update(ref(system.db, "/"), {
            [`allUsers/currentUser`]: {
              userObject: userLoggedIn
            },

          })


          alert("Login Successful");
          switch (userLoggedIn.type) {
            case "Coordinator":
              window.location.href = "coordinatorMainPage.html";
              return true;
            case "User":
              window.location.href = "userMainPage.html";
              return true;
            default:
              return true;
          }
        }
      }
      alert("Login failed");
      return false;
    }, { onlyOnce: true })
  }
}




