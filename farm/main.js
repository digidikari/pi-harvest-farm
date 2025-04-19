let vegetables = [];
let langData = {};
let currentLang = 'en';
let farmCoins = 0;
let pi = 0;
let water = 100; // Ubah dari 10 ke 100
let farmPlots = [];
let inventory = [];
let bag = [];
let upgrades = {
  wateringCan: false,
  extraPlot: 0,
  yieldBoost: false
};
let level = 1;
let xp = 0;
let playerName = 'Player' + Math.floor(Math.random() * 1000);
let achievements = JSON.parse(localStorage.getItem('achievements')) || {
  harvest10: false,
  farmCoin1000: false // Ubah dari farmCoin100 ke farmCoin1000
};
let harvestCount = JSON.parse(localStorage.getItem('harvestCount')) || 0;
let lastRewardClaim = JSON.parse(localStorage.getItem('lastRewardClaim')) || 0;

let musicVolume = localStorage.getItem('musicVolume') ? parseInt(localStorage.getItem('musicVolume')) : 50;
let voiceVolume = localStorage.getItem('voiceVolume') ? parseInt(localStorage.getItem('voiceVolume')) : 50;

const plotCount = 36;
const xpPerLevel = 100;
const dailyRewardCooldown = 24 * 60 * 60 * 1000;
const piToFarmRate = 10000; // Ubah dari 1000 ke 10000
const dailyReward = { farmCoins: 50, water: 5 };

const fallbackLangData = {
  "en": {
    "title": "Pi Harvest Farm",
    "startBtn": "Start Game",
    "farmTab": "Farm",
    "shopTab": "Shop",
    "upgradesTab": "Upgrades",
    "inventoryTab": "Inventory",
    "exchangeTab": "Exchange",
    "leaderboardTab": "Leaderboard",
    "achievementsTab": "Achievements",
    "coinLabel": "Farm Coins",
    "buyLabel": "Buy",
    "sellLabel": "Sell",
    "emptyBag": "Bag is empty!",
    "emptyInventory": "Inventory is empty!",
    "notEnoughMoney": "Not enough money!",
    "notEnoughWater": "Not enough water!",
    "bought": "Bought",
    "sold": "Sold",
    "harvested": "Harvested",
    "upgradeBought": "Upgrade bought",
    "levelUp": "Level up to",
    "claimRewardBtn": "Claim Daily Reward",
    "rewardClaimed": "Daily Reward Claimed!",
    "rewardCooldown": "Reward Available Tomorrow!",
    "achievementHarvest10": "Harvest 10 Plants",
    "achievementFarmCoin1000": "Collect 1000 Farm Coins", // Ubah dari farmCoin100 ke farmCoin1000
    "achievementUnlocked": "Achievement Unlocked!",
    "convertSuccess": "Exchange successful!",
    "exchangeBtn": "Exchange"
  },
  "id": {
    "title": "Pi Harvest Farm",
    "startBtn": "Mulai Permainan",
    "farmTab": "Ladang",
    "shopTab": "Toko",
    "upgradesTab": "Peningkatan",
    "inventoryTab": "Inventaris",
    "exchangeTab": "Penukaran",
    "leaderboardTab": "Papan Peringkat",
    "achievementsTab": "Pencapaian",
    "coinLabel": "Koin Ladang",
    "buyLabel": "Beli",
    "sellLabel": "Jual",
    "emptyBag": "Tas kosong!",
    "emptyInventory": "Inventaris kosong!",
    "notEnoughMoney": "Uang tidak cukup!",
    "notEnoughWater": "Air tidak cukup!",
    "bought": "Dibeli",
    "sold": "Dijual",
    "harvested": "Dipanen",
    "upgradeBought": "Peningkatan dibeli",
    "levelUp": "Naik level ke",
    "claimRewardBtn": "Klaim Hadiah Harian",
    "rewardClaimed": "Hadiah Harian Diklaim!",
    "rewardCooldown": "Hadiah Tersedia Besok!",
    "achievementHarvest10": "Panen 10 Tanaman",
    "achievementFarmCoin1000": "Kumpulkan 1000 Koin Ladang", // Ubah dari farmCoin100 ke farmCoin1000
    "achievementUnlocked": "Pencapaian Dibuka!",
    "convertSuccess": "Penukaran berhasil!",
    "exchangeBtn": "Tukar"
  }
};

