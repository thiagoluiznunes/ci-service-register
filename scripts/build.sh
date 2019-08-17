#!/bin/bash
rm -rf ./dist
./node_modules/.bin/babel ./bin --out-dir dist/bin
./node_modules/.bin/babel ./app.js --out-dir dist
