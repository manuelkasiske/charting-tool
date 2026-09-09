/* Interface for chart.robertbln.com.
 *
 * The daily chart consists of several coordinate systems ("grids") stacked on
 * top of each other with a shared time axis. One crosshair runs across all
 * panels, and so does the zoom -- hence axisPointer.link and
 * dataZoom.xAxisIndex across all axes.
 *
 * The code is English throughout; every text a visitor reads comes from the
 * table below. German is the default, English is reached through the switch
 * in the top bar, which sets a cookie and reloads -- so the language is fixed
 * by the time this file runs and can simply be read off <html lang>.
 */
"use strict";

// --- Texts ----------------------------------------------------------------
// The counterpart of i18n.py: everything this file draws itself. The split is
// along who renders the text, not along what it says -- panel titles, series
// names and tooltips never pass through the server.

const TEXTS = {
  de: {
    "locale": "de-DE",

    "panel.price": "Kurs, gleitende Durchschnitte und Fibonacci-Niveaus",
    "panel.rsi": "RSI (14)",
    "panel.bollinger": "Bollinger-Bänder (20, 2σ)",
    "panel.ribbon": "Red Ribbon (SMA 12 gegen SMA 30)",
    "panel.macd": "MACD (12, 26, 9)",
    "panel.volume": "Volumen (Spitzen hervorgehoben)",
    "panel.vix": "VIX (Volatilitätsindex)",

    "series.close": "Schlusskurs",
    "series.price": "Kurs",
    "series.volume": "Volumen",
    "series.volume_spike": "Volumenspitze",
    "series.histogram": "Histogramm",
    "series.signal": "Signal",
    "series.bb_band": "Bollinger-Band",
    "series.bb_upper": "Oberes Band",
    "series.bb_middle": "Mittellinie",
    "series.bb_lower": "Unteres Band",
    "series.ribbon_bull_daily": "Ribbon bullish (SMA 12 über 30)",
    "series.ribbon_bear_daily": "Ribbon bearish (SMA 12 unter 30)",
    "series.ribbon_bull": "Ribbon bullish",
    "series.ribbon_bear": "Ribbon bearish",
    "series.m_ema8": "EMA8 Monat",
    "series.m_ema12": "EMA12 Monat",
    "series.weekly_candles": "Wochenkerzen",
    "series.monthly_candles": "Monatskerzen",

    "chart.overbought": "überkauft 70",
    "chart.oversold": "überverkauft 30",
    "chart.running": "läuft noch",
    "chart.fib": "Fib",

    "tooltip.open": "Eröffnung",
    "tooltip.close": "Schluss",
    "tooltip.current": "Stand",
    "tooltip.high": "Hoch",
    "tooltip.low": "Tief",
    "tooltip.week_of": "Woche ab {date}",
    "tooltip.running_suffix": " (läuft noch)",

    "filter.all": "Alle",
    "filter.rsi": "RSI",
    "filter.bollinger": "Bollinger",
    "filter.macd": "MACD",
    "filter.cross": "Kreuze",
    "filter.fib": "Fibonacci",
    "filter.month": "Monat",

    "monthly.months": "({count} Monate)",
    "monthly.above_ema8": "über EMA8",
    "monthly.below_ema8": "unter EMA8",
    "monthly.below_both": "unter beiden",
    "monthly.between": "zwischen EMA8 und EMA12",
    "monthly.verdict": "{symbol} steht {position}.",
    "monthly.support_below":
      " EMA12 liegt darunter und wäre die nächste Auffanglinie.",
    "monthly.resistance_above":
      " EMA12 liegt über EMA8 – sie ist hier kein Ziel nach unten, sondern Widerstand darüber.",
    "monthly.row_price": "Kurs",
    "monthly.note_percent":
      "Prozent = Abstand vom Kurs bis zum Niveau; positiv heißt darüber.",
    "monthly.note_completed": "Werte aus abgeschlossenen Monaten.",
    "monthly.note_today":
      "Bezieht sich auf heute, nicht auf den gewählten Zeitraum.",
    "monthly.note_days_left":
      "Noch {count} Börsentage bis zum Monatsschluss (ohne Feiertage).",
    "monthly.note_short_history":
      "EMA {length}: erst ab {needed} abgeschlossenen Monaten aussagekräftig, vorhanden sind {have}.",

    "status.loading": "Lade {symbol} …",
    "status.pick_a_date": "Bitte mindestens ein Datum wählen.",
    "status.start_after_end": "Das Startdatum liegt nach dem Enddatum.",
    "status.signed_out": "abgemeldet",

    "badge.stale": "Yahoo nicht erreichbar – letzter gespeicherter Stand",
    "badge.from_store": "aus dem Bestand ({bars} Balken, keine Abfrage)",
    "badge.reloaded": "{bars} Balken nachgeladen ({requests} Abfragen)",
    "badge.checked": "auf Aktualität geprüft",

    "favorites.unavailable": "nicht abrufbar",
    "favorites.remove": "{symbol} aus den Favoriten entfernen",
    "star.add": "Zur Watchlist hinzufügen",
    "star.remove": "Aus der Watchlist entfernen",
    "panels.move_up": "nach oben",
    "panels.move_down": "nach unten",

    "volume.billion": "Mrd.",
    "volume.million": "Mio.",
    "volume.thousand": "Tsd.",
    "volume.billion_short": "Mrd",
    "volume.million_short": "M",
    "volume.thousand_short": "T",
  },
  en: {
    "locale": "en-US",

    "panel.price": "Price, moving averages and Fibonacci levels",
    "panel.rsi": "RSI (14)",
    "panel.bollinger": "Bollinger bands (20, 2σ)",
    "panel.ribbon": "Red ribbon (SMA 12 against SMA 30)",
    "panel.macd": "MACD (12, 26, 9)",
    "panel.volume": "Volume (spikes highlighted)",
    "panel.vix": "VIX (volatility index)",

    "series.close": "Close",
    "series.price": "Price",
    "series.volume": "Volume",
    "series.volume_spike": "Volume spike",
    "series.histogram": "Histogram",
    "series.signal": "Signal",
    "series.bb_band": "Bollinger band",
    "series.bb_upper": "Upper band",
    "series.bb_middle": "Middle line",
    "series.bb_lower": "Lower band",
    "series.ribbon_bull_daily": "Ribbon bullish (SMA 12 above 30)",
    "series.ribbon_bear_daily": "Ribbon bearish (SMA 12 below 30)",
    "series.ribbon_bull": "Ribbon bullish",
    "series.ribbon_bear": "Ribbon bearish",
    "series.m_ema8": "EMA8 monthly",
    "series.m_ema12": "EMA12 monthly",
    "series.weekly_candles": "Weekly candles",
    "series.monthly_candles": "Monthly candles",

    "chart.overbought": "overbought 70",
    "chart.oversold": "oversold 30",
    "chart.running": "still running",
    "chart.fib": "Fib",

    "tooltip.open": "Open",
    "tooltip.close": "Close",
    "tooltip.current": "Current",
    "tooltip.high": "High",
    "tooltip.low": "Low",
    "tooltip.week_of": "Week of {date}",
    "tooltip.running_suffix": " (still running)",

    "filter.all": "All",
    "filter.rsi": "RSI",
    "filter.bollinger": "Bollinger",
    "filter.macd": "MACD",
    "filter.cross": "Crosses",
    "filter.fib": "Fibonacci",
    "filter.month": "Month",

    "monthly.months": "({count} months)",
    "monthly.above_ema8": "above EMA8",
    "monthly.below_ema8": "below EMA8",
    "monthly.below_both": "below both",
    "monthly.between": "between EMA8 and EMA12",
    "monthly.verdict": "{symbol} is {position}.",
    "monthly.support_below":
      " EMA12 lies below it and would be the next line of support.",
    "monthly.resistance_above":
      " EMA12 lies above EMA8 – here it is no target downwards but resistance above.",
    "monthly.row_price": "Price",
    "monthly.note_percent":
      "Percent = distance from the price to the level; positive means above.",
    "monthly.note_completed": "Values from completed months.",
    "monthly.note_today": "Refers to today, not to the chosen period.",
    "monthly.note_days_left":
      "{count} exchange days left until the monthly close (holidays not counted).",
    "monthly.note_short_history":
      "EMA {length}: meaningful only from {needed} completed months, {have} available.",

    "status.loading": "Loading {symbol} …",
    "status.pick_a_date": "Please choose at least one date.",
    "status.start_after_end": "The start date is after the end date.",
    "status.signed_out": "signed out",

    "badge.stale": "Yahoo unreachable – last stored state",
    "badge.from_store": "from the store ({bars} bars, no request)",
    "badge.reloaded": "{bars} bars reloaded ({requests} requests)",
    "badge.checked": "checked for freshness",

    "favorites.unavailable": "not available",
    "favorites.remove": "Remove {symbol} from favorites",
    "star.add": "Add to watchlist",
    "star.remove": "Remove from watchlist",
    "panels.move_up": "move up",
    "panels.move_down": "move down",

    "volume.billion": "bn",
    "volume.million": "M",
    "volume.thousand": "k",
    "volume.billion_short": "bn",
    "volume.million_short": "M",
    "volume.thousand_short": "k",
  },
};

// The server writes the chosen language into <html lang>; anything unknown
// falls back to German, exactly as i18n.normalize() does on the other side.
const LANG = TEXTS[document.documentElement.lang] ? document.documentElement.lang : "de";

function t(key, params) {
  const text = TEXTS[LANG][key] || TEXTS.de[key] || key;
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) =>
    (params[name] === undefined ? match : params[name]));
}

const LOCALE = t("locale");

// --- Colors ---------------------------------------------------------------
// The values live in style.css as CSS variables. That way there is only one
// source for light and dark, and on a theme change ECharts automatically gets
// the matching shade.
function palette() {
  const s = getComputedStyle(document.documentElement);
  const v = (name) => s.getPropertyValue(name).trim();
  return {
    close: v("--series-1"), sma50: v("--series-2"), sma200: v("--series-3"),
    ema50: v("--series-4"), ema200: v("--series-5"), vix: v("--series-7"),
    up: v("--up"), down: v("--down"),
    text: v("--text"), text2: v("--text-2"), muted: v("--text-muted"),
    grid: v("--grid"), band: v("--band"),
    surface: v("--surface"), border: v("--border"),
  };
}

const SIGNAL_COLORS = {
  rsi_oversold: "up", rsi_overbought: "down",
  bb_lower: "up", bb_upper: "down",
  macd_bull: "up", macd_bear: "down",
  golden_cross: "up", death_cross: "down",
  fib: "close",
  month_below_ema8: "month",
  month_below_ema12: "month",
};

const SIGNAL_GROUPS = {
  rsi: ["rsi_oversold", "rsi_overbought"],
  bollinger: ["bb_lower", "bb_upper"],
  macd: ["macd_bull", "macd_bear"],
  cross: ["golden_cross", "death_cross"],
  fib: ["fib"],
  month: ["month_below_ema8", "month_below_ema12"],
};

