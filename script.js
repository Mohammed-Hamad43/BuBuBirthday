// Blow out by click or by microphone input

const candles = document.querySelectorAll('.candle');
let flames = [];

// Store references to all flames
candles.forEach(candle => {
  const flame = candle.querySelector('.flame');
  if (flame) flames.push(flame);

  candle.addEventListener('click', () => blowOut(flame));
});

// Function to fade out a flame
function blowOut(flame) {
  if (!flame) return;
  flame.style.transition = 'opacity 0.6s ease';
  flame.style.opacity = '0';
  setTimeout(() => flame.remove(), 600);
}

// === Microphone-based detection ===
async function startMic() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);

    let lastBlowTime = 0;

    function detectBlow() {
      analyser.getByteFrequencyData(dataArray);
      const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

      const now = Date.now();
      // Blow detection: sudden rise in average volume
      if (volume > 80 && now - lastBlowTime > 2000) {
        flames.forEach(flame => blowOut(flame));
        lastBlowTime = now;
      }
      requestAnimationFrame(detectBlow);
    }

    detectBlow();
  } catch (err) {
    console.warn("Microphone access denied or unavailable:", err);
  }
}

startMic();
