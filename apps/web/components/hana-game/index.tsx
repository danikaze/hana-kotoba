'use client';

import { clsx } from 'clsx';
import { FC, ReactNode } from 'react';

import { ButtonCorner } from '../button-corner';
import { CharsCircle } from '../chars-circle';
import { CompletedModal } from '../completed-modal';
import { JishoPanel } from '../jisho-panel';
import { Modal } from '../modal';
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

  if (!data.matrix) {
    return (
      <div className={clsx(styles.root, styles.loading)}>
        Loading... ({data.loadTry})
      </div>
    );
  }

  return (
    <div className={clsx(styles.root, styles[data.layout])}>
      {renderMatrix(data)}
      {renderCircle(data)}
      {renderJishoPanel(data)}
      {renderJishoModal(data)}
    </div>
  );
};

function renderMatrix({ matrix, isFoundCell }: HookData): ReactNode {
  return (
    <div className={clsx(styles.quarter, styles.matrix)}>
      <div className={styles.container}>
        <WordMatrix rows={matrix!} isFoundCell={isFoundCell} />
      </div>
    </div>
  );
}

function renderCircle({
  layout,
  chars,
  completed,
  toggleJishoModal,
  getNewBoard,
  onCharSelected,
}: HookData): ReactNode {
  return (
    <div className={clsx(styles.quarter, styles.circle)}>
      <ButtonCorner position="top-right" onClick={toggleJishoModal} />
      <div className={clsx(styles.container, styles[getPanelLayout(layout)])}>
        <CharsCircle chars={chars!} onCharSelected={onCharSelected} />
      </div>
      {completed && <CompletedModal reloadBoard={getNewBoard} />}
    </div>
  );
}

function renderJishoPanel({
  layout,
  foundWords,
  totalWords,
  openJishoWords,
  toggleJishoWord,
}: HookData): ReactNode {
  if (!layout.includes('j')) return null;

  return (
    <div className={clsx(styles.jisho)}>
      <JishoPanel
        words={foundWords}
        total={totalWords}
        openWords={openJishoWords}
        toggleWord={toggleJishoWord}
      />
    </div>
  );
}

function renderJishoModal({
  layout,
  foundWords,
  totalWords,
  openJishoWords,
  isJishoModalOpen,
  toggleJishoWord,
  toggleJishoModal,
}: HookData): ReactNode {
  if (layout.includes('j')) return null;

  return (
    <Modal isOpen={isJishoModalOpen} onClose={toggleJishoModal}>
      <JishoPanel
        words={foundWords}
        total={totalWords}
        openWords={openJishoWords}
        toggleWord={toggleJishoWord}
      />
    </Modal>
  );
}

function getPanelLayout(layout: HookData['layout']): PanelLayout {
  return layout === 'ccmm' || layout === 'mmcc'
    ? 'horizontal'
    : layout === 'cmcm' || layout === 'mcmc'
    ? 'vertical'
    : 'square';
}
