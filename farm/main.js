// Global variables
let farmCoins = 0;
let pi = 0;
let water = 0;
let level = 1;
let xp = 0;
let inventory = [];
let vegetables = [];
let langData = {};
let currentLang = 'en';
let farmPlots = [];
let harvestCount = 0;
const plotCount = 4; // 2x2 grid
const piToFarmRate = 1000000; // 1 PI = 1,000,000 Farm Coins

// Audio elements
const bgMusic = document.getElementById('bg-music');
const bgVoice = document.getElementById('bg-voice');
const harvestSound = document.getElementById('harvest-sound');
const wateringSound = document.getElementById('watering-sound');
const menuSound = document.getElementById('menu-sound');
const buyingSound = document.getElementById('buying-sound');
const coinSound = document.getElementById('coin-sound');

function playBgMusic() {
  if (bgMusic) bgMusic.play().catch(e => console.error('BG Music play failed:', e));
}

function playBgVoice() {
  if (bgVoice) bgVoice.play().catch(e => console.error('BG Voice play failed:', e));
}

function playHarvestSound() {
  if (harvestSound) harvestSound.play().catch(e => console.error('Harvest sound play failed:', e));
}

function playWateringSound() {
  if (wateringSound) wateringSound.play().catch(e => console.error('Watering sound play failed:', e));
}

function playMenuSound() {
  if (menuSound) menuSound.play().catch(e => console.error('Menu sound play failed:', e));
}

function playBuyingSound() {
  if (buyingSound) buyingSound.play().catch(e => console.error('Buying sound play failed:', e));
}

function playCoinSound() {
  if (coinSound) coinSound.play().catch(e => console.error('Coin sound play failed:', e));
}

function updateVolumes() {
  const musicVolume = localStorage.getItem('musicVolume') || 50;
  const voiceVolume = localStorage.getItem('voiceVolume') || 50;
  if (bgMusic) bgMusic.volume = musicVolume / 100;
  if (bgVoice) bgVoice.volume = voiceVolume / 100;
  if (harvestSound) harvestSound.volume = voiceVolume / 100;
  if (wateringSound) wateringSound.volume = voiceVolume / 100;
  if (menuSound) menuSound.volume = voiceVolume / 100;
  if (buyingSound) buyingSound.volume = voiceVolume / 100;
  if (coinSound) coinSound.volume = voiceVolume / 100;
}

// Load data from JSON files
async function loadData() {
  console.log('Loading data...');
  try {
    const langRes = await fetch('./data/lang.json');
    if (!langRes.ok) throw new Error(`Failed to load lang.json (status: ${langRes.status})`);
    langData = await langRes.json();
    console.log('Language data loaded:', langData);
  } catch (e) {
    console.error('Lang JSON load failed:', e.message);
    throw new Error('Cannot proceed without language data. Please check lang.json.');
  }

  try {
    const vegRes = await fetch('./data/vegetables.json');
    if (!vegRes.ok) throw new Error(`Failed to load vegetables.json (status: ${vegRes.status})`);
    const vegData = await vegRes.json();
    vegetables = vegData.vegetables || vegData;
    console.log('Vegetables data loaded:', vegetables);
  } catch (e) {
    console.error('Vegetables JSON load failed:', e.message);
    throw new Error('Cannot proceed without vegetables data. Please check vegetables.json.');
  }

  try {
    const invRes = await fetch('./data/inventory.json');
    if (!invRes.ok) throw new Error(`Failed to load inventory.json (status: ${invRes.status})`);
    const initialInventory = await invRes.json();
    inventory = JSON.parse(localStorage.getItem('inventory')) || initialInventory;
    console.log('Inventory data loaded:', inventory);
  } catch (e) {
    console.error('Inventory JSON load failed:', e.message);
    throw new Error('Cannot proceed without inventory data. Please check inventory.json.');
  }

  initializeGame();
}

