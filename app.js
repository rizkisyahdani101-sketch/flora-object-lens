/**
 * Flora & Object Lens
 * Web camera-based plant & object detection using TensorFlow.js
 */

// ====== State ======
const state = {
  video: null,
  stream: null,
  isLive: false,
  isDetecting: false,
  captureCount: 0,
  gallery: [],
  currentDetection: null,
  sensitivity: 5,
  showSpecs: true,
  voiceEnabled: false,
  theme: 'forest',
  apiBase: 'http://localhost:3000/api/gallery',
};

// ====== DOM refs ======
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const video = $('#video');
const cameraView = $('#cameraView');
const placeholder = $('#placeholder');
const btnStart = $('#btnStart');
const btnCapture = $('#btnCapture');
const btnClear = $('#btnClear');
const btnGallery = $('#btnGallery');
const resultCard = $('#resultCard');
const detectionStatus = $('#detectionStatus');
const detailName = $('#detailName');
const detailType = $('#detailType');
const detailClass = $('#detailClass');
const detailConfidence = $('#detailConfidence');
const resultImage = $('#resultImage');
const resultTags = $('#resultTags');
const galleryGrid = $('#galleryGrid');
const galleryCount = $('#galleryCount');
const gallery = $('#gallery');
const btnFavourite = $('#btnFavourite');
const scanLine = $('#scanLine');

// Settings
const settingsModal = $('#settingsModal');
const btnSettings = $('#btnSettings');
const modalClose = $('#modalClose');
const modalCancel = $('#modalCancel');
const modalSave = $('#modalSave');
const themeSelect = $('#themeSelect');
const voiceSelect = $('#voiceSelect');
const sensitivityRange = $('#sensitivityRange');
const showSpecs = $('#showSpecs');
const logLevel = $('#logLevel');

// Toast
const toast = $('#toast');

// ====== Logging ======
const logLevels = { debug: 0, info: 1, warn: 2 };
let currentLogLevel = logLevels.info;

function log(level, msg) {
  if (level === 'debug') return;
  if (level === 'info' && currentLogLevel < logLevels.info) return;
  if (level === 'warn' && currentLogLevel < logLevels.warn) return;
  console.log(`[${level.toUpperCase()}] ${msg}`);
}

// ====== Theme System ======
const themes = {
  forest: {
    '--bg': '#0f1119',
    '--bg-card': '#1a1d2e',
    '--bg-elevated': '#242838',
    '--border': '#2e3448',
    '--accent': '#6366f1',
    '--success': '#34d399',
  },
  ocean: {
    '--bg': '#0a1628',
    '--bg-card': '#12203a',
    '--bg-elevated': '#1a2d4a',
    '--border': '#2a4a6a',
    '--accent': '#3b82f6',
    '--success': '#34d399',
  },
  sunset: {
    '--bg': '#1a0a1a',
    '--bg-card': '#2a1424',
    '--bg-elevated': '#3a1e2e',
    '--border': '#6a3a4a',
    '--accent': '#e87171',
    '--success': '#fbbf24',
  },
  minimal: {
    '--bg': '#f5f5f7',
    '--bg-card': '#ffffff',
    '--bg-elevated': '#f0f0f5',
    '--border': '#e0e0e5',
    '--accent': '#6366f1',
    '--success': '#34d399',
    '--text': '#1a1a2e',
    '--text-muted': '#8b8b9a',
    '--text-bright': '#1a1a2e',
  },
};

function applyTheme(name) {
  const tokens = themes[name] || themes.forest;
  Object.assign(document.documentElement.style, tokens);
  state.theme = name;
}

// ====== Toast ======
function showToast(msg, duration = 3000) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ====== Camera ======
async function startCamera() {
  log('info', 'Memulai kamera...');
  try {
    state.stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = state.stream;
    video.style.display = 'block';
    placeholder.style.display = 'none';
    btnStart.textContent = '⏹️ Hentikan';
    state.isLive = true;
    state.captureCount = 0;
    updateCameraStatus('🟢 Kamera aktif');
    log('info', 'Kamera aktif');
    btnCapture.disabled = false;
    btnClear.disabled = false;
  } catch (err) {
    log('warn', `Gagal akses kamera: ${err.message}`);
    showToast('Tidak bisa akses kamera. Pastikan kamera tidak dipakai aplikasi lain.');
    updateCameraStatus('🔴 Tidak ada kamera');
  }
}

function stopCamera() {
  if (state.stream) {
    state.stream.getTracks().forEach(t => t.stop());
    state.stream = null;
  }
  video.style.display = 'none';
  placeholder.style.display = 'flex';
  btnStart.textContent = '▶️ Mulai Kamera';
  state.isLive = false;
  updateCameraStatus('⏳ Menunggu kamera');
  btnCapture.disabled = true;
  btnClear.disabled = true;
}

