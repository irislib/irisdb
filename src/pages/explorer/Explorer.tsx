import localState from '@/state/LocalState.ts';
import publicState from '@/state/PublicState.ts';
import ExplorerNode from './ExplorerNode.tsx';
import LoginButton from "@/shared/components/LoginButton.tsx";
import useLocalState from "@/state/useLocalState.ts";

type Props = {
  p?: string;
  path?: string;
};

const Explorer = ({ p }: Props) => {
  const [pubKey] = useLocalState('publicKey', '');

  return (
    <>
      <LoginButton />
      <div>{p}</div>
      <div className="mb-4">
        <ExplorerNode expanded={true} name="Local state" node={localState} />
      </div>
      {
        pubKey && (
          <div className="mb-4">
            <ExplorerNode expanded={true} name="User state (public on Nostr)" node={publicState([pubKey])} />
          </div>
        )
      }
    </>
  );
};

export default Explorer;
