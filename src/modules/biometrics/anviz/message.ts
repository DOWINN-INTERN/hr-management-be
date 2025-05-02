/**
 * Message class for handling communication with Anviz biometric devices
 */
export class Message {
    deviceCode: number;
    command: number;
    returnValue: number;
    data: Buffer;

    constructor() {
        this.deviceCode = 0;
        this.command = 0;
        this.returnValue = 0;
        this.data = Buffer.from([]);
    }

    /**
     * Creates a message for a specific command
     * @param {number} deviceCode - The device identification code
     * @param {number} command - The command code to send
     * @param {Buffer} data - Optional data to include with the command
     * @returns {Message} A new message instance
     */
    static createCommand(deviceCode: number, command: number, data: Buffer | null = null): Message {
        const message = new Message();
        message.deviceCode = deviceCode;
        message.command = command;
        message.data = data || Buffer.from([]);
        return message;
    }
}