// Load player data
function loadPlayerData() {
  console.log('Loading player data...');
  farmCoins = localStorage.getItem('farmCoins') ? parseInt(localStorage.getItem('farmCoins')) : 0;
  pi = localStorage.getItem('pi') ? parseFloat(localStorage.getItem('pi')) : 0;
  water = localStorage.getItem('water') ? parseInt(localStorage.getItem('water')) : 0;
  level = localStorage.getItem('level') ? parseInt(localStorage.getItem('level')) : 1;
  xp = localStorage.getItem('xp') ? parseInt(localStorage.getItem('xp')) : 0;
  inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  harvestCount = localStorage.getItem('harvestCount') ? parseInt(localStorage.getItem('harvestCount')) : 0;

  localStorage.setItem('farmCoins', farmCoins);
  localStorage.setItem('water', water);
  console.log('Player data loaded:', { farmCoins, pi, water, level, xp, inventory });
}

// Update wallet UI
function updateWallet() {
  document.getElementById('farm-coins').textContent = `${farmCoins} ${langData[currentLang].coinLabel}`;
  document.getElementById('pi-coins').textContent = `${pi.toFixed(2)} PI`;
  document.getElementById('water').textContent = `${water} ${langData[currentLang].waterLabel || 'Water'}`;
  document.getElementById('level').textContent = `Level: ${level} | XP: ${xp}`;
  const xpPercentage = (xp / (level * 100)) * 100;
  document.getElementById('xp-fill').style.width = `${xpPercentage}%`;
  localStorage.setItem('farmCoins', farmCoins);
  localStorage.setItem('pi', pi);
  localStorage.setItem('water', water);
  localStorage.setItem('level', level);
  localStorage.setItem('xp', xp);
  localStorage.setItem('inventory', JSON.stringify(inventory));
}

// Initialize farm plots
function initializePlots() {
  console.log('Initializing plots...');
  const farmArea = document.getElementById('farm-area');
  if (!farmArea) {
    console.error('Farm area element not found');
    return;
  }

  farmPlots = [];
  farmArea.innerHTML = '';
  for (let i = 0; i < plotCount; i++) {
    const plot = document.createElement('div');
    plot.classList.add('plot');
    plot.innerHTML = `
      <div class="plot-content"></div>
      <div class="countdown-bar">
        <div class="countdown-fill"></div>
      </div>
      <div class="plot-status"></div>
    `;
    plot.addEventListener('click', () => handlePlotClick(i));
    farmArea.appendChild(plot);
    farmPlots.push({ planted: false, vegetable: null, progress: 0, watered: false, currentFrame: 1, countdown: 0, totalCountdown: 0 });
  }
  console.log('Plots initialized:', farmPlots);

  // Update teks UI setelah plots diinisialisasi
  updateUIText();
}

