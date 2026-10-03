# Hopper Snake v1

Snake in the browser, the first version of a series built one version at a time. Each version is planned as a short
list of features with acceptance criteria, built, checked by an independent reviewer, and shipped at its own link.
Each version lives in its own repository, starting from the previous version's code.

| Version | What it adds | Code | Play |
| --- | --- | --- | --- |
| **v1** | The classic game: a 20 x 20 board, food, growing, speeding up, walls, and a best score kept in your browser | [hopper-snake-v1](https://github.com/hopperlabs-ai-opensource/hopper-snake-v1) | https://hopper-snake-v1.vercel.app |
| v2 | A personal leaderboard: your top 10 runs with your name, kept in your browser | [hopper-snake-v2](https://github.com/hopperlabs-ai-opensource/hopper-snake-v2) | https://hopper-snake-v2.vercel.app |
| v3 | Speed levels and obstacles | [hopper-snake-v3](https://github.com/hopperlabs-ai-opensource/hopper-snake-v3) | https://hopper-snake-v3.vercel.app |
| v4 | Power-ups, themes and a shareable replay link | [hopper-snake-v4](https://github.com/hopperlabs-ai-opensource/hopper-snake-v4) | https://hopper-snake-v4.vercel.app |

## Play

Arrow keys or WASD steer. Swipe on a phone, or use the on-screen pad. Space pauses and starts again.

## Run it yourself

Plain HTML, CSS and JavaScript, with no build step and no dependencies. Open `index.html`, or serve the folder:

```sh
python3 -m http.server 8000
```

## Tests

The tests run the real `game.js` against a small stand-in for the browser, with Node's built-in test runner (Node 20
or later, nothing to install):

```sh
node --test
```

They cover the starting position, movement, no reversing, eating and growing, the speed-up, walls, the best score
kept in the browser, pause, and every way to steer.

## License

MIT. See [LICENSE](LICENSE).
