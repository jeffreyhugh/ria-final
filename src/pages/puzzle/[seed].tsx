import { GetServerSideProps } from 'next';
import * as React from 'react';

import useGameState from '@/lib/gamestate';
import { tiles } from '@/lib/gamestate_const';

import Layout from '@/components/layout/Layout';
import Seo from '@/components/Seo';

export default function Page({ seed }: { seed: string }) {
  const gameState = useGameState(seed);

  const boardSize = gameState.getBoard().length;

  return (
    <Layout>
      <Seo templateTitle='Puzzle' />

      <main>
        <section className=''>
          <div className='layout flex min-h-screen flex-col items-center justify-center text-center'>
            <h1 className='mt-4'>Warehouse Game</h1>
            <div
              className='mt-2 flex justify-between gap-2'
              id='buttonBar'
            ></div>
            <div className='mt-2 flex justify-center'>
              <div
                className='grid grid-flow-row-dense text-lg'
                style={{
                  gridTemplateRows: `repeat(${boardSize},minmax(0,1fr))`,
                  gridTemplateColumns: `repeat(${boardSize},minmax(0,1fr))`,
                  width: `${boardSize * 48}px`,
                }}
              >
                {gameState.getBoard().map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    if (
                      rowIndex === gameState.getBob().row &&
                      colIndex === gameState.getBob().col
                    ) {
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          dangerouslySetInnerHTML={{
                            __html: tiles.bob[gameState.getBob().direction],
                          }}
                        />
                      );
                    } else if (
                      rowIndex === gameState.getBob().targetRow &&
                      colIndex === gameState.getBob().targetCol
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
                      colIndex === gameState.getBob().doorCol
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
          </div>
        </section>
      </main>
    </Layout>
  );
}

// getServerSideProps will fetch the seed from the dynamic route on the server, instead of on the client
// if the seed is fetched from the client, it could seed the random number generator incorrectly
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { seed } = ctx.query;

  return {
    props: {
      seed,
    },
  };
};
