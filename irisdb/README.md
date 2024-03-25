IrisDB
======
IrisDB is a simple treelike data structure with subscribable nodes. It can be easily synced over different transports.
 
For example, it provides a very simple way for local state management in React applications. The state can be optionally persisted in localStorage or synced between browser tabs.

Similarly it can be used for "public state" management to synchronize with other users and devices. You can easily build all kinds of decentralized applications where accounts are public keys.

See it in action on [docs.iris.to](https://docs.iris.to/).

It's inspired by [GunDB](https://github.com/amark/gun) and has a similar API.

## Example

### Persist React app local state in localStorage and sync between tabs

```tsx
import { useLocalState } from 'irisdb';

function LoginDialog() {
  const [myPrivateKey, setMyPrivateKey] = useLocalState('user/privateKey', '');

  if (!myPrivateKey) {
    return (
      <div>
        <input value={myPrivateKey} onChange={e => setMyPrivateKey(e.target.value)} />
      </div>
    );
  }
    
  return (
    <div>
      <p>Logged in</p>
      <button onClick={() => setMyPrivateKey('')}>Log out</button>
    </div>
  );
}
```


### Collaborative document editing

Uses the [NDK](https://github.com/nostr-dev-kit/ndk) adapter to sync over [Nostr](https://nostr.com).

```tsx
import { Node, useNodeState, MemoryAdapter, NDKAdapter } from 'irisdb';
import { ndk } from '../my-ndk-singleton';

const myPublicKey = 'npub1g53mukxnjkcmr94fhryzkqutdz2ukq4ks0gvy5af25rgmwsl4ngq43drvk';
const friendPublicKey = 'npub1az9xj85cmxv8e9j9y80lvqp97crsqdu2fpu3srwthd99qfu9qsgstam8y8';
const authors = [myPublicKey, friendPublicKey];

const publicState = new Node({
  adapters: [new MemoryAdapter(), new NDKAdapter(ndk, authors)],
});

const titlePath = 'apps/canvas/documents/test1/title';
const [docName, setDocName] = useNodeState(publicState, titlePath, 'Untitled Document');

publicState.get(path).on((value) => {
  console.log('Title changed to', value);
});

return (
  <div>
    <input value={docName} onChange={e => setDocName(e.target.value)} />
  </div>
);
```