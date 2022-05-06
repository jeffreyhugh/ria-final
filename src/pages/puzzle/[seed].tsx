import { Dialog } from '@headlessui/react';
import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs';
import { useUser } from '@supabase/supabase-auth-helpers/react';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { keycode, tiles } from '@/lib/game_const';
import { checkWin, GameValues, handleKeyDown, init } from '@/lib/game_utils';
import { PuzzleRow } from '@/lib/puzzleRow';

import Button from '@/components/buttons/Button';
import Input from '@/components/forms/Input';
import Layout from '@/components/layout/Layout';
import ButtonLink from '@/components/links/ButtonLink';
import Seo from '@/components/Seo';

export default function Page({
  seed,
  data,
}: {
  seed: string;
  data: PuzzleRow | null;
}) {
  const router = useRouter();

  const initial = init(seed);

  const [bob, setBob] = React.useState(initial.bob);
  const [board, setBoard] = React.useState(initial.board);
  const [score, setScore] = React.useState(initial.score);
  const [isPlaying, setIsPlaying] = React.useState(true);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [submitDisabled, setSubmitDisabled] = React.useState(false);
  const methods = useForm({
    mode: 'onTouched',
  });
  const { handleSubmit } = methods;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (submit: any) => {
    if (!user) return;

    setSubmitDisabled(true);
    fetch('/api/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seed,
        username: user.user_metadata.username,
        levelName: submit.puzzleName,
        score,
      }),
    }).finally(() => {
      setModalOpen(false);
      setSubmitDisabled(false);
    });
  };

  const { user } = useUser();

  const handleGameLogic = (key: string) => {
    if (isPlaying) {
      const newState = handleKeyDown(key, { bob, board, score });

      setBob(newState.bob);
      setBoard(newState.board);
      setScore(newState.score);

      if (checkWin(newState)) {
        setIsPlaying(false);

        // conditions where user has gotten a leaderboard position
        if (!data) {
          setModalOpen(true);
        } else if (user && score < data.score) {
          setModalOpen(true);
        }
      }
    }
  };

  return (
    <Layout>
      <Seo templateTitle='Puzzle' />

      <main>
        <section className=''>
          <div>
            <Dialog
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              className='relative z-10'
            >
              <div
                className='fixed inset-0 backdrop-blur-sm'
                aria-hidden='true'
              />
              <div className='fixed inset-0 flex items-center justify-center p-4'>
                <Dialog.Panel className='flex flex-col items-center rounded-md border border-black bg-white p-4'>
                  <Dialog.Title>New High Score!</Dialog.Title>
                  <FormProvider {...methods}>
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className='mt-6 flex flex-col items-center space-y-3'
                    >
                      {data && data.puzname ? null : (
                        <Input
                          id='puzzleName'
                          label='Puzzle Name'
                          validation={{ required: 'Puzzle name is required' }}
                        />
                      )}
                      <Button
                        type='submit'
                        className='select-none'
                        disabled={submitDisabled}
                      >
                        Submit High Score
                      </Button>
                    </form>
                  </FormProvider>
                </Dialog.Panel>
              </div>
            </Dialog>
          </div>

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
                levelData={data}
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
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { seed } = ctx.query;

  const { data } = await supabaseServerClient(ctx)
    .from('puzzles')
    .select('*')
    .eq('seedlev', seed)
    .limit(1);

  return {
    props: {
      seed,
      data: data && data[0] ? data[0] : null,
    },
  };
}

const Board = ({
  gameValues,
  isPlaying,
  levelData,
}: {
  gameValues: GameValues;
  isPlaying: boolean;
  levelData: PuzzleRow | null;
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
      <div className='bold mt-2 flex w-full justify-between text-xl' id='score'>
        <div>
          {isPlaying ? (
            <span title='Playing'>🎮</span>
          ) : (
            <span title='You win!'>💰</span>
          )}{' '}
          {gameValues.score}
        </div>
        <div className='flex flex-col items-end'>
          <p>
            {levelData ? levelData.score : '???'}{' '}
            <span title='High score'>🥇</span>
          </p>
          <p>
            {levelData ? levelData.recname : '???'}{' '}
            <span title='Record holder'>👑</span>
          </p>
        </div>
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
