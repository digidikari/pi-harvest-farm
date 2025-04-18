console.log('Starting Pi Harvest Farm...');

import vegetables from '../data/vegetables.json' assert { type: 'json' };
import en from '../lang/en.json' assert { type: 'json' };
import id from '../lang/id.json' assert { type: 'json' };

console.log('Loaded JSON:', { vegetablesCount: vegetables.vegetables.length, en, id });

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
  bgm = new Audio('/pi-harvest-farm/assets/sfx/music/main-bgm.mp3');
  bgm.loop = true;
  bgm.volume = 0.5;
  ambient = new Audio('/pi-harvest-farm/assets/sfx/voice/main-bgv.mp3');
  ambient.loop = true;
  ambient.volume = 0.3;
  console.log('Audio setup done');
} catch (e) {
  console.error('Audio setup failed:', e);
}

function playSound(file) {
  try {
    const sound = new Audio(`/pi-harvest-farm/${file}`);
    sound.volume = 0.7;
    sound.play();
    console.log('Playing:', file);
  } catch (e) {
    console.error('Sound failed:', file, e);
  }
}

function startGame() {
  console.log('Start Game clicked');
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
  try {
    bgm.play().catch(e => console.error('BGM failed:', e));
    ambient.play().catch(e => console.error('Ambient failed:', e));
  } catch (e) {
    console.error('Audio play failed:', e);
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
    console.error('Language load failed:', e);
  }
}

function toggleLanguage() {
  console.log('Switching language to:', currentLang === 'en' ? 'id' : 'en');
  currentLang = currentLang === 'en' ? 'id' : 'en';
  loadLanguage();
}

function renderFarm() {
  console.log('Rendering farm with plots:', userData.plots.length);
  const farmArea = document.getElementById('farm-area');
  farmArea.innerHTML = '';
  userData.plots.forEach(plot => {
    const plotDiv = document.createElement('div');
    plotDiv.className = 'plot';
    if (plot.planted) {
      plotDiv.className += ' planted';
      const frameIndex = Math.min(plot.stage, plot.veg.frames);
      const spriteUrl = `/pi-harvest-farm/${plot.veg.sprite}/${plot.veg.id}_${frameIndex}.png`;
      console.log('Setting sprite:', spriteUrl);
      plotDiv.style.backgroundImage = `url(${spriteUrl})`;
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
  console.log('Wallet:', userData.piBalance, userData.coinBalance);
  document.getElementById('pi-balance').textContent = userData.piBalance.toFixed(2);
  document.getElementById('coin-balance').textContent = userData.coinBalance;
}

function handlePlotClick(plot) {
  console.log('Plot clicked:', plot.id);
  if (!plot.planted) return;
  playSound('assets/sfx/voice/watering-bgv.mp3');
  if (plot.stage < plot.veg.frames) {
    plot.watered = true;
    plot.growthTime *= 0.9;
    renderFarm();
  } else {
    playSound('assets/sfx/voice/harvesting-bgv.mp3');
    userData.coinBalance += plot.veg.yield * (userData.upgrades.yieldBoost || 1);
    if (Math.random() < 0.1) userData.piBalance += 0.01;
    plot.planted = false;
    checkLevelUp();
    renderFarm();
    updateWallet();
  }
}

function buySeed(veg) {
  console.log('Buying:', veg.name[currentLang]);
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
  console.log('Growth started for:', plot.veg.id);
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
  console.log('Panen count:', userData.panenCount + 1);
  userData.panenCount++;
  if (userData.panenCount % 10 === 0) {
    userData.level++;
    userData.coinBalance += 50;
    updateWallet();
    console.log('Level up:', userData.level);
  }
}

const upgrades = {
  wateringCan: { cost: 50, piCost: 0.2, effect: 0.8 },
  extraPlot: { cost: 200, piCost: 1, effect: 1 },
  yieldBoost: { cost: 100, piCost: 0.5, effect: 1.5 }
};

window.buyUpgrade = function(type) {
  console.log('Upgrade:', type);
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
  console.log('Adding event listeners');
  const startBtn = document.getElementById('start-btn');
  const langToggle = document.getElementById('lang-toggle');
  if (!startBtn || !langToggle) {
    console.error('Buttons not found:', { startBtn, langToggle });
  } else {
    startBtn.addEventListener('click', startGame);
    langToggle.addEventListener('click', toggleLanguage);
    console.log('Event listeners added');
  }
  loadLanguage();
} catch (e) {
  console.error('Init failed:', e);
        }
