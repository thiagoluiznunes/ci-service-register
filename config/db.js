import mongoose from 'mongoose';
import { DB_NAME, DB_USER, DB_USER_PASS } from 'babel-dotenv';

const initConnection = async () => {
  mongoose.connect(`mongodb://localhost:27017/${DB_NAME}`, {
    useNewUrlParser: true,
    auth: {
      user: DB_USER,
      password: DB_USER_PASS
    },
  });

  const connection = mongoose.connection;
  connection.on('connected', () => {
    console.log('Connected to db');
  });

  connection.on('disconnected', () => {
    console.log('Disconnected to db');
  });

  connection.on('error', (error) => {
    console.log('Db connection error ', error);
    process.exit(1);
  });
}

export default { initConnection };
