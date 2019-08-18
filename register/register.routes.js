import express from 'express';
import amqp from 'amqplib/callback_api';
import { RABBITMQ_USER, RABBITMQ_PASSWORD } from 'babel-dotenv';

const router = express.Router();
const queue = 'service-register'

const generateUuid = () => {
  return Math.random().toString() +
    Math.random().toString() +
    Math.random().toString();
}

router.post('/register', (req, res) => {
  amqp.connect(`amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@localhost`, (error0, connection) => {
    if (error0) {
      throw error0;
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }
      channel.assertQueue('', {
        exclusive: true
      }, (error2, q) => {
        if (error2) {
          throw error2;
        }
        const correlationId = generateUuid();
        const { service } = req.body;

        console.log(' [x] Requesting service register', service);

        channel.consume(q.queue, (msg) => {
          if (msg.properties.correlationId == correlationId) {
            console.log(' [.] Got %s', msg.content.toString());
            res.status(200).json(msg.content.toString());
            setTimeout(() => {
              connection.close();
            }, 500);
          }
        }, {
            noAck: true
          });

        channel.sendToQueue(queue,
          Buffer.from(service.toString()), {
            correlationId: correlationId,
            replyTo: q.queue
          });
      });
    });
  });
});

export default router;