// Handle plot click with manual growth
function handlePlotClick(index) {
  console.log(`Plot ${index} clicked...`);
  const plot = farmPlots[index];
  const plotElement = document.querySelectorAll('.plot')[index];
  const plotContent = plotElement.querySelector('.plot-content');
  const plotStatus = plotElement.querySelector('.plot-status');
  const countdownFill = plotElement.querySelector('.countdown-fill');

  if (!plot.planted) {
  const seedIndex = inventory.findIndex(item => item && typeof item === 'string' && item.includes('Seed'));
  if (seedIndex !== -1) {
    const randomVegetable = vegetables[Math.floor(Math.random() * vegetables.length)];
    plot.planted = true;
    plot.vegetable = randomVegetable;
    plot.progress = 0;
    plot.watered = false;
    plot.currentFrame = 1;
    plot.countdown = randomVegetable.growthTime;
    plot.totalCountdown = randomVegetable.growthTime;

    // Tambah animasi terbang
    const flyImage = document.createElement('img');
    flyImage.src = randomVegetable.shopImage;
    flyImage.classList.add('plant-fly');
    flyImage.style.width = '60px'; // Ukuran sama kayak di toko
    flyImage.style.bottom = '0';
    flyImage.style.left = '50%';
    flyImage.style.transform = 'translateX(-50%)';
    plotContent.appendChild(flyImage);

    // Setelah animasi selesai, render sprite tanaman
    setTimeout(() => {
      flyImage.remove(); // Hapus gambar terbang
      plotContent.innerHTML = `<img src="${randomVegetable.baseImage}${plot.currentFrame}.png" class="plant-img" onerror="this.src='assets/img/ui/placeholder.png';">`;
    }, 800); // Sesuai durasi animasi (0.8s)

    plotStatus.innerHTML = langData[currentLang].needsWater || 'Needs Water';
    countdownFill.style.width = '0%'; // Reset bar saat tanam

    inventory.splice(seedIndex, 1);
    localStorage.setItem('inventory', JSON.stringify(inventory));
    showNotification(langData[currentLang].planted);
    playBuyingSound();
    console.log(`Planted ${randomVegetable.name[currentLang]} at plot ${index}`);
  } else {
    showNotification(langData[currentLang].noSeeds || 'No Seeds in inventory!');
  }
}
  } else if (plot.planted && plot.currentFrame >= plot.vegetable.frames) {
    inventory.push({ vegetable: plot.vegetable, quantity: plot.vegetable.yield });
    localStorage.setItem('inventory', JSON.stringify(inventory));
    plot.planted = false;
    plot.vegetable = null;
    plot.progress = 0;
    plot.watered = false;
    plot.currentFrame = 1;
    plot.countdown = 0;
    plot.totalCountdown = 0;
    plotContent.innerHTML = '';
    plotStatus.innerHTML = '';
    countdownFill.style.width = '0%'; // Reset bar saat panen
    plotElement.classList.remove('ready');
    harvestCount++;
    localStorage.setItem('harvestCount', harvestCount);
    checkHarvestAchievement();
    showNotification(langData[currentLang].harvested);
    playHarvestSound();
    renderInventory();
    renderSellSection();
    console.log(`Harvested plot ${index}, added to inventory:`, inventory);
  } else if (plot.planted && !plot.watered) {
    const waterNeeded = plot.vegetable.waterNeeded || 1;

    if (water >= waterNeeded) {
      water -= waterNeeded;
      plot.watered = true;
      updateWallet();
      showNotification(langData[currentLang].watered);
      playWateringSound();

      const countdownInterval = setInterval(() => {
        if (!plot.planted || plot.currentFrame >= plot.vegetable.frames) {
          clearInterval(countdownInterval);
          countdownFill.style.width = '0%'; // Reset bar kalau tanaman dihapus atau selesai
          return;
        }
        if (plot.watered) {
          plot.countdown--;
          const progress = (1 - plot.countdown / plot.totalCountdown) * 100;
          countdownFill.style.width = `${progress}%`; // Update lebar bar
          if (plot.countdown <= 0) {
            plot.currentFrame++;
            plot.watered = false;
            plot.countdown = plot.vegetable.growthTime;
            plot.totalCountdown = plot.vegetable.growthTime;
            plotContent.innerHTML = `<img src="${plot.vegetable.baseImage}${plot.currentFrame}.png" class="plant-img" onerror="this.src='assets/img/ui/placeholder.png';">`;
            if (plot.currentFrame >= plot.vegetable.frames) {
              plotElement.classList.add('ready');
              plotStatus.innerHTML = langData[currentLang].readyToHarvest || 'Ready to Harvest';
              clearInterval(countdownInterval);
              countdownFill.style.width = '100%'; // Bar penuh saat siap panen
            } else {
              plotStatus.innerHTML = langData[currentLang].needsWater || 'Needs Water';
              countdownFill.style.width = '0%'; // Reset bar untuk siklus berikutnya
            }
          } else {
            plotStatus.innerHTML = langData[currentLang].growing || 'Growing';
          }
        } else {
          plotStatus.innerHTML = langData[currentLang].needsWater || 'Needs Water';
          clearInterval(countdownInterval);
          countdownFill.style.width = '0%'; // Reset bar kalau gak disiram
        }
      }, 1000);

      console.log(`Watered plot ${index}, used ${waterNeeded} water`);
    } else {
      showNotification(langData[currentLang].notEnoughWater);
    }
  }
}

