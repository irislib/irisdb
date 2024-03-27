import { JsonValue } from 'irisdb';
import { useEffect, useRef, useState } from 'react';

const VALUE_TRUNCATE_LENGTH = 20;

type ExplorerNodeValueProps = {
  value: string;
  displayName: string;
  setValue: (value: JsonValue) => void;
};

const ExplorerNodeValue: React.FC<ExplorerNodeValueProps> = ({ displayName, value, setValue }) => {
  const [showMore, setShowMore] = useState(false);
  const [editableValue, setEditableValue] = useState<string>(JSON.stringify(value));
  const inputRef = useRef<HTMLSpanElement>(null);

  const truncateValue = () => {
    if (displayName === 'priv' || displayName === 'key') {
      return `${value.substring(0, 2)}...`;
    }
    return value.length > VALUE_TRUNCATE_LENGTH
      ? `${value.substring(0, VALUE_TRUNCATE_LENGTH)}...`
      : value;
  };

  const handleBlur = () => {
    let parsedValue: JsonValue;
    try {
      parsedValue = JSON.parse(editableValue);
    } catch (e) {
      parsedValue = editableValue;
    }
    setValue(parsedValue);
  };

  useEffect(() => {
    // Handling unmount
    return () => {
      handleBlur();
    };
  }, []);

  if (typeof value === 'string') {
    return (
      <span className="text-xs">
        {value.length > VALUE_TRUNCATE_LENGTH && (
          <span
            className="text-xs text-accent cursor-pointer"
            onClick={() => setShowMore(!showMore)}
          >
            Show {showMore ? 'less' : 'more'}{' '}
          </span>
        )}
        <span
          ref={inputRef}
          contentEditable
          onBlur={handleBlur}
          onInput={(e) => setEditableValue(e.currentTarget.textContent || '')}
        >
          {showMore ? value : truncateValue()}
        </span>
      </span>
    );
  }

  return (
    <span className="text-xs text-primary">
      <span
        ref={inputRef}
        contentEditable
        onBlur={handleBlur}
        onInput={(e) => setEditableValue(e.currentTarget.textContent || '')}
      >
        {JSON.stringify(value)}
      </span>
    </span>
  );
};

export default ExplorerNodeValue;
