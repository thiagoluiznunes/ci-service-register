import amqp from 'amqplib/callback_api';
import event from 'events';
import hp from './register.helper';
import { RABBITMQ_USER, RABBITMQ_PASSWORD } from 'babel-dotenv';

let pubChannel = null;
const clientEmitter = new event.EventEmitter();
const clientQueue = 'client-queue';
const serverQueue = 'server-queue';

amqp.connect(`amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@localhost`, async (error0, connection) => {
  if (error0) {
    throw error0;
  }
  connection.createChannel((error1, channel) => {
    if (error1) {
      throw error1;
    }
    pubChannel = channel;
    channel.assertQueue(clientQueue, {
      durable: true
    });
    channel.assertQueue(serverQueue, {
      durable: true
    });
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", serverQueue);
    channel.consume(serverQueue, (msg) => {
      clientEmitter.emit(msg.properties.correlationId, msg.content)
    }, {
        noAck: true
      });
  });
});

const consumeFromServer = (res, correlationId) => {
  clientEmitter.once(correlationId, msg => {
    res.status(200).json({ message: msg.toString() });
  });
}

const publishToServer = (req, res, correlationId) => {
  const { service, certificate } = req.body;
  if (hp.isValid(certificate)) {
    pubChannel.sendToQueue(clientQueue,
      Buffer.from(service.toString()), {
        correlationId: correlationId,
        persistent: true
      });
  } else {
    return res.status(403).json('Access unauthorized!');
  }
}

export default {
  consumeFromServer,
  publishToServer
};