// ====== Capture ======
function captureFrame() {
  if (!state.isLive) return;
  state.captureCount++;
  const imgUrl = video.toDataURL('image/jpeg', 0.85);
  const filename = `capture_${String(state.captureCount).padStart(4, '0')}.jpg`;

  // Show result
  resultImage.innerHTML = `<img src="${imgUrl}" alt="Hasil" />`;
  resultImage.querySelector('img').style.display = 'block';

  detectionStatus.textContent = `📸 Ambil ${state.captureCount} → Mendeteksi...`;
  resultCard.style.display = 'block';

  // Auto-detect after short delay
  setTimeout(() => {
    detectObject(imgUrl, filename);
  }, 800);
}

// ====== Detection ======
let mobilenet = null;

async function loadModel() {
  if (mobilenet) return mobenet;
  log('info', 'Memuat model MobileNet...');
  mobilenet = await mobilenet.load();
  log('info', 'Model siap!');
  return mobilenet;
}

async function detectObject(imageData, filename) {
  if (state.isDetecting) return;
  state.isDetecting = true;
  detectionStatus.textContent = '🔍 Menganalisis...';

  try {
    const model = await loadModel();
    const img = document.createElement('img');
    img.src = imageData;
    await new Promise((resolve) => { img.onload = resolve; });

    const { easiest = 3 } = { easiest: state.sensitivity };
    const predictions = await model.classify(img, 5);

    // Sort by confidence
    predictions.sort((a, b) => b.confidence - a.confidence);

    const top = predictions[0];
    const name = top.className.replace(' ', ' ').trim();
    const confidence = (top.confidence * 100).toFixed(1);

    displayResult(name, 'Objek / Tumbuhan', 'Umum', confidence, imageData, filename);
    playVoice(name, confidence);

    showToast(`Ditemukan: ${name} (${confidence}%)`);
    log('info', `Deteksi: ${name} (${confidence}%)`);

  } catch (err) {
    log('warn', `Deteksi gagal: ${err.message}`);
    detectionStatus.textContent = '❌ Gagal mendeteksi';
    showToast('Gagal mendeteksi. Coba lagi.');
  } finally {
    state.isDetecting = false;
  }
}

// ====== Display ======
function displayResult(name, type, cls, confidence, imageData, filename) {
  state.currentDetection = { name, type, cls, confidence, imageData, filename };

  // Result image
  resultImage.innerHTML = `<img src="${imageData}" alt="${name}" />`;
  resultImage.querySelector('img').style.display = 'block';

  // Details
  detailName.textContent = name;
  detailType.textContent = type;
  detailClass.textContent = cls;
  detailConfidence.textContent = `${confidence}%`;

  // Status
  detectionStatus.textContent = '✅ Tersimpan';
  detectionStatus.classList.add('loaded');

  // Tags
  resultTags.innerHTML = '';
  const tags = [];
  if (name.toLowerCase().includes('daun') || name.toLowerCase().includes('tumbuh')) tags.push({ text: 'Tumbuhan', cls: 'tag-plant' });
  if (name.toLowerCase().includes('buah') || name.toLowerCase().includes('ananas') || name.toLowerCase().includes('apel')) tags.push({ text: 'Buah', cls: 'tag-fruit' });
  if (tags.length === 0) tags.push({ text: 'Objek', cls: 'tag-object' });

  tags.forEach(t => {
    const el = document.createElement('span');
    el.className = `tag ${t.cls}`;
    el.textContent = t.text;
    resultTags.appendChild(el);
  });

  // Favourite
  btnFavourite.disabled = false;

  // Save to gallery (backend)
  saveToGallery(name, type, cls, confidence, imageData, filename);
}

// ====== API Helpers ======
async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!response.ok) {
      const err = new Error(`HTTP ${response.status}`);
      err.response = response;
      throw err;
    }
    return await response.json();
  } catch (err) {
    log('warn', `API error ${url}: ${err.message}`);
    throw err;
  }
}

async function saveToGallery(name, type, cls, confidence, imageData, filename) {
  try {
    const response = await apiFetch(state.apiBase, {
      method: 'POST',
      body: JSON.stringify({
        name,
        type,
        cls,
        confidence: parseFloat(confidence),
        imageData,
        timestamp: new Date().toLocaleString('id-ID'),
      }),
    });
    log('info', `Data disimpan ke backend: ${response.id}`);
  } catch (err) {
    log('warn', `Gagal simpan ke backend: ${err.message}`);
    showToast('Gagal simpan ke server, tapi masih tersimpan di browser');
  }
}

async function loadGallery() {
  try {
    const items = await apiFetch(state.apiBase);
    state.gallery = items;
    renderGallery();
    log('info', `Galeri dimuat: ${items.length} item`);
  } catch (err) {
    log('warn', `Gagal muat galeri: ${err.message}`);
    state.gallery = [];
    renderGallery();
  }
}

