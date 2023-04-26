# Odyssey-proativa

## Intial setup

First of all, you must perform these 4 steps so that it is possible to run the project on your machine:

- Create an `.env` file in the repository's base directory following the directions in the `.env-example` file.
- Create a empty `mock-role.txt` file in the repository's base directory.
- Change your `node` version to `18.12.0`.
  - [A good way to set your node version is using nvm.](https://www.treinaweb.com.br/blog/instalando-e-gerenciando-varias-versoes-do-node-js-com-nvm)
- Run the command `npm install`.

## Database setup

To configure your database, run these commands:

- ```bash
  docker compose up db
  ```

- ```bash
  docker compose start db
  ````

- ```bash
  npx prisma db push
  ```

- ```bash
  npx prisma db seed
  ```

## Running the project

If you've already done the initial configuration, just run the `npm run dev` command and see the platform running on `http://localhost:3000`. 

  - If you are going to use login functionality with google, set the environment variable NEXT_PUBLIC_MOCK_NEXT_AUTH to `false`.

## About the project stack

### Create T3 App

This is an app bootstrapped according to the [init.tips](https://init.tips) stack, also known as the T3-Stack.

#### What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with the most basic configuration and then move on to more advanced configuration.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next-Auth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [TailwindCSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

We also [roll our own docs](https://beta.create.t3.gg) with some summary information and links to the respective documentation.

Also checkout these awesome tutorials on `create-t3-app`.

- [Build a Blog With the T3 Stack - tRPC, TypeScript, Next.js, Prisma & Zod](https://www.youtube.com/watch?v=syEWlxVFUrY)
- [Build a Live Chat Application with the T3 Stack - TypeScript, Tailwind, tRPC](https://www.youtube.com/watch?v=dXRRY37MPuk)
- [Build a full stack app with create-t3-app](https://www.nexxel.dev/blog/ct3a-guestbook)
- [A first look at create-t3-app](https://dev.to/ajcwebdev/a-first-look-at-create-t3-app-1i8f)

#### How do I deploy this?

Follow our deployment guides for [Vercel](https://beta.create.t3.gg/en/deployment/vercel) and [Docker](https://beta.create.t3.gg/en/deployment/docker) for more information.
