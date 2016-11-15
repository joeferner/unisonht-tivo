import {Device, DeviceOptions} from "unisonht/lib/Device";
import createLogger from "unisonht/lib/Log";
import * as net from "net";
const log = createLogger('tivo');

/*
 * Keys: https://www.tivo.com/assets/images/abouttivo/resources/downloads/brochures/TiVo_TCP_Network_Remote_Control_Protocol.pdf
 *
 * WINDOW = ZOOM
 * TIVO
 * ACTION_A = A
 * ACTION_B = B
 * ACTION_C = C
 * ACTION_D = D
 * NUM0 - NUM9
 * PLAY
 * FORWARD
 * REVERSE
 * PAUSE
 * SLOW
 * REPLAY
 * ADVANCE
 * RECORD
 * THUMBSUP
 * THUMBSDOWN
 * CHANNELUP
 * CHANNELDOWN
 * MUTE
 * VOLUMEUP
 * VOLUMEDOWN
 * TVINPUT
 * UP
 * DOWN
 * LEFT
 * RIGHT
 * SELECT
 * LIVETV
 * GUIDE
 * INFO
 * EXIT
 */

interface TivoOptions extends DeviceOptions {
  port?: number;
  address: string;
}

export default class Tivo extends Device {
  private options: TivoOptions;
  private socket: net.Socket;

  constructor(options: TivoOptions) {
    super(options);
    this.options = options;
    this.options.port = this.options.port || 31339;
  }

  buttonPress(button: string): Promise<void> {
    button = button.toUpperCase();
    if (button === "HOME") {
      button = "TIVO";
    } else if (button === "FASTFORWARD") {
      button = "FORWARD";
    } else if (button === "REWIND") {
      button = "REVERSE";
    }

    return this.ensureConnected()
      .then(()=> {
        const data = "IRCODE " + button + "\r";
        try {
          log.debug("Sending: %s", data);
          this.socket.write(data);
        } catch (e) {
          log.error("Could not send %s", data, e);
        }
      });
  }

  private ensureConnected(): Promise<void> {
    if (this.socket) {
      return Promise.resolve();
    }
    return this.connect()
  }

  private connect(): Promise<net.Socket> {
    log.debug("connecting to Tivo: %s:%d", this.options.address, this.options.port);
    return new Promise((resolve, reject)=> {
      const opts = {
        host: this.options.address,
        port: this.options.port
      };
      this.socket = net.connect(opts);

      this.socket.on('connect', ()=> {
        log.debug('connected');
        if (resolve) {
          resolve(this.socket);
        }
        resolve = null;
        reject = null;
      });

      this.socket.on('close', ()=> {
        log.debug('connection closed');
        this.socket = null;
        if (reject) {
          reject();
        }
        resolve = null;
        reject = null;
      });

      this.socket.on('data', (data)=> {
        log.debug('data: %s', data);
      });
    });
  }
}