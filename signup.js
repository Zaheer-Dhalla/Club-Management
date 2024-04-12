import { User, Coordinator } from "./users.js"
import { System } from "./Firebase/system.js"
import { update, ref, onValue } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js';

const system = new System();
document.getElementById('attemptSignUp').addEventListener('click', () => attemptSignup())
let t = 2;
function attemptSignup() {
  // Based on whether the user is a coordinator, coach, or a regular user, instantiate the correct type of object defined in users.js
  let firstName = document.getElementById("fname").value;
  let lastName = document.getElementById("lname").value;
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  let role = document.getElementById("roles").value;
  let user;
  if (firstName == "" || lastName == "" || email == "" || password == "") {
    alert("Please fill out all fields");
  }
  else
    if (role == "coordinator") { user = new Coordinator(firstName, lastName, email, password, "Coordinator", "", 0.0); }
    else { user = new User(firstName, lastName, email, password, "User", "", 0.0); }
  console.log(user);
  // Add the user to the database
  addUserToDB(user);
  
  document.getElementById('signUpComplete').innerText = "Account Creation Successful. Redirecting you in 3";
  let countDown = setInterval(() => {
     if (t == 0){clearInterval(countDown);}
     document.getElementById('signUpComplete').innerText = "Account Creation Successful. Redirecting you in " + t;
      t--;
  }, 1000);
  setTimeout(() => window.location.href = "index.html", 2800);

}
function addUserToDB(user) {
  onValue(ref(system.db, "/allUsers/userNumber"), (snapshot) => {

    update(ref(system.db, "/"), {
      [`allUsers/${snapshot.val()}`]: {
        userObject: user
      },

      [`allUsers/userNumber`]: snapshot.val() + 1,
    })
  }, { onlyOnce: true })
}