const fallbackVegetables = [
  { id: "beet", name: { en: "Beet", id: "Bit" }, farmPrice: 500, piPrice: 0.05, growthTime: 10, frames: 13, yield: 15, image: "assets/img/plant/beet/beet_13.png" },
  { id: "cabbage", name: { en: "Cabbage", id: "Kol" }, farmPrice: 550, piPrice: 0.055, growthTime: 12, frames: 20, yield: 25, image: "assets/img/plant/cabbage/cabbage_20.png" },
  { id: "carrot", name: { en: "Carrot", id: "Wortel" }, farmPrice: 520, piPrice: 0.052, growthTime: 8, frames: 16, yield: 20, image: "assets/img/plant/carrot/carrot_16.png" },
  { id: "corn", name: { en: "Corn", id: "Jagung" }, farmPrice: 600, piPrice: 0.06, growthTime: 15, frames: 20, yield: 30, image: "assets/img/plant/corn/corn_20.png" },
  { id: "cucumber", name: { en: "Cucumber", id: "Timun" }, farmPrice: 530, piPrice: 0.053, growthTime: 10, frames: 20, yield: 22, image: "assets/img/plant/cucumber/cucumber_20.png" },
  { id: "eggplant", name: { en: "Eggplant", id: "Terong" }, farmPrice: 570, piPrice: 0.057, growthTime: 12, frames: 9, yield: 28, image: "assets/img/plant/eggplant/eggplant_9.png" },
  { id: "lettuce", name: { en: "Lettuce", id: "Selada" }, farmPrice: 510, piPrice: 0.051, growthTime: 8, frames: 7, yield: 20, image: "assets/img/plant/lettuce/lettuce_7.png" },
  { id: "onion", name: { en: "Onion", id: "Bawang" }, farmPrice: 500, piPrice: 0.05, growthTime: 7, frames: 6, yield: 18, image: "assets/img/plant/onion/onion_6.png" },
  { id: "peas", name: { en: "Peas", id: "Kacang Polong" }, farmPrice: 520, piPrice: 0.052, growthTime: 9, frames: 8, yield: 20, image: "assets/img/plant/peas/peas_8.png" },
  { id: "pepper", name: { en: "Pepper", id: "Paprika" }, farmPrice: 550, piPrice: 0.055, growthTime: 11, frames: 12, yield: 25, image: "assets/img/plant/pepper/pepper_12.png" },
  { id: "potato", name: { en: "Potato", id: "Kentang" }, farmPrice: 530, piPrice: 0.053, growthTime: 10, frames: 7, yield: 22, image: "assets/img/plant/potato/potato_7.png" },
  { id: "pumpkin", name: { en: "Pumpkin", id: "Labu" }, farmPrice: 650, piPrice: 0.065, growthTime: 15, frames: 20, yield: 35, image: "assets/img/plant/pumpkin/pumpkin_20.png" },
  { id: "radish", name: { en: "Radish", id: "Lobak" }, farmPrice: 500, piPrice: 0.05, growthTime: 7, frames: 8, yield: 18, image: "assets/img/plant/radish/radish_8.png" },
  { id: "spinach", name: { en: "Spinach", id: "Bayam" }, farmPrice: 500, piPrice: 0.05, growthTime: 6, frames: 5, yield: 15, image: "assets/img/plant/spinach/spinach_5.png" },
  { id: "tomato", name: { en: "Tomato", id: "Tomat" }, farmPrice: 530, piPrice: 0.053, growthTime: 10, frames: 20, yield: 22, image: "assets/img/plant/tomato/tomato_20.png" },
  { id: "watermelon", name: { en: "Watermelon", id: "Semangka" }, farmPrice: 700, piPrice: 0.07, growthTime: 18, frames: 19, yield: 40, image: "assets/img/plant/watermelon/watermelon_19.png" },
  { id: "wheat", name: { en: "Wheat", id: "Gandum" }, farmPrice: 570, piPrice: 0.057, growthTime: 12, frames: 7, yield: 28, image: "assets/img/plant/wheat/wheat_7.png" },
  { id: "water", name: { en: "Water", id: "Air" }, farmPrice: 10, piPrice: 0.001, amount: 10 }
];

