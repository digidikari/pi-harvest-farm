console.log('Loading main.js...');

import vegetables from '../data/vegetables.json' assert { type: 'json' };
import en from '../lang/en.json' assert { type: 'json' };
import id from '../lang/id.json' assert { type: 'json' };

console.log('JSON files loaded:', { vegetables, en, id });

let currentLang = 'en';
const langData = { en, id };
let userData = {
  piBalance: 0,
  coinBalance: 100,
  plots: [{ id: 1, planted: false }],
  upgrades: {},
  panenCount: 0,
  level: 1
};

// Audio
let bgm, ambient;
try {
  bgm = new Audio('../assets/sfx/music/main-bgm.mp3');
  bgm.loop = true;
  bgm.volume = 0.5;
  ambient = new Audio('../assets/sfx/voice/main-bgv.mp3');
  ambient.loop = true;
  ambient.volume = 0.3;
  console.log('Audio initialized');
} catch (e) {
  console.error('Audio init error:', e);
}

function playSound(file) {
  try {
    const sound = new Audio(file);
    sound.volume = 0.7;
    sound.play();
    console.log('Playing sound:', file);
  } catch (e) {
    console.error('Sound error:', e);
  }
}

function startGame() {
  console.log('Start game clicked');
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
  try {
    bgm.play().catch(e => console.error('BGM play error:', e));
    ambient.play().catch(e => console.error('Ambient play error:', e));
  } catch (e) {
    console.error('Audio play error:', e);
  }
  renderFarm();
  renderShop();
  updateWallet();
}

function loadLanguage() {
  console.log('Loading language:', currentLang);
  try {
    document.getElementById('title').textContent = langData[currentLang].title;
    document.getElementById('game-title').textContent = langData[currentLang].title;
    document.getElementById('shop-title').textContent = langData[currentLang].shop;
    document.getElementById('upgrades-title').textContent = langData[currentLang].upgrades;
    document.getElementById('lang-toggle').textContent = langData[currentLang].langToggle;
    document.getElementById('wateringCan-btn').textContent = `${langData[currentLang].wateringCan} (50 Coins / 0.2 Pi)`;
    document.getElementById('extraPlot-btn').textContent = `${langData[currentLang].extraPlot} (200 Coins / 1 Pi)`;
    document.getElementById('yieldBoost-btn').textContent = `${langData[currentLang].yieldBoost} (100 Coins / 0.5 Pi)`;
    renderShop();
  } catch (e) {
    console.error('Language load error:', e);
  }
}

function toggleLanguage() {
  console.log('Toggling language');
  currentLang = currentLang === 'en' ? 'id' : 'en';
  loadLanguage();
}

function renderFarm() {
  console.log('Rendering farm');
  const farmArea = document.getElementById('farm-area');
  farmArea.innerHTML = '';
  userData.plots.forEach(plot => {
    const plotDiv = document.createElement('div');
    plotDiv.className = 'plot';
    if (plot.planted) {
      plotDiv.className += ' planted';
      const frameIndex = Math.min(plot.stage, plot.veg.frames);
      plotDiv.style.backgroundImage = `url(${plot.veg.sprite}/${plot.veg.id}_${frameIndex}.png)`;
    }
    plotDiv.addEventListener('click', () => handlePlotClick(plot));
    farmArea.appendChild(plotDiv);
  });
}

function renderShop() {
  console.log('Rendering shop');
  const seedList = document.getElementById('seed-list');
  seedList.innerHTML = '';
  vegetables.vegetables.forEach(veg => {
    const li = document.createElement('li');
    li.textContent = `${veg.name[currentLang]} - ${veg.price} Coins / ${veg.piPrice} Pi`;
    li.addEventListener('click', () => buySeed(veg));
    seedList.appendChild(li);
  });
}

function updateWallet() {
  console.log('Updating wallet');
  document.getElementById('pi-balance').textContent = userData.piBalance.toFixed(2);
  document.getElementById('coin-balance').textContent = userData.coinBalance;
}

function handlePlotClick(plot) {
  console.log('Plot clicked:', plot);
  if (!plot.planted) return;
  playSound('../assets/sfx/voice/watering-bgv.mp3');
  if (plot.stage < plot.veg.frames) {
    plot.watered = true;
    plot.growthTime *= 0.9;
    renderFarm();
  } else {
    playSound('../assets/sfx/voice/harvesting-bgv.mp3');
    userData.coinBalance += plot.veg.yield * (userData.upgrades.yieldBoost || 1);
    if (Math.random() < 0.1) userData.piBalance += 0.01;
    plot.planted = false;
    checkLevelUp();
    renderFarm();
    updateWallet();
  }
}

function buySeed(veg) {
  console.log('Buying seed:', veg.name[currentLang]);
  if (userData.coinBalance >= veg.price || userData.piBalance >= veg.piPrice) {
    const cost = userData.coinBalance >= veg.price ? { coinBalance: userData.coinBalance - veg.price } : { piBalance: userData.piBalance - veg.piPrice };
    const plot = userData.plots.find(p => !p.planted);
    if (plot) {
      plot.planted = true;
      plot.veg = veg;
      plot.stage = 1;
      plot.growthTime = veg.growthTime * (userData.upgrades.wateringCan || 1);
      startGrowth(plot);
      Object.assign(userData, cost);
      renderFarm();
      updateWallet();
    }
  }
}

function startGrowth(plot) {
  console.log('Starting growth for plot:', plot);
  const interval = setInterval(() => {
    if (plot.stage < plot.veg.frames) {
      plot.stage++;
      renderFarm();
    } else {
      clearInterval(interval);
    }
  }, plot.growthTime * 1000 / plot.veg.frames);
}

function checkLevelUp() {
  console.log('Checking level up');
  userData.panenCount++;
  if (userData.panenCount % 10 === 0) {
    userData.level++;
    userData.coinBalance += 50;
    updateWallet();
  }
}

const upgrades = {
  wateringCan: { cost: 50, piCost: 0.2, effect: 0.8 },
  extraPlot: { cost: 200, piCost: 1, effect: 1 },
  yieldBoost: { cost: 100, piCost: 0.5, effect: 1.5 }
};

window.buyUpgrade = function(type) {
  console.log('Buying upgrade:', type);
  const upgrade = upgrades[type];
  if (userData.coinBalance >= upgrade.cost || userData.piBalance >= upgrade.piCost) {
    const cost = userData.coinBalance >= upgrade.cost ? { coinBalance: userData.coinBalance - upgrade.cost } : { piBalance: userData.piBalance - upgrade.piCost };
    userData.upgrades[type] = (userData.upgrades[type] || (type === 'extraPlot' ? 0 : 1)) * (type === 'extraPlot' ? 1 : upgrade.effect);
    if (type === 'extraPlot') {
      userData.plots.push({ id: userData.plots.length + 1, planted: false });
    }
    Object.assign(userData, cost);
    renderFarm();
    updateWallet();
  }
};

// Init
try {
  console.log('Initializing game');
  document.getElementById('start-btn').addEventListener('click', startGame);
  document.getElementById('lang-toggle').addEventListener('click', toggleLanguage);
  loadLanguage();
} catch (e) {
  console.error('Init error:', e);
}
