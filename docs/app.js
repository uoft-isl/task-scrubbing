// @ts-check

/** @type {HTMLButtonElement} */
const menuButton = document.querySelector(".menu-button");
/** @type {HTMLElement} */
const navLinks = document.querySelector(".nav-links");
/** @type {HTMLVideoElement} */
const mainVideo = document.querySelector("#main-video");
/** @type {NodeListOf<HTMLButtonElement>} */
const chapterButtons = document.querySelectorAll(".chapter-row button");
/** @type {NodeListOf<HTMLButtonElement>} */
const rolloutTabs = document.querySelectorAll(".rollout-tabs button");
/** @type {NodeListOf<HTMLElement>} */
const rolloutPanels = document.querySelectorAll(".rollout-panel");
/** @type {HTMLButtonElement} */
const pairPlayButton = document.querySelector(".pair-play");
/** @type {HTMLButtonElement} */
const copyButton = document.querySelector(".copy-button");
/** @type {HTMLElement} */
const citation = document.querySelector("#citation");
/** @type {NodeListOf<HTMLElement>} */
const revealElements = document.querySelectorAll(".reveal");
/** @type {NodeListOf<HTMLSelectElement>} */
const resultSelects = document.querySelectorAll(".result-select");

/** @type {Record<string, Record<string, {oodB: number, oodS: number, scB: number, scS: number, idB: number, idS: number, cue: string}>>} */
const RESULTS = {
  libero: {
    pi0: { oodB: 0, oodS: 48, scB: 99, scS: 0, idB: 70, idS: 69, cue: "Viewpoint cue" },
    pi05: { oodB: 0, oodS: 28, scB: 100, scS: 28, idB: 66, idS: 45, cue: "Viewpoint cue" },
    smolvla: { oodB: 10, oodS: 73, scB: 0, scS: 0, idB: 62, idS: 74, cue: "Viewpoint cue" },
    "smolvla-v1": { oodB: 4, oodS: 64, scB: 45, scS: 0, idB: 37, idS: 66, cue: "Viewpoint cue" },
    "smolvla-vlm": { oodB: 4, oodS: 64, scB: 17, scS: 0, idB: 34, idS: 66, cue: "Viewpoint cue" },
    minivla: { oodB: 0, oodS: 26, scB: 100, scS: 0, idB: 50, idS: 44, cue: "Viewpoint cue" },
  },
  robotwin: {
    smolvla: { oodB: 5, oodS: 86, scB: 0, scS: 0, idB: 98, idS: 95, cue: "Background cue" },
    "smolvla-v1": { oodB: 0, oodS: 83, scB: 100, scS: 0, idB: 90, idS: 89, cue: "Background cue" },
    "smolvla-vlm": { oodB: 0, oodS: 45, scB: 100, scS: 0, idB: 95, idS: 50, cue: "Background cue" },
    pi0: { oodB: 0, oodS: 62, scB: 100, scS: 0, idB: 94, idS: 85, cue: "Background cue" },
    pi05: { oodB: 0, oodS: 39, scB: 100, scS: 39, idB: 97, idS: 57, cue: "Background cue" },
  },
  aloha: {
    "smolvla-v1-combined": { oodB: 0, oodS: 100, scB: 100, scS: 0, idB: 100, idS: 97.5, cue: "Color + background cues" },
    "smolvla-combined": { oodB: 47.5, oodS: 92.5, scB: 27.5, scS: 0, idB: 100, idS: 97.5, cue: "Color + background cues" },
    "smolvla-v1-color": { oodB: 57.5, oodS: 87.5, scB: 17.5, scS: 0, idB: 95, idS: 90, cue: "Cup-color cue" },
    "smolvla-color": { oodB: 77.5, oodS: 95, scB: 0, scS: 2.5, idB: 95, idS: 95, cue: "Cup-color cue" },
  },
};

/** @param {number} value */
function pct(value) {
  return `${value}%`;
}