// Initialize game on DOM load
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

    if (!startText) throw new Error('Start text element not found');
    if (!langToggle) throw new Error('Language toggle button not found');
    if (!settingsBtn) throw new Error('Settings button not found');
    if (!claimRewardBtn) throw new Error('Claim reward button not found');
    if (!gameLangToggle) throw new Error('Game language toggle button not found');
    if (!gameSettingsBtn) throw new Error('Game settings button not found');
    if (!exitGameBtn) throw new Error('Exit game button not found');

    startText.addEventListener('click', startGame);
    langToggle.addEventListener('click', toggleLanguage);
    settingsBtn.addEventListener('click', openSettings);
    claimRewardBtn.addEventListener('click', claimDailyReward);
    gameLangToggle.addEventListener('click', toggleLanguage);
    gameSettingsBtn.addEventListener('click', openSettings);
    exitGameBtn.addEventListener('click', exitGame);

    console.log('Event listeners attached for start, lang, settings, claim reward, game-lang, game-settings, and exit');

    document.querySelectorAll('.tab-btn').forEach(btn => {
      const tab = btn.getAttribute('data-tab');
      btn.addEventListener('click', () => switchTab(tab));
    });
    console.log('Tab button listeners attached');

    // Play BGM and BGV at initial screen load
    const bgMusic = document.getElementById('bg-music');
    const bgVoice = document.getElementById('bg-voice');
    if (bgMusic) {
      console.log('Attempting to play BGM at:', bgMusic.src);
      bgMusic.volume = musicVolume / 100;
      bgMusic.play().catch(e => console.warn('Background music failed to play:', e.message));
    } else {
      console.warn('Background music element not found');
    }
    if (bgVoice) {
      console.log('Attempting to play BGV at:', bgVoice.src);
      bgVoice.volume = voiceVolume / 100;
      bgVoice.play().catch(e => console.warn('Background voice failed to play:', e.message));
    } else {
      console.warn('Background voice element not found');
    }

    loadData();
    initializeSettings();
    updateVolumes();
    console.log('Game initialization complete');
  } catch (e) {
    console.error('Initialization failed:', e.message);
    alert('Failed to initialize game. Check console for errors.');
  }
});

// Load JSON data with fallback
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
    vegetables = fallbackVegetables;
    console.log('Using fallback vegetables data:', vegetables);
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

// Initialize game state
function initializeGame() {
  console.log('Initializing game...');
  try {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      currentLang = savedLang;
      const langToggle = document.getElementById('lang-toggle');
      const gameLangToggle = document.getElementById('game-lang-toggle');
      if (langToggle) {
        langToggle.textContent = `Switch Language (${currentLang === 'en' ? 'ID' : 'EN'})`;
      }
      if (gameLangToggle) {
        gameLangToggle.textContent = `Switch Language (${currentLang === 'en' ? 'ID' : 'EN'})`;
      }
      console.log('Language set to:', currentLang);
    }
    loadPlayerData();
    updateUIText();
    initializePlots();
    renderShop();
    renderInventory();
    renderSellSection();
    updateWallet();
    updateLevelBar();
    renderBag();
    renderAchievements();
    checkDailyReward();
    console.log('Game initialized successfully');
  } catch (e) {
    console.error('Initialize game failed:', e.message);
    alert('Failed to initialize game. Check console for details.');
  }
}

// Start the game
function startGame() {
  console.log('Starting game...');
  try {
    const startScreen = document.getElementById('start-screen');
    const gameContainer = document.getElementById('game-container');
    if (!startScreen || !gameContainer) throw new Error('Start screen or game container not found');

    startScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    console.log('Switched from start screen to game container');

    switchTab('farm');
    console.log('Switched to Farm tab');

    playMenuSound();
    console.log('Game started successfully');
  } catch (e) {
    console.error('Start game failed:', e.message);
    alert('Failed to start game. Check console for errors.');
  }
}

// Exit game (back to start screen)
function exitGame() {
  console.log('Exiting game...');
  try {
    const startScreen = document.getElementById('start-screen');
    const gameContainer = document.getElementById('game-container');
    const settingsModal = document.getElementById('settings-modal');
    if (!startScreen || !gameContainer) throw new Error('Start screen or game container not found');

    gameContainer.style.display = 'none';
    startScreen.style.display = 'flex';
    if (settingsModal) settingsModal.classList.remove('active'); // Close settings modal
    console.log('Switched from game container to start screen');

    playMenuSound();
    console.log('Game exited successfully');
  } catch (e) {
    console.error('Exit game failed:', e.message);
    alert('Failed to exit game. Check console for errors.');
  }
}

// Toggle language
function toggleLanguage() {
  console.log('Toggling language...');
  try {
    currentLang = currentLang === 'en' ? 'id' : 'en';
    localStorage.setItem('lang', currentLang);
    console.log('Language switched to:', currentLang);

    const langToggle = document.getElementById('lang-toggle');
    const gameLangToggle = document.getElementById('game-lang-toggle');
    if (langToggle) {
      langToggle.textContent = `Switch Language (${currentLang === 'en' ? 'ID' : 'EN'})`;
      console.log('Start screen language toggle button updated');
    }
    if (gameLangToggle) {
      gameLangToggle.textContent = `Switch Language (${currentLang === 'en' ? 'ID' : 'EN'})`;
      console.log('Game screen language toggle button updated');
    }

    updateUIText();
    renderShop();
    renderSellSection();
    playMenuSound();
    console.log('Language toggled successfully');
  } catch (e) {
    console.error('Toggle language failed:', e.message);
    alert('Failed to toggle language. Check console for errors.');
  }
}

