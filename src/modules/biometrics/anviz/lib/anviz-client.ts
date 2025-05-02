// AnvizClient.ts
import { Socket } from 'net';

const STX = 0xA5;

/** All the return codes (RET) from the device */
export enum AckCode {
  SUCCESS           = 0x00,
  FAIL              = 0x01,
  FULL              = 0x04,
  EMPTY             = 0x05,
  NO_USER           = 0x06,
  TIME_OUT          = 0x08,
  USER_OCCUPIED     = 0x0A,
  FINGER_OCCUPIED   = 0x0B,
}

/** All Part II command op-codes */
export enum Command {
  GetDeviceInfo        = 0x30,
  SetDeviceInfo        = 0x31,
  GetTAConfig2         = 0x32,
  SetTAConfig2         = 0x33,
  GetDateTime          = 0x38,
  SetDateTime          = 0x39,
  GetNetworkParams     = 0x3A,
  SetNetworkParams     = 0x3B,
  GetRecordInfo        = 0x3C,
  DownloadRecords      = 0x40,
  // … add others 0x42,0x44…0x5F as needed …
}

/** Models for your command payloads / responses */
export interface DeviceInfo {
  firmwareVersion: string;
  password: string;
  sleepTime: number;
  volume: number;
  language: number;
  dateFormat: number;
  attendanceState: number;
  languageSettingFlag: number;
  cmdVersion: number;
}

export interface NetworkConfig {
  ip:        [number,number,number,number];
  mask:      [number,number,number,number];
  mac:       [number,number,number,number,number,number];
  gateway:   [number,number,number,number];
  serverIp:  [number,number,number,number];
  farLimit:  number;
  comPort:   number;
  mode:      number;
  dhcpLimit: number;
}

/** CRC-16/X-25 (poly=0x1021, init=0xFFFF, reflect in/out) */
function crc16(buffer: Buffer): number {
  let crc = 0xFFFF;
  for (const b of buffer) {
    crc ^= b;
    for (let i = 0; i < 8; i++) {
      if (crc & 1) crc = (crc >>> 1) ^ 0x8408;
      else         crc = crc >>> 1;
    }
  }
  // swap bytes
  return ((crc & 0xFF) << 8) | (crc >>> 8);
}

export class AnvizClient {
  private socket = new Socket();
  private pending?: {
    resolve: (buf: Buffer) => void;
    reject:  (err: Error)  => void;
    timeout: NodeJS.Timeout;
  };

  constructor(private host: string, private port: number = 4370) {
    this.socket.on('data', this.onData.bind(this));
    this.socket.on('error', err => {
      if (this.pending) {
        this.pending.reject(err);
        this.pending = undefined;
      }
    });
  }

  /** Open TCP connection */
  connect(timeout = 5_000): Promise<void> {
    return new Promise((res, rej) => {
      const to = setTimeout(() => rej(new Error('Connect timeout')), timeout);
      this.socket.once('connect', () => { clearTimeout(to); res(); });
      this.socket.once('error', e => { clearTimeout(to); rej(e); });
      this.socket.connect(this.port, this.host);
    });
  }

  /** Gracefully close */
  disconnect() {
    this.socket.end();
  }

  /** Internal: called on incoming data */
  private onData(data: Buffer) {
    if (!this.pending) return;
    clearTimeout(this.pending.timeout);
    this.pending.resolve(data);
    this.pending = undefined;
  }

  /**
   * Internal: send raw framed packet, await full raw response
   * Frame: [STX][CH×4][CMD][LEN16][DATA][CRC16]
   */
  private sendRaw(
    channel: Buffer,
    cmd: number,
    payload = Buffer.alloc(0),
    timeout = 2_000,
  ): Promise<Buffer> {
    if (channel.length !== 4) throw new Error('Channel must be 4 bytes');
    if (payload.length > 400) throw new Error('Payload too large');

    // build header + payload
    const header = Buffer.alloc(1 + 4 + 1 + 2);
    header.writeUInt8(STX, 0);
    channel.copy(header, 1);
    header.writeUInt8(cmd, 5);
    header.writeUInt16BE(payload.length, 6);

    const frame = Buffer.concat([header, payload]);
    const crc   = crc16(frame);
    const crcBuf= Buffer.alloc(2);
    crcBuf.writeUInt16BE(crc, 0);

    // send + await
    return new Promise((resolve, reject) => {
      this.pending = {
        resolve,
        reject,
        timeout: setTimeout(() => {
          this.pending = undefined;
          reject(new Error('Response timeout'));
        }, timeout)
      };
      this.socket.write(Buffer.concat([frame, crcBuf]));
    });
  }

  /**
   * Internal: parse ACK/RET/LEN/DATA, throw on errors
   */
  private async sendCommand<T = Buffer>(
    channel: Buffer,
    cmd: Command,
    payload = Buffer.alloc(0),
    parser?: (data: Buffer) => T
  ): Promise<T> {
    const resp = await this.sendRaw(channel, cmd, payload);
    if (resp.readUInt8(0) !== STX) throw new Error('Bad STX');
    const ack = resp.readUInt8(5);
    const ret = resp.readUInt8(6);
    const len = resp.readUInt16BE(7);
    const data = resp.slice(9, 9 + len);

    if (ack !== (cmd | 0x80))
      throw new Error(`Unexpected ACK: 0x${ack.toString(16)}`);
    if (ret !== AckCode.SUCCESS)
      throw new Error(`Device error RET=0x${ret.toString(16)}`);

    return parser ? parser(data) : (data as any);
  }

