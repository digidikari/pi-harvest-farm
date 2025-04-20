// Global variables
let farmCoins = 0;
let pi = 0;
let water = 0;
let level = 1;
let xp = 0;
let inventory = [];
let bag = [];
let vegetables = [];
let langData = {};
let currentLang = 'en';
let farmPlots = [];
let harvestCount = 0;
const plotsPerPage = 4; // 2x2 grid per halaman
const totalPages = 10; // 10 halaman, total 40 plot
let currentPage = 0; // Halaman saat ini (0 = Farm 1)
let unlockedFarms = [true, false, false, false, false, false, false, false, false, false]; // Farm 1 terbuka, lainnya terkunci
const piToFarmRate = 1000000; // 1 PI = 1,000,000 Farm Coins

// Fallback langData
const fallbackLangData = {
  en: {
    planted: "Planted!",
    watered: "Watered!",
    bought: "Bought a vegetable!",
    notEnoughCoins: "Not enough Farm Coins!",
    notEnoughPi: "Not enough PI!",
    notEnoughWater: "Not enough water!",
    harvested: "Harvested!",
    exchanged: "Exchanged PI to Farm Coins!",
    dailyReward: "Claimed daily reward: 100 FC, 1 Beet, 50 Water",
    achievementUnlocked: "Achievement Unlocked!",
    achievementHarvest: "Harvest Master",
    achievementHarvestDesc: "Harvest 10 plants",
    achievementCoins: "Coin Collector",
    achievementCoinsDesc: "Collect 1000 Farm Coins",
    farmPage: "Farm {0}",
    lockedFarm: "Locked",
    unlockLevel: "Reach Level {0}",
    unlockFCCost: "Unlock for {0} FC",
    unlockPICost: "Unlock for {0} PI",
    unlocked: "Farm Unlocked!"
  },
  id: {
    planted: "Menanam!",
    watered: "Menyiram!",
    bought: "Menanam sayuran!",
    notEnoughCoins: "Farm Coins tidak cukup!",
    notEnoughPi: "PI tidak cukup!",
    notEnoughWater: "Air tidak cukup!",
    harvested: "Panen selesai!",
    exchanged: "Menukar PI ke Farm Coins!",
    dailyReward: "Mengklaim hadiah harian: 100 FC, 1 Bit, 50 Air",
    achievementUnlocked: "Pencapaian Terbuka!",
    achievementHarvest: "Ahli Panen",
    achievementHarvestDesc: "Panen 10 tanaman",
    achievementCoins: "Pengumpul Koin",
    achievementCoinsDesc: "Kumpulkan 1000 Farm Coins",
    farmPage: "Ladang {0}",
    lockedFarm: "Terkunci",
    unlockLevel: "Capai Level {0}",
    unlockFCCost: "Buka dengan {0} FC",
    unlockPICost: "Buka dengan {0} PI",
    unlocked: "Ladang Terbuka!"
  }
};

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
    langData = fallbackLangData;
    console.log('Using fallback language data');
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
    inventory = await invRes.json();
    console.log('Inventory data loaded:', inventory);
  } catch (e) {
    console.error('Inventory JSON load failed:', e.message);
    inventory = [];
    console.log('Using empty inventory');
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
  unlockedFarms = JSON.parse(localStorage.getItem('unlockedFarms')) || [true, false, false, false, false, false, false, false, false, false];

  localStorage.setItem('farmCoins', farmCoins);
  localStorage.setItem('water', water);
  localStorage.setItem('unlockedFarms', JSON.stringify(unlockedFarms));
  console.log('Player data loaded:', { farmCoins, pi, water, level, xp, inventory, unlockedFarms });
}

