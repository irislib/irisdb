import { ReactNode } from 'react';

interface ShowProps {
  when: boolean;
  children: ReactNode;
}

const Show = (props: ShowProps) => {
  return props.when ? props.children : null;
};

export default Show;
