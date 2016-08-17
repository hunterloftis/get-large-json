'use strict';

const express = require('express');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const JSON_MB = process.env.JSON_MB || 10;
const MAX_BLOCK_MS = 50;

const app = express()
  .set('json spaces', 2)
  .get('/', recordStart, createObject(JSON_MB), sendObject)
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

function recordStart(req, res, next) {
  req.start = Date.now();
  next();
}

function createObject(mb) {
  let targetSize = mb * 1024 * 1024;
  let hexSize = 1024;
  let byteSize = Math.floor(hexSize / 2);

  return (req, res, next) => {
    req.start = Date.now();
    req.result = [];
    growObj(req.result, next);
  };

  function growObj(obj, done) {
    let timeout = Date.now() + MAX_BLOCK_MS;
    do {
      if (obj.length * hexSize > targetSize) return done();
      obj.push(crypto.randomBytes(byteSize).toString('hex'));
    } while (timeout > Date.now());
    setImmediate(growObj, obj, done);
  }
}

function sendObject(req, res, next) {
  res.json(req.result);
  console.log(`request served in ${ Date.now() - req.start }ms`);
}
