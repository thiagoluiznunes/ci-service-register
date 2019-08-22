import amqp from 'amqplib/callback_api';
import { RABBITMQ_USER, RABBITMQ_PASSWORD } from 'babel-dotenv';
import event from 'events';

let pubChannel = null;
const channelEmitter = new event.EventEmitter();
const clientQueue = 'client-queue';
const serverQueue = 'server-queue';

const createConnection = async () => {
  await amqp.connect(`amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@localhost`, async (error0, connection) => {
    if (error0) {
      throw error0;
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }
      channel.assertQueue(clientQueue, {
        durable: true
      });
      channel.assertQueue(serverQueue, {
        durable: true
      });
      channelEmitter.emit('channelEvent', channel);
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", clientQueue);
    });
  });
  return channelEmitter;
}

const consumeFromServer = (res, correlationId) => {
  pubChannel.consume(serverQueue, (msg) => {
    console.log('Consume from server: ', msg.content.toString());
    if (msg.properties.correlationId == correlationId) {
      console.log(' [.] Got %s', msg.content.toString());
      res.status(200).json(msg.content.toString());
    }
  }, {
      noAck: true
    });
}

const sendToServer = (service, correlationId) => {
  pubChannel.sendToQueue(clientQueue,
    Buffer.from(service.toString()), {
      correlationId: correlationId,
      persistent: true
    });
}
createConnection()
  .then(channelEmitter => {
    channelEmitter.once('channelEvent', ch => {
      pubChannel = ch;
    });
  });

export default {
  createConnection,
  consumeFromServer,
  sendToServer
};