// Render shop with Water item
function renderShop() {
  console.log('Rendering shop with vegetables:', vegetables);
  const shopContent = document.getElementById('shop-content');
  if (!shopContent) {
    console.error('Shop content element not found');
    return;
  }

  shopContent.innerHTML = '';
  if (!vegetables || vegetables.length === 0) {
    console.warn('No vegetables data available');
    shopContent.innerHTML = `<p>${langData[currentLang].noItems || 'No items available in shop. Please check vegetables.json.'}</p>`;
    return;
  }

  // Render sayuran
  vegetables.forEach(veg => {
    const vegItem = document.createElement('div');
    vegItem.classList.add('shop-item');
    const farmPrice = veg.farmPrice !== undefined ? veg.farmPrice : 0;
    vegItem.innerHTML = `
      <img src="${veg.shopImage}" alt="${veg.name[currentLang]}" class="shop-item-img" onerror="this.src='assets/img/ui/placeholder.png';">
      <h3>${veg.name[currentLang]}</h3>
      <p>${langData[currentLang].farmPriceLabel || 'Farm Price'}: ${farmPrice} ${langData[currentLang].coinLabel}</p>
      <p>${langData[currentLang].piPriceLabel || 'PI Price'}: ${veg.piPrice} PI</p>
      <button class="buy-btn" data-id="${veg.id}">${langData[currentLang].buyLabel} (Farm)</button>
      <button class="buy-pi-btn" data-id="${veg.id}">${langData[currentLang].buyLabel} (PI)</button>
    `;
    shopContent.appendChild(vegItem);
  });

  // Tambah item Water
  const waterItem = document.createElement('div');
  waterItem.classList.add('shop-item');
  waterItem.innerHTML = `
    <img src="assets/img/ui/water.png" alt="${langData[currentLang].waterLabel || 'Water'}" class="shop-item-img" onerror="this.src='assets/img/ui/placeholder.png';">
    <h3>${langData[currentLang].waterLabel || 'Water'}</h3>
    <p>${langData[currentLang].farmPriceLabel || 'Farm Price'}: 50 ${langData[currentLang].coinLabel}</p>
    <p>${langData[currentLang].piPriceLabel || 'PI Price'}: 0.00005 PI</p>
    <button class="buy-btn" data-id="water">${langData[currentLang].buyLabel} (Farm)</button>
    <button class="buy-pi-btn" data-id="water">${langData[currentLang].buyLabel} (PI)</button>
  `;
  shopContent.appendChild(waterItem);

  document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      buyVegetable(id, 'farm');
    });
  });

  document.querySelectorAll('.buy-pi-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      buyVegetable(id, 'pi');
    });
  });

  console.log('Shop rendered successfully');
}

// Buy vegetable or water
function buyVegetable(id, currency) {
  if (id === 'water') {
    if (currency === 'farm') {
      if (farmCoins >= 50) {
        farmCoins -= 50;
        water += 10;
        updateWallet();
        showTransactionAnimation(`-50`, false, document.querySelector(`.buy-btn[data-id="water"]`));
        playBuyingSound();
      } else {
        showNotification(langData[currentLang].notEnoughCoins);
      }
    } else {
      if (pi >= 0.00005) {
        pi -= 0.00005;
        water += 10;
        updateWallet();
        showTransactionAnimation(`-0.00005 PI`, false, document.querySelector(`.buy-pi-btn[data-id="water"]`));
        playBuyingSound();
      } else {
        showNotification(langData[currentLang].notEnoughPi);
      }
    }
    return;
  }

  const veg = vegetables.find(v => v.id === id);
  if (!veg) return;

  if (currency === 'farm') {
    if (farmCoins >= veg.farmPrice) {
      farmCoins -= veg.farmPrice;
      inventory.push(`${langData[currentLang].seedLabel || 'Seed'} x1`);
      localStorage.setItem('inventory', JSON.stringify(inventory));
      updateWallet();
      showTransactionAnimation(`-${veg.farmPrice}`, false, document.querySelector(`.buy-btn[data-id="${id}"]`));
      playBuyingSound();
    } else {
      showNotification(langData[currentLang].notEnoughCoins);
    }
  } else {
    if (pi >= veg.piPrice) {
      pi -= veg.piPrice;
      inventory.push(`${langData[currentLang].seedLabel || 'Seed'} x1`);
      localStorage.setItem('inventory', JSON.stringify(inventory));
      updateWallet();
      showTransactionAnimation(`-${veg.piPrice} PI`, false, document.querySelector(`.buy-pi-btn[data-id="${id}"]`));
      playBuyingSound();
    } else {
      showNotification(langData[currentLang].notEnoughPi);
    }
  }
}

