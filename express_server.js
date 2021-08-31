
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", 'ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase.hasOwnProperty(req.params.shortURL)) {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  } else {
    res.send("Invalid Short URL");
  }
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase.hasOwnProperty(req.params.shortURL)) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
    res.render("urls_show", templateVars);
  } else {
    res.send("Invalid Short URL");
  }

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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
