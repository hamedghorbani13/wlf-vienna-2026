const LANGUAGE_COLUMNS = { en: "english", de: "german", fa: "farsi" };
const CSV_VERSION = Date.now().toString();

let currentLanguage = getInitialLanguage();
let translations = new Map();
let groupRows = [];

function getInitialLanguage() {
  try {
    const saved = localStorage.getItem("wlf-story-language");
    if (saved && LANGUAGE_COLUMNS[saved]) return saved;
  } catch {
    // The page still works when storage is unavailable.
  }

  const browserLanguage = navigator.language?.slice(0, 2).toLowerCase();
  return LANGUAGE_COLUMNS[browserLanguage] ? browserLanguage : "en";
}

function csvUrl(filename) {
  const url = new URL(filename, document.baseURI);
  url.searchParams.set("v", CSV_VERSION);
  return url.href;
}

async function readUtf8(response) {
  const bytes = await response.arrayBuffer();
  return new TextDecoder("utf-8").decode(bytes);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows.shift().map((value) =>
    value.replace(/^\uFEFF/, "").trim().toLowerCase()
  );

  return rows.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, (values[index] || "").trim()]))
  );
}

function shuffleRows(rows) {
  const shuffled = [...rows];

  // Draw a new, unbiased display order once per page load. Re-rendering for a
  // language change keeps this same order until the visitor refreshes.
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function translate(key, fallback = "") {
  const entry = translations.get(key);
  if (!entry) return fallback;
  return entry[LANGUAGE_COLUMNS[currentLanguage]] || entry.english || fallback;
}

function setTextWithParagraphs(element, value) {
  const paragraphs = String(value || "")
    .split(/\r?\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length < 2) {
    element.textContent = paragraphs[0] || "";
    return;
  }

  element.replaceChildren(
    ...paragraphs.map((paragraph) => {
      const span = document.createElement("span");
      span.className = "i18n-paragraph";
      span.textContent = paragraph;
      return span;
    })
  );
}

function applyTranslations() {
  const isFarsi = currentLanguage === "fa";
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = isFarsi ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const inlineFallback = element.dataset[LANGUAGE_COLUMNS[currentLanguage]];
    setTextWithParagraphs(element, translate(
      element.dataset.i18n,
      inlineFallback || element.textContent
    ));
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute(
      "aria-label",
      translate(element.dataset.i18nAriaLabel, element.getAttribute("aria-label") || "")
    );
  });

  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = translate("meta.description", description.content);

  document.querySelectorAll("[data-language]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === currentLanguage));
  });
}

function setLanguage(language) {
  if (!LANGUAGE_COLUMNS[language] || language === currentLanguage) return;
  currentLanguage = language;

  try {
    localStorage.setItem("wlf-story-language", language);
  } catch {
    // Continue without persistence.
  }

  applyTranslations();
  renderGroups();
}

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
});

function safeLogoPath(value) {
  const path = (value || "").trim().replaceAll("\\", "/");
  if (!path.startsWith("images/") || path.startsWith("/") || path.endsWith("/")) return "";

  try {
    const url = new URL(path, document.baseURI);
    return ["http:", "https:"].includes(url.protocol) && url.origin === window.location.origin
      ? url.href
      : "";
  } catch {
    return "";
  }
}

