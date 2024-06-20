import { clsx } from 'clsx';
import { FC, useCallback } from 'react';

import { UiLayout, useOptions } from './context';

import styles from './options.module.scss';

export const Options: FC = () => {
  return (
    <div className={styles.root}>
      <h2>Options</h2>
      <h3>Layout</h3>
      <ul className={styles.layouts}>
        <LayoutIcon type="mjcj" />
        <LayoutIcon type="cjmj" />
        <LayoutIcon type="jmjc" />
        <LayoutIcon type="jcjm" />
        <LayoutIcon type="jjmc" />
        <LayoutIcon type="mcjj" />
        <LayoutIcon type="jjcm" />
        <LayoutIcon type="cmjj" />
        <LayoutIcon type="ccmm" />
        <LayoutIcon type="mmcc" />
        <LayoutIcon type="cmcm" />
        <LayoutIcon type="mcmc" />
      </ul>
    </div>
  );
};

const LayoutIcon: FC<{ type: UiLayout }> = ({ type }) => {
  const { layout, set } = useOptions();
  const active = layout === type;

  const selectThisLayout = useCallback(() => set('layout', type), [set, type]);

  return (
    <li
      className={clsx(styles.layout, styles[type], active && styles.active)}
      onClick={selectThisLayout}
    >
      <div className={styles.matrix} />
      <div className={styles.circle} />
      {type.includes('j') && <div className={styles.jisho} />}
    </li>
  );
};
