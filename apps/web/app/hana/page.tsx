import { HanaGame } from '../../components/hana-game';

import styles from '../page.module.scss';

export default async function HanaPage() {
  return (
    <div className={styles.page}>
      <HanaGame />
    </div>
  );
}
