import * as React from 'react';

import Layout from '@/components/layout/Layout';
import ButtonLink from '@/components/links/ButtonLink';
import Seo from '@/components/Seo';

export default function HomePage() {
  return (
    <Layout>
      {/* <Seo templateTitle='Home' /> */}
      <Seo />

      <main>
        <section className='bg-white'>
          <div className='layout flex min-h-screen flex-col items-center justify-center text-center'>
            <h1>Warehouse Game</h1>
            <div className='mt-6 max-w-sm'>
              <p>
                The game is simple: move the green crate to the starting pink
                square. The challenge? Do it in as few moves as possible.
              </p>
            </div>
            <div className='mt-6 flex justify-center gap-4'>
              <ButtonLink variant='primary' href='/puzzle/random'>
                Play Now
              </ButtonLink>
              <ButtonLink variant='outline' href='/puzzle'>
                Puzzle List
              </ButtonLink>
              <ButtonLink
                variant='outline'
                href='https://github.com/qbxt/ria-final'
              >
                View Code
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
