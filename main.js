const API_KEY="AIzaSyAqxVa75bPucuPImIBibrquBDFaqVHFEEI";
const CX = "045c87e5eec474b3a";

let currentQuery = "";
let currentTab = "all";
let currentStart = 1;

window.onload = () => {
  const params = new URLSearchParams(window.location.search);
  currentQuery = params.get("q") || "";
  currentTab = params.get("tab") || "all";
  currentStart = 1;

  if (currentTab === "aitools") {
    document.querySelector(".results").innerHTML = `
      <div class="result-item"><h3>AI Tools – Coming Soon</h3>
      <p>We're working on integrating advanced AI tools like ChatGPT and DeepSeek. Stay tuned!</p></div>
    `;
    return;
  }

  if (currentQuery) {
    fetchResults(currentQuery, currentTab, currentStart);
  }
};

function fetchResults(query, tab = "all", start = 1) {
  let typeParam = "";

  if (tab === "images") {
    typeParam = "&searchType=image";
  }

  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${CX}&key=${API_KEY}${typeParam}&start=${start}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (start === 1) document.querySelector(".results").innerHTML = "";

      // Render featured box first
      if (data.items && data.items.length > 0 && start === 1) {
        renderFeaturedBox(data.items[0]);
      }

      // Render depending on tab
      if (tab === "images") {
        renderImageGrid(data.items);
      } else if (tab === "shopping") {
        renderShoppingGrid(data.items);
      } else {
        renderTextResults(tab === "all" ? data.items.slice(1) : data.items);
      }

      // Show more button
      setupShowMoreButton(query, tab, start + 10);
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      document.querySelector(".results").innerHTML = `<div class="result-item"><p>Error loading results. Try again later.</p></div>`;
    });
}

function renderFeaturedBox(item) {
  const container = document.querySelector(".results");
  const box = document.createElement("div");
  box.className = "featured-box";
  box.innerHTML = `
    <img src="${item.pagemap?.cse_image?.[0]?.src || 'https://via.placeholder.com/140'}" alt="Featured">
    <div class="featured-info">
      <h3>${item.title}</h3>
      <p>${item.snippet}</p>
      <a href="${item.link}" target="_blank">${item.link}</a>
    </div>
  `;
  container.appendChild(box);
}

function renderTextResults(items) {
  const container = document.querySelector(".results");
  items.forEach(item => {
    const box = document.createElement("div");
    box.className = "result-item";
    box.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.snippet}</p>
      <a href="${item.link}" target="_blank">${item.link}</a>
    `;
    container.appendChild(box);
  });
}

function renderImageGrid(items) {
  const container = document.querySelector(".results");
  const grid = document.createElement("div");
  grid.className = "image-grid";

  items.forEach(item => {
    const imgSrc = item.link;
    const link = item.image?.contextLink || item.link;
    const a = document.createElement("a");
    a.href = link;
    a.target = "_blank";
    a.innerHTML = `<img src="${imgSrc}" alt="Image result" width="300" height="300">`;
    grid.appendChild(a);
  });

  container.appendChild(grid);
}

function renderShoppingGrid(items) {
  const container = document.querySelector(".results");
  const grid = document.createElement("div");
  grid.className = "image-grid";

  items.forEach(item => {
    const img = item.pagemap?.cse_image?.[0]?.src || "";
    const title = item.title;
    const snippet = item.snippet;
    const link = item.link;

    const a = document.createElement("a");
    a.href = link;
    a.target = "_blank";
    a.innerHTML = `
      <img src="${img}" alt="Shopping item" width="300" height="300">
      <div style="color:white; font-size:0.9rem; padding-top:5px;">
        ${title}<br>
        <span style="opacity: 0.8; font-size: 0.85rem;">${snippet}</span>
      </div>
    `;
    grid.appendChild(a);
  });

  container.appendChild(grid);
}

function setupShowMoreButton(query, tab, nextStart) {
  const oldBtn = document.querySelector(".more-btn");
  if (oldBtn) oldBtn.remove();

  const btn = document.createElement("button");
  btn.className = "more-btn";
  btn.textContent = "Show More Results";
  btn.onclick = () => {
    currentStart = nextStart;
    fetchResults(query, tab, currentStart);
  };

  document.querySelector(".results").appendChild(btn);
}