// Series whose number says nothing in the tooltip: the stacked helper series
// the areas are built from. Their values are differences, not prices.
const TOOLTIP_NOISE = new Set([
  "​",
  t("series.bb_band"),
  t("series.ribbon_bull_daily"),
  t("series.ribbon_bear_daily"),
  t("series.ribbon_bull"),
  t("series.ribbon_bear"),
]);

// Color -> CSS class. The colored dot in the tooltip cannot be painted with a
// style attribute because of the Content-Security-Policy (see style.css),
// hence the detour via classes.
function dotClasses(p) {
  return {
    [p.close]: "tt-s1", [p.sma50]: "tt-s2", [p.sma200]: "tt-s3",
    [p.ema50]: "tt-s4", [p.ema200]: "tt-s5", [p.vix]: "tt-s7",
    [p.up]: "tt-up", [p.down]: "tt-down",
  };
}

function tooltipRow(dotClass, name, value) {
  return `<div class="tt-row"><span class="tt-dot ${dotClass}"></span>` +
         `<span class="tt-name">${name}</span>` +
         `<span class="tt-val">${value}</span></div>`;
}

const state = {
  symbol: "",
  range: "1y",
  data: null,
  tab: "daily",
  filter: "all",
  favorites: [],
  // Freely chosen period. If it is set, it takes precedence over range.
  start: null,
  end: null,
  // Order and visibility of the panels, loaded from the server.
  panels: [],
};

const el = (id) => document.getElementById(id);
let daily = null;
let weekly = null;
let monthly = null;

// Which panel is currently under the mouse pointer? The tooltip shows only
// its values. With seven panels roughly twenty rows used to pile up, most of
// which have nothing to do with the spot being pointed at. The value stays
// put as long as no other panel is hit -- when travelling through the gap
// between two panels the list should not briefly unfold to everything.
let hoveredPanel = null;
let dailyPanelKeys = [];

// Blueprint for the values that stand in the header of each panel: per panel
// the series with name, data row and color class, plus the position of the
// coordinate system. Filled in while the option is built.
let panelReadout = [];

// --- Helpers --------------------------------------------------------------

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function fmt(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return "–";
  return value.toLocaleString(LOCALE, {
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  });
}

function fmtVolume(value) {
  if (value === null || value === undefined) return "–";
  if (value >= 1e9) return fmt(value / 1e9, 2) + " " + t("volume.billion");
  if (value >= 1e6) return fmt(value / 1e6, 1) + " " + t("volume.million");
  if (value >= 1e3) return fmt(value / 1e3, 0) + " " + t("volume.thousand");
  return String(value);
}

// Short form for narrow axes: 70M instead of 70.0 million.
function fmtVolumeShort(value) {
  if (value === null || value === undefined) return "";
  if (value >= 1e9) return Math.round(value / 1e9) + t("volume.billion_short");
  if (value >= 1e6) return Math.round(value / 1e6) + t("volume.million_short");
  if (value >= 1e3) return Math.round(value / 1e3) + t("volume.thousand_short");
  return String(value);
}

function showStatus(message, isError) {
  const box = el("status");
  if (!message) { box.hidden = true; return; }
  box.hidden = false;
  box.textContent = message;
  box.style.borderLeftColor = isError ? palette().down : palette().sma50;
}

async function api(path, options) {
  const response = await fetch(path, Object.assign({ credentials: "same-origin" }, options));
  if (response.status === 401) {
    window.location.href = "/login";
    throw new Error(t("status.signed_out"));
  }
  if (!response.ok) {
    let detail = "HTTP " + response.status;
    try { detail = (await response.json()).detail || detail; } catch (e) { /* body was not JSON */ }
    throw new Error(detail);
  }
  return response.json();
}

// --- Building the daily chart ---------------------------------------------

// Catalogue of all panels. Which of them appear in which order is decided by
// state.panels from the user's settings.
const PANELS = [
  { key: "price",     title: t("panel.price"),     height: 320 },
  { key: "rsi",       title: t("panel.rsi"),       height: 150 },
  { key: "bollinger", title: t("panel.bollinger"), height: 170 },
  { key: "ribbon",    title: t("panel.ribbon"),    height: 170 },
  { key: "macd",      title: t("panel.macd"),      height: 150 },
  { key: "volume",    title: t("panel.volume"),    height: 130 },
  { key: "vix",       title: t("panel.vix"),       height: 130 },
];

// Between two panels stand the title and legend of the lower one. Only the
// last panel carries the date axis -- they all share the same zoom, and the
// same labelling seven times would be nothing but noise.
const GAP = 34;
const GAP_LAST = 60;   // extra room for the date axis
const TOP = 34;
const BOTTOM = 72;     // room for the zoom slider

// In the daily chart the title and the legend always sit one below the other.
//
// Side by side looked nicer once, but was untenable: whether it fits depends
// on the window width, the length of the title AND the number of legend
// entries. When the two monthly levels were added it overlapped on the desk
// again -- the same fault as before on the phone. The second line costs 22
// pixels per panel and makes the layout independent of those three sizes.
const HEAD_EXTRA = 22;

// On narrow screens the header gets noticeably more air, and the legend moves
// closer to the title: that way it visibly belongs to the panel below rather
// than hanging in limbo between title and plotting area.
// The numbers are upper edges above the panel. Title and legend are roughly
// 14 and 20 pixels high, so 56 and 38 come out as visibly about four pixels
// between title and legend and eighteen between legend and plotting area.
const HEAD_EXTRA_NARROW = 46;
const TITLE_OFFSET = 44;
const TITLE_OFFSET_NARROW = 56;
const LEGEND_OFFSET = 22;
const LEGEND_OFFSET_NARROW = 38;

function headMetrics(narrow) {
  return narrow
    ? { extra: HEAD_EXTRA_NARROW, title: TITLE_OFFSET_NARROW,
        legend: LEGEND_OFFSET_NARROW }
    : { extra: HEAD_EXTRA, title: TITLE_OFFSET, legend: LEGEND_OFFSET };
}

// Below this width the margins shrink as well: 62 + 96 pixels are forty
// percent of the area on a 390 pixel wide screen.
const NARROW_WIDTH = 760;

function isNarrow() {
  return window.innerWidth < NARROW_WIDTH;
}

function margins() {
  return isNarrow() ? { left: 54, right: 50 } : { left: 62, right: 96 };
}

function layout(panels) {
  const narrow = isNarrow();
  const side = margins();
  const head = headMetrics(narrow);
  const grids = [];
  let top = TOP + head.extra;
  panels.forEach((panel, i) => {
    grids.push({ top: top, height: panel.height, left: side.left, right: side.right });
    top += panel.height
         + (i === panels.length - 1 ? GAP_LAST : GAP)
         + head.extra;
  });
  return { grids: grids, total: top + BOTTOM, narrow: narrow, head: head };
}

function lineSeries(name, gridIndex, data, color, extra) {
  return Object.assign({
    name: name, type: "line", xAxisIndex: gridIndex, yAxisIndex: gridIndex,
    data: data, showSymbol: false, symbol: "circle", symbolSize: 8,
    lineStyle: { width: 2, color: color },
    itemStyle: { color: color },
    connectNulls: false,
    z: 5,
  }, extra || {});
}

// Label at the right edge. It replaces reading the value off the color --
// necessary because three of the light series colors are below 3:1 contrast
// against the surface, and color alone must not carry the meaning there.
function endLabel(color) {
  return {
    endLabel: {
      show: true, color: color,
      fontSize: isNarrow() ? 10 : 11,
      distance: isNarrow() ? 4 : 6,
      formatter: (p) => (p.value === null ? "" : fmt(p.value)),
    },
  };
}

// --- Untangling the labels at the right edge -------------------------------
//
// ECharts pins every endLabel rigidly to the height of its line. If two lines
// lie close together -- on COIN for instance SMA 50 and EMA 50, or SMA 200
// and EMA 200 -- the numbers sit on top of each other and none is readable
// any more. After drawing they are therefore pushed apart: the order from top
// to bottom stays that of the lines, each gets at least one line height of
// air, and the stack stays inside the panel. Only the number is moved
// (endLabel.offset), not the line.

function labelGap() {
  // Font height (10 or 11 pixels) plus a little air.
  return isNarrow() ? 13 : 15;
}

// Number out of a layout value. Percentages are not customary here and lead
// to NaN -- the respective edge is then simply not bounded.
function layoutNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.indexOf("%") < 0) return parseFloat(value);
  return NaN;
}

// Upper and lower edge of a panel in pixels. The daily chart states top and
// height, the weekly and monthly charts top and bottom.
function gridBounds(grid, chartHeight) {
  const top = layoutNumber(grid.top);
  const height = layoutNumber(grid.height);
  const bottom = layoutNumber(grid.bottom);
  return {
    top: isNaN(top) ? 0 : top,
    bottom: !isNaN(height) && !isNaN(top) ? top + height
          : (!isNaN(bottom) ? chartHeight - bottom : chartHeight),
  };
}

// Centre of a block: the height at which the fanned-out labels deviate least
// from their line on average.
function blockStart(points, gap) {
  let sum = 0;
  points.forEach((pt, i) => { sum += pt.y - i * gap; });
  return sum / points.length;
}

// Distribute points with a minimum gap. Whoever has enough air anyway stays
// put; whoever is crowded forms a block with their neighbours, which is
// fanned out around the common centre. That way no label wanders further from
// its line than necessary -- simply pushing downwards would have taken the
// free numbers below along as well.
function distributeLabels(points, gap, top, bottom) {
  points.sort((a, b) => a.y - b.y);

  const blocks = [];
  points.forEach((pt) => {
    blocks.push({ points: [pt], start: pt.y });
    // The new block can touch the one above -- and the merged one the next.
    // Hence the loop.
    while (blocks.length > 1) {
      const lower = blocks[blocks.length - 1];
      const upper = blocks[blocks.length - 2];
      if (upper.start + upper.points.length * gap <= lower.start) break;
      upper.points = upper.points.concat(lower.points);
      upper.start = blockStart(upper.points, gap);
      blocks.pop();
    }
  });
  blocks.forEach((block) => {
    block.points.forEach((pt, i) => { pt.target = block.start + i * gap; });
  });

  // Push whatever would run out at the bottom back up ...
  let limit = bottom;
  for (let i = points.length - 1; i >= 0; i--) {
    points[i].target = Math.min(points[i].target, limit);
    limit = points[i].target - gap;
  }
  // ... and whatever would then run out at the top back down. If the stack
  // does not fit into the panel at all, it would rather run out at the
  // bottom: above stand the title and legend of the next panel.
  limit = top;
  points.forEach((pt) => {
    pt.target = Math.max(pt.target, limit);
    limit = pt.target + gap;
  });
  return points;
}

