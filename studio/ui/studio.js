/**
 * Studio — the editor shell.
 *
 * Loads each data file once, keeps a working copy in memory, and writes it back
 * through the local API. Nothing is saved until you press Save, and a save is
 * refused if the file changed on disk underneath you.
 */

import { SCHEMAS } from "./schema.js";
import { el, renderFields, normalize } from "./fields.js";

const SITE_URL = "http://localhost:3000";

const state = {
  files: [],
  activeKey: null,
  /** key -> { label, shape, data, revision, dirty } */
  docs: {},
  /** key -> index of the entry being edited, for array files */
  selection: {},
  images: [],
  imageFolders: []
};

const dom = {
  rail: document.querySelector("#file-rail"),
  listPane: document.querySelector("#list-pane"),
  listBody: document.querySelector("#list-body"),
  listTitle: document.querySelector("#list-title"),
  listActions: document.querySelector("#list-actions"),
  detail: document.querySelector("#detail"),
  docTitle: document.querySelector("#doc-title"),
  docPath: document.querySelector("#doc-path"),
  saveBtn: document.querySelector("#save"),
  revertBtn: document.querySelector("#revert"),
  status: document.querySelector("#status"),
  toast: document.querySelector("#toast"),
  modal: document.querySelector("#modal")
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
    dirty: false
  };
  return state.docs[key];
}

/* -------------------------------------------------------------- rail ----- */

function paintRail() {
  dom.rail.replaceChildren(
    ...state.files.map((file) => {
      const doc = state.docs[file.key];
      return el("button", {
        type: "button",
        class: `rail-item${file.key === state.activeKey ? " is-active" : ""}`,
        onClick: () => selectFile(file.key)
      },
        el("span", { class: "rail-name" }, file.label),
        doc?.dirty ? el("span", { class: "rail-dot", title: "Unsaved changes" }) : null);
    })
  );
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

  dom.listBody.replaceChildren(
    ...doc.data.map((entry, index) => {
      const hidden = isHidden(schema, entry);
      const row = el("div", { class: `list-item${index === selected ? " is-active" : ""}${hidden ? " is-hidden" : ""}` },
        el("button", {
          type: "button",
          class: "list-open",
          onClick: () => { state.selection[key] = index; paintList(); paintDetail(); }
        },
          el("span", { class: "list-name" }, schema.title(entry)),
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
            : null,
          el("button", {
            type: "button",
            class: "f-icon-btn",
            title: "Move up",
            disabled: index === 0,
            onClick: () => reorder(index, index - 1)
          }, arrow("up")),
          el("button", {
            type: "button",
            class: "f-icon-btn",
            title: "Move down",
            disabled: index === doc.data.length - 1,
            onClick: () => reorder(index, index + 1)
          }, arrow("down"))));
      return row;
    })
  );

  dom.listActions.replaceChildren(
    el("button", { type: "button", class: "f-btn f-btn--quiet", onClick: addEntry }, "+ New"),
    el("button", { type: "button", class: "f-btn f-btn--quiet", onClick: duplicateEntry, disabled: doc.data.length === 0 }, "Duplicate"),
    el("button", { type: "button", class: "f-btn f-btn--danger", onClick: deleteEntry, disabled: doc.data.length === 0 }, "Delete")
  );
}

