console.log('Starting Pi Harvest Farm v10...');

// Init buttons
try {
  console.log('Adding event listeners');
  const startBtn = document.getElementById('start-btn');
  const langToggle = document.getElementById('lang-toggle');
  if (!startBtn || !langToggle) {
    console.error('Buttons not found:', { startBtn, langToggle });
    alert('Error: Buttons not found. Check HTML.');
  } else {
    startBtn.addEventListener('click', startGame);
    langToggle.addEventListener('click', toggleLanguage);
    console.log('Event listeners added');
  }
} catch (e) {
  console.error('Button init failed:', e);
  alert('Error setting up buttons.');
}

// Data
let vegetables = { vegetables: [] };
let inventory = { items: {} };
let en = {
  title: 'Pi Harvest Farm',
  shop: 'Shop',
  upgrades: 'Upgrades',
  inventory: 'Inventory',
  langToggle: 'Switch Language (EN/ID)',
  wateringCan: 'Watering Can',
  extraPlot: 'Extra Plot',
  yieldBoost: 'Yield Boost',
  coinLabel: 'Coins',
  planted: 'Planted {0}!',
  watered: 'Watered {0}!',
  noWater: '{0} doesn\'t need water yet!',
  waterNow: 'Water!',
  harvestNow: 'Harvest!',
  harvested: 'Harvested {0}!',
  levelUp: 'Level up! You are now level {0}. Bonus: 50 coins!',
  purchased: 'Purchased {0}!',
  notEnough: 'Not enough coins or Pi!',
  newPlotCoins: 'New plots (3) purchased with coins!',
  newPlotPi: 'New plots (9) purchased with Pi!'
};
let id = {
  title: 'Pi Harvest Farm',
  shop: 'Toko',
  upgrades: 'Peningkatan',
  inventory: 'Inventori',
  langToggle: 'Ganti Bahasa (EN/ID)',
  wateringCan: 'Gembor',
  extraPlot: 'Lahan Ekstra',
  yieldBoost: 'Peningkatan Hasil',
  coinLabel: 'Koin',
  planted: 'Ditanam {0}!',
  watered: 'Disiram {0}!',
  noWater: '{0} belum perlu disiram!',
  waterNow: 'Siram!',
  harvestNow: 'Panen!',
  harvested: 'Panen {0}!',
  levelUp: 'Naik level! Sekarang level {0}. Bonus: 50 koin!',
  purchased: 'Membeli {0}!',
  notEnough: 'Koin atau Pi tidak cukup!',
  newPlotCoins: 'Lahan baru (3) dibeli dengan koin!',
  newPlotPi: 'Lahan baru (9) dibeli dengan Pi!'
};
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

// Load JSON
async function loadData() {
  try {
    const [vegRes, invRes, enRes, idRes] = await Promise.all([
      fetch('/pi-harvest-farm/data/vegetables.json'),
      fetch('/pi-harvest-farm/data/inventory.json'),
      fetch('/pi-harvest-farm/lang/en.json'),
      fetch('/pi-harvest-farm/lang/id.json')
    ]);
    vegetables = await vegRes.json();
    inventory = await invRes.json();
    const enLoaded = await enRes.json();
    const idLoaded = await idRes.json();
    Object.assign(en, enLoaded);
    Object.assign(id, idLoaded);
    console.log('Loaded JSON:', { vegetablesCount: vegetables.vegetables.length, inventory, en, id });
    vegetables.vegetables.forEach(veg => {
      if (!veg.id || !veg.frames) {
        console.error('Invalid vegetable:', veg);
        alert(`Error: Vegetable ${veg.name?.en || 'unknown'} missing id or frames.`);
      }
    });
    loadLanguage();
  } catch (e) {
    console.error('JSON load failed:', e);
    alert('Error loading game data. Using fallback.');
  }
}

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

