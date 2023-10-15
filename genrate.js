const crypto = require('crypto');

// Function to generate a random secret key
const generateSecretKey = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Output the generated secret key
console.log(generateSecretKey());
