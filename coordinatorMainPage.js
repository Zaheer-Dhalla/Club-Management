import { Coordinator, Message } from "./users.js";
import { System } from "./Firebase/system.js";
import { update, ref, onValue } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js';

const system = new System();

function getUserLoggedIn() {
  return new Promise((resolve, reject) => {
    onValue(ref(system.db, "/allUsers/currentUser/userObject"), (snapshot) => {
      const userObj = snapshot.val();
      if (userObj) {
        const user = new Coordinator(userObj.fname, userObj.lname, userObj.email, userObj.password, userObj.type, userObj.messages, userObj.paidAmount);

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
    // USER IS A COORDINATOR OBJECT
    // ALL CODE WILL GO IN THIS AREA TO HAVE ACCESS TO THE USER OBJECT
    document.getElementById('welcome').innerText = "Welcome, " + user.fname.charAt(0).toUpperCase() + user.fname.slice(1) + " " + user.lname.charAt(0).toUpperCase() + user.lname.slice(1) + ", " + user.type;
    document.getElementById('sendMessage').addEventListener('click', () => sendUserMessageNow());
    document.getElementById('requestPayment').addEventListener('click', () => requestPayment());
    document.getElementById('submitUserSort').addEventListener('click', () => showMembers());
    document.getElementById('paymentReminder').addEventListener('click', () => sendReminder());
    document.getElementById('logout').addEventListener('click', () => logout());


    onValue(ref(system.db, "/allUsers"), (snapshot) => {
      document.getElementById('memberCost').innerText = "All Users Currently Owe: $" + snapshot.val().amountDue;
    })



    showMembers();
    initRevenue();

    // Printing all of the messages that were sent to the user that logged in
    document.getElementById('inboxArea').innerText = user.printMessages();

    function sendUserMessageNow() {
      sendUserMessage(document.getElementById('messageBox').value, user.getName(), new Date().toDateString(), document.getElementById('messageSubject').value, document.getElementById('recipient').value);
      alert("Message sent!");
    }
    function sendUserMessage(messageText, sender, date, subject, recipient) {
      let message = new Message(messageText, sender, date, subject);
      // Loop through database to find a user with the name in the recipient field. If the user is found, add the message to their inbox and update db
      onValue(ref(system.db, "/allUsers"), (snapshot) => {
        for (let i = 0; i < Object.keys(snapshot.val()).length - 3; i++) {
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
            return;
          }
        }
        alert("Recipient Not Found");
      }, { onlyOnce: true })
      document.getElementById('recipient').value = "";
      document.getElementById('messageSubject').value = "";
      document.getElementById('messageBox').value = "";
    }

    function requestPayment() {

      let amountToAdd = document.getElementById('paymentIncrease').value;
      if (amountToAdd == "" || parseFloat(amountToAdd) <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      let castedAmount = parseFloat(amountToAdd);


      onValue(ref(system.db, "/allUsers/amountDue"), (snapshot) => {

        let currentAmount = parseFloat(snapshot.val());

        let newAmount = currentAmount + castedAmount;
        update(ref(system.db, "/"), {
          ['allUsers/amountDue']: newAmount


        })
      }, { onlyOnce: true })
      alert("amount requested from all users");
      document.getElementById('paymentIncrease').value = "";
    }

    function showMembers() {
      let filter = document.getElementById('sortMembers').value;

      onValue(ref(system.db, "/allUsers"), (snapshot) => {
        let members = [];
        let memberPayments = [];
        for (let i = 0; i < Object.keys(snapshot.val()).length - 3; i++) {
          let currentUser = snapshot.val()[i].userObject.fname + " " + snapshot.val()[i].userObject.lname;
          if (snapshot.val()[i].userObject.type == "User") {
            if (filter == "All Members" || filter == "Most Frequently Seen") {
              document.getElementById('paymentReminder').disabled = true;
              members.push(currentUser);
              memberPayments.push(snapshot.val()[i].userObject.paidAmount);
            }
            else if (filter == "Members With Outstanding Payments") {
              document.getElementById('paymentReminder').disabled = false;
              if (snapshot.val()[i].userObject.paidAmount < snapshot.val().amountDue) {
                members.push(currentUser);
                memberPayments.push(snapshot.val()[i].userObject.paidAmount);
              }
            }
            else {
              document.getElementById('paymentReminder').disabled = true;
              if (snapshot.val()[i].userObject.paidAmount >= snapshot.val().amountDue) {
                members.push(currentUser);
                memberPayments.push(snapshot.val()[i].userObject.paidAmount);
              }
            }

          }
        }

        let memberStr = "";
        for (let i = 0; i < members.length; i++) {

          if (filter == "Most Frequently Seen") {

            let zipped = memberPayments.map((item, index) => [item, members[index]]);
            zipped.sort((a, b) => b[0] - a[0]);

            let sortedPayments = zipped.map(pair => pair[0]);
            let sortedMembers = zipped.map(pair => pair[1]);

            memberStr += (i + 1) + ".) " + sortedMembers[i] + ": Amount Paid - $" + sortedPayments[i] + "\n";
          }

          else { memberStr += (i + 1) + ".) " + members[i] + ": Amount Paid - $" + memberPayments[i] + "\n"; }
        }
        document.getElementById('showMembers').innerText = memberStr;
      }, { onlyOnce: true })

    }
    function initRevenue() {
      let userFunds = 0;
      onValue(ref(system.db, "/allUsers"), (snapshot) => {
        for (let i = 0; i < Object.keys(snapshot.val()).length - 3; i++) {
          if (snapshot.val()[i].userObject.type == "User") {
            userFunds += parseFloat(snapshot.val()[i].userObject.paidAmount);
          }
        }

        let financeTable = document.getElementById('costs');
        financeTable.rows[1].cells[0].innerHTML = "Member payments: $" + userFunds;
        financeTable.rows[1].cells[1].innerHTML = "Rent: $" + 549.99 + "<br>" + "Utilities: $" + 67.99 + "<br>" + "Resources: $" + 32.87 + "<br>" + "Food: $" + 100.00 + "<br>" + "Miscellaneous: $" + 30.00;
        let allExpenses = 780.85;
        if (allExpenses > userFunds) {
          document.getElementById('profitTitle').innerText = "Profit (Net Loss): -$" + + (allExpenses - userFunds).toFixed(2);
          document.getElementById('profit').innerText = "-$" + (allExpenses - userFunds).toFixed(2);
        }
        else {
          document.getElementById('profitTitle').innerText = "Profit (Net Gain): +$" + (allExpenses - userFunds).toFixed(2);
        }
      }, { onlyOnce: true })
    }

    function sendReminder() {

      onValue(ref(system.db, "/allUsers"), (snapshot) => {
        for (let i = 0; i < Object.keys(snapshot.val()).length - 3; i++) {
          if (snapshot.val()[i].userObject.type == "User") {
            if (snapshot.val()[i].userObject.paidAmount < snapshot.val().amountDue) {
              sendUserMessage("Please pay your outstanding payments", user.fname, new Date().toDateString(), "Outstanding Payments", snapshot.val()[i].userObject.fname);
            }
          }
        }
        alert("Payment reminder sent to corresponding users");
      }, { onlyOnce: true })
    }

    function logout() {
      window.location.href = "index.html";
    }

  })
  .catch(error => {
    console.error(error);
  });








