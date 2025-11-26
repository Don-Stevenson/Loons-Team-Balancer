## Getting Started

Install

```bash
npm i
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You will require a`.env` at root level:

- see .env.example

to generate the JWT_SECRET use:

```
node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
```

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

### Testing:

#####

`npm run test`

### Deployment:

https://create-teams.vercel.app/

### About Loons Team Balancer

Loons Team Balancer is a Next.js-based solution designed to create
fair and well-balanced soccer teams each week. The app takes into
account player skills, gender, and other attributes to ensure a fun
and competitive experience for everyone. It is ideal for recurring
games with a mix of players of different abilities and positions,
making it easy to shuffle teams fairly every time.

At the core of the app is a team balancing algorithm. It evaluates the
players available each week based on their game knowledge, goal
scoring, attack, midfield, defense, and mobility/stamina abilities.
Players are sorted primarily by gender and then by overall score.
Using a modified serpentine draft method, the algorithm distributes
players across teams while keeping the overall skill levels balanced.
It even introduces slight randomness to ensure that teams vary week to
week.

Simply select who's playing and choose how many teams you'd like to
create. If you're not quite happy with the results, you can click
`create teams` again to re-generate the teams and or manually drag and drop players. When you're happy with the teams, you can print the teams in the default, printer friendly format.
