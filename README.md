# CSC-401 Rich Internet Applications Final Project

## Introduction

Zach gave me the a-ok to rewrite the entire project with my preferred tech stack. I used an awesome starter template from [Theorodus Clarence](https://github.com/theodorusclarence/ts-nextjs-tailwind-starter), which includes the following technologies:

1. [TypeScript](https://www.typescriptlang.org/)
1. [Next.js](https://nextjs.org/) (a React framework)
1. [Tailwind CSS](https://tailwindcss.com/)

I only needed to add one thing:

1. [Supabase](https://supabase.com/) (for user management and a database)

This was my first real project in TypeScript.

## Requirements

- [x] A functional warehouse game where the player can push crates around the warehouse
- [ ] Keyboard controls do not work
- [x] Puzzles are seeded (seeding takes advantage of Next.js dynamic routing and `getServerSideProps`)
- [x] Users can register with email/password, and Supabase takes care of confirming email, updating conflicting records, etc.
- [x] Users can login, and Supabase takes care of updating their session
- [x] Users can restart the current puzzle, start a new random puzzle, and view the puzzle list of all completed puzzles and high scores

## Bonus

- [x] Users can name puzzles after they complete them
- [x] New best scores are added to the database with AJAX and displayed on the high scores page
- [x] New best scores are validated server-side, not client-side
- [x] Each puzzle page uses `getServerSideProps` to fetch the current high score and score holder
- [x] No images or `<canvas>` tags are used

## TODOs

- [ ] Figure out the issue with the keyboard controls (I suspect it has something to do with `useState`)
- [ ] Refactor the puzzle page code so it is easier to read and understand
- [ ] Add a small preview of each puzzle on the puzzle list page
- [ ] Remove the explicit `any` when dealing with form submissions