// The data point ECharts pins the label to: the last visible one (the zoom
// cuts off at the right), and from there backwards the last one that has a
// value at all.
function lastValue(chart, seriesIndex, data, rightEdge) {
  if (!data || !data.length) return null;
  let end = data.length - 1;
  const found = chart.convertFromPixel({ seriesIndex: seriesIndex }, [rightEdge, 0]);
  const raw = Array.isArray(found) ? found[0] : found;
  if (raw !== null && raw !== undefined && !isNaN(raw)) {
    end = Math.max(0, Math.min(end, Math.floor(raw + 1e-6)));
  }
  for (let i = end; i >= 0; i--) {
    const value = data[i] && data[i].value !== undefined ? data[i].value : data[i];
    if (value !== null && value !== undefined && !isNaN(value)) {
      return { index: i, value: value };
    }
  }
  return null;
}

function spreadEndLabels(chart) {
  if (!chart) return;
  const option = chart.getOption();
  const series = option.series || [];
  if (!series.length) return;

  // Series deselected via the legend draw no label and must therefore not
  // claim any room either.
  const legendState = {};
  (option.legend || []).forEach((l) => Object.assign(legendState, l.selected || {}));

  const grids = option.grid || [];
  const width = chart.getWidth();
  const height = chart.getHeight();
  const groups = new Map();

  series.forEach((spec, i) => {
    if (!spec.endLabel || !spec.endLabel.show) return;
    if (legendState[spec.name] === false) return;
    const axis = spec.yAxisIndex || 0;
    const grid = grids[axis] || {};
    const edge = layoutNumber(grid.right);
    const point = lastValue(chart, i, spec.data, width - (isNaN(edge) ? 0 : edge));
    if (!point) return;
    const px = chart.convertToPixel({ seriesIndex: i }, [point.index, point.value]);
    if (!px || !isFinite(px[1])) return;
    if (!groups.has(axis)) groups.set(axis, []);
    groups.get(axis).push({ index: i, y: px[1] });
  });
  if (!groups.size) return;

  const offsets = series.map(() => null);
  let changed = false;
  groups.forEach((points, axis) => {
    const bounds = gridBounds(grids[axis] || {}, height);
    distributeLabels(points, labelGap(), bounds.top + 7, bounds.bottom - 7);
    points.forEach((pt) => {
      const dy = Math.round(pt.target - pt.y);
      offsets[pt.index] = dy;
      const previous = (series[pt.index].endLabel.offset || [0, 0])[1];
      if (previous !== dy) changed = true;
    });
  });
  if (!changed) return;

  // Without a name and without an id ECharts maps the entries by index -- so
  // the empty objects leave their series untouched.
  chart.setOption({
    series: offsets.map((dy) => (dy === null ? {} : { endLabel: { offset: [0, dy] } })),
  });
}

// Zoom and resizing move the lines; the labels then have to be redistributed.
// One frame per occasion suffices.
const labelPlan = new WeakMap();

function scheduleLabelSpread(chart) {
  if (!chart || labelPlan.get(chart)) return;
  labelPlan.set(chart, requestAnimationFrame(() => {
    labelPlan.delete(chart);
    spreadEndLabels(chart);
  }));
}

function ribbonSeries(fast, slow, gridIndex, colors, names) {
  // ECharts cannot fill an area "between two lines". The trick: an invisible
  // base on whichever value is lower, and stacked on top of it two bands --
  // one for the bullish, one for the bearish state. At every point exactly
  // one of them is greater than zero.
  const base = [], bull = [], bear = [];
  for (let i = 0; i < fast.length; i++) {
    const a = fast[i], b = slow[i];
    if (a === null || b === null) { base.push(null); bull.push(null); bear.push(null); continue; }
    base.push(Math.min(a, b));
    bull.push(a > b ? a - b : 0);
    bear.push(a < b ? b - a : 0);
  }
  const hidden = {
    type: "line", stack: "ribbon" + gridIndex, xAxisIndex: gridIndex, yAxisIndex: gridIndex,
    showSymbol: false, lineStyle: { opacity: 0 }, silent: true, z: 1,
  };
  // itemStyle sets the color of the legend symbol. Without it the legend
  // showed the color of the (invisible) line instead of that of the area.
  return [
    Object.assign({ name: "​", data: base, areaStyle: { opacity: 0 } }, hidden),
    Object.assign({ name: names[0], data: bull, itemStyle: { color: colors[0] },
      areaStyle: { color: colors[0], opacity: 0.22 } }, hidden),
    Object.assign({ name: names[1], data: bear, itemStyle: { color: colors[1] },
      areaStyle: { color: colors[1], opacity: 0.22 } }, hidden),
  ];
}

// Panels in the configured order, without the switched-off ones. The VIX
// additionally drops out if Yahoo delivered nothing for it.
function visiblePanels(d) {
  const catalog = {};
  PANELS.forEach((panel) => { catalog[panel.key] = panel; });

  const chosen = state.panels.length
    ? state.panels
    : PANELS.map((panel) => ({ key: panel.key, visible: true }));

  return chosen
    .filter((entry) => entry.visible && catalog[entry.key])
    .map((entry) => catalog[entry.key])
    .filter((panel) => panel.key !== "vix" || d.vix.length > 0);
}


