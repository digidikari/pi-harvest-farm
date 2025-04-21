// Game state
let coins = parseInt(localStorage.getItem('coins')) || 0;
let water = parseInt(localStorage.getItem('water')) || 0;
let pi = parseFloat(localStorage.getItem('pi')) || 0;
let level = parseInt(localStorage.getItem('level')) || 1;
let xp = parseInt(localStorage.getItem('xp')) || 0;
let harvestCount = parseInt(localStorage.getItem('harvestCount')) || 0;
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let farmPlots = JSON.parse(localStorage.getItem('farmPlots')) || [];
let currentLang = localStorage.getItem('currentLang') || 'en';
let langData = {};
let vegetables = [];

// Audio elements
const backgroundMusic = document.getElementById('background-music');
const buyingSound = document.getElementById('buying-sound');
const wateringSound = document.getElementById('watering-sound');
const harvestSound = document.getElementById('harvest-sound');
const upgradeSound = document.getElementById('upgrade-sound');

// Load assets (images, audio, language data)
function loadAssets(callback) {
  console.log('Starting to load assets...');
  
  // Load language data
  fetch('data/lang.json')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load data/lang.json');
      return response.json();
    })
    .then(data => {
      console.log('Language data loaded:', data);
      langData = data;
      document.getElementById('loading-text').innerText = langData[currentLang].loading || 'Loading...';
      document.getElementById('lang-btn').innerText = langData[currentLang].switchLang || 'Switch Language (EN/ID)';
      document.getElementById('game-title').innerText = langData[currentLang].title || 'Pi Harvest Farm';
      document.getElementById('start-btn').innerText = langData[currentLang].start || 'Start Game';
      
      // Load vegetables data
      return fetch('data/vegetables.json');
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to load data/vegetables.json');
      return response.json();
    })
    .then(data => {
      console.log('Vegetables data loaded:', data);
      vegetables = data;
      
      // Preload audio
      const audioPromises = [
        loadAudio(backgroundMusic, 'assets/sfx/music/main-bgm.mp3'),
        loadAudio(buyingSound, 'assets/sfx/voice/buying-bgv.mp3'),
        loadAudio(wateringSound, 'assets/sfx/voice/watering-bgv.mp3'),
        loadAudio(harvestSound, 'assets/sfx/voice/harvesting-bgv.mp3'),
        loadAudio(upgradeSound, 'assets/sfx/voice/coin-bgv.mp3')
      ];
      
      return Promise.all(audioPromises);
    })
    .then(() => {
      console.log('All audio loaded successfully');
      callback();
    })
    .catch(error => {
      console.error('Error loading assets:', error);
      document.getElementById('loading-text').innerText = 'Error loading assets. Please refresh.';
    });
}

function loadAudio(audioElement, src) {
  return new Promise((resolve, reject) => {
    audioElement.src = src;
    audioElement.onloadeddata = () => {
      console.log(`Audio loaded: ${src}`);
      resolve();
    };
    audioElement.onerror = () => {
      console.error(`Failed to load audio: ${src}`);
      reject(new Error(`Failed to load audio: ${src}`));
    };
  });
}

// Initialize farm plots
function initializePlots() {
  console.log('Initializing plots...');
  if (farmPlots.length === 0) {
    for (let i = 0; i < 4; i++) {
      farmPlots.push({
        planted: false,
        vegetable: null,
        progress: 0,
        watered: false,
        currentFrame: 1,
        countdown: 0,
        totalCountdown: 0
      });
    }
    localStorage.setItem('farmPlots', JSON.stringify(farmPlots));
  }
  renderFarm();
}

