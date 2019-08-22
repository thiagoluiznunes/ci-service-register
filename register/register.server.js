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
    const queue = 'service-register';

    channel.assertQueue(queue, {
      durable: false
    });
    channel.prefetch(1);
    console.log(' [x] Awaiting RPC requests');
    channel.consume(queue, (msg) => {
      const serviceName = msg.content.toString();

      console.log(" [.] registering service", serviceName);
      const res = `Service ${serviceName} registered!`;

      channel.sendToQueue(msg.properties.replyTo,
        Buffer.from(res.toString()), {
          correlationId: msg.properties.correlationId
        });

      channel.ack(msg);
    });
  });
});
