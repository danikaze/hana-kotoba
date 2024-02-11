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
  const {
    left: offsetX,
    top: offsetY,
    width,
    height,
  } = svgRef.current.getBoundingClientRect();

  for (let i = 0; i < vertices.length - 1; i++) {
    const from = vertices[i];
    const to = vertices[i + 1];

    if (!from.ref.current || !to.ref.current) continue;
    const classes = clsx(to.invalid && styles.invalid, isWord && styles.found);
    const v0 = from.ref.current?.getBoundingClientRect();
    const v1 = to.ref.current?.getBoundingClientRect();

    // line coordinates are specified in % not absolute values so they don't
    // break when resizing the window
    const x1 = (v0.left + v0.width / 2 - offsetX) / width;
    const y1 = (v0.top + v0.height / 2 - offsetY) / height;
    const x2 = (v1.left + v1.width / 2 - offsetX) / width;
    const y2 = (v1.top + v1.height / 2 - offsetY) / height;

    lines.push(
      <line
        key={i}
        className={classes}
        x1={`${x1 * 100}%`}
        y1={`${y1 * 100}%`}
        x2={`${x2 * 100}%`}
        y2={`${y2 * 100}%`}
      />
    );
  }

  return (
    <svg ref={svgRef} className={styles.connections}>
      {lines}
    </svg>
  );
};
