import { nip19 } from 'nostr-tools';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import localState from '@/irisdb/LocalState.ts';
import publicState from '@/irisdb/PublicState.ts';
import { useLocalState } from '@/irisdb/useNodeState.ts';
import Header from '@/shared/components/Header.tsx';
import { PublicKey } from '@/utils/Hex/Hex.ts';

import ExplorerNode from './ExplorerNode.tsx';

type Props = {
  p?: string;
  path?: string;
};

const Explorer = ({ p }: Props) => {
  const [pubKey] = useLocalState('user/publicKey', '');
  const [name] = useLocalState('user/name', '');
  const { user } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    if (pubKey && !user) {
      navigate(`./${nip19.npubEncode(pubKey)}`, { replace: true });
    }
  }, [pubKey, user]);

  const publicStateText = name ? `User public state (${name})` : 'User public state';

  return (
    <div className="flex flex-col gap-2">
      <Header />
      <div>{p}</div>
      <div className="mb-4">
        <ExplorerNode expanded={true} name="Local state" node={localState} />
      </div>
      {user && (
        <div className="mb-4">
          <ExplorerNode
            expanded={true}
            name="User public state"
            node={publicState([new PublicKey(user)])}
          />
        </div>
      )}
      {!user && pubKey && (
        <div className="mb-4">
          <ExplorerNode
            expanded={true}
            name={publicStateText}
            node={publicState([new PublicKey(pubKey)])}
          />
        </div>
      )}
    </div>
  );
};

export default Explorer;
