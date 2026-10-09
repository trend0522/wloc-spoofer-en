import EN from "./i18n.en.js";
import ZHTW from "./i18n.zh-tw.js";

// Embed dicts as JSON, escaping every `<` as \u003c so a `</script>` inside a
// dict string can never terminate the inline block (browser JS decodes it back to `<`).
const embed = o => JSON.stringify(o).replace(/</g, "\\u003c");

export function getPageHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${EN.title}</title>
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="WLOC">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
:root {
  color-scheme: light;
  --blue:#0062d9; --green:#1e7a34; --red:#d63027; --orange:#ff9500;
  --bg:#f2f2f7; --card:#fff; --text:#333; --text2:#4b5563; --ph:#4b5563;
  --line:#d1d1d6; --chip:#e5e5ea; --pill:rgba(255,255,255,.92);
  --toast-bg:rgba(0,0,0,.8); --toast-fg:#fff; --on-accent:#fff; --error-bg:#d70015;
  --shadow:0 2px 8px rgba(0,0,0,.15);
}
/* Theme tokens. data-theme=dark always wins; auto follows the OS. */
html[data-theme=dark] {
  color-scheme: dark;
  --blue:#0a84ff; --green:#30d158; --red:#ff453a;
  --bg:#0b0b0d; --card:#1c1c1e; --text:#ebebf0; --text2:#a1a1a6; --ph:#8e8e93;
  --line:#38383a; --chip:#2c2c2e; --pill:rgba(28,28,30,.92);
  --toast-bg:#48484a; --on-accent:#000; --error-bg:#a01410;
  --shadow:0 2px 8px rgba(0,0,0,.5);
}
@media (prefers-color-scheme: dark) {
  html:not([data-theme]), html[data-theme=auto] {
    color-scheme: dark;
    --blue:#0a84ff; --green:#30d158; --red:#ff453a;
    --bg:#0b0b0d; --card:#1c1c1e; --text:#ebebf0; --text2:#a1a1a6; --ph:#8e8e93;
    --line:#38383a; --chip:#2c2c2e; --pill:rgba(28,28,30,.92);
    --toast-bg:#48484a; --on-accent:#000; --error-bg:#a01410;
    --shadow:0 2px 8px rgba(0,0,0,.5);
  }
}
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,system-ui,"SF Pro","Helvetica Neue",sans-serif; background:var(--bg); color:var(--text); overscroll-behavior-y:none; }
#map { height:50vh; width:100%; min-height:250px; }
.panel { padding:16px; max-width:600px; margin:0 auto; }
.card { background:var(--card); border-radius:12px; padding:16px; margin-bottom:12px; box-shadow:0 1px 3px rgba(0,0,0,.08); }
.card h3 { font-size:15px; font-weight:600; margin-bottom:10px; }
.coords { font-family:"SF Mono",monospace; font-size:14px; color:var(--text); padding:8px 12px; background:var(--bg); border-radius:8px; word-break:break-all; }
.row { display:flex; gap:8px; margin-top:10px; flex-wrap:wrap; }
.btn { flex:1; min-width:100px; padding:12px 16px; border:none; border-radius:10px; font-size:14px; font-weight:500; cursor:pointer; transition:all .15s; }
.btn-primary { background:var(--blue); color:var(--on-accent); }
.btn-primary:active { transform:scale(.97); }
.btn-secondary { background:var(--chip); color:var(--text); }
.btn-secondary:active { transform:scale(.97); }
.btn:disabled { background:var(--chip); color:var(--text2); opacity:1; cursor:default; }
.btn-danger { background:var(--red); color:var(--on-accent); }
.btn-danger:active { transform:scale(.97); }
.btn.success { background:var(--green); color:var(--on-accent); }
.btn-sm { flex:none; min-width:auto; min-height:40px; padding:6px 12px; font-size:13px; border-radius:8px; }
.input-row { display:flex; gap:8px; margin-top:10px; }
.input-row input { flex:1; padding:10px 12px; border:1px solid var(--line); border-radius:8px; font-size:14px; outline:none; min-width:0; background:var(--card); color:var(--text); }
.input-row input::placeholder { color:var(--ph); }
.input-row input:focus { border-color:var(--blue); }
.status { font-size:13px; color:var(--text2); margin-top:8px; text-align:center; }
.hint { font-size:13px; color:var(--text2); margin-top:6px; }
.error-banner { background:var(--error-bg); color:#fff; padding:14px 16px; border-radius:12px; margin-bottom:12px; font-size:14px; line-height:1.5; display:none; flex-direction:column; align-items:flex-start; gap:10px; }
.error-banner b { display:block; margin-bottom:4px; }
.retry-btn { min-height:44px; padding:8px 16px; border:1px solid rgba(255,255,255,.85); border-radius:8px; background:transparent; color:#fff; font-size:14px; font-weight:500; cursor:pointer; }
.toast { position:fixed; top:60px; left:50%; transform:translateX(-50%); background:var(--toast-bg); color:var(--toast-fg); padding:10px 20px; border-radius:20px; font-size:14px; opacity:0; transition:opacity .3s; pointer-events:none; z-index:9999; max-width:90vw; text-align:center; }
.toast.show { opacity:1; }
.active-loc { background:var(--bg); border-radius:8px; padding:10px 12px; font-size:13px; color:var(--text); }
.active-loc .label { font-size:12px; color:var(--text2); margin-bottom:4px; }
.active-loc .value { font-family:"SF Mono",monospace; font-size:13px; }
.fav-list { max-height:240px; overflow-y:auto; }
.fav-item { display:flex; align-items:center; gap:8px; padding:10px 12px; background:var(--bg); border-radius:8px; margin-bottom:6px; cursor:pointer; transition:background .15s; min-height:44px; }
.fav-item:active { background:var(--chip); }
.fav-item .fav-info { flex:1; min-width:0; }
.fav-item .fav-name { font-size:14px; font-weight:500; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.fav-item .fav-coords { font-size:12px; color:var(--text2); font-family:"SF Mono",monospace; margin-top:2px; }
.fav-item .fav-active { font-size:12px; color:var(--green); font-weight:600; }
.fav-item .fav-del { flex:none; width:44px; height:44px; border:none; border-radius:50%; background:transparent; color:var(--red); font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .15s; }
.fav-item .fav-del:hover { background:rgba(255,59,48,.1); }
.fav-empty { text-align:center; color:var(--text2); font-size:13px; padding:16px 0; }
.fav-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.fav-header h3 { margin-bottom:0; }
.modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,.4); z-index:10000; display:none; align-items:center; justify-content:center; padding:20px; }
.modal-overlay.show { display:flex; }
.modal { background:var(--card); border-radius:16px; padding:20px; width:100%; max-width:340px; }
.modal h3 { font-size:17px; font-weight:600; margin-bottom:16px; text-align:center; }
.modal input { width:100%; padding:12px; border:1px solid var(--line); border-radius:10px; font-size:15px; outline:none; margin-bottom:12px; background:var(--card); color:var(--text); }
.modal input::placeholder { color:var(--ph); }
.modal input:focus { border-color:var(--blue); }
.modal .modal-btns { display:flex; gap:8px; }
.modal .modal-btns .btn { padding:12px; }
.lang-switch { position:absolute; top:10px; left:10px; z-index:1001; display:flex; gap:2px; background:var(--pill); border:1px solid var(--line); border-radius:8px; padding:4px; box-shadow:var(--shadow); }
.lang-btn { border:none; background:transparent; padding:6px 11px; min-height:36px; border-radius:6px; font-size:13px; font-weight:600; color:var(--text); cursor:pointer; transition:all .15s; }
.lang-btn.active { background:var(--blue); color:var(--on-accent); }
.lang-btn:active { transform:scale(.95); }
.map-tools { position:absolute; top:10px; right:10px; z-index:1001; display:flex; gap:6px; align-items:flex-start; }
.tool-btn { width:44px; height:44px; flex:none; display:flex; align-items:center; justify-content:center; background:var(--pill); border:1px solid var(--line); border-radius:10px; color:var(--text); cursor:pointer; box-shadow:var(--shadow); padding:0; }
.tool-btn svg { width:20px; height:20px; }
.layer-popover { position:absolute; top:50px; right:0; width:250px; max-width:calc(100vw - 24px); background:var(--card); border:1px solid var(--line); border-radius:12px; box-shadow:var(--shadow); padding:8px; display:none; flex-direction:column; gap:2px; }
.layer-popover.show { display:flex; }
.lp-group { font-size:12px; font-weight:600; color:var(--text2); padding:8px 8px 2px; }
.lp-item { display:flex; flex-direction:column; align-items:flex-start; gap:2px; width:100%; min-height:44px; padding:8px 10px; border:none; background:transparent; border-radius:8px; cursor:pointer; text-align:left; color:var(--text); }
.lp-item .lp-name { font-size:14px; font-weight:500; }
.lp-item .lp-desc { font-size:12px; color:var(--text2); }
.lp-item:hover { background:var(--bg); }
.lp-item.active { background:var(--blue); color:var(--on-accent); }
.lp-item.active .lp-desc { color:var(--on-accent); }
.leaflet-control-zoom a { background:var(--card); color:var(--text); border-color:var(--line) !important; }
.leaflet-bar { border:1px solid var(--line); }
.leaflet-control-attribution { background:var(--pill); color:var(--text2); }
.mobile-bar { display:none; }
@media(max-width:768px) {
  .mobile-bar { display:flex; position:fixed; left:0; right:0; bottom:0; z-index:1001; align-items:center; gap:10px; padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px)); background:var(--card); border-top:1px solid var(--line); box-shadow:0 -2px 8px rgba(0,0,0,.12); }
  .mb-coords { flex:1; min-width:0; font-family:"SF Mono",monospace; font-size:13px; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .mobile-bar .btn { flex:none; min-width:140px; }
  body { padding-bottom:88px; }
}
@media(max-width:480px) { #map { height:44vh; } .panel { padding:12px; } }
button:focus-visible, [role=button]:focus-visible, input:focus-visible { outline:2px solid var(--blue); outline-offset:2px; }
.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0; }
</style>
<script>try{var th=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',(th==='light'||th==='dark')?th:'auto');}catch(e){}<\/script>
</head>
<body>
<div style="position:relative">
<div id="map"></div>
<div class="lang-switch">
  <button class="lang-btn" data-lang="zh-tw" onclick="setLang('zh-tw')">中</button>
  <button class="lang-btn" data-lang="en" onclick="setLang('en')">EN</button>
</div>
<div class="map-tools">
  <button class="tool-btn" id="themeBtn" onclick="cycleTheme()" aria-label="Theme" title="Theme">
    <svg id="themeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"></svg>
  </button>
  <div style="position:relative">
    <button class="tool-btn" id="layerBtn" onclick="toggleLayerMenu(event)" data-i18n-al="layer_menu" aria-label="Map layer" aria-haspopup="true" aria-expanded="false" title="Map layer">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 22 8.5 12 15 2 8.5"/><polyline points="2 12.5 12 19 22 12.5"/><polyline points="2 16.5 12 23 22 16.5"/></svg>
    </button>
    <div class="layer-popover" id="layerPopover" role="menu" aria-label="Map layer"></div>
  </div>
</div>
</div>
<div class="panel">
  <div class="error-banner" id="errorBanner" role="alert">
    <span id="errorBannerText" data-i18n-html="err_html"></span>
    <button class="retry-btn" id="retryBtn" data-i18n="retry" onclick="retryLastAction()">Retry</button>
  </div>
  <div class="card">
    <h3 data-i18n="choose_title">Choose target location</h3>
    <div class="coords" id="coords">Tap the map or use the tools below to pick a location</div>
    <div class="row">
      <button class="btn btn-primary" id="saveBtn" data-i18n="save" onclick="save()">Save to Device</button>
      <button class="btn btn-secondary" data-i18n="add_fav" onclick="addFav()">Add Favorite</button>
      <button class="btn btn-secondary" data-i18n="locate" onclick="locateMe()">Current Location</button>
    </div>
  </div>
  <div class="card">
    <div class="fav-header">
      <h3 data-i18n="fav_title">Favorites</h3>
      <button class="btn btn-sm btn-secondary" data-i18n="clear_all" onclick="clearAllFav()" id="clearAllBtn" style="display:none">Clear All</button>
    </div>
    <div id="favList" class="fav-list"></div>
  </div>
  <div class="card">
    <h3 data-i18n="active_title">Active coordinates</h3>
    <div class="active-loc" id="activeLoc">
      <div class="label" data-i18n="active_label">Device persisted data (wloc_settings)</div>
      <div class="value" id="activeValue">Querying...</div>
    </div>
    <div class="row">
      <button class="btn btn-sm btn-secondary" data-i18n="refresh" onclick="queryActive()">Refresh</button>
      <button class="btn btn-sm btn-danger" data-i18n="clear_data" onclick="clearActive()">Clear Data</button>
    </div>
  </div>
  <div class="card">
    <h3 data-i18n="paste_title">Paste map link</h3>
    <div class="input-row">
      <input id="urlInput" data-i18n-al="paste_ph" data-i18n-ph="paste_ph" placeholder="Apple/Google/Amap map link or coordinates" />
      <button class="btn btn-secondary" style="flex:none;min-width:56px" data-i18n="parse" onclick="parseUrl()">Parse</button>
    </div>
    <div class="hint" data-i18n="paste_hint">Supports Apple Maps · Google Maps · Amap · Baidu · coordinate text</div>
  </div>
  <div class="card">
    <h3 data-i18n="search_title">Search place</h3>
    <div class="input-row">
      <input id="searchInput" data-i18n-al="search_ph" data-i18n-ph="search_ph" placeholder="Enter a place name (e.g. The Bund, Shanghai)" />
      <button class="btn btn-secondary" style="flex:none;min-width:56px" data-i18n="search" onclick="searchPlace()">Search</button>
    </div>
  </div>
  <div class="status" id="status" aria-live="polite">Pick a location, then tap "Save to Device" to write it to your proxy tool</div>
</div>
<div class="mobile-bar" id="mobileBar">
  <div class="mb-coords" id="mbCoords">Tap the map to pick</div>
  <button class="btn btn-primary" id="mbSaveBtn" data-i18n="save" onclick="save()" disabled>Save to Device</button>
</div>
<div class="sr-only" id="themeAnnounce" role="status" aria-live="polite"></div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<div class="modal-overlay" id="favModal">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="favModalTitle">
    <h3 id="favModalTitle" data-i18n="modal_title">Add this location to favorites</h3>
    <input id="favNameInput" data-i18n-al="modal_ph" data-i18n-ph="modal_ph" placeholder="Enter a label (e.g. Office, Home)" maxlength="30" />
    <div style="font-size:13px;color:var(--text2);margin-bottom:12px;text-align:center" id="favModalCoords"></div>
    <div class="modal-btns">
      <button class="btn btn-secondary" data-i18n="cancel" onclick="closeFavModal()">Cancel</button>
      <button class="btn btn-primary" data-i18n="save_short" onclick="confirmFav()">Save</button>
    </div>
  </div>
</div>
<script>
const SAVE_API = 'https://gs-loc.apple.com/wloc-settings/save';
const FAV_KEY = 'wloc_favorites';
const LANG_KEY = 'wloc_lang';
let lat = 22.544577, lon = 113.94114;
let selected = false;
let activeLon = null, activeLat = null, activeAcc = null, activeStatus = 'querying';
let savedLon = null, savedLat = null, savedTimeStr = '';
let saveResetTimer = null;

/* ---- i18n: dictionaries live in worker/src/i18n.en.js + i18n.zh-tw.js, embedded below as JSON ---- */
const I18N = ${embed(EN)};
const I18N_ZH_TW = ${embed(ZHTW)};

function detectLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'zh-tw' || saved === 'en') return saved;
  } catch(e) {}
  // Default follows navigator.language: zh* -> Traditional Chinese, everything else -> English.
  const n = (navigator.language || 'en').toLowerCase();
  return n.indexOf('zh') === 0 ? 'zh-tw' : 'en';
}
let lang = detectLang();

