import {Device, UnisonHTResponse} from "unisonht";
import * as express from "express";
import * as net from "net";

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

export class Tivo extends Device {
  private socket: net.Socket;

  constructor(name: string, options: Tivo.Options) {
    super(name, options);
    options.port = options.port || 31339;
  }

  stop(): Promise<void> {
    this.socket.destroy();
    return super.stop();
  }

  getStatus(): Promise<Device.Status> {
    return Promise.resolve({
      power: Device.PowerState.ON
    });
  }

  protected handleButtonPress(req: express.Request, res: UnisonHTResponse, next: express.NextFunction): void {
    const buttonName = req.query.buttonName;
    let button = buttonName.toUpperCase();
    if (button === "HOME") {
      button = "TIVO";
    } else if (button === "FASTFORWARD") {
      button = "FORWARD";
    } else if (button === "REWIND") {
      button = "REVERSE";
    }

    res.promiseNoContent(this.ensureConnected()
      .then(() => {
        const data = "IRCODE " + button + "\r";
        try {
          this.log.debug("Sending: %s", data);
          this.socket.write(data);
        } catch (e) {
          this.log.error("Could not send %s", data, e);
        }
      }));
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
    this.log.debug("connecting to Tivo: %s:%d", this.getOptions().address, this.getOptions().port);
    return new Promise((resolve, reject) => {
      const opts = {
        host: this.getOptions().address,
        port: this.getOptions().port
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

  public getOptions(): Tivo.Options {
    return <Tivo.Options>super.getOptions();
  }
}

export module Tivo {
  export interface Options extends Device.Options {
    port?: number;
    address: string;
  }
}