// Render inventory
function renderInventory() {
  const inventoryContent = document.getElementById('inventory-content');
  inventoryContent.innerHTML = '';
  inventory.forEach((item, index) => {
    if (typeof item === 'string' && item.includes('Seed')) {
      const invItem = document.createElement('div');
      invItem.classList.add('inventory-item');
      invItem.innerHTML = `
        <img src="assets/img/ui/seed.png" alt="Seed" class="shop-item-img" onerror="this.src='assets/img/ui/placeholder.png';">
        <h3>${item}</h3>
        <p>${langData[currentLang].quantityLabel || 'Quantity'}: 1</p>
      `;
      inventoryContent.appendChild(invItem);
    } else if (item && item.vegetable) {
      const invItem = document.createElement('div');
      invItem.classList.add('inventory-item');
      invItem.innerHTML = `
        <img src="${item.vegetable.shopImage}" alt="${item.vegetable.name[currentLang]}" class="shop-item-img" onerror="this.src='assets/img/ui/placeholder.png';">
        <h3>${item.vegetable.name[currentLang]}</h3>
        <p>${langData[currentLang].quantityLabel || 'Quantity'}: ${item.quantity}</p>
      `;
      inventoryContent.appendChild(invItem);
    }
  });
}

// Render sell section
function renderSellSection() {
  const sellContent = document.getElementById('sell-content');
  sellContent.innerHTML = '';
  inventory.forEach((item, index) => {
    if (item && item.vegetable) {
      const sellItem = document.createElement('div');
      sellItem.classList.add('sell-item');
      const sellPrice = Math.floor(item.vegetable.farmPrice * 0.5);
      sellItem.innerHTML = `
        <img src="${item.vegetable.shopImage}" alt="${item.vegetable.name[currentLang]}" class="shop-item-img" onerror="this.src='assets/img/ui/placeholder.png';">
        <h3>${item.vegetable.name[currentLang]}</h3>
        <p>${langData[currentLang].quantityLabel || 'Quantity'}: ${item.quantity}</p>
        <p>${langData[currentLang].sellPriceLabel || 'Sell Price'}: ${sellPrice} ${langData[currentLang].coinLabel}</p>
        <button class="sell-btn" data-index="${index}">${langData[currentLang].sellLabel || 'Sell'}</button>
      `;
      sellContent.appendChild(sellItem);
    }
  });

  document.querySelectorAll('.sell-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'));
      sellItem(index);
    });
  });
}

// Sell item
function sellItem(index) {
  const item = inventory[index];
  if (!item || !item.vegetable) return;

  const sellPrice = Math.floor(item.vegetable.farmPrice * 0.5);
  farmCoins += sellPrice * item.quantity;
  xp += 10;
  checkLevelUp();
  inventory.splice(index, 1);
  localStorage.setItem('inventory', JSON.stringify(inventory));
  updateWallet();
  renderInventory();
  renderSellSection();
  showTransactionAnimation(`+${sellPrice * item.quantity}`, true, document.querySelector(`.sell-btn[data-index="${index}"]`));
  playCoinSound();
  checkCoinAchievement();
}

// Check level up
function checkLevelUp() {
  const xpRequired = level * 100;
  while (xp >= xpRequired) {
    xp -= xpRequired;
    level++;
    showNotification(`${langData[currentLang].levelUp} ${level}`);
  }
  updateWallet();
}

// Switch tabs
function switchTab(tab) {
  console.log(`Switching to ${tab} tab...`);
  try {
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    const tabContent = document.getElementById(tab);
    const tabBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    if (tabContent && tabBtn) {
      tabContent.classList.add('active');
      tabBtn.classList.add('active');
      console.log(`Switched to ${tab} tab successfully`);
    } else {
      throw new Error(`Tab content or button for ${tab} not found`);
    }

    if (tab === 'shop') {
      renderShop();
      renderSellSection();
    } else if (tab === 'inventory') {
      renderInventory();
    } else if (tab === 'achievements') {
      renderAchievements();
    } else if (tab === 'exchange') {
      updateExchangeResult();
    }

    playMenuSound();
  } catch (e) {
    console.error('Switch tab failed:', e.message);
    alert('Failed to switch tab. Check console for details.');
  }
}

