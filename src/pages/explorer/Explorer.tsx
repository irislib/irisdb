import localState from '@/state/LocalState.ts';
import publicState from '@/state/PublicState.ts';
import ExplorerNode from './ExplorerNode.tsx';
import LoginDialog from "@/shared/components/LoginDialog.tsx";
import useLocalState from "@/state/useLocalState.ts";

type Props = {
  p?: string;
  path?: string;
};

const Explorer = ({ p }: Props) => {
  const [pubKey] = useLocalState('user/publicKey', '');
  const [name] = useLocalState('user/name', '');

  const publicStateText =  name ? `User public state (${name})` : 'User public state';

  return (
    <div className="flex flex-col gap-2">
      <div className="px-2 md:px-0">
        <LoginDialog />
      </div>
      <div>{p}</div>
      <div className="mb-4">
        <ExplorerNode expanded={true} name="Local state" node={localState} />
      </div>
      {
        pubKey && (
          <div className="mb-4">
            <ExplorerNode expanded={true} name={publicStateText} node={publicState([pubKey])} />
          </div>
        )
      }
    </div>
  );
};

export default Explorer;
