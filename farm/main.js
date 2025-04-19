let vegetables = [];
let langData = {};
let currentLang = 'en';
let coins = 100;
let pi = 0;
let farmPlots = [];
let inventory = [];
let bag = [];
let upgrades = {
  wateringCan: false,
  extraPlotCoins: 0,
  extraPlotPi: 0,
  yieldBoost: false
};
let level = 1;
let xp = 0;
let playerName = 'Player' + Math.floor(Math.random() * 1000);
let achievements = JSON.parse(localStorage.getItem('achievements')) || {
  harvest10: false,
  pi10: false
};
let harvestCount = JSON.parse(localStorage.getItem('harvestCount')) || 0;
let lastRewardClaim = JSON.parse(localStorage.getItem('lastRewardClaim')) || 0;

let musicVolume = localStorage.getItem('musicVolume') ? parseInt(localStorage.getItem('musicVolume')) : 50;
let voiceVolume = localStorage.getItem('voiceVolume') ? parseInt(localStorage.getItem('voiceVolume')) : 50;

const plotCount = 8;
const xpPerLevel = 100;
const dailyRewardCooldown = 24 * 60 * 60 * 1000;

const fallbackLangData = {
  "en": {
    "title": "Pi Harvest Farm",
    "startBtn": "Start Game",
    "farmTab": "Farm",
    "shopTab": "Shop",
    "upgradesTab": "Upgrades",
    "inventoryTab": "Inventory",
    "leaderboardTab": "Leaderboard",
    "achievementsTab": "Achievements",
    "coinLabel": "Coins",
    "buyLabel": "Buy",
    "emptyBag": "Bag is empty!",
    "emptyInventory": "Inventory is empty!",
    "notEnoughMoney": "Not enough money!",
    "bought": "Bought",
    "harvested": "Harvested",
    "upgradeBought": "Upgrade bought",
    "levelUp": "Level up to",
    "claimRewardBtn": "Claim Daily Reward",
    "rewardClaimed": "Daily Reward Claimed!",
    "rewardCooldown": "Reward Available Tomorrow!",
    "achievementHarvest10": "Harvest 10 Plants",
    "achievementPi10": "Collect 10 Pi",
    "achievementUnlocked": "Achievement Unlocked!"
  },
  "id": {
    "title": "Pi Harvest Farm",
    "startBtn": "Mulai Permainan",
    "farmTab": "Ladang",
    "shopTab": "Toko",
    "upgradesTab": "Peningkatan",
    "inventoryTab": "Inventaris",
    "leaderboardTab": "Papan Peringkat",
    "achievementsTab": "Pencapaian",
    "coinLabel": "Koin",
    "buyLabel": "Beli",
    "emptyBag": "Tas kosong!",
    "emptyInventory": "Inventaris kosong!",
    "notEnoughMoney": "Uang tidak cukup!",
    "bought": "Dibeli",
    "harvested": "Dipanen",
    "upgradeBought": "Peningkatan dibeli",
    "levelUp": "Naik level ke",
    "claimRewardBtn": "Klaim Hadiah Harian",
    "rewardClaimed": "Hadiah Harian Diklaim!",
    "rewardCooldown": "Hadiah Tersedia Besok!",
    "achievementHarvest10": "Panen 10 Tanaman",
    "achievementPi10": "Kumpulkan 10 Pi",
    "achievementUnlocked": "Pencapaian Dibuka!"
  }
};

