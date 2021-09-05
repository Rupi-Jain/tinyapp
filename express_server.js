
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const {findUserByEmail} = require("./helpers.js");
const cookieSession = require('cookie-session')


app.set("view engine", 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1','key2']
}))

//generates a random string
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}


const password1 = bcrypt.hashSync("test", 10);
const password2 = bcrypt.hashSync("1234", 10);

// Defining Database of Users
const usersDb = { 
  "b12b34": {
    id: "b12b34", 
    email: "rupi.jain@gmail.com", 
    password: password1 
  },
 "a123D4": {
    id: "a123D4", 
    email: "sheenu@example.com", 
    password: password2
  }
}

// Defining Database of URL's
const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "b12b34"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "a123D4"
  },
  d5UfxQ: {
    longURL: "https://www.yahoo.com",
    userID: "b12b34"
},
};

// Defining User-authentication function
const authenticateUser = (email, password, usersDb) => {
  const userFound = findUserByEmail(email, usersDb); // findUserByEmail function returns an user object
  if (userFound && bcrypt.compareSync(password, userFound.password)) {
    return userFound; 
  }
  return false;
};

//returns the object og url's for a logged in user 
const urlsForUser = (id, urlDatabase) => {
  const tempUrlDb = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      tempUrlDb[url] = urlDatabase[url];
    }
  }
  return tempUrlDb;
}

app.get("/", (req, res) => {
  const userId = req.session.user_id;
  if (userId === undefined) {    //checks if user is logged in
    const templateVars = {user: ""};
    return res.render("login", templateVars);
  } 
  const userURLs = urlsForUser(userId, urlDatabase);  //returning an object of url's for logged in user
  templateVars = {urls: userURLs, user: usersDb[userId]};
  res.render("urls_index", templateVars)
});

app.get("/login", (req, res) => {
  const templateVars = {user: ""};
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {user: ""};
  if (userId === undefined) {     //checks if user is logged in
    return res.render("register", templateVars);
  }
  res.redirect("/urls");
});

// app.get("/logout", (req, res) => {
//   req.session = null;
//   //const templateVars = {urls: {}, user: {}};
//   //res.render("urls_index", templateVars);
//   res.redirect("/urls");
// });
// app.get("/logout", (req, res) => {
//   req.session = null;
//   //const templateVars = {urls: {}, user: {}};
//   //res.render("urls_index", templateVars);
//   res.redirect("/urls");
// });
app.post("/logout", (req, res) => {
  req.session = null;
  //const templateVars = {urls: {}, user: {}};
  //res.render("urls_index", templateVars);
  res.redirect("/urls");
});

app.get("/errors", (req, res) => {
  res.render("/errors");
});


app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (userId === undefined) {     //checks if user is logged in
    const templateVars = {urls: {}, user: {}};
    return res.render("urls_index", templateVars);
  };  
  const userURLs = urlsForUser(userId, urlDatabase); //returning an object of url's for logged in user
  const templateVars = {urls: userURLs, user: usersDb[userId]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (userId === undefined) {     //checks if user is logged in
    return res.redirect("/login");
  } 
  const templateVars = {urls: urlDatabase, user: usersDb[userId]};
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  if (urlDatabase.hasOwnProperty(shortURL)) { //checks if the provided shortUrl exists in urlDatabase
    const longURL = urlDatabase[shortURL].longURL;
    return res.redirect(longURL);
  } 
  res.status(400);
  const templateVars = {user: "", message: "URL dosn't exists!! Please try again.."};
  return res.render("errors", templateVars);    
});

app.get("/urls/:shortURL", (req, res) => {  
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
 
  if (userId === undefined) {     //checks if user is logged in
    const templateVars = {user: "", message: "Please login before proceed..."};
    return res.render("errors", templateVars);
  } 
  if (! urlDatabase.hasOwnProperty(shortURL)) {   //checks if the provided shortUrl exists in urlDatabase
    const templateVars = {user: "", message: "URL dosn't exists!! Please try again.."};
    return res.render("errors", templateVars);    
  }
  if (urlDatabase[shortURL].userID !== userId) {  //checks if logged in user and url's user is same
    const templateVars = {user: "", message: "Access Denied!!! You are not authorized"};
    return res.render("errors", templateVars);    
  }
  const  longURL = urlDatabase[shortURL].longURL;
  templateVars = { shortURL, longURL, user: usersDb[userId]}   
  res.render('urls_show', templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;   //getting userId from seesion variable
  if (userID === undefined) {     //checks if the user is logged in
    const templateVars = {user: "", message: "Please login before proceed..."};
    return res.render("errors", templateVars);
  }  
  const shortURL = generateRandomString()  // returning random string for url
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL, userID}; //adding new url to urlDatabase
  res.redirect("/urls/" );      
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.body.shortURL;
 
  if (userId === undefined) {      //checks if user is logged in
    const templateVars = {user: "", message: "Please login before proceed..."};
    return res.render("errors", templateVars);
  } 
  if (urlDatabase[shortURL].userID !== userId) { //checks if logged in user and url's user is same
    const templateVars = {user: "", message: "Access Denied!!! You are not authorized"};
    return res.render("errors", templateVars);    
  }
  delete urlDatabase[shortURL];  //deleting url from urlDatabase
  return res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;

  if (userId === undefined) {   //checks if user is logged in
    const templateVars = {user: "", message: "Please login before proceed..."};
    return res.render("errors", templateVars);
  } 
  if (urlDatabase[shortURL].userID !== userId) {  //checks if logged in user and url's user is same
    const templateVars = {user: "", message: "Access Denied!!! You are not authorized to access this url"};
    return res.render("errors", templateVars);    
  }
  urlDatabase[shortURL].longURL = req.body.longURL; //updating the long url in the urlDatabse
  return res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const {email, password} = req.body;
  if (email === "" || password === "") { //checking both user name and password 
    const templateVars = {user: "", message: "You can't leave Email or password blank."};
    return res.render("errors", templateVars);
  }
  const user = authenticateUser(email, password, usersDb); //returns the user object if finds a match
  if (user) {
    req.session.user_id = user.id;
    return res.redirect("/urls/");
  } 
  const templateVars = {user: "", message: "Email or password doesn't match. Try again!"};
  res.render("errors", templateVars);
});


app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const {email, password} = req.body;
  //check if email and password are not empty
  if (email === "" || password === "") {
    const templateVars = {user: "", message: "You can't leave eamil or password blank!!"};
    return res.render("errors", templateVars);
  }
  //verifying if user's email already exists
  const userFound = findUserByEmail(email, usersDb);
  if (userFound) {
    const templateVars = {user: "", message: "Email already exists!!"};
    return res.render("errors", templateVars);
  }
  //setting values to user object
  const user = {
    id: userID,
    email,
    password: bcrypt.hashSync(password, 10)
  }

  usersDb[userID] = user; // adding a new user to usersDb
  req.session.user_id = userID; 
  const userURLs = urlsForUser(userID, urlDatabase); 
  templateVars = {urls: userURLs, user};
  return res.render("urls_index", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