function buildDailyOption(data) {
  const p = palette();
  const d = data.daily;
  const panels = visiblePanels(d);
  dailyPanelKeys = panels.map((panel) => panel.key);
  if (!dailyPanelKeys.includes(hoveredPanel)) hoveredPanel = null;
  const index = {};
  panels.forEach((panel, i) => { index[panel.key] = i; });
  const geometry = layout(panels);

  const axisCommon = {
    type: "category", data: d.dates, boundaryGap: false,
    axisLine: { lineStyle: { color: p.border } },
    axisTick: { show: false },
    splitLine: { show: false },
    axisLabel: { color: p.muted, fontSize: 11, hideOverlap: true },
  };

  const xAxes = panels.map((panel, i) => Object.assign({}, axisCommon, {
    gridIndex: i,
    axisLabel: Object.assign({}, axisCommon.axisLabel, {
      show: i === panels.length - 1,
    }),
    // The date at the crosshair only once, below the bottom panel. Otherwise
    // the same date would stand seven times on top of itself.
    axisPointer: { label: { show: i === panels.length - 1 } },
  }));

  const yAxes = panels.map((panel, i) => ({
    gridIndex: i, scale: true,
    axisLine: { show: false }, axisTick: { show: false },
    splitLine: { lineStyle: { color: p.grid, type: "solid" } },
    axisLabel: {
      color: p.muted, fontSize: 11,
      formatter: (v) =>
        panel.key === "volume"
          // "70 Mio." needs more room than a phone has.
          ? (geometry.narrow ? fmtVolumeShort(v) : fmtVolume(v))
          : fmt(v, Math.abs(v) < 10 ? 1 : 0),
    },
  }));

  // Every series remembers its panel, so that the legend above it shows only
  // the entries of that panel rather than all twenty on one line.
  const series = [];
  const owner = [];
  // What kind of value a series carries -- read by the tooltip and the panel
  // header. Kept beside the series rather than derived from its name, which
  // would break the moment the name is translated.
  const traits = [];
  // If a panel is switched off there is no axis for it. The series is then
  // discarded -- without this branch it ended up in the first coordinate
  // system with xAxisIndex undefined.
  const push = (key, spec, options) => {
    if (index[key] === undefined) return;
    series.push(spec);
    owner.push(key);
    traits.push(options || {});
  };

  // 1 -- price, moving averages, Fibonacci, crosses
  const g = index.price;
  const fibLines = Object.entries(data.fib).map(([ratio, value]) => ({
    yAxis: value,
    lineStyle: { color: p.muted, type: "dashed", width: 1, opacity: 0.75 },
    label: {
      // On narrow screens only the ratio: the value stands at the axis
      // anyway, and the full label would lie right across the price.
      formatter: geometry.narrow ? ratio : t("chart.fib") + " " + ratio + "  " + fmt(value),
      // Left, because the current values of the lines stand at the right edge.
      position: "insideStartTop",
      color: p.text2,
      fontSize: geometry.narrow ? 9 : 10,
    },
  }));

  const crossPoints = []
    .concat(d.golden_cross.map((c) => ({
      name: "Golden Cross", coord: [c.date, c.value], value: "Golden Cross",
      symbol: "triangle", symbolSize: 13,
      itemStyle: { color: p.up },
      label: { show: false },
    })))
    .concat(d.death_cross.map((c) => ({
      name: "Death Cross", coord: [c.date, c.value], value: "Death Cross",
      symbol: "triangle", symbolRotate: 180, symbolSize: 13,
      itemStyle: { color: p.down },
      label: { show: false },
    })));

  push("price", lineSeries(t("series.close"), g, d.close, p.close, Object.assign({
    lineStyle: { width: 2.4, color: p.close }, z: 8,
    markLine: { symbol: "none", silent: true, animation: false, data: fibLines },
    markPoint: { data: crossPoints, animation: false },
  }, endLabel(p.close))));
  push("price", lineSeries("SMA 50", g, d.sma50, p.sma50,
    Object.assign({ lineStyle: { width: 1.6, color: p.sma50, type: "dashed" } }, endLabel(p.sma50))));
  push("price", lineSeries("SMA 200", g, d.sma200, p.sma200,
    Object.assign({ lineStyle: { width: 1.6, color: p.sma200, type: "dashed" } }, endLabel(p.sma200))));
  push("price", lineSeries("EMA 50", g, d.ema50, p.ema50,
    Object.assign({ lineStyle: { width: 1.6, color: p.ema50 } }, endLabel(p.ema50))));
  push("price", lineSeries("EMA 200", g, d.ema200, p.ema200,
    Object.assign({ lineStyle: { width: 1.6, color: p.ema200 } }, endLabel(p.ema200))));

  // Monthly EMA levels as a staircase. During a month the value of the last
  // completed month applies -- hence the line only jumps at the turn of the
  // month. Both in violet, told apart by the stroke: they belong together and
  // are something other than the daily lines above. Switched off by default,
  // the panel carries enough already.
  if (d.m_ema8 && d.m_ema8.length) {
    push("price", lineSeries(t("series.m_ema8"), g, d.m_ema8, p.vix,
      Object.assign({ step: "start", lineStyle: { width: 2.4, color: p.vix } },
                    endLabel(p.vix))));
    push("price", lineSeries(t("series.m_ema12"), g, d.m_ema12, p.vix,
      Object.assign({ step: "start",
                      lineStyle: { width: 2.4, color: p.vix, type: "dashed" } },
                    endLabel(p.vix))));
  }

  // 2 -- volume. Two series instead of one with two colors, so that the
  // spikes get a legend entry of their own: the highlight must not hang on
  // the color alone.
  const volumeSeries = (name, color, opacity, keep) => ({
    name: name, type: "bar",
    xAxisIndex: index.volume, yAxisIndex: index.volume,
    data: d.volume.map((v, i) => (d.vol_spike[i] === keep ? v : null)),
    itemStyle: { color: color, opacity: opacity },
    barGap: "-100%", barCategoryGap: "20%",
  });
  push("volume", volumeSeries(t("series.volume"), p.muted, 0.45, false),
       { volume: true });
  // "Volume spike" is empty on most days and would then stand permanently as
  // "–" in the header row. That a day was a spike is shown by the color of
  // the bar anyway.
  push("volume", volumeSeries(t("series.volume_spike"), p.sma50, 1, true),
       { volume: true, skipReadout: true });

  // 3 -- MACD: line, signal, histogram (sign as a diverging pair)
  const m = index.macd;
  push("macd", {
    name: t("series.histogram"), type: "bar", xAxisIndex: m, yAxisIndex: m,
    data: d.macd_hist.map((v) => ({
      value: v,
      itemStyle: { color: v >= 0 ? p.close : p.down, opacity: 0.45 },
    })),
    z: 2,
  });
  push("macd", lineSeries("MACD", m, d.macd, p.close));
  push("macd", lineSeries(t("series.signal"), m, d.macd_signal, p.sma50));

  // 4 -- RSI with the thresholds 30 and 70
  const r = index.rsi;
  push("rsi", lineSeries("RSI", r, d.rsi, p.close, {
    markLine: {
      symbol: "none", silent: true, animation: false,
      data: [
        { yAxis: 70, lineStyle: { color: p.down, type: "dashed", width: 1 },
          label: { formatter: t("chart.overbought"), color: p.text2, fontSize: 10, position: "insideEndTop" } },
        { yAxis: 30, lineStyle: { color: p.up, type: "dashed", width: 1 },
          label: { formatter: t("chart.oversold"), color: p.text2, fontSize: 10, position: "insideEndBottom" } },
      ],
    },
    markArea: {
      silent: true, animation: false,
      itemStyle: { opacity: 0.06 },
      data: [
        [{ yAxis: 70, itemStyle: { color: p.down } }, { yAxis: 100 }],
        [{ yAxis: 0, itemStyle: { color: p.up } }, { yAxis: 30 }],
      ],
    },
  }));

  // 5 -- Bollinger: band as a stacked area, price and middle line on top
  const b = index.bollinger;
  const lower = d.bb_lower;
  const width = d.bb_upper.map((v, i) => (v === null || lower[i] === null ? null : v - lower[i]));
  push("bollinger", {
    name: "​", type: "line", stack: "bb", xAxisIndex: b, yAxisIndex: b,
    data: lower, showSymbol: false, lineStyle: { opacity: 0 },
    areaStyle: { opacity: 0 }, silent: true, z: 1,
  });
  push("bollinger", {
    name: t("series.bb_band"), type: "line", stack: "bb", xAxisIndex: b, yAxisIndex: b,
    data: width, showSymbol: false, lineStyle: { opacity: 0 },
    itemStyle: { color: p.close }, areaStyle: { color: p.band }, silent: true, z: 1,
  });
  push("bollinger", lineSeries(t("series.bb_upper"), b, d.bb_upper, p.down,
    { lineStyle: { width: 1.2, color: p.down, type: "dashed" } }));
  push("bollinger", lineSeries(t("series.bb_middle"), b, d.bb_middle, p.sma200,
    { lineStyle: { width: 1.2, color: p.sma200, type: "dashed" } }));
  push("bollinger", lineSeries(t("series.bb_lower"), b, d.bb_lower, p.up,
    { lineStyle: { width: 1.2, color: p.up, type: "dashed" } }));
  push("bollinger", lineSeries(t("series.price"), b, d.close, p.close,
    { lineStyle: { width: 2, color: p.close }, z: 6 }));

  // 6 -- VIX, only if Yahoo delivered values
  if (index.vix !== undefined) {
    push("vix", lineSeries("VIX", index.vix, d.vix, p.vix, {
      markLine: {
        symbol: "none", silent: true, animation: false,
        data: [{ yAxis: 20, lineStyle: { color: p.muted, type: "dashed", width: 1 },
          label: { formatter: "20", color: p.text2, fontSize: 10 } }],
      },
    }));
  }

  // 7 -- ribbon
  const rb = index.ribbon;
  ribbonSeries(d.sma12, d.sma30, rb, [p.up, p.down],
    [t("series.ribbon_bull_daily"), t("series.ribbon_bear_daily")])
    .forEach((s) => push("ribbon", s));
  // Blue and violet for the lines: the area between them already carries
  // green and red, lines in the same colors would blur the signal.
  push("ribbon", lineSeries("SMA 12", rb, d.sma12, p.close,
    Object.assign({ lineStyle: { width: 1.8, color: p.close } }, endLabel(p.close))));
  push("ribbon", lineSeries("SMA 30", rb, d.sma30, p.vix,
    Object.assign({ lineStyle: { width: 1.8, color: p.vix } }, endLabel(p.vix))));

  // Panel headings as graphic texts -- an alternative to several title
  // objects, which are not supposed to move along when zooming.
  const titles = panels.map((panel, i) => ({
    type: "text",
    left: geometry.narrow ? 8 : 62,
    top: geometry.grids[i].top - geometry.head.title,
    silent: true,
    style: {
      text: panel.title,
      fill: p.text2,
      font: "600 12px system-ui, sans-serif",
    },
  }));

  // Blueprint for the values in the panel headers. The title stands on the
  // left, the numbers on the right of the same line -- hence the same height
  // as the title.
  panelReadout = panels.map((panel, i) => ({
    key: panel.key,
    axis: i,
    gridTop: geometry.grids[i].top,
    gridHeight: geometry.grids[i].height,
    items: series
      .map((spec, k) => ({ spec: spec, panel: owner[k], traits: traits[k] }))
      .filter((x) => x.panel === panel.key)
      .filter((x) => x.spec.name && !TOOLTIP_NOISE.has(x.spec.name))
      .filter((x) => !x.traits.skipReadout)
      .map((x) => ({
        name: x.spec.name,
        data: x.spec.data,
        volume: Boolean(x.traits.volume),
        cls: colorClass(seriesColor(x.spec), p),
      })),
  }));

  return {
    animation: false,
    backgroundColor: "transparent",
    textStyle: { color: p.text, fontFamily: "system-ui, sans-serif" },
    grid: geometry.grids,
    xAxis: xAxes,
    yAxis: yAxes,
    graphic: titles,
    legend: panels.map((panel, i) => ({
      type: "scroll",
      top: geometry.grids[i].top - geometry.head.legend,
      left: geometry.narrow ? 8 : 62,
      right: geometry.narrow ? 8 : 96,
      itemGap: geometry.narrow ? 10 : 14, itemWidth: 18, itemHeight: 10,
      textStyle: { color: p.text2, fontSize: 11 },
      inactiveColor: p.muted,
      // The monthly levels are ready but only visible after a click --
      // otherwise there would be seven lines in one panel.
      selected: { [t("series.m_ema8")]: false, [t("series.m_ema12")]: false },
      data: series
        .filter((s, k) => owner[k] === panel.key && s.name && s.name !== "​")
        .map((s) => s.name),
    })),
    axisPointer: { link: [{ xAxisIndex: "all" }], label: { backgroundColor: p.text2 } },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross", crossStyle: { color: p.muted } },
      backgroundColor: p.surface,
      borderColor: p.border,
      textStyle: { color: p.text, fontSize: 12 },
      confine: true,
      // No box of its own: the boxes per panel are drawn by hand (see
      // renderPanelTooltips). Crosshair, axis label and the updateAxisPointer
      // event stay untouched by that.
      showContent: false,
      className: "chart-tooltip",
      formatter: (params) => {
        if (!params.length) return "";
        const dots = dotClasses(p);
        const rows = params
          .filter((x) => x.seriesName && !TOOLTIP_NOISE.has(x.seriesName))
          .filter((x) => x.value !== null && x.value !== undefined)
          // Only the series of the panel being pointed at. If none is hit, it
          // stays at all of them.
          .filter((x) => !hoveredPanel || owner[x.seriesIndex] === hoveredPanel)
          .map((x) => {
            const isVolume = Boolean((traits[x.seriesIndex] || {}).volume);
            return tooltipRow(
              dots[x.color] || "",
              x.seriesName,
              isVolume ? fmtVolume(x.value) : fmt(x.value)
            );
          });
        return `<div class="tt-head">${params[0].axisValue}</div>${rows.join("")}`;
      },
    },
    dataZoom: [
      { type: "inside", xAxisIndex: panels.map((_, i) => i) },
      {
        type: "slider", xAxisIndex: panels.map((_, i) => i),
        bottom: 18, height: 26,
        borderColor: p.border, fillerColor: p.band,
        handleStyle: { color: p.close },
        textStyle: { color: p.muted, fontSize: 10 },
      },
    ],
    series: series,
    _height: geometry.total,
  };
}

// --- Weekly chart ---------------------------------------------------------

function buildWeeklyOption(data) {
  const p = palette();
  const w = data.weekly;
  const series = [];

  ribbonSeries(w.sma12, w.sma30, 0, [p.up, p.down],
    [t("series.ribbon_bull"), t("series.ribbon_bear")]).forEach((s) => series.push(s));

  series.push({
    name: t("series.weekly_candles"), type: "candlestick", data: w.ohlc, z: 4,
    itemStyle: {
      // Rising week filled, falling one hollow -- the direction is thereby
      // readable without telling the colors apart.
      color: p.up, color0: p.surface,
      borderColor: p.up, borderColor0: p.down, borderWidth: 1.4,
    },
  });
  series.push(lineSeries(t("series.close"), 0, w.close, p.close,
    Object.assign({ lineStyle: { width: 2.2, color: p.close }, z: 6 }, endLabel(p.close))));
  series.push(lineSeries("SMA 10", 0, w.sma10, p.ema50,
    Object.assign({ lineStyle: { width: 2, color: p.ema50 }, z: 5 }, endLabel(p.ema50))));
  series.push(lineSeries("SMA 12", 0, w.sma12, p.sma50,
    Object.assign({ lineStyle: { width: 1.6, color: p.sma50 }, z: 5 }, endLabel(p.sma50))));
  series.push(lineSeries("SMA 30", 0, w.sma30, p.sma200,
    Object.assign({ lineStyle: { width: 1.6, color: p.sma200 }, z: 5 }, endLabel(p.sma200))));

  return {
    animation: false,
    backgroundColor: "transparent",
    textStyle: { color: p.text, fontFamily: "system-ui, sans-serif" },
    grid: Object.assign({ top: isNarrow() ? 62 : 44, bottom: 74 }, margins()),
    legend: {
      type: "scroll", top: 4,
      left: isNarrow() ? 8 : 62,
      right: isNarrow() ? 8 : 96,
      textStyle: { color: p.text2, fontSize: 11 },
      data: series.map((s) => s.name).filter((n) => n && n !== "​"),
    },
    xAxis: {
      type: "category", data: w.dates, boundaryGap: true,
      axisLine: { lineStyle: { color: p.border } }, axisTick: { show: false },
      axisLabel: { color: p.muted, fontSize: 11, hideOverlap: true },
    },
    yAxis: {
      scale: true, axisLine: { show: false }, axisTick: { show: false },
      splitLine: { lineStyle: { color: p.grid } },
      axisLabel: { color: p.muted, fontSize: 11, formatter: (v) => fmt(v, 0) },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross", crossStyle: { color: p.muted } },
      backgroundColor: p.surface, borderColor: p.border,
      textStyle: { color: p.text, fontSize: 12 }, confine: true,
      className: "chart-tooltip",
      formatter: (params) => {
        const dots = dotClasses(p);
        const rows = [];
        params
          .filter((x) => x.seriesName && !TOOLTIP_NOISE.has(x.seriesName))
          .forEach((x) => {
            if (x.seriesType === "candlestick") {
              const [, o, c, l, h] = x.value;
              const pct = o ? ((c - o) / o) * 100 : 0;
              const sign = pct >= 0 ? "+" : "";
              const dot = pct >= 0 ? "tt-up" : "tt-down";
              rows.push(tooltipRow(dot, t("tooltip.open"), fmt(o)));
              rows.push(tooltipRow(dot, t("tooltip.close"), `${fmt(c)} (${sign}${fmt(pct)} %)`));
              rows.push(tooltipRow(dot, t("tooltip.high"), fmt(h)));
              rows.push(tooltipRow(dot, t("tooltip.low"), fmt(l)));
              return;
            }
            if (x.value === null || x.value === undefined) return;
            rows.push(tooltipRow(dots[x.color] || "", x.seriesName, fmt(x.value)));
          });
        const head = t("tooltip.week_of", { date: params[0].axisValue });
        return `<div class="tt-head">${head}</div>${rows.join("")}`;
      },
    },
    dataZoom: [
      { type: "inside" },
      { type: "slider", bottom: 18, height: 26, borderColor: p.border,
        fillerColor: p.band, handleStyle: { color: p.close },
        textStyle: { color: p.muted, fontSize: 10 } },
    ],
    series: series,
  };
}

