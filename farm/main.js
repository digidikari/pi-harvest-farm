// Log versi untuk debug
console.log('Starting Pi Harvest Farm v16...');

// Pastikan DOM fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded, initializing...');

  // Fungsi untuk init button
  function initButtons() {
    console.log('Initializing buttons...');
    const startBtn = document.getElementById('start-btn');
    const langToggle = document.getElementById('lang-toggle');

    // Debug: Pastikan tombol ketemu
    if (!startBtn || !langToggle) {
      console.error('Buttons not found:', { startBtn, langToggle });
      alert('Error: Start button or language toggle not found. Check HTML.');
      return false;
    }

    // Attach event listeners
    startBtn.addEventListener('click', startGame);
    langToggle.addEventListener('click', toggleLanguage);
    console.log('Event listeners attached to buttons');
    return true;
  }

  // Coba init button, kalo gagal retry setelah delay
  if (!initButtons()) {
    console.warn('Initial button init failed, retrying after 500ms...');
    setTimeout(() => {
      if (initButtons()) {
        console.log('Button init successful on retry');
      } else {
        console.error('Button init failed after retry');
      }
    }, 500);
  }

  // Data
  let vegetables = { vegetables: [] };
  let inventory = { items: {} };
  let en = {
    title: 'Pi Harvest Farm',
    farm: 'Farm',
    shop: 'Shop',
    upgrades: 'Upgrades',
    inventory: 'Inventory',
    langToggle: 'Switch Language (EN/ID)',
    wateringCan: 'Watering Can',
    extraPlotCoins: 'Extra Plot',
    extraPlotPi: 'Extra Plots',
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
    newPlotCoins: 'New plot purchased with coins!',
    newPlotPi: 'New plots purchased with Pi!',
    newPlotLevel: 'New plot unlocked at level {0}!',
    bagEmpty: 'Bag is empty!'
  };
  let id = {
    title: 'Pi Harvest Farm',
    farm: 'Lahan',
    shop: 'Toko',
    upgrades: 'Peningkatan',
    inventory: 'Inventori',
    langToggle: 'Ganti Bahasa (EN/ID)',
    wateringCan: 'Gembor',
    extraPlotCoins: 'Lahan Ekstra',
    extraPlotPi: 'Lahan Ekstra',
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
    newPlotCoins: 'Lahan baru dibeli dengan koin!',
    newPlotPi: 'Lahan baru dibeli dengan Pi!',
    newPlotLevel: 'Lahan baru terbuka di level {0}!',
    bagEmpty: 'Tas kosong!'
  };
  let currentLang = 'en';
  const langData = { en, id };
  let userData = {
    piBalance: 0,
    coinBalance: 100,
    plots: [{ id: 1, planted: false }],
    upgrades: {},
    panenCount: 0,
    level: 1,
    unlockedPlots: 1
  };

  // Load JSON
  async function loadData() {
    try {
      const [vegRes, invRes] = await Promise.all([
        fetch('./data/vegetables.json').catch(() => null),
        fetch('./data/inventory.json').catch(() => null)
      ]);
      if (vegRes) vegetables = await vegRes.json();
      if (invRes) inventory = await invRes.json();
      console.log('Loaded JSON:', { vegetablesCount: vegetables.vegetables.length, inventory });
      vegetables.vegetables.forEach(veg => {
        if (!veg.id || !veg.frames) console.warn('Invalid vegetable:', veg);
      });
      loadLanguage();
    } catch (e) {
      console.error('JSON load failed:', e);
      alert('JSON error: ' + e.message);
    }
  }

  // Audio
  let bgm, ambient;
  try {
    bgm = new Audio('./assets/sfx/music/main-bgm.mp3');
    bgm.loop = true;
    bgm.volume = 0.5;
    ambient = new Audio('./assets/sfx/voice/main-bgv.mp3');
    ambient.loop = true;
    ambient.volume = 0.3;
    console.log('Audio setup done');
  } catch (e) {
    console.error('Audio setup failed:', e);
  }

  function playSound(file) {
    try {
      const sound = new Audio(`./${file}`);
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
      const startScreen = document.getElementById('start-screen');
      const gameContainer = document.getElementById('game-container');
      if (!startScreen || !gameContainer) {
        console.error('Start screen or game container not found:', { startScreen, gameContainer });
        alert('Error: Start screen or game container not found. Check HTML.');
        return;
      }
      console.log('Hiding start screen, showing game container');
      startScreen.style.display = 'none';
      gameContainer.style.display = 'flex';
      try {
        if (bgm) bgm.play().catch(e => console.error('BGM failed:', e));
        if (ambient) ambient.play().catch(e => console.error('Ambient failed:', e));
      } catch (e) {
        console.warn('Audio playback failed, skipping:', e);
      }
      loadLanguage();
      console.log('Calling switchTab("farm")');
      switchTab('farm');
    } catch (e) {
      console.error('Start game failed:', e);
      alert('Start game error: ' + e.message);
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
      document.getElementById('wateringCan-btn').textContent = `${langData[currentLang].wateringCan} (50 ${langData[currentLang].coinLabel} / 0.2 Pi)`;
      document.getElementById('extraPlotCoins-btn').textContent = `${langData[currentLang].extraPlotCoins} (200 ${langData[currentLang].coinLabel})`;
      document.getElementById('extraPlotPi-btn').textContent = `${langData[currentLang].extraPlotPi} (1 Pi)`;
      document.getElementById('yieldBoost-btn').textContent = `${langData[currentLang].yieldBoost} (100 ${langData[currentLang].coinLabel} / 0.5 Pi)`;
      document.getElementById('coin-label').textContent = langData[currentLang].coinLabel;
      document.querySelectorAll('.tab-btn').forEach((btn, i) => {
        const tabs = ['farm', 'shop', 'upgrades', 'inventory'];
        btn.textContent = langData[currentLang][tabs[i]];
      });
      renderBag();
    } catch (e) {
      console.error('Language load failed:', e);
      alert('Language error: ' + e.message);
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
      const tabElement = document.getElementById(tab);
      if (!tabElement) {
        console.error(`Tab element ${tab} not found!`);
        alert(`Error: Tab ${tab} not found in HTML. Check index.html.`);
        return;
      }
      document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.onclick = () => switchTab(btn.getAttribute('data-tab'));
      });
      tabElement.style.display = 'flex';
      const activeBtn = document.querySelector(`button[onclick="switchTab('${tab}')"]`);
      if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.setAttribute('data-tab', tab);
      }
      if (tab === 'farm') {
        renderFarm();
        renderBag();
      } else if (tab === 'shop') {
        renderShop();
      } else if (tab === 'inventory') {
        renderInventory();
      }
    } catch (e) {
      console.error('Tab switch failed:', e);
      alert('Tab error: ' + e.message);
    }
  }

  function renderFarm() {
    console.log('Rendering farm with plots:', userData.plots.length);
    try {
      const farmArea = document.getElementById('farm-area');
      farmArea.innerHTML = '';
      for (let i = 0; i < 36; i++) {
        const plot = userData.plots[i] || { id: i + 1, planted: false, locked: i >= userData.unlockedPlots };
        const plotDiv = document.createElement('div');
        plotDiv.className = 'plot';
        if (plot.locked) {
          plotDiv.className += ' locked';
        } else if (plot.planted && plot.veg && plot.veg.id) {
          plotDiv.className += ' planted';
          const frameIndex = Math.min(plot.stage, plot.veg.frames);
          const spriteUrl = `./assets/img/plant/${plot.veg.id}/${plot.veg.id}_${frameIndex}.png`;
          console.log('Setting sprite:', spriteUrl);
          const img = document.createElement('img');
          img.src = spriteUrl;
          plotDiv.appendChild(img);
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
      }
    } catch (e) {
      console.error('Render farm failed:', e);
      alert('Farm render error: ' + e.message);
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
        const div = document.createElement('div');
        div.className = 'seed-item';
        const img = document.createElement('img');
        img.src = `./assets/img/plant/${veg.id}/${veg.id}_${veg.frames}.png`;
        img.alt = veg.name[currentLang];
        div.appendChild(img);
        const span = document.createElement('span');
        span.textContent = `${veg.name[currentLang]} - ${veg.price} ${langData[currentLang].coinLabel} / ${veg.piPrice} Pi`;
        div.appendChild(span);
        div.addEventListener('click', () => buySeed(veg));
        seedList.appendChild(div);
      });
    } catch (e) {
      console.error('Render shop failed:', e);
      alert('Shop render error: ' + e.message);
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
        const div = document.createElement('div');
        div.className = 'seed-item';
        const img = document.createElement('img');
        img.src = `./assets/img/plant/${veg.id}/${veg.id}_${veg.frames}.png`;
        img.alt = veg.name[currentLang];
        div.appendChild(img);
        const span = document.createElement('span');
        span.textContent = `${veg.name[currentLang]} x${qty}`;
        div.appendChild(span);
        invList.appendChild(div);
      }
    } catch (e) {
      console.error('Render inventory failed:', e);
      alert('Inventory render error: ' + e.message);
    }
  }

  function renderBag() {
    console.log('Rendering bag');
    try {
      const bagList = document.getElementById('bag-list');
      bagList.innerHTML = '';
      const hasItems = Object.keys(inventory.items).length > 0;
      if (!hasItems) {
        const div = document.createElement('div');
        div.className = 'seed-item';
        div.textContent = langData[currentLang].bagEmpty;
        bagList.appendChild(div);
      } else {
        for (const [itemId, qty] of Object.entries(inventory.items)) {
          const veg = vegetables.vegetables.find(v => v.id === itemId);
          if (!veg || qty <= 0) continue;
          const div = document.createElement('div');
          div.className = 'seed-item';
          const img = document.createElement('img');
          img.src = `./assets/img/plant/${veg.id}/${veg.id}_${veg.frames}.png`;
          img.alt = veg.name[currentLang];
          div.appendChild(img);
          const span = document.createElement('span');
          span.textContent = `${veg.name[currentLang]} x${qty}`;
          div.appendChild(span);
          div.addEventListener('click', () => plantSeed(veg));
          bagList.appendChild(div);
        }
      }
      document.getElementById('bag').querySelector('img').onclick = () => {
        bagList.classList.toggle('show');
      };
    } catch (e) {
      console.error('Render bag failed:', e);
      alert('Bag render error: ' + e.message);
    }
  }

  function updateWallet() {
    console.log('Wallet:', userData.piBalance, userData.coinBalance);
    try {
      document.getElementById('pi-balance').textContent = userData.piBalance.toFixed(2);
      document.getElementById('coin-balance').textContent = userData.coinBalance;
    } catch (e) {
      console.error('Update wallet failed:', e);
      alert('Wallet error: ' + e.message);
    }
  }

  function handlePlotClick(plot) {
    console.log('Plot clicked:', plot.id, 'Planted:', plot.planted, 'Locked:', plot.locked);
    try {
      if (plot.locked) {
        showNotification('notEnough');
        return;
      }
      if (!plot.planted || !plot.veg || !plot.veg.id) return;
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
        const yieldBoost = userData.upgrades.yieldBoost || 1;
        userData.coinBalance += plot.veg.yield * yieldBoost;
        console.log('Harvest yield:', plot.veg.yield, 'Boost:', yieldBoost, 'Coins:', userData.coinBalance);
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
      alert('Plot error: ' + e.message);
    }
  }

  function buySeed(veg) {
    console.log('Buying:', veg.name[currentLang]);
    try {
      if (!veg.id || !veg.frames) {
        showNotification('notEnough');
        return;
      }
      if (userData.coinBalance >= veg.price || userData.piBalance >= veg.piPrice) {
        const cost = userData.coinBalance >= veg.price ? { coinBalance: userData.coinBalance - veg.price } : { piBalance: userData.piBalance - veg.piPrice };
        inventory.items[veg.id] = (inventory.items[veg.id] || 0) + 1;
        Object.assign(userData, cost);
        updateWallet();
        showNotification('purchased', [veg.name[currentLang]]);
        renderBag();
      } else {
        showNotification('notEnough');
      }
    } catch (e) {
      console.error('Buy seed failed:', e);
      alert('Buy seed error: ' + e.message);
    }
  }

  function plantSeed(veg) {
    console.log('Planting:', veg.name[currentLang]);
    try {
      if (!inventory.items[veg.id] || inventory.items[veg.id] <= 0) {
        showNotification('notEnough');
        return;
      }
      const plot = userData.plots.find(p => !p.planted && !p.locked);
      if (plot) {
        plot.planted = true;
        plot.veg = veg;
        plot.stage = 1;
        plot.growthTime = veg.growthTime * (userData.upgrades.wateringCan || 1);
        console.log('Growth time:', plot.growthTime, 'Watering Can:', userData.upgrades.wateringCan);
        plot.waitingForWater = true;
        inventory.items[veg.id]--;
        if (inventory.items[veg.id] <= 0) delete inventory.items[veg.id];
        renderFarm();
        renderBag();
        showNotification('planted', [veg.name[currentLang]]);
      } else {
        showNotification('notEnough');
      }
    } catch (e) {
      console.error('Plant seed failed:', e);
      alert('Plant seed error: ' + e.message);
    }
  }

  function startGrowth(plot) {
    console.log('Growth started for:', plot.veg.id, 'Stage:', plot.stage);
    try {
      if (plot.stage >= plot.veg.frames) return;
      const timePerStage = (plot.growthTime * 1000) / plot.veg.frames;
      console.log('Time per stage:', timePerStage, 'Growth time:', plot.growthTime);
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
      alert('Growth error: ' + e.message);
    }
  }

  function checkLevelUp() {
    console.log('Panen count:', userData.panenCount + 1);
    try {
      userData.panenCount++;
      if (userData.panenCount % 10 === 0) {
        userData.level++;
        userData.coinBalance += 50;
        if (userData.unlockedPlots < 11) {
          userData.unlockedPlots++;
          userData.plots.push({ id: userData.plots.length + 1, planted: false });
          showNotification('newPlotLevel', [userData.level]);
        }
        updateWallet();
        console.log('Level up:', userData.level, 'Plots:', userData.unlockedPlots);
        showNotification('levelUp', [userData.level]);
      }
    } catch (e) {
      console.error('Level up failed:', e);
      alert('Level up error: ' + e.message);
    }
  }

  const upgrades = {
    wateringCan: { cost: 50, piCost: 0.2, effect: 0.8 },
    yieldBoost: { cost: 100, piCost: 0.5, effect: 1.5 },
    extraPlotCoins: { cost: 200, piCost: 0, effect: 1 },
    extraPlotPi: { cost: 0, piCost: 1, effect: 5 }
  };

  window.buyUpgrade = function(type) {
    console.log('Upgrade:', type);
    try {
      const upgrade = upgrades[type];
      if (userData.coinBalance >= upgrade.cost && userData.piBalance >= upgrade.piCost && userData.unlockedPlots < 36) {
        const cost = { 
          coinBalance: userData.coinBalance - upgrade.cost,
          piBalance: userData.piBalance - upgrade.piCost
        };
        if (type.startsWith('extraPlot')) {
          const newPlots = upgrade.effect;
          for (let i = 0; i < newPlots && userData.unlockedPlots < 36; i++) {
            userData.unlockedPlots++;
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
      alert('Upgrade error: ' + e.message);
    }
  };

  // Load data after DOM loaded
  loadData();
});
