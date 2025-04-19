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
let playerName = 'Player' + Math.floor(Math.random() * 1000); // Nama player acak
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

const plotCount = 8;
const xpPerLevel = 100;

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing game...');
  loadData();
  document.getElementById('start-btn').onclick = startGame;
  document.getElementById('lang-toggle').onclick = toggleLanguage;
});

async function loadData() {
  console.log('Loading data...');
  try {
    const langRes = await fetch('../data/lang.json');
    const vegRes = await fetch('../data/vegetables.json');
    if (!langRes.ok) throw new Error('Failed to load lang.json');
    if (!vegRes.ok) throw new Error('Failed to load vegetables.json');
    langData = await langRes.json();
    vegetables = await vegRes.json();
    console.log('Loaded JSON:', { langData, vegetables });
    initializeGame();
  } catch (e) {
    console.error('JSON load failed:', e);
    alert('JSON error: ' + e.message);
  }
}

function initializeGame() {
  console.log('Initializing game...');
  const savedLang = localStorage.getItem('lang');
  if (savedLang) {
    currentLang = savedLang;
    document.getElementById('lang-toggle').textContent = `Switch Language (${currentLang === 'en' ? 'ID' : 'EN'})`;
  }
  updateUIText();
  initializePlots();
  updateWallet();
  updateLevelBar();
  renderBag();
  updateLeaderboard();
}

function startGame() {
  console.log('Starting game...');
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
  switchTab('farm');
}

function toggleLanguage() {
  console.log('Toggling language...');
  currentLang = currentLang === 'en' ? 'id' : 'en';
  localStorage.setItem('lang', currentLang);
  document.getElementById('lang-toggle').textContent = `Switch Language (${currentLang === 'en' ? 'ID' : 'EN'})`;
  updateUIText();
  switchTab(document.querySelector('.tab-btn.active').getAttribute('data-tab'));
}

