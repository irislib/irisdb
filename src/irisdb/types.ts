import Node from '@/irisdb/Node.ts';

export type Unsubscribe = () => void;
export type JsonPrimitive = string | number | boolean | null;
export type JsonArray = JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}
export type JsonValue = JsonPrimitive | JsonObject | JsonArray | undefined;
export type NodeValue = {
  updatedAt: number;
  value: JsonValue;
  expiresAt?: number;
};
export type Callback = (
  value: JsonValue,
  path: string,
  updatedAt: number | undefined,
  unsubscribe: Unsubscribe,
) => void;
export abstract class Adapter {
  abstract get(path: string, callback: Callback): Unsubscribe;
  abstract set(path: string, data: NodeValue): Promise<void>;
  abstract list(path: string, callback: Callback): Unsubscribe;
}

/**
 Inspired by https://github.com/amark/gun
 */

export type NodeProps = {
  id?: string;
  adapters?: Adapter[];
  parent?: Node | null;
};
export type Subscription = {
  callback: Callback;
  recursion: number;
};