function t(key) {
  let v = (lang === 'zh-tw' ? I18N_ZH_TW : I18N)[key];
  if (v === undefined) v = I18N[key];
  if (v === undefined) return key;
  const args = Array.prototype.slice.call(arguments, 1);
  return String(v).replace(/\\{\\}/g, () => {
    const a = args.shift();
    return typeof a === 'number' ? a.toFixed(6) : String(a);
  });
}

function applyI18n() {
  document.documentElement.lang = (lang === 'zh-tw' ? 'zh-TW' : 'en');
  document.title = t('title');
  document.querySelectorAll('[data-i18n]').forEach(function(el){ el.textContent = t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-ph]').forEach(function(el){ el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph'))); });
  document.querySelectorAll('[data-i18n-al]').forEach(function(el){ el.setAttribute('aria-label', t(el.getAttribute('data-i18n-al'))); });
  document.querySelectorAll('[data-i18n-html]').forEach(function(el){ el.innerHTML = t(el.getAttribute('data-i18n-html')); });
  document.querySelectorAll('.lang-btn').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-lang') === lang); });
  document.getElementById('layerBtn').setAttribute('title', t('layer_menu'));
  applyTheme();
  renderLayerPopover();
  updateCoords();
  updateStatus();
  renderActive();
  renderFavs();
}

