import { MouseEvent, MouseEventHandler, useEffect, useState } from 'react';

type OptionalGetter<T> = T | (() => T);

type Props = {
  copyStr: OptionalGetter<string>;
  text: string;
  className?: string;
};

const Copy = ({ copyStr, text, className }: Props) => {
  const [copied, setCopied] = useState(false);
  const [originalWidth, setOriginalWidth] = useState<number | undefined>(undefined);
  const [timeout, setTimeoutState] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = (e: MouseEvent<HTMLButtonElement>, copyStr: string) => {
    if (e.target === null) {
      return;
    }
    navigator.clipboard.writeText(copyStr);

    const target = e.target as HTMLElement;
    const width = target.offsetWidth;
    if (width === undefined) {
      return;
    }
    setOriginalWidth(originalWidth || width + 1);
    target.style.width = `${originalWidth}px`;

    setCopied(true);
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    setTimeoutState(setTimeout(() => setCopied(false), 2000));
  };

  const onClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    const copyStrValue = typeof copyStr === 'function' ? copyStr() : copyStr;

    copy(e, copyStrValue);
  };

  useEffect(() => {
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [timeout]);

  const buttonText = copied ? 'Copied' : text || 'Copy';
  return (
    <button className={className || 'btn'} onClick={(e) => onClick(e)}>
      {buttonText}
    </button>
  );
};

export default Copy;
