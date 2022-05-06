import { createClient } from '@supabase/supabase-js';
import { DateTime } from 'luxon';
import { GetServerSidePropsContext } from 'next/types';
import * as React from 'react';

import { PuzzleRow } from '@/lib/puzzleRow';

import Layout from '@/components/layout/Layout';
import ButtonLink from '@/components/links/ButtonLink';
import Seo from '@/components/Seo';

export default function Page({ data }: { data: PuzzleRow[] }) {
  return (
    <Layout>
      <Seo templateTitle='Puzzle List' />

      <main>
        <section className=''>
          <div className='layout flex min-h-screen flex-col items-center justify-center text-center'>
            <h1 className='mt-4'>Warehouse Game</h1>
            <div
              className='mt-2 flex flex-col items-center justify-center'
              id='puzzles'
            >
              <div className='overflow-hidden rounded-md border border-black'>
                <table className='w-full'>
                  <thead className='bg-gray-400'>
                    <tr>
                      <th className='pr-2 text-left'></th>
                      <th className='pr-2 text-left'>Puzzle Name</th>
                      <th className='pr-2 text-left'>First Clear</th>
                      <th className='pr-2 text-left'>Record Holder</th>
                      <th className='pr-2 text-left'>Score</th>
                      <th className='pr-2 text-left'>Record Since</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data &&
                      data.map((puzzle) => (
                        <tr
                          key={puzzle.seedlev}
                          className='odd:bg-white even:bg-gray-200'
                        >
                          <td className='text-left'>
                            <ButtonLink
                              href={`/puzzle/${puzzle.seedlev}`}
                              className='py-0 px-2'
                            >
                              Play
                            </ButtonLink>
                          </td>
                          <td className='text-left'>{puzzle.puzname}</td>
                          <td className='text-left'>{puzzle.name}</td>
                          <td className='text-left'>{puzzle.recname}</td>
                          <td className='text-left'>{puzzle.score}</td>
                          <td className='text-left'>
                            {DateTime.fromISO(puzzle.when).toRelative()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export async function getServerSideProps(_ctx: GetServerSidePropsContext) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PRIVATE_SUPABASE_KEY || ''
  );

  const { data } = await supabase.from('puzzles').select('*').limit(10);

  return {
    props: {
      data,
    },
  };
}
