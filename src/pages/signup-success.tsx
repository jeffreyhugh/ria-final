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
            <h1>Looks good!</h1>
            <p className='mt-4'>
              Make sure to confirm your email before you start playing!
            </p>
            <ButtonLink
              variant='primary'
              className='mt-6'
              href='/puzzle/random'
            >
              Random Level
            </ButtonLink>
          </div>
        </section>
      </main>
    </Layout>
  );
}
