import {TivoClient} from "./TivoClient";
import * as Logger from "bunyan";
import {createLogger} from "../unisonht/lib/Log";

export class MockTivoClient implements TivoClient {
  private log: Logger;

  constructor() {
    this.log = createLogger('MockTivoClient');
  }

  stop(): Promise<void> {
    this.log.info('stop');
    return Promise.resolve();
  }

  buttonPress(buttonName: string): Promise<void> {
    this.log.info(`buttonPress ${buttonName}`);
    return Promise.resolve();
  }
}
