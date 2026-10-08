const arrowMap = {
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
};

const difficultySettings = {
  easy: { time: 75, lives: 4, scoreBoost: 1 },
  normal: { time: 60, lives: 3, scoreBoost: 1.35 },
  hard: { time: 45, lives: 2, scoreBoost: 1.8 },
};

const arrowKeys = Object.keys(arrowMap);
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const streakEl = document.getElementById("streak");
const livesEl = document.getElementById("lives");
const stateEl = document.getElementById("status");
const targetEl = document.getElementById("target");
const startBtn = document.getElementById("start-btn");
const overlayStartBtn = document.getElementById("overlay-start-btn");
const restartBtn = document.getElementById("restart-btn");
const startOverlay = document.getElementById("start-overlay");
const gameOverOverlay = document.getElementById("game-over-overlay");
const finalScoreText = document.getElementById("final-score-text");
const bestScoreText = document.getElementById("best-score-text");
const difficultyButtons = [...document.querySelectorAll(".difficulty-btn")];
const arrowButtons = [...document.querySelectorAll(".arrow-btn")];

let score = 0;
let timer = 60;
let streak = 0;
let lives = 3;
let currentArrow = "ArrowUp";
let gameRunning = false;
let countdownInterval = null;
let activeDifficulty = "normal";
let highScore = Number(localStorage.getItem("arrow-rush-high-score") || 0);
let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) {
    const AudioConstructor = window.AudioContext || window.webkitAudioContext;
    if (AudioConstructor) {
      audioCtx = new AudioConstructor();
    }
  }
}

function playTone(frequency, type = "triangle", duration = 0.12, volume = 0.05) {
  if (!audioCtx) {
    return;
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.value = volume;

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
  oscillator.stop(audioCtx.currentTime + duration);
}

function setDifficulty(difficulty) {
  activeDifficulty = difficulty;
  difficultyButtons.forEach((button) => {
    const isActive = button.dataset.difficulty === difficulty;
    button.classList.toggle("active", isActive);
  });
}

function updateHud() {
  scoreEl.textContent = score;
  timeEl.textContent = Math.max(0, Math.ceil(timer));
  streakEl.textContent = streak;
  livesEl.textContent = lives;
}

function setStatus(text) {
  stateEl.textContent = text;
}

function flashTarget(type) {
  targetEl.classList.remove("flash-good", "flash-bad");
  void targetEl.offsetWidth;
  targetEl.classList.add(type === "good" ? "flash-good" : "flash-bad");
  setTimeout(() => targetEl.classList.remove("flash-good", "flash-bad"), 180);
}

function chooseNewArrow() {
  const next = arrowKeys[Math.floor(Math.random() * arrowKeys.length)];
  currentArrow = next;
  targetEl.textContent = arrowMap[next];
}

function handleAnswer(key) {
  if (!gameRunning) {
    return;
  }

  const button = document.querySelector(`.arrow-btn[data-key="${key}"]`);
  if (button) {
    button.classList.add("pressed");
    setTimeout(() => button.classList.remove("pressed"), 150);
  }

  if (key === currentArrow) {
    const points = Math.round((10 + streak * 2) * difficultySettings[activeDifficulty].scoreBoost);
    score += points;
    streak += 1;
    flashTarget("good");
    playTone(660, "triangle", 0.08, 0.04);
    setStatus("Nice! Keep the streak alive.");

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("arrow-rush-high-score", String(highScore));
    }
  } else {
    streak = 0;
    lives -= 1;
    flashTarget("bad");
    playTone(220, "sawtooth", 0.11, 0.05);
    setStatus(`Wrong key! You were looking for ${arrowMap[currentArrow]}.`);

    if (lives <= 0) {
      endGame();
      return;
    }
  }

  updateHud();
  chooseNewArrow();
}

function startGame() {
  const config = difficultySettings[activeDifficulty];
  score = 0;
  timer = config.time;
  streak = 0;
  lives = config.lives;
  gameRunning = true;
  updateHud();
  setStatus(`Difficulty: ${activeDifficulty.toUpperCase()}. Match the arrows!`);
  chooseNewArrow();
  startOverlay.classList.remove("visible");
  gameOverOverlay.classList.remove("visible");

  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  countdownInterval = setInterval(() => {
    timer -= 1;
    updateHud();

    if (timer <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameRunning = false;
  clearInterval(countdownInterval);
  countdownInterval = null;
  localStorage.setItem("arrow-rush-high-score", String(highScore));
  finalScoreText.textContent = `Final score: ${score}`;
  bestScoreText.textContent = `Best score: ${highScore}`;
  gameOverOverlay.classList.add("visible");
  setStatus("Time's up! Press play again.");
  targetEl.textContent = "✦";
}

startBtn.addEventListener("click", () => {
  startOverlay.classList.add("visible");
});

overlayStartBtn.addEventListener("click", () => {
  ensureAudio();
  startGame();
});

restartBtn.addEventListener("click", () => {
  ensureAudio();
  startGame();
});

difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => setDifficulty(button.dataset.difficulty));
});

window.addEventListener("keydown", (event) => {
  if (!arrowKeys.includes(event.key)) {
    return;
  }

  event.preventDefault();
  ensureAudio();
  handleAnswer(event.key);
});

arrowButtons.forEach((button) => {
  button.addEventListener("click", () => {
    ensureAudio();
    handleAnswer(button.dataset.key);
  });
});

setDifficulty(activeDifficulty);
updateHud();
setStatus("Choose a difficulty and begin.");
chooseNewArrow();
bestScoreText.textContent = `Best score: ${highScore}`;
