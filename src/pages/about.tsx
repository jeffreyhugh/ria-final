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
            <h1 className='mt-4'>Warehouse Game</h1>
            <div className='mt-6 flex justify-center gap-4'>
              <ButtonLink variant='primary' href='/puzzle/random'>
                Play Now
              </ButtonLink>
              <ButtonLink variant='outline' href='/puzzle'>
                Puzzle List
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
