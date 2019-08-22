const axios = require('axios');
const randomString = require('random-string');

const args = parseInt(process.argv.slice(2));
if (args.length == 0) {
  console.log('Please add number of request!');
  process.exit(1);
}

for (let i = 0; i < args; i++) {
  axios.post('http://localhost:3000/api/v1/register', {
    service: randomString()
  })
  .then((response) => {
    // console.log(response);
  })
  .catch((error) => {
    // console.log(error);
  });
}

