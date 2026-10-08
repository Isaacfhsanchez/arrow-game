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
const comboBurstEl = document.getElementById("combo-burst");
const startBtn = document.getElementById("start-btn");
const overlayStartBtn = document.getElementById("overlay-start-btn");
const restartBtn = document.getElementById("restart-btn");
const startOverlay = document.getElementById("start-overlay");
const gameOverOverlay = document.getElementById("game-over-overlay");
const finalScoreText = document.getElementById("final-score-text");
const bestScoreText = document.getElementById("best-score-text");
const leaderboardEl = document.getElementById("leaderboard");
const playerNameInput = document.getElementById("player-name");
const difficultyButtons = [...document.querySelectorAll(".difficulty-btn")];
const arrowButtons = [...document.querySelectorAll(".arrow-btn")];

const leaderboardKey = "arrow-rush-leaderboard-v1";
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
  const AudioConstructor = window.AudioContext || window.webkitAudioContext;
  if (!audioCtx && AudioConstructor) {
    audioCtx = new AudioConstructor();
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

function showComboBurst(amount) {
  comboBurstEl.textContent = `+${amount}`;
  comboBurstEl.classList.add("visible");
  clearTimeout(showComboBurst.timerId);
  showComboBurst.timerId = setTimeout(() => {
    comboBurstEl.classList.remove("visible");
  }, 260);
}

function setDifficulty(difficulty) {
  activeDifficulty = difficulty;
  difficultyButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.difficulty === difficulty);
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

function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(leaderboardKey)) || [];
  } catch {
    return [];
  }
}

function renderLeaderboard() {
  const leaderboard = getLeaderboard();
  leaderboardEl.innerHTML = "";

  if (!leaderboard.length) {
    leaderboardEl.innerHTML = "<li><span>Empty</span><span>0</span></li>";
    return;
  }

  leaderboard.slice(0, 5).forEach((entry) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${entry.name}</span><span>${entry.score}</span>`;
    leaderboardEl.appendChild(li);
  });
}

function saveScoreToLeaderboard(finalScore) {
  const name = (playerNameInput.value || "Player").trim().slice(0, 12) || "Player";
  const leaderboard = getLeaderboard();
  leaderboard.push({ name, score: finalScore });
  leaderboard.sort((a, b) => b.score - a.score);
  const trimmed = leaderboard.slice(0, 5);
  localStorage.setItem(leaderboardKey, JSON.stringify(trimmed));
  renderLeaderboard();
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
    showComboBurst(streak);
    setStatus(`Nice! Combo x${streak}.`);

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("arrow-rush-high-score", String(highScore));
    }
  } else {
    streak = 0;
    lives -= 1;
    flashTarget("bad");
    playTone(220, "sawtooth", 0.13, 0.05);
    setStatus(`Wrong key! Looking for ${arrowMap[currentArrow]}.`);

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
  comboBurstEl.classList.remove("visible");
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
  saveScoreToLeaderboard(score);
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
renderLeaderboard();
updateHud();
setStatus("Choose a difficulty and begin.");
chooseNewArrow();
bestScoreText.textContent = `Best score: ${highScore}`;
