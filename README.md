# Arrow Rush

A fast reaction game where you match the highlighted arrow before time runs out.

## Features

- 3 difficulty levels: Easy, Normal, and Hard
- Keyboard and touch-friendly controls for mobile and desktop
- Score, combo, timer, and lives system
- Game-over overlay with a local leaderboard
- Best score saved in local storage
- Sound effects using the browser audio API
- Animated target feedback and combo bursts

## How to play

- Open `index.html` in a browser or run a local web server.
- Choose a difficulty and player name.
- Press Play now.
- Match the arrow shown in the center using your keyboard or mouse/touch.
- Every correct hit adds points and extends your combo.
- Missing the target costs a life.
- The game ends when the timer reaches zero or lives run out.

## Run locally

```bash
cd arrow-game
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.
