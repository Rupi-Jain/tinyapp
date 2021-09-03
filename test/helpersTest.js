const { assert } = require('chai');
const { findUserByEmail } = require('../helpers.js');

const testUsers = { 
  "b12b34": {
    id: "b12b34", 
    email: "rupi.jain@gmail.com", 
    password: 'password1' 
  },
 "a123D4": {
    id: "a123D4", 
    email: "sheenu@example.com", 
    password: 'password2'
  }
}

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("sheenu@example.com", testUsers)
    const expectedOutput = testUsers['a123D4'];
    assert.strictEqual(expectedOutput.email, user.email);
  });
});