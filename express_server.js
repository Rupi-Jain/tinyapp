
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');

app.set("view engine", 'ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

const password1 = bcrypt.hashSync("test", 10);
const password2 = bcrypt.hashSync("1234", 10);

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
  if (userFound && bcrypt.compareSync(password, userFound.password)) {
    return userFound; 
  }
  return false;
};

const urlsForUser = (id) => {
  const tempUrlDb = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      tempUrlDb[url] = urlDatabase[url];
    }
  }
  return tempUrlDb;
}

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
  let templateVars = {}; 
  if (userId === undefined) {
    templateVars = {urls: {}, user: usersDb[userId]};    
  } else {
    const userURLs = urlsForUser(userId); 
    templateVars = {urls: userURLs, user: usersDb[userId]};
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  console.log(userId);
  if (userId === undefined) {
    res.redirect("/login");
  } else {
    const templateVars = {urls: urlDatabase, user: usersDb[userId]};
    res.render("urls_new", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const urldbId = req.params.shortURL
  if (urlDatabase.hasOwnProperty(urldbId)) {
    const longURL = urlDatabase[urldbId].longURL;
    return res.redirect(longURL);
  } 
  res.send("Invalid Short URL");
});

app.get("/urls/:shortURL", (req, res) => {  
  const userId = req.cookies['user_id'];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[urldbId].longURL;
  let templateVars = {user: {}};
  if (userId !== undefined) {
    const urldbId = req.params.shortURL;
    if (urlDatabase[urldbId].userID === userId) {
      templateVars = { shortURL, longURL, user: usersDb[userId]}   
    } else {
      return res.send("You are not authorized to access this Page.")
    }
  } 
  res.render('urls_show', templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  if (userId === undefined) {
    return res.send(res.status(400).send("Access Denied"));
  }
  const shortURL = generateRandomString()
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL, userId};
  return res.redirect("/urls/" );         
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies['user_id'];
  console.log(userId);
  if (userId === undefined) {
    return res.send(res.status(400).send("Access Denied"));
  } 
  const shortURL = req.body.shortURL;
  delete urlDatabase[shortURL];
  return res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const userId = req.cookies['user_id'];
  console.log(userId);
  if (userId === undefined) {
    return res.send(res.status(400).send("Access Denied!!! YOU are not authorized to access this page"));
  } 
  const shortURL = req.params.shortURL;
  console.log(req.params, req.body.shortURL)
  urlDatabase[shortURL].longURL = req.body.longURL;
  return res.redirect("/urls");
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
    res.send(res.status(400).send("Password doesn't match"));
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
  return res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
