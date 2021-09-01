
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", 'ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

const usersDb = { 
  "b12b34": {
    id: "b12b34", 
    email: "rupi.jain@gmail.com", 
    password: "test"
  },
 "a123D4": {
    id: "a123D4", 
    email: "sheenu@example.com", 
    password: "1234"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const findUserByEmail = (email, usersDb) => {
  for (let userId in usersDb) {
    if (usersDb[userId].email === email) {
      return usersDb[userId]; // return the user object
    }
  }
  return false;
};

const authenticateUser = (email, password, usersDb) => {
  const userFound = findUserByEmail(email, usersDb);
  if (userFound && userFound.password === password) {
    return userFound; 
  }
  return false;
};

app.get("/login", (req, res) => {
  const templateVars = {user: ""};
  res.render("login", templateVars);
});
app.get("/register", (req, res) => {
  const templateVars = {user: ""};
  res.render("register", templateVars);
});
app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls/");
});
app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = {urls: urlDatabase, user: usersDb[userId]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = {urls: urlDatabase, user: usersDb[userId]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {  
  const userId = req.cookies['user_id'];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: usersDb[userId]}
  res.render('urls_show', templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls/" );         
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.body.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.body.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const emailFound = findUserByEmail(email, usersDb)
  if(!emailFound) {
    return res.send(res.status(403).send("Email doesn't exists!!!"))
  }
  const user = authenticateUser(email, password, usersDb);
  console.log("user:", user.id)
  if (user) {
    res.cookie("user_id", user.id);
    res.redirect("/urls/");
  } else {
    res.send(res.statusCode = 400);
  }
  
});


app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const {email, password} = req.body;
  //check if email is not empty
  if (email === "") {
    return res.send(res.status(400).send("You can't leave eamil blank!!"));
  }
  //Verifying if user's email already exists
  const userFound = findUserByEmail(email, usersDb);
  console.log(userFound);
  if (userFound) {
    return res.send(res.statusCode = 400);
  }
  const user = {
    id: userID,
    email,
    password 
  }
  usersDb[userID] = user;
  res.cookie("user_id", userID)
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
