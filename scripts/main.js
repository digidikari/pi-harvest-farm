let currentLanguage = "en";
let vegetables = [];
let plantedGrid = [];

const GRID_SIZE = 9; // 3x3 grid awal
const MAX_GROWTH_STAGE = 3;

function setLanguage(lang) {
  currentLanguage = lang;
  loadLanguage();
  renderGrid();
}

function loadLanguage() {
  fetch(`lang/${currentLanguage}.json`)
    .then((res) => res.json())
    .then((data) => {
      document.querySelector("h1").textContent = data.title;
      document.getElementById("upgrade-title").textContent = data.upgrade;
    });
}

function loadVegetables() {
  fetch("data/vegetables.json")
    .then((res) => res.json())
    .then((data) => {
      vegetables = data;
      plantedGrid = Array(GRID_SIZE).fill(null); // Reset lahan
      renderGrid();
    });
}

function renderGrid() {
  const grid = document.getElementById("plant-grid");
  grid.innerHTML = "";

  plantedGrid.forEach((plot, index) => {
    const container = document.createElement("div");
    container.className = "plant-box";

    if (plot) {
      const img = document.createElement("img");
      img.src = `assets/img/plant/${plot.id}/${plot.id}_${plot.growthStage}.png`;
      img.alt = plot.name[currentLanguage];
      container.appendChild(img);
    } else {
      container.textContent = "+";
      container.classList.add("empty-plot");
      container.onclick = () => showPlantMenu(index);
    }

    grid.appendChild(container);
  });
}

function showPlantMenu(index) {
  const choice = prompt("Choose plant: " + vegetables.map(v => v.name[currentLanguage]).join(", "));
  const selected = vegetables.find(v => v.name[currentLanguage].toLowerCase() === choice?.toLowerCase());

  if (selected) {
    plantSeed(index, selected);
  } else {
    alert("Not found!");
  }
}

function plantSeed(index, veg) {
  plantedGrid[index] = {
    ...veg,
    growthStage: 1,
    plantedTime: Date.now()
  };
  renderGrid();
  growPlant(index);
}

function growPlant(index) {
  const plant = plantedGrid[index];
  if (!plant || plant.growthStage >= MAX_GROWTH_STAGE) return;

  const time = plant.growthTime * 1000; // ms
  setTimeout(() => {
    if (plantedGrid[index]) {
      plantedGrid[index].growthStage++;
      renderGrid();
      growPlant(index);
    }
  }, time);
}

// Inisialisasi
loadLanguage();
loadVegetables();
