import * as crypto from 'crypto'

export default function randomNumber(): number {
    return crypto.randomBytes(8).readUInt32BE(0, true)
}