function setLang(l) {
  lang = l;
  try { localStorage.setItem(LANG_KEY, l); } catch(e) {}
  applyI18n();
}

const map = L.map('map').setView([lat, lon], 13); map.zoomControl.setPosition('bottomright');
const tiles = {
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {maxZoom:19, attribution:'ArcGIS'}),
  wgs84: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {maxZoom:19, attribution:'ArcGIS WGS84'}),
  standard: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'\\u00a9 OSM'}),
  dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {maxZoom:19, attribution:'\\u00a9 Carto'}),
  amap: L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {maxZoom:18, subdomains:'1234', attribution:'\\u00a9 Amap'}),
  voyager: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {maxZoom:19, attribution:'\\u00a9 Carto'})
};
let currentLayer = tiles.satellite;
currentLayer.addTo(map);
let currentLayerName = 'satellite';
function switchLayer(name) {
  map.removeLayer(currentLayer);
  currentLayer = tiles[name];
  currentLayer.addTo(map);
  currentLayerName = name;
  renderLayerPopover();
  closeLayerMenu();
}

/* ---- P1a: single layer button opening a grouped popover (tile objects/defaults/GCJ untouched) ---- */
const LAYER_GROUPS = [
  { label: 'group_base', items: [
    { key:'satellite', name:'layer_satellite', desc:'layerdesc_satellite' },
    { key:'wgs84', name:'layer_wgs84', desc:'layerdesc_wgs84' },
    { key:'voyager', name:'layer_color', desc:'layerdesc_voyager' },
    { key:'standard', name:'layer_standard', desc:'layerdesc_standard' },
    { key:'dark', name:'layer_dark', desc:'layerdesc_dark' }
  ]},
  { label: 'group_china', items: [
    { key:'amap', name:'layer_amap', desc:'layerdesc_amap' }
  ]}
];
function renderLayerPopover() {
  const el = document.getElementById('layerPopover');
  if (!el) return;
  el.innerHTML = LAYER_GROUPS.map(g =>
    '<div class="lp-group">' + escHtml(t(g.label)) + '</div>' +
    g.items.map(it =>
      '<button class="lp-item' + (currentLayerName === it.key ? ' active' : '') + '" role="menuitemradio" aria-checked="' + (currentLayerName === it.key) + '" data-layer="' + it.key + '">' +
        '<span class="lp-name">' + escHtml(t(it.name)) + '</span>' +
        '<span class="lp-desc">' + escHtml(t(it.desc)) + '</span>' +
      '</button>').join('')
  ).join('');
}
function toggleLayerMenu(ev) {
  if (ev) ev.stopPropagation();
  const p = document.getElementById('layerPopover');
  const open = p.classList.toggle('show');
  document.getElementById('layerBtn').setAttribute('aria-expanded', open ? 'true' : 'false');
}
function closeLayerMenu() {
  const p = document.getElementById('layerPopover');
  if (p && p.classList.contains('show')) {
    p.classList.remove('show');
    document.getElementById('layerBtn').setAttribute('aria-expanded', 'false');
  }
}
document.getElementById('layerPopover').addEventListener('click', e => {
  const it = e.target.closest('.lp-item');
  if (it) switchLayer(it.dataset.layer);
});
document.addEventListener('click', e => { if (!e.target.closest('.map-tools')) closeLayerMenu(); });