function showNotification(key, params = []) {
  try {
    let message = langData[currentLang][key] || key;
    params.forEach((param, i) => {
      message = message.replace(`{${i}}`, param);
    });
    const notif = document.getElementById('notification') || document.createElement('div');
    if (!notif.id) {
      notif.id = 'notification';
      document.body.appendChild(notif);
    }
    notif.textContent = message;
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 2000);
  } catch (e) {
    console.error('Notification failed:', e);
  }
}

function startGame() {
  console.log('Start Game clicked');
  try {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    if (bgm) bgm.play().catch(e => console.error('BGM failed:', e));
    if (ambient) ambient.play().catch(e => console.error('Ambient failed:', e));
    switchTab('lahan');
  } catch (e) {
    console.error('Start game failed:', e);
    alert('Error starting game.');
  }
}

function loadLanguage() {
  console.log('Loading language:', currentLang);
  try {
    document.getElementById('title').textContent = langData[currentLang].title;
    document.getElementById('game-title').textContent = langData[currentLang].title;
    document.getElementById('shop-title').textContent = langData[currentLang].shop;
    document.getElementById('upgrades-title').textContent = langData[currentLang].upgrades;
    document.getElementById('inventory-title').textContent = langData[currentLang].inventory;
    document.getElementById('lang-toggle').textContent = langData[currentLang].langToggle;
    document.getElementById('wateringCan-btn').textContent = `${langData[currentLang].wateringCan} (50 Coins / 0.2 Pi)`;
    document.getElementById('extraPlot-btn').textContent = `${langData[currentLang].extraPlot} (200 Coins / 1 Pi)`;
    document.getElementById('yieldBoost-btn').textContent = `${langData[currentLang].yieldBoost} (100 Coins / 0.5 Pi)`;
    document.getElementById('coin-label').textContent = langData[currentLang].coinLabel;
    switchTab(document.querySelector('.tab-btn.active').getAttribute('onclick').match(/'([^']+)'/)[1]);
  } catch (e) {
    console.error('Language load failed:', e);
  }
}

function toggleLanguage() {
  console.log('Switching language to:', currentLang === 'en' ? 'id' : 'en');
  currentLang = currentLang === 'en' ? 'id' : 'en';
  loadLanguage();
}

function switchTab(tab) {
  console.log('Switching to tab:', tab);
  try {
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tab).style.display = 'block';
    document.querySelector(`button[onclick="switchTab('${tab}')"]`).classList.add('active');
    if (tab === 'lahan') renderFarm();
    else if (tab === 'toko') renderShop();
    else if (tab === 'inventory') renderInventory();
  } catch (e) {
    console.error('Tab switch failed:', e);
  }
}

function renderFarm() {
  console.log('Rendering farm with plots:', userData.plots.length);
  try {
    const farmArea = document.getElementById('farm-area');
    farmArea.innerHTML = '';
    userData.plots.forEach(plot => {
      const plotDiv = document.createElement('div');
      plotDiv.className = 'plot';
      if (plot.planted && plot.veg && plot.veg.id) {
        plotDiv.className += ' planted';
        const frameIndex = Math.min(plot.stage, plot.veg.frames);
        const spriteUrl = `/pi-harvest-farm/assets/img/plant/${plot.veg.id}/${plot.veg.id}_${frameIndex}.png`;
        console.log('Setting sprite:', spriteUrl);
        plotDiv.style.backgroundImage = `url(${spriteUrl})`;
        const img = new Image();
        img.src = spriteUrl;
        img.onerror = () => {
          console.error('Sprite failed:', spriteUrl);
          alert(`Sprite not found: ${plot.veg.id}_${frameIndex}.png for ${plot.veg.name[currentLang]}`);
        };
        // Timer
        const timerSpan = document.createElement('span');
        timerSpan.className = 'plot-timer';
        if (plot.stage >= plot.veg.frames) {
          timerSpan.textContent = langData[currentLang].harvestNow;
        } else if (plot.waitingForWater) {
          timerSpan.textContent = langData[currentLang].waterNow;
        } else if (plot.nextWaterTime) {
          const timeLeft = Math.max(0, (plot.nextWaterTime - Date.now()) / 1000);
          timerSpan.textContent = timeLeft > 0 ? `${timeLeft.toFixed(1)}s` : langData[currentLang].waterNow;
        }
        plotDiv.appendChild(timerSpan);
      }
      plotDiv.addEventListener('click', () => handlePlotClick(plot));
      farmArea.appendChild(plotDiv);
    });
  } catch (e) {
    console.error('Render farm failed:', e);
    alert('Error rendering farm.');
  }
}