// Exchange PI to Farm Coins
function exchangePi() {
  const amount = parseFloat(document.getElementById('exchange-amount').value);
  if (isNaN(amount) || amount <= 0) {
    showNotification(langData[currentLang].invalidAmount || 'Invalid amount!');
    return;
  }

  if (pi >= amount) {
    pi -= amount;
    farmCoins += amount * piToFarmRate;
    updateWallet();
    showNotification(langData[currentLang].exchanged);
    playCoinSound();
    checkCoinAchievement();
    updateExchangeResult();
  } else {
    showNotification(langData[currentLang].notEnoughPi);
  }
}

// Update exchange result
function updateExchangeResult() {
  const amount = parseFloat(document.getElementById('exchange-amount').value) || 0;
  const farmCoinsResult = amount * piToFarmRate;
  document.getElementById('exchange-result').textContent = farmCoinsResult;
}

// Modal untuk daily reward
const rewardModal = document.getElementById('reward-modal');
const claimModalBtn = document.getElementById('claim-modal-btn');
const closeModal = document.getElementById('reward-modal-close');

document.getElementById('claim-reward-btn').addEventListener('click', () => {
  rewardModal.style.display = 'block';
  playMenuSound();
});

claimModalBtn.addEventListener('click', () => {
  farmCoins += 100;
  localStorage.setItem('farmCoins', farmCoins);
  localStorage.setItem('lastClaim', Date.now());
  document.getElementById('claim-reward-btn').disabled = true;
  updateWallet();
  showTransactionAnimation('+100', true, claimModalBtn);
  playCoinSound();
  rewardModal.style.display = 'none';
});

closeModal.addEventListener('click', () => {
  rewardModal.style.display = 'none';
  playMenuSound();
});

// Claim daily reward
function claimDailyReward() {
  const lastClaim = localStorage.getItem('lastClaim');
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  if (lastClaim && now - lastClaim < oneDay) {
    const timeLeft = oneDay - (now - lastClaim);
    const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    showNotification(`${langData[currentLang].waitLabel || 'Wait'} ${hoursLeft}h ${minutesLeft}m ${langData[currentLang].toClaimAgain || 'to claim again!'}`);
    return;
  }

  rewardModal.style.display = 'block';
}

// Check harvest achievement
function checkHarvestAchievement() {
  if (harvestCount >= 10) {
    const achievement = document.querySelector('.achievement[data-id="harvest"]');
    if (achievement && !achievement.classList.contains('completed')) {
      achievement.classList.add('completed');
      showNotification(langData[currentLang].achievementUnlocked);
      playCoinSound();
    }
  }
}

// Check coin achievement
function checkCoinAchievement() {
  if (farmCoins >= 1000) {
    const achievement = document.querySelector('.achievement[data-id="coins"]');
    if (achievement && !achievement.classList.contains('completed')) {
      achievement.classList.add('completed');
      showNotification(langData[currentLang].achievementUnlocked);
      playCoinSound();
    }
  }
}

// Render achievements
function renderAchievements() {
  const achievementsContent = document.getElementById('achievements-content');
  achievementsContent.innerHTML = `
    <div class="achievement ${harvestCount >= 10 ? 'completed' : ''}" data-id="harvest">
      <h3>${langData[currentLang].achievementHarvest}</h3>
      <p>${langData[currentLang].achievementHarvestDesc}</p>
    </div>
    <div class="achievement ${farmCoins >= 1000 ? 'completed' : ''}" data-id="coins">
      <h3>${langData[currentLang].achievementCoins}</h3>
      <p>${langData[currentLang].achievementCoinsDesc}</p>
    </div>
  `;
}

// Show notification
function showNotification(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.style.display = 'block';
    console.log('Notification shown:', message);
    setTimeout(() => {
      notification.style.display = 'none';
    }, 2000);
  } else {
    console.error('Notification element not found');
  }
}

// Show transaction animation
function showTransactionAnimation(amount, isPositive, element) {
  const anim = document.createElement('div');
  anim.classList.add('transaction-animation');
  anim.classList.add(isPositive ? 'positive' : 'negative');
  anim.textContent = amount;
  const rect = element.getBoundingClientRect();
  anim.style.left = `${rect.left + rect.width / 2}px`;
  anim.style.top = `${rect.top - 20}px`;
  document.body.appendChild(anim);
  setTimeout(() => anim.remove(), 1000);
}

