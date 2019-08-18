#!/usr/bin/env node

const generateUuid = () => {
  return Math.random().toString() +
    Math.random().toString() +
    Math.random().toString();
}

export default {
  generateUuid,
}