/** @param {HTMLSelectElement} select */
function updateResultCard(select) {
  const environment = select.dataset.environment;
  const row = RESULTS[environment][select.value];
  const card = select.closest("[data-result-card]");
  card.querySelector("[data-baseline]").textContent = pct(row.oodB);
  card.querySelector("[data-scrubbed]").textContent = pct(row.oodS);
  const baselineBar = /** @type {HTMLElement} */ (card.querySelector("[data-baseline-bar]"));
  const scrubbedBar = /** @type {HTMLElement} */ (card.querySelector("[data-scrubbed-bar]"));
  baselineBar.style.setProperty("--value", pct(row.oodB));
  scrubbedBar.style.setProperty("--value", pct(row.oodS));
  card.querySelector(".bar-comparison").setAttribute("aria-label", `OOD success improved from ${row.oodB} to ${row.oodS} percent`);
  card.querySelector("[data-cue]").textContent = row.cue;
  card.querySelector("[data-shortcut]").innerHTML = `${pct(row.scB)} → <strong>${pct(row.scS)}</strong>`;
  card.querySelector("[data-id]").textContent = `${pct(row.idB)} → ${pct(row.idS)}`;
}

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  navLinks.classList.remove("is-open");
}

function activePanel() {
  return /** @type {HTMLElement} */ (document.querySelector(".rollout-panel.is-active"));
}

function activePairVideos() {
  return /** @type {NodeListOf<HTMLVideoElement>} */ (activePanel().querySelectorAll("video"));
}

function stopPair() {
  activePairVideos().forEach((video) => video.pause());
  pairPlayButton.setAttribute("aria-pressed", "false");
  pairPlayButton.querySelector("span").textContent = "Play comparison";
}

/** @param {HTMLButtonElement} selectedTab */
function activateRollout(selectedTab) {
  stopPair();
  const selectedName = selectedTab.dataset.rollout;
  rolloutTabs.forEach((tab) => {
    tab.setAttribute("aria-selected", String(tab === selectedTab));
  });
  rolloutPanels.forEach((panel) => {
    const isSelected = panel.id === `panel-${selectedName}`;
    panel.hidden = !isSelected;
    panel.classList.toggle("is-active", isSelected);
    panel.querySelectorAll("video").forEach((video) => {
      video.currentTime = 0;
    });
  });
}

function togglePairPlayback() {
  const isPlaying = pairPlayButton.getAttribute("aria-pressed") === "true";
  const videos = activePairVideos();
  if (isPlaying) {
    stopPair();
    return;
  }
  videos.forEach((video) => {
    video.currentTime = 0;
    void video.play();
  });
  pairPlayButton.setAttribute("aria-pressed", "true");
  pairPlayButton.querySelector("span").textContent = "Pause comparison";
}

/** @param {KeyboardEvent} event */
function moveTabFocus(event) {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
    return;
  }
  const currentIndex = Array.from(rolloutTabs).indexOf(/** @type {HTMLButtonElement} */ (event.currentTarget));
  const direction = event.key === "ArrowRight" ? 1 : -1;
  const nextIndex = (currentIndex + direction + rolloutTabs.length) % rolloutTabs.length;
  rolloutTabs[nextIndex].focus();
  activateRollout(rolloutTabs[nextIndex]);
}

async function copyCitation() {
  await navigator.clipboard.writeText(citation.textContent);
  copyButton.textContent = "Copied";
  window.setTimeout(() => {
    copyButton.textContent = "Copy BibTeX";
  }, 1800);
}

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  navLinks.classList.toggle("is-open", !isOpen);
});

navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

chapterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    mainVideo.currentTime = Number(button.dataset.time);
    void mainVideo.play();
    mainVideo.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

mainVideo.addEventListener("timeupdate", () => {
  let currentButton = chapterButtons[0];
  chapterButtons.forEach((button) => {
    if (mainVideo.currentTime >= Number(button.dataset.time)) {
      currentButton = button;
    }
  });
  chapterButtons.forEach((button) => button.classList.toggle("is-current", button === currentButton));
});

rolloutTabs.forEach((tab) => {
  tab.addEventListener("click", () => activateRollout(tab));
  tab.addEventListener("keydown", moveTabFocus);
});

pairPlayButton.addEventListener("click", togglePairPlayback);
copyButton.addEventListener("click", () => void copyCitation());
resultSelects.forEach((select) => {
  select.addEventListener("change", () => updateResultCard(select));
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealElements.forEach((element) => revealObserver.observe(element));
