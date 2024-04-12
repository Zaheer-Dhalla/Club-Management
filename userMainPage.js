import { User, Message } from "./users.js";
import { System } from "./Firebase/system.js";
import { update, ref, onValue } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js';

const system = new System();

function getUserLoggedIn() {
  return new Promise((resolve, reject) => {
    onValue(ref(system.db, "/allUsers/currentUser/userObject"), (snapshot) => {
      const userObj = snapshot.val();
      if (userObj) {
        const user = new User(userObj.fname, userObj.lname, userObj.email, userObj.password, userObj.type, userObj.messages, userObj.paidAmount);

        resolve(user);
      } else {
        reject(new Error("User not found"));
      }
    }, { onlyOnce: true });
  });
}

// Call getUserLoggedIn() to populate globalUser
getUserLoggedIn()
  .then(user => {
    // USER IS A USER OBJECT
    // ALL CODE WILL GO IN THIS AREA TO HAVE ACCESS TO THE USER OBJECT
    document.getElementById('welcome').innerText = "Welcome, " + user.fname.charAt(0).toUpperCase() + user.fname.slice(1) + " " + user.lname.charAt(0).toUpperCase() + user.lname.slice(1) + ", Member";
    document.getElementById('sendMessage').addEventListener('click', () => sendUserMessage());
    document.getElementById('addPayment').addEventListener('click', () => addPayment());
    document.getElementById('logout').addEventListener('click', () => logout());


    // Printing all of the messages that were sent to the user that logged in
    document.getElementById('inboxArea').innerText = user.printMessages();
    checkIfUserPaid();

    // Currently no error checking
    // I haven't checked if this function works yet (will get on it later today)
    function sendUserMessage() {
      let message = new Message(document.getElementById('messageBox').value, user.getName(), new Date().toDateString(), document.getElementById('messageSubject').value);
      let recipient = document.getElementById('recipient').value;
      // Loop through database to find a user with the name in the recipient field. If the user is found, add the message to their inbox and update db
      onValue(ref(system.db, "/allUsers"), (snapshot) => {
        for (let i = 0; i < Object.keys(snapshot.val()).length - 2; i++) {
          if (recipient == snapshot.val()[i].userObject.fname) {
            update(ref(system.db, "/"), {
              [`allUsers/${i}/userObject`]: {
                fname: snapshot.val()[i].userObject.fname,
                lname: snapshot.val()[i].userObject.lname,
                email: snapshot.val()[i].userObject.email,
                password: snapshot.val()[i].userObject.password,
                type: snapshot.val()[i].userObject.type,
                messages: snapshot.val()[i].userObject.messages + message.toString(),
                paidAmount: snapshot.val()[i].userObject.paidAmount
              }
            })
            alert("Message sent!");
            document.getElementById('messageBox').value = "";
            document.getElementById('messageSubject').value = "";
            document.getElementById('recipient').value = "";
            return;
          }
        }
        alert("Recipient Not Found");
      }, { onlyOnce: true })
    }
    function addPayment() {
      let amountToAdd = document.getElementById('payAmount').value;
      if (amountToAdd == "" || parseFloat(amountToAdd) <= 0) {
        alert("Please enter a valid amount");
        return;
      }
      let castedAmount = parseFloat(amountToAdd);
      onValue(ref(system.db, "/allUsers"), (snapshot) => {
        for (let i = 0; i < Object.keys(snapshot.val()).length - 3; i++) {
          if (snapshot.val()[i].userObject.fname == user.fname && snapshot.val()[i].userObject.lname == user.lname) {
            console.log(user);
            user.paidAmount += castedAmount;
            update(ref(system.db, "/"), {
              [`allUsers/${i}/userObject`]: {
                fname: user.fname,
                lname: user.lname,
                email: user.email,
                password: user.password,
                type: user.type,
                messages: user.messages,
                paidAmount: user.paidAmount
              },
              [`allUsers/currentUser/userObject`]: {
                fname: user.fname,
                lname: user.lname,
                email: user.email,
                password: user.password,
                type: user.type,
                messages: user.messages,
                paidAmount: user.paidAmount
              }
            })
            alert("Payment Added!");
            document.getElementById('payAmount').value = "";
            checkIfUserPaid();
            return;
          }
        }
        alert("Error ocurred :(");

        return;
      }, { onlyOnce: true })
    }
    function checkIfUserPaid() {
      onValue(ref(system.db, "/allUsers/amountDue"), (snapshot) => {
        if (user.paidAmount < snapshot.val()) {
          document.getElementById('userPayStatus').innerText = "You owe $" + (snapshot.val() - user.paidAmount).toFixed(2) + "! Please make a payment!";
          return;
        }
        document.getElementById('userPayStatus').innerText = "You are up-to-date on payments :)";
      })
    }
    function logout() {
      window.location.href = "index.html";
    }


  })
  .catch(error => {
    console.error(error);
  });
