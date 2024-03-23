import LocalStorageAdapter from 'irisdb/adapters/LocalStorageAdapter';
import MemoryAdapter from 'irisdb/adapters/MemoryAdapter';
import {
  Adapter,
  Callback,
  JsonObject,
  JsonValue,
  NodeProps,
  NodeValue,
  Subscription,
  Unsubscribe,
} from 'irisdb/types';

export const DIR_VALUE = '__DIR__';

/**
 * Nodes represent queries into the tree rather than the tree itself. The actual tree data is stored by Adapters.
 *
 * Node can be a branch node or a leaf node. Branch nodes have children, leaf nodes have a value (stored in an adapter).
 */
export default class Node {
  id: string;
  parent: Node | null;
  private children = new Map<string, Node>();
  private on_subscriptions = new Map<number, Subscription>();
  private map_subscriptions = new Map<number, Subscription>();
  private adapters: Adapter[];
  private counter = 0;

  /**
   */
  constructor({ id = '', adapters, parent = null }: NodeProps = {}) {
    this.id = id;
    this.parent = parent;
    this.adapters = adapters ??
      parent?.adapters ?? [new MemoryAdapter(), new LocalStorageAdapter()];
  }

  /**
   *
   * @param key
   * @returns {Node}
   * @example node.get('apps/canvas/documents/test').put({name: 'Test Document'})
   * @example node.get('apps').get('canvas').get('documents').get('test').on((value) => console.log(`Document name: ${value.name}`))
   */
  get(key: string): Node {
    const splitKey = key.split('/');
    let node = this.children.get(splitKey[0]);
    if (!node) {
      node = new Node({ id: `${this.id}/${splitKey[0]}`, parent: this });
      this.children.set(splitKey[0], node);
    }
    if (splitKey.length > 1) {
      return node.get(splitKey.slice(1).join('/'));
    }
    return node;
  }

  private async putValue(value: JsonValue, updatedAt: number, expiresAt?: number) {
    if (value !== DIR_VALUE) {
      this.children = new Map();
    }
    const nodeValue: NodeValue = {
      updatedAt,
      value,
      expiresAt,
    };
    const promises = this.adapters.map((adapter) => adapter.set(this.id, nodeValue));
    this.on_subscriptions.forEach(({ callback }) => {
      callback(value, this.id, updatedAt, () => {});
    });
    await Promise.all(promises);
  }

  private async putChildValues(value: JsonObject, updatedAt: number, expiresAt?: number) {
    const promises = this.adapters.map((adapter) =>
      adapter.set(this.id, { value: DIR_VALUE, updatedAt, expiresAt }),
    );
    const children = Object.keys(value);
    // the following probably causes the same callbacks to be fired too many times
    const childPromises = children.map((key) => this.get(key).put(value[key], updatedAt));
    await Promise.all([...promises, ...childPromises]);
  }

