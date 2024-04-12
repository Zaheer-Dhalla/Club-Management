// General User Data Type
class User {
  constructor(fname, lname, email, password, type, message, paidAmount) {
    this.fname = fname;
    this.lname = lname;
    this.email = email;
    this.password = password;
    this.type = type;
    this.messages = message;
    this.paidAmount = paidAmount;
  }
  getName() { return this.fname + " " + this.lname; }

  printMessages() {
    return this.messages;
  }
}


// Data Type for Coordinators
class Coordinator extends User {
  constructor(fname, lname, email, password, type, message, paidAmount) {
    super(fname, lname, email, password, type, message, paidAmount);
  }
}
// Messages sent between users will have this type
class Message {
  constructor(message, sender, timeStamp, subject) {
    this.message = message;
    this.sender = sender;
    this.timeStamp = timeStamp;
    this.subject = subject;
  }

  toString() {
    let str = "";
    str += "Date Sent: " + this.timeStamp + "\n";
    str += "Sent From: " + this.sender + "\n";
    str += "Subject: " + this.subject + "\n\n";
    str += this.message + "\n";
    str += "------------------------------------------\n";
    return str;
  }
}

export { User, Coordinator, Message }
