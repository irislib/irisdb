import { nip19 } from 'nostr-tools';

import { Hex } from './Hex';

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
