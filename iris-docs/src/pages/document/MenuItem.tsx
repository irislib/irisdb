import { RemixiconComponentType } from '@remixicon/react';

type MenuItemProps = {
  IconComponent?: RemixiconComponentType;
  title?: string;
  action?: () => void;
  isActive?: () => boolean;
};

export default ({ IconComponent, title, action, isActive }: MenuItemProps) => {
  return (
    <button
      className={`${isActive && isActive() ? 'bg-primary text-primary-content' : 'text-base-content'} flex items-center justify-center w-10 h-10 rounded-md hover:bg-primary hover:text-primary-content transition duration-150 ease-in-out`}
      onClick={action}
      title={title}
    >
      {IconComponent && <IconComponent className="h-5 w-5" />}
    </button>
  );
};
