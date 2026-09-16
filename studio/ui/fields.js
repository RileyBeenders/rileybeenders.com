/**
 * Turns a schema into a form, and a form's working copy back into the JSON
 * that gets written to disk.
 *
 * Typing edits the working object in place so the caret never jumps. Anything
 * that changes the shape of the data — adding a bullet, reordering a gallery —
 * calls back into the app to re-render that pane.
 */

const SVG_NS = "http://www.w3.org/2000/svg";
const SVG_TAGS = new Set(["svg", "path", "circle", "rect", "line", "g", "polyline", "polygon", "ellipse"]);

export function el(tag, props = {}, ...children) {
  // SVG has to be created in its own namespace — an <svg> from createElement is
  // an unknown HTML element and renders at zero size. Its presentation
  // attributes are read-only as properties too, so they always go through
  // setAttribute.
  const isSvg = SVG_TAGS.has(tag);
  const node = isSvg ? document.createElementNS(SVG_NS, tag) : document.createElement(tag);

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (isSvg) node.setAttribute(key, value === true ? "" : value);
    else if (key === "class") node.className = value;
    else if (key === "html") node.innerHTML = value;
    else if (key in node && key !== "list") node[key] = value;
    else node.setAttribute(key, value === true ? "" : value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function icon(name) {
  const paths = {
    up: "M8 13V3m0 0L4 7m4-4 4 4",
    down: "M8 3v10m0 0 4-4m-4 4-4-4",
    remove: "M4 4l8 8M12 4l-8 8",
    add: "M8 3v10M3 8h10",
    check: "M3 8.5 6.5 12 13 4"
  };
  return el("svg", { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" },
    el("path", { d: paths[name], stroke: "currentColor", "stroke-width": 1.6, "stroke-linecap": "round", "stroke-linejoin": "round" }));
}

/** `span` in a schema lets a short field share its row: "half" or "third". */
function fieldClass(field, type = field.type) {
  return `f-field f-field--${type}${field.span ? ` f-field--${field.span}` : ""}`;
}

function fieldShell(field, control, extra) {
  return el("div", { class: fieldClass(field) },
    el("label", { class: "f-label", for: control.id || undefined },
      field.label,
      field.required ? el("span", { class: "f-required", title: "Required" }, "*") : null),
    control,
    extra,
    field.help ? el("p", { class: "f-help" }, field.help) : null);
}

let uid = 0;
const nextId = () => `f${(uid += 1)}`;

/** Small round button used for add / remove / reorder. */
function iconButton(name, title, onClick, disabled) {
  return el("button", {
    type: "button",
    class: "f-icon-btn",
    title,
    "aria-label": title,
    disabled: disabled || false,
    onClick
  }, icon(name));
}

function moveItem(list, from, to) {
  if (to < 0 || to >= list.length) return;
  const [entry] = list.splice(from, 1);
  list.splice(to, 0, entry);
}

/* ------------------------------------------------------------- controls --- */

function textControl(field, value, ctx) {
  const id = nextId();
  const control = field.type === "textarea"
    ? el("textarea", {
        id,
        class: `f-input f-textarea${field.prose ? " f-textarea--prose" : ""}`,
        rows: field.rows || 3,
        value: value[field.name] ?? "",
        placeholder: field.placeholder || ""
      })
    : el("input", {
        id,
        type: "text",
        class: field.type === "slug" ? "f-input f-input--mono" : "f-input",
        value: value[field.name] ?? "",
        placeholder: field.placeholder || "",
        spellcheck: field.type !== "slug"
      });

  // Long-form prose gets a running word count, since the resume has a budget.
  const count = field.prose ? el("p", { class: "f-count" }) : null;
  const paintCount = () => {
    if (!count) return;
    const text = control.value.trim();
    const words = text === "" ? 0 : text.split(/\s+/).length;
    count.textContent = `${words} words · ${control.value.length} characters`;
  };
  paintCount();

  control.addEventListener("input", () => {
    value[field.name] = field.type === "slug"
      ? control.value.replace(/\s+/g, "-")
      : control.value;
    paintCount();
    ctx.onEdit();
  });

  return fieldShell(field, control, count);
}

/**
 * A plain-text bullet editor with selection-based accent phrases. Phrases are
 * stored separately from the copy, keeping the JSON safe and easy to edit.
 */
function emphasisTextControl(field, value, ctx) {
  const id = nextId();
  const emphasisName = field.emphasisName || "emphasis";
  const control = el("textarea", {
    id,
    class: "f-input f-textarea f-emphasis-textarea",
    rows: field.rows || 3,
    value: value[field.name] ?? "",
    placeholder: field.placeholder || ""
  });
  const addButton = el("button", {
    type: "button",
    class: "f-btn f-btn--quiet f-emphasis-add",
    disabled: true
  }, icon("add"), " Accent selection");
  const phraseList = el("div", { class: "f-emphasis-phrases", "aria-live": "polite" });
  const selectionHint = el("span", { class: "f-emphasis-hint" }, "Select text above to add a phrase");

  const phrases = () => Array.isArray(value[emphasisName]) ? value[emphasisName] : [];
  const selectedText = () => control.value.slice(control.selectionStart, control.selectionEnd).trim();

  function paintSelection() {
    const selection = selectedText();
    const canAdd = selection !== "" && !phrases().includes(selection);
    addButton.disabled = !canAdd;
    selectionHint.textContent = selection === ""
      ? "Select text above to add a phrase"
      : canAdd
        ? `Ready: “${selection}”`
        : "That phrase is already emphasized";
  }

  function paintPhrases() {
    const current = phrases();
    phraseList.replaceChildren(
      ...(current.length === 0
        ? [el("span", { class: "f-emphasis-empty" }, "No accent phrases yet")]
        : current.map((phrase) => {
            const found = control.value.includes(phrase);
            const remove = el("button", {
              type: "button",
              class: "f-emphasis-remove",
              title: `Remove accent from “${phrase}”`,
              "aria-label": `Remove accent from ${phrase}`,
              onClick: () => {
                const next = phrases().filter((entry) => entry !== phrase);
                if (next.length > 0) value[emphasisName] = next;
                else delete value[emphasisName];
                paintPhrases();
                paintSelection();
                ctx.onEdit();
              }
            }, phrase, el("span", { "aria-hidden": "true" }, "×"));
            return el("span", {
              class: `f-emphasis-chip${found ? "" : " is-missing"}`,
              title: found ? "Accented on bullet hover" : "This phrase no longer appears in the bullet"
            }, remove);
          }))
    );
  }

  control.addEventListener("input", () => {
    value[field.name] = control.value;
    paintPhrases();
    paintSelection();
    ctx.onEdit();
  });
  for (const eventName of ["select", "keyup", "mouseup"]) {
    control.addEventListener(eventName, paintSelection);
  }
  addButton.addEventListener("mousedown", (event) => event.preventDefault());
  addButton.addEventListener("click", () => {
    const selection = selectedText();
    if (selection === "" || phrases().includes(selection)) return;
    value[emphasisName] = [...phrases(), selection];
    paintPhrases();
    paintSelection();
    ctx.onEdit();
  });

  paintPhrases();
  paintSelection();

  return el("div", { class: fieldClass(field) },
    el("label", { class: "f-label", for: id },
      field.label,
      field.required ? el("span", { class: "f-required", title: "Required" }, "*") : null),
    el("div", { class: "f-emphasis-editor" },
      control,
      el("div", { class: "f-emphasis-tools" }, addButton, selectionHint),
      phraseList),
    field.help ? el("p", { class: "f-help" }, field.help) : null);
}

function numberControl(field, value, ctx) {
  const id = nextId();
  const control = el("input", {
    id,
    type: "number",
    class: "f-input f-input--short",
    value: value[field.name] ?? ""
  });
  control.addEventListener("input", () => {
    if (control.value === "") delete value[field.name];
    else value[field.name] = Number(control.value);
    ctx.onEdit();
  });
  return fieldShell(field, control);
}

function booleanControl(field, value, ctx) {
  const fallback = field.default ?? false;
  const current = typeof value[field.name] === "boolean" ? value[field.name] : fallback;

  const toggle = el("button", {
    type: "button",
    class: "f-switch",
    role: "switch",
    "aria-checked": String(current)
  }, el("span", { class: "f-switch-thumb" }));

  toggle.addEventListener("click", () => {
    const next = toggle.getAttribute("aria-checked") !== "true";
    toggle.setAttribute("aria-checked", String(next));
    value[field.name] = next;
    ctx.onEdit();
  });

  return el("div", { class: fieldClass(field, "boolean") },
    el("div", { class: "f-switch-row" },
      toggle,
      el("span", { class: "f-label f-label--inline" }, field.label)),
    field.help ? el("p", { class: "f-help" }, field.help) : null);
}

function selectControl(field, value, ctx, options) {
  const id = nextId();
  const current = value[field.name] ?? "";
  const known = options.some((option) => option.value === current);

  const control = el("select", { id, class: "f-input f-select" },
    ...options.map((option) => el("option", { value: option.value, selected: option.value === current }, option.label)),
    // Keep a value that no longer resolves rather than silently dropping it.
    known ? null : el("option", { value: current, selected: true }, `${current} (missing)`));

  control.addEventListener("change", () => {
    if (control.value === "") delete value[field.name];
    else value[field.name] = control.value;
    ctx.onEdit();
  });

  return fieldShell(field, control);
}

function refControl(field, value, ctx) {
  const options = [{ value: "", label: "— none —" }].concat(
    (ctx.refs[field.source] || []).map((entry) => ({ value: entry.id, label: entry.label }))
  );
  return selectControl(field, value, ctx, options);
}

function imageControl(field, value, ctx) {
  const id = nextId();
  const input = el("input", {
    id,
    type: "text",
    class: "f-input f-input--mono",
    value: value[field.name] ?? "",
    placeholder: "/project-images/example.png"
  });

  const preview = el("div", { class: "f-thumb" });
  function paint() {
    preview.replaceChildren(
      input.value
        ? el("img", { src: input.value, alt: "", loading: "lazy" })
        : el("span", { class: "f-thumb-empty" }, "no image")
    );
  }
  paint();

  input.addEventListener("input", () => {
    value[field.name] = input.value;
    paint();
    ctx.onEdit();
  });

  const browse = el("button", { type: "button", class: "f-btn f-btn--quiet" }, "Browse…");
  browse.addEventListener("click", async () => {
    const picked = await ctx.pickImage(input.value);
    if (!picked) return;
    input.value = picked;
    value[field.name] = picked;
    paint();
    ctx.onEdit();
  });

  return fieldShell(field, el("div", { class: "f-image-row" }, preview, el("div", { class: "f-image-controls" }, input, browse)));
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function colorControl(field, value, ctx) {
  const id = nextId();
  const current = HEX_RE.test(value[field.name]) ? value[field.name] : "#000000";

  const swatch = el("input", { id, type: "color", class: "f-color-swatch", value: current });
  const text = el("input", {
    type: "text",
    class: "f-input f-input--mono f-color-hex",
    value: value[field.name] ?? "",
    maxlength: 7,
    spellcheck: false
  });

  swatch.addEventListener("input", () => {
    text.value = swatch.value;
    value[field.name] = swatch.value;
    ctx.onEdit();
  });
  text.addEventListener("input", () => {
    value[field.name] = text.value;
    if (HEX_RE.test(text.value)) swatch.value = text.value;
    ctx.onEdit();
  });

  return fieldShell(field, el("div", { class: "f-color-row" }, swatch, text));
}

/**
 * A grid of selectable palette cards (nine presets plus Customization), each
 * previewed with four swatch chips. Customization previews itself from the
 * sibling `custom.light` colors on the same object, so its chip stays live as
 * those fields change.
 */
function paletteControl(field, value, ctx) {
  const current = value[field.name] ?? "";

  function swatchFor(preset) {
    if (preset.id !== "custom") return preset.swatch;
    const seeds = value.custom?.light;
    return seeds ? { paper: seeds.paper, ink: seeds.ink, accent: seeds.accent, blue: seeds.blue } : null;
  }

  function card(preset) {
    const selected = current === preset.id;
    const swatch = swatchFor(preset);

    return el("button", {
      type: "button",
      class: `f-palette-card${selected ? " is-selected" : ""}`,
      onClick: () => {
        value[field.name] = preset.id;
        ctx.onEdit();
        ctx.onStructureChange(); // repaints so the selection ring and the live Customization chip both update
      }
    },
      selected ? el("span", { class: "f-palette-check" }, icon("check")) : null,
      el("div", { class: "f-palette-swatches" },
        swatch
          ? ["paper", "ink", "accent", "blue"].map((key) => el("span", { class: "f-swatch", style: `background:${swatch[key]}` }))
          : el("span", { class: "f-palette-noswatch" })),
      el("span", { class: "f-palette-name" }, preset.name),
      el("span", { class: "f-palette-desc" }, preset.description));
  }

  return el("div", { class: fieldClass(field, "palette") },
    field.label ? el("span", { class: "f-label" }, field.label) : null,
    el("div", { class: "f-palette-grid" }, ...field.options.map(card)),
    field.help ? el("p", { class: "f-help" }, field.help) : null);
}

function stringListControl(field, value, ctx) {
  const list = Array.isArray(value[field.name]) ? value[field.name] : (value[field.name] = []);

  const rows = list.map((entry, index) => {
    // `multiline` lists hold paragraphs, so each row is a textarea that grows
    // with what's in it rather than a one-line input.
    const input = field.multiline
      ? el("textarea", { class: "f-input f-textarea", rows: field.rows || 3, value: entry ?? "" })
      : el("input", { type: "text", class: "f-input", value: entry ?? "" });
    input.addEventListener("input", () => {
      list[index] = input.value;
      ctx.onEdit();
    });
    return el("div", { class: `f-row${field.multiline ? " f-row--multiline" : ""}` },
      input,
      el("div", { class: "f-row-tools" },
        iconButton("up", "Move up", () => { moveItem(list, index, index - 1); ctx.onStructureChange(); }, index === 0),
        iconButton("down", "Move down", () => { moveItem(list, index, index + 1); ctx.onStructureChange(); }, index === list.length - 1),
        iconButton("remove", "Remove", () => { list.splice(index, 1); ctx.onStructureChange(); })));
  });

  const add = el("button", { type: "button", class: "f-btn f-btn--quiet" }, icon("add"), ` Add ${field.label.replace(/s$/, "").toLowerCase()}`);
  add.addEventListener("click", () => { list.push(""); ctx.onStructureChange(); });

  return el("div", { class: fieldClass(field, "list") },
    el("span", { class: "f-label" }, field.label),
    rows.length === 0 ? el("p", { class: "f-empty" }, "Nothing yet.") : el("div", { class: "f-rows" }, ...rows),
    add,
    field.help ? el("p", { class: "f-help" }, field.help) : null);
}

function objectListControl(field, value, ctx) {
  const list = Array.isArray(value[field.name]) ? value[field.name] : (value[field.name] = []);

  const cards = list.map((entry, index) => {
    const thumb = field.gallery && entry.src
      ? el("div", { class: "f-card-thumb" }, el("img", { src: entry.src, alt: "", loading: "lazy" }))
      : null;

    return el("div", { class: "f-card" },
      el("div", { class: "f-card-head" },
        thumb,
        el("span", { class: "f-card-title" }, `${field.itemLabel || "Item"} ${index + 1}`),
        el("div", { class: "f-row-tools" },
          iconButton("up", "Move up", () => { moveItem(list, index, index - 1); ctx.onStructureChange(); }, index === 0),
          iconButton("down", "Move down", () => { moveItem(list, index, index + 1); ctx.onStructureChange(); }, index === list.length - 1),
          iconButton("remove", "Remove", () => { list.splice(index, 1); ctx.onStructureChange(); }))),
      el("div", { class: "f-card-body" }, renderFields(field.fields, entry, ctx)));
  });

  const add = el("button", { type: "button", class: "f-btn f-btn--quiet" }, icon("add"), ` Add ${(field.itemLabel || "item").toLowerCase()}`);
  add.addEventListener("click", () => {
    list.push(blankFrom(field.fields));
    ctx.onStructureChange();
  });

  return el("div", { class: fieldClass(field, "list") },
    el("span", { class: "f-label" }, field.label),
    cards.length === 0 ? el("p", { class: "f-empty" }, "Nothing yet.") : el("div", { class: "f-cards" }, ...cards),
    add,
    field.help ? el("p", { class: "f-help" }, field.help) : null);
}

function groupControl(field, value, ctx) {
  if (typeof value[field.name] !== "object" || value[field.name] === null) value[field.name] = {};
  return el("fieldset", { class: "f-group" },
    el("legend", { class: "f-legend" }, field.label),
    field.help ? el("p", { class: "f-help f-help--legend" }, field.help) : null,
    renderFields(field.fields, value[field.name], ctx));
}

/** A fresh sub-object with the shape its schema implies. */
function blankFrom(fields) {
  const entry = {};
  for (const field of fields) {
    if (field.type === "stringList") entry[field.name] = [];
    else if (field.type === "objectList") entry[field.name] = [];
    else if (field.type === "group") entry[field.name] = blankFrom(field.fields);
    else if (field.required) entry[field.name] = "";
  }
  return entry;
}

const CONTROLS = {
  text: textControl,
  slug: textControl,
  textarea: textControl,
  emphasisText: emphasisTextControl,
  number: numberControl,
  boolean: booleanControl,
  ref: refControl,
  image: imageControl,
  color: colorControl,
  palette: paletteControl,
  stringList: stringListControl,
  objectList: objectListControl,
  group: groupControl
};

export function renderFields(fields, value, ctx) {
  const fragment = document.createDocumentFragment();
  for (const field of fields) {
    const render = field.type === "select"
      ? (f, v, c) => selectControl(f, v, c, f.options)
      : CONTROLS[field.type];
    if (!render) continue;
    fragment.append(render(field, value, ctx));
  }
  return fragment;
}

/* ----------------------------------------------------------- normalize --- */

const isBlank = (entry) => entry === undefined || entry === null || entry === "";

/**
 * Rebuilds an object in schema order and drops optional fields that are empty,
 * so an untouched entry round-trips byte-for-byte. Keys the schema doesn't know
 * about are preserved at the end rather than thrown away.
 */
export function normalize(fields, value) {
  if (typeof value !== "object" || value === null) return value;
  const out = {};

  for (const field of fields) {
    const raw = value[field.name];
    const keep = field.always || field.required;

    switch (field.type) {
      case "emphasisText": {
        const text = isBlank(raw) ? "" : String(raw).trim();
        if (text !== "" || keep) out[field.name] = text;
        const emphasisName = field.emphasisName || "emphasis";
        const phrases = (Array.isArray(value[emphasisName]) ? value[emphasisName] : [])
          .map((entry) => String(entry).trim())
          .filter((entry, index, list) => entry !== "" && list.indexOf(entry) === index);
        if (phrases.length > 0) out[emphasisName] = phrases;
        break;
      }
      case "stringList": {
        const list = (Array.isArray(raw) ? raw : []).map((entry) => String(entry).trim()).filter((entry) => entry !== "");
        if (list.length > 0 || keep) out[field.name] = list;
        break;
      }
      case "objectList": {
        const list = (Array.isArray(raw) ? raw : []).map((entry) => normalize(field.fields, entry));
        if (list.length > 0 || keep) out[field.name] = list;
        break;
      }
      case "group": {
        const nested = normalize(field.fields, raw ?? {});
        if (Object.keys(nested).length > 0 || keep) out[field.name] = nested;
        break;
      }
      case "boolean": {
        const fallback = field.default ?? false;
        const current = typeof raw === "boolean" ? raw : fallback;
        if (field.omitWhenDefault && current === fallback) break;
        out[field.name] = current;
        break;
      }
      case "number": {
        if (typeof raw === "number" && Number.isFinite(raw)) out[field.name] = raw;
        else if (keep) out[field.name] = 0;
        break;
      }
      default: {
        const text = isBlank(raw) ? "" : String(raw).trim();
        if (text !== "" || keep) out[field.name] = text;
      }
    }
  }

  const known = new Set(fields.flatMap((field) => [field.name, ...(field.emphasisName ? [field.emphasisName] : [])]));
  for (const [key, raw] of Object.entries(value)) {
    if (!known.has(key)) out[key] = raw;
  }

  return out;
}