function renderShop() {
  console.log('Rendering shop');
  try {
    const seedList = document.getElementById('seed-list');
    seedList.innerHTML = '';
    vegetables.vegetables.forEach(veg => {
      if (!veg.id) {
        console.warn('Skipping vegetable without id:', veg);
        return;
      }
      const li = document.createElement('li');
      li.textContent = `${veg.name[currentLang]} - ${veg.price} ${langData[currentLang].coinLabel} / ${veg.piPrice} Pi`;
      li.addEventListener('click', () => buySeed(veg));
      seedList.appendChild(li);
    });
  } catch (e) {
    console.error('Render shop failed:', e);
  }
}

function renderInventory() {
  console.log('Rendering inventory');
  try {
    const invList = document.getElementById('inventory-list');
    invList.innerHTML = '';
    for (const [itemId, qty] of Object.entries(inventory.items)) {
      const veg = vegetables.vegetables.find(v => v.id === itemId);
      if (!veg) continue;
      const li = document.createElement('li');
      li.textContent = `${veg.name[currentLang]} x${qty}`;
      invList.appendChild(li);
    }
  } catch (e) {
    console.error('Render inventory failed:', e);
  }
}

function updateWallet() {
  console.log('Wallet:', userData.piBalance, userData.coinBalance);
  try {
    document.getElementById('pi-balance').textContent = userData.piBalance.toFixed(2);
    document.getElementById('coin-balance').textContent = userData.coinBalance;
  } catch (e) {
    console.error('Update wallet failed:', e);
  }
}

function handlePlotClick(plot) {
  console.log('Plot clicked:', plot.id, 'Planted:', plot.planted);
  if (!plot.planted || !plot.veg || !plot.veg.id) return;
  try {
    if (plot.stage < plot.veg.frames) {
      if (!plot.waitingForWater) {
        showNotification('noWater', [plot.veg.name[currentLang]]);
        return;
      }
      playSound('assets/sfx/voice/watering-bgv.mp3');
      plot.waitingForWater = false;
      const plotDiv = document.querySelector(`.plot:nth-child(${plot.id})`);
      if (plotDiv) {
        plotDiv.classList.add('splash', 'shake');
        setTimeout(() => plotDiv.classList.remove('splash', 'shake'), 300);
      }
      showNotification('watered', [plot.veg.name[currentLang]]);
      startGrowth(plot);
    } else {
      playSound('assets/sfx/voice/harvesting-bgv.mp3');
      const plotDiv = document.querySelector(`.plot:nth-child(${plot.id})`);
      if (plotDiv) {
        plotDiv.classList.add('bounce', 'shake');
        setTimeout(() => plotDiv.classList.remove('bounce', 'shake'), 600);
      }
      userData.coinBalance += plot.veg.yield * (userData.upgrades.yieldBoost || 1);
      inventory.items[plot.veg.id] = (inventory.items[plot.veg.id] || 0) + 1;
      if (Math.random() < 0.1) userData.piBalance += 0.01;
      plot.planted = false;
      delete plot.veg;
      delete plot.stage;
      delete plot.growthTime;
      delete plot.waitingForWater;
      delete plot.nextWaterTime;
      checkLevelUp();
      renderFarm();
      updateWallet();
      showNotification('harvested', [plot.veg.name[currentLang]]);
    }
  } catch (e) {
    console.error('Plot click failed:', e);
    alert('Error handling plot click.');
  }
}