// --- Values per panel -----------------------------------------------------

// Color of a series: lines carry it in lineStyle, bars in itemStyle, and for
// the MACD histogram it stands on every individual data point.
function seriesColor(spec) {
  if (spec.lineStyle && spec.lineStyle.color) return spec.lineStyle.color;
  if (spec.itemStyle && spec.itemStyle.color) return spec.itemStyle.color;
  const first = (spec.data || []).find((d) => d && d.itemStyle);
  return first ? first.itemStyle.color : null;
}

// A data point is sometimes a number, sometimes an object with its own color.
function seriesValue(data, i) {
  const v = data ? data[i] : null;
  if (v && typeof v === "object") return v.value;
  return v;
}

function colorClass(color, p) {
  return dotClasses(p)[color] || "";
}

// One tooltip box per panel. ECharts knows only one tooltip per chart, so
// these are HTML elements of our own on a layer above the plotting area. They
// carry the same classes as the ECharts tooltip and therefore look the same.
function renderPanelTooltips() {
  const layer = el("panel-values");
  layer.innerHTML = "";
  panelReadout.forEach((panel) => {
    const box = document.createElement("div");
    box.className = "chart-tooltip pv-box";
    box.dataset.panel = panel.key;
    box.hidden = true;

    // The date stands only in the box of the panel under the pointer -- the
    // same date seven times would be noise.
    const head = document.createElement("div");
    head.className = "tt-head";
    head.hidden = true;
    box.appendChild(head);

    panel.items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "tt-row";
      const dot = document.createElement("span");
      dot.className = "tt-dot " + item.cls;
      const name = document.createElement("span");
      name.className = "tt-name";
      name.textContent = item.name;
      const value = document.createElement("span");
      value.className = "tt-val";
      row.append(dot, name, value);
      box.appendChild(row);
    });
    layer.appendChild(box);
  });
}

function hidePanelTooltips() {
  el("panel-values").querySelectorAll(".pv-box")
    .forEach((box) => { box.hidden = true; });
}

// Fills the boxes and places them next to the crosshair -- each one in its
// own panel.
function updatePanelTooltips(index) {
  if (!daily || !panelReadout.length) return;
  const layer = el("panel-values");
  const width = daily.getWidth();

  let x = null;
  try {
    x = daily.convertToPixel({ xAxisIndex: 0 }, index);
  } catch (e) { /* axis not ready yet */ }

  panelReadout.forEach((panel) => {
    const box = layer.querySelector('.pv-box[data-panel="' + panel.key + '"]');
    if (!box) return;

    // Child 0 is the date line, the values start at 1.
    const head = box.children[0];
    head.hidden = panel.key !== hoveredPanel;
    if (!head.hidden) head.textContent = (state.data.daily.dates || [])[index] || "";

    let visible = 0;
    const values = [];
    panel.items.forEach((item, i) => {
      const row = box.children[i + 1];
      if (!row) return;
      const value = seriesValue(item.data, index);
      const empty = value === null || value === undefined;
      // A series without a value on that day does not stand in the box.
      row.hidden = empty || row.dataset.off === "1";
      if (!row.hidden) {
        visible += 1;
        values.push(value);
        row.lastChild.textContent = item.volume ? fmtVolume(value) : fmt(value);
      }
    });

    box.hidden = visible === 0 || x === null;
    if (box.hidden) return;

    // Vertically to the side facing away from the data point: if the values
    // lie in the upper part of the panel, the box sits at the bottom and vice
    // versa. That way as much of the course as possible stays visible next to
    // the crosshair.
    //
    // The reference is the mean of the visible series -- it is converted into
    // a screen height once per panel, rather than each series individually.
    let pointY = null;
    if (values.length) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      try {
        pointY = daily.convertToPixel({ yAxisIndex: panel.axis }, mean);
      } catch (e) { /* axis not ready yet */ }
    }

    const boxHeight = box.offsetHeight;
    const topStop = panel.gridTop + 6;
    const bottomStop = panel.gridTop + panel.gridHeight - boxHeight - 6;
    const middle = panel.gridTop + panel.gridHeight / 2;
    const toTop = pointY === null ? true : pointY > middle;
    box.style.top = Math.max(topStop,
      Math.min(bottomStop, toTop ? topStop : bottomStop)) + "px";

    // Left of the crosshair, unless there is no room there any more -- then
    // to the right.
    const boxWidth = box.offsetWidth;
    let left = x - 14 - boxWidth;
    if (left < 8) left = x + 14;
    box.style.left = Math.min(left, width - boxWidth - 8) + "px";
  });
}

// Series deselected in the legend stay out of the boxes.
function applyLegendState(selected) {
  const layer = el("panel-values");
  panelReadout.forEach((panel) => {
    const box = layer.querySelector('.pv-box[data-panel="' + panel.key + '"]');
    if (!box) return;
    panel.items.forEach((item, i) => {
      const row = box.children[i + 1];
      if (row) row.dataset.off = selected[item.name] === false ? "1" : "0";
    });
  });
}

// --- Panels of the daily chart --------------------------------------------

async function loadPanelSettings() {
  try {
    state.panels = (await api("/api/settings")).panels;
  } catch (e) {
    // Without a setting the default order from PANELS applies.
    state.panels = [];
  }
  renderPanelConfig();
}

async function savePanelSettings() {
  try {
    const response = await api("/api/settings/panels", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ panels: state.panels }),
    });
    state.panels = response.panels;
  } catch (error) {
    showStatus(error.message, true);
    // Restore the server-side state, so that what is shown and what is stored
    // do not drift apart.
    await loadPanelSettings();
    draw();
    return;
  }
  renderPanelConfig();
  draw();
}

function renderPanelConfig() {
  const list = el("panel-list");
  list.innerHTML = "";

  const titles = {};
  PANELS.forEach((panel) => { titles[panel.key] = panel.title; });

  const entries = state.panels.length
    ? state.panels
    : PANELS.map((panel) => ({ key: panel.key, visible: true }));

  entries.forEach((entry, i) => {
    const row = document.createElement("li");
    if (!entry.visible) row.classList.add("off");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = entry.visible;
    checkbox.id = "panel-" + entry.key;
    checkbox.addEventListener("change", () => {
      state.panels = entries.map((e) =>
        e.key === entry.key ? { key: e.key, visible: checkbox.checked } : e);
      savePanelSettings();
    });

    const name = document.createElement("label");
    name.className = "panel-name";
    name.htmlFor = checkbox.id;
    name.textContent = titles[entry.key] || entry.key;

    const move = (direction) => {
      const next = entries.slice();
      const target = i + direction;
      [next[i], next[target]] = [next[target], next[i]];
      state.panels = next;
      savePanelSettings();
    };

    const up = document.createElement("button");
    up.type = "button";
    up.className = "move";
    up.textContent = "↑";
    up.title = t("panels.move_up");
    up.disabled = i === 0;
    up.addEventListener("click", () => move(-1));

    const down = document.createElement("button");
    down.type = "button";
    down.className = "move";
    down.textContent = "↓";
    down.title = t("panels.move_down");
    down.disabled = i === entries.length - 1;
    down.addEventListener("click", () => move(1));

    row.append(checkbox, name, up, down);
    list.appendChild(row);
  });
}

// --- Monthly chart --------------------------------------------------------

// Visible section of the monthly chart, derived from the chosen period.
//
// The chosen period steers the zoom here, not the amount of data: the EMA
// 8/12/21 need 16, 24 and 42 completed months of run-up. If the series were
// cut hard, at "1Y" all three lines would have vanished -- which is exactly
// what this chart is built for.
const MONTHLY_MIN_BARS = 24;

function monthlyZoom(data) {
  const months = data.monthly.dates;
  const days = data.daily.dates;
  if (!months.length || !days.length) return null;

  const from = days[0].slice(0, 7);
  const to = days[days.length - 1].slice(0, 7);

  let first = months.findIndex((d) => d.slice(0, 7) >= from);
  if (first < 0) first = 0;
  let last = months.length - 1;
  while (last > first && months[last].slice(0, 7) > to) last -= 1;

  // Below two years the ratio of EMA8 to EMA12 cannot be read off; the
  // section is then padded backwards. Zooming out further is possible with
  // the slider at any time.
  if (last - first + 1 < MONTHLY_MIN_BARS) {
    first = Math.max(0, last - (MONTHLY_MIN_BARS - 1));
  }
  return { start: first, end: last };
}

