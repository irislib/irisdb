import { localState } from 'irisdb';
import { useLocalState } from 'irisdb-hooks';
import { publicState } from 'irisdb-nostr';
import { useParams } from 'react-router-dom';

import ExplorerNode from './ExplorerNode';

type Props = {
  p?: string;
  path?: string;
};

const Explorer = ({ p }: Props) => {
  const [pubKey] = useLocalState('user/publicKey', '');
  const [name] = useLocalState('user/name', '');
  const { user } = useParams();

  const publicStateText = name ? `User public state (${name})` : 'User public data';

  return (
    <div className="flex flex-col gap-2">
      <div>{p}</div>
      <div className="mb-4">
        <ExplorerNode expanded={true} name="Local data" node={localState} />
      </div>
      {user && (
        <div className="mb-4">
          <ExplorerNode expanded={true} name="User public data" node={publicState(user)} />
        </div>
      )}
      {!user && pubKey && (
        <div className="mb-4">
          <ExplorerNode expanded={true} name={publicStateText} node={publicState(pubKey)} />
        </div>
      )}
    </div>
  );
};

export default Explorer;
