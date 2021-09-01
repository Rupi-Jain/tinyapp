
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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/urls", (req, res) => {
  if (req.cookies['username']) {
    const templateVars = {urls: urlDatabase, username: req.cookies['username']};
    console.log(req.cookies);
    res.render("urls_index", templateVars);
  } else {
    const templateVars = {urls: {}, username: req.cookies['username']};
    res.render("urls_index", templateVars);
  }
 
});

app.get("/urls/new", (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies['username']};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {  
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies['username']}
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
  console.log(req.body.username);
  res.cookie("username", req.body.username)

  res.redirect("/urls/");
});

app.post("/logout", (req, res) => {
  //console.log(req.body.username);
  res.cookie("username", "")
  //res.clearCookie("username");
  console.log("Log out")
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