// Update UI text
function updateUIText() {
  console.log('Updating UI text...');
  try {
    if (!langData[currentLang]) {
      langData = fallbackLangData;
      console.log('langData was empty, using fallbackLangData');
    }

    const elements = {
      title: document.getElementById('title'),
      startText: document.getElementById('start-text'),
      gameTitle: document.getElementById('game-title'),
      shopTitle: document.getElementById('shop-title'),
      upgradesTitle: document.getElementById('upgrades-title'),
      inventoryTitle: document.getElementById('inventory-title'),
      exchangeTitle: document.getElementById('exchange-title'),
      leaderboardTitle: document.getElementById('leaderboard-title'),
      achievementsTitle: document.getElementById('achievements-title'),
      claimRewardBtn: document.getElementById('claim-reward-btn'),
      exchangeBtn: document.getElementById('exchange-btn'),
      coinLabel: document.getElementById('coin-label')
    };

    if (elements.title) elements.title.textContent = langData[currentLang].title || 'Pi Harvest Farm';
    if (elements.startText) elements.startText.textContent = langData[currentLang].startBtn || 'Start Game';
    if (elements.gameTitle) elements.gameTitle.textContent = langData[currentLang].title || 'Pi Harvest Farm';
    if (elements.shopTitle) elements.shopTitle.textContent = langData[currentLang].shopTab || 'Shop';
    if (elements.upgradesTitle) elements.upgradesTitle.textContent = langData[currentLang].upgradesTab || 'Upgrades';
    if (elements.inventoryTitle) elements.inventoryTitle.textContent = langData[currentLang].inventoryTab || 'Inventory';
    if (elements.exchangeTitle) elements.exchangeTitle.textContent = langData[currentLang].exchangeTab || 'Exchange';
    if (elements.leaderboardTitle) elements.leaderboardTitle.textContent = langData[currentLang].leaderboardTab || 'Leaderboard';
    if (elements.achievementsTitle) elements.achievementsTitle.textContent = langData[currentLang].achievementsTab || 'Achievements';
    if (elements.claimRewardBtn) elements.claimRewardBtn.textContent = langData[currentLang].claimRewardBtn || 'Claim Daily Reward';
    if (elements.exchangeBtn) elements.exchangeBtn.textContent = langData[currentLang].exchangeBtn || 'Tukar';
    if (elements.coinLabel) elements.coinLabel.textContent = langData[currentLang].coinLabel || 'Farm Coins';

    const tabs = ['farmTab', 'shopTab', 'upgradesTab', 'inventoryTab', 'exchangeTab', 'leaderboardTab', 'achievementsTab'];
    document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
      btn.textContent = langData[currentLang][tabs[idx]] || tabs[idx];
      console.log(`Tab ${tabs[idx]} updated to:`, btn.textContent);
    });

    const activeTab = document.querySelector('.tab-btn.active')?.getAttribute('data-tab');
    if (activeTab) switchTab(activeTab);
    console.log('UI text updated successfully');
  } catch (e) {
    console.error('Update UI text failed:', e.message);
    alert('Failed to update UI text. Check console for details.');
  }
}

// Open settings modal
function openSettings() {
  console.log('Opening settings...');
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.classList.add('active');
    console.log('Settings modal opened');
  } else {
    console.error('Settings modal not found');
  }
}

// Initialize settings
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
    console.log('Settings sliders initialized');

    closeBtn.addEventListener('click', closeSettings);
    window.addEventListener('click', closeSettingsOnWindowClick);

    function closeSettings() {
      console.log('Closing settings modal');
      modal.classList.remove('active');
      playMenuSound();
      console.log('Settings modal closed');
    }

    function closeSettingsOnWindowClick(event) {
      if (event.target === modal) {
        console.log('Closing settings modal via window click');
        modal.classList.remove('active');
        playMenuSound();
        console.log('Settings modal closed via window click');
      }
    }

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

    console.log('Settings initialized successfully');
  } catch (e) {
    console.error('Initialize settings failed:', e.message);
    alert('Failed to initialize settings. Check console for errors.');
  }
}

// Load player data
function loadPlayerData() {
  console.log('Loading player data...');
  // Reset nilai awal kalau belum ada di localStorage
  farmCoins = localStorage.getItem('farmCoins') ? parseInt(localStorage.getItem('farmCoins')) : 100;
  pi = localStorage.getItem('pi') ? parseFloat(localStorage.getItem('pi')) : 0;
  water = localStorage.getItem('water') ? parseInt(localStorage.getItem('water')) : 100;
  level = localStorage.getItem('level') ? parseInt(localStorage.getItem('level')) : 1;
  xp = localStorage.getItem('xp') ? parseInt(localStorage.getItem('xp')) : 0;
  inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  // Reset localStorage kalau nilai awal gak sesuai
  if (!localStorage.getItem('farmCoins')) {
    farmCoins = 100;
    localStorage.setItem('farmCoins', farmCoins);
  }
  if (!localStorage.getItem('water')) {
    water = 100;
    localStorage.setItem('water', water);
  }
  console.log('Player data loaded:', { farmCoins, pi, water, level, xp, inventory });
}

