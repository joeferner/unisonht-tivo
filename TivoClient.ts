export interface TivoClient {
  stop(): Promise<void>;
  buttonPress(buttonName: string): Promise<void>;
}