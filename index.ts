import {Device, DeviceOptions} from 'unisonht/lib/Device';

interface TivoOptions extends DeviceOptions {
  address: string;
}

export default class Tivo extends Device {
  constructor(options: TivoOptions) {
    super(options);
  }
}