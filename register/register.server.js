import amqp from 'amqplib/callback_api';
import { RABBITMQ_USER, RABBITMQ_PASSWORD } from 'babel-dotenv';

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
    channel.consume(clientQueue, (msg) => {
      const serviceName = msg.content.toString();

      console.log(" [.] Registering service", serviceName);
      const res = `Service ${serviceName} registered!`;

      channel.sendToQueue(serverQueue,
        Buffer.from(res.toString()), {
          correlationId: msg.properties.correlationId
        });

      channel.ack(msg);
    });
  });
});
