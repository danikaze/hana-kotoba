import { clsx } from 'clsx';
import { FC, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import styles from './modal.module.scss';

export type Props = {
  children: ReactNode;
  isOpen?: boolean;
  onClose: () => void;
};

/**
 * A modal for smartphones that opens from the bottom
 */
export const Modal: FC<Props> = ({ children, isOpen, onClose }) => {
  const modal = (
    <div
      className={clsx(styles.root, isOpen && styles.open)}
      aria-hidden={!isOpen}
    >
      <div className={styles.bg} onClick={onClose} />
      <div className={styles.content}>{children}</div>
    </div>
  );
  return createPortal(modal, document.body);
};
