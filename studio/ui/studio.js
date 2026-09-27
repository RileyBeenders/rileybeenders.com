/**
 * Studio — the editor shell.
 *
 * Loads each data file once, keeps a working copy in memory, and writes it back
 * through the local API. Nothing is saved until you press Save, and a save is
 * refused if the file changed on disk underneath you.
 */

import { SCHEMAS, RAIL } from "./schema.js";
import { el, renderFields, normalize, thumbImage, gripHandle, makeSortable } from "./fields.js";
import { createDevicesPanel } from "./devices.js";
import { createFilePicker } from "./files.js";

const state = {
  files: [],
  /** Where the dev site is, from the server — the launcher may have moved it. */
  siteUrl: "http://localhost:3000",
  activeKey: null,
  /** key -> { label, shape, data, revision, dirty } */
  docs: {},
  /** key -> index of the entry being edited, for array files */
  selection: {},
  /** key -> id of the open tab, for schemas with tabs. Kept as you move between entries. */
  tab: {}
};

const dom = {
  rail: document.querySelector("#file-rail"),
  listPane: document.querySelector("#list-pane"),
  listBody: document.querySelector("#list-body"),
  listTitle: document.querySelector("#list-title"),
  listCount: document.querySelector("#list-count"),
  listActions: document.querySelector("#list-actions"),
  detail: document.querySelector("#detail"),
  docTitle: document.querySelector("#doc-title"),
  docPath: document.querySelector("#doc-path"),
  saveBtn: document.querySelector("#save"),
  revertBtn: document.querySelector("#revert"),
  status: document.querySelector("#status"),
  themeToggle: document.querySelector("#theme-toggle"),
  toast: document.querySelector("#toast"),
  modal: document.querySelector("#modal"),
  confirm: document.querySelector("#confirm"),
  siteLink: document.querySelector("#site-link"),
  devicesBtn: document.querySelector("#devices"),
  filesBtn: document.querySelector("#files-button"),
  devicesDialog: document.querySelector("#devices-dialog")
};

/* ------------------------------------------------------------------ api --- */

async function api(path, options) {
  const response = await fetch(path, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const problems = payload.problems ? `\n• ${payload.problems.join("\n• ")}` : "";
    throw new Error((payload.error || `Request failed (${response.status})`) + problems);
  }
  return payload;
}

const clone = (value) => JSON.parse(JSON.stringify(value));

/** Counts the leaf values that differ between two JSON trees — "3 fields changed" for a save toast. */
function countChanges(before, after) {
  if (before === after) return 0;
  const isObject = (v) => v !== null && typeof v === "object";
  if (!isObject(before) || !isObject(after)) return 1;
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  let total = 0;
  for (const key of keys) total += countChanges(before[key], after[key]);
  return total;
}

const timeOfDay = (ms) => new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/**
 * The Studio's own yes/no, in place of window.confirm. Resolves true when the
 * user takes the action, false on Cancel or Escape.
 */
function confirmDialog({ title, body, action = "Continue", danger = false }) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      dom.confirm.close();
      dom.confirm.replaceChildren();
      resolve(value);
    };
    const ok = el("button", { type: "button", class: `f-btn ${danger ? "f-btn--danger" : "f-btn--solid"}`, onClick: () => finish(true) }, action);
    dom.confirm.replaceChildren(
      el("div", { class: "confirm-body" }, el("h2", {}, title), body ? el("p", {}, body) : null),
      el("div", { class: "confirm-foot" },
        el("button", { type: "button", class: "f-btn f-btn--quiet", onClick: () => finish(false) }, "Cancel"),
        ok)
    );
    dom.confirm.addEventListener("close", () => finish(false), { once: true });
    dom.confirm.showModal();
    ok.focus();
  });
}

function toast(message, tone = "ok") {
  dom.toast.textContent = message;
  dom.toast.className = `toast toast--${tone} is-shown`;
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => { dom.toast.className = "toast"; }, tone === "error" ? 9000 : 3200);
}

