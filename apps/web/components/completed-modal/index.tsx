import { FC } from 'react';

import { useCompletedModal } from './hooks';

import styles from './completed-modal.module.scss';

export interface Props {
  reloadBoard: () => void;
}

export const CompletedModal: FC<Props> = (props) => {
  const { getNewBoard } = useCompletedModal(props);

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <h2>Completed!</h2>
        <div className={styles.button} onClick={getNewBoard}>
          Get new board
        </div>
      </div>
    </div>
  );
};