// Switch between tabs
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

    // Pastikan render konten tiap tab
    if (tab === 'shop') {
      renderShop();
      renderSellSection();
    } else if (tab === 'inventory') {
      renderInventory();
    } else if (tab === 'achievements') {
      renderAchievements();
    }

    playMenuSound();
  } catch (e) {
    console.error('Switch tab failed:', e.message);
    alert('Failed to switch tab. Check console for details.');
  }
}

// Initialize farm plots
function initializePlots() {
const plotCount = 36; // 6x6 = 36 plot

function initializePlots() {
  console.log('Initializing plots...');
  const farmArea = document.getElementById('farm-area');
  if (!farmArea) {
    console.error('Farm area element not found');
    return;
  }

  farmPlots = [];
  farmArea.innerHTML = ''; // Bersihin plot lama
  for (let i = 0; i < plotCount; i++) {
    const plot = document.createElement('div');
    plot.classList.add('plot');
    plot.addEventListener('click', () => handlePlotClick(i));
    farmArea.appendChild(plot);
    farmPlots.push({ planted: false, vegetable: null, progress: 0, watered: false });
  }
  console.log('Plots initialized:', farmPlots);
}

// Handle plot click (planting, watering, harvesting)
function handlePlotClick(index) {
  console.log(`Plot ${index} clicked...`);
  const plot = farmPlots[index];
  const plotElement = document.querySelectorAll('.plot')[index];

  if (!plot.planted) {
    // Cek apakah ada Seed di bag
    const seedIndex = bag.findIndex(item => item.includes('Seed'));
    if (seedIndex !== -1) {
      // Tanam sayuran (default Beet)
      const vegetable = vegetables.find(veg => veg.id === "beet");
      plot.planted = true;
      plot.vegetable = vegetable;
      plot.progress = 0;
      plot.watered = false;
      plotElement.innerHTML = `<img src="${vegetable.image}" class="plant-img">`;
      // Kurangi Seed dari bag
      bag.splice(seedIndex, 1);
      renderBag();
      showNotification(langData[currentLang].bought);
      playBuyingSound();
      console.log(`Planted ${vegetable.name[currentLang]} at plot ${index}`);
    } else {
      showNotification("No Seeds in bag!");
    }
  } else if (plot.planted && !plot.watered) {
    // Cek apakah ada Water di bag
    const waterIndex = bag.findIndex(item => item.includes('Water'));
    if (waterIndex !== -1 && water > 0) {
      plot.watered = true;
      water--;
      updateWallet();
      plotElement.classList.add('ready');
      // Kurangi Water dari bag
      const waterItem = bag[waterIndex];
      const waterAmount = parseInt(waterItem.split('x')[1]);
      if (waterAmount > 1) {
        bag[waterIndex] = `Water x${waterAmount - 1}`;
      } else {
        bag.splice(waterIndex, 1);
      }
      renderBag();
      playWateringSound();
      console.log(`Watered plot ${index}`);
    } else {
      showNotification(langData[currentLang].notEnoughWater);
    }
  } else if (plot.planted && plot.watered) {
    // Panen
    inventory.push({ vegetable: plot.vegetable, quantity: plot.vegetable.yield });
    localStorage.setItem('inventory', JSON.stringify(inventory));
    plot.planted = false;
    plot.vegetable = null;
    plot.progress = 0;
    plot.watered = false;
    plotElement.innerHTML = '';
    plotElement.classList.remove('ready');
    harvestCount++;
    localStorage.setItem('harvestCount', harvestCount);
    checkHarvestAchievement();
    showNotification(langData[currentLang].harvested);
    playHarvestSound();
    renderInventory();
    renderSellSection();
    console.log(`Harvested plot ${index}, added to inventory:`, inventory);
  }
}
  } else if (water <= 0) {
    showNotification(langData[currentLang].notEnoughWater);
  }
}

// Render shop (seeds for buying)
function renderShop() {
  console.log('Rendering shop...');
  const seedList = document.getElementById('seed-list');
  if (!seedList) {
    console.error('Seed list element not found');
    return;
  }

  seedList.innerHTML = vegetables
    .filter(veg => veg.id !== 'water')
    .map(veg => `
      <div class="seed-item">
        <img src="${veg.image}" alt="${veg.name[currentLang]}">
        <span>${veg.name[currentLang]} - ${veg.farmPrice} ${langData[currentLang].coinLabel} / ${veg.piPrice} Pi</span>
        <button onclick="buySeed('${veg.id}', 'farm')">${langData[currentLang].buyLabel} (Farm)</button>
        <button onclick="buySeed('${veg.id}', 'pi')">${langData[currentLang].buyLabel} (Pi)</button>
      </div>
    `).join('');
  console.log('Shop rendered with vegetables');
}

