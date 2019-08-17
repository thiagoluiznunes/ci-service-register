#!/bin/bash
npm run build
./node_modules/.bin/nodemon ./dist/bin/www.js