/* ---- Theme tri-state: auto (follow system) -> light -> dark -> auto. data-theme beats the media query. ---- */
const THEME_KEY = 'theme';
let theme = 'auto';
try { const s = localStorage.getItem(THEME_KEY); if (s === 'light' || s === 'dark') theme = s; } catch(e) {}
const THEME_ICONS = {
  auto: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18" fill="none"/><path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" stroke="none"/>',
  light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  dark: '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.8 6.8 0 0 0 9.8 9.8z"/>'
};
function applyTheme() {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeIcon').innerHTML = THEME_ICONS[theme];
  const label = t('theme_' + theme);
  document.getElementById('themeBtn').setAttribute('aria-label', t('theme_label') + ': ' + label);
  document.getElementById('themeBtn').setAttribute('title', label);
}
function cycleTheme() {
  theme = theme === 'auto' ? 'light' : theme === 'light' ? 'dark' : 'auto';
  try { localStorage.setItem(THEME_KEY, theme); } catch(e) {}
  applyTheme();
  document.getElementById('themeAnnounce').textContent = t('theme_announce', t('theme_' + theme));
}
applyTheme();
let marker = L.marker([lat, lon], {draggable:true}).addTo(map);

marker.on('dragend', e => { const p=e.target.getLatLng(); setPos(p.lat, p.lng); });
map.on('click', e => { setPos(e.latlng.lat, e.latlng.lng); });