const fallbackVegetables = [
  { id: "beet", name: { en: "Beet", id: "Bit" }, price: 10, piPrice: 0.1, growthTime: 10, frames: 13, yield: 15, piYield: 0.1 },
  { id: "cabbage", name: { en: "Cabbage", id: "Kol" }, price: 20, piPrice: 0.2, growthTime: 12, frames: 20, yield: 25, piYield: 0.2 },
  { id: "carrot", name: { en: "Carrot", id: "Wortel" }, price: 15, piPrice: 0.15, growthTime: 8, frames: 16, yield: 20, piYield: 0.15 },
  { id: "corn", name: { en: "Corn", id: "Jagung" }, price: 25, piPrice: 0.25, growthTime: 15, frames: 20, yield: 30, piYield: 0.25 },
  { id: "cucumber", name: { en: "Cucumber", id: "Timun" }, price: 18, piPrice: 0.18, growthTime: 10, frames: 20, yield: 22, piYield: 0.18 },
  { id: "eggplant", name: { en: "Eggplant", id: "Terong" }, price: 22, piPrice: 0.22, growthTime: 12, frames: 9, yield: 28, piYield: 0.22 },
  { id: "onion", name: { en: "Onion", id: "Bawang" }, price: 12, piPrice: 0.12, growthTime: 7, frames: 6, yield: 18, piYield: 0.12 },
  { id: "peas", name: { en: "Peas", id: "Kacang Polong" }, price: 16, piPrice: 0.16, growthTime: 9, frames: 8, yield: 20, piYield: 0.16 },
  { id: "pepper", name: { en: "Pepper", id: "Paprika" }, price: 20, piPrice: 0.2, growthTime: 11, frames: 12, yield: 25, piYield: 0.2 },
  { id: "potato", name: { en: "Potato", id: "Kentang" }, price: 18, piPrice: 0.18, growthTime: 10, frames: 7, yield: 22, piYield: 0.18 },
  { id: "pumpkin", name: { en: "Pumpkin", id: "Labu" }, price: 30, piPrice: 0.3, growthTime: 15, frames: 20, yield: 35, piYield: 0.3 },
  { id: "radish", name: { en: "Radish", id: "Lobak" }, price: 12, piPrice: 0.12, growthTime: 7, frames: 8, yield: 18, piYield: 0.12 },
  { id: "lettuce", name: { en: "Lettuce", id: "Selada" }, price: 15, piPrice: 0.15, growthTime: 8, frames: 7, yield: 20, piYield: 0.15 },
  { id: "spinach", name: { en: "Spinach", id: "Bayam" }, price: 10, piPrice: 0.1, growthTime: 6, frames: 5, yield: 15, piYield: 0.1 },
  { id: "tomato", name: { en: "Tomato", id: "Tomat" }, price: 18, piPrice: 0.18, growthTime: 10, frames: 20, yield: 22, piYield: 0.18 },
  { id: "watermelon", name: { en: "Watermelon", id: "Semangka" }, price: 35, piPrice: 0.35, growthTime: 18, frames: 19, yield: 40, piYield: 0.35 },
  { id: "wheat", name: { en: "Wheat", id: "Gandum" }, price: 22, piPrice: 0.22, growthTime: 12, frames: 7, yield: 28, piYield: 0.22 }
];

// Adjust vegetable prices and yields for 60% Pi, 40% Coins
fallbackVegetables.forEach(veg => {
  veg.price = Math.round(veg.price * 0.4); // 40% Coins
  veg.piPrice = parseFloat((veg.piPrice * 0.6).toFixed(2)); // 60% Pi
  veg.yield = Math.round(veg.yield * 0.4); // 40% Coins for yield
  veg.piYield = parseFloat((veg.piYield * 0.6).toFixed(2)); // 60% Pi for yield
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing game...');
  try {
    const startText = document.getElementById('start-text');
    const langToggle = document.getElementById('lang-toggle');
    const settingsBtn = document.getElementById('settings-btn');
    const claimRewardBtn = document.getElementById('claim-reward-btn');

    if (!startText) throw new Error('Start text element not found');
    if (!langToggle) throw new Error('Language toggle button not found');
    if (!settingsBtn) throw new Error('Settings button not found');
    if (!claimRewardBtn) throw new Error('Claim reward button not found');

    startText.addEventListener('click', startGame);
    langToggle.addEventListener('click', toggleLanguage);
    settingsBtn.addEventListener('click', () => {
      console.log('Settings button clicked');
      const modal = document.getElementById('settings-modal');
      if (modal) modal.style.display = 'block';
    });
    claimRewardBtn.addEventListener('click', claimDailyReward);

    // Initialize tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const tab = btn.getAttribute('data-tab');
      btn.addEventListener('click', () => switchTab(tab));
    });

    initializeFirebaseAuth();
    loadData();
    initializeSettings();
    updateVolumes();

    // Play background music after user interaction
    document.addEventListener('click', () => {
      const bgMusic = document.getElementById('bg-music');
      if (bgMusic) {
        bgMusic.play().catch(e => console.error('Background music failed to play:', e));
      }
    }, { once: true });
  } catch (e) {
    console.error('Initialization failed:', e.message);
  }
});