// Render farm plots
function renderFarm() {
  console.log('Rendering farm...');
  const farmArea = document.getElementById('farm-area');
  if (!farmArea) {
    console.error('Farm area element not found');
    return;
  }
  farmArea.innerHTML = '';
  farmPlots.forEach((plot, index) => {
    const plotElement = document.createElement('div');
    plotElement.classList.add('plot');
    if (plot.planted && plot.currentFrame >= plot.vegetable.frames) {
      plotElement.classList.add('ready');
    }

    const plotContent = document.createElement('div');
    plotContent.classList.add('plot-content');
    if (plot.planted) {
      plotContent.innerHTML = `<img src="${plot.vegetable.baseImage}${plot.currentFrame}.png" class="plant-img" onerror="this.src='assets/img/ui/farm_bg.png';">`;
    }

    const countdownBar = document.createElement('div');
    countdownBar.classList.add('countdown-bar');
    const countdownFill = document.createElement('div');
    countdownFill.classList.add('countdown-fill');
    countdownBar.appendChild(countdownFill);

    const plotStatus = document.createElement('div');
    plotStatus.classList.add('plot-status');
    if (plot.planted) {
      if (plot.currentFrame >= plot.vegetable.frames) {
        plotStatus.innerHTML = langData[currentLang].readyToHarvest || 'Ready to Harvest';
        countdownFill.style.width = '100%';
      } else if (plot.watered) {
        plotStatus.innerHTML = langData[currentLang].growing || 'Growing';
        const progress = (1 - plot.countdown / plot.totalCountdown) * 100;
        countdownFill.style.width = `${progress}%`;
      } else {
        plotStatus.innerHTML = langData[currentLang].needsWater || 'Needs Water';
        countdownFill.style.width = '0%';
      }
    }

    plotElement.appendChild(plotContent);
    plotElement.appendChild(countdownBar);
    plotElement.appendChild(plotStatus);
    farmArea.appendChild(plotElement);

    plotElement.addEventListener('click', () => handlePlotClick(index));
  });
  console.log('Farm rendered:', farmPlots);
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
    // Langsung tanam random vegetable
    const randomVegetable = vegetables[Math.floor(Math.random() * vegetables.length)];
    plot.planted = true;
    plot.vegetable = randomVegetable;
    plot.progress = 0;
    plot.watered = false;
    plot.currentFrame = 1;
    plot.countdown = randomVegetable.growthTime;
    plot.totalCountdown = randomVegetable.growthTime;
    plotContent.innerHTML = `<img src="${randomVegetable.baseImage}${plot.currentFrame}.png" class="plant-img" onerror="this.src='assets/img/ui/farm_bg.png';">`;
    plotStatus.innerHTML = langData[currentLang].needsWater || 'Needs Water';
    countdownFill.style.width = '0%'; // Reset bar saat tanam

    showNotification(langData[currentLang].planted);
    playBuyingSound();
    console.log(`Planted ${randomVegetable.name[currentLang]} at plot ${index}`);
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
          countdownFill.style.width = '0%';
          return;
        }
        if (plot.watered) {
          plot.countdown--;
          const progress = (1 - plot.countdown / plot.totalCountdown) * 100;
          countdownFill.style.width = `${progress}%`;
          if (plot.countdown <= 0) {
            plot.currentFrame++;
            plot.watered = false;
            plot.countdown = plot.vegetable.growthTime;
            plot.totalCountdown = plot.vegetable.growthTime;
            plotContent.innerHTML = `<img src="${plot.vegetable.baseImage}${plot.currentFrame}.png" class="plant-img" onerror="this.src='assets/img/ui/farm_bg.png';">`;
            if (plot.currentFrame >= plot.vegetable.frames) {
              plotElement.classList.add('ready');
              plotStatus.innerHTML = langData[currentLang].readyToHarvest || 'Ready to Harvest';
              clearInterval(countdownInterval);
              countdownFill.style.width = '100%';
            } else {
              plotStatus.innerHTML = langData[currentLang].needsWater || 'Needs Water';
              countdownFill.style.width = '0%';
            }
          } else {
            plotStatus.innerHTML = langData[currentLang].growing || 'Growing';
          }
        } else {
          plotStatus.innerHTML = langData[currentLang].needsWater || 'Needs Water';
          clearInterval(countdownInterval);
          countdownFill.style.width = '0%';
        }
      }, 1000);

      console.log(`Watered plot ${index}, used ${waterNeeded} water`);
    } else {
      showNotification(langData[currentLang].notEnoughWater);
    }
  }
}