function updateCoords() {
  const txt = selected
    ? (t('lon') + ' ' + lon.toFixed(6) + '  ' + t('lat') + ' ' + lat.toFixed(6))
    : t('coords_hint');
  document.getElementById('coords').textContent = txt;
  const mb = document.getElementById('mbCoords');
  if (mb) mb.textContent = selected ? (lon.toFixed(6) + ', ' + lat.toFixed(6)) : t('coords_hint_short');
  const mbs = document.getElementById('mbSaveBtn');
  if (mbs) mbs.disabled = !selected;
}

function updateStatus() {
  document.getElementById('status').textContent = (savedLon !== null)
    ? t('written', savedLon, savedLat, savedTimeStr)
    : t('status_hint');
}

function setPos(newLat, newLon) {
  lat = newLat; lon = newLon; selected = true;
  marker.setLatLng([lat, lon]);
  updateCoords();
}

function moveTo(newLat, newLon, zoom) {
  setPos(newLat, newLon);
  map.setView([lat, lon], zoom || 15);
}

function toast(msg, ms) {
  const t2 = document.getElementById('toast');
  t2.textContent = msg; t2.classList.add('show');
  setTimeout(() => t2.classList.remove('show'), ms || 1500);
}

let lastFailedAction = null;
function showError(show, retryFn) {
  document.getElementById('errorBanner').style.display = show ? 'flex' : 'none';
  lastFailedAction = show ? (retryFn || null) : null;
  document.getElementById('retryBtn').style.visibility = lastFailedAction ? 'visible' : 'hidden';
}
function retryLastAction() { if (lastFailedAction) lastFailedAction(); }