async function loadData() {
  console.log('Loading data...');
  try {
    const langRes = await fetch('../data/lang.json');
    if (!langRes.ok) {
      console.error(`Failed to load lang.json, status: ${langRes.status}, statusText: ${langRes.statusText}`);
      throw new Error('Failed to load lang.json');
    }
    langData = await langRes.json();
    console.log('Loaded lang.json:', langData);
  } catch (e) {
    console.error('Lang JSON load failed:', e.message);
    console.warn('Using fallback lang data...');
    langData = fallbackLangData;
  }

  try {
    const vegRes = await fetch('../data/vegetables.json');
    if (!vegRes.ok) {
      console.error(`Failed to load vegetables.json, status: ${vegRes.status}, statusText: ${vegRes.statusText}`);
      throw new Error('Failed to load vegetables.json');
    }
    const vegData = await vegRes.json();
    vegetables = vegData.vegetables;
    // Adjust vegetable prices and yields for 60% Pi, 40% Coins
    vegetables.forEach(veg => {
      veg.price = Math.round(veg.price * 0.4);
      veg.piPrice = parseFloat((veg.piPrice * 0.6).toFixed(2));
      veg.yield = Math.round(veg.yield * 0.4);
      veg.piYield = parseFloat((veg.piYield * 0.6).toFixed(2));
    });
    console.log('Loaded vegetables.json:', vegetables);
  } catch (e) {
    console.error('Vegetables JSON load failed:', e.message);
    console.warn('Using fallback vegetables data...');
    vegetables = fallbackVegetables;
  }

  try {
    const invRes = await fetch('../data/inventory.json');
    if (!invRes.ok) {
      console.error(`Failed to load inventory.json, status: ${invRes.status}, statusText: ${invRes.statusText}`);
      throw new Error('Failed to load inventory.json');
    }
    inventory = await invRes.json();
    console.log('Loaded inventory.json:', inventory);
  } catch (e) {
    console.error('Inventory JSON load failed:', e.message);
    inventory = [];
  }

  initializeGame();
}

function initializeGame() {
  console.log('Initializing game...');
  const savedLang = localStorage.getItem('lang');
  if (savedLang) {
    currentLang = savedLang;
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
      langToggle.textContent = `Switch Language (${currentLang === 'en' ? 'ID' : 'EN'})`;
    }
  }
  loadPlayerData();
  updateUIText();
  initializePlots();
  updateWallet();
  updateLevelBar();
  renderBag();
  renderAchievements();
  checkDailyReward();
}

function startGame() {
  console.log('Starting game...');
  try {
    const startScreen = document.getElementById('start-screen');
    const gameContainer = document.getElementById('game-container');
    if (!startScreen || !gameContainer) {
      throw new Error('Start screen or game container not found');
    }
    startScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    switchTab('farm');
  } catch (e) {
    console.error('Start game failed:', e.message);
  }
}

function toggleLanguage() {
  console.log('Toggling language...');
  try {
    currentLang = currentLang === 'en' ? 'id' : 'en';
    localStorage.setItem('lang', currentLang);
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
      langToggle.textContent = `Switch Language (${currentLang === 'en' ? 'ID' : 'EN'})`;
    }
    updateUIText();
    const startText = document.getElementById('start-text');
    if (startText) {
      startText.textContent = langData[currentLang].startBtn;
    }
    switchTab(document.querySelector('.tab-btn.active')?.getAttribute('data-tab') || 'farm');
  } catch (e) {
    console.error('Toggle language failed:', e.message);
  }
}