function buildMonthlyOption(data) {
  const p = palette();
  const m = data.monthly;
  const series = [];

  series.push({
    name: t("series.monthly_candles"), type: "candlestick", data: m.ohlc, z: 4,
    itemStyle: {
      color: p.up, color0: p.surface,
      borderColor: p.up, borderColor0: p.down, borderWidth: 1.4,
    },
  });
  series.push(lineSeries("EMA 8", 0, m.ema8, p.close,
    Object.assign({ lineStyle: { width: 2.2, color: p.close }, z: 6 }, endLabel(p.close))));
  series.push(lineSeries("EMA 12", 0, m.ema12, p.sma50,
    Object.assign({ lineStyle: { width: 2, color: p.sma50 }, z: 6 }, endLabel(p.sma50))));
  series.push(lineSeries("EMA 21", 0, m.ema21, p.sma200,
    Object.assign({ lineStyle: { width: 1.6, color: p.sma200, type: "dashed" }, z: 5 },
                  endLabel(p.sma200))));

  // The running month is still open. The EMA values there keep moving until
  // the monthly close, which is why it is marked. A markArea over a single
  // category has no width and stays invisible -- hence a vertical line.
  if (m.running && m.dates.length) {
    series[0].markLine = {
      symbol: "none", silent: true, animation: false,
      lineStyle: { color: p.muted, type: "dashed", width: 1 },
      label: {
        show: true, position: "insideEndTop",
        color: p.text2, fontSize: 10, formatter: t("chart.running"),
      },
      data: [{ xAxis: m.dates[m.dates.length - 1] }],
    };
  }

  return {
    animation: false,
    backgroundColor: "transparent",
    textStyle: { color: p.text, fontFamily: "system-ui, sans-serif" },
    grid: Object.assign({ top: isNarrow() ? 62 : 44, bottom: 74 }, margins()),
    legend: {
      type: "scroll", top: 4,
      left: isNarrow() ? 8 : 62,
      right: isNarrow() ? 8 : 96,
      textStyle: { color: p.text2, fontSize: 11 },
      data: series.map((s) => s.name),
    },
    xAxis: {
      type: "category", data: m.dates, boundaryGap: true,
      axisLine: { lineStyle: { color: p.border } }, axisTick: { show: false },
      axisLabel: {
        color: p.muted, fontSize: 11, hideOverlap: true,
        formatter: (value) => value.slice(0, 7),
      },
    },
    yAxis: {
      scale: true, axisLine: { show: false }, axisTick: { show: false },
      splitLine: { lineStyle: { color: p.grid } },
      axisLabel: { color: p.muted, fontSize: 11, formatter: (v) => fmt(v, 0) },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross", crossStyle: { color: p.muted } },
      backgroundColor: p.surface, borderColor: p.border,
      textStyle: { color: p.text, fontSize: 12 }, confine: true,
      className: "chart-tooltip",
      formatter: (params) => {
        const dots = dotClasses(p);
        const rows = [];
        const running = m.running && params[0].dataIndex === m.dates.length - 1;
        params.forEach((x) => {
          if (x.seriesType === "candlestick") {
            const [, o, c, l, h] = x.value;
            const pct = o ? ((c - o) / o) * 100 : 0;
            const sign = pct >= 0 ? "+" : "";
            const dot = pct >= 0 ? "tt-up" : "tt-down";
            rows.push(tooltipRow(dot, t("tooltip.open"), fmt(o)));
            rows.push(tooltipRow(dot, running ? t("tooltip.current") : t("tooltip.close"),
                                 `${fmt(c)} (${sign}${fmt(pct)} %)`));
            rows.push(tooltipRow(dot, t("tooltip.high"), fmt(h)));
            rows.push(tooltipRow(dot, t("tooltip.low"), fmt(l)));
            return;
          }
          if (x.value === null || x.value === undefined) return;
          rows.push(tooltipRow(dots[x.color] || "", x.seriesName, fmt(x.value)));
        });
        const head = params[0].axisValue.slice(0, 7)
                   + (running ? t("tooltip.running_suffix") : "");
        return `<div class="tt-head">${head}</div>${rows.join("")}`;
      },
    },
    dataZoom: (() => {
      const z = monthlyZoom(data);
      const bounds = z ? { startValue: z.start, endValue: z.end }
                       : { start: 60, end: 100 };
      return [
        Object.assign({ type: "inside" }, bounds),
        Object.assign({
          type: "slider", bottom: 18, height: 26,
          borderColor: p.border, fillerColor: p.band,
          handleStyle: { color: p.close },
          textStyle: { color: p.muted, fontSize: 10 },
        }, bounds),
      ];
    })(),
    series: series,
  };
}

// --- Monthly position -----------------------------------------------------

// The server sends a key, not a phrase -- both the wording and the colour
// class are picked from it here, so that neither depends on the language.
const POSITION_CLASSES = {
  above_ema8: "above",
  below_ema8: "below",
  below_both: "below",
  between: "between",
};

function renderMonthlyStatus(data, historical) {
  const card = el("monthly-card");
  const s = data.monthly_status;
  if (!s || s.ema8 === null || s.ema8 === undefined) {
    card.hidden = true;
    return;
  }
  card.hidden = false;
  el("mon-months").textContent = t("monthly.months", { count: s.months });

  const verdict = el("mon-verdict");
  verdict.className = "mon-verdict " + (POSITION_CLASSES[s.position] || "between");

  // If EMA12 sits below EMA8, it is the next line of support underneath --
  // only then does the thought "EMA12 is the target again" hold. If it sits
  // above, the same statement would simply be wrong.
  const direction = s.uptrend === true
    ? t("monthly.support_below")
    : s.uptrend === false
    ? t("monthly.resistance_above")
    : "";
  verdict.textContent = t("monthly.verdict", {
    symbol: data.symbol,
    position: t("monthly." + s.position),
  }) + direction;

  // Label on the left, value on the right -- the distance stands immediately
  // before it on the same line.
  const row = (name, value, distance) => {
    const dt = document.createElement("dt");
    dt.textContent = name;

    const dd = document.createElement("dd");
    if (distance !== undefined && distance !== null) {
      const span = document.createElement("span");
      // Color by the sign: positive green, negative red. Positive here means
      // "level lies above the price" -- so the meaning differs from that of a
      // price change.
      span.className = "delta " + (distance >= 0 ? "up" : "down");
      span.textContent = (distance >= 0 ? "+" : "") + fmt(distance) + " %";
      dd.appendChild(span);
    }
    dd.appendChild(document.createTextNode(fmt(value)));

    return [dt, dd];
  };

  const grid = el("mon-grid");
  grid.innerHTML = "";
  [
    row(t("monthly.row_price"), s.price),
    row("EMA 8", s.ema8, s.dist8),
    row("EMA 12", s.ema12, s.dist12),
    row("EMA 21", s.ema21, s.dist21),
  ].forEach(([dt, dd]) => { grid.appendChild(dt); grid.appendChild(dd); });

  const notes = [
    t("monthly.note_percent"),
    t("monthly.note_completed"),
  ];
  // The card always describes today's position. If the chart shows a period
  // in the past, that has to be stated -- otherwise the numbers read as the
  // state back then.
  if (historical) {
    notes.push(t("monthly.note_today"));
  }
  if (s.running) {
    notes.push(t("monthly.note_days_left", { count: s.trading_days_left }));
  }
  // An EMA whose starting value still shows through is not displayed but
  // omitted with a reason.
  (s.short_history || []).forEach((n) => {
    notes.push(t("monthly.note_short_history", {
      length: n, needed: s.settle_factor * n, have: s.months,
    }));
  });
  el("mon-note").textContent = notes.join(" ");
}

// --- Signals --------------------------------------------------------------

function renderSignals() {
  const list = el("sig-list");
  const filters = el("sig-filters");
  list.innerHTML = "";
  filters.innerHTML = "";
  if (!state.data) return;

  const all = state.data.signals;
  el("sig-count").textContent = "(" + all.length + ")";

  const groups = ["all"].concat(Object.keys(SIGNAL_GROUPS));
  groups.forEach((group) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = t("filter." + group);
    if (group === state.filter) button.className = "active";
    button.addEventListener("click", () => { state.filter = group; renderSignals(); });
    filters.appendChild(button);
  });

  const wanted = state.filter === "all" ? null : SIGNAL_GROUPS[state.filter];
  const shown = wanted ? all.filter((s) => wanted.includes(s.kind)) : all;

  // Newest first -- on opening it is the most recent situation that matters.
  shown.slice().reverse().forEach((signal) => {
    const item = document.createElement("li");
    item.tabIndex = 0;
    // The color comes from a class, not from a style attribute: the
    // Content-Security-Policy allows no 'unsafe-inline' for styles, an
    // attribute set here would have no effect (see style.css).
    const tone = SIGNAL_COLORS[signal.kind] || "muted";
    item.innerHTML =
      `<time datetime="${signal.date}">${signal.date}</time>` +
      `<span><span class="dot dot-${tone}"></span>${signal.text}</span>`;
    const jump = () => jumpToDate(signal.date);
    item.addEventListener("click", jump);
    item.addEventListener("keydown", (e) => { if (e.key === "Enter") jump(); });
    list.appendChild(item);
  });
}

// Jumps to a date in the visible chart: zoom to a window around it, then set
// the crosshair on the day.
function jumpToDate(date) {
  const chart = state.tab === "daily" ? daily : state.tab === "weekly" ? weekly : monthly;
  if (!chart) return;
  const dates = state.tab === "daily" ? state.data.daily.dates
              : state.tab === "weekly" ? state.data.weekly.dates
              : (state.data.monthly || {}).dates || [];

  let position = dates.indexOf(date);
  if (position < 0) {
    // In the weekly chart the day does not exist -- take the week before it.
    for (let i = dates.length - 1; i >= 0; i--) {
      if (dates[i] <= date) { position = i; break; }
    }
  }
  if (position < 0) return;

  const span = Math.max(20, Math.round(dates.length * 0.12));
  chart.dispatchAction({
    type: "dataZoom",
    startValue: Math.max(0, position - span),
    endValue: Math.min(dates.length - 1, position + span),
  });
  chart.dispatchAction({ type: "showTip", seriesIndex: 0, dataIndex: position });
}

// --- Favorites ------------------------------------------------------------

// Miniature course as SVG rather than as another chart: with a dozen
// favorites that would be a dozen ECharts instances for thirty values each.
function sparkline(values, color) {
  const width = 64, height = 22, pad = 2;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "fav-spark");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("aria-hidden", "true");

  const points = (values || []).filter((v) => v !== null && v !== undefined);
  if (points.length < 2) return svg;

  const low = Math.min(...points), high = Math.max(...points);
  const span = high - low || 1;
  const step = (width - 2 * pad) / (points.length - 1);
  const coords = points.map((v, i) =>
    `${(pad + i * step).toFixed(1)},${(height - pad - ((v - low) / span) * (height - 2 * pad)).toFixed(1)}`
  );

  const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  line.setAttribute("points", coords.join(" "));
  line.setAttribute("fill", "none");
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", "1.5");
  line.setAttribute("stroke-linejoin", "round");
  line.setAttribute("stroke-linecap", "round");
  svg.appendChild(line);
  return svg;
}

