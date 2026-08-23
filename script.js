const LANGUAGE_COLUMNS = {
  en: "english",
  de: "german",
  fa: "farsi",
};

const HERO_IMAGE_SOURCES = [
  {
    media: window.matchMedia("(max-width: 600px)"),
    source: "images/banner-mobile.webp",
  },
  {
    media: window.matchMedia("(max-width: 900px)"),
    source: "images/banner-tablet.webp",
  },
  {
    media: window.matchMedia("(min-width: 901px)"),
    source: "images/banner-desktop.webp",
  },
];

let heroImageRequest = 0;

function selectHeroImage() {
  return HERO_IMAGE_SOURCES.find(({ media }) => media.matches)?.source;
}

function loadResponsiveHeroImage() {
  const source = selectHeroImage();
  const request = ++heroImageRequest;

  if (!source) return;

  const image = new Image();

  image.addEventListener("load", () => {
    if (request !== heroImageRequest) return;
    document.documentElement.style.setProperty("--hero-image", `url("${source}")`);
    document.documentElement.classList.add("has-responsive-hero");
  });

  image.addEventListener("error", () => {
    if (request !== heroImageRequest) return;
    document.documentElement.style.removeProperty("--hero-image");
    document.documentElement.classList.remove("has-responsive-hero");
  });

  image.src = source;
}

HERO_IMAGE_SOURCES.forEach(({ media }) => {
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", loadResponsiveHeroImage);
  } else {
    media.addListener(loadResponsiveHeroImage);
  }
});

loadResponsiveHeroImage();

let currentLanguage = getInitialLanguage();
let translations = new Map();
let groupRows = [];

function getInitialLanguage() {
  try {
    const saved = localStorage.getItem("wlf-language");
    if (saved && LANGUAGE_COLUMNS[saved]) return saved;
  } catch {
    // Storage may be unavailable in strict privacy modes.
  }

  const browserLanguage = navigator.language?.slice(0, 2).toLowerCase();
  return LANGUAGE_COLUMNS[browserLanguage] ? browserLanguage : "en";
}

function parseCsv(csvText) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index];

    if (character === '"') {
      if (quoted && csvText[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && csvText[index + 1] === "\n") index += 1;
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

function translate(location, fallback = "") {
  const entry = translations.get(location);
  if (!entry) return fallback;
  return entry[LANGUAGE_COLUMNS[currentLanguage]] || entry.english || fallback;
}

function validExternalUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function applySiteLinks(rows) {
  const links = new Map(rows.map((row) => [row.location, validExternalUrl(row.url)]));

  document.querySelectorAll("[data-site-link]").forEach((link) => {
    const url = links.get(link.dataset.siteLink);

    if (!url) {
      link.removeAttribute("href");
      link.removeAttribute("target");
      link.removeAttribute("rel");
      link.setAttribute("aria-disabled", "true");
      link.classList.add("is-disabled");
      return;
    }

    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.removeAttribute("aria-disabled");
    link.classList.remove("is-disabled");
  });
}

function applyTranslations() {
  const isFarsi = currentLanguage === "fa";
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = isFarsi ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n, element.textContent);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute(
      "aria-label",
      translate(element.dataset.i18nAriaLabel, element.getAttribute("aria-label") || "")
    );
  });

  document.title = translate("meta.title", document.title);
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.content = translate("meta.description", description.content);
  }

  document.querySelectorAll("[data-language]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === currentLanguage));
  });
}

function setLanguage(language) {
  if (!LANGUAGE_COLUMNS[language] || language === currentLanguage) return;
  currentLanguage = language;

  try {
    localStorage.setItem("wlf-language", language);
  } catch {
    // The language still changes for the current page view.
  }

  applyTranslations();
  renderGroups();
  renderProgram();
}

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
});

const calendarMenu = document.querySelector(".calendar-menu");

if (calendarMenu) {
  const trigger = calendarMenu.querySelector(".calendar-trigger");
  const options = calendarMenu.querySelector(".calendar-options");
  const items = Array.from(calendarMenu.querySelectorAll('[role="menuitem"]'));

  const setCalendarMenuOpen = (open, focusFirst = false) => {
    trigger.setAttribute("aria-expanded", String(open));
    options.hidden = !open;
    if (open && focusFirst) items[0]?.focus();
  };

  trigger.addEventListener("click", () => {
    setCalendarMenuOpen(trigger.getAttribute("aria-expanded") !== "true");
  });

  trigger.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    setCalendarMenuOpen(true, true);
  });

  options.addEventListener("keydown", (event) => {
    const currentIndex = items.indexOf(document.activeElement);
    let nextIndex;

    if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % items.length;
    if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + items.length) % items.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;

    if (nextIndex === undefined) return;
    event.preventDefault();
    items[nextIndex]?.focus();
  });

  items.forEach((item) => {
    item.addEventListener("click", () => setCalendarMenuOpen(false));
  });

  document.addEventListener("click", (event) => {
    if (!calendarMenu.contains(event.target)) setCalendarMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || trigger.getAttribute("aria-expanded") !== "true") return;
    setCalendarMenuOpen(false);
    trigger.focus();
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

let revealObserver;

if ("IntersectionObserver" in window) {
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
}

function observeReveal(elements) {
  if (!revealObserver) return;
  elements.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });
}