function updateUIText() {
  console.log('Updating UI text...');
  document.getElementById('title').textContent = langData[currentLang].title;
  document.getElementById('start-btn').textContent = langData[currentLang].startBtn;
  document.getElementById('game-title').textContent = langData[currentLang].title;
  document.getElementById('shop-title').textContent = langData[currentLang].shopTab;
  document.getElementById('upgrades-title').textContent = langData[currentLang].upgradesTab;
  document.getElementById('inventory-title').textContent = langData[currentLang].inventoryTab;
  document.getElementById('leaderboard-title').textContent = langData[currentLang].leaderboardTab;
  const claimPiBtn = document.querySelector('#claim-pi-btn');
  if (claimPiBtn) {
    claimPiBtn.textContent = langData[currentLang].claimPiBtn;
  }
  document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
    const tabs = ['farmTab', 'shopTab', 'upgradesTab', 'inventoryTab', 'leaderboardTab'];
    btn.textContent = langData[currentLang][tabs[idx]];
  });
  if (document.querySelector('.tab-btn.active').getAttribute('data-tab') === 'shop') {
    renderShop();
  }
  if (document.querySelector('.tab-btn.active').getAttribute('data-tab') === 'inventory') {
    renderInventory();
  }
  if (document.querySelector('.tab-btn.active').getAttribute('data-tab') === 'leaderboard') {
    renderLeaderboard();
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
      btn.onclick = () => switchTab(btn.getAttribute('data-tab'));
    });
    const activeBtn = document.querySelector(`button[onclick="switchTab('${tab}')"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.setAttribute('data-tab', tab);
    }
    if (tab === 'farm') renderFarm();
    if (tab === 'shop') renderShop();
    if (tab === 'inventory') renderInventory();
    if (tab === 'leaderboard') renderLeaderboard();
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
    farmPlots[index].growth += 1;
  }
  const veg = vegetables.find(v => v.id === farmPlots[index].vegetable);
  if (farmPlots[index].growth >= veg.growthTime) {
    farmPlots[index].growth = veg.growthTime;
  }
  renderFarm();
}

function harvest(index) {
  console.log('Harvesting plot at index:', index);
  const veg = vegetables.find(v => v.id === farmPlots[index].vegetable);
  let yieldAmount = veg.yield;
  if (upgrades.yieldBoost) yieldAmount = Math.floor(yieldAmount * 1.5);
  inventory.push({ id: veg.id, amount: yieldAmount });
  farmPlots[index] = { vegetable: null, growth: 0, watered: false };
  coins += veg.price;
  pi += veg.piPrice / 2;
  xp += 10;
  checkLevelUp();
  updateWallet();
  updateLevelBar();
  updateLeaderboard();
  renderFarm();
  try {
    document.getElementById('harvest-sound').play();
  } catch (e) {
    console.warn('Harvest sound failed:', e);
  }
  showNotification(`${langData[currentLang].harvested} ${veg.name[currentLang]}! +${veg.price} ${langData[currentLang].coinLabel}, +${(veg.piPrice / 2).toFixed(2)} Pi, +10 XP`);
}

function renderShop() {
  console.log('Rendering shop');
  const seedList = document.getElementById('seed-list');
  seedList.innerHTML = '';
  vegetables.forEach(veg => {
    const div = document.createElement('div');
    div.className = 'seed-item';
    const img = document.createElement('img');
    img.src = `../assets/img/plant/${veg.id}/${veg.id}_1.png`;
    img.alt = veg.name[currentLang];
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
  if (coins >= veg.price) {
    coins -= veg.price;
    bag.push(id);
    updateWallet();
    renderBag();
    showNotification(`${langData[currentLang].bought} ${veg.name[currentLang]}!`);
  } else if (pi >= veg.piPrice) {
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
  document.getElementById('bag').querySelector('img').onclick = () => {
    bagList.classList.toggle('show');
  };
}

function buyUpgrade(type) {
  console.log('Buying upgrade:', type);
  const costs = {
    wateringCan: { coins: 50, pi: 0.2 },
    extraPlotCoins: { coins: 200, pi: 0 },
    extraPlotPi: { coins: 0, pi: 1 },
    yieldBoost: { coins: 100, pi: 0.5 }
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

function claimPi() {
  console.log('Claiming Pi...');
  if (inventory.length === 0) {
    showNotification(langData[currentLang].emptyInventory);
    return;
  }
  const totalPi = inventory.reduce((sum, item) => {
    const veg = vegetables.find(v => v.id === item.id);
    return sum + (item.amount * (veg.piPrice / 10));
  }, 0);
  pi += totalPi;
  inventory = [];
  updateWallet();
  updateLeaderboard();
  renderInventory();
  showNotification(`${langData[currentLang].claimedPi} ${totalPi.toFixed(2)} Pi!`);
}

function updateLeaderboard() {
  console.log('Updating leaderboard...');
  const playerEntry = leaderboard.find(entry => entry.name === playerName);
  if (playerEntry) {
    playerEntry.pi = pi;
  } else {
    leaderboard.push({ name: playerName, pi: pi });
  }
  leaderboard.sort((a, b) => b.pi - a.pi);
  leaderboard = leaderboard.slice(0, 5);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  if (document.querySelector('.tab-btn.active').getAttribute('data-tab') === 'leaderboard') {
    renderLeaderboard();
  }
}

function renderLeaderboard() {
  console.log('Rendering leaderboard...');
  const leaderboardList = document.getElementById('leaderboard-list');
  leaderboardList.innerHTML = '';
  leaderboard.forEach((entry, idx) => {
    const div = document.createElement('div');
    div.className = 'leaderboard-item';
    div.textContent = `#${idx + 1}: ${entry.name} - ${entry.pi.toFixed(2)} Pi`;
    leaderboardList.appendChild(div);
  });
}

function updateWallet() {
  console.log('Updating wallet...');
  document.getElementById('coin-balance').textContent = coins;
  document.getElementById('pi-balance').textContent = pi.toFixed(2);
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
