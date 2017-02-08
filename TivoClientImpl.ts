import {TivoClient} from "./TivoClient";
import * as Logger from "bunyan";
import {createLogger} from "../unisonht/lib/Log";
import * as NestedError from "nested-error-stacks";
import * as net from "net";

export class TivoClientImpl implements TivoClient {
  private socket: net.Socket;
  private log: Logger;
  private address: string;
  private port: number;

  constructor(address: string, port: number) {
    this.log = createLogger('TivoClientImpl');
    this.address = address;
    this.port = port;
  }

  stop(): Promise<void> {
    this.socket.destroy();
    return Promise.resolve();
  }

  buttonPress(buttonName: string): Promise<void> {
    let button = buttonName.toUpperCase();
    if (button === "HOME") {
      button = "TIVO";
    } else if (button === "FASTFORWARD") {
      button = "FORWARD";
    } else if (button === "REWIND") {
      button = "REVERSE";
    }

    return this.ensureConnected()
      .then(() => {
        const data = "IRCODE " + button + "\r";
        try {
          this.log.debug("Sending: %s", data);
          this.socket.write(data);
        } catch (e) {
          throw new NestedError(`Could not send ${data}`, e);
        }
      });
  }

  private ensureConnected(): Promise<void> {
    if (this.socket) {
      return Promise.resolve();
    }
    return this.connect()
      .then(() => {
      });
  }

  private connect(): Promise<net.Socket> {
    this.log.debug(`connecting to Tivo: ${this.address}:${this.port}`);
    return new Promise((resolve, reject) => {
      const opts = {
        host: this.address,
        port: this.port
      };
      this.socket = net.connect(opts);

      this.socket.on('connect', () => {
        this.log.debug('connected');
        if (resolve) {
          resolve(this.socket);
        }
        resolve = null;
        reject = null;
      });

      this.socket.on('close', () => {
        this.log.debug('connection closed');
        this.socket = null;
        if (reject) {
          reject();
        }
        resolve = null;
        reject = null;
      });

      this.socket.on('data', (data) => {
        this.log.debug('data: %s', data);
      });
    });
  }
}
