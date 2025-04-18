let currentLanguage = "en";
let vegetables = [];

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
      renderGrid();
    });
}

function renderGrid() {
  const grid = document.getElementById("plant-grid");
  grid.innerHTML = "";

  vegetables.forEach((veg) => {
    const container = document.createElement("div");
    container.className = "plant-box";

    const img = document.createElement("img");
    img.src = `assets/img/plant/${veg.id}/1.png`;
    img.alt = veg.name[currentLanguage];

    const label = document.createElement("p");
    label.textContent = veg.name[currentLanguage];

    container.appendChild(img);
    container.appendChild(label);
    grid.appendChild(container);
  });
}

// Inisialisasi
loadLanguage();
loadVegetables();
