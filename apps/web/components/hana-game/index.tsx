'use client';

import { clsx } from 'clsx';
import { FC } from 'react';

import { ButtonCorner } from '../button-corner';
import { CharsCircle } from '../chars-circle';
import { CompletedModal } from '../completed-modal';
import { Jisho } from '../jisho-panel';
import { Modal } from '../modal';
import { Options } from '../options';
import { UiLayout, useOptions } from '../options/context';
import { WordMatrix } from '../word-matrix';
import { useHanaPage } from './hooks';

import styles from './hana-game.module.scss';

export interface FoundCell {
  col: number;
  row: number;
}

export type PanelLayout = 'square' | 'horizontal' | 'vertical';

type HookData = ReturnType<typeof useHanaPage>;

export const HanaGame: FC = () => {
  const data = useHanaPage();
  const { layout } = useOptions();

  if (!data.matrix) {
    return (
      <div className={clsx(styles.root, styles.loading)}>
        Loading... ({data.loadTry})
      </div>
    );
  }

  return (
    <div className={clsx(styles.root, styles[layout])}>
      <MatrixPanel {...data} />
      <CirclePanel {...data} />
      <JishoPanel {...data} />
      <JishoModal {...data} />
      <OptionsModal {...data} />
    </div>
  );
};

const MatrixPanel: FC<HookData> = ({ matrix, isFoundCell }: HookData) => {
  return (
    <div className={clsx(styles.quarter, styles.matrix)}>
      <div className={styles.container}>
        <WordMatrix rows={matrix!} isFoundCell={isFoundCell} />
      </div>
    </div>
  );
};

const CirclePanel: FC<HookData> = ({
  chars,
  completed,
  toggleJishoModal,
  toggleOptionsModal,
  getNewBoard,
  onCharSelected,
}) => {
  const { layout } = useOptions();
  const bottomPos = isCirclePanelBottom(layout) ? 'bottom' : 'top';

  return (
    <div className={clsx(styles.quarter, styles.circle)}>
      <ButtonCorner
        position={`${bottomPos}-left`}
        onClick={toggleOptionsModal}
      />
      {!isJishoPanelVisible(layout) && (
        <ButtonCorner
          position={`${bottomPos}-right`}
          onClick={toggleJishoModal}
        />
      )}
      <div className={clsx(styles.container, styles[getPanelLayout(layout)])}>
        <CharsCircle chars={chars!} onCharSelected={onCharSelected} />
      </div>
      {completed && <CompletedModal reloadBoard={getNewBoard} />}
    </div>
  );
};

const JishoPanel: FC<HookData> = ({
  foundWords,
  totalWords,
  openJishoWords,
  toggleJishoWord,
}) => {
  const { layout } = useOptions();
  if (!isJishoPanelVisible(layout)) return null;

  return (
    <div className={clsx(styles.jisho)}>
      <Jisho
        words={foundWords}
        total={totalWords}
        openWords={openJishoWords}
        toggleWord={toggleJishoWord}
      />
    </div>
  );
};

const JishoModal: FC<HookData> = ({
  foundWords,
  totalWords,
  openJishoWords,
  isJishoModalOpen,
  toggleJishoWord,
  toggleJishoModal,
}) => {
  const { layout } = useOptions();
  if (isJishoPanelVisible(layout)) return null;

  return (
    <Modal isOpen={isJishoModalOpen} onClose={toggleJishoModal}>
      <Jisho
        words={foundWords}
        total={totalWords}
        openWords={openJishoWords}
        toggleWord={toggleJishoWord}
      />
    </Modal>
  );
};

const OptionsModal: FC<HookData> = ({
  isOptionsModalOpen,
  toggleOptionsModal,
}) => {
  return (
    <Modal isOpen={isOptionsModalOpen} onClose={toggleOptionsModal}>
      <Options />
    </Modal>
  );
};

function getPanelLayout(layout: UiLayout): PanelLayout {
  return layout === 'ccmm' || layout === 'mmcc'
    ? 'horizontal'
    : layout === 'cmcm' || layout === 'mcmc'
    ? 'vertical'
    : 'square';
}

function isCirclePanelBottom(layout: UiLayout): boolean {
  return ['mjcj', 'jmjc', 'jjmc', 'jjcm', 'mmcc'].includes(layout);
}

function isJishoPanelVisible(layout: UiLayout): boolean {
  return layout.includes('j');
}