// Update UI text based on langData
function updateUIText() {
  document.getElementById('title').textContent = langData[currentLang].title;
  document.getElementById('start-text').textContent = langData[currentLang].startBtn;
  document.getElementById('lang-toggle').textContent = langData[currentLang].switchLangLabel || 'Switch Language (EN/ID)';
  document.getElementById('game-lang-toggle').textContent = langData[currentLang].switchLangLabel || 'Switch Language (EN/ID)';
  document.getElementById('game-title').textContent = langData[currentLang].title;
  document.querySelector('.tab-btn[data-tab="farm"]').textContent = langData[currentLang].farmTab;
  document.querySelector('.tab-btn[data-tab="shop"]').textContent = langData[currentLang].shopTab;
  document.querySelector('.tab-btn[data-tab="upgrades"]').textContent = langData[currentLang].upgradesTab;
  document.querySelector('.tab-btn[data-tab="inventory"]').textContent = langData[currentLang].inventoryTab;
  document.querySelector('.tab-btn[data-tab="exchange"]').textContent = langData[currentLang].exchangeTab;
  document.querySelector('.tab-btn[data-tab="leaderboard"]').textContent = langData[currentLang].leaderboardTab;
  document.querySelector('.tab-btn[data-tab="achievements"]').textContent = langData[currentLang].achievementsTab;
  document.getElementById('claim-reward-btn').textContent = langData[currentLang].claimRewardBtn;
  document.getElementById('upgrades-title').textContent = langData[currentLang].upgradesTab;
  document.getElementById('upgrades-content').textContent = langData[currentLang].comingSoon || 'Coming soon...';
  document.getElementById('leaderboard-title').textContent = langData[currentLang].leaderboardTab;
  document.getElementById('leaderboard-content').textContent = langData[currentLang].comingSoon || 'Coming soon...';
  document.getElementById('exchange-title').textContent = langData[currentLang].exchangeTab;
  document.getElementById('exchange-rate').textContent = langData[currentLang].exchangeRateLabel || `1 PI = ${piToFarmRate} ${langData[currentLang].coinLabel}`;
  document.getElementById('exchange-amount').placeholder = langData[currentLang].enterPiAmount || 'Enter PI amount';
  document.getElementById('exchange-result-label').textContent = `${langData[currentLang].coinLabel}: `;
  document.getElementById('exchange-btn').textContent = langData[currentLang].exchangeBtn;
  document.getElementById('sell-section-title').textContent = langData[currentLang].sellItemsLabel || 'Sell Items';
  document.getElementById('settings-title').textContent = langData[currentLang].settingsLabel || 'Settings';
  document.getElementById('music-volume-label').textContent = langData[currentLang].musicVolumeLabel || 'Music Volume:';
  document.getElementById('voice-volume-label').textContent = langData[currentLang].voiceVolumeLabel || 'Voice/SFX Volume:';
}

// Start game
function startGame() {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
  playBgMusic();
  playBgVoice();
  initializePlots();
  updateWallet();
  renderShop();
  renderInventory();
  renderSellSection();
  renderAchievements();
  switchTab('farm');
  checkDailyReward();
}

// Exit game
function exitGame() {
  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'block';
  if (bgMusic) bgMusic.pause();
  if (bgVoice) bgVoice.pause();
}

// Toggle language
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'id' : 'en';
  updateUIText();
  updateWallet();
  renderShop();
  renderInventory();
  renderSellSection();
  renderAchievements();
  playMenuSound();
  console.log('Language toggled to:', currentLang);
}

// Open settings
function openSettings() {
  const modal = document.getElementById('settings-modal');
  modal.style.display = 'block';
  playMenuSound();
}

