import bcrypt from 'bcrypt';
import { AUTH_SECRET } from 'babel-dotenv';

const isValid = (certificate) => {
  return bcrypt.compareSync(certificate, AUTH_SECRET);
}

export default {
  isValid
}