/* ---- Favorites (localStorage) ---- */
function getFavs() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch(e) { return []; }
}
function saveFavs(favs) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
}

function renderFavs() {
  const favs = getFavs();
  const el = document.getElementById('favList');
  const clearBtn = document.getElementById('clearAllBtn');
  clearBtn.style.display = favs.length ? '' : 'none';
  if (!favs.length) {
    el.innerHTML = '<div class="fav-empty">' + escHtml(t('fav_empty')) + '<\\/div>';
    return;
  }
  el.innerHTML = favs.map((f, i) => {
    const isActive = activeLon !== null && Math.abs(f.lon - activeLon) < 0.000001 && Math.abs(f.lat - activeLat) < 0.000001;
    return '<div class="fav-item" role="button" tabindex="0" aria-label="' + escHtml(f.name) + '" data-fav="' + i + '">' +
      '<div class="fav-info">' +
        '<div class="fav-name">' + escHtml(f.name) + '<\\/div>' +
        '<div class="fav-coords">' + f.lon.toFixed(6) + ', ' + f.lat.toFixed(6) + '<\\/div>' +
        (isActive ? '<div class="fav-active">' + escHtml(t('active_now')) + '<\\/div>' : '') +
      '<\\/div>' +
      '<button class="fav-del" onclick="event.stopPropagation();delFav(' + i + ')" title="' + escHtml(t('del')) + '" aria-label="' + escHtml(t('del')) + '">\\u00d7<\\/button>' +
    '<\\/div>';
  }).join('');
}

/* favorites: keyboard-operable via delegation (avoids nested-quote inline handlers) */
document.getElementById('favList').addEventListener('click', e => {
  const it = e.target.closest('.fav-item');
  if (it && !e.target.closest('.fav-del')) loadFav(+it.dataset.fav);
});
document.getElementById('favList').addEventListener('keydown', e => {
  const it = e.target.closest('.fav-item');
  if (it && !e.target.closest('.fav-del') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); loadFav(+it.dataset.fav); }
});

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

