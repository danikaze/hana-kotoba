import { useEffect, useMemo, useRef, useState } from 'react';
import { throttle } from 'throttle-debounce';

import { WordMatrixCell } from '.';

export function useWordMatrix(rows: WordMatrixCell[][]) {
  const ref = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState<number | undefined>(undefined);

  const calculateCellSize = useMemo(
    () =>
      throttle(
        50,
        () => {
          if (!ref.current) return;
          const { width, height } = ref.current.getBoundingClientRect();
          const cw = width / rows[0].length;
          const ch = height / rows.length;

          setCellSize(Math.min(cw, ch));
        },
        { noTrailing: false }
      ),
    [rows]
  );

  useEffect(() => {
    window.addEventListener('resize', calculateCellSize);
    return () => window.removeEventListener('resize', calculateCellSize);
  }, [calculateCellSize]);

  useEffect(calculateCellSize, [ref.current, calculateCellSize]);

  return {
    ref,
    cellSize,
  };
}
