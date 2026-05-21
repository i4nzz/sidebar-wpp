const COLS = 10;
const ROWS = 20;
let BLOCK = 20;

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const boardWrap = canvas.parentElement;

function resizeBoard() {
  const availW = boardWrap.clientWidth;
  const availH = boardWrap.clientHeight;
  if (availW <= 0 || availH <= 0) return;
  const byW = Math.floor(availW / COLS);
  const byH = Math.floor(availH / ROWS);
  BLOCK = Math.max(8, Math.min(byW, byH, 24));
  canvas.width = BLOCK * COLS;
  canvas.height = BLOCK * ROWS;
  draw();
}

window.addEventListener('resize', resizeBoard);
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');

const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayDesc = document.getElementById('overlay-desc');
const overlayBtn = document.getElementById('overlay-btn');

const PIECES = {
  I: { color: '#22d3ee', shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  O: { color: '#facc15', shape: [[1,1],[1,1]] },
  T: { color: '#a855f7', shape: [[0,1,0],[1,1,1],[0,0,0]] },
  S: { color: '#22c55e', shape: [[0,1,1],[1,1,0],[0,0,0]] },
  Z: { color: '#ef4444', shape: [[1,1,0],[0,1,1],[0,0,0]] },
  J: { color: '#3b82f6', shape: [[1,0,0],[1,1,1],[0,0,0]] },
  L: { color: '#f97316', shape: [[0,0,1],[1,1,1],[0,0,0]] }
};

let board = createBoard();
let current = null;
let next = null;
let score = 0;
let lines = 0;
let level = 1;
let dropInterval = 800;
let dropTimer = 0;
let lastTime = performance.now();
let state = 'menu';

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function randomPiece() {
  const keys = Object.keys(PIECES);
  const key = keys[Math.floor(Math.random() * keys.length)];
  const p = PIECES[key];
  return {
    type: key,
    color: p.color,
    shape: p.shape.map(r => [...r]),
    x: Math.floor((COLS - p.shape[0].length) / 2),
    y: 0
  };
}

function rotateMatrix(shape, dir) {
  const N = shape.length;
  const out = Array.from({ length: N }, () => Array(N).fill(0));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (dir > 0) out[c][N - 1 - r] = shape[r][c];
      else out[N - 1 - c][r] = shape[r][c];
    }
  }
  return out;
}

function collides(piece, ox = 0, oy = 0, shape = piece.shape) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const x = piece.x + c + ox;
      const y = piece.y + r + oy;
      if (x < 0 || x >= COLS || y >= ROWS) return true;
      if (y >= 0 && board[y][x]) return true;
    }
  }
  return false;
}

function merge(piece) {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const x = piece.x + c;
        const y = piece.y + r;
        if (y >= 0 && y < ROWS) board[y][x] = piece.color;
      }
    }
  }
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(cell => cell)) {
      board.splice(r, 1);
      board.unshift(Array(COLS).fill(null));
      cleared++;
      r++;
    }
  }
  if (cleared > 0) {
    const points = [0, 100, 300, 500, 800][cleared] * level;
    score += points;
    lines += cleared;
    const newLevel = Math.floor(lines / 10) + 1;
    if (newLevel !== level) {
      level = newLevel;
      dropInterval = Math.max(80, 800 - (level - 1) * 70);
    }
    updateHUD();
  }
}

function updateHUD() {
  scoreEl.textContent = score;
  linesEl.textContent = lines;
  levelEl.textContent = level;
}

function drawCell(ctx2, x, y, color, size) {
  ctx2.fillStyle = color;
  ctx2.fillRect(x, y, size, size);
  ctx2.fillStyle = 'rgba(255,255,255,.22)';
  ctx2.fillRect(x, y, size, 2);
  ctx2.fillRect(x, y, 2, size);
  ctx2.fillStyle = 'rgba(0,0,0,.28)';
  ctx2.fillRect(x, y + size - 2, size, 2);
  ctx2.fillRect(x + size - 2, y, 2, size);
}