// Render sell section in shop
function renderSellSection() {
  console.log('Rendering sell section...');
  const sellList = document.getElementById('sell-list');
  if (!sellList) {
    console.error('Sell list element not found');
    return;
  }

  if (inventory.length === 0) {
    sellList.innerHTML = `<span>${langData[currentLang].emptyInventory}</span>`;
  } else {
    sellList.innerHTML = inventory.map((item, index) => `
      <div class="sell-item">
        <img src="${item.vegetable.image}" alt="${item.vegetable.name[currentLang]}">
        <span>${item.vegetable.name[currentLang]} x${item.quantity} - ${item.vegetable.farmPrice / 2} ${langData[currentLang].coinLabel}</span>
        <button onclick="sellItem(${index})">${langData[currentLang].sellLabel}</button>
      </div>
    `).join('');
  }
  console.log('Sell section rendered:', inventory);
}

// Buy a seed
function buySeed(vegId, currency) {
  console.log(`Buying seed ${vegId} with ${currency}...`);
  const vegetable = vegetables.find(veg => veg.id === vegId);
  const cost = currency === 'farm' ? vegetable.farmPrice : vegetable.piPrice;

  if (currency === 'farm' && farmCoins >= cost) {
    farmCoins -= cost;
    bag.push(`Seed x1`);
    updateWallet();
    showNotification(langData[currentLang].bought);
    showTransactionAnimation(`-${cost}`, 'decrease');
    playBuyingSound();
    renderBag();
  } else if (currency === 'pi' && pi >= cost) {
    pi -= cost;
    bag.push(`Seed x1`);
    updateWallet();
    showNotification(langData[currentLang].bought);
    showTransactionAnimation(`-${cost}`, 'decrease');
    playBuyingSound();
    renderBag();
  } else {
    showNotification(langData[currentLang].notEnoughMoney);
  }
  console.log(`Bought seed ${vegId}:`, bag);
}

// Sell an item from inventory
function sellItem(index) {
  console.log(`Selling item at index ${index}...`);
  const item = inventory[index];
  const sellPrice = item.vegetable.farmPrice / 2 * item.quantity;

  farmCoins += sellPrice;
  inventory.splice(index, 1);
  localStorage.setItem('inventory', JSON.stringify(inventory));
  updateWallet();
  showNotification(langData[currentLang].sold);
  showTransactionAnimation(`+${sellPrice}`, 'increase');
  playCoinSound();
  renderInventory();
  renderSellSection();
  console.log(`Sold item at index ${index}, gained ${sellPrice} Farm Coins`);
}

// Render inventory
function renderInventory() {
  console.log('Rendering inventory...');
  const inventoryList = document.getElementById('inventory-list');
  if (!inventoryList) {
    console.error('Inventory list element not found');
    return;
  }

  if (inventory.length === 0) {
    inventoryList.innerHTML = `<span>${langData[currentLang].emptyInventory}</span>`;
  } else {
    inventoryList.innerHTML = inventory.map(item => `
      <div class="inventory-item">
        <img src="${item.vegetable.image}" alt="${item.vegetable.name[currentLang]}">
        <span>${item.vegetable.name[currentLang]} x${item.quantity}</span>
      </div>
    `).join('');
  }
  console.log('Inventory rendered:', inventory);
}

// Update wallet display
function updateWallet() {
  console.log('Updating wallet...');
  const coinBalance = document.getElementById('coin-balance');
  const piBalance = document.getElementById('pi-balance');
  const waterBalance = document.getElementById('water-balance');

  if (coinBalance) coinBalance.textContent = farmCoins;
  if (piBalance) piBalance.textContent = pi.toFixed(2);
  if (waterBalance) waterBalance.textContent = water;

  localStorage.setItem('farmCoins', farmCoins);
  localStorage.setItem('pi', pi);
  localStorage.setItem('water', water);

  checkFarmCoinAchievement();
  console.log('Wallet updated:', { farmCoins, pi, water });
}

// Update level bar
function updateLevelBar() {
  console.log('Updating level bar...');
  const levelDisplay = document.getElementById('level-display');
  const xpDisplay = document.getElementById('xp-display');
  const xpProgress = document.getElementById('xp-progress');

  if (levelDisplay) levelDisplay.textContent = level;
  if (xpDisplay) xpDisplay.textContent = xp;
  if (xpProgress) xpProgress.style.width = `${(xp / xpPerLevel) * 100}%`;

  localStorage.setItem('level', level);
  localStorage.setItem('xp', xp);
  console.log('Level bar updated:', { level, xp });
}

