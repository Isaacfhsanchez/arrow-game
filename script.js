const arrowMap = {
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
};

const arrowKeys = Object.keys(arrowMap);
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const streakEl = document.getElementById("streak");
const livesEl = document.getElementById("lives");
const stateEl = document.getElementById("status");
const targetEl = document.getElementById("target");
const startBtn = document.getElementById("start-btn");
const arrowButtons = [...document.querySelectorAll(".arrow-btn")];

let score = 0;
let timer = 60;
let streak = 0;
let lives = 3;
let currentArrow = "ArrowUp";
let gameRunning = false;
let countdownInterval = null;
let highScore = Number(localStorage.getItem("arrow-rush-high-score") || 0);

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
    score += 10 + streak * 2;
    streak += 1;
    flashTarget("good");
    setStatus("Nice! Keep the streak going.");
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("arrow-rush-high-score", String(highScore));
    }
  } else {
    streak = 0;
    lives -= 1;
    flashTarget("bad");
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
  score = 0;
  timer = 60;
  streak = 0;
  lives = 3;
  gameRunning = true;
  updateHud();
  setStatus("Match the arrows as fast as you can!");
  chooseNewArrow();

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
  setStatus(`Time's up! Final score: ${score}. Press start to play again.`);
  targetEl.textContent = "✦";
}

startBtn.addEventListener("click", startGame);

window.addEventListener("keydown", (event) => {
  if (!arrowKeys.includes(event.key)) {
    return;
  }

  event.preventDefault();
  handleAnswer(event.key);
});

arrowButtons.forEach((button) => {
  button.addEventListener("click", () => {
    handleAnswer(button.dataset.key);
  });
});

updateHud();
setStatus("Press start to begin.");
chooseNewArrow();
