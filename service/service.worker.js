import amqp from 'amqplib/callback_api';
import { Error } from 'mongoose';
import { RABBITMQ_USER, RABBITMQ_PASSWORD } from 'babel-dotenv';

import hp from './service.helper';
import db from '../config/db';

db.initConnection();
amqp.connect(`amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@localhost`, (error0, connection) => {
  if (error0) {
    throw error0;
  }
  connection.createChannel((error1, channel) => {
    if (error1) {
      throw error1;
    }
    const clientQueue = 'client-queue';
    const serverQueue = 'server-queue';

    channel.assertQueue(clientQueue, {
      durable: true
    });
    channel.assertQueue(serverQueue, {
      durable: true
    });
    channel.prefetch(1);
    console.log(' [x] Awaiting RPC requests');
    channel.consume(clientQueue, async (msg) => {
      let response = null;
      const service = JSON.parse(msg.content.toString());

      console.log(" [.] Registering service", service.name);

      await hp.registerService(service)
        .then(res => {
          if (res === typeof Error) response = `Fail to regiter ${service.name}`;
          else response = `Service ${service.name} registered`;
        });

      channel.sendToQueue(serverQueue,
        Buffer.from(response.toString()), {
          correlationId: msg.properties.correlationId
        });

      channel.ack(msg);
    });
  });
});