let lastFocused = null;
function addFav() {
  if (!selected) { toast(t('pick_first')); return; }
  document.getElementById('favModalCoords').textContent = lon.toFixed(6) + ', ' + lat.toFixed(6);
  document.getElementById('favNameInput').value = '';
  lastFocused = document.activeElement;
  document.getElementById('favModal').classList.add('show');
  document.getElementById('favNameInput').focus();
}

function closeFavModal() {
  document.getElementById('favModal').classList.remove('show');
  if (lastFocused && lastFocused.focus) lastFocused.focus();
}

/* Esc closes; Tab cycles inside the dialog (focus trap) */
document.getElementById('favModal').addEventListener('keydown', function(e) {
  if (e.key === 'Escape') { closeFavModal(); return; }
  if (e.key !== 'Tab') return;
  const f = this.querySelector('.modal').querySelectorAll('button, input');
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

function confirmFav() {
  const name = document.getElementById('favNameInput').value.trim();
  if (!name) { toast(t('enter_label')); return; }
  const favs = getFavs();
  favs.push({ name, lon, lat, time: new Date().toISOString() });
  saveFavs(favs);
  closeFavModal();
  renderFavs();
  toast(t('added', name));
}

function loadFav(i) {
  const favs = getFavs();
  if (!favs[i]) return;
  moveTo(favs[i].lat, favs[i].lon, 15);
  toast(favs[i].name + ' (' + favs[i].lon.toFixed(4) + ', ' + favs[i].lat.toFixed(4) + ')');
}

function delFav(i) {
  const favs = getFavs();
  if (!favs[i]) return;
  const name = favs[i].name;
  favs.splice(i, 1);
  saveFavs(favs);
  renderFavs();
  toast(t('deleted', name));
}

function clearAllFav() {
  if (!confirm(t('clear_fav_confirm'))) return;
  saveFavs([]);
  renderFavs();
  toast(t('all_cleared'));
}

/* ---- Active location query ---- */
function renderActive() {
  const el = document.getElementById('activeValue');
  if (activeStatus === 'ok') {
    el.textContent = t('lon') + ' ' + activeLon.toFixed(6) + '  ' + t('lat') + ' ' + activeLat.toFixed(6) + (activeAcc ? ('  ' + t('acc') + ' ' + activeAcc + 'm') : '');
  } else if (activeStatus === 'none') {
    el.textContent = t('no_saved');
  } else if (activeStatus === 'failed') {
    el.textContent = t('query_wait');
  } else if (activeStatus === 'cleared') {
    el.textContent = t('cleared');
  } else {
    el.textContent = t('querying');
  }
}

function queryActive() {
  activeStatus = 'querying';
  renderActive();
  fetch(SAVE_API + '?action=query', { method:'GET', mode:'cors', cache:'no-store', signal: AbortSignal.timeout(8000) })
    .then(r => r.json())
    .then(d => {
      if (d.success && d.longitude != null && d.latitude != null) {
        activeLon = parseFloat(d.longitude);
        activeLat = parseFloat(d.latitude);
        activeAcc = d.accuracy || null;
        activeStatus = 'ok';
      } else {
        activeLon = null; activeLat = null; activeAcc = null;
        activeStatus = 'none';
      }
      showError(false);
      renderActive();
      renderFavs();
    })
    .catch(() => { activeStatus = 'failed'; renderActive(); showError(true, queryActive); });
}

function clearActive() {
  if (!confirm(t('clear_confirm'))) return;
  fetch(SAVE_API + '?action=clear', { method:'GET', mode:'cors', cache:'no-store', signal: AbortSignal.timeout(8000) })
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        activeLon = null; activeLat = null; activeAcc = null;
        savedLon = null; savedLat = null; savedTimeStr = '';
        activeStatus = 'cleared';
        updateStatus();
        renderActive();
        renderFavs();
        toast(t('dev_cleared'));
      } else { showError(true, clearActive); toast(t('write_failed')); }
    })
    .catch(() => { showError(true, clearActive); });
}