function updateUIText() {
  console.log('Updating UI text...');
  try {
    const title = document.getElementById('title');
    const startText = document.getElementById('start-text');
    const gameTitle = document.getElementById('game-title');
    const shopTitle = document.getElementById('shop-title');
    const upgradesTitle = document.getElementById('upgrades-title');
    const inventoryTitle = document.getElementById('inventory-title');
    const leaderboardTitle = document.getElementById('leaderboard-title');
    const achievementsTitle = document.getElementById('achievements-title');
    const claimRewardBtn = document.getElementById('claim-reward-btn');

    if (title) title.textContent = langData[currentLang].title;
    if (startText) startText.textContent = langData[currentLang].startBtn;
    if (gameTitle) gameTitle.textContent = langData[currentLang].title;
    if (shopTitle) shopTitle.textContent = langData[currentLang].shopTab;
    if (upgradesTitle) upgradesTitle.textContent = langData[currentLang].upgradesTab;
    if (inventoryTitle) inventoryTitle.textContent = langData[currentLang].inventoryTab;
    if (leaderboardTitle) leaderboardTitle.textContent = langData[currentLang].leaderboardTab;
    if (achievementsTitle) achievementsTitle.textContent = langData[currentLang].achievementsTab;
    if (claimRewardBtn) claimRewardBtn.textContent = langData[currentLang].claimRewardBtn;

    document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
      const tabs = ['farmTab', 'shopTab', 'upgradesTab', 'inventoryTab', 'leaderboardTab', 'achievementsTab'];
      btn.textContent = langData[currentLang][tabs[idx]];
    });

    const activeTab = document.querySelector('.tab-btn.active')?.getAttribute('data-tab');
    if (activeTab === 'shop') renderShop();
    if (activeTab === 'inventory') renderInventory();
    if (activeTab === 'leaderboard') renderLeaderboard();
    if (activeTab === 'achievements') renderAchievements();
  } catch (e) {
    console.error('Update UI text failed:', e.message);
  }
}

function initializeSettings() {
  console.log('Initializing settings...');
  try {
    const modal = document.getElementById('settings-modal');
    const closeBtn = document.getElementById('close-settings');
    const musicSlider = document.getElementById('music-volume');
    const voiceSlider = document.getElementById('voice-volume');

    if (!modal || !closeBtn || !musicSlider || !voiceSlider) {
      throw new Error('Settings elements not found');
    }

    musicSlider.value = musicVolume;
    voiceSlider.value = voiceVolume;

    closeBtn.onclick = () => {
      console.log('Closing settings modal');
      modal.style.display = 'none';
    };

    window.onclick = (event) => {
      if (event.target === modal) {
        console.log('Closing settings modal via window click');
        modal.style.display = 'none';
      }
    };

    musicSlider.addEventListener('input', () => {
      musicVolume = parseInt(musicSlider.value);
      localStorage.setItem('musicVolume', musicVolume);
      updateVolumes();
    });

    voiceSlider.addEventListener('input', () => {
      voiceVolume = parseInt(voiceSlider.value);
      localStorage.setItem('voiceVolume', voiceVolume);
      updateVolumes();
    });
  } catch (e) {
    console.error('Settings initialization failed:', e.message);
  }
}

function updateVolumes() {
  console.log('Updating volumes...');
  try {
    const bgMusic = document.getElementById('bg-music');
    const harvestSound = document.getElementById('harvest-sound');
    const wateringSound = document.getElementById('watering-sound');
    if (bgMusic) {
      bgMusic.volume = musicVolume / 100;
      console.log('Background music volume set to:', bgMusic.volume);
    }
    if (harvestSound) {
      harvestSound.volume = voiceVolume / 100;
      console.log('Harvest sound volume set to:', harvestSound.volume);
    }
    if (wateringSound) {
      wateringSound.volume = voiceVolume / 100;
      console.log('Watering sound volume set to:', wateringSound.volume);
    }
  } catch (e) {
    console.error('Update volumes failed:', e.message);
  }
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
    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = 'none';
    });
    tabElement.style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
    if (tab === 'farm') renderFarm();
    if (tab === 'shop') renderShop();
    if (tab === 'inventory') renderInventory();
    if (tab === 'leaderboard') renderLeaderboard();
    if (tab === 'achievements') renderAchievements();
  } catch (e) {
    console.error('Tab switch failed:', e);
    alert('Tab error: ' + e.message);
  }
}

function initializePlots() {
  console.log('Initializing farm plots...');
  const farmArea = document.getElementById('farm-area');
  farmArea.innerHTML = '';
  const totalPlots = plotCount + upgrades.extraPlotCoins + upgrades.extraPlotPi;
  for (let i = 0; i < totalPlots; i++) {
    const plot = document.createElement('div');
    plot.className = 'plot';
    plot.dataset.index = i;
    plot.onclick = () => plantSeed(i);
    farmArea.appendChild(plot);
    farmPlots[i] = { vegetable: null, growth: 0, watered: false };
  }
  console.log('Farm plots initialized:', farmPlots);
}

