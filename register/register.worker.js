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
    const queue = 'service-register'
    channel.assertQueue(queue, {
      durable: true
    });
    // channel.prefetch(1);
    channel.consume(queue, (msg) => {
      console.log('Worker message');
      const res = 'Sua string é essa!';
      channel.sendToQueue(queue,
        Buffer.from(res), {
          correlationId: msg.properties.correlationId
        });

      channel.ack(msg);
    });
  });
});