/* ---------------------------------------------------------------- state --- */

function activeDoc() {
  return state.docs[state.activeKey];
}

function schemaFor(key) {
  return SCHEMAS[key];
}

/** Options for the "links to project / proof" dropdowns. */
function buildRefs() {
  const refs = { projects: [], proofs: [] };
  for (const key of Object.keys(refs)) {
    const doc = state.docs[key];
    if (!Array.isArray(doc?.data)) continue;
    refs[key] = doc.data
      .filter((entry) => typeof entry.id === "string" && entry.id !== "")
      .map((entry) => ({ id: entry.id, label: `${schemaFor(key).title(entry)} — ${entry.id}` }));
  }
  return refs;
}

function markDirty() {
  const doc = activeDoc();
  if (!doc) return;
  doc.dirty = true;
  paintChrome();
  paintRail();
}

async function loadDoc(key) {
  if (state.docs[key]) return state.docs[key];
  const payload = await api(`/api/file/${key}`);
  state.docs[key] = {
    label: payload.label,
    file: payload.file,
    data: payload.data,
    original: clone(payload.data),
    revision: payload.revision,
    dirty: false,
    savedAt: null
  };
  // A copy kept across a reload after a refused save comes back as unsaved work.
  let stash = null;
  try { stash = sessionStorage.getItem(`studio-stash:${key}`); } catch {}
  if (stash) {
    try {
      state.docs[key].data = JSON.parse(stash);
      state.docs[key].dirty = true;
      sessionStorage.removeItem(`studio-stash:${key}`);
      toast(`Your unsaved copy of ${payload.file} was restored. The file on disk had changed underneath it, so check before saving.`);
    } catch {
      // A stash that will not parse is not worth more than the file on disk.
    }
  }
  return state.docs[key];
}

/* -------------------------------------------------------------- rail ----- */

/**
 * The rail is a table of contents for the site: one group per page, in the
 * order a visitor reads them (see RAIL in schema.js), with a divider wherever
 * the page changes. Only files the server actually serves are shown.
 */
function paintRail() {
  const served = new Set(state.files.map((file) => file.key));
  dom.rail.replaceChildren(
    ...RAIL.flatMap((group) => {
      const keys = group.keys.filter((key) => served.has(key) && schemaFor(key));
      if (keys.length === 0) return [];
      return el("div", { class: "rail-group", role: "group", "aria-label": group.page }, ...keys.map(railItem));
    })
  );
}

function railItem(key) {
  const schema = schemaFor(key);
  const doc = state.docs[key];
  return el("button", {
    type: "button",
    class: `rail-item${key === state.activeKey ? " is-active" : ""}`,
    "aria-current": key === state.activeKey ? "page" : undefined,
    onClick: () => selectFile(key)
  },
    schema.icon === "gear" ? gearIcon() : null,
    el("span", { class: "rail-name" }, schema.label),
    doc?.dirty ? el("span", { class: "rail-dot", title: "Unsaved changes" }) : null);
}