async function deleteFromGallery(id) {
  try {
    await apiFetch(`${state.apiBase}/${id}`, { method: 'DELETE' });
    state.gallery = state.gallery.filter(g => g.id !== id);
    renderGallery();
    showToast('🗑️ Dihapus');
  } catch (err) {
    log('warn', `Gagal hapus: ${err.message}`);
    showToast('Gagal menghapus');
  }
}

async function toggleFavourite(id) {
  try {
    const item = state.gallery.find(g => g.id === id);
    if (!item) return;

    const newFavourite = !item.favourite;
    const updated = await apiFetch(`${state.apiBase}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ favourite: newFavourite }),
    });

    const idx = state.gallery.findIndex(g => g.id === id);
    if (idx !== -1) {
      state.gallery[idx].favourite = newFavourite;
      renderGallery();
    }

    showToast(newFavourite ? '⭐ Ditandai favorit!' : '⭐ Dihapus dari favorit');
  } catch (err) {
    log('warn', `Gagal update favourit: ${err.message}`);
    showToast('Gagal update');
  }
}

// ====== Voice (TTS) ======
function playVoice(text, confidence) {
  if (!state.voiceEnabled) return;
  const utterance = new SpeechSynthesisUtterance();
  utterance.text = `${text}, tingkat kepercayaan ${confidence} persen.`;
  utterance.lang = 'id-ID';
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

// ====== Tabs ======
$$('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const tabName = tab.dataset.tab;
    if (tabName === 'plants') {
      // Plants tab logic
      showToast('🌱 Mode Tumbuhan');
    } else if (tabName === 'objects') {
      showToast('📦 Mode Benda');
    } else if (tabName === 'fruits') {
      showToast('🍎 Mode Buah');
    }
  });
});

// ====== Gallery toggle ======
btnGallery.addEventListener('click', () => {
  gallery.classList.toggle('active');
  if (gallery.classList.contains('active')) {
    loadGallery();
  }
});

// ====== Settings ======
btnSettings.addEventListener('click', () => {
  settingsModal.classList.add('active');
  sensitivityRange.value = state.sensitivity;
  showSpecs.checked = state.showSpecs;
  voiceSelect.value = state.voiceEnabled ? 'en-US' : 'none';
  themeSelect.value = state.theme;
});

modalClose.addEventListener('click', () => {
  settingsModal.classList.remove('active');
});

modalCancel.addEventListener('click', () => {
  settingsModal.classList.remove('active');
});

modalSave.addEventListener('click', () => {
  state.sensitivity = parseInt(sensitivityRange.value);
  state.showSpecs = showSpecs.checked;
  state.voiceEnabled = voiceSelect.value !== 'none';
  state.theme = themeSelect.value;

  applyTheme(state.theme);
  log('info', `Pengaturan disimpan: theme=${state.theme}, sensitivity=${state.sensitivity}`);

  showToast('✅ Pengaturan disimpan!');
  settingsModal.classList.remove('active');
});

// Close modal on backdrop click
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.remove('active');
  }
});

// ====== Controls ======
btnStart.addEventListener('click', () => {
  if (state.isLive) {
    stopCamera();
  } else {
    startCamera();
  }
});

btnCapture.addEventListener('click', captureFrame);

btnClear.addEventListener('click', () => {
  if (!state.isLive) {
    resultImage.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;width:100%;min-height:120px;color:var(--text-muted);">Hasil dihapus</div>';
    resultCard.style.display = 'none';
    detectionStatus.textContent = 'Tunggu...';
    detailName.textContent = '—';
    detailType.textContent = '—';
    detailClass.textContent = '—';
    detailConfidence.textContent = '—';
    resultTags.innerHTML = '';
    btnFavourite.disabled = true;
    return;
  }
  // Clear gallery
  state.gallery = [];
  renderGallery();
  showToast('🗑️ Semua hasil dihapus');
});

btnFavourite.addEventListener('click', () => {
  if (!state.currentDetection) return;
  const item = state.gallery.find(g => g.id === state.currentDetection.id);
  if (item) {
    toggleFavourite(item.id);
  }
});

// ====== Init ======
async function init() {
  loadGallery();
}

// ====== Entry ======

// Load model ready but don't block UI
loadModel().then(() => {
  log('info', 'Aplikasi siap!');
  init();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === ' ' && !e.repeat) {
    e.preventDefault();
    if (state.isLive) captureFrame();
  }
  if (e.key === 'Escape') {
    settingsModal.classList.remove('active');
    gallery.classList.remove('active');
  }
});

// Initial theme
applyTheme('forest');
log('info', 'Aplikasi dimulai');