function favoriteRow(item, p) {
  const row = document.createElement("li");
  row.tabIndex = 0;
  row.dataset.symbol = item.symbol;
  if (item.symbol === state.symbol) row.classList.add("active");

  const rising = (item.change_pct || 0) >= 0;
  const color = item.error ? p.muted : rising ? p.up : p.down;

  const name = document.createElement("div");
  name.innerHTML = `<div class="fav-sym"></div><div class="fav-name"></div>`;
  name.querySelector(".fav-sym").textContent = item.symbol;
  name.querySelector(".fav-name").textContent =
    item.label || item.exchange || "";
  row.appendChild(name);

  row.appendChild(sparkline(item.history, color));

  const nums = document.createElement("div");
  nums.className = "fav-nums";
  if (item.error) {
    const note = document.createElement("div");
    note.className = "fav-error";
    note.textContent = t("favorites.unavailable");
    nums.appendChild(note);
  } else {
    const sign = rising ? "+" : "";
    nums.innerHTML =
      `<div class="fav-last">${fmt(item.last)}</div>` +
      `<div class="fav-chg ${rising ? "up" : "down"}">${sign}${fmt(item.change_pct)} %</div>`;
  }
  row.appendChild(nums);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "fav-del";
  remove.textContent = "×";
  remove.title = t("favorites.remove", { symbol: item.symbol });
  remove.addEventListener("click", async (event) => {
    event.stopPropagation();
    try {
      await api("/api/watchlist/" + encodeURIComponent(item.symbol), { method: "DELETE" });
    } catch (error) {
      // Without this branch the row stayed put as though it had worked.
      showStatus(item.symbol + ": " + error.message, true);
      return;
    }
    refreshWatchlist();
  });
  row.appendChild(remove);

  const open = () => load(item.symbol);
  row.addEventListener("click", open);
  row.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
  });
  return row;
}

// One fetch serves both: the quick selection in the header and the list in
// the sidebar. If the symbols are in the store, that costs no request to
// Yahoo.
async function refreshWatchlist() {
  try {
    state.favorites = (await api("/api/watchlist/quotes")).items;
  } catch (e) {
    return state.favorites;
  }
  renderWatchlist(state.favorites);
  return state.favorites;
}

// Only move the marker of the currently displayed instrument. When switching
// between favorites the prices do not have to be fetched again.
function markActive() {
  document.querySelectorAll("#watchlist button, #fav-list li").forEach((node) => {
    const symbol = node.dataset.symbol;
    node.classList.toggle("active", symbol === state.symbol);
  });
  updateStar(state.favorites.map((i) => i.symbol));
}

function renderWatchlist(items) {
  const p = palette();

  const bar = el("watchlist");
  bar.innerHTML = "";
  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.symbol;
    button.dataset.symbol = item.symbol;
    if (item.symbol === state.symbol) button.classList.add("active");
    button.addEventListener("click", () => load(item.symbol));
    bar.appendChild(button);
  });

  const list = el("fav-list");
  list.innerHTML = "";
  items.forEach((item) => list.appendChild(favoriteRow(item, p)));

  el("fav-count").textContent = items.length ? "(" + items.length + ")" : "";
  el("fav-empty").hidden = items.length > 0;

  updateStar(items.map((i) => i.symbol));
}

function updateStar(symbols) {
  const star = el("star");
  const saved = symbols.includes(state.symbol);
  star.textContent = saved ? "★" : "☆";
  star.title = saved ? t("star.remove") : t("star.add");
  star.dataset.saved = saved ? "1" : "0";
}

// --- Loading and drawing --------------------------------------------------

async function load(symbol, range) {
  symbol = (symbol || state.symbol).trim().toUpperCase();
  if (!symbol) return;
  state.symbol = symbol;
  if (range) {
    // Clicking a preset cancels the freely chosen period.
    state.range = range;
    state.start = null;
    state.end = null;
  }
  el("symbol").value = symbol;
  showStatus(t("status.loading", { symbol: symbol }), false);

  const query = new URLSearchParams({ symbol: symbol });
  if (state.start || state.end) {
    if (state.start) query.set("start", state.start);
    if (state.end) query.set("end", state.end);
  } else {
    query.set("range", state.range);
  }

  let data;
  try {
    data = await api("/api/chart?" + query.toString());
  } catch (error) {
    showStatus(symbol + ": " + error.message, true);
    return;
  }

  state.data = data;
  showStatus("", false);
  renderQuote(data);
  // If the window ends before the last trading day, it is a look back.
  const visible = data.daily.dates;
  const historical = Boolean(
    state.end && visible.length && visible[visible.length - 1] < todayISO()
  );
  renderMonthlyStatus(data, historical);
  renderSignals();
  draw();
  markActive();

  // Take the displayed period into the date fields. That way it is always
  // visible which window is actually shown -- a requested 1 January becomes
  // the first trading day after it.
  const days = data.daily.dates;
  if (days.length) {
    el("date-from").value = days[0];
    el("date-to").value = days[days.length - 1];
  }
  const custom = Boolean(state.start || state.end);
  el("custom-range").classList.toggle("active", custom);
  // If a custom period is set, the area stays open on the phone as well --
  // otherwise it would not be visible which one applies.
  if (custom) el("custom-range").classList.add("open");
  el("toggle-dates").classList.toggle("active", custom);

  const url = new URL(window.location.href);
  url.searchParams.set("symbol", symbol);
  url.searchParams.delete("range");
  url.searchParams.delete("start");
  url.searchParams.delete("end");
  if (state.start || state.end) {
    if (state.start) url.searchParams.set("start", state.start);
    if (state.end) url.searchParams.set("end", state.end);
  } else {
    url.searchParams.set("range", state.range);
  }
  window.history.replaceState({}, "", url);
}

function renderQuote(data) {
  el("quote").hidden = false;
  el("q-symbol").textContent = data.symbol;
  el("q-name").textContent = [data.exchange, data.currency].filter(Boolean).join(" · ");
  el("q-last").textContent = fmt(data.last);

  const change = el("q-change");
  if (data.change_pct === null) {
    change.textContent = "";
  } else {
    const sign = data.change_pct >= 0 ? "+" : "";
    change.textContent = sign + fmt(data.change_pct) + " %";
    change.className = "change " + (data.change_pct >= 0 ? "up" : "down");
  }

  // Where the data came from. Makes it visible that a repeat call gets by
  // without a request to Yahoo.
  const badge = el("q-cache");
  const f = data.fetch || {};
  badge.hidden = false;
  if (f.stale) {
    badge.textContent = t("badge.stale");
  } else if (!f.requests) {
    badge.textContent = t("badge.from_store", { bars: f.stored_bars });
  } else if (f.new_bars) {
    badge.textContent = t("badge.reloaded", { bars: f.new_bars, requests: f.requests });
  } else {
    badge.textContent = t("badge.checked");
  }
}

// Remembers which coordinate system the pointer is over. ECharts does not
// reveal that in the tooltip formatter by itself, but containPixel answers it
// per grid.
function trackPointer(chart) {
  chart.getZr().on("mousemove", (event) => {
    for (let i = 0; i < dailyPanelKeys.length; i++) {
      if (chart.containPixel({ gridIndex: i }, [event.offsetX, event.offsetY])) {
        hoveredPanel = dailyPanelKeys[i];
        return;
      }
    }
  });
  // If the pointer leaves the chart, "no panel" applies again -- otherwise
  // the last selection would stick on the next entry.
  chart.getZr().on("globalout", hideAllTooltips);
}

// Clears crosshair boxes and ECharts tooltips away. The daily panels have
// HTML boxes of their own (showContent: false), the weekly and monthly charts
// the built-in tooltip -- both have to go.
function hideAllTooltips() {
  hoveredPanel = null;
  hidePanelTooltips();
  [daily, weekly, monthly].forEach((chart) => {
    if (chart) chart.dispatchAction({ type: "hideTip" });
  });
}

// With a mouse, ECharts reports "globalout" as soon as the pointer leaves the
// plotting area. With touch there is no such thing: the finger wanders out of
// the chart or taps elsewhere without the chart ever seeing a departure.
// ECharts hides the crosshair by itself, but our own boxes stayed put. These
// three events make up for that.
function setupTooltipDismiss() {
  const area = document.querySelector(".charts");
  if (!area) return;

  const outside = (x, y) => {
    const r = area.getBoundingClientRect();
    return x < r.left || x > r.right || y < r.top || y > r.bottom;
  };

  // The finger wanders out of the chart while held down.
  document.addEventListener("touchmove", (event) => {
    const point = event.touches[0];
    if (point && outside(point.clientX, point.clientY)) hideAllTooltips();
  }, { passive: true });

  // Touch or click anywhere outside the charts. capture, so that it also
  // takes effect when the target itself stops propagation.
  document.addEventListener("pointerdown", (event) => {
    if (!area.contains(event.target)) hideAllTooltips();
  }, { passive: true, capture: true });

  // Safety net for browsers in which globalout does not appear.
  area.addEventListener("mouseleave", hideAllTooltips);
}

function draw() {
  if (!state.data) return;

  if (state.tab === "daily") {
    const option = buildDailyOption(state.data);
    const box = el("chart-daily");
    box.style.height = option._height + "px";
    if (!daily) {
      daily = echarts.init(box, null, { renderer: "canvas" });
      trackPointer(daily);
      // The crosshair reports on every move which day it stands on.
      daily.on("updateAxisPointer", (event) => {
        const axis = (event.axesInfo || [])[0];
        if (axis && axis.value !== undefined) updatePanelTooltips(axis.value);
      });
      daily.on("legendselectchanged", (event) => {
        applyLegendState(event.selected);
        scheduleLabelSpread(daily);
      });
      // When zooming the lines move, so the labels have to be pushed apart
      // again.
      daily.on("dataZoom", () => scheduleLabelSpread(daily));
    }
    daily.resize();
    daily.setOption(option, true);
    spreadEndLabels(daily);
    renderPanelTooltips();
    // Hide the series that are deselected by default (the monthly levels)
    // right away.
    const legends = daily.getOption().legend || [];
    const selected = Object.assign({}, ...legends.map((l) => l.selected || {}));
    applyLegendState(selected);
  } else if (state.tab === "weekly") {
    const box = el("chart-weekly");
    if (!weekly) {
      weekly = echarts.init(box, null, { renderer: "canvas" });
      weekly.on("dataZoom", () => scheduleLabelSpread(weekly));
      weekly.on("legendselectchanged", () => scheduleLabelSpread(weekly));
    }
    weekly.resize();
    weekly.setOption(buildWeeklyOption(state.data), true);
    spreadEndLabels(weekly);
  } else if (state.data.monthly && state.data.monthly.dates) {
    const box = el("chart-monthly");
    if (!monthly) {
      monthly = echarts.init(box, null, { renderer: "canvas" });
      monthly.on("dataZoom", () => scheduleLabelSpread(monthly));
      monthly.on("legendselectchanged", () => scheduleLabelSpread(monthly));
    }
    monthly.resize();
    monthly.setOption(buildMonthlyOption(state.data), true);
    spreadEndLabels(monthly);
  } else if (monthly) {
    // No monthly block for the new symbol. Without this clearing, the candles
    // of the previous symbol stayed under the new heading.
    monthly.clear();
  }
}

// --- Autocompletion -------------------------------------------------------

let searchTimer = null;