/** Lucide's settings cog — the same icon family as the theme toggle. */
function gearIcon() {
  return el("svg", {
    class: "rail-icon", width: 14, height: 14, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round",
    "aria-hidden": "true"
  },
    el("path", { d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" }),
    el("circle", { cx: 12, cy: 12, r: 3 }));
}

/* --------------------------------------------------------------- list ---- */

function isHidden(schema, entry) {
  return Boolean(schema.visibilityField) && entry[schema.visibilityField] === false;
}

function paintList() {
  const key = state.activeKey;
  const schema = schemaFor(key);
  const doc = activeDoc();

  if (schema.shape !== "array") {
    dom.listPane.hidden = true;
    return;
  }
  dom.listPane.hidden = false;
  dom.listTitle.textContent = schema.label;

  const selected = state.selection[key] ?? 0;

  // The list's real shape, said once: how many are on the site, how many are drafts.
  if (schema.visibilityField) {
    const drafts = doc.data.filter((entry) => isHidden(schema, entry)).length;
    const live = doc.data.length - drafts;
    dom.listCount.textContent = doc.data.length === 0 ? "" : `${live} on the site · ${drafts} ${drafts === 1 ? "draft" : "drafts"}`;
  } else {
    dom.listCount.textContent = doc.data.length === 0 ? "" : `${doc.data.length} ${doc.data.length === 1 ? "entry" : "entries"}`;
  }

  dom.listBody.replaceChildren(
    ...doc.data.map((entry, index) => {
      const hidden = isHidden(schema, entry);
      const row = el("div", { class: `list-item${index === selected ? " is-active" : ""}${hidden ? " is-hidden" : ""}` },
        gripHandle(schema.title(entry)),
        el("button", {
          type: "button",
          class: "list-open",
          "aria-current": index === selected ? "true" : undefined,
          title: "Alt+↑ / Alt+↓ moves this entry",
          onClick: () => { state.selection[key] = index; paintList(); paintDetail(); paintSiteLink(); },
          onKeydown: (event) => {
            if (!event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
            event.preventDefault();
            reorder(index, event.key === "ArrowUp" ? index - 1 : index + 1);
            dom.listBody.querySelectorAll(".list-open")[state.selection[key]]?.focus();
          }
        },
          el("span", { class: "list-name" },
            el("span", { class: "list-name-text" }, schema.title(entry)),
            schema.visibilityField
              ? (hidden ? el("span", { class: "list-draft" }, "Draft") : el("span", { class: "list-live", title: "On the site", "aria-label": "on the site" }))
              : null),
          el("span", { class: "list-sub" }, schema.subtitle ? schema.subtitle(entry) : "")),
        el("div", { class: "list-tools" },
          schema.visibilityField
            ? el("button", {
                type: "button",
                class: `eye${hidden ? " is-off" : ""}`,
                title: hidden ? "Hidden from the site — click to show" : "Live on the site — click to hide",
                "aria-label": hidden ? "Show on the site" : "Hide from the site",
                onClick: () => {
                  if (hidden) delete entry[schema.visibilityField];
                  else entry[schema.visibilityField] = false;
                  markDirty();
                  paintList();
                  paintDetail();
                }
              }, eyeIcon(hidden))
            : null));
      return row;
    })
  );
  makeSortable(dom.listBody, reorder, `list:${key}`);

  dom.listActions.replaceChildren(
    el("button", { type: "button", class: "f-btn f-btn--quiet", onClick: addEntry }, "+ New"),
    el("button", { type: "button", class: "f-btn f-btn--quiet", onClick: duplicateEntry, disabled: doc.data.length === 0 }, "Duplicate"),
    el("button", { type: "button", class: "f-btn f-btn--danger", onClick: deleteEntry, disabled: doc.data.length === 0 }, "Delete")
  );
}

function eyeIcon(off) {
  const group = el("svg", { width: 15, height: 15, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" },
    el("path", { d: "M1 8s2.6-4.2 7-4.2S15 8 15 8s-2.6 4.2-7 4.2S1 8 1 8Z", stroke: "currentColor", "stroke-width": 1.3 }),
    el("circle", { cx: 8, cy: 8, r: 1.9, stroke: "currentColor", "stroke-width": 1.3 }));
  if (off) group.append(el("path", { d: "M2.5 13.5 13.5 2.5", stroke: "currentColor", "stroke-width": 1.5, "stroke-linecap": "round" }));
  return group;
}

/**
 * Reordering rewrites the `order` field when the schema has one, so the list
 * you see here is the order the site renders.
 */
function reorder(from, to) {
  const schema = schemaFor(state.activeKey);
  const doc = activeDoc();
  if (to < 0 || to >= doc.data.length) return;

  const [entry] = doc.data.splice(from, 1);
  doc.data.splice(to, 0, entry);

  if (schema.orderField) {
    doc.data.forEach((item, index) => { item[schema.orderField] = index + 1; });
  }

  state.selection[state.activeKey] = to;
  markDirty();
  paintList();
  paintDetail();
}

function addEntry() {
  const schema = schemaFor(state.activeKey);
  const doc = activeDoc();
  const entry = schema.blank();
  if (schema.orderField) entry[schema.orderField] = doc.data.length + 1;
  doc.data.push(entry);
  state.selection[state.activeKey] = doc.data.length - 1;
  // A new entry starts where its name and ID are.
  if (schema.tabs) state.tab[state.activeKey] = schema.tabs[0].id;
  markDirty();
  paintList();
  paintDetail();
}

function duplicateEntry() {
  const schema = schemaFor(state.activeKey);
  const doc = activeDoc();
  const index = state.selection[state.activeKey] ?? 0;
  const copy = clone(doc.data[index]);

  if (schema.idField) copy[schema.idField] = uniqueId(doc.data, schema.idField, `${copy[schema.idField]}-copy`);
  if (schema.orderField) copy[schema.orderField] = doc.data.length + 1;

  doc.data.splice(index + 1, 0, copy);
  state.selection[state.activeKey] = index + 1;
  markDirty();
  paintList();
  paintDetail();
}

function uniqueId(list, field, candidate) {
  const taken = new Set(list.map((entry) => entry[field]));
  if (!taken.has(candidate)) return candidate;
  for (let suffix = 2; ; suffix += 1) {
    const next = `${candidate}-${suffix}`;
    if (!taken.has(next)) return next;
  }
}

async function deleteEntry() {
  const schema = schemaFor(state.activeKey);
  const doc = activeDoc();
  const index = state.selection[state.activeKey] ?? 0;
  const entry = doc.data[index];
  if (!entry) return;

  const label = schema.title(entry);
  const hint = schema.visibilityField
    ? "To keep the write-up and only take it off the site, switch it off with the eye icon instead."
    : "";
  const ok = await confirmDialog({
    title: `Delete "${label}"?`,
    body: `It leaves ${doc.file} when you save.${hint ? "\n" + hint : ""}`,
    action: "Delete",
    danger: true
  });
  if (!ok) return;

  doc.data.splice(index, 1);
  state.selection[state.activeKey] = Math.max(0, index - 1);
  markDirty();
  paintList();
  paintDetail();
}

/* ------------------------------------------------------------- detail ---- */

function paintDetail() {
  const key = state.activeKey;
  const schema = schemaFor(key);
  const doc = activeDoc();
  const scrollTop = dom.detail.scrollTop;

  const ctx = {
    refs: buildRefs(),
    onEdit: markDirty,
    onStructureChange: () => { markDirty(); paintList(); paintDetail(); },
    pickImage
  };

  dom.detail.classList.remove("has-tabs");

  if (schema.shape === "object") {
    const form = el("div", { class: "f-form f-form--page" }, renderFields(schema.fields, doc.data, ctx));
    dom.detail.replaceChildren(
      el("div", { class: "detail-head" },
        el("div", {},
          el("h2", {}, schema.label),
          schema.description ? el("p", { class: "detail-desc" }, schema.description) : null)),
      withIndex(form)
    );
  } else {
    const index = state.selection[key] ?? 0;
    const entry = doc.data[index];
    if (!entry) {
      dom.detail.replaceChildren(el("p", { class: "f-empty f-empty--pane" },
        `Nothing here yet. “+ New” adds the first ${schema.label.toLowerCase()} entry; it shows on the site once it has a name and is switched on.`));
      return;
    }
    const tab = activeTab(key);
    const form = el("div", { class: "f-form" }, tab ? tabFields(schema, tab, entry, ctx) : renderFields(schema.fields, entry, ctx));
    const body = withIndex(form);
    if (tab) {
      body.setAttribute("role", "tabpanel");
      body.id = "tab-panel";
      body.setAttribute("aria-labelledby", `tab-${tab.id}`);
      dom.detail.classList.add("has-tabs");
    }
    dom.detail.replaceChildren(...[
      el("div", { class: `detail-head${tab ? " detail-head--tabbed" : ""}` },
        el("h2", {}, schema.title(entry)),
        schema.visibilityField
          ? (isHidden(schema, entry) ? el("span", { class: "tag tag--off" }, "Draft · not on the site") : el("span", { class: "tag" }, "On the site"))
          : null),
      tab ? tabBar(schema, entry, tab) : null,
      body
    ].filter(Boolean));
  }

  dom.detail.scrollTop = scrollTop;
}

/* --------------------------------------------------------------- tabs ---- */

/**
 * A long entry is split into tabs (schema.tabs), one part of it open at a
 * time: a project is its overview, its gallery, its bullets, and its case
 * study. The open tab is kept per file, so moving to the next project stays on
 * the same part of it — fill in every gallery without re-finding the gallery.
 */
function activeTab(key) {
  const tabs = schemaFor(key)?.tabs;
  if (!tabs) return null;
  return tabs.find((tab) => tab.id === state.tab[key]) ?? tabs[0];
}

function selectTab(id) {
  state.tab[state.activeKey] = id;
  paintDetail();
  dom.detail.scrollTo({ top: 0, behavior: "instant" });
  // The row was redrawn under the pointer or the arrow key; keep focus on it.
  dom.detail.querySelector(".detail-tab[aria-selected=\"true\"]")?.focus();
  writeHash();
}

/** The row of tabs: a tablist, arrow keys move along it, and a list's length rides beside its name. */
function tabBar(schema, entry, current) {
  const tabs = schema.tabs;
  const step = (event, index) => {
    const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectTab(tabs[(next + tabs.length) % tabs.length].id);
  };
  return el("div", { class: "detail-tabs", role: "tablist", "aria-label": "Parts of this entry" },
    ...tabs.map((tab, index) => {
      const selected = tab.id === current.id;
      const count = tab.count && Array.isArray(entry[tab.count]) ? entry[tab.count].length : 0;
      return el("button", {
        type: "button",
        role: "tab",
        id: `tab-${tab.id}`,
        class: "detail-tab",
        "aria-selected": String(selected),
        "aria-controls": "tab-panel",
        tabIndex: selected ? 0 : -1,
        onClick: () => { if (!selected) selectTab(tab.id); },
        onKeydown: (event) => step(event, index)
      },
        tab.label,
        count > 0 ? el("span", { class: "detail-tab-count" }, String(count)) : null);
    }));
}

/**
 * The open tab's fields, in the tab's order. A tab whose `unwrap` names a
 * group is that group's own page, so the group's fields are drawn straight
 * onto it (its help as the lead) rather than in a box inside the tab.
 */
function tabFields(schema, tab, entry, ctx) {
  const names = [...tab.fields];
  // A field no tab names still shows, at the end of the first tab, so a new field is never lost.
  if (tab === schema.tabs[0]) {
    const placed = new Set(schema.tabs.flatMap((each) => each.fields));
    names.push(...schema.fields.map((field) => field.name).filter((name) => !placed.has(name)));
  }
  const fragment = document.createDocumentFragment();
  for (const name of names) {
    const field = schema.fields.find((candidate) => candidate.name === name);
    if (!field) continue;
    if (name !== tab.unwrap) {
      const rendered = renderFields([field], entry, ctx);
      // A tab that is one field of the same name doesn't need to say it twice.
      if (names.length === 1 && field.label === tab.label) rendered.firstElementChild?.classList.add("f-field--tab-solo");
      fragment.append(rendered);
      continue;
    }
    if (typeof entry[name] !== "object" || entry[name] === null) entry[name] = {};
    if (field.help) fragment.append(el("p", { class: "f-help f-help--tab" }, field.help));
    fragment.append(renderFields(field.fields, entry[name], ctx));
  }
  return fragment;
}

/**
 * A long form gets a margin index (the site's section-index pattern): one link
 * per top-level field or group, so the gallery, the bullets, and the dates are
 * a click away instead of a scroll. Short forms stay as they are.
 */
function withIndex(form) {
  const sections = Array.from(form.children).map((node) => {
    if (!node.matches(".f-group, .f-field--list, .f-field--textarea, .f-field--emphasisText, .f-field--palette")) return null;
    const label = node.querySelector(".f-label, .f-legend");
    return label ? { node, text: label.textContent.replace(/\*\s*$/, "").trim() } : null;
  }).filter(Boolean);
  if (sections.length < 3) return el("div", { class: "detail-body" }, form);

  const links = sections.map(({ node, text }, i) => {
    node.id = `field-${i}-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    return el("a", { href: `#${node.id}`, onClick: (event) => { event.preventDefault(); node.scrollIntoView({ block: "start" }); } }, text);
  });
  return el("div", { class: "detail-body has-index" },
    el("nav", { class: "detail-index", "aria-label": "Sections of this entry" }, ...links),
    form);
}

function paintChrome(phase = doc_phase(activeDoc())) {
  const doc = activeDoc();
  const schema = schemaFor(state.activeKey);
  dom.docTitle.textContent = schema.label;
  dom.docPath.textContent = doc.file;
  dom.saveBtn.disabled = phase !== "dirty";
  dom.revertBtn.disabled = phase !== "dirty";
  dom.status.textContent =
    phase === "saving" ? "Saving…"
    : phase === "dirty" ? "Unsaved changes"
    : doc.savedAt ? `Saved ${timeOfDay(doc.savedAt)}`
    : "Saved";
  dom.status.className = `status${phase === "dirty" ? " is-dirty" : phase === "saving" ? " is-saving" : ""}`;
  paintSiteLink();
}

const doc_phase = (doc) => (doc?.dirty ? "dirty" : "saved");

/** "Open on the site" points at the page this file renders, and at the entry when it has an anchor. */
function paintSiteLink() {
  const group = RAIL.find((g) => g.keys.includes(state.activeKey));
  let href = state.siteUrl + (group?.path ?? "/");
  const schema = schemaFor(state.activeKey);
  const doc = activeDoc();
  if (state.activeKey === "projects" && schema?.shape === "array") {
    const entry = doc?.data?.[state.selection[state.activeKey] ?? 0];
    if (entry?.id) href += `#project-${entry.id}`;
  }
  dom.siteLink.href = href;
  writeHash();
}

/* ------------------------------------------------------------ file nav --- */

/**
 * The address bar names what is open — `#projects`, `#projects/icarus-lite`
 * for one entry, `#projects/icarus-lite/gallery` for a tab past the first —
 * so a reload lands back on it, and the site's "Edit in Studio" control can
 * open the right file by linking here. Updated with replaceState so it never
 * adds history or scrolls anything.
 */
function writeHash() {
  const key = state.activeKey;
  if (!key) return;
  const schema = schemaFor(key);
  const doc = activeDoc();
  let hash = `#${key}`;
  if (schema?.shape === "array" && schema.idField) {
    const id = doc?.data?.[state.selection[key] ?? 0]?.[schema.idField];
    if (id) hash += `/${encodeURIComponent(id)}`;
    const tab = activeTab(key);
    if (id && tab && tab !== schema.tabs[0]) hash += `/${tab.id}`;
  }
  if (window.location.hash !== hash) history.replaceState(null, "", hash);
}

/** `#projects/icarus-lite/gallery` → { key: "projects", id: "icarus-lite", tab: "gallery" }, or null when there is nothing usable. */
function readHash() {
  const [key, id, tab] = window.location.hash.replace(/^#/, "").split("/");
  if (!key || !schemaFor(key)) return null;
  return { key, id: id ? decodeURIComponent(id) : null, tab: tab || null };
}

/** Opens what the hash names — from a fresh load, or from the site's link changing it. */
async function openFromHash() {
  const target = readHash();
  if (!target) return false;
  const doc = await loadDoc(target.key);
  const schema = schemaFor(target.key);
  if (target.id && schema.shape === "array" && schema.idField) {
    const index = doc.data.findIndex((entry) => entry?.[schema.idField] === target.id);
    if (index !== -1) state.selection[target.key] = index;
  }
  // A link without a tab (the site's) leaves the open tab as it is.
  if (target.tab && schema.tabs?.some((tab) => tab.id === target.tab)) state.tab[target.key] = target.tab;
  await selectFile(target.key);
  return true;
}

async function selectFile(key) {
  state.activeKey = key;
  await loadDoc(key);
  if (schemaFor(key).shape === "array" && state.selection[key] === undefined) state.selection[key] = 0;
  paintRail();
  paintChrome();
  paintList();
  paintDetail();
}

/* --------------------------------------------------------------- save ---- */

function normalizeDoc(key, data) {
  const schema = schemaFor(key);
  return schema.shape === "array"
    ? data.map((entry) => normalize(schema.fields, entry))
    : normalize(schema.fields, data);
}

async function save() {
  const key = state.activeKey;
  const doc = activeDoc();
  if (!doc?.dirty) return;

  paintChrome("saving");
  const payload = normalizeDoc(key, doc.data);
  const changes = countChanges(doc.original, payload);
  const schema = schemaFor(key);
  const subject = schema.shape === "array"
    ? (doc.data.length === 1 ? schema.title(doc.data[0]) : schema.label)
    : schema.label;

  try {
    const result = await api(`/api/file/${key}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: payload, revision: doc.revision })
    });
    doc.revision = result.revision;
    doc.savedAt = result.savedAt ?? Date.now();
    doc.data = payload;
    doc.original = clone(payload);
    doc.dirty = false;
    sessionStorage.removeItem(`studio-stash:${key}`);
    paintChrome();
    paintRail();
    paintList();
    paintDetail();
    // GIFs the file refers to were retimed and set to loop on the server; say which, and which could not be.
    const gifs = Array.isArray(result.gifs) ? result.gifs : [];
    const retimed = gifs.filter((gif) => gif.changed).map((gif) => `${gif.src.split("/").pop()} at ${gif.speed}×`);
    const failed = gifs.filter((gif) => gif.error).map((gif) => `${gif.src.split("/").pop()} (${gif.error})`);
    const note = [
      retimed.length > 0 ? ` Retimed ${retimed.join(", ")}.` : "",
      failed.length > 0 ? ` Could not retime ${failed.join(", ")}.` : ""
    ].join("");
    toast(`Saved ${subject}: ${changes} ${changes === 1 ? "field" : "fields"} changed.${note}`, failed.length > 0 ? "error" : "ok");
  } catch (error) {
    paintChrome();
    if (/changed on disk/i.test(error.message)) {
      // The file moved underneath us. Keep this copy across the reload so nothing is lost.
      try { sessionStorage.setItem(`studio-stash:${key}`, JSON.stringify(doc.data)); } catch {}
      toast(`${doc.file} changed on disk since it was loaded. Your unsaved copy is kept: reload to see the newer file, then check it before saving.`, "error");
      return;
    }
    toast(error.message, "error");
  }
}

async function revert() {
  const doc = activeDoc();
  if (!doc?.dirty) return;
  const ok = await confirmDialog({ title: "Discard every change since the last save?", body: `${doc.file} goes back to what is on disk.`, action: "Discard", danger: true });
  if (!ok) return;
  doc.data = clone(doc.original);
  doc.dirty = false;
  paintChrome();
  paintRail();
  paintList();
  paintDetail();
  toast("Reverted to the last saved version");
}

/* --------------------------------------------------------------- theme --- */

const THEME_KEY = "theme";

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function paintTheme() {
  const dark = currentTheme() === "dark";
  dom.themeToggle.setAttribute("aria-checked", String(dark));
  dom.themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  dom.themeToggle.title = dark ? "Switch to light mode" : "Switch to dark mode";
  dom.themeToggle.replaceChildren(el("span", { class: "theme-toggle-thumb", "aria-hidden": "true" }, themeIcon(dark)));
}

function toggleTheme() {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // Storage can be unavailable — the theme still holds for this page load.
  }
  paintTheme();
}

/** Lucide's sun and moon, the same pair the site's toggle uses. */
function themeIcon(dark) {
  const svg = el("svg", {
    width: 11, height: 11, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round",
    "aria-hidden": "true"
  });
  if (dark) {
    svg.append(el("path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" }));
  } else {
    svg.append(
      el("circle", { cx: 12, cy: 12, r: 4 }),
      el("path", { d: "M12 2v2M12 20v2m-7.07-15.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" }));
  }
  return svg;
}

/* -------------------------------------------------------------- files ---- */

let movedWhileOpen = false;

/**
 * A file or folder moved or renamed in the picker. The server has already
 * rewritten the data files on disk; this does the same to every copy open
 * here (the saved baseline too, so a move never reads as an unsaved change),
 * and takes each rewritten file's new revision when this copy was current
 * with the old one, so the next save isn't refused as a conflict.
 */
function followMove({ from, to, rewrote }) {
  const carry = (text) => (text === from || text.startsWith(`${from}/`) ? to + text.slice(from.length) : text);
  // In place, so every object the open form holds stays the same object.
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === "string") node[key] = carry(value);
      else walk(value);
    }
  };
  for (const [key, doc] of Object.entries(state.docs)) {
    walk(doc.data);
    walk(doc.original);
    const written = rewrote.find((entry) => entry.key === key);
    if (written && doc.revision === written.before) doc.revision = written.after;
  }
  movedWhileOpen = true;
}

const files = createFilePicker({ api, dialog: dom.modal, toast, confirmDialog, onMoved: followMove });

/**
 * An image field's Browse… If anything moved while the picker was open, the
 * form behind it is redrawn once it closes, after the field has taken what
 * was chosen, so every path on screen is the new one.
 */
async function pickImage(current, options) {
  const picked = await files.open(current, options);
  if (movedWhileOpen) {
    movedWhileOpen = false;
    setTimeout(paintDetail);
  }
  return picked;
}

/** The Files button in the corner: the same window, to look after the images rather than choose one. */
async function manageFiles() {
  await files.open(null, { manage: true });
  if (movedWhileOpen) {
    movedWhileOpen = false;
    paintDetail();
  }
}

/* --------------------------------------------------------------- boot ---- */

async function boot() {
  dom.saveBtn.addEventListener("click", save);
  dom.revertBtn.addEventListener("click", revert);
  dom.themeToggle.addEventListener("click", toggleTheme);
  dom.filesBtn.addEventListener("click", manageFiles);
  paintTheme();

  window.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      save();
    }
  });

  window.addEventListener("beforeunload", (event) => {
    if (Object.values(state.docs).some((doc) => doc.dirty)) event.preventDefault();
  });

  const devices = createDevicesPanel({ api, dialog: dom.devicesDialog, button: dom.devicesBtn, toast, confirmDialog });

  try {
    const [{ files: served, siteUrl }] = await Promise.all([api("/api/files"), files.refresh()]);
    state.files = served;
    if (siteUrl) state.siteUrl = siteUrl;
    // Projects and proofs load up front so the cross-link dropdowns are filled
    // in no matter which file you open first.
    await Promise.all([loadDoc("projects"), loadDoc("proofs")]);
    // Open what the address bar names, else page one, the same place a visitor starts.
    if (!(await openFromHash())) await selectFile(RAIL[0].keys[0]);
    // The site's "Edit in Studio" control reuses this window and only changes the hash.
    window.addEventListener("hashchange", () => { openFromHash(); });
    devices.start();
  } catch (error) {
    dom.detail.replaceChildren(el("p", { class: "f-empty f-empty--pane" }, `Could not reach the Studio server: ${error.message}`));
  }
}

boot();
