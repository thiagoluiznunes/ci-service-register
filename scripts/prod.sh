#!/bin/bash
npm run build
./node_modules/.bin/nodemon ./dist/bin/www.js
./node_modules/.bin/nodemon ./register/register.worker.js
