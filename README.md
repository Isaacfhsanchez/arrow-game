# Arrow Rush

A fast reaction game where you match the highlighted arrow before time runs out.

## Features

- 3 difficulty levels: Easy, Normal, and Hard
- Keyboard and on-screen arrow controls
- Score, streak, timer, and lives system
- Game-over and replay flow
- Best score saved in local storage
- Sound effects using the browser audio API

## How to play

- Open `index.html` in a browser, or run a local web server.
- Choose a difficulty.
- Press Play now.
- Match the arrow shown in the center using your keyboard or mouse.
- Every correct hit adds points and extends your streak.
- Missing the target costs a life.
- The game ends when the timer reaches zero or lives run out.

## Run locally

```bash
cd arrow-game
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.
