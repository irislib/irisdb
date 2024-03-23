import { useSearchParams } from 'react-router-dom';

export default function useSearchParam(param: string, defaultValue: string) {
  const [searchParams] = useSearchParams();
  return searchParams.get(param) ?? defaultValue;
}
