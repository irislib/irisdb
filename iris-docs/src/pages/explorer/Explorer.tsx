import { localState } from 'irisdb/src';
import { useLocalState } from 'irisdb-hooks/src';
import { publicState } from 'irisdb-nostr/src';
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

  const publicStateText = name ? `User public state (${name})` : 'User public state';

  return (
    <div className="flex flex-col gap-2">
      <div>{p}</div>
      <div className="mb-4">
        <ExplorerNode expanded={true} name="Local state" node={localState} />
      </div>
      {user && (
        <div className="mb-4">
          <ExplorerNode expanded={true} name="User public state" node={publicState(user)} />
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
