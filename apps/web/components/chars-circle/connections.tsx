import { FC, ReactNode, RefObject, useRef } from 'react';
import clsx from 'clsx';

import styles from './chars-circle.module.scss';

export const Connections: FC<{
  vertices: { ref: RefObject<HTMLDivElement>; invalid: boolean }[];
  isWord: boolean;
}> = ({ vertices, isWord }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  if (!svgRef.current || !vertices) {
    return <svg ref={svgRef} className={styles.connections} />;
  }

  const lines: ReactNode[] = [];
  const { left: offsetX, top: offsetY } =
    svgRef.current.getBoundingClientRect();

  for (let i = 0; i < vertices.length - 1; i++) {
    const from = vertices[i];
    const to = vertices[i + 1];

    if (!from.ref.current || !to.ref.current) continue;
    const v0 = from.ref.current?.getBoundingClientRect();
    const v1 = to.ref.current?.getBoundingClientRect();
    const classes = clsx(to.invalid && styles.invalid, isWord && styles.found);

    lines.push(
      <line
        key={i}
        className={classes}
        x1={v0.left + v0.width / 2 - offsetX}
        y1={v0.top + v0.height / 2 - offsetY}
        x2={v1.left + v1.width / 2 - offsetX}
        y2={v1.top + v1.height / 2 - offsetY}
      />
    );
  }

  return (
    <svg ref={svgRef} className={styles.connections}>
      {lines}
    </svg>
  );
};