/* ---- Save to device ---- */
async function save() {
  if (!selected) { toast(t('pick_first')); return; }
  const btn = document.getElementById('saveBtn');
  const mb = document.getElementById('mbSaveBtn');
  btn.textContent = t('saving'); btn.disabled = true;
  if (mb) { mb.textContent = t('saving'); mb.disabled = true; }
  showError(false);
  try {
    const r = await fetch(SAVE_API + '?lon=' + lon + '&lat=' + lat + '&acc=25', {
      method: 'GET', mode: 'cors', cache: 'no-store', signal: AbortSignal.timeout(8000)
    });
    const d = await r.json();
    if (d.success) {
      activeLon = lon; activeLat = lat; activeAcc = 25; activeStatus = 'ok';
      savedLon = lon; savedLat = lat; savedTimeStr = new Date().toLocaleTimeString();
      btn.textContent = t('saved'); btn.className = 'btn btn-primary success';
      if (mb) { mb.textContent = t('saved'); mb.className = 'btn btn-primary success'; }
      updateStatus();
      renderActive();
      renderFavs();
      toast(t('saved_toast'));
      clearTimeout(saveResetTimer);
      saveResetTimer = setTimeout(() => { btn.textContent = t('save'); btn.className='btn btn-primary'; btn.disabled=false; if (mb) { mb.textContent = t('save'); mb.className='btn btn-primary'; mb.disabled = !selected; } }, 2500);
    } else {
      throw new Error(d.error || t('write_failed'));
    }
  } catch(e) {
    btn.textContent = t('save'); btn.className = 'btn btn-primary'; btn.disabled = false;
    if (mb) { mb.textContent = t('save'); mb.className = 'btn btn-primary'; }
    showError(true, save);
    toast(t('write_failed'));
  }
}

function locateMe() {
  if (!navigator.geolocation) return toast(t('no_geo'));
  toast(t('getting_loc'));
  navigator.geolocation.getCurrentPosition(
    pos => { moveTo(pos.coords.latitude, pos.coords.longitude, 16); toast(t('got_loc')); },
    err => toast(t('loc_failed', err.message), 3000),
    { enableHighAccuracy:true, timeout:10000 }
  );
}

function parseMapUrl(text) {
  let m;
  m = text.match(/ll=([0-9.-]+),([0-9.-]+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  m = text.match(/@([0-9.-]+),([0-9.-]+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  m = text.match(/lnglat=([0-9.-]+),([0-9.-]+)/);
  if (m) return { lat: parseFloat(m[2]), lon: parseFloat(m[1]) };
  m = text.match(/(?:location|center)=([0-9.-]+),([0-9.-]+)/);
  if (m) return orderLatLng(parseFloat(m[1]), parseFloat(m[2]));
  m = text.match(/([0-9]+\\.[0-9]+)[,\\s]+([0-9]+\\.[0-9]+)/);
  if (m) return orderLatLng(parseFloat(m[1]), parseFloat(m[2]));
  return null;
}

function orderLatLng(a, b) {
  if (b < 90 && a > 90) return { lat: b, lon: a };
  return { lat: a, lon: b };
}

function parseUrl() {
  const input = document.getElementById('urlInput').value.trim();
  if (!input) return toast(t('paste_first'));
  const result = parseMapUrl(input);
  if (!result) { toast(t('parse_failed'), 3000); return; }
  moveTo(result.lat, result.lon, 15);
  toast(t('parsed', result.lon.toFixed(4), result.lat.toFixed(4)));
}

async function searchPlace() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return toast(t('enter_place'));
  toast(t('searching'));
  try {
    const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+encodeURIComponent(q), { signal: AbortSignal.timeout(8000) });
    const results = await r.json();
    if (!results.length) { toast(t('not_found', q), 3000); return; }
    const p = results[0];
    moveTo(parseFloat(p.lat), parseFloat(p.lon), 15);
    toast(p.display_name.slice(0, 40));
  } catch(e) { toast(t('search_failed'), 3000); }
}

document.addEventListener('paste', e => {
  const tgt = e.target;
  if (tgt && tgt !== document.body && tgt !== document.getElementById('urlInput')) return;
  const text = (e.clipboardData||window.clipboardData).getData('text');
  if (text && (text.includes('map') || text.includes('loc') || text.includes('lnglat') || /[0-9]+\\.[0-9]+/.test(text))) {
    document.getElementById('urlInput').value = text;
    setTimeout(parseUrl, 200);
  }
});
document.getElementById('searchInput').addEventListener('keydown', e => { if(e.key==='Enter') searchPlace(); });
document.getElementById('urlInput').addEventListener('keydown', e => { if(e.key==='Enter') parseUrl(); });
document.getElementById('favNameInput').addEventListener('keydown', e => { if(e.key==='Enter') confirmFav(); });
document.getElementById('favModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeFavModal(); });

applyI18n();
queryActive();
<\/script>
</body>
</html>`;
}
