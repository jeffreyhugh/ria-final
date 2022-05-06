import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs';
import { useUser } from '@supabase/supabase-auth-helpers/react';
import * as React from 'react';

import Button from '../buttons/Button';
import UnstyledLink from '../links/UnstyledLink';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isLoading, user } = useUser();

  // Put Header or Footer Here
  return (
    <>
      {!isLoading ? (
        <div className='absolute flex w-full items-center justify-center'>
          {user ? (
            <div className='flex flex-grow items-baseline justify-end gap-2 bg-gray-200 p-1 ring ring-gray-400'>
              <p>
                Hey, <strong>{user.user_metadata?.username}</strong>
              </p>
              <Button
                className='py-0 px-2'
                variant='ghost'
                onClick={() => supabaseClient.auth.signOut()}
              >
                Log Out
              </Button>
            </div>
          ) : (
            <div className='flex flex-grow items-baseline justify-center gap-2 bg-red-500 p-1 text-white ring ring-red-700'>
              <UnstyledLink href='/login'>
                <strong>
                  You are not logged in! Click here to log in and save your best
                  scores.
                </strong>
              </UnstyledLink>
            </div>
          )}
        </div>
      ) : null}
      {children}
    </>
  );
}