// Update wallet display
function updateWallet() {
  console.log('Updating wallet...');
  document.getElementById('coin-display').innerText = `${coins} Farm Coins`;
  document.getElementById('water-display').innerText = `${water} Water`;
  document.getElementById('pi-display').innerText = `${pi.toFixed(2)} PI`;
  document.getElementById('level-text').innerText = `${langData[currentLang].level || 'Level'}: ${level}`;
  document.getElementById('xp-text').innerText = `${xp} XP`;
  const xpToNextLevel = level * 100;
  const xpPercentage = (xp / xpToNextLevel) * 100;
  document.getElementById('xp-fill').style.width = `${xpPercentage}%`;
  localStorage.setItem('coins', coins);
  localStorage.setItem('water', water);
  localStorage.setItem('pi', pi);
  localStorage.setItem('level', level);
  localStorage.setItem('xp', xp);
  console.log('Wallet updated:', { coins, water, pi, level, xp });
}

// Show notification
function showNotification(message) {
  console.log('Showing notification:', message);
  const notification = document.getElementById('notification');
  notification.innerText = message;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Play audio functions
function playBuyingSound() {
  buyingSound.currentTime = 0;
  buyingSound.play().catch(error => console.log('Buying sound play failed:', error));
}

function playWateringSound() {
  wateringSound.currentTime = 0;
  wateringSound.play().catch(error => console.log('Watering sound play failed:', error));
}

function playHarvestSound() {
  harvestSound.currentTime = 0;
  harvestSound.play().catch(error => console.log('Harvest sound play failed:', error));
}

function playUpgradeSound() {
  upgradeSound.currentTime = 0;
  upgradeSound.play().catch(error => console.log('Upgrade sound play failed:', error));
}

// Render inventory
function renderInventory() {
  console.log('Rendering inventory...');
  const inventorySection = document.getElementById('inventory-section');
  inventorySection.innerHTML = '';
  inventory.forEach((item, index) => {
    const itemElement = document.createElement('div');
    itemElement.classList.add('inventory-item');
    itemElement.innerHTML = `${item.vegetable.name[currentLang]} x${item.quantity}`;
    inventorySection.appendChild(itemElement);
  });
  console.log('Inventory rendered:', inventory);
}

// Render sell section in Exchange tab
function renderSellSection() {
  console.log('Rendering sell section...');
  const exchangeSection = document.getElementById('exchange-section');
  exchangeSection.innerHTML = '';
  inventory.forEach((item, index) => {
    const sellItem = document.createElement('div');
    sellItem.classList.add('sell-item');
    sellItem.innerHTML = `
      ${item.vegetable.name[currentLang]} x${item.quantity} (${item.vegetable.sellPrice * item.quantity} PI)
      <button>${langData[currentLang].sell || 'Sell'}</button>
    `;
    sellItem.querySelector('button').addEventListener('click', () => {
      pi += item.vegetable.sellPrice * item.quantity;
      inventory.splice(index, 1);
      localStorage.setItem('inventory', JSON.stringify(inventory));
      localStorage.setItem('pi', pi);
      updateWallet();
      renderSellSection();
      renderInventory();
      showNotification(`${langData[currentLang].sold || 'Sold'} ${item.vegetable.name[currentLang]}!`);
      playBuyingSound();
    });
    exchangeSection.appendChild(sellItem);
  });
  console.log('Sell section rendered');
}

// Render shop
function renderShop() {
  console.log('Rendering shop...');
  const shopSection = document.getElementById('shop-section');
  shopSection.innerHTML = '';
  const items = [
    { name: langData[currentLang].water || 'Water', price: 10, amount: 5 },
    { name: `${langData[currentLang].beetSeedLabel || 'Beet Seed'} x1`, price: 20, type: 'seed' }
  ];
  items.forEach(item => {
    const shopItem = document.createElement('div');
    shopItem.classList.add('shop-item');
    shopItem.innerHTML = `
      ${item.name} - ${item.price} Farm Coins
      <button>${langData[currentLang].buy || 'Buy'}</button>
    `;
    shopItem.querySelector('button').addEventListener('click', () => buyItem(item));
    shopSection.appendChild(shopItem);
  });
  console.log('Shop rendered');
}

// Buy item from shop
function buyItem(item) {
  console.log(`Buying item: ${item.name}...`);
  if (coins >= item.price) {
    coins -= item.price;
    if (item.name === langData[currentLang].water || 'Water') {
      water += item.amount;
    }
    updateWallet();
    showNotification(`${langData[currentLang].purchased || 'Purchased'} ${item.name}!`);
    playBuyingSound();
    console.log(`Item purchased: ${item.name}`);
  } else {
    showNotification(langData[currentLang].notEnoughCoins || 'Not enough Farm Coins!');
  }
}

// Render upgrades
function renderUpgrades() {
  console.log('Rendering upgrades...');
  const upgradesSection = document.getElementById('upgrades-section');
  upgradesSection.innerHTML = '';
  const upgrades = [
    { name: langData[currentLang].waterEfficiency || 'Water Efficiency', cost: 100, level: 1 },
    { name: langData[currentLang].fasterGrowth || 'Faster Growth', cost: 150, level: 1 }
  ];
  upgrades.forEach(upgrade => {
    const upgradeItem = document.createElement('div');
    upgradeItem.classList.add('upgrade-item');
    upgradeItem.innerHTML = `
      ${upgrade.name} (Level ${upgrade.level}) - ${upgrade.cost} Farm Coins
      <button>${langData[currentLang].upgrade || 'Upgrade'}</button>
    `;
    upgradeItem.querySelector('button').addEventListener('click', () => {
      if (coins >= upgrade.cost) {
        coins -= upgrade.cost;
        upgrade.level++;
        upgrade.cost += 50;
        updateWallet();
        showNotification(`${langData[currentLang].upgraded || 'Upgraded'} ${upgrade.name}!`);
        playUpgradeSound();
        renderUpgrades();
      } else {
        showNotification(langData[currentLang].notEnoughCoins || 'Not enough Farm Coins!');
      }
    });
    upgradesSection.appendChild(upgradeItem);
  });
  console.log('Upgrades rendered');
}

// Render leaderboard
function renderLeaderboard() {
  console.log('Rendering leaderboard...');
  const leaderboardSection = document.getElementById('leaderboard-section');
  leaderboardSection.innerHTML = '';
  const leaderboard = [
    { name: 'Player 1', pi: 1000 },
    { name: 'Player 2', pi: 800 },
    { name: 'You', pi: pi }
  ].sort((a, b) => b.pi - a.pi);
  leaderboard.forEach((entry, index) => {
    const entryElement = document.createElement('div');
    entryElement.classList.add('leaderboard-entry');
    entryElement.innerHTML = `#${index + 1} ${entry.name}: ${entry.pi.toFixed(2)} PI`;
    leaderboardSection.appendChild(entryElement);
  });
  console.log('Leaderboard rendered');
}

// Check harvest achievement
function checkHarvestAchievement() {
  console.log('Checking harvest achievement...');
  if (harvestCount >= 10) {
    showNotification(langData[currentLang].harvestAchievement || 'Achievement: 10 Harvests!');
    renderAchievements();
  }
  console.log('Harvest count:', harvestCount);
}

// Render achievements
function renderAchievements() {
  console.log('Rendering achievements...');
  const achievementsSection = document.getElementById('achievements-section');
  achievementsSection.innerHTML = '';
  const achievements = [
    { name: langData[currentLang].harvestAchievement || '10 Harvests', condition: harvestCount >= 10 }
  ];
  achievements.forEach(achievement => {
    const achievementElement = document.createElement('div');
    achievementElement.classList.add('achievement');
    achievementElement.innerHTML = `${achievement.name}: ${achievement.condition ? 'Unlocked' : 'Locked'}`;
    achievementsSection.appendChild(achievementElement);
  });
  console.log('Achievements rendered');
}

// Initialize game
function initializeGame() {
  console.log('Initializing game...');
  loadAssets(() => {
    console.log('Assets loaded, starting game...');
    initializePlots();
    renderInventory();
    renderSellSection();
    updateWallet();
    renderShop();
    renderUpgrades();
    renderLeaderboard();
    renderAchievements();
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('title-screen').style.display = 'block';
    backgroundMusic.play().catch(error => {
      console.log('Autoplay blocked, user interaction required:', error);
    });

    // Cek dan tampilkan daily reward pop-up
    const lastClaim = localStorage.getItem('lastDailyClaim');
    const now = new Date().toISOString().split('T')[0];
    console.log('Checking daily reward - Last claim:', lastClaim, 'Today:', now);
    if (lastClaim !== now) {
      const dailyRewardModal = document.getElementById('daily-reward-modal');
      if (dailyRewardModal) {
        dailyRewardModal.style.display = 'flex';
        console.log('Daily reward modal displayed');

        document.getElementById('claim-reward-btn').addEventListener('click', () => {
          console.log('Claiming daily reward...');
          coins += 100;
          water += 10;
          localStorage.setItem('lastDailyClaim', now);
          localStorage.setItem('coins', coins);
          localStorage.setItem('water', water);
          updateWallet();
          showNotification('Daily Reward Claimed! +100 Coins, +10 Water');
          playUpgradeSound();
          dailyRewardModal.style.display = 'none';
          console.log('Daily reward claimed');
        });

        document.getElementById('close-reward-btn').addEventListener('click', () => {
          console.log('Closing daily reward modal...');
          dailyRewardModal.style.display = 'none';
        });
      } else {
        console.error('Daily reward modal element not found');
      }
    }

    console.log('Game initialized');
  });
}

// Switch language
document.getElementById('lang-btn').addEventListener('click', () => {
  console.log('Switching language...');
  currentLang = currentLang === 'en' ? 'id' : 'en';
  localStorage.setItem('currentLang', currentLang);
  loadAssets(() => {
    updateWallet();
    renderFarm();
    renderInventory();
    renderSellSection();
    renderShop();
    renderUpgrades();
    renderLeaderboard();
    renderAchievements();
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      const tabName = tab.id.split('-')[0];
      tab.innerText = langData[currentLang][tabName] || tabName.charAt(0).toUpperCase() + tabName.slice(1);
    });
  });
  console.log('Language switched to:', currentLang);
});