  /**
   * Set a value to the node. If the value is an object, it will be converted to child nodes.
   * @param value
   * @example node.get('apps/canvas/documents/test').put({name: 'Test Canvas'})
   */
  async put(value: JsonValue, updatedAt = Date.now(), expiresAt?: number) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      await this.putChildValues(value, updatedAt, expiresAt);
    } else {
      await this.putValue(value, updatedAt, expiresAt);
    }

    if (this.parent) {
      await this.parent.put(DIR_VALUE, updatedAt);
      const childName = this.id.split('/').pop()!;
      if (!this.parent.children.has(childName)) {
        this.parent.children.set(childName, this);
      }
      for (const [id, { callback, recursion }] of this.parent.map_subscriptions) {
        if (value !== DIR_VALUE || recursion === 0) {
          callback(value, this.id, updatedAt, () => {
            this.parent?.map_subscriptions.delete(id);
          });
        } else if (recursion > 0) {
          // TODO fix
          //this.open(callback, recursion - 1);
        }
      }
    }
  }

  /**
   * Callback that returns all child nodes in the same response object
   */
  open(callback: Callback, recursion = 0): Unsubscribe {
    const aggregated: JsonObject = {};
    let latestTime: number | undefined;
    return this.map((childValue, path, updatedAt) => {
      if (updatedAt !== undefined && (!latestTime || latestTime < updatedAt)) {
        latestTime = updatedAt;
      }
      const childName = path.split('/').pop()!;
      aggregated[childName] = childValue;
      callback(aggregated, this.id, latestTime, () => {});
    }, recursion);
  }

  /**
   * Subscribe to a value
   */
  on(callback: Callback, returnIfUndefined: boolean = false, recursion = 1): Unsubscribe {
    let latestValue: NodeValue | null = null;
    let openUnsubscribe: Unsubscribe | undefined;
    const uniqueId = this.counter++;

    const localCallback: Callback = (value, path, updatedAt, unsubscribe) => {
      const olderThanLatest =
        latestValue !== null && updatedAt !== undefined && latestValue.updatedAt >= updatedAt;
      const noReturnUndefined = !returnIfUndefined && value === undefined;
      if (olderThanLatest || noReturnUndefined) {
        return;
      }

      const returnUndefined = !latestValue && returnIfUndefined && value === undefined;
      if (returnUndefined) {
        callback(value, path, updatedAt, unsubscribe);
        return;
      }

      if (value !== undefined && updatedAt !== undefined) {
        latestValue = { value, updatedAt };
      }

      if (value === DIR_VALUE && recursion > 0 && !openUnsubscribe) {
        openUnsubscribe = this.open(callback, recursion - 1);
      }

      if (value !== DIR_VALUE || recursion === 0) {
        callback(value, path, updatedAt, unsubscribe);
      }
    };

    this.on_subscriptions.set(uniqueId, { callback: localCallback, recursion });

    const adapterUnsubscribes = this.adapters.map((adapter) => adapter.get(this.id, localCallback));

    const unsubscribeAll = () => {
      this.on_subscriptions.delete(uniqueId);
      adapterUnsubscribes.forEach((unsub) => unsub());
      openUnsubscribe?.();
    };

    return unsubscribeAll;
  }

  /**
   * Callback for each child node
   * @param callback
   */
  map(callback: Callback, recursion = 0): Unsubscribe {
    // should map be called list? on the other hand, map calls back for each change of child node separately
    const id = this.counter++;
    this.map_subscriptions.set(id, { callback, recursion });
    const latestMap = new Map<string, NodeValue>();

    let adapterSubs: Unsubscribe[] = [];
    const openUnsubs: Record<string, Unsubscribe> = {}; // Changed to a dictionary

    const unsubscribeFromAdapters = () => {
      adapterSubs.forEach((unsub) => unsub());
    };

    const cb: Callback = (value, path, updatedAt) => {
      const latest = latestMap.get(path);
      if (updatedAt !== undefined && latest && latest.updatedAt >= updatedAt) {
        return;
      }

      if (updatedAt !== undefined) {
        latestMap.set(path, { value, updatedAt });
      }

      const childName = path.split('/').pop()!;
      this.get(childName).put(value, updatedAt);

      if (recursion > 0 && value === DIR_VALUE) {
        if (!openUnsubs[childName]) {
          // Check if an Unsubscribe exists for this child
          openUnsubs[childName] = this.get(childName).open(callback, recursion - 1);
        }
      } else {
        callback(value, path, updatedAt, () => {
          this.map_subscriptions.delete(id);
          unsubscribeFromAdapters();
          Object.values(openUnsubs).forEach((unsub) => unsub()); // Unsubscribe all
        });
      }
    };

    adapterSubs = this.adapters.map((adapter) => adapter.list(this.id, cb));

    const unsubscribe = () => {
      this.map_subscriptions.delete(id);
      unsubscribeFromAdapters();
      Object.values(openUnsubs).forEach((unsub) => unsub()); // Unsubscribe all
    };

    return unsubscribe;
  }

  /**
   * Same as on(), but will unsubscribe after the first callback
   * @param callback
   */
  once(callback?: Callback, returnIfUndefined = false, recursion = 1): Promise<JsonValue> {
    return new Promise((resolve) => {
      let resolved = false;
      const cb: Callback = (value, updatedAt, path, unsub) => {
        if (resolved) return;
        resolved = true;
        resolve(value);
        callback?.(value, updatedAt, path, () => {});
        unsub();
      };
      this.on(cb, returnIfUndefined, recursion);
    });
  }
}