function draw() {
  ctx.fillStyle = '#050807';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(189,147,249,.06)';
  ctx.lineWidth = 1;
  for (let i = 1; i < COLS; i++) {
    ctx.beginPath();
    ctx.moveTo(i * BLOCK + 0.5, 0);
    ctx.lineTo(i * BLOCK + 0.5, canvas.height);
    ctx.stroke();
  }
  for (let i = 1; i < ROWS; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * BLOCK + 0.5);
    ctx.lineTo(canvas.width, i * BLOCK + 0.5);
    ctx.stroke();
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c]) drawCell(ctx, c * BLOCK, r * BLOCK, board[r][c], BLOCK);
    }
  }

  if (current) {
    let gy = 0;
    while (!collides(current, 0, gy + 1)) gy++;
    ctx.globalAlpha = 0.18;
    for (let r = 0; r < current.shape.length; r++) {
      for (let c = 0; c < current.shape[r].length; c++) {
        if (current.shape[r][c]) {
          drawCell(ctx, (current.x + c) * BLOCK, (current.y + r + gy) * BLOCK, current.color, BLOCK);
        }
      }
    }
    ctx.globalAlpha = 1;

    for (let r = 0; r < current.shape.length; r++) {
      for (let c = 0; c < current.shape[r].length; c++) {
        if (current.shape[r][c]) {
          drawCell(ctx, (current.x + c) * BLOCK, (current.y + r) * BLOCK, current.color, BLOCK);
        }
      }
    }
  }

  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  if (next) {
    const size = 8;
    const shape = next.shape;
    let minR = shape.length, maxR = -1, minC = shape[0].length, maxC = -1;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (c < minC) minC = c;
          if (c > maxC) maxC = c;
        }
      }
    }
    const w = (maxC - minC + 1) * size;
    const h = (maxR - minR + 1) * size;
    const ox = (nextCanvas.width - w) / 2;
    const oy = (nextCanvas.height - h) / 2;
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (shape[r][c]) {
          drawCell(nextCtx, ox + (c - minC) * size, oy + (r - minR) * size, next.color, size);
        }
      }
    }
  }
}

function spawn() {
  current = next || randomPiece();
  next = randomPiece();
  if (collides(current)) gameOver();
}

function softDrop() {
  if (!current) return;
  if (collides(current, 0, 1)) {
    merge(current);
    clearLines();
    spawn();
  } else {
    current.y++;
  }
}

function hardDrop() {
  if (!current) return;
  let d = 0;
  while (!collides(current, 0, 1)) { current.y++; d++; }
  score += d * 2;
  merge(current);
  clearLines();
  spawn();
  updateHUD();
  dropTimer = 0;
}

function move(dx) {
  if (current && !collides(current, dx, 0)) current.x += dx;
}

function tryRotate(dir) {
  if (!current || current.type === 'O') return;
  const rotated = rotateMatrix(current.shape, dir);
  const kicks = [0, -1, 1, -2, 2];
  for (const k of kicks) {
    if (!collides(current, k, 0, rotated)) {
      current.x += k;
      current.shape = rotated;
      return;
    }
  }
}

function gameOver() {
  state = 'gameover';
  overlayTitle.textContent = 'Fim de Jogo';
  overlayDesc.innerHTML = `Pontuação final: <strong style="color:var(--tetris)">${score}</strong>`;
  overlayBtn.textContent = 'Jogar Novamente';
  overlay.classList.add('show');
}

function start() {
  board = createBoard();
  score = 0;
  lines = 0;
  level = 1;
  dropInterval = 800;
  dropTimer = 0;
  updateHUD();
  next = randomPiece();
  spawn();
  state = 'playing';
  overlay.classList.remove('show');
  lastTime = performance.now();
}

function togglePause() {
  if (state === 'playing') {
    state = 'paused';
    overlayTitle.textContent = 'Pausado';
    overlayDesc.textContent = 'Aperte P ou clique para continuar';
    overlayBtn.textContent = 'Continuar';
    overlay.classList.add('show');
  } else if (state === 'paused') {
    state = 'playing';
    overlay.classList.remove('show');
    lastTime = performance.now();
  }
}

function loop(time) {
  const dt = time - lastTime;
  lastTime = time;

  if (state === 'playing') {
    dropTimer += dt;
    if (dropTimer >= dropInterval) {
      softDrop();
      dropTimer = 0;
    }
  }

  draw();
  requestAnimationFrame(loop);
}

document.addEventListener('keydown', e => {
  if (state === 'menu' || state === 'gameover') {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      start();
    }
    return;
  }

  if (e.key === 'p' || e.key === 'P') {
    e.preventDefault();
    togglePause();
    return;
  }

  if (state !== 'playing') return;

  switch (e.key) {
    case 'ArrowLeft':  e.preventDefault(); move(-1); break;
    case 'ArrowRight': e.preventDefault(); move(1); break;
    case 'ArrowDown':
      e.preventDefault();
      softDrop();
      score += 1;
      updateHUD();
      dropTimer = 0;
      break;
    case 'ArrowUp':
    case 'x':
    case 'X':
      e.preventDefault();
      tryRotate(1);
      break;
    case 'z':
    case 'Z':
      e.preventDefault();
      tryRotate(-1);
      break;
    case ' ':
      e.preventDefault();
      hardDrop();
      break;
  }
});

overlayBtn.addEventListener('click', () => {
  if (state === 'paused') togglePause();
  else start();
  window.focus();
});

window.addEventListener('load', () => {
  resizeBoard();
  window.focus();
});

resizeBoard();
requestAnimationFrame(loop);
