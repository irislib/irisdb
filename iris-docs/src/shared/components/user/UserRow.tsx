import { Avatar } from '@/shared/components/user/Avatar';
import { Name } from '@/shared/components/user/Name';

export function UserRow({ pubKey, description }: { pubKey: string; description?: string }) {
  return (
    <div className="flex flex-row items-center gap-2 justify-between">
      <div className="flex items-center gap-2 flex-row">
        <Avatar pubKey={pubKey} />
        <Name pubKey={pubKey} />
      </div>
      <span className="text-base-content">{description}</span>
    </div>
  );
}
