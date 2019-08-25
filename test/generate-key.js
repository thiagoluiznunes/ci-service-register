const bcrypt = require('bcrypt');

const input = process.argv[2];
((secret) => {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(secret, salt);
  console.log(hash);
})(input);
