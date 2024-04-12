//import { User, Coordinator, Coach } from "./users.js"
import { System } from "./Firebase/system.js"
import { update, ref, onValue } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js';


// DATABASE PROPERTIES
const system = new System();

// Adding event listeners for all of the buttons on index.html
document.getElementById('login').addEventListener('click', () => loginPressed())
document.getElementById('signUp').addEventListener('click', () => signUpPressed())



// Redirect user to login page
function loginPressed() {
  window.location.href = "login.html";
}
// Redirect user to signup page
function signUpPressed() {
  window.location.href = "signup.html";
}



// DATABASE FUNCTIONS (CURRENTLY JUST TESTING)

// This function is used to initialize the database when it is empty (due to the first time the database is accessed or, if the database is wiped for some reason)
function initDB() {
  onValue(ref(system.db, "/allUsers/userNumber"), (snapshot) => {
    if (snapshot.val() === null) {
      update(ref(system.db, "/"), {
        ['allUsers']: {
          userNumber: 0,
          amountDue: 0
        }
      })
    }

  }, { onlyOnce: true })
}

// Testing function to add users to the database (IT WORKS :) )
initDB();
