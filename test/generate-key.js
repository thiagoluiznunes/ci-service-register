const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
(() => {
  rl.question('Type the secret key to create your hash: ', (secret) => {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(secret, salt);
    console.log(hash);
    rl.close();
  });
})();