// Render bag (open/close bag)
function renderBag() {
  console.log('Rendering bag...');
  const bagIcon = document.querySelector('#bag img');
  const bagList = document.getElementById('bag-list');

  if (!bagIcon || !bagList) {
    console.error('Bag elements not found');
    return;
  }

  bagIcon.addEventListener('click', () => {
    bagList.classList.toggle('show');
    if (bagList.classList.contains('show')) {
      if (bag.length === 0) {
        bagList.innerHTML = `<span>${langData[currentLang].emptyBag}</span>`;
      } else {
        bagList.innerHTML = bag.map(item => `<div class="bag-item">${item}</div>`).join('');
      }
    }
    playMenuSound();
    console.log('Bag toggled:', bagList.classList.contains('show') ? 'open' : 'closed');
  });

  bag = ['Seed x1', 'Water x2'];
  console.log('Bag initialized with sample items:', bag);
}

// Render achievements
function renderAchievements() {
  console.log('Rendering achievements...');
  const achievementList = document.getElementById('achievement-list');
  if (!achievementList) {
    console.error('Achievement list element not found');
    return;
  }

  achievementList.innerHTML = `
    <div class="achievement-item">
      <span>${langData[currentLang].achievementHarvest10}</span>
      <span>${achievements.harvest10 ? '✅' : '❌'}</span>
    </div>
    <div class="achievement-item">
      <span>${langData[currentLang].achievementFarmCoin1000}</span>
      <span>${achievements.farmCoin1000 ? '✅' : '❌'}</span>
    </div>
  `;
  console.log('Achievements rendered:', achievements);
}

// Check Harvest achievement (10 plants)
function checkHarvestAchievement() {
  if (harvestCount >= 10 && !achievements.harvest10) {
    achievements.harvest10 = true;
    localStorage.setItem('achievements', JSON.stringify(achievements));
    showNotification(langData[currentLang].achievementUnlocked);
    console.log('Achievement unlocked: Harvest 10 Plants');
  }
}

// Check Farm Coins achievement (1000 Farm Coins)
function checkFarmCoinAchievement() {
  if (farmCoins >= 1000 && !achievements.farmCoin1000) {
    achievements.farmCoin1000 = true;
    localStorage.setItem('achievements', JSON.stringify(achievements));
    showNotification(langData[currentLang].achievementUnlocked);
    console.log('Achievement unlocked: Collect 1000 Farm Coins');
  }
}

// Check daily reward availability
function checkDailyReward() {
  console.log('Checking daily reward...');
  const claimRewardBtn = document.getElementById('claim-reward-btn');
  if (!claimRewardBtn) {
    console.error('Claim reward button not found');
    return;
  }

  const now = Date.now();
  if (now - lastRewardClaim < dailyRewardCooldown) {
    claimRewardBtn.disabled = true;
    claimRewardBtn.textContent = langData[currentLang].rewardCooldown;
  } else {
    claimRewardBtn.disabled = false;
    claimRewardBtn.textContent = langData[currentLang].claimRewardBtn;
  }
  console.log('Daily reward checked:', { lastRewardClaim, now });
}

// Claim daily reward
function claimDailyReward() {
  console.log('Claiming daily reward...');
  const claimRewardBtn = document.getElementById('claim-reward-btn');
  if (!claimRewardBtn) {
    console.error('Claim reward button not found');
    return;
  }

  const now = Date.now();
  if (now - lastRewardClaim < dailyRewardCooldown) {
    showNotification(langData[currentLang].rewardCooldown);
    return;
  }

  farmCoins += dailyReward.farmCoins;
  water += dailyReward.water;
  lastRewardClaim = now;

  localStorage.setItem('lastRewardClaim', lastRewardClaim);
  updateWallet();
  checkDailyReward();

  showNotification(langData[currentLang].rewardClaimed);
  showTransactionAnimation(`+${dailyReward.farmCoins}`, 'increase');
  playCoinSound();
  console.log('Daily reward claimed:', dailyReward);
}

// Show notification
function showNotification(message) {
  const notification = document.getElementById('notification');
  if (!notification) {
    console.error('Notification element not found');
    return;
  }

  notification.textContent = message;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
  console.log('Notification shown:', message);
}

// Show transaction animation
function showTransactionAnimation(text, type) {
  const animation = document.createElement('div');
  animation.classList.add('transaction-animation', type);
  animation.textContent = text;
  document.body.appendChild(animation);
  setTimeout(() => animation.remove(), 1500);
  console.log(`Transaction animation shown: ${text} (${type})`);
}

// Play menu sound
function playMenuSound() {
  console.log('Playing menu sound...');
  const menuSound = document.getElementById('menu-sound');
  if (menuSound) {
    console.log('Attempting to play menu sound at:', menuSound.src);
    menuSound.volume = voiceVolume / 100;
    menuSound.play().catch(e => console.warn('Menu sound failed to play:', e.message));
  }
}

