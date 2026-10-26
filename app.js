/* global tizen */
(function () {
  "use strict";

  var APPS = [
    { key: "svt", label: "SVT Play", logo: "svt-play", glow: "#3d9653", names: ["svt play", "svt"] },
    { key: "netflix", label: "Netflix", logo: "netflix", glow: "#b52539", names: ["netflix"] },
    { key: "tv4", label: "TV4 Play", logo: "tv4-play", glow: "#a82b3e", names: ["tv4 play", "tv4"] },
    { key: "max", label: "HBO Max", logo: "hbo-max", glow: "#6d58b3", names: ["hbo max", "max"] },
    { key: "prime", label: "Prime Video", logo: "prime-video-alt", glow: "#256899", names: ["prime video", "amazon prime video", "amazon video"] },
    { key: "disney", label: "Disney+", logo: "disney-plus", glow: "#375aaf", names: ["disney plus", "disney+"] },
    { key: "youtube", label: "YouTube", logo: "youtube", glow: "#a92a35", names: ["youtube"] },
    { key: "apple", label: "Apple TV", logo: "apple-tv", glow: "#66758e", names: ["apple tv", "apple tv+"], launchIds: ["com.samsung.tv.aria-video", "3201807016597"] },
    { key: "spotify", label: "Spotify", logo: "spotify", glow: "#2b965e", names: ["spotify"] }
  ];
  var SOURCES = [
    { key: "applebox", label: "Apple TV-box", logo: "apple-tv", port: 1 },
    { key: "playstation", label: "PlayStation", logo: "playstation", port: 2 }
  ];

  var isTizen = typeof tizen !== "undefined" && !!tizen.application;
  var installed = [];
  var availableSources = [];
  var sourceOpen = false;
  var sourceNeedsReset = false;
  var bound = readBindings();
  var watching = readWatching();
  var focusIndex = 0;
  var pickerFor = -1;
  var pickerFocus = 0;
  var watchDialogOpen = false;
  var toastTimer;
  var grid = document.getElementById("app-grid");
  var sourceGrid = document.getElementById("source-grid");
  var backdrop = document.getElementById("picker-backdrop");
  var pickerList = document.getElementById("picker-list");
  var clock = document.getElementById("clock");
  var watchBackdrop = document.getElementById("watch-backdrop");
  var watchForm = document.getElementById("watch-form");
  var watchTitle = document.getElementById("watch-title");
  var watchApp = document.getElementById("watch-app");
  var watchDate = document.getElementById("watch-date");
  var watchTime = document.getElementById("watch-time");

  function normalized(value) {
    return String(value || "").toLocaleLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ").trim();
  }

  function readBindings() {
    try { return JSON.parse(localStorage.getItem("neo-qled-bindings") || "{}"); }
    catch (error) { return {}; }
  }

  function saveBindings() {
    try { localStorage.setItem("neo-qled-bindings", JSON.stringify(bound)); }
    catch (error) { showToast("Kunde inte spara valet på TV:n."); }
  }

  function readWatching() {
    try {
      var rows = JSON.parse(localStorage.getItem("medins-mediacenter-watching") || "[]");
      return Array.isArray(rows) ? rows.filter(function (row) {
        return row && typeof row.id === "string" && typeof row.title === "string" &&
          APPS.some(function (app) { return app.key === row.appKey; });
      }) : [];
    } catch (error) { return []; }
  }

  function saveWatching() {
    try { localStorage.setItem("medins-mediacenter-watching", JSON.stringify(watching)); }
    catch (error) { showToast("Kunde inte spara programmen på TV:n."); }
  }

  function findInstalled(definition) {
    var saved = bound[definition.key];
    var i;
    if (saved) {
      for (i = 0; i < installed.length; i += 1) {
        if (installed[i].id === saved) { return installed[i]; }
      }
    }
    for (i = 0; i < definition.names.length; i += 1) {
      var target = normalized(definition.names[i]);
      var exact = installed.find(function (app) { return normalized(app.name) === target; });
      if (exact) { return exact; }
    }
    for (i = 0; i < definition.names.length; i += 1) {
      var partial = normalized(definition.names[i]);
      var match = installed.find(function (app) { return normalized(app.name).indexOf(partial) === 0; });
      if (match) { return match; }
    }
    return null;
  }

  function makeLogo(name) {
    var logo = document.createElement("img");
    logo.className = "app-logo";
    logo.src = "assets/logos/" + name + ".png";
    logo.alt = "";
    logo.setAttribute("aria-hidden", "true");
    return logo;
  }

  function render() {
    grid.innerHTML = "";
    APPS.forEach(function (definition, index) {
      var match = findInstalled(definition);
      var button = document.createElement("button");
      button.type = "button";
      button.className = "app-card";
      button.dataset.app = definition.key;
      button.dataset.missing = String(!match);
      button.style.setProperty("--glow", definition.glow);
      button.setAttribute("aria-label", match ? "Öppna " + definition.label : "Koppla " + definition.label + " till installerad app");
      var mark = document.createElement("span");
      mark.className = "app-mark";
      var label = document.createElement("span");
      label.textContent = definition.label;
      mark.appendChild(makeLogo(definition.logo));
      mark.appendChild(label);
      button.appendChild(mark);
      button.addEventListener("click", function () { activate(index); });
      button.addEventListener("focus", function () { focusIndex = index; });
      grid.appendChild(button);
    });
    sourceGrid.innerHTML = "";
    SOURCES.forEach(function (source, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "app-card source-card";
      button.dataset.app = source.key;
      button.style.setProperty("--glow", "#365b9e");
      button.setAttribute("aria-label", "Visa " + source.label);
      var mark = document.createElement("span");
      mark.className = "app-mark";
      var copy = document.createElement("span");
      copy.className = "source-copy";
      var label = document.createElement("span");
      label.textContent = source.label;
      var port = document.createElement("small");
      port.textContent = "HDMI " + source.port;
      copy.appendChild(label);
      copy.appendChild(port);
      mark.appendChild(makeLogo(source.logo));
      mark.appendChild(copy);
      button.appendChild(mark);
      button.addEventListener("click", function () { activateSource(index); });
      button.addEventListener("focus", function () { focusIndex = APPS.length + index; });
      sourceGrid.appendChild(button);
    });
    document.getElementById("source-section").hidden = false;
    focusCard(focusIndex);
  }

  function formatSchedule(row) {
    var label = "";
    if (row.date) {
      var parts = row.date.split("-");
      var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      label = isNaN(date.getTime()) ? row.date : date.toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
    }
    return [label, row.time].filter(Boolean).join(" · ");
  }

  function compareSchedule(a, b) {
    var first = (a.date || "9999-12-31") + (a.time || "23:59");
    var second = (b.date || "9999-12-31") + (b.time || "23:59");
    return first.localeCompare(second) || a.title.localeCompare(b.title, "sv");
  }

  function renderWatching() {
    var activeList = document.getElementById("watch-list");
    var pausedList = document.getElementById("paused-list");
    activeList.innerHTML = "";
    pausedList.innerHTML = "";
    var active = watching.filter(function (row) { return !row.paused; });
    var paused = watching.filter(function (row) { return !!row.paused; });
    active.sort(compareSchedule);
    paused.sort(compareSchedule);
    function addRows(rows, list) {
      rows.forEach(function (row) {
        var definition = APPS.find(function (app) { return app.key === row.appKey; });
        var item = document.createElement("div");
        item.className = "watch-item";
        item.dataset.watchId = row.id;
        var open = document.createElement("button");
        open.type = "button";
        open.className = "watch-open";
        open.setAttribute("aria-label", "Öppna " + definition.label + " för " + row.title);
        open.appendChild(makeLogo(definition.logo));
        var copy = document.createElement("span");
        copy.className = "watch-copy";
        var title = document.createElement("strong");
        title.textContent = row.title;
        var meta = document.createElement("small");
        meta.textContent = [definition.label, formatSchedule(row)].filter(Boolean).join(" · ");
        copy.appendChild(title);
        copy.appendChild(meta);
        open.appendChild(copy);
        open.addEventListener("click", function () { activate(APPS.indexOf(definition)); });
        item.appendChild(open);
        var toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "watch-action";
        toggle.textContent = row.paused ? "↻" : "Ⅱ";
        toggle.title = row.paused ? "Återuppta" : "Pausa";
        toggle.setAttribute("aria-label", toggle.title + " " + row.title);
        toggle.addEventListener("click", function () {
          row.paused = !row.paused;
          saveWatching();
          renderWatching();
          focusWatchItem(row.id, ".watch-action");
          showToast(row.paused ? "Programmet pausades." : "Programmet återupptogs.");
        });
        item.appendChild(toggle);
        var remove = document.createElement("button");
        remove.type = "button";
        remove.className = "watch-action watch-remove";
        remove.textContent = "×";
        remove.title = "Ta bort";
        remove.setAttribute("aria-label", "Ta bort " + row.title);
        remove.addEventListener("click", function () {
          watching = watching.filter(function (entry) { return entry.id !== row.id; });
          saveWatching();
          renderWatching();
          var next = list.querySelector(".watch-open") || document.getElementById("add-watch");
          next.focus();
          showToast("Programmet togs bort.");
        });
        item.appendChild(remove);
        list.appendChild(item);
      });
    }
    addRows(active, activeList);
    addRows(paused, pausedList);
    if (!active.length) { activeList.textContent = "Inga program ännu. Lägg till med knappen högst upp."; }
    if (!paused.length) { pausedList.textContent = "Inga pausade program."; }
  }

  function focusWatchItem(id, selector) {
    var items = document.querySelectorAll(".watch-item");
    for (var i = 0; i < items.length; i += 1) {
      if (items[i].dataset.watchId === id) {
        var button = items[i].querySelector(selector);
        if (button) { button.focus(); button.scrollIntoView({ block: "nearest" }); }
        return;
      }
    }
  }

  function openWatchDialog() {
    watchDialogOpen = true;
    watchForm.reset();
    document.getElementById("watch-error").textContent = "";
    watchBackdrop.hidden = false;
    watchTitle.focus();
  }

  function closeWatchDialog() {
    watchDialogOpen = false;
    watchBackdrop.hidden = true;
    document.getElementById("add-watch").focus();
  }

  function validSchedule(date, time) {
    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { return false; }
      var parts = date.split("-").map(Number);
      var value = new Date(parts[0], parts[1] - 1, parts[2]);
      if (value.getFullYear() !== parts[0] || value.getMonth() !== parts[1] - 1 || value.getDate() !== parts[2]) { return false; }
    }
    if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) { return false; }
    return true;
  }

  function focusCard(index) {
    focusIndex = Math.max(0, Math.min(APPS.length + SOURCES.length - 1, index));
    var card = focusIndex < APPS.length
      ? grid.children[focusIndex] : sourceGrid.children[focusIndex - APPS.length];
    if (card) { card.focus(); }
  }

  // HbbTV handoff adapted from AeroTizen; see THIRD_PARTY_NOTICES.md.
  function findHbbtvLink(appId) {
    if (!tizen.application.getAppMetaData) { return ""; }
    try {
      var metadata = tizen.application.getAppMetaData(appId);
      for (var i = 0; metadata && i < metadata.length; i += 1) {
        var entry = metadata[i];
        if (entry.key === "http://samsung.com/tv/metadata/hbbtv.link" &&
            typeof entry.value === "string" && entry.value.trim()) {
          return entry.value.trim();
        }
      }
    } catch (error) { /* Older TVs may not expose another app's metadata. */ }
    return "";
  }

  function launchHbbtv(appId, link, label) {
    // HbbTV shortcuts launch a shared host, not the installed shortcut itself.
    // The host needs these named data fields; putting the URL in uri is ignored.
    try {
      var data = [
        new tizen.ApplicationControlData("tizenid", [appId]),
        new tizen.ApplicationControlData("hbbtv", [link]),
        new tizen.ApplicationControlData("deeplink", ["true"])
      ];
      var control = new tizen.ApplicationControl(
        "http://tizen.org/appcontrol/operation/default", null, null, null, data);
      tizen.application.launchAppControl(control, "org.tizen.hbbtv", function () {}, function (error) {
        showToast("Kunde inte öppna " + label + ": " + (error.message || error.name));
      });
    } catch (error) {
      showToast("Kunde inte öppna " + label + ": " + (error.message || error.name));
    }
  }

  function activate(index) {
    var definition = APPS[index];
    var app = findInstalled(definition);
    if (!app) { openPicker(index); return; }
    if (!isTizen) { showToast("Förhandsvisning: " + definition.label); return; }
    var hbbtvLink = findHbbtvLink(app.id);
    if (hbbtvLink) { launchHbbtv(app.id, hbbtvLink, definition.label); return; }
    var ids = (definition.launchIds || []).slice();
    if (ids.indexOf(app.id) < 0) { ids.push(app.id); }
    var position = 0;
    var lastError = "TV:n stannade i startvyn";
    function tryLaunch() {
      if (position >= ids.length) {
        showToast("Kunde inte öppna " + definition.label + ": " + lastError);
        return;
      }
      var id = ids[position];
      position += 1;
      try {
        tizen.application.launch(id, function () {}, function (error) {
          lastError = error.message || error.name;
          tryLaunch();
        });
      } catch (error) {
        lastError = error.message || error.name;
        tryLaunch();
      }
    }
    tryLaunch();
  }

  function activateSource(index) {
    var definition = SOURCES[index];
    var source = availableSources.find(function (item) {
      return item.type === "HDMI" && Number(item.number) === definition.port;
    });
    if (!isTizen) { showToast("Förhandsvisning: " + definition.label); return; }
    if (!source || !tizen.tvwindow) {
      showToast("TV:n rapporterar inte HDMI " + definition.port + ".");
      return;
    }
    try {
      tizen.tvwindow.setSource(source, function () {
        try {
          tizen.tvwindow.show(function () { sourceOpen = true; sourceNeedsReset = true; }, function (error) {
            showToast("Kunde inte visa " + definition.label + ": " + error.message);
          }, ["0%", "0%", "100%", "100%"], "MAIN", "FRONT");
        } catch (error) {
          showToast("Kunde inte visa " + definition.label + ": " + error.message);
        }
      }, function (error) {
        showToast("Kunde inte välja " + definition.label + ": " + error.message);
      });
    } catch (error) {
      showToast("Kunde inte välja " + definition.label + ": " + error.message);
    }
  }

  function closeSource(silent, force) {
    if ((!sourceOpen && !(force && sourceNeedsReset)) || !isTizen || !tizen.tvwindow) { return; }
    try {
      tizen.tvwindow.hide(function () {
        sourceOpen = false;
        if (!document.hidden) { sourceNeedsReset = false; }
      }, function (error) {
        if (!silent) { showToast("Kunde inte stänga ingången: " + error.message); }
      });
    } catch (error) {
      if (!silent) { showToast("Kunde inte stänga ingången: " + error.message); }
    }
  }

  function loadSources() {
    if (!isTizen || !tizen.systeminfo) { return; }
    try {
      tizen.systeminfo.getPropertyValue("VIDEOSOURCE", function (videoSources) {
        availableSources = (videoSources.connected || []).concat(videoSources.disconnected || []);
      }, function (error) {
        showToast("Kunde inte läsa TV:ns ingångar: " + error.message);
      });
    } catch (error) {
      showToast("Kunde inte läsa TV:ns ingångar: " + error.message);
    }
  }

  function openPicker(index) {
    pickerFor = index;
    pickerFocus = 0;
    document.getElementById("picker-title").textContent = "Välj app för " + APPS[index].label;
    pickerList.innerHTML = "";
    var names = APPS[index].names.map(normalized);
    var sorted = installed.slice().sort(function (a, b) {
      var aMatch = names.some(function (name) { return normalized(a.name).indexOf(name) >= 0; });
      var bMatch = names.some(function (name) { return normalized(b.name).indexOf(name) >= 0; });
      if (aMatch !== bMatch) { return aMatch ? -1 : 1; }
      return a.name.localeCompare(b.name);
    });
    sorted.forEach(function (app, position) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "picker-item";
      button.textContent = app.name;
      button.addEventListener("click", function () {
        bound[APPS[index].key] = app.id;
        saveBindings();
        closePicker();
        render();
        showToast(APPS[index].label + " är kopplad.");
      });
      button.addEventListener("focus", function () { pickerFocus = position; });
      pickerList.appendChild(button);
    });
    if (!sorted.length) {
      var empty = document.createElement("p");
      empty.textContent = "TV:n rapporterade inga installerade appar.";
      pickerList.appendChild(empty);
    }
    backdrop.hidden = false;
    focusPicker(0);
  }

  function focusPicker(index) {
    var items = pickerList.querySelectorAll("button");
    if (!items.length) { return; }
    pickerFocus = Math.max(0, Math.min(items.length - 1, index));
    items[pickerFocus].focus();
    items[pickerFocus].scrollIntoView({ block: "nearest" });
  }

  function closePicker() {
    backdrop.hidden = true;
    pickerFor = -1;
    focusCard(focusIndex);
  }

  function showToast(message) {
    var toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("visible"); }, 3500);
  }

  function updateClock() {
    clock.textContent = new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
  }

  function moveFocus(direction) {
    var current = document.activeElement;
    var origin = current && current.getBoundingClientRect ? current.getBoundingClientRect() : null;
    if (!origin) { focusCard(0); return; }
    var x = origin.left + origin.width / 2;
    var y = origin.top + origin.height / 2;
    var buttons = Array.prototype.slice.call(document.querySelectorAll(
      "#add-watch, .app-card, .watch-open, .watch-action"));
    var best = null;
    var bestScore = Infinity;
    buttons.forEach(function (button) {
      if (button === current || button.offsetParent === null) { return; }
      var rect = button.getBoundingClientRect();
      var dx = rect.left + rect.width / 2 - x;
      var dy = rect.top + rect.height / 2 - y;
      var primary = direction === "left" ? -dx : direction === "right" ? dx :
        direction === "up" ? -dy : dy;
      if (primary <= 8) { return; }
      var cross = direction === "left" || direction === "right" ? Math.abs(dy) : Math.abs(dx);
      var score = primary + cross * 2;
      if (score < bestScore) { best = button; bestScore = score; }
    });
    if (best) {
      best.focus();
      best.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  function onKey(event) {
    var code = event.keyCode;
    var key = event.key;
    if (sourceOpen) {
      if (key === "Escape" || code === 10009) {
        event.preventDefault();
        closeSource(false);
      }
      return;
    }
    if (pickerFor >= 0) {
      if (key === "ArrowUp" || code === 38) { event.preventDefault(); focusPicker(pickerFocus - 1); }
      else if (key === "ArrowDown" || code === 40) { event.preventDefault(); focusPicker(pickerFocus + 1); }
      else if (key === "Escape" || code === 10009) { event.preventDefault(); closePicker(); }
      return;
    }
    if (watchDialogOpen) {
      if (key === "Escape" || code === 10009) { event.preventDefault(); closeWatchDialog(); }
      else if (key === "ArrowRight" || key === "ArrowLeft" || key === "ArrowDown" || key === "ArrowUp") {
        var controls = Array.prototype.slice.call(watchForm.querySelectorAll("input, select, button"));
        var currentIndex = controls.indexOf(document.activeElement);
        if (currentIndex >= 0 && (document.activeElement.tagName !== "SELECT" || key === "ArrowRight" || key === "ArrowLeft")) {
          event.preventDefault();
          var step = key === "ArrowRight" || key === "ArrowDown" ? 1 : -1;
          controls[Math.max(0, Math.min(controls.length - 1, currentIndex + step))].focus();
        }
      }
      return;
    }
    if (key === "ArrowLeft" || code === 37) {
      event.preventDefault(); moveFocus("left");
    } else if (key === "ArrowRight" || code === 39) {
      event.preventDefault(); moveFocus("right");
    } else if (key === "ArrowUp" || code === 38) {
      event.preventDefault(); moveFocus("up");
    } else if (key === "ArrowDown" || code === 40) {
      event.preventDefault(); moveFocus("down");
    } else if (key === "Escape" || code === 10009) {
      if (isTizen) { tizen.application.getCurrentApplication().exit(); }
    }
  }

  APPS.forEach(function (app) {
    var option = document.createElement("option");
    option.value = app.key;
    option.textContent = app.label;
    watchApp.appendChild(option);
  });
  document.getElementById("add-watch").addEventListener("click", openWatchDialog);
  document.getElementById("watch-cancel").addEventListener("click", closeWatchDialog);
  watchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var title = watchTitle.value.trim();
    var date = watchDate.value.trim();
    var time = watchTime.value.trim();
    var appKey = watchApp.value;
    if (!title || !APPS.some(function (app) { return app.key === appKey; })) {
      document.getElementById("watch-error").textContent = "Fyll i program och app.";
      return;
    }
    if (!validSchedule(date, time)) {
      document.getElementById("watch-error").textContent = "Datum och tid är valfria. Använd ÅÅÅÅ-MM-DD respektive TT:MM när du fyller i dem.";
      return;
    }
    watching.push({ id: String(Date.now()) + "-" + Math.random().toString(36).slice(2, 7),
      title: title, appKey: appKey, date: date, time: time, paused: false });
    saveWatching();
    renderWatching();
    closeWatchDialog();
    showToast("Programmet lades till.");
  });
  document.addEventListener("keydown", onKey);
  document.addEventListener("visibilitychange", function () {
    closeSource(true, true);
    if (!document.hidden) { updateClock(); }
  });
  window.addEventListener("pagehide", function () { closeSource(true, true); });
  window.addEventListener("focus", function () { closeSource(true, true); });
  window.addEventListener("pageshow", function () { closeSource(true, true); });
  updateClock();
  setInterval(updateClock, 30000);
  renderWatching();

  if (isTizen) {
    loadSources();
    try {
      tizen.application.getAppsInfo(function (apps) {
        var ownId = tizen.application.getCurrentApplication().appInfo.id;
        installed = apps.filter(function (app) { return app.id !== ownId && !!app.name; });
        render();
      }, function (error) {
        showToast("Kunde inte läsa TV:ns appar: " + error.message);
        render();
      });
    } catch (error) {
      showToast("Kunde inte läsa TV:ns appar: " + error.message);
      render();
    }
  } else {
    installed = APPS.map(function (app) { return { id: "preview." + app.key, name: app.names[0] }; });
    render();
  }
}());
