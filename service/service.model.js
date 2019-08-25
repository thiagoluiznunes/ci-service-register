import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Informe o nome.']
  },
  url: {
    type: String,
    required: [true, 'Informe a url.']
  },
  version: {
    type: String,
    required: [true, 'Informe a versão.']
  }
});

export default mongoose.model('Service', serviceSchema);