// Update wallet UI
function updateWallet() {
  document.getElementById('farm-coins').textContent = `${farmCoins} Farm Coins`;
  document.getElementById('pi-coins').textContent = `${pi.toFixed(2)} PI`;
  document.getElementById('water').textContent = `${water} Water`;
  document.getElementById('level').textContent = `Level: ${level} | XP: ${xp}`;
  const xpPercentage = (xp / (level * 100)) * 100;
  document.getElementById('xp-fill').style.width = `${xpPercentage}%`;
  localStorage.setItem('farmCoins', farmCoins);
  localStorage.setItem('pi', pi);
  localStorage.setItem('water', water);
  localStorage.setItem('level', level);
  localStorage.setItem('xp', xp);

  // Cek unlock berdasarkan level
  checkFarmUnlockConditions();
}

// Initialize farm plots
function initializePlots() {
  console.log('Initializing plots...');
  const farmArea = document.getElementById('farm-area');
  if (!farmArea) {
    console.error('Farm area element not found');
    return;
  }

  // Inisialisasi 40 plot (10 halaman x 4 plot)
  farmPlots = [];
  for (let i = 0; i < totalPages * plotsPerPage; i++) {
    farmPlots.push({ planted: false, vegetable: null, progress: 0, watered: false, currentFrame: 1, countdown: 0, totalCountdown: 0 });
  }

  console.log('Total plots initialized:', farmPlots.length);
  renderCurrentPage();
  updateCarouselControls();
}

// Render halaman saat ini
function renderCurrentPage() {
  const farmArea = document.getElementById('farm-area');
  if (!farmArea) {
    console.error('Farm area element not found during render');
    return;
  }

  farmArea.innerHTML = '';

  const farmTitle = document.createElement('div');
  farmTitle.classList.add('farm-title');
  farmTitle.textContent = langData[currentLang].farmPage.replace('{0}', currentPage + 1);
  farmArea.appendChild(farmTitle);

  // Cek kalau halaman terkunci
  if (!unlockedFarms[currentPage]) {
    const lockOverlay = document.createElement('div');
    lockOverlay.classList.add('lock-overlay');
    lockOverlay.innerHTML = `
      <div class="lock-message">
        <h3>${langData[currentLang].lockedFarm}</h3>
        ${getUnlockCondition(currentPage)}
      </div>
    `;
    farmArea.appendChild(lockOverlay);
    return;
  }

  // Render plot untuk halaman saat ini
  const startIndex = currentPage * plotsPerPage;
  const endIndex = Math.min(startIndex + plotsPerPage, farmPlots.length);
  for (let i = startIndex; i < endIndex; i++) {
    const plot = document.createElement('div');
    plot.classList.add('plot');
    plot.innerHTML = `
      <div class="plot-content"></div>
      <div class="progress-bar"><div class="progress-fill"></div></div>
      <div class="plot-status"></div>
    `;
    plot.addEventListener('click', () => handlePlotClick(i));
    farmArea.appendChild(plot);
    updatePlotUI(i);
  }
}

// Update UI untuk plot tertentu
function updatePlotUI(index) {
  const plot = farmPlots[index];
  const plotElement = document.querySelectorAll('.plot')[index % plotsPerPage];
  if (!plotElement) return;

  const plotContent = plotElement.querySelector('.plot-content');
  const progressBar = plotElement.querySelector('.progress-fill');
  const plotStatus = plotElement.querySelector('.plot-status');

  if (plot.planted) {
    plotContent.innerHTML = `<img src="${plot.vegetable.baseImage}${plot.currentFrame}.png" class="plant-img" onerror="this.src='assets/img/ui/placeholder.png';">`;
    const progress = (1 - plot.countdown / plot.totalCountdown) * 100;
    progressBar.style.width = `${progress}%`;
    if (plot.currentFrame >= plot.vegetable.frames) {
      plotElement.classList.add('ready');
      plotStatus.textContent = `Ready to Harvest`;
    } else if (plot.watered) {
      plotStatus.textContent = `Growing`;
    } else {
      plotStatus.textContent = `Needs Water`;
    }
  } else {
    plotContent.innerHTML = '';
    progressBar.style.width = '0%';
    plotStatus.textContent = '';
    plotElement.classList.remove('ready');
  }
}

