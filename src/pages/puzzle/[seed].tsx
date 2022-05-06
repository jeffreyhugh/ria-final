import { useRouter } from 'next/router';
import { NextPageContext } from 'next/types';
import * as React from 'react';

import { keycode, tiles } from '@/lib/game_const';
import { checkWin, GameValues, handleKeyDown, init } from '@/lib/game_utils';

import Button from '@/components/buttons/Button';
import Layout from '@/components/layout/Layout';
import ButtonLink from '@/components/links/ButtonLink';
import Seo from '@/components/Seo';

export default function Page({ seed }: { seed: string }) {
  const router = useRouter();

  const initial = init(seed);

  const [bob, setBob] = React.useState(initial.bob);
  const [board, setBoard] = React.useState(initial.board);
  const [score, setScore] = React.useState(initial.score);
  const [isPlaying, setIsPlaying] = React.useState(true);

  const handleGameLogic = (key: string) => {
    if (isPlaying) {
      const newState = handleKeyDown(key, { bob, board, score });

      setBob(newState.bob);
      setBoard(newState.board);
      setScore(newState.score);

      if (checkWin(newState)) {
        setIsPlaying(false);
      }
    }
  };

  return (
    <Layout>
      <Seo templateTitle='Puzzle' />

      <main>
        <section className=''>
          <div className='layout flex min-h-screen flex-col items-center justify-center text-center'>
            <h1 className='mt-4'>Warehouse Game</h1>
            <div className='mt-2 flex justify-between gap-2' id='buttonBar'>
              <Button
                onClick={() => {
                  // new seed is between 1111 and 999999, casted to a string
                  const newSeed = Math.floor(
                    Math.random() * (999999 - 1111) + 1111
                  ).toString();

                  // TODO pushing a new route does not update the page/state/something
                  // console.log suggests the new data is correctly initialized, but it is not rendered
                  // the workaround is below (set state manually)
                  router.push(`/puzzle/${newSeed}`);

                  const initial = init(newSeed);

                  setBob(initial.bob);
                  setBoard(initial.board);
                  setScore(initial.score);
                  setIsPlaying(true);
                }}
              >
                New Game
              </Button>
              <Button
                onClick={() => {
                  setBob(initial.bob);
                  setBoard(initial.board);
                  setScore(initial.score);
                  setIsPlaying(true);
                }}
              >
                Restart
              </Button>
              <ButtonLink href='/puzzle'>Puzzle List</ButtonLink>
            </div>
            <div
              className='mt-2 flex flex-col items-center justify-center'
              id='board'
            >
              <Board
                gameValues={{
                  bob,
                  board,
                  score,
                }}
                isPlaying={isPlaying}
              />
            </div>
            <div
              className='mt-2 grid grid-cols-3 grid-rows-2 gap-1'
              id='onScreenControls'
            >
              <OnScreenControls handleGameLogic={handleGameLogic} />
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

// getServerSideProps will fetch the seed from the dynamic route on the server, instead of on the client
// if the seed is fetched from the client, it could seed the random number generator incorrectly
export async function getServerSideProps(ctx: NextPageContext) {
  const { seed } = ctx.query;
  return {
    props: {
      seed,
    },
  };
}

const Board = ({
  gameValues,
  isPlaying,
}: {
  gameValues: GameValues;
  isPlaying: boolean;
}) => {
  const boardSize = gameValues.board.length;

  return (
    <>
      <div className='overflow-hidden rounded-md border border-black p-4'>
        <div
          className='grid grid-flow-row-dense text-lg'
          style={{
            gridTemplateRows: `repeat(${boardSize},minmax(0,1fr))`,
            gridTemplateColumns: `repeat(${boardSize},minmax(0,1fr))`,
            width: `${boardSize * 48}px`,
          }}
        >
          {gameValues.board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              if (
                rowIndex === gameValues.bob.row &&
                colIndex === gameValues.bob.col
              ) {
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    dangerouslySetInnerHTML={{
                      __html: tiles.bob[gameValues.bob.direction],
                    }}
                  />
                );
              } else if (
                rowIndex === gameValues.bob.targetRow &&
                colIndex === gameValues.bob.targetCol
              ) {
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    dangerouslySetInnerHTML={{
                      __html: tiles.target[cell],
                    }}
                  />
                );
              } else if (cell !== 0) {
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    dangerouslySetInnerHTML={{
                      __html: tiles.crate[cell],
                    }}
                  />
                );
              } else if (
                rowIndex === boardSize - 1 &&
                colIndex === gameValues.bob.doorCol
              ) {
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    dangerouslySetInnerHTML={{
                      __html: tiles.door,
                    }}
                  />
                );
              } else {
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    dangerouslySetInnerHTML={{
                      __html: tiles.empty,
                    }}
                  />
                );
              }
            })
          )}
        </div>
      </div>
      <div className='bold mt-2 flex w-full justify-start text-xl' id='score'>
        {isPlaying ? (
          <span title='Playing'>🎮</span>
        ) : (
          <span title='You win!'>💰</span>
        )}{' '}
        {gameValues.score}
      </div>
    </>
  );
};

const OnScreenControls = ({
  handleGameLogic,
}: {
  handleGameLogic: (key: string) => void;
}) => {
  return (
    <>
      <div
        title='Explode crate'
        className='col-span-1 col-start-1 row-span-1 row-start-1 h-8 w-8 cursor-pointer select-none rounded-md bg-gray-200 ring ring-gray-400'
        onClick={() => handleGameLogic(keycode.SPACE)}
      >
        {/* bomb emoji */}
        <span className='text-2xl'>💣</span>
      </div>
      <div
        title='Move up'
        className='col-span-1 col-start-2 row-span-1 row-start-1 h-8 w-8 cursor-pointer select-none rounded-md bg-gray-200 ring ring-gray-400'
        onClick={() => handleGameLogic(keycode.UP)}
      >
        {/* arrow up emoji */}
        <span className='text-2xl'>⬆</span>
      </div>
      <div
        title='Move left'
        className='col-span-1 col-start-1 row-span-1 row-start-2 h-8 w-8 cursor-pointer select-none rounded-md bg-gray-200 ring ring-gray-400'
        onClick={() => handleGameLogic(keycode.LEFT)}
      >
        {/* arrow left emoji */}
        <span className='text-2xl'>⬅</span>
      </div>
      <div
        title='Move down'
        className='col-span-1 col-start-2 row-span-1 row-start-2 h-8 w-8 cursor-pointer select-none rounded-md bg-gray-200 ring ring-gray-400'
        onClick={() => handleGameLogic(keycode.DOWN)}
      >
        {/* arrow down emoji */}
        <span className='text-2xl'>⬇</span>
      </div>
      <div
        title='Move right'
        className='col-span-1 col-start-3 row-span-1 row-start-2 h-8 w-8 cursor-pointer select-none rounded-md bg-gray-200 ring ring-gray-400'
        onClick={() => handleGameLogic(keycode.RIGHT)}
      >
        {/* arrow right emoji */}
        <span className='text-2xl'>➡</span>
      </div>
    </>
  );
};
