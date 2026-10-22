window.addEventListener('DOMContentLoaded', () => {
  const startScreen = document.getElementById('start-screen');
  const startBtn = document.getElementById('start-btn');
  const countdown = document.getElementById('countdown');
  const countNum = document.getElementById('count-num');
  const gameArea = document.getElementById('game-area');
  const scoreDisplay = document.getElementById('score-display');
  const timerDisplay = document.getElementById('timer-display');
  const gameTitle = document.getElementById('game-title');
  const subtitle = document.getElementById('game-subtitle');
  const result = document.getElementById('result');
  const bestScoreEl = document.getElementById('best-score');

  let score = 0, timeLeft = 30, countdownInterval, prepTimer, playing = false;
  let best = 0;
  try { best = parseInt(localStorage.getItem('banlab-best'), 10) || 0; } catch (e) {}
  bestScoreEl.textContent = best;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx();

  function beep(freq, dur, vol) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, audioCtx.currentTime);
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  }

  function playShotSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(600, audioCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.08);
    g.gain.setValueAtTime(0.3, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + 0.08);
  }

  function showCount(text, isGo) {
    countNum.textContent = text;
    countNum.classList.toggle('go', !!isGo);
    countdown.classList.remove('tick');
    void countdown.offsetWidth; // reinicia a animação
    countdown.classList.add('tick');
    beep(isGo ? 880 : 520, isGo ? 0.25 : 0.12, 0.2);
  }

  function beginCountdown() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    startScreen.classList.add('hidden');
    gameArea.classList.add('hidden');
    gameArea.innerHTML = '';
    scoreDisplay.textContent = 'Pontos: 0';
    timerDisplay.textContent = 'Tempo: 30s';
    countdown.classList.remove('hidden');

    let n = 3;
    showCount(n);
    clearInterval(prepTimer);
    prepTimer = setInterval(() => {
      n--;
      if (n > 0) {
        showCount(n);
      } else {
        clearInterval(prepTimer);
        showCount('JÁ!', true);
        setTimeout(() => { countdown.classList.add('hidden'); startGame(); }, 450);
      }
    }, 1000);
  }

  function startGame() {
    score = 0; timeLeft = 30; playing = true;
    scoreDisplay.textContent = `Pontos: ${score}`;
    timerDisplay.textContent = `Tempo: ${timeLeft}s`;
    gameArea.classList.remove('hidden');
    for (let i = 0; i < 3; i++) spawnTarget();

    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = `Tempo: ${timeLeft}s`;
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  startBtn.addEventListener('click', beginCountdown);

  function spawnTarget() {
    if (!playing) return;
    const target = document.createElement('div');
    target.classList.add('target');
    target.style.left = `${Math.floor(Math.random() * 700) + 50}px`;
    target.style.top = `${Math.floor(Math.random() * 440) + 110}px`;
    target.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      playShotSound();
      score += 100;
      scoreDisplay.textContent = `Pontos: ${score}`;
      target.remove();
      spawnTarget();
    });
    gameArea.appendChild(target);
  }

  gameArea.addEventListener('mousedown', () => {
    if (!playing) return;
    score = Math.max(0, score - 50);
    scoreDisplay.textContent = `Pontos: ${score}`;
  });

  function endGame() {
    playing = false;
    clearInterval(countdownInterval);
    gameArea.classList.add('hidden');
    gameArea.innerHTML = '';
    const record = score > best;
    if (record) {
      best = score;
      try { localStorage.setItem('banlab-best', String(best)); } catch (e) {}
    }
    bestScoreEl.textContent = best;
    gameTitle.textContent = 'Fim de jogo';
    subtitle.textContent = 'Treine de novo e supere sua marca';
    result.textContent = record ? `Novo recorde: ${score} pontos` : `Você fez ${score} pontos`;
    result.classList.remove('hidden');
    startBtn.textContent = 'Treinar novamente';
    startScreen.classList.remove('hidden');
  }
});