// Update kontrol karosel
function updateCarouselControls() {
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  if (prevBtn && nextBtn) {
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage === totalPages - 1;
  }
}

// Pindah halaman
function changePage(direction) {
  currentPage += direction;
  if (currentPage < 0) currentPage = 0;
  if (currentPage >= totalPages) currentPage = totalPages - 1;
  renderCurrentPage();
  updateCarouselControls();
  playMenuSound();
}

// Syarat unlock farm
function getUnlockCondition(page) {
  const conditions = [
    null, // Farm 1 terbuka
    { type: 'level', value: 2 },
    { type: 'fc', value: 500 },
    { type: 'pi', value: 0.001 },
    { type: 'harvest', value: 20 },
    { type: 'level', value: 5 },
    { type: 'fc', value: 1000 },
    { type: 'pi', value: 0.002 },
    { type: 'harvest', value: 50 },
    { type: 'level', value: 10 }
  ];

  const condition = conditions[page];
  if (!condition) return '';

  let conditionText = '';
  if (condition.type === 'level') {
    conditionText = langData[currentLang].unlockLevel.replace('{0}', condition.value);
  } else if (condition.type === 'fc') {
    conditionText = langData[currentLang].unlockFCCost.replace('{0}', condition.value);
  } else if (condition.type === 'pi') {
    conditionText = langData[currentLang].unlockPICost.replace('{0}', condition.value);
  } else if (condition.type === 'harvest') {
    conditionText = `Harvest ${condition.value} Plants`;
  }

  if (condition.type === 'fc' || condition.type === 'pi') {
    conditionText += `<br><button class="unlock-btn" data-page="${page}">Unlock</button>`;
  }

  return `<p>${conditionText}</p>`;
}

// Cek syarat unlock otomatis
function checkFarmUnlockConditions() {
  const conditions = [
    null, // Farm 1 terbuka
    { type: 'level', value: 2 },
    { type: 'fc', value: 500 },
    { type: 'pi', value: 0.001 },
    { type: 'harvest', value: 20 },
    { type: 'level', value: 5 },
    { type: 'fc', value: 1000 },
    { type: 'pi', value: 0.002 },
    { type: 'harvest', value: 50 },
    { type: 'level', value: 10 }
  ];

  let changed = false;
  for (let i = 1; i < totalPages; i++) {
    if (unlockedFarms[i]) continue;

    const condition = conditions[i];
    if (condition.type === 'level' && level >= condition.value) {
      unlockedFarms[i] = true;
      changed = true;
      showNotification(langData[currentLang].unlocked);
    } else if (condition.type === 'harvest' && harvestCount >= condition.value) {
      unlockedFarms[i] = true;
      changed = true;
      showNotification(langData[currentLang].unlocked);
    }
  }

  if (changed) {
    localStorage.setItem('unlockedFarms', JSON.stringify(unlockedFarms));
    renderCurrentPage();
  }
}

// Unlock farm dengan FC atau PI
function unlockFarm(page) {
  const conditions = [
    null, // Farm 1 terbuka
    { type: 'level', value: 2 },
    { type: 'fc', value: 500 },
    { type: 'pi', value: 0.001 },
    { type: 'harvest', value: 20 },
    { type: 'level', value: 5 },
    { type: 'fc', value: 1000 },
    { type: 'pi', value: 0.002 },
    { type: 'harvest', value: 50 },
    { type: 'level', value: 10 }
  ];

  const condition = conditions[page];
  if (condition.type === 'fc') {
    if (farmCoins >= condition.value) {
      farmCoins -= condition.value;
      unlockedFarms[page] = true;
      updateWallet();
      localStorage.setItem('unlockedFarms', JSON.stringify(unlockedFarms));
      showNotification(langData[currentLang].unlocked);
      renderCurrentPage();
      playCoinSound();
    } else {
      showNotification(langData[currentLang].notEnoughCoins);
    }
  } else if (condition.type === 'pi') {
    if (pi >= condition.value) {
      pi -= condition.value;
      unlockedFarms[page] = true;
      updateWallet();
      localStorage.setItem('unlockedFarms', JSON.stringify(unlockedFarms));
      showNotification(langData[currentLang].unlocked);
      renderCurrentPage();
      playCoinSound();
    } else {
      showNotification(langData[currentLang].notEnoughPi);
    }
  }
}