function renderFarm() {
  console.log('Rendering farm...');
  farmPlots.forEach((plot, index) => {
    const plotElement = document.querySelector(`.plot[data-index="${index}"]`);
    plotElement.innerHTML = '';
    if (plot.vegetable) {
      const veg = vegetables.find(v => v.id === plot.vegetable);
      const frame = Math.min(Math.floor((plot.growth / veg.growthTime) * veg.frames), veg.frames - 1);
      const img = document.createElement('img');
      img.src = `../assets/img/plant/${veg.id}/${veg.id}_${frame + 1}.png`;
      img.alt = veg.name[currentLang];
      img.className = 'plant-img';
      if (plot.growth >= veg.growthTime) {
        plotElement.classList.add('ready');
        plotElement.onclick = () => harvest(index);
      } else {
        plotElement.classList.remove('ready');
        plotElement.onclick = () => water(index);
      }
      if (!plot.watered) {
        plotElement.classList.add('dry');
        plotElement.onclick = () => water(index);
      } else {
        plotElement.classList.remove('dry');
      }
      plotElement.appendChild(img);
    } else {
      plotElement.classList.remove('ready', 'dry');
      plotElement.onclick = () => plantSeed(index);
    }
  });
}

function plantSeed(index) {
  console.log('Planting seed at index:', index);
  if (bag.length === 0) {
    showNotification(langData[currentLang].emptyBag);
    return;
  }
  const seed = bag.shift();
  farmPlots[index].vegetable = seed;
  farmPlots[index].growth = 0;
  farmPlots[index].watered = false;
  renderFarm();
  renderBag();
}

function water(index) {
  console.log('Watering plot at index:', index);
  if (!farmPlots[index].vegetable) return;
  if (upgrades.wateringCan) {
    farmPlots[index].watered = true;
    farmPlots[index].growth += 2;
  } else {
    farmPlots[index].watered = true;
    farmPlots[index].growth += 1;
  }
  const veg = vegetables.find(v => v.id === farmPlots[index].vegetable);
  if (farmPlots[index].growth >= veg.growthTime) {
    farmPlots[index].growth = veg.growthTime;
  }
  renderFarm();
  try {
    const wateringSound = document.getElementById('watering-sound');
    if (wateringSound) {
      wateringSound.play().catch(e => console.error('Watering sound failed:', e));
    } else {
      console.error('Watering sound element not found');
    }
  } catch (e) {
    console.error('Watering sound failed:', e);
  }
}

function harvest(index) {
  console.log('Harvesting plot at index:', index);
  const veg = vegetables.find(v => v.id === farmPlots[index].vegetable);
  let yieldAmount = veg.yield;
  let piYieldAmount = veg.piYield;
  if (upgrades.yieldBoost) {
    yieldAmount = Math.round(yieldAmount * 1.5);
    piYieldAmount = parseFloat((piYieldAmount * 1.5).toFixed(2));
  }
  inventory.push({ id: veg.id, amount: yieldAmount });
  farmPlots[index] = { vegetable: null, growth: 0, watered: false };
  coins += yieldAmount;
  pi += piYieldAmount;
  xp += 10;
  harvestCount++;
  checkAchievements();
  checkLevelUp();
  updateWallet();
  updateLeaderboard();
  updateLevelBar();
  renderFarm();
  try {
    const harvestSound = document.getElementById('harvest-sound');
    if (harvestSound) {
      harvestSound.play().catch(e => console.error('Harvest sound failed:', e));
    } else {
      console.error('Harvest sound element not found');
    }
  } catch (e) {
    console.error('Harvest sound failed:', e);
  }
  showNotification(`${langData[currentLang].harvested} ${veg.name[currentLang]}! +${yieldAmount} ${langData[currentLang].coinLabel}, +${piYieldAmount.toFixed(2)} Pi, +10 XP`);
}

