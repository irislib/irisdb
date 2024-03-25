export type Unsubscribe = () => void;
export type JsonPrimitive = string | number | boolean | null;
export type JsonArray = JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}
export type JsonValue = JsonPrimitive | JsonObject | JsonArray | undefined;
export type NodeValue<T = JsonValue> = {
  updatedAt: number;
  value: T;
  expiresAt?: number;
};
export type Callback<T = JsonValue> = (
  value: T | undefined,
  path: string,
  updatedAt: number | undefined,
  unsubscribe: Unsubscribe,
) => void;
export abstract class Adapter {
  abstract get(path: string, callback: Callback): Unsubscribe;
  abstract set(path: string, data: NodeValue): Promise<void>;
  abstract list(path: string, callback: Callback): Unsubscribe;
}

export type Subscription = {
  callback: Callback;
  recursion: number;
};
export type TypeGuard<T> = (value: JsonValue) => T;
