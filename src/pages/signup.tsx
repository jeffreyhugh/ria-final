import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs';
import { useUser } from '@supabase/supabase-auth-helpers/react';
import { useRouter } from 'next/router';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Button from '@/components/buttons/Button';
import Input from '@/components/forms/Input';
import Layout from '@/components/layout/Layout';
import ButtonLink from '@/components/links/ButtonLink';
import Seo from '@/components/Seo';

export default function Page() {
  const router = useRouter();
  const { isLoading, user, error } = useUser();
  const [formText, setFormText] = React.useState('');

  const methods = useForm({
    mode: 'onTouched',
  });
  const { handleSubmit } = methods;

  const onSubmit = async (data: unknown) => {
    supabaseClient.auth
      .signUp(
        { email: data.email, password: data.password },
        {
          data: {
            username: data.username,
          },
          redirectTo: '/signup-success',
        }
      )
      // eslint-disable-next-line no-console
      .then((res) => {
        if (res.error) {
          setFormText(res.error.message);
          // eslint-disable-next-line no-console
          console.log(res.error);
        } else {
          router.push('/signup-success');
        }
      });
    return;
  };

  if (!isLoading && user) {
    router.push('/puzzle/random');

    return null;
  }

  if (!isLoading && error) {
    return (
      <Layout>
        <Seo templateTitle='Login' />

        <main>
          <section className='bg-white'>
            <div className='layout flex min-h-screen flex-col items-center justify-center text-center'>
              <h1 className='mt-4'>Error: {error.message}</h1>
            </div>
          </section>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Seo templateTitle='Login' />

      <main>
        <section className='bg-white'>
          <div className='layout flex min-h-screen flex-col items-center justify-center text-center'>
            <FormProvider {...methods}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className='mt-2 space-y-3'
              >
                <Input
                  id='email'
                  label='Email'
                  validation={{ required: 'Email is required' }}
                  type='email'
                />
                <Input
                  id='password'
                  label='Password'
                  validation={{ required: 'Password is required' }}
                  type='password'
                />
                <Input
                  id='username'
                  label='Username'
                  validation={{ required: 'Username is required' }}
                  type='text'
                />
                <div className='flex w-full flex-wrap gap-4'>
                  <Button
                    type='submit'
                    className='flex flex-grow select-none justify-center'
                  >
                    Sign Up
                  </Button>
                  <ButtonLink
                    className='flex flex-grow select-none justify-center'
                    type='button'
                    href='/signup'
                    variant='outline'
                  >
                    Log In
                  </ButtonLink>
                </div>
              </form>
            </FormProvider>
            {formText !== '' ? (
              <div className='mt-2 max-w-sm text-red-500'>{formText}</div>
            ) : null}
          </div>
        </section>
      </main>
    </Layout>
  );
}
