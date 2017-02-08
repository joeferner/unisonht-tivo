import {Device, UnisonHTResponse} from "unisonht";
import * as express from "express";
import {MockTivoClient} from "./MockTivoClient";
import {TivoClientImpl} from "./TivoClientImpl";
import {TivoClient} from "./TivoClient";

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
  private client: TivoClient;

  constructor(name: string, options: Tivo.Options) {
    super(name, options);
    this.client = process.env.NODE_ENV === 'development'
      ? new MockTivoClient()
      : new TivoClientImpl(
        options.address,
        options.port || 31339
      );
  }

  stop(): Promise<void> {
    return this.client.stop()
      .then(() => {
        return super.stop();
      });
  }

  getStatus(): Promise<Device.Status> {
    return Promise.resolve({
      power: Device.PowerState.ON
    });
  }

  protected handleButtonPress(req: express.Request, res: UnisonHTResponse, next: express.NextFunction): void {
    const buttonName = req.query.button;
    res.promiseNoContent(this.client.buttonPress(buttonName));
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