observeReveal(document.querySelectorAll(".card, .schedule-row, .info-grid > div"));

function createContactLink(group) {
  if (!group.contact_url) return null;

  let url;
  try {
    url = new URL(group.contact_url, document.baseURI);
  } catch {
    return null;
  }

  if (!["https:", "mailto:"].includes(url.protocol)) return null;

  const link = document.createElement("a");
  link.className = "group-contact";
  link.href = url.href;
  link.textContent = group.contact_label;

  if (url.protocol !== "mailto:") {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  return link;
}

function normalizeAssetPath(value) {
  const path = (value || "").trim().replaceAll("\\", "/");
  if (!path || path.endsWith("/") || path.startsWith("/") || !path.startsWith("images/")) {
    return "";
  }

  try {
    const url = new URL(path, document.baseURI);
    return url.origin === window.location.origin && url.protocol.match(/^https?:$/) ? url.href : "";
  } catch {
    return "";
  }
}

function translatedGroup(group, index) {
  const prefix = group.key || `group.${String(index + 1).padStart(2, "0")}`;
  const description = group[LANGUAGE_COLUMNS[currentLanguage]] || group.english || group.description || "";
  return {
    ...group,
    name: translate(`${prefix}.name`, group.name || prefix),
    address: translate(`${prefix}.address`, group.address || ""),
    description: description || translate(`${prefix}.description`, ""),
    contact_label: translate(`${prefix}.contact`, group.contact_label || "Contact"),
  };
}

function createGroupCard(group) {
  const card = document.createElement("article");
  card.className = "group-card";
  card.tabIndex = 0;
  card.setAttribute("aria-expanded", "false");
  card.setAttribute(
    "aria-label",
    translate("groups.card_label", "{name}. Show group details").replace("{name}", group.name)
  );

  const logoPath = normalizeAssetPath(group.logo);
  if (logoPath) {
    const backgroundLogo = document.createElement("img");
    backgroundLogo.className = "group-card-background";
    backgroundLogo.src = logoPath;
    backgroundLogo.alt = "";
    backgroundLogo.loading = "lazy";
    backgroundLogo.setAttribute("aria-hidden", "true");
    backgroundLogo.addEventListener("error", () => {
      card.classList.add("has-missing-logo");
      backgroundLogo.remove();
      console.warn(`Group logo could not be loaded: ${group.logo}`);
    });
    card.append(backgroundLogo);
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
  hint.textContent = translate("groups.view_details", "View details");
  summary.append(hint);

  const details = document.createElement("div");
  details.className = "group-card-details";

  const detailsName = document.createElement("h3");
  detailsName.textContent = group.name;
  details.append(detailsName);

  if (group.address) {
    const detailsAddress = document.createElement("p");
    detailsAddress.className = "group-address";
    detailsAddress.textContent = group.address;
    details.append(detailsAddress);
  }

  const description = document.createElement("p");
  description.textContent = group.description || translate("groups.more_soon", "More information will be added soon.");
  details.append(description);

  const contact = createContactLink(group);
  if (contact) details.append(contact);

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
  if (!grid || !status || !groupRows.length) return;

  const cards = groupRows.map(translatedGroup).map(createGroupCard);
  grid.replaceChildren(...cards);
  status.hidden = true;
  observeReveal(cards);
}

async function loadContent() {
  const response = await fetch("content.csv?v=20260824-location-fix", { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load content.csv (${response.status})`);

  const rows = parseCsv(await response.text()).filter((row) => row.location);
  translations = new Map(rows.map((row) => [row.location, row]));
  applyTranslations();
}

async function loadGroups() {
  const response = await fetch("groups.csv?v=20260823-utf8-fix", { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load groups.csv (${response.status})`);

  groupRows = parseCsv(await response.text()).filter((group) => group.key || group.name);
  if (!groupRows.length) throw new Error("groups.csv does not contain any group rows");
  renderGroups();
}

async function loadSiteLinks() {
  const response = await fetch("links.csv", { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load links.csv (${response.status})`);

  applySiteLinks(parseCsv(await response.text()).filter((row) => row.location));
}

async function initializePage() {
  const groupsStatus = document.querySelector("#groups-status");

  try {
    await loadContent();
  } catch (error) {
    console.error(error);
    applyTranslations();
  }

  try {
    await loadSiteLinks();
  } catch (error) {
    console.error(error);
  }

  try {
    await loadGroups();
  } catch (error) {
    console.error(error);
    if (groupsStatus) {
      const location = window.location.protocol === "file:"
        ? "groups.local_error"
        : "groups.load_error";
      const fallback = window.location.protocol === "file:"
        ? "To load CSV files locally, preview this folder through a local web server."
        : "Participating groups could not be loaded. Please try again later.";
      groupsStatus.hidden = false;
      groupsStatus.dataset.i18n = location;
      groupsStatus.textContent = translate(location, fallback);
    }
  }
}

initializePage();
