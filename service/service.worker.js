import amqp from 'amqplib/callback_api';
import hp from './service.helper';
import { RABBITMQ_USER, RABBITMQ_PASSWORD } from 'babel-dotenv';
import { Error } from 'mongoose';

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
      const service = JSON.parse(msg.content.toString());
      const response = await hp.registerService(service);
      let res = null;

      console.log(" [.] Registering service", service.name);

      if (response === typeof Error) res = `Fail to regiter ${service.name}`;
      else res = `Service ${service.name} registered`;

      channel.sendToQueue(serverQueue,
        Buffer.from(res.toString()), {
          correlationId: msg.properties.correlationId
        });

      channel.ack(msg);
    });
  });
});