// Handle plot click with manual growth
function handlePlotClick(index) {
  console.log(`Plot ${index} clicked...`);
  if (!unlockedFarms[currentPage]) {
    showNotification(langData[currentLang].lockedFarm);
    return;
  }

  const plot = farmPlots[index];
  const plotElement = document.querySelectorAll('.plot')[index % plotsPerPage];
  const plotContent = plotElement.querySelector('.plot-content');
  const plotStatus = plotElement.querySelector('.plot-status');

  if (!plot.planted) {
    const seedIndex = bag.findIndex(item => item.includes('Seed'));
    if (seedIndex !== -1) {
      const randomVegetable = vegetables[Math.floor(Math.random() * vegetables.length)];
      plot.planted = true;
      plot.vegetable = randomVegetable;
      plot.progress = 0;
      plot.watered = false;
      plot.currentFrame = 1;
      plot.countdown = randomVegetable.growthTime;
      plot.totalCountdown = randomVegetable.growthTime;
      plotContent.innerHTML = `<img src="${randomVegetable.baseImage}${plot.currentFrame}.png" class="plant-img" onerror="this.src='assets/img/ui/placeholder.png';">`;
      plotStatus.textContent = `Needs Water`;

      bag.splice(seedIndex, 1);
      renderBag();
      showNotification(langData[currentLang].planted);
      playBuyingSound();
      console.log(`Planted ${randomVegetable.name[currentLang]} at plot ${index}`);
    } else {
      showNotification("No Seeds in bag!");
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
    plotStatus.textContent = '';
    plotElement.classList.remove('ready');
    harvestCount++;
    localStorage.setItem('harvestCount', harvestCount);
    checkHarvestAchievement();
    checkFarmUnlockConditions();
    showNotification(langData[currentLang].harvested);
    playHarvestSound();
    renderInventory();
    renderSellSection();
    updatePlotUI(index);
    console.log(`Harvested plot ${index}, added to inventory:`, inventory);
  } else if (plot.planted && !plot.watered) {
    const waterNeeded = plot.vegetable.waterNeeded || 1;

    if (water >= waterNeeded) {
      water -= waterNeeded;
      plot.watered = true;
      updateWallet();
      showNotification(langData

[currentLang].watered);
      playWateringSound();

      const countdownInterval = setInterval(() => {
        if (!plot.planted || plot.currentFrame >= plot.vegetable.frames) {
          clearInterval(countdownInterval);
          updatePlotUI(index);
          return;
        }
        if (plot.watered) {
          plot.countdown--;
          updatePlotUI(index);
          if (plot.countdown <= 0) {
            plot.currentFrame++;
            plot.watered = false;
            plot.countdown = plot.vegetable.growthTime;
            plot.totalCountdown = plot.vegetable.growthTime;
            plotContent.innerHTML = `<img src="${plot.vegetable.baseImage}${plot.currentFrame}.png" class="plant-img" onerror="this.src='assets/img/ui/placeholder.png';">`;
            if (plot.currentFrame >= plot.vegetable.frames) {
              plotElement.classList.add('ready');
              plotStatus.textContent = `Ready to Harvest`;
              clearInterval(countdownInterval);
              updatePlotUI(index);
            } else {
              plotStatus.textContent = `Needs Water`;
            }
          } else {
            plotStatus.textContent = `Growing`;
          }
        } else {
          plotStatus.textContent = `Needs Water`;
          clearInterval(countdownInterval);
          updatePlotUI(index);
        }
      }, 1000);

      console.log(`Watered plot ${index}, used ${waterNeeded} water`);
    } else {
      showNotification(langData[currentLang].notEnoughWater);
    }
  }
}

// Render bag items
function renderBag() {
  const bagItems = document.getElementById('bag-items');
  if (bagItems) {
    bagItems.innerHTML = bag.map(item => `<span>${item}</span>`).join('');
    console.log('Bag rendered:', bag);
  } else {
    console.error('Bag items element not found');
  }
}

// Toggle bag visibility
function toggleBag() {
  const bagItems = document.getElementById('bag-items');
  if (bagItems) {
    bagItems.classList.toggle('hidden');
    console.log('Bag visibility toggled');
  }
}

// Render shop with updated Water price
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
    shopContent.innerHTML = '<p>No items available in shop. Please check vegetables.json.</p>';
    return;
  }

  vegetables.forEach(veg => {
    const vegItem = document.createElement('div');
    vegItem.classList.add('shop-item');
    const farmPrice = veg.farmPrice !== undefined ? veg.farmPrice : 0;
    vegItem.innerHTML = `
      <img src="${veg.shopImage}" alt="${veg.name[currentLang]}" class="shop-item-img" onerror="this.src='assets/img/ui/placeholder.png';">
      <h3>${veg.name[currentLang]}</h3>
      <p>Farm Price: ${farmPrice} Coins</p>
      <p>PI Price: ${veg.piPrice} PI</p>
      <button class="buy-btn" data-id="${veg.id}">Buy (Farm)</button>
      <button class="buy-pi-btn" data-id="${veg.id}">Buy (PI)</button>
    `;
    shopContent.appendChild(vegItem);
  });

  const waterItem = document.createElement('div');
  waterItem.classList.add('shop-item');
  waterItem.innerHTML = `
    <img src="assets/img/ui/water.png" alt="Water" class="shop-item-img" onerror="this.src='assets/img/ui/placeholder.png';">
    <h3>Water</h3>
    <p>Farm Price: 100 Coins</p>
    <p>PI Price: 0.0001 PI</p>
    <button class="buy-btn" data-id="water">Buy (Farm)</button>
    <button class="buy-pi-btn" data-id="water">Buy (PI)</button>
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
      if (farmCoins >= 100) {
        farmCoins -= 100;
        water += 10;
        updateWallet();
        showTransactionAnimation(`-100`, false, document.querySelector(`.buy-btn[data-id="water"]`));
        playBuyingSound();
      } else {
        showNotification(langData[currentLang].notEnoughCoins);
      }
    } else {
      if (pi >= 0.0001) {
        pi -= 0.0001;
        water += 10;
        updateWallet();
        showTransactionAnimation(`-0.0001 PI`, false, document.querySelector(`.buy-pi-btn[data-id="water"]`));
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
      bag.push(`Seed x1`);
      renderBag();
      updateWallet();
      showTransactionAnimation(`-${veg.farmPrice}`, false, document.querySelector(`.buy-btn[data-id="${id}"]`));
      playBuyingSound();
    } else {
      showNotification(langData[currentLang].notEnoughCoins);
    }
  } else {
    if (pi >= veg.piPrice) {
      pi -= veg.piPrice;
      bag.push(`Seed x1`);
      renderBag();
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
    const invItem = document.createElement('div');
    invItem.classList.add('inventory-item');
    invItem.innerHTML = `
      <img src="${item.vegetable.shopImage}" alt="${item.vegetable.name[currentLang]}" class="shop-item-img" onerror="this.src='assets/img/ui/placeholder.png';">
      <h3>${item.vegetable.name[currentLang]}</h3>
      <p>Quantity: ${item.quantity}</p>
    `;
    inventoryContent.appendChild(invItem);
  });
}

// Render sell section
function renderSellSection() {
  const sellContent = document.getElementById('sell-content');
  sellContent.innerHTML = '';
  inventory.forEach((item, index) => {
    const sellItem = document.createElement('div');
    sellItem.classList.add('sell-item');
    const sellPrice = Math.floor(item.vegetable.farmPrice * 0.5);
    sellItem.innerHTML = `
      <img src="${item.vegetable.shopImage}" alt="${item.vegetable.name[currentLang]}" class="shop-item-img" onerror="this.src='assets/img/ui/placeholder.png';">
      <h3>${item.vegetable.name[currentLang]}</h3>
      <p>Quantity: ${item.quantity}</p>
      <p>Sell Price: ${sellPrice} Coins</p>
      <button class="sell-btn" data-index="${index}">Sell</button>
    `;
    sellContent.appendChild(sellItem);
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
  if (!item) return;

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
    showNotification(`Level Up! You are now Level ${level}`);
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
    showNotification('Invalid amount!');
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

// Claim daily reward
function claimDailyReward() {
  const lastClaim = localStorage.getItem('lastClaim');
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  if (lastClaim && now - lastClaim < oneDay) {
    const timeLeft = oneDay - (now - lastClaim);
    const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    showNotification(`Wait ${hoursLeft}h ${minutesLeft}m to claim again!`);
    return;
  }

  farmCoins += 100;
  water += 50;
  bag.push('Beet Seed x1');
  updateWallet();
  renderBag();
  localStorage.setItem('lastClaim', now);
  document.getElementById('claim-reward-btn').disabled = true;
  showNotification(langData[currentLang].dailyReward);
  playCoinSound();
  console.log('Daily reward claimed, bag:', bag);
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
  checkFarmUnlockConditions();
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

// Start game
function startGame() {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
  playBgMusic();
  playBgVoice();
  initializePlots();
  updateWallet();
  renderBag();
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
  const langToggle = document.getElementById('lang-toggle');
  const gameLangToggle = document.getElementById('game-lang-toggle');
  if (langToggle) langToggle.textContent = `Switch Language (EN/ID)`;
  if (gameLangToggle) gameLangToggle.textContent = `Switch Language (EN/ID)`;
  updateWallet();
  renderBag();
  renderShop();
  renderInventory();
  renderSellSection();
  renderAchievements();
  renderCurrentPage();
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
    const startText = document.getElementById('start-text');
    const langToggle = document.getElementById('lang-toggle');
    const settingsBtn = document.getElementById('settings-btn');
    const claimRewardBtn = document.getElementById('claim-reward-btn');
    const gameLangToggle = document.getElementById('game-lang-toggle');
    const gameSettingsBtn = document.getElementById('game-settings-btn');
    const exitGameBtn = document.getElementById('exit-game-btn');
    const exchangeBtn = document.getElementById('exchange-btn');
    const exchangeAmount = document.getElementById('exchange-amount');
    const bagIcon = document.getElementById('bag-icon');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

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

    if (bagIcon) {
      bagIcon.addEventListener('click', toggleBag);
      console.log('Bag Icon listener attached');
    } else {
      console.warn('Bag Icon element not found');
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => changePage(-1));
      console.log('Carousel Prev listener attached');
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => changePage(1));
      console.log('Carousel Next listener attached');
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        switchTab(tab);
      });
    });

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('unlock-btn')) {
        const page = parseInt(e.target.getAttribute('data-page'));
        unlockFarm(page);
      }
    });

    loadData().catch(err => {
      console.error('Load data failed:', err);
      alert('Failed to load game data. Please check vegetables.json and try again.');
    });
  } catch (e) {
    console.error('Initialization failed:', e.message);
    alert('Failed to initialize game. Check console for errors.');
  }
});