function safeContact(value) {
  if (!value) return "";

  try {
    const url = new URL(value, document.baseURI);
    return ["https:", "mailto:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function createGroupCard(group) {
  const card = document.createElement("article");
  card.className = "group-card reveal";
  card.tabIndex = 0;
  card.setAttribute("aria-expanded", "false");
  card.setAttribute(
    "aria-label",
    `${group.name}. ${translate("groups.view", "View story")}`
  );

  const logoPath = safeLogoPath(group.logo);
  if (logoPath) {
    const logo = document.createElement("img");
    logo.className = "group-card-background";
    logo.src = logoPath;
    logo.alt = "";
    logo.loading = "lazy";
    logo.setAttribute("aria-hidden", "true");
    logo.addEventListener("error", () => {
      card.classList.add("has-missing-logo");
      logo.remove();
    });
    card.append(logo);
  } else {
    card.classList.add("has-missing-logo");
  }

  const summary = document.createElement("div");
  summary.className = "group-summary";

  const name = document.createElement("h3");
  name.textContent = group.name;
  summary.append(name);

  if (group.address) {
    const address = document.createElement("p");
    address.className = "group-address";
    address.textContent = group.address;
    summary.append(address);
  }

  const hint = document.createElement("span");
  hint.className = "group-hint";
  hint.textContent = translate("groups.view", "View story");
  summary.append(hint);

  const details = document.createElement("div");
  details.className = "group-card-details";

  const detailsName = document.createElement("h3");
  detailsName.textContent = group.name;
  details.append(detailsName);

  if (group.address) {
    const address = document.createElement("p");
    address.className = "group-address";
    address.textContent = group.address;
    details.append(address);
  }

  const description = document.createElement("p");
  setTextWithParagraphs(
    description,
    group[LANGUAGE_COLUMNS[currentLanguage]] || group.english || ""
  );
  details.append(description);

  const contactUrl = safeContact(group.contact_url);
  if (contactUrl) {
    const contact = document.createElement("a");
    contact.className = "group-contact";
    contact.href = contactUrl;
    contact.textContent = group.contact_label || "Contact";
    if (!contactUrl.startsWith("mailto:")) {
      contact.target = "_blank";
      contact.rel = "noopener noreferrer";
    }
    details.append(contact);
  }

  card.append(summary, details);

  const toggleCard = () => {
    const willOpen = !card.classList.contains("is-open");
    document.querySelectorAll(".group-card.is-open").forEach((openCard) => {
      openCard.classList.remove("is-open");
      openCard.setAttribute("aria-expanded", "false");
    });
    card.classList.toggle("is-open", willOpen);
    card.setAttribute("aria-expanded", String(willOpen));
  };

  card.addEventListener("click", (event) => {
    if (!event.target.closest("a")) toggleCard();
  });

  card.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target === card) {
      event.preventDefault();
      toggleCard();
    }
  });

  return card;
}

function renderGroups() {
  const grid = document.querySelector("#groups-grid");
  const status = document.querySelector("#groups-status");
  if (!grid || !status) return;

  const cards = groupRows.map(createGroupCard);
  grid.replaceChildren(...cards);
  status.hidden = true;
  observeReveals(cards);
}

let revealObserver;

if ("IntersectionObserver" in window) {
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
}

function observeReveals(elements) {
  elements.forEach((element) => {
    element.classList.add("reveal");
    if (revealObserver) revealObserver.observe(element);
    else element.classList.add("is-visible");
  });
}

observeReveals(document.querySelectorAll(".reveal"));

const sceneElements = Array.from(document.querySelectorAll("[data-scene]"));
if ("IntersectionObserver" in window && sceneElements.length) {
  const sceneObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;

    document.body.dataset.activeScene = visible.target.dataset.scene;
    sceneElements.forEach((element) => {
      element.classList.toggle("is-active-scene", element === visible.target);
    });
  }, { threshold: [0.25, 0.5, 0.75] });

  sceneElements.forEach((element) => sceneObserver.observe(element));
}

document.querySelectorAll('a[href^="#"], [data-jump]').forEach((control) => {
  control.addEventListener("click", (event) => {
    const selector = control.dataset.jump || control.getAttribute("href");
    if (!selector || selector === "#") return;
    const target = document.querySelector(selector);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const calendarMenus = Array.from(document.querySelectorAll(".calendar-menu"));
calendarMenus.forEach((menu) => {
  menu.addEventListener("toggle", () => {
    if (!menu.open) return;
    calendarMenus.forEach((otherMenu) => {
      if (otherMenu !== menu) otherMenu.open = false;
    });
  });
});

document.addEventListener("click", (event) => {
  calendarMenus.forEach((menu) => {
    if (!menu.contains(event.target)) menu.open = false;
  });
});

document.querySelectorAll("[data-dialog-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = document.querySelector(button.dataset.dialogTarget);
    if (dialog?.showModal) dialog.showModal();
  });
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.querySelectorAll("[data-dialog-close]").forEach((button) => {
    button.addEventListener("click", () => dialog.close());
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

async function loadTranslations() {
  const response = await fetch(csvUrl("story.csv"), { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load story.csv (${response.status})`);
  const rows = parseCsv(await readUtf8(response)).filter((row) => row.location);
  translations = new Map(rows.map((row) => [row.location, row]));
  applyTranslations();
}

async function loadGroups() {
  const response = await fetch(csvUrl("groups.csv"), { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load groups.csv (${response.status})`);
  groupRows = shuffleRows(
    parseCsv(await readUtf8(response)).filter((row) =>
      Object.values(row).some((value) => value.trim())
    )
  );
  renderGroups();
}

async function initialize() {
  const status = document.querySelector("#groups-status");

  try {
    await loadTranslations();
  } catch (error) {
    console.error(error);
    applyTranslations();
  }

  try {
    await loadGroups();
  } catch (error) {
    console.error(error);
    if (status) {
      status.hidden = false;
      status.textContent = translate("groups.error", "Participating groups could not be loaded.");
    }
  }
}

initialize();
