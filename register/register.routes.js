import express from 'express';
import uuid from 'uuid/v4';
import client from './register.client';

const router = express.Router();

router.post('/register', (req, res) => {
  const correlationId = uuid();

  client.consumeFromServer(res, correlationId);
  client.publishToServer(req, res, correlationId);
});

export default router;