import bcrypt from 'bcrypt';
import Service from './service.model';
import { AUTH_SECRET } from 'babel-dotenv';

const isValid = async (certificate) => {
  return bcrypt.compareSync(AUTH_SECRET, certificate);
}

const registerService = async (service) => {
  let res = false;
  const newService = new Service(service);

  await newService.save((err) => {
    if (err) res = err;
    res = true;
  });
  return res;
}

export default {
  isValid,
  registerService
}
