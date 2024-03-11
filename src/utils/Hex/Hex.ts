import { hexToBytes } from '@noble/hashes/utils';
import { nip19 } from 'nostr-tools';

export class Hex {
  value: string;

  constructor(str: string, expectedLength?: number) {
    // maybe should accept bech32 input and convert to hex?
    this.validateHex(str, expectedLength);
    this.value = str;
  }

  private validateHex(str: string, expectedLength?: number): void {
    if (!/^[0-9a-fA-F]+$/.test(str)) {
      throw new Error(`The provided string is not a valid hex value: "${str}"`);
    }

    if (expectedLength && str.length !== expectedLength) {
      throw new Error(
        `The provided hex value does not match the expected length of ${expectedLength} characters: ${str}`,
      );
    }
  }

  toBech32(prefix: string): string {
    if (!prefix) {
      throw new Error('prefix is required');
    }

    const data = hexToBytes(this.value);

    return nip19.encodeBytes(prefix, data);
  }

  get hex(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }
}

export class EventID extends Hex {
  noteValue: string | undefined;

  constructor(str: string) {
    const isNote = str.startsWith('note');
    let hexValue = str;
    if (isNote) {
      const res = nip19.decode(str);
      if (res.type === 'note') {
        hexValue = res.data;
      } else {
        throw new Error(`failed to decode note ${str}`);
      }
    }
    super(hexValue, 64);
    if (isNote) {
      this.noteValue = str; // preserve the original Bech32 value
    }
  }

  get note(): string {
    if (!this.noteValue) {
      this.noteValue = super.toBech32('note');
    }
    return this.noteValue;
  }

  equals(other: EventID | string): boolean {
    if (typeof other === 'string') {
      if (other === this.value) {
        return true;
      }
      other = new EventID(other);
    }
    return this.value === other.value;
  }
}

export class PublicKey extends Hex {
  npubValue: string | undefined;

  constructor(str: string) {
    const isNpub = str.startsWith('npub');
    let hexValue = str;
    if (isNpub) {
      const res = nip19.decode(str);
      if (res.type === 'npub') {
        hexValue = res.data;
      } else {
        throw new Error(`failed to decode npub ${str}`);
      }
    }
    super(hexValue, 64);
    if (isNpub) {
      this.npubValue = str; // preserve the original Bech32 value
    }
  }

  get npub(): string {
    if (!this.npubValue) {
      this.npubValue = super.toBech32('npub');
    }
    return this.npubValue;
  }

  equals(other: PublicKey | string): boolean {
    if (typeof other === 'string') {
      if (other === this.value) {
        return true;
      }
      other = new PublicKey(other);
    }
    return this.value === other.value;
  }
}
