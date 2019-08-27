import amqp from 'amqplib/callback_api';
import event from 'events';
import ctrl from './service.controller';
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
    // res.status(200).json(msg.toString());
    res.status(200).write(msg, 'binary');
    res.end(null, 'binary');
  });
}

const publishToServer = async (req, res, correlationId) => {
  const auth = 'authorization';
  const certificate = req.body.certificate || req.query.certificate || req.headers[auth];
  const data = req.body;
  data.request = {
    method: req.method,
    url: req.url
  };

  if (ctrl.isValid(certificate)) {
    pubChannel.sendToQueue(clientQueue,
      Buffer.from(JSON.stringify(data)), {
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