// Initialize settings
function initializeSettings() {
  const musicVolumeSlider = document.getElementById('music-volume');
  const voiceVolumeSlider = document.getElementById('voice-volume');
  const closeSettings = document.getElementById('close-settings');

  musicVolumeSlider.value = localStorage.getItem('musicVolume') || 50;
  voiceVolumeSlider.value = localStorage.getItem('voiceVolume') || 50;

  musicVolumeSlider.addEventListener('input', () => {
    localStorage.setItem('musicVolume', musicVolumeSlider.value);
    updateVolumes();
  });

  voiceVolumeSlider.addEventListener('input', () => {
    localStorage.setItem('voiceVolume', voiceVolumeSlider.value);
    updateVolumes();
  });

  closeSettings.addEventListener('click', () => {
    document.getElementById('settings-modal').style.display = 'none';
    playMenuSound();
  });
}

// Check daily reward availability
function checkDailyReward() {
  const lastClaim = localStorage.getItem('lastClaim');
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  if (lastClaim && now - lastClaim < oneDay) {
    document.getElementById('claim-reward-btn').disabled = true;
  }
}

// Initialize game
function initializeGame() {
  loadPlayerData();
  initializeSettings();
  updateVolumes();
  checkDailyReward();
  console.log('Game initialized');
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing game...');
  try {
    // Handle loading screen
    const loadingScreen = document.getElementById('loading-screen');
    const startScreen = document.getElementById('start-screen');
    if (loadingScreen && startScreen) {
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
          startScreen.style.display = 'block';
        }, 500); // Tunggu fade-out selesai
      }, 3000); // 3 detik
    } else {
      console.warn('Loading or start screen element not found');
      if (startScreen) startScreen.style.display = 'block';
    }

    const startText = document.getElementById('start-text');
    const langToggle = document.getElementById('lang-toggle');
    const settingsBtn = document.getElementById('settings-btn');
    const claimRewardBtn = document.getElementById('claim-reward-btn');
    const gameLangToggle = document.getElementById('game-lang-toggle');
    const gameSettingsBtn = document.getElementById('game-settings-btn');
    const exitGameBtn = document.getElementById('exit-game-btn');
    const exchangeBtn = document.getElementById('exchange-btn');
    const exchangeAmount = document.getElementById('exchange-amount');

    console.log('Start Text Element:', startText);
    console.log('Lang Toggle Element:', langToggle);
    console.log('Settings Button Element:', settingsBtn);
    console.log('Game Lang Toggle Element:', gameLangToggle);

    if (startText) {
      startText.addEventListener('click', startGame);
      console.log('Start Text listener attached');
    } else {
      console.warn('Start Text element not found');
    }

    if (langToggle) {
      langToggle.addEventListener('click', toggleLanguage);
      console.log('Lang Toggle listener attached');
    } else {
      console.warn('Lang Toggle element not found');
    }

    if (settingsBtn) {
      settingsBtn.addEventListener('click', openSettings);
      console.log('Settings Button listener attached');
    } else {
      console.warn('Settings Button element not found');
    }

    if (claimRewardBtn) {
      claimRewardBtn.addEventListener('click', claimDailyReward);
      console.log('Claim Reward listener attached');
    } else {
      console.warn('Claim Reward button not found');
    }

    if (gameLangToggle) {
      gameLangToggle.addEventListener('click', toggleLanguage);
      console.log('Game Lang Toggle listener attached');
    } else {
      console.warn('Game Lang Toggle element not found');
    }

    if (gameSettingsBtn) {
      gameSettingsBtn.addEventListener('click', openSettings);
      console.log('Game Settings Button listener attached');
    } else {
      console.warn('Game Settings Button element not found');
    }

    if (exitGameBtn) {
      exitGameBtn.addEventListener('click', exitGame);
      console.log('Exit Game Button listener attached');
    } else {
      console.warn('Exit Game Button element not found');
    }

    if (exchangeBtn) {
      exchangeBtn.addEventListener('click', exchangePi);
      console.log('Exchange Button listener attached');
    } else {
      console.warn('Exchange Button element not found');
    }

    if (exchangeAmount) {
      exchangeAmount.addEventListener('input', updateExchangeResult);
      console.log('Exchange Amount listener attached');
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        switchTab(tab);
      });
    });

    loadData().catch(err => {
      console.error('Load data failed:', err);
      alert('Failed to load game data. Please check the required JSON files and try again.');
    });
  } catch (e) {
    console.error('Initialization failed:', e.message);
    alert('Failed to initialize game. Check console for errors.');
  }
});