  // ─── High-level SDK methods ────────────────────────────────────────────────

  /** CMD 0x30: get basic device info */
  async getDeviceInfo(channel: Buffer): Promise<DeviceInfo> {
    return this.sendCommand(channel, Command.GetDeviceInfo, Buffer.alloc(0), buf => ({
      firmwareVersion: buf.slice(0, 8).toString('ascii'),
      password:        buf.slice(8, 11).toString('ascii'),
      sleepTime:       buf.readUInt8(11),
      volume:          buf.readUInt8(12),
      language:        buf.readUInt8(13),
      dateFormat:      buf.readUInt8(14),
      attendanceState: buf.readUInt8(15),
      languageSettingFlag: buf.readUInt8(16),
      cmdVersion:      buf.readUInt8(17),
    }));
  }

  /** CMD 0x31: set basic device info */
  async setDeviceInfo(channel: Buffer, cfg: Partial<DeviceInfo>) {
    const data = Buffer.alloc(10, 0xFF);
    if (cfg.password !== undefined) {
      data[0] = (cfg.password.length << 4);
      Buffer.from(cfg.password).copy(data, 1);
    }
    if (cfg.sleepTime !== undefined) data[3] = cfg.sleepTime;
    if (cfg.volume     !== undefined) data[4] = cfg.volume;
    if (cfg.language   !== undefined) data[5] = cfg.language;
    if (cfg.dateFormat !== undefined) data[6] = cfg.dateFormat;
    if (cfg.attendanceState !== undefined) data[7] = cfg.attendanceState;
    if (cfg.languageSettingFlag !== undefined) data[8] = cfg.languageSettingFlag;
    await this.sendCommand(channel, Command.SetDeviceInfo, data);
  }

  /** CMD 0x38: get device date/time */
  async getDateTime(channel: Buffer): Promise<Date> {
    return this.sendCommand(channel, Command.GetDateTime, Buffer.alloc(0), buf => {
      const [y, m, d, h, min, s] = Array.from(buf.values());
      return new Date(2000 + y, m - 1, d, h, min, s);
    });
  }

  /** CMD 0x39: set device date/time */
  async setDateTime(channel: Buffer, dt: Date) {
    const year = dt.getFullYear() - 2000;
    const data = Buffer.from([
      year, dt.getMonth() + 1, dt.getDate(),
      dt.getHours(), dt.getMinutes(), dt.getSeconds()
    ]);
    await this.sendCommand(channel, Command.SetDateTime, data);
  }

  /** CMD 0x3A: get TCP/IP parameters */
  async getNetworkParams(channel: Buffer): Promise<NetworkConfig> {
    return this.sendCommand(channel, Command.GetNetworkParams, Buffer.alloc(0), buf => ({
      ip:       [buf[0], buf[1], buf[2], buf[3]],
      mask:     [buf[4], buf[5], buf[6], buf[7]],
      mac:      [buf[8], buf[9], buf[10], buf[11], buf[12], buf[13]],
      gateway:  [buf[14], buf[15], buf[16], buf[17]],
      serverIp: [buf[18], buf[19], buf[20], buf[21]],
      farLimit: buf.readUInt16BE(22),
      comPort:  buf.readUInt8(24),
      mode:     buf.readUInt8(25),
      dhcpLimit: buf.readUInt8(26),
    }));
  }

  /** CMD 0x3B: set TCP/IP parameters */
  async setNetworkParams(channel: Buffer, cfg: NetworkConfig) {
    const data = Buffer.alloc(27);
    data.set(cfg.ip,       0);
    data.set(cfg.mask,     4);
    data.set(cfg.mac,      8);
    data.set(cfg.gateway, 14);
    data.set(cfg.serverIp,18);
    data.writeUInt16BE(cfg.farLimit, 22);
    data.writeUInt8(cfg.comPort, 24);
    data.writeUInt8(cfg.mode,    25);
    data.writeUInt8(cfg.dhcpLimit, 26);
    await this.sendCommand(channel, Command.SetNetworkParams, data);
  }

  /** CMD 0x40: download attendance records (mode=0/1/2/0x10, count=1–25) */
  async downloadRecords(
    channel: Buffer,
    mode: 0 | 1 | 2 | 0x10,
    count: number
  ): Promise<Buffer[]> {
    if (count < 1 || count > 25) throw new Error('count must be 1–25');
    const payload = Buffer.from([mode, count]);
    const raw = await this.sendCommand(channel, Command.DownloadRecords, payload);
    const valid = raw.readUInt8(0);
    const recs: Buffer[] = [];
    for (let i = 0; i < valid; i++) {
      recs.push(raw.slice(1 + i * 14, 1 + (i + 1) * 14));
    }
    return recs;
  }

  // … implement the rest of your needed commands (0x42/0x43 staff info, 0x44/0x45 FP templates, etc.) …
}