function arrow(direction) {
  const d = direction === "up" ? "M8 13V3m0 0L4 7m4-4 4 4" : "M8 3v10m0 0 4-4m-4 4-4-4";
  return el("svg", { width: 13, height: 13, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" },
    el("path", { d, stroke: "currentColor", "stroke-width": 1.6, "stroke-linecap": "round", "stroke-linejoin": "round" }));
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

function deleteEntry() {
  const schema = schemaFor(state.activeKey);
  const doc = activeDoc();
  const index = state.selection[state.activeKey] ?? 0;
  const entry = doc.data[index];
  if (!entry) return;

  const label = schema.title(entry);
  const hint = schema.visibilityField
    ? "\n\nTo keep the history instead, switch it off with the eye icon."
    : "";
  if (!window.confirm(`Delete "${label}"? This removes it from the JSON when you save.${hint}`)) return;

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
    pickImage: openImagePicker
  };

  if (schema.shape === "object") {
    dom.detail.replaceChildren(renderFields(schema.fields, doc.data, ctx));
  } else {
    const index = state.selection[key] ?? 0;
    const entry = doc.data[index];
    if (!entry) {
      dom.detail.replaceChildren(el("p", { class: "f-empty f-empty--pane" }, "Nothing here yet. Use “+ New” to start one."));
      return;
    }
    dom.detail.replaceChildren(
      el("div", { class: "detail-head" },
        el("h2", {}, schema.title(entry)),
        isHidden(schema, entry) ? el("span", { class: "tag tag--off" }, "Hidden from the site") : el("span", { class: "tag" }, "Live")),
      renderFields(schema.fields, entry, ctx)
    );
  }

  dom.detail.scrollTop = scrollTop;
}

function paintChrome() {
  const doc = activeDoc();
  const schema = schemaFor(state.activeKey);
  dom.docTitle.textContent = schema.label;
  dom.docPath.textContent = doc.file;
  dom.saveBtn.disabled = !doc.dirty;
  dom.revertBtn.disabled = !doc.dirty;
  dom.status.textContent = doc.dirty ? "Unsaved changes" : "Saved";
  dom.status.className = doc.dirty ? "status is-dirty" : "status";
}

/* ------------------------------------------------------------ file nav --- */

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

  dom.saveBtn.disabled = true;
  const payload = normalizeDoc(key, doc.data);

  try {
    const result = await api(`/api/file/${key}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: payload, revision: doc.revision })
    });
    doc.revision = result.revision;
    doc.data = payload;
    doc.original = clone(payload);
    doc.dirty = false;
    paintChrome();
    paintRail();
    paintList();
    paintDetail();
    toast(`Saved ${doc.file}`);
  } catch (error) {
    dom.saveBtn.disabled = false;
    toast(error.message, "error");
  }
}

function revert() {
  const doc = activeDoc();
  if (!doc?.dirty) return;
  if (!window.confirm("Discard every change since the last save?")) return;
  doc.data = clone(doc.original);
  doc.dirty = false;
  paintChrome();
  paintRail();
  paintList();
  paintDetail();
  toast("Reverted to the last saved version");
}

/* -------------------------------------------------------- image picker --- */

async function refreshImages() {
  const payload = await api("/api/images");
  state.images = payload.images;
  state.imageFolders = payload.folders;
}

/** Resolves to a `/folder/name.png` path, or null if dismissed. */
function openImagePicker(current) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      dom.modal.close();
      dom.modal.replaceChildren();
      resolve(value);
    };

    const grid = el("div", { class: "picker-grid" });

    function paintGrid() {
      grid.replaceChildren(
        ...state.images.map((image) => el("button", {
          type: "button",
          class: `picker-item${image.src === current ? " is-active" : ""}`,
          onClick: () => finish(image.src)
        },
          el("img", { src: image.src, alt: "", loading: "lazy" }),
          el("span", { class: "picker-name" }, image.name),
          el("span", { class: "picker-meta" }, `${image.folder} · ${Math.round(image.bytes / 1024)} KB`)))
      );
      if (state.images.length === 0) {
        grid.replaceChildren(el("p", { class: "f-empty" }, "No images yet — upload one below."));
      }
    }
    paintGrid();

    const folder = el("select", { class: "f-input f-select f-input--short" },
      ...state.imageFolders.map((name) => el("option", { value: name }, name)));

    const file = el("input", { type: "file", accept: "image/*", class: "f-file" });
    file.addEventListener("change", async () => {
      const chosen = file.files?.[0];
      if (!chosen) return;
      try {
        const uploaded = await api(`/api/images/${folder.value}?name=${encodeURIComponent(chosen.name)}`, {
          method: "POST",
          headers: { "content-type": chosen.type || "application/octet-stream" },
          body: chosen
        });
        await refreshImages();
        paintGrid();
        toast(`Uploaded ${uploaded.src}`);
        finish(uploaded.src);
      } catch (error) {
        toast(error.message, "error");
      }
    });

    dom.modal.replaceChildren(
      el("div", { class: "picker" },
        el("div", { class: "picker-head" },
          el("h2", {}, "Choose an image"),
          el("button", { type: "button", class: "f-btn f-btn--quiet", onClick: () => finish(null) }, "Close")),
        grid,
        el("div", { class: "picker-foot" },
          el("span", { class: "f-label f-label--inline" }, "Upload into"),
          folder,
          file))
    );

    dom.modal.addEventListener("close", () => finish(null), { once: true });
    dom.modal.showModal();
  });
}

/* --------------------------------------------------------------- boot ---- */

async function boot() {
  dom.saveBtn.addEventListener("click", save);
  dom.revertBtn.addEventListener("click", revert);

  window.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      save();
    }
  });

  window.addEventListener("beforeunload", (event) => {
    if (Object.values(state.docs).some((doc) => doc.dirty)) event.preventDefault();
  });

  document.querySelector("#site-link").href = SITE_URL;

  try {
    const [{ files }] = await Promise.all([api("/api/files"), refreshImages()]);
    state.files = files;
    // Projects and proofs load up front so the cross-link dropdowns are filled
    // in no matter which file you open first.
    await Promise.all([loadDoc("projects"), loadDoc("proofs")]);
    await selectFile("projects");
  } catch (error) {
    dom.detail.replaceChildren(el("p", { class: "f-empty f-empty--pane" }, `Could not reach the Studio server: ${error.message}`));
  }
}

boot();
