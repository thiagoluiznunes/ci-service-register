import bcrypt from 'bcrypt';
import Service from './service.model';
import { AUTH_SECRET } from 'babel-dotenv';

const isValid = (certificate) => {
  return bcrypt.compareSync(AUTH_SECRET, certificate);
}

const handler = async (data) => {
  const { request, ...rest } = data;
  if (request.method === 'POST' && request.url === '/register') {
    return registerService(rest);
  } else if (request.method === 'GET' && request.url === '/register') {
    return retrieveServices();
  }
}

const registerService = async (service) => {
  let response = null;

  console.log(` [.] Registering service ${service.name}.`);
  try {
    const newService = new Service(service);
    await newService.save();
    response = `Service ${service.name} registered.`;
  } catch (err) {
    response = {
      message: `Fail to register ${service.name}.`,
      error: err
    }
  }
  return response;
}

const retrieveServices = async () => {
  let response = null;

  console.log(' [.] Getting services.');
  try {
    const services = await Service.find();
    response = services;
  } catch (err) {
    response = {
      message: `Fail to retrieve services`,
      error: err
    }
  }
  return response.toString();
}

export default {
  isValid,
  handler,
}
