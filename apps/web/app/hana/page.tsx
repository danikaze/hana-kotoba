import { HanaGame } from '../../components/hana-game';
import { OptionsProvider } from '../../components/options/context';

import styles from '../page.module.scss';

export default async function HanaPage() {
  return (
    <div className={styles.page}>
      <OptionsProvider>
        <HanaGame />
      </OptionsProvider>
    </div>
  );
}