// Play coin sound
function playCoinSound() {
  console.log('Playing coin sound...');
  const coinSound = document.getElementById('coin-sound');
  if (coinSound) {
    console.log('Attempting to play coin sound at:', coinSound.src);
    coinSound.volume = voiceVolume / 100;
    coinSound.play().catch(e => console.warn('Coin sound failed to play:', e.message));
  }
}

// Play buying sound
function playBuyingSound() {
  console.log('Playing buying sound...');
  const buyingSound = document.getElementById('buying-sound');
  if (buyingSound) {
    console.log('Attempting to play buying sound at:', buyingSound.src);
    buyingSound.volume = voiceVolume / 100;
    buyingSound.play().catch(e => console.warn('Buying sound failed to play:', e.message));
  }
}

// Play watering sound
function playWateringSound() {
  console.log('Playing watering sound...');
  const wateringSound = document.getElementById('watering-sound');
  if (wateringSound) {
    console.log('Attempting to play watering sound at:', wateringSound.src);
    wateringSound.volume = voiceVolume / 100;
    wateringSound.play().catch(e => console.warn('Watering sound failed to play:', e.message));
  }
}

// Play harvest sound
function playHarvestSound() {
  console.log('Playing harvest sound...');
  const harvestSound = document.getElementById('harvest-sound');
  if (harvestSound) {
    console.log('Attempting to play harvest sound at:', harvestSound.src);
    harvestSound.volume = voiceVolume / 100;
    harvestSound.play().catch(e => console.warn('Harvest sound failed to play:', e.message));
  }
}

// Update audio volumes
function updateVolumes() {
  console.log('Updating volumes...');
  const bgMusic = document.getElementById('bg-music');
  const bgVoice = document.getElementById('bg-voice');
  if (bgMusic) bgMusic.volume = musicVolume / 100;
  if (bgVoice) bgVoice.volume = voiceVolume / 100;
  console.log('Volumes updated:', { musicVolume, voiceVolume });
}

// Convert currency
function convertCurrency() {
  console.log('Converting currency...');
  const farmToPiInput = document.getElementById('farm-to-pi');
  const piToFarmInput = document.getElementById('pi-to-farm');

  if (farmToPiInput.value) {
    const farmAmount = parseInt(farmToPiInput.value);
    if (farmAmount <= farmCoins) {
      const piAmount = farmAmount / piToFarmRate;
      farmCoins -= farmAmount;
      pi += piAmount;
      updateWallet();
      showNotification(langData[currentLang].convertSuccess);
      showTransactionAnimation(`-${farmAmount}`, 'decrease');
      playCoinSound();
      farmToPiInput.value = '';
      piToFarmInput.value = '';
    } else {
      showNotification(langData[currentLang].notEnoughMoney);
    }
  } else if (piToFarmInput.value) {
    const piAmount = parseFloat(piToFarmInput.value);
    if (piAmount <= pi) {
      const farmAmount = piAmount * piToFarmRate;
      pi -= piAmount;
      farmCoins += farmAmount;
      updateWallet();
      showNotification(langData[currentLang].convertSuccess);
      showTransactionAnimation(`+${farmAmount}`, 'increase');
      playCoinSound();
      farmToPiInput.value = '';
      piToFarmInput.value = '';
    } else {
      showNotification(langData[currentLang].notEnoughMoney);
    }
  }
  console.log('Currency converted:', { farmCoins, pi });
}

// Buy upgrade
function buyUpgrade(type, currency) {
  console.log(`Buying upgrade ${type} with ${currency}...`);
  const costs = {
    wateringCan: { farm: 100, pi: 0.12 },
    extraPlot: { farm: 400, pi: 0.48 },
    yieldBoost: { farm: 200, pi: 0.3 }
  };

  const cost = costs[type][currency === 'farm' ? 'farm' : 'pi'];
  if (currency === 'farm' && farmCoins >= cost) {
    farmCoins -= cost;
    upgrades[type] = type === 'extraPlot' ? upgrades.extraPlot + 1 : true;
    updateWallet();
    showNotification(langData[currentLang].upgradeBought);
    showTransactionAnimation(`-${cost}`, 'decrease');
    playBuyingSound();
  } else if (currency === 'pi' && pi >= cost) {
    pi -= cost;
    upgrades[type] = type === 'extraPlot' ? upgrades.extraPlot + 1 : true;
    updateWallet();
    showNotification(langData[currentLang].upgradeBought);
    showTransactionAnimation(`-${cost}`, 'decrease');
    playBuyingSound();
  } else {
    showNotification(langData[currentLang].notEnoughMoney);
  }
  console.log('Upgrade bought:', upgrades);
}