function renderShop() {
  console.log('Rendering shop');
  const seedList = document.getElementById('seed-list');
  seedList.innerHTML = '';
  vegetables.forEach(veg => {
    const div = document.createElement('div');
    div.className = 'seed-item';
    const img = document.createElement('img');
    img.src = `../assets/img/plant/${veg.id}/${veg.id}_${veg.frames}.png`; // Use last frame
    img.alt = veg.name[currentLang];
    img.onerror = () => console.error(`Failed to load image: ../assets/img/plant/${veg.id}/${veg.id}_${veg.frames}.png`);
    const span = document.createElement('span');
    span.textContent = `${veg.name[currentLang]} - ${veg.price} ${langData[currentLang].coinLabel} / ${veg.piPrice} Pi`;
    const buyBtn = document.createElement('button');
    buyBtn.textContent = langData[currentLang].buyLabel;
    buyBtn.onclick = () => buySeed(veg.id);
    div.append(img, span, buyBtn);
    seedList.appendChild(div);
  });
}

function buySeed(id) {
  console.log('Buying seed:', id);
  const veg = vegetables.find(v => v.id === id);
  if (coins >= veg.price && pi >= veg.piPrice) {
    coins -= veg.price;
    pi -= veg.piPrice;
    bag.push(id);
    updateWallet();
    renderBag();
    showNotification(`${langData[currentLang].bought} ${veg.name[currentLang]}!`);
  } else {
    showNotification(langData[currentLang].notEnoughMoney);
  }
}

function renderBag() {
  console.log('Rendering bag...');
  const bagList = document.getElementById('bag-list');
  const bagIcon = document.getElementById('bag').querySelector('img');
  bagList.innerHTML = bag.length === 0 ? langData[currentLang].emptyBag : '';
  bag.forEach((seed, idx) => {
    const veg = vegetables.find(v => v.id === seed);
    const div = document.createElement('div');
    div.className = 'bag-item';
    const img = document.createElement('img');
    img.src = `../assets/img/plant/${veg.id}/${veg.id}_1.png`;
    img.alt = veg.name[currentLang];
    const span = document.createElement('span');
    span.textContent = veg.name[currentLang];
    div.append(img, span);
    bagList.appendChild(div);
  });
  bagIcon.onclick = () => {
    console.log('Toggling bag list');
    bagList.classList.toggle('show');
  };
}

function buyUpgrade(type) {
  console.log('Buying upgrade:', type);
  const costs = {
    wateringCan: { coins: 20, pi: 0.12 },
    extraPlotCoins: { coins: 80, pi: 0.48 },
    extraPlotPi: { coins: 80, pi: 0.48 },
    yieldBoost: { coins: 40, pi: 0.3 }
  };
  const cost = costs[type];
  if (coins >= cost.coins && pi >= cost.pi) {
    coins -= cost.coins;
    pi -= cost.pi;
    if (type === 'wateringCan' || type === 'yieldBoost') {
      upgrades[type] = true;
    } else if (type === 'extraPlotCoins') {
      upgrades.extraPlotCoins += 1;
      initializePlots();
    } else if (type === 'extraPlotPi') {
      upgrades.extraPlotPi += 1;
      initializePlots();
    }
    updateWallet();
    updateLeaderboard();
    showNotification(`${langData[currentLang].upgradeBought} ${type}!`);
  } else {
    showNotification(langData[currentLang].notEnoughMoney);
  }
}

function renderInventory() {
  console.log('Rendering inventory...');
  const inventoryList = document.getElementById('inventory-list');
  inventoryList.innerHTML = inventory.length === 0 ? langData[currentLang].emptyInventory : '';
  inventory.forEach(item => {
    const veg = vegetables.find(v => v.id === item.id);
    const div = document.createElement('div');
    div.className = 'inventory-item';
    const img = document.createElement('img');
    img.src = `../assets/img/plant/${veg.id}/${veg.id}_1.png`;
    img.alt = veg.name[currentLang];
    const span = document.createElement('span');
    span.textContent = `${veg.name[currentLang]}: ${item.amount}`;
    div.append(img, span);
    inventoryList.appendChild(div);
  });
}

function renderLeaderboard() {
  console.log('Rendering leaderboard...');
  const leaderboardList = document.getElementById('leaderboard-list');
  leaderboardList.innerHTML = 'Loading...';
  db.collection('leaderboard')
    .orderBy('pi', 'desc')
    .limit(5)
    .get()
    .then(snapshot => {
      leaderboardList.innerHTML = '';
      snapshot.forEach((doc, idx) => {
        const data = doc.data();
        const div = document.createElement('div');
        div.className = 'leaderboard-item';
        div.textContent = `#${idx + 1}: ${data.name} - ${data.pi.toFixed(2)} Pi`;
        leaderboardList.appendChild(div);
      });
    })
    .catch(e => {
      console.error('Leaderboard fetch failed:', e);
      leaderboardList.innerHTML = 'Failed to load leaderboard.';
    });
}

