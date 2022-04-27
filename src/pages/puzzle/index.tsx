import * as React from 'react';

import Layout from '@/components/layout/Layout';
import Seo from '@/components/Seo';

export default function Page() {
  return (
    <Layout>
      <Seo templateTitle='Puzzle List' />

      <main>
        <section className=''>
          <div className='layout min-h-screen py-20'>
            {/* TODO add puzzles */}
          </div>
        </section>
      </main>
    </Layout>
  );
}
