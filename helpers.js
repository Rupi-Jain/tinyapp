const findUserByEmail = (email, usersDb) => {
  console.log("Email:", email);
  for (let userId in usersDb) {
    if (usersDb[userId].email === email) {
      return usersDb[userId]; // return the user object
    }
  }
  return false;
};

module.exports = {
  findUserByEmail
};