import express from 'express';
import amqp from 'amqplib/callback_api';
import { RABBITMQ_USER, RABBITMQ_PASSWORD } from 'babel-dotenv';

const router = express.Router();
const queue = 'service-register'
let channel = null;

const generateUuid = () => {
  return Math.random().toString() +
    Math.random().toString() +
    Math.random().toString();
}

amqp.connect(`amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@localhost`, (error0, connection) => {
  if (error0) {
    throw error0;
  }
  connection.createChannel((error1, ch) => {
    if (error1) {
      throw error1;
    }
    channel = ch;
    channel.assertQueue(queue, {
      durable: true
    }, (error2) => {
      if (error2) {
        throw error2;
      }
    });
  });
});

router.post('/queue', (req, res) => {

  const correlationId = generateUuid();
  console.log('Correlation ID: ', correlationId);

  channel.consume(queue, (msg) => {
    if (msg.properties.correlationId == correlationId) {
      console.log('Consume id: ', correlationId);
      res.status(200).json(`Queu id: ${correlationId}, response: ${msg}`);
    }
  }, {
      noAck: true
    });

  const { name } = req.body;
  channel.sendToQueue(queue,
    Buffer.from(name), {
      correlationId: correlationId,
      replyTo: queue,
      persistent: true,
      content_type: 'application/json'
    });
});

export default router;