function buySeed(veg) {
  console.log('Buying:', veg.name[currentLang]);
  try {
    if (!veg.id || !veg.frames) {
      alert(`Error: Cannot plant ${veg.name[currentLang]}, missing id or frames.`);
      return;
    }
    if (userData.coinBalance >= veg.price || userData.piBalance >= veg.piPrice) {
      const cost = userData.coinBalance >= veg.price ? { coinBalance: userData.coinBalance - veg.price } : { piBalance: userData.piBalance - veg.piPrice };
      const plot = userData.plots.find(p => !p.planted);
      if (plot) {
        plot.planted = true;
        plot.veg = veg;
        plot.stage = 1;
        plot.growthTime = veg.growthTime * (userData.upgrades.wateringCan || 1);
        plot.waitingForWater = true;
        renderFarm();
        Object.assign(userData, cost);
        updateWallet();
        showNotification('planted', [veg.name[currentLang]]);
      } else {
        alert('No empty plots available! Panen or buy extra plot.');
      }
    } else {
      showNotification('notEnough');
    }
  } catch (e) {
    console.error('Buy seed failed:', e);
    alert('Error buying seed.');
  }
}

function startGrowth(plot) {
  console.log('Growth started for:', plot.veg.id, 'Stage:', plot.stage);
  try {
    if (plot.stage >= plot.veg.frames) return;
    const timePerStage = (plot.growthTime * 1000) / plot.veg.frames;
    plot.nextWaterTime = Date.now() + timePerStage;
    plot.waitingForWater = false;
    renderFarm();
    const interval = setInterval(() => {
      if (!plot.planted || !plot.veg || plot.waitingForWater) {
        clearInterval(interval);
        return;
      }
      const timeLeft = (plot.nextWaterTime - Date.now()) / 1000;
      if (timeLeft <= 0) {
        plot.stage++;
        plot.waitingForWater = true;
        clearInterval(interval);
        renderFarm();
      }
      renderFarm();
    }, 100);
  } catch (e) {
    console.error('Growth failed:', e);
  }
}

function checkLevelUp() {
  console.log('Panen count:', userData.panenCount + 1);
  try {
    userData.panenCount++;
    if (userData.panenCount % 10 === 0) {
      userData.level++;
      userData.coinBalance += 50;
      updateWallet();
      console.log('Level up:', userData.level);
      showNotification('levelUp', [userData.level]);
    }
  } catch (e) {
    console.error('Level up failed:', e);
  }
}

const upgrades = {
  wateringCan: { cost: 50, piCost: 0.2, effect: 0.8 },
  yieldBoost: { cost: 100, piCost: 0.5, effect: 1.5 },
  extraPlotCoins: { cost: 200, piCost: 0, effect: 3 },
  extraPlotPi: { cost: 0, piCost: 1, effect: 9 }
};

window.buyUpgrade = function(type) {
  console.log('Upgrade:', type);
  try {
    const upgrade = upgrades[type];
    if (userData.coinBalance >= upgrade.cost && userData.piBalance >= upgrade.piCost) {
      const cost = { 
        coinBalance: userData.coinBalance - upgrade.cost,
        piBalance: userData.piBalance - upgrade.piCost
      };
      if (type.startsWith('extraPlot')) {
        const newPlots = upgrade.effect;
        for (let i = 0; i < newPlots && userData.plots.length < 16; i++) {
          userData.plots.push({ id: userData.plots.length + 1, planted: false });
        }
        showNotification(type === 'extraPlotCoins' ? 'newPlotCoins' : 'newPlotPi');
      } else {
        userData.upgrades[type] = (userData.upgrades[type] || 1) * upgrade.effect;
        showNotification('purchased', [langData[currentLang][type]]);
      }
      Object.assign(userData, cost);
      renderFarm();
      updateWallet();
    } else {
      showNotification('notEnough');
    }
  } catch (e) {
    console.error('Buy upgrade failed:', e);
    alert('Error buying upgrade.');
  }
};

// Load data after buttons
loadData();
