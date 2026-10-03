// Snake: a 20 x 20 grid, one step per tick, faster as the score grows. Keyboard, swipe and on-screen pad.
(() => {
  "use strict";
  const SIZE = 20, START_MS = 140, MIN_MS = 60, SPEED_UP_MS = 4;
  const canvas = document.getElementById("board"), ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score"), bestEl = document.getElementById("best");
  const overlay = document.getElementById("overlay"), overlayTitle = document.getElementById("overlay-title"), overlayHint = document.getElementById("overlay-hint");
  const startButton = document.getElementById("start");
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const KEYS = { ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down", ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right" };
  const readBest = () => { try { return Number(localStorage.getItem("snake-best")) || 0; } catch { return 0; } };
  const saveBest = (value) => { try { localStorage.setItem("snake-best", String(value)); } catch { /* private mode: best score lasts this visit */ } };

  let snake, dir, queued, food, score, best = readBest(), timer = null, running = false, paused = false;
  bestEl.textContent = best;

  function reset() {
    const mid = Math.floor(SIZE / 2);
    snake = [[mid, mid], [mid - 1, mid], [mid - 2, mid]];
    dir = "right"; queued = []; score = 0; scoreEl.textContent = 0;
    placeFood(); draw();
  }

  function placeFood() {
    const taken = new Set(snake.map(([x, y]) => x + "," + y)), free = [];
    for (let x = 0; x < SIZE; x++) for (let y = 0; y < SIZE; y++) if (!taken.has(x + "," + y)) free.push([x, y]);
    food = free[Math.floor(Math.random() * free.length)];
  }

  function turn(next) {
    const last = queued.length ? queued[queued.length - 1] : dir;
    const [dx, dy] = DIRS[next], [lx, ly] = DIRS[last];
    if (dx === -lx && dy === -ly) return; // no reversing into yourself
    if (next !== last && queued.length < 3) queued.push(next);
  }

  function tick() {
    if (queued.length) dir = queued.shift();
    const [dx, dy] = DIRS[dir], [hx, hy] = snake[0], head = [hx + dx, hy + dy];
    const grows = food && head[0] === food[0] && head[1] === food[1];
    const body = grows ? snake : snake.slice(0, -1);
    if (head[0] < 0 || head[1] < 0 || head[0] >= SIZE || head[1] >= SIZE || body.some(([x, y]) => x === head[0] && y === head[1])) return gameOver();
    snake = [head, ...body];
    if (grows) {
      score += 1; scoreEl.textContent = score;
      if (score > best) { best = score; bestEl.textContent = best; saveBest(best); }
      if (snake.length === SIZE * SIZE) return gameOver(true);
      placeFood(); schedule();
    }
    draw();
  }

  function schedule() {
    clearInterval(timer);
    timer = setInterval(tick, Math.max(MIN_MS, START_MS - score * SPEED_UP_MS));
  }

  function start() {
    reset(); running = true; paused = false; overlay.hidden = true; schedule();
  }

  function gameOver(won = false) {
    clearInterval(timer); running = false; draw();
    overlayTitle.textContent = won ? "You filled the board" : "Game over";
    overlayHint.textContent = `Score ${score} · Best ${best}`;
    startButton.textContent = "Play again"; overlay.hidden = false; startButton.focus();
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    if (paused) { clearInterval(timer); overlayTitle.textContent = "Paused"; overlayHint.textContent = "Press space to continue"; startButton.textContent = "Resume"; overlay.hidden = false; }
    else { overlay.hidden = true; schedule(); }
  }

  function draw() {
    const cell = canvas.width / SIZE;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--panel");
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1c2a38";
    for (let x = 0; x < SIZE; x++) for (let y = 0; y < SIZE; y++) if ((x + y) % 2 === 0) ctx.fillRect(x * cell, y * cell, cell, cell);
    if (food) {
      ctx.fillStyle = "#ff5d73";
      ctx.beginPath(); ctx.arc(food[0] * cell + cell / 2, food[1] * cell + cell / 2, cell * 0.36, 0, Math.PI * 2); ctx.fill();
    }
    snake.forEach(([x, y], i) => {
      ctx.fillStyle = i === 0 ? "#9ef0b9" : "#3fd17a";
      const pad = i === 0 ? 1 : 2;
      ctx.beginPath(); ctx.roundRect(x * cell + pad, y * cell + pad, cell - pad * 2, cell - pad * 2, cell * 0.25); ctx.fill();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.code === "Space") { event.preventDefault(); if (running) togglePause(); else start(); return; }
    const next = KEYS[event.code];
    if (!next) return;
    event.preventDefault();
    if (!running) start();
    if (!paused) turn(next);
  });

  let touch = null;
  canvas.addEventListener("pointerdown", (event) => { touch = [event.clientX, event.clientY]; });
  canvas.addEventListener("pointerup", (event) => {
    if (!touch) return;
    const dx = event.clientX - touch[0], dy = event.clientY - touch[1]; touch = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (!running) start();
    turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
  });
  document.querySelectorAll(".pad button").forEach((button) => button.addEventListener("click", () => { if (!running) start(); turn(button.dataset.dir); }));
  startButton.addEventListener("click", () => { if (paused) togglePause(); else start(); });

  reset();
  window.snake = { state: () => ({ running, paused, score, best, length: snake.length, head: snake[0], food, dir }), tick, turn, start };
})();
