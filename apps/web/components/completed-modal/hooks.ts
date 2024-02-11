import { useCallback } from 'react';
import { Props } from '.';

export function useCompletedModal({ reloadBoard }: Props) {
  const getNewBoard = useCallback(() => reloadBoard(), [reloadBoard]);

  return { getNewBoard };
}