// After a tap on a suggestion, touch devices often send a belated mouse click
// to the same spot on the screen ("ghost click"). The suggestion list is
// closed by then, so it hits whatever lies beneath -- on the phone the period
// buttons 6M/1Y/2Y. This function catches exactly one such click. The window
// is kept tight, so that a deliberate second tap is not swallowed.
function catchGhostClick() {
  let cleanup = null;
  const catcher = (event) => {
    event.stopPropagation();
    event.preventDefault();
    cleanup();
  };
  cleanup = () => {
    document.removeEventListener("click", catcher, true);
    clearTimeout(timer);
  };
  const timer = setTimeout(cleanup, 400);
  document.addEventListener("click", catcher, true);
}

function setupSearch() {
  const input = el("symbol");
  const box = el("suggestions");

  const hide = () => { box.hidden = true; box.innerHTML = ""; };

  // A suggestion was chosen.
  const choose = (symbol) => {
    hide();
    // Without blur() the field stays focused and the on-screen keyboard up,
    // even though the input is finished and the chart below is meant to be
    // read.
    input.blur();
    load(symbol);
  };

  input.addEventListener("input", () => {
    const query = input.value.trim();
    clearTimeout(searchTimer);
    if (query.length < 2) { hide(); return; }
    // Wait briefly, so that not every keystroke triggers a request.
    searchTimer = setTimeout(async () => {
      let results = [];
      try { results = (await api("/api/search?q=" + encodeURIComponent(query))).results; }
      catch (e) { return; }
      if (!results.length) { hide(); return; }
      box.innerHTML = "";
      results.forEach((r) => {
        const item = document.createElement("li");
        // Not via innerHTML: symbol, name and exchange come unchecked from
        // Yahoo. The CSP does prevent scripts from running, but injected
        // markup would take the list apart.
        const sym = document.createElement("span");
        sym.className = "sym";
        sym.textContent = r.symbol;
        const meta = document.createElement("span");
        meta.className = "meta";
        meta.textContent = [r.name, r.exchange].filter(Boolean).join(" · ");
        item.append(sym, meta);
        item.dataset.symbol = r.symbol;
        box.appendChild(item);
      });
      box.hidden = false;
    }, 220);
  });

  // The selection no longer hangs on every entry but on the list -- otherwise
  // each branch below would have to be written three times.
  const hitSymbol = (event) => {
    const item = event.target.closest("li[data-symbol]");
    return item && box.contains(item) ? item.dataset.symbol : null;
  };

  // Mouse: mousedown would leave the field and, via blur, take the list away
  // before the click reaches it. preventDefault keeps the focus.
  box.addEventListener("mousedown", (event) => { if (hitSymbol(event)) event.preventDefault(); });
  box.addEventListener("click", (event) => {
    const symbol = hitSymbol(event);
    if (symbol) choose(symbol);
  });

  // Finger: touchend rather than pointerdown. pointerdown used to fire as
  // soon as the finger came down and tore the list away from under it -- the
  // ghost click then landed on the period buttons. touchend only fires on
  // lifting, and preventDefault there suppresses the trailing mouse events as
  // well.
  let startY = null;
  box.addEventListener("touchstart", (event) => {
    startY = event.touches.length === 1 ? event.touches[0].clientY : null;
  }, { passive: true });
  box.addEventListener("touchend", (event) => {
    const symbol = hitSymbol(event);
    // Whoever scrolled the list did not mean to select.
    const swiped = startY === null || !event.changedTouches.length
      || Math.abs(event.changedTouches[0].clientY - startY) > 10;
    startY = null;
    if (!symbol || swiped) return;
    event.preventDefault();
    catchGhostClick();
    choose(symbol);
  });

  // Without a "show" button, either a tap on a suggestion or the Enter key
  // loads. On mobile devices that is the "Go" key.
  input.addEventListener("keydown", (event) => {
    // blur() here as well: on the phone the keyboard would otherwise cover
    // the chart just loaded.
    if (event.key === "Enter") { hide(); input.blur(); load(input.value); }
    if (event.key === "Escape") { hide(); input.blur(); }
  });
  // Start empty when entering. Otherwise the last loaded ticker stands there
  // and would have to be deleted by hand before every new input -- which is
  // particularly tiresome on a phone.
  input.addEventListener("focus", () => {
    input.value = "";
    hide();
  });

  input.addEventListener("blur", () => {
    setTimeout(hide, 150);
    // If nothing was typed, show the loaded symbol again. A permanently empty
    // field after an accidental tap would say less than the current state.
    // load() sets the same value.
    if (!input.value && state.symbol) input.value = state.symbol;
  });
}

// --- Setup ----------------------------------------------------------------

function applyTheme(theme) {
  if (theme) document.documentElement.setAttribute("data-theme", theme);
  else document.documentElement.removeAttribute("data-theme");
  // ECharts reads the colors while building the option, so redraw.
  draw();
  renderSignals();
  renderWatchlist(state.favorites);
  if (state.data) {
    const days = state.data.daily.dates;
    renderMonthlyStatus(state.data, Boolean(
      state.end && days.length && days[days.length - 1] < todayISO()));
  }
}

function setupTheme() {
  let stored = null;
  try { stored = localStorage.getItem("chart-theme"); } catch (e) { /* e.g. private window */ }
  if (stored) document.documentElement.setAttribute("data-theme", stored);

  el("theme").addEventListener("click", () => {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const current = document.documentElement.getAttribute("data-theme") || (dark ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    try { localStorage.setItem("chart-theme", next); } catch (e) { /* never mind */ }
    applyTheme(next);
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!document.documentElement.getAttribute("data-theme")) applyTheme(null);
  });
}

// Draw one favorite at random when the page is opened. Entries that are not
// available right now stay out of it -- otherwise the page would start with
// an error message.
function randomFavorite() {
  const usable = state.favorites.filter((item) => !item.error && item.symbol);
  if (!usable.length) return null;
  return usable[Math.floor(Math.random() * usable.length)].symbol;
}

// Fallback when there are no usable favorites.
const FALLBACK_SYMBOL = "GOOGL";

function closePanelConfig() {
  el("panel-config").hidden = true;
  el("toggle-panels").setAttribute("aria-expanded", "false");
  el("toggle-panels").classList.remove("active");
}

async function init() {
  setupSearch();
  setupTheme();
  setupTooltipDismiss();

  el("star").addEventListener("click", async () => {
    if (!state.symbol) return;
    try {
      if (el("star").dataset.saved === "1") {
        await api("/api/watchlist/" + encodeURIComponent(state.symbol), { method: "DELETE" });
      } else {
        const body = new FormData();
        body.append("symbol", state.symbol);
        await api("/api/watchlist", { method: "POST", body: body });
      }
    } catch (error) {
      showStatus(error.message, true);
      return;
    }
    refreshWatchlist();
  });

  el("ranges").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-range]");
    if (!button) return;
    el("ranges").querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    load(state.symbol, button.dataset.range);
  });

  // Do not offer a date in the future.
  const today = todayISO();
  el("date-from").max = today;
  el("date-to").max = today;

  const applyRange = () => {
    const fromDate = el("date-from").value;
    const toDate = el("date-to").value;
    if (!fromDate && !toDate) {
      showStatus(t("status.pick_a_date"), true);
      return;
    }
    if (fromDate && toDate && toDate < fromDate) {
      showStatus(t("status.start_after_end"), true);
      return;
    }
    state.start = fromDate || null;
    state.end = toDate || null;
    el("ranges").querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    load(state.symbol);
  };

  el("toggle-panels").addEventListener("click", () => {
    const card = el("panel-config");
    const open = card.hidden;
    card.hidden = !open;
    el("toggle-panels").setAttribute("aria-expanded", String(open));
    el("toggle-panels").classList.toggle("active", open);
  });

  el("reset-panels").addEventListener("click", async () => {
    try {
      state.panels = (await api("/api/settings/panels", { method: "DELETE" })).panels;
    } catch (error) {
      showStatus(error.message, true);
      return;
    }
    renderPanelConfig();
    draw();
  });

  // On narrow screens the date fields are folded away.
  el("toggle-dates").addEventListener("click", () => {
    const field = el("custom-range");
    const open = !field.classList.contains("open");
    field.classList.toggle("open", open);
    el("toggle-dates").setAttribute("aria-expanded", String(open));
    el("toggle-dates").classList.toggle("active", open);
    // Deliberately no focus(): on the phone that immediately opens the date
    // picker for "from", although at first only both fields are meant to
    // become visible.
  });

  el("apply-range").addEventListener("click", applyRange);
  el("custom-range").addEventListener("keydown", (event) => {
    if (event.key === "Enter") { event.preventDefault(); applyRange(); }
  });

  el("tabs").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-tab]");
    if (!button) return;
    el("tabs").querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    state.tab = button.dataset.tab;
    // The panel selection concerns the daily chart only.
    el("toggle-panels").hidden = state.tab !== "daily";
    if (state.tab !== "daily") closePanelConfig();

    // Hide the whole wrapper, not just the chart inside it: the tooltip boxes
    // lie above it as absolutely positioned elements and would otherwise stay
    // put on the weekly and monthly chart -- the wrapper does collapse to
    // height 0, but its children do not disappear with it.
    el("chart-daily-wrap").hidden = state.tab !== "daily";
    if (state.tab !== "daily") hidePanelTooltips();
    el("chart-weekly").hidden = state.tab !== "weekly";
    el("chart-monthly").hidden = state.tab !== "monthly";
    draw();
  });

  // When the device is turned, not only the size changes but the layout
  // itself (title next to or above the legend). If the page crosses the
  // threshold, it has to be rebuilt rather than merely scaled.
  let wasNarrow = isNarrow();
  let rebuild = null;
  window.addEventListener("resize", () => {
    clearTimeout(rebuild);
    rebuild = setTimeout(() => {
      if (isNarrow() !== wasNarrow) {
        wasNarrow = isNarrow();
        draw();
        return;
      }
      if (daily) { daily.resize(); scheduleLabelSpread(daily); }
      if (weekly) { weekly.resize(); scheduleLabelSpread(weekly); }
      if (monthly) { monthly.resize(); scheduleLabelSpread(monthly); }
    }, 150);
  });

  const params = new URLSearchParams(window.location.search);
  const range = params.get("range");
  if (range) {
    state.range = range;
    el("ranges").querySelectorAll("button").forEach((b) => {
      b.classList.toggle("active", b.dataset.range === range);
    });
  }
  // A shared link with a free period restores it.
  if (params.get("start") || params.get("end")) {
    state.start = params.get("start");
    state.end = params.get("end");
    el("date-from").value = state.start || "";
    el("date-to").value = state.end || "";
    el("ranges").querySelectorAll("button").forEach((b) => b.classList.remove("active"));
  }

  // Fetch settings and favorites first, then decide what is shown.
  await loadPanelSettings();
  await refreshWatchlist();

  // If a symbol stands in the address, that applies -- so a shared or
  // reloaded link keeps its instrument. Otherwise one is drawn at random.
  // After signing in the redirect goes to "/" without parameters, so the
  // random choice always applies there.
  const wanted = params.get("symbol") || randomFavorite() || FALLBACK_SYMBOL;
  load(wanted);
}

document.addEventListener("DOMContentLoaded", init);
