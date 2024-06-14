import { FC } from 'react';
import { clsx } from 'clsx';

import styles from './button-corner.module.scss';

export type Props = {
  onClick: () => void;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
};

export const ButtonCorner: FC<Props> = ({ onClick, position, className }) => {
  return (
    <div className={clsx(styles.root, styles[position])}>
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
      >
        <path
          onClick={onClick}
          className={clsx(styles.shape, className)}
          d={PATH_DEF[position]}
        />
      </svg>
    </div>
  );
};

const PATH_DEF: Record<Props['position'], string> = {
  'top-left': 'M100,0 L99,1 Q10,10 1,99 L0,100 L0,0 L100,0',
  'top-right': 'M0,0 L1,1 Q90,10 99,99 L100,100 L100,0 L0,0',
  'bottom-left': 'M100,100 L99,99 Q10,90 1,1 L0,0 L0,100 L100,100',
  'bottom-right': 'M0,100 L1,99 Q90,90 99,1 L100,0 L100,100 L0,100',
};