// Start game
document.getElementById('start-btn').addEventListener('click', () => {
  console.log('Starting game...');
  document.getElementById('title-screen').style.display = 'none';
  document.getElementById('main-game').style.display = 'flex';
  renderFarm();
});

// Tab navigation
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    console.log(`Switching to tab: ${tab.id}`);
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    const sectionId = tab.id.replace('-tab', '-section');
    document.getElementById(sectionId).classList.add('active');
  });
});

// Settings modal
document.getElementById('settings-btn').addEventListener('click', () => {
  console.log('Opening settings modal...');
  document.getElementById('settings-modal').style.display = 'flex';
});

document.getElementById('close-settings').addEventListener('click', () => {
  console.log('Closing settings modal...');
  document.getElementById('settings-modal').style.display = 'none';
});

document.getElementById('music-volume').addEventListener('input', (e) => {
  backgroundMusic.volume = e.target.value;
});

document.getElementById('sfx-volume').addEventListener('input', (e) => {
  buyingSound.volume = e.target.value;
  wateringSound.volume = e.target.value;
  harvestSound.volume = e.target.value;
  upgradeSound.volume = e.target.value;
});

// Exit game
document.getElementById('exit-btn').addEventListener('click', () => {
  console.log('Exiting game...');
  localStorage.clear();
  location.reload();
});

// Start the game
initializeGame();