function updateLeaderboard() {
  console.log('Updating leaderboard...');
  if (!auth.currentUser) return;
  db.collection('leaderboard').doc(auth.currentUser.uid).set({
    name: playerName,
    pi: pi
  }).catch(e => console.error('Leaderboard update failed:', e));
}

function renderAchievements() {
  console.log('Rendering achievements...');
  const achievementList = document.getElementById('achievement-list');
  achievementList.innerHTML = '';
  const achievementsData = [
    { id: 'harvest10', name: langData[currentLang].achievementHarvest10, completed: achievements.harvest10 },
    { id: 'pi10', name: langData[currentLang].achievementPi10, completed: achievements.pi10 }
  ];
  achievementsData.forEach(ach => {
    const div = document.createElement('div');
    div.className = 'achievement-item';
    div.textContent = `${ach.name}: ${ach.completed ? 'Completed' : 'In Progress'}`;
    achievementList.appendChild(div);
  });
}

function checkAchievements() {
  console.log('Checking achievements...');
  if (harvestCount >= 10 && !achievements.harvest10) {
    achievements.harvest10 = true;
    showNotification(langData[currentLang].achievementUnlocked + ' ' + langData[currentLang].achievementHarvest10);
  }
  if (pi >= 10 && !achievements.pi10) {
    achievements.pi10 = true;
    showNotification(langData[currentLang].achievementUnlocked + ' ' + langData[currentLang].achievementPi10);
  }
  localStorage.setItem('achievements', JSON.stringify(achievements));
  localStorage.setItem('harvestCount', JSON.stringify(harvestCount));
  if (document.querySelector('.tab-btn.active')?.getAttribute('data-tab') === 'achievements') {
    renderAchievements();
  }
}

function checkDailyReward() {
  console.log('Checking daily reward...');
  const now = Date.now();
  const claimRewardBtn = document.getElementById('claim-reward-btn');
  if (now - lastRewardClaim >= dailyRewardCooldown) {
    claimRewardBtn.disabled = false;
  } else {
    claimRewardBtn.disabled = true;
    claimRewardBtn.textContent = langData[currentLang].rewardCooldown;
  }
}

function claimDailyReward() {
  console.log('Claiming daily reward...');
  const now = Date.now();
  if (now - lastRewardClaim < dailyRewardCooldown) {
    showNotification(langData[currentLang].rewardCooldown);
    return;
  }
  coins += 20; // 40% of 50
  pi += 0.3;  // 60% of 0.5
  lastRewardClaim = now;
  localStorage.setItem('lastRewardClaim', JSON.stringify(lastRewardClaim));
  updateWallet();
  updateLeaderboard();
  checkDailyReward();
  showNotification(`${langData[currentLang].rewardClaimed} +20 ${langData[currentLang].coinLabel}, +0.3 Pi!`);
}

function updateWallet() {
  console.log('Updating wallet...');
  document.getElementById('coin-balance').textContent = coins;
  document.getElementById('pi-balance').textContent = pi.toFixed(2);
  savePlayerData();
}

function updateLevelBar() {
  console.log('Updating level bar...');
  document.getElementById('level-display').textContent = level;
  document.getElementById('xp-display').textContent = xp;
  const progress = (xp / (xpPerLevel * level)) * 100;
  document.getElementById('xp-progress').style.width = `${progress}%`;
}

function showNotification(message) {
  console.log('Showing notification:', message);
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

function checkLevelUp() {
  console.log('Checking level up...');
  if (xp >= xpPerLevel * level) {
    level++;
    xp = 0;
    showNotification(`${langData[currentLang].levelUp} ${level}!`);
    updateLevelBar();
  }
}

setInterval(() => {
  farmPlots.forEach((plot, index) => {
    if (plot.vegetable && plot.watered) {
      plot.growth += 1;
      const veg = vegetables.find(v => v.id === plot.vegetable);
      if (plot.growth >= veg.growthTime) {
        plot.growth = veg.growthTime;
      }
      plot.watered = false;
      renderFarm();
    }
  });
}, 5000);

loadData();
