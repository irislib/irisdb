import localState from '@/state/LocalState.ts';
import publicState from '@/state/PublicState.ts';
import ExplorerNode from './ExplorerNode.tsx';

type Props = {
  p?: string;
  path?: string;
};

const Explorer = ({ p }: Props) => {
  return (
    <div className="md:m-4">
      <div>{p}</div>
      <div className="mb-4">
        <ExplorerNode expanded={true} name="Local state" node={localState} />
      </div>
      <div className="mb-4">
        <ExplorerNode expanded={true} name="Public state" node={publicState} />
      </div>
    </div>
  );
};

export default Explorer;
