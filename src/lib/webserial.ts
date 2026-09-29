/**
 * Helper para comunicação direta com a porta Serial via Web Serial API no navegador (Chrome/Edge).
 * Permite ao professor conectar o Arduino Uno diretamente pelo notebook sem instalar drivers ou bridges extras.
 */

export interface SerialCallbacks {
  onLineReceived: (line: string) => void;
  onConnected: (portInfo: string) => void;
  onDisconnected: () => void;
  onError: (error: string) => void;
}

export class WebSerialManager {
  private port: any = null;
  private reader: any = null;
  private writer: any = null;
  private keepReading = false;
  private textDecoder = new TextDecoderStream();
  private textEncoder = new TextEncoderStream();

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'serial' in navigator;
  }

  public async connect(baudRate: number = 115200, callbacks: SerialCallbacks): Promise<boolean> {
    if (!this.isSupported()) {
      callbacks.onError('Seu navegador não suporta a Web Serial API. Use o Google Chrome ou Microsoft Edge no computador.');
      return false;
    }

    try {
      // Solicita ao usuário a seleção da porta COM do Arduino
      // @ts-ignore
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate });

      callbacks.onConnected(`Conectado a 115200 baud`);
      this.keepReading = true;

      // Inicia a leitura assíncrona
      this.startReading(callbacks);
      return true;
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        callbacks.onError('Nenhuma porta serial selecionada.');
      } else {
        callbacks.onError(`Erro ao abrir porta serial: ${err.message}`);
      }
      return false;
    }
  }

  private async startReading(callbacks: SerialCallbacks) {
    let accumulated = '';

    while (this.port && this.port.readable && this.keepReading) {
      try {
        const textDecoder = new TextDecoderStream();
        // @ts-ignore
        const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();
        this.reader = reader;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            accumulated += value;
            const lines = accumulated.split(/\r?\n/);
            // Mantém o último fragmento incompleto no buffer
            accumulated = lines.pop() || '';

            for (const line of lines) {
              if (line.trim().length > 0) {
                callbacks.onLineReceived(line.trim());
              }
            }
          }
        }
      } catch (error: any) {
        if (this.keepReading) {
          callbacks.onError(`Erro de leitura serial: ${error?.message || error}`);
        }
        break;
      }
    }
  }

  public async sendCommand(command: string): Promise<boolean> {
    if (!this.port || !this.port.writable) {
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const writer = this.port.writable.getWriter();
      const data = encoder.encode(command.endsWith('\n') ? command : command + '\n');
      await writer.write(data);
      writer.releaseLock();
      return true;
    } catch (err) {
      console.error('Erro ao enviar comando serial:', err);
      return false;
    }
  }

  public async disconnect(callbacks?: SerialCallbacks) {
    this.keepReading = false;

    try {
      if (this.reader) {
        await this.reader.cancel();
        this.reader = null;
      }
      if (this.port) {
        await this.port.close();
        this.port = null;
      }
      callbacks?.onDisconnected();
    } catch (err) {
      console.warn('Erro ao fechar porta serial:', err);
    }
  }
}

export const webSerial = new WebSerialManager();
