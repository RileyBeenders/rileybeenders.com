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

/**
 * An <img> for a slot `cssSize` px along its longest side. Anything under
 * public/ comes through /api/thumb, resized for that box at this screen's
 * pixel density (a 92px preview on a 2x display asks for 184px; the server
 * rounds up to its size ladder), so the editor never decodes a 6000px
 * photograph to draw a thumbnail. Should the copy fail, the original stands in.
 */
export function thumbImage(src, cssSize, props = {}) {
  const local = typeof src === "string" && src.startsWith("/") && !src.startsWith("//");
  const img = el("img", {
    alt: "",
    loading: "lazy",
    decoding: "async",
    ...props,
    src: local ? `/api/thumb?src=${encodeURIComponent(src)}&w=${Math.ceil(cssSize * (window.devicePixelRatio || 1))}` : src
  });
  if (local) img.addEventListener("error", () => { img.src = src; }, { once: true });
  return img;
}

function icon(name) {
  const paths = {
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

function fieldShell(field, control, extra, forId = control.id) {
  return el("div", { class: fieldClass(field) },
    el("label", { class: "f-label", for: forId || undefined },
      field.label,
      field.required ? el("span", { class: "f-required", title: "Required" }, "*") : null),
    control,
    extra,
    field.help ? el("p", { class: "f-help" }, field.help) : null);
}

let uid = 0;
const nextId = () => `f${(uid += 1)}`;

/**
 * A textarea as tall as its text: no scrollbar, growing line by line while
 * someone writes, and never shorter than its `rows`. The corner handle still
 * drags it taller for room to draft; it won't drag shorter than the text.
 * Fitted once the pane is in the document, whenever its width changes (a
 * resized window, a card opening), and on every keystroke.
 */
function autoGrow(textarea) {
  let set = 0;
  let width = 0;
  let dragged = 0;

  const scroller = () => textarea.closest(".detail") ?? document.scrollingElement;

  function fit() {
    if (!textarea.isConnected || textarea.offsetParent === null) return;
    // Measuring collapses the box for a moment, which would pull the pane's
    // scroll position up with it, so the position is put back afterwards.
    const pane = scroller();
    const top = pane?.scrollTop ?? 0;
    const style = getComputedStyle(textarea);
    const borders = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    textarea.style.height = "auto";
    const content = textarea.scrollHeight + borders;
    set = Math.ceil(Math.max(content, dragged));
    textarea.style.height = `${set}px`;
    if (pane) pane.scrollTop = top;
  }

  textarea.addEventListener("input", fit);
  textarea.addEventListener("focus", fit);
  // Letting go after a press on the box: if its height moved, the handle was
  // dragged, and that height becomes its floor.
  textarea.addEventListener("pointerdown", () => {
    window.addEventListener("pointerup", () => {
      const height = textarea.offsetHeight;
      if (Math.abs(height - set) > 1) {
        dragged = height;
        fit();
      }
    }, { once: true });
  });
  new ResizeObserver(([entry]) => {
    const box = entry.borderBoxSize?.[0];
    const nextWidth = box ? box.inlineSize : textarea.offsetWidth;
    const height = box ? box.blockSize : textarea.offsetHeight;
    if (Math.abs(nextWidth - width) > 0.5) {
      width = nextWidth;
      fit();
    } else if (Math.abs(height - set) > 1) {
      // Not a height we set: the handle was dragged. Keep that as the floor.
      dragged = height;
      fit();
    }
  }).observe(textarea);
  // Built off-document; by the next microtask the pane has been put in place.
  queueMicrotask(fit);
  return textarea;
}

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

/** The three-line handle an entry is dragged by. A button, so ↑ / ↓ can move it from the keyboard too. */
export function gripHandle(label) {
  return el("button", {
    type: "button",
    class: "f-grip",
    title: "Drag to reorder (or focus and press ↑ / ↓)",
    "aria-label": `Reorder ${label}. Drag, or press up or down arrow.`
  },
    el("svg", { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" },
      el("path", { d: "M3 4.5h10M3 8h10M3 11.5h10", stroke: "currentColor", "stroke-width": 1.6, "stroke-linecap": "round" })));
}

/** A keyboard move repaints the list, so the grip that moved is found again by list and position. */
let pendingGripFocus = null;

function scrollParent(node) {
  for (let parent = node.parentElement; parent; parent = parent.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(parent).overflowY)) return parent;
  }
  return null;
}

/** Pixels the pointer must travel before a press on a grip becomes a drag, so a click never lifts anything. */
const DRAG_THRESHOLD = 4;
/** Neighbours making room and the drop settling: short, on the site's ease-out curve. */
const SLIDE_MS = 180;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Grab-and-place reordering for the direct children of `container`, the way
 * dnd-kit's sortable works: pressing an item's `.f-grip` and moving a few
 * pixels lifts it, the item follows the pointer, and its neighbours slide
 * aside (transforms only; nothing in the DOM moves mid-drag) to show where it
 * will land. Letting go settles it into that gap, then `onMove(from, to)`
 * updates the data and repaints into the same layout, so nothing jumps.
 * Escape puts it back. With the grip focused, ↑ / ↓ move the item one place,
 * instantly. `id` names the list so focus can follow a keyboard move across
 * the repaint. A container that outlives repaints (the entry list) can be
 * passed again; it only rebinds.
 */
export function makeSortable(container, onMove, id) {
  container.dataset.sortId = id;
  const bound = Boolean(container.sortable);
  container.sortable = { onMove, id };
  focusPendingGrip(id);
  if (bound) return container;
  bindSortable(container);
  return container;
}

function focusPendingGrip(id) {
  if (pendingGripFocus?.id !== id) return;
  const { index } = pendingGripFocus;
  pendingGripFocus = null;
  // The repaint builds the new list off-document; by the next microtask it is in place.
  queueMicrotask(() => {
    const target = document.querySelector(`[data-sort-id="${CSS.escape(id)}"]`);
    target?.children[index]?.querySelector(".f-grip")?.focus();
  });
}

function bindSortable(container) {
  const items = () => [...container.children];
  /** The grip this event came from, if it belongs to this list and not to a list nested inside one of its cards. */
  const ownGrip = (event) => {
    const grip = event.target.closest?.(".f-grip");
    return grip && grip.closest("[data-sort-id]") === container ? grip : null;
  };

  container.addEventListener("keydown", (event) => {
    const grip = ownGrip(event);
    if (!grip || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
    const from = items().findIndex((node) => node.contains(grip));
    const to = from + (event.key === "ArrowUp" ? -1 : 1);
    event.preventDefault();
    if (from < 0 || to < 0 || to >= items().length) return;
    pendingGripFocus = { id: container.sortable.id, index: to };
    container.sortable.onMove(from, to);
  });

  container.addEventListener("pointerdown", (event) => {
    const grip = ownGrip(event);
    if (!grip || event.button !== 0 || container.classList.contains("is-settling")) return;
    const item = items().find((node) => node.contains(grip));
    if (!item) return;
    event.preventDefault(); // no text selection, no native drag
    grip.focus({ preventScroll: true });
    startDrag(container, item, event);
  });
}

function startDrag(container, item, downEvent) {
  const pointerId = downEvent.pointerId;
  const startX = downEvent.clientX;
  const startY = downEvent.clientY;
  let pointerY = startY;
  let active = false;
  let frame = 0;

  // Measured once, when the press turns into a drag.
  let list, from, to, rects, gap, scroller, scrollStart, minDy, maxDy;

  function lift() {
    active = true;
    list = [...container.children];
    from = list.indexOf(item);
    to = from;
    rects = list.map((node) => node.getBoundingClientRect());
    gap = parseFloat(getComputedStyle(container).rowGap) || 0;
    scroller = scrollParent(container);
    scrollStart = scroller?.scrollTop ?? 0;
    // The lifted item can travel from the first slot to the last, no further.
    minDy = rects[0].top - rects[from].top;
    maxDy = rects[list.length - 1].bottom - rects[from].bottom;

    container.classList.add("is-sorting");
    item.classList.add("is-dragging");
    document.documentElement.classList.add("is-grabbing");
    const slide = reducedMotion() ? "none" : `transform ${SLIDE_MS}ms var(--ease)`;
    for (const node of list) if (node !== item) node.style.transition = slide;
    update();
    if (scroller) frame = requestAnimationFrame(edgeScroll);
  }

  /** Near the top or bottom of the scrolling pane, keep scrolling while the pointer rests there. */
  function edgeScroll() {
    const box = scroller.getBoundingClientRect();
    const edge = 48;
    const over = pointerY < box.top + edge
      ? pointerY - (box.top + edge)
      : pointerY > box.bottom - edge ? pointerY - (box.bottom - edge) : 0;
    if (over) {
      scroller.scrollTop += Math.max(-18, Math.min(18, over / 3));
      update();
    }
    frame = requestAnimationFrame(edgeScroll);
  }

  /** Moves the item under the pointer and makes room for it where it would land. */
  function update() {
    const scrolled = scroller ? scroller.scrollTop - scrollStart : 0;
    const dy = Math.max(minDy, Math.min(maxDy, pointerY - startY + scrolled));
    item.style.transform = `translate3d(0, ${dy}px, 0)`;

    // It lands wherever its centre now sits among the others' centres (pinned
    // against either end, it has reached that end).
    const centre = rects[from].top + rects[from].height / 2 + dy;
    let next = from;
    for (let i = from + 1; i < list.length; i += 1) {
      if (centre >= rects[i].top + rects[i].height / 2) next = i;
    }
    for (let i = from - 1; i >= 0; i -= 1) {
      if (centre <= rects[i].top + rects[i].height / 2) next = i;
    }
    if (next !== to) {
      to = next;
      const room = rects[from].height + gap;
      list.forEach((node, i) => {
        if (node === item) return;
        const shift = i > from && i <= to ? -room : i < from && i >= to ? room : 0;
        node.style.transform = shift ? `translate3d(0, ${shift}px, 0)` : "";
      });
    }
  }

  function onPointerMove(event) {
    if (event.pointerId !== pointerId) return;
    pointerY = event.clientY;
    if (active) update();
    else if (Math.hypot(event.clientX - startX, event.clientY - startY) >= DRAG_THRESHOLD) lift();
  }
  const onPointerUp = (event) => { if (event.pointerId === pointerId) end(true); };
  const onPointerCancel = (event) => { if (event.pointerId === pointerId) end(false); };
  function onKeyDown(event) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    end(false);
  }

  /** Settles the item into its gap (or back home when cancelled), then commits the move. */
  function end(commit) {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerCancel);
    window.removeEventListener("keydown", onKeyDown, true);
    cancelAnimationFrame(frame);
    if (!active) return;

    if (!commit) {
      to = from;
      for (const node of list) if (node !== item) node.style.transform = "";
    }
    // The gap is the heights of the entries it passed, plus the spacing between them.
    let offset = 0;
    for (let i = from + 1; i <= to; i += 1) offset += rects[i].height + gap;
    for (let i = to; i < from; i += 1) offset -= rects[i].height + gap;
    const duration = reducedMotion() ? 0 : SLIDE_MS;
    container.classList.add("is-settling");
    item.classList.add("is-dropping");
    item.style.transition = duration ? `transform ${duration}ms var(--ease), box-shadow ${duration}ms var(--ease)` : "none";
    // Layout already moved with any scrolling, so the gap is the whole offset.
    item.style.transform = offset ? `translate3d(0, ${offset}px, 0)` : "translate3d(0, 0, 0)";

    window.setTimeout(() => {
      // Put the DOM in the order it shows and drop every transform in the same
      // frame, then let the data catch up: the repaint draws this same layout.
      for (const node of list) {
        node.style.transition = "none";
        node.style.transform = "";
      }
      if (to > from) list[to].after(item);
      else if (to < from) container.insertBefore(item, list[to]);
      item.classList.remove("is-dragging", "is-dropping");
      container.classList.remove("is-sorting", "is-settling");
      document.documentElement.classList.remove("is-grabbing");
      for (const node of list) node.style.transition = "";
      if (to !== from) container.sortable.onMove(from, to);
    }, duration);
  }

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerCancel);
  window.addEventListener("keydown", onKeyDown, true);
}

/* ------------------------------------------------------------- controls --- */

function textControl(field, value, ctx) {
  const id = nextId();
  const control = field.type === "textarea"
    ? autoGrow(el("textarea", {
        id,
        class: `f-input f-textarea${field.prose ? " f-textarea--prose" : ""}`,
        rows: field.rows || 3,
        value: value[field.name] ?? "",
        placeholder: field.placeholder || ""
      }))
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
      ? control.value.replace(/\s+/g, "-").toLowerCase()
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
  const control = autoGrow(el("textarea", {
    id,
    class: "f-input f-textarea f-emphasis-textarea",
    rows: field.rows || 3,
    value: value[field.name] ?? "",
    placeholder: field.placeholder || ""
  }));
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
    // A choice other controls draw from (the aligner reads the aspect ratio) repaints them.
    if (field.repaint) ctx.onStructureChange();
  });

  return fieldShell(field, control);
}

function refControl(field, value, ctx) {
  const options = [{ value: "", label: "— none —" }].concat(
    (ctx.refs[field.source] || []).map((entry) => ({ value: entry.id, label: entry.label }))
  );
  return selectControl(field, value, ctx, options);
}

/**
 * A few options shown side by side as one row of buttons (the same control as
 * an image's Display switch), for a choice best seen all at once. The value
 * is the option's `value`; `field.default` is what an unset key means.
 */
function choiceControl(field, value, ctx) {
  const current = value[field.name] ?? field.default ?? field.options[0].value;
  const group = el("div", { class: "f-seg", role: "radiogroup", "aria-label": field.label },
    ...field.options.map((option) => el("button", {
      type: "button",
      role: "radio",
      class: "f-seg-btn",
      "aria-checked": String(option.value === current),
      title: option.help,
      onClick: (event) => {
        value[field.name] = option.value;
        for (const button of group.children) button.setAttribute("aria-checked", String(button === event.currentTarget));
        ctx.onEdit();
      }
    }, option.label)));

  return el("div", { class: fieldClass(field, "choice") },
    el("span", { class: "f-label" }, field.label),
    group,
    field.help ? el("p", { class: "f-help" }, field.help) : null);
}

/** The one kind of image whose playback the Studio can retime. */
const isGifSrc = (src) => typeof src === "string" && /\.gif$/i.test(src);

/** A stored playback rate, or the recording's own pace when there is none. */
const speedOf = (raw) => (typeof raw === "number" && Number.isFinite(raw) && raw > 0 ? raw : 1);

const formatSpeed = (speed) => `${Number(speed.toFixed(2))}×`;
const formatSeconds = (cs) => `${(cs / 100).toFixed(1)} s`;

/**
 * The playback row under a GIF's path: a slider from quarter speed up to the
 * fastest the recording allows, what that does to the clip, and a preview the
 * server retimes on the fly (/api/thumb?speed=) before anything is saved. The
 * chosen speed is kept beside `src` under `field.speedName` and baked into
 * the file on save; every GIF loops on the site, so there is no switch for
 * that. Hidden for anything that is not a GIF.
 */
function playbackControl(field, value, ctx) {
  const speedName = field.speedName;
  const slider = el("input", {
    type: "range",
    class: "f-range",
    min: "0.25",
    max: "4",
    step: "0.25",
    value: String(speedOf(value[speedName])),
    "aria-label": "Playback speed"
  });
  const rate = el("span", { class: "f-playback-rate" });
  const summary = el("span", { class: "f-playback-summary" });
  const reset = el("button", { type: "button", class: "f-btn f-btn--quiet f-playback-reset" }, "As recorded");
  const preview = el("img", { class: "f-playback-preview", alt: "", decoding: "async" });
  const root = el("div", { class: "f-playback", hidden: true },
    el("div", { class: "f-playback-head" },
      el("span", { class: "f-label f-label--inline" }, "Playback speed"),
      rate,
      reset),
    slider,
    summary,
    preview,
    el("p", { class: "f-help" }, "Applied to the file itself when you save, so the site plays it at this pace. GIFs always loop on the site."));

  let src = null;
  let info = null;
  let timer = 0;

  const speed = () => Number(slider.value);

  function paint() {
    rate.textContent = formatSpeed(speed());
    reset.hidden = speed() === 1;
    if (!info) {
      summary.textContent = "";
      return;
    }
    const clip = `${info.frames} frames · ${info.width}×${info.height}`;
    summary.textContent = info.at.speed === 1
      ? `As recorded: ${formatSeconds(info.recorded.durationCs)} at ${Number(info.recorded.fps.toFixed(1))} fps · ${clip}`
      : `${formatSeconds(info.at.durationCs)} at ${Number(info.at.fps.toFixed(1))} fps, from ${formatSeconds(info.recorded.durationCs)} · ${clip}`;
  }

  /** Asks the server what this speed does to the clip, and shows the clip at that speed. */
  async function describe() {
    const asked = src;
    preview.src = `/api/thumb?src=${encodeURIComponent(asked)}&speed=${speed()}`;
    try {
      const response = await fetch(`/api/gif?src=${encodeURIComponent(asked)}&speed=${speed()}`);
      if (!response.ok || asked !== src) return;
      info = await response.json();
    } catch {
      return;
    }
    // The fastest frame can't go under what browsers honour, so the slider stops there.
    slider.max = String(Math.max(1, info.maxSpeed));
    if (speed() > info.maxSpeed) {
      slider.value = String(info.maxSpeed);
      store();
      describe();
      return;
    }
    paint();
  }

  function store() {
    if (speed() === 1) delete value[speedName];
    else value[speedName] = speed();
    ctx.onEdit();
  }

  const describeSoon = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(describe, 150);
  };

  slider.addEventListener("input", () => { store(); paint(); describeSoon(); });
  reset.addEventListener("click", () => { slider.value = "1"; store(); paint(); describe(); });

  /** Called whenever the path changes: shows for a GIF, hides for anything else. */
  root.refresh = (next) => {
    if (!isGifSrc(next)) {
      root.hidden = true;
      src = null;
      preview.removeAttribute("src");
      return;
    }
    root.hidden = false;
    if (next === src) return;
    src = next;
    info = null;
    paint();
    describe();
  };

  return root;
}

/**
 * Who wants to hear when an entry's image paths change: the before/after
 * aligner redraws as either path is typed or picked. One listener per entry;
 * a repaint's new aligner replaces the old one.
 */
const imageWatchers = new WeakMap();
const notifyImageChange = (value) => imageWatchers.get(value)?.();

/**
 * A gallery image's frame shape from its `aspect` ("16:9"), 4:3 when unset.
 * "original" has no fixed shape, so a comparison (which needs one frame for
 * both photos) falls back to 4:3. The aligner edits in the same shape the
 * site draws, so what lines up here lines up there.
 */
export function frameRatio(aspect) {
  const match = /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/.exec(aspect ?? "");
  return match && Number(match[2]) > 0 ? Number(match[1]) / Number(match[2]) : 4 / 3;
}
const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Where an image sits inside the frame, as percentages of the frame:
 * `x`/`y` the top-left corner, `w` the width (height follows the image's own
 * shape). With no stored frame the image covers the frame, centred, which is
 * exactly what object-fit: cover draws on the site.
 */
function coverWidth(aspect, box) {
  return Math.max(100, (100 * aspect) / box);
}
function heightOf(w, aspect, box) {
  return (w * box) / aspect;
}
function clampFrame(frame, aspect, box) {
  const w = Math.min(Math.max(frame.w, coverWidth(aspect, box)), coverWidth(aspect, box) * 4);
  const h = heightOf(w, aspect, box);
  return {
    x: Math.min(0, Math.max(100 - w, frame.x)),
    y: Math.min(0, Math.max(100 - h, frame.y)),
    w
  };
}
function defaultFrame(aspect, box) {
  const w = coverWidth(aspect, box);
  return { x: (100 - w) / 2, y: (100 - heightOf(w, aspect, box)) / 2, w };
}
function readFrame(raw, aspect, box) {
  const ok = raw && ["x", "y", "w"].every((key) => typeof raw[key] === "number" && Number.isFinite(raw[key]));
  return ok ? clampFrame(raw, aspect, box) : defaultFrame(aspect, box);
}

/**
 * How a gallery image is shown: "Default" (the one image or GIF, as ever) or
 * "Before & after", where a second image sits over the first and a bar slides
 * between them. For a comparison it adds the After path and an aligner that
 * crops and moves each photo inside the image's frame so the two line up.
 * Owns `display`, `after`, `frame` and `afterFrame` on the entry.
 */
function imageDisplayControl(field, value, ctx) {
  const compare = value[field.name] === "compare";

  const modes = [
    { id: "", label: "Default", help: "One image or GIF." },
    { id: "compare", label: "Before & after", help: "Two images with a bar that slides between them." }
  ];
  const toggle = el("div", { class: "f-seg", role: "radiogroup", "aria-label": field.label },
    ...modes.map((mode) => el("button", {
      type: "button",
      role: "radio",
      class: "f-seg-btn",
      "aria-checked": String((mode.id === "compare") === compare),
      title: mode.help,
      onClick: () => {
        if ((mode.id === "compare") === compare) return;
        if (mode.id) value[field.name] = mode.id;
        else delete value[field.name];
        ctx.onEdit();
        ctx.onStructureChange();
      }
    }, mode.label)));

  const head = el("div", { class: fieldClass(field, "display") },
    el("span", { class: "f-label" }, field.label),
    toggle,
    el("p", { class: "f-help" }, compare
      ? "The image above is the Before. Drag the bar on the site to reveal the After."
      : "Switch to Before & after to compare this image with a second one."));

  if (!compare) return head;

  const after = imageControl({ name: field.afterName, type: "image", label: "After", required: true }, value, ctx);
  return el("div", { class: "f-display" }, head, after, alignerControl(field, value, ctx));
}

/**
 * The crop-and-align stage: both photos in the frame the site draws (the
 * image's aspect ratio), the After
 * over the Before. Pick a layer, drag to move it, scroll or use the slider to
 * zoom. "Overlay" shows the After at half strength so edges can be lined up
 * by eye; "Slider" previews what the visitor gets.
 */
function alignerControl(field, value, ctx) {
  const layers = {
    before: { srcKey: "src", frameKey: field.frameName, label: "Before" },
    after: { srcKey: field.afterName, frameKey: field.afterFrameName, label: "After" }
  };
  // Changing the aspect ratio repaints the card, so this is read once per stage.
  const box = frameRatio(value.aspect);
  let active = "after";
  let view = "overlay";
  let split = 50;

  for (const layer of Object.values(layers)) {
    layer.img = el("img", { alt: "", draggable: false, decoding: "async" });
    layer.box = el("div", { class: "f-align-layer" }, layer.img);
    layer.aspect = 0;
    layer.src = null;
    layer.img.addEventListener("load", () => {
      layer.aspect = layer.img.naturalWidth / layer.img.naturalHeight || 0;
      place();
    });
  }
  layers.after.box.classList.add("f-align-layer--after");

  const divider = el("div", { class: "f-align-divider", "aria-hidden": "true" });
  const empty = el("p", { class: "f-align-empty" });
  // Tall shapes are capped at 420px high, narrowing instead, so the stage fits on screen.
  const stage = el("div", { class: "f-align-stage", style: `aspect-ratio: ${box}; width: min(100%, ${Math.round(420 * box)}px)` }, layers.before.box, layers.after.box, divider, empty);

  const zoom = el("input", { type: "range", class: "f-range", min: "1", max: "4", step: "0.01", "aria-label": "Zoom" });
  const zoomRead = el("span", { class: "f-align-read" });
  const splitInput = el("input", { type: "range", class: "f-range", min: "0", max: "100", step: "1", value: "50", "aria-label": "Preview divider" });
  const reset = el("button", { type: "button", class: "f-btn f-btn--quiet f-align-reset" }, "Reset");

  const seg = (options, current, onPick) => el("div", { class: "f-seg f-seg--small", role: "radiogroup" },
    ...options.map(([id, label]) => el("button", {
      type: "button", role: "radio", class: "f-seg-btn", "aria-checked": String(id === current()),
      onClick: (event) => {
        onPick(id);
        for (const button of event.currentTarget.parentElement.children) button.setAttribute("aria-checked", String(button === event.currentTarget));
        place();
      }
    }, label)));

  const layerPick = seg([["before", "Move Before"], ["after", "Move After"]], () => active, (id) => { active = id; });
  const viewPick = seg([["overlay", "Overlay"], ["slider", "Slider"]], () => view, (id) => { view = id; });

  const frameOf = (layer) => readFrame(value[layer.frameKey], layer.aspect, box);

  function store(layer, frame) {
    const clamped = clampFrame(frame, layer.aspect, box);
    const base = defaultFrame(layer.aspect, box);
    const isDefault = Math.abs(clamped.w - base.w) < 0.05 && Math.abs(clamped.x - base.x) < 0.05 && Math.abs(clamped.y - base.y) < 0.05;
    if (isDefault) delete value[layer.frameKey];
    else value[layer.frameKey] = { x: round2(clamped.x), y: round2(clamped.y), w: round2(clamped.w) };
    ctx.onEdit();
    place();
  }

  function place() {
    for (const [name, layer] of Object.entries(layers)) {
      const src = value[layer.srcKey];
      if (src !== layer.src) {
        layer.src = src;
        layer.aspect = 0;
        if (src) layer.img.src = thumbImage(src, 640).src;
        else layer.img.removeAttribute("src");
      }
      layer.box.hidden = !src || !layer.aspect;
      layer.box.classList.toggle("is-active", name === active);
      if (!layer.aspect) continue;
      const frame = frameOf(layer);
      Object.assign(layer.box.style, { left: `${frame.x}%`, top: `${frame.y}%`, width: `${frame.w}%` });
    }
    const afterBox = layers.after.box;
    afterBox.style.opacity = view === "overlay" ? "0.5" : "1";
    afterBox.style.clipPath = view === "slider" ? `inset(0 0 0 ${split}%)` : "";
    divider.hidden = view !== "slider";
    divider.style.left = `${split}%`;
    splitInput.parentElement && (splitInput.parentElement.hidden = view !== "slider");

    const layer = layers[active];
    const ready = Boolean(layer.aspect);
    zoom.disabled = !ready;
    reset.disabled = !ready || !value[layer.frameKey];
    if (ready) {
      const z = frameOf(layer).w / coverWidth(layer.aspect, box);
      zoom.value = String(z);
      zoomRead.textContent = `${Math.round(z * 100)}%`;
    } else {
      zoomRead.textContent = "";
    }
    const missing = [layers.before, layers.after].filter((l) => !value[l.srcKey]).map((l) => l.label);
    empty.hidden = missing.length === 0;
    empty.textContent = missing.length ? `Choose the ${missing.join(" and ")} image to line them up.` : "";
  }

  /** Zooms the active layer about the frame's centre, so the part in view stays in view. */
  function zoomTo(z) {
    const layer = layers[active];
    if (!layer.aspect) return;
    const frame = frameOf(layer);
    const w = coverWidth(layer.aspect, box) * z;
    const scale = w / frame.w;
    store(layer, { x: 50 - (50 - frame.x) * scale, y: 50 - (50 - frame.y) * scale, w });
  }

  zoom.addEventListener("input", () => zoomTo(Number(zoom.value)));
  splitInput.addEventListener("input", () => { split = Number(splitInput.value); place(); });
  reset.addEventListener("click", () => {
    delete value[layers[active].frameKey];
    ctx.onEdit();
    place();
  });

  stage.addEventListener("wheel", (event) => {
    const layer = layers[active];
    if (!layer.aspect) return;
    event.preventDefault();
    const z = frameOf(layer).w / coverWidth(layer.aspect, box);
    zoomTo(Math.min(4, Math.max(1, z * (event.deltaY < 0 ? 1.05 : 1 / 1.05))));
  }, { passive: false });

  stage.addEventListener("pointerdown", (event) => {
    const layer = layers[active];
    if (!layer.aspect || event.button !== 0) return;
    event.preventDefault();
    try { stage.setPointerCapture(event.pointerId); } catch { /* the pointer is already gone */ }
    stage.classList.add("is-panning");
    const start = frameOf(layer);
    const box = stage.getBoundingClientRect();
    const x0 = event.clientX;
    const y0 = event.clientY;
    const move = (moveEvent) => store(layer, {
      x: start.x + ((moveEvent.clientX - x0) / box.width) * 100,
      y: start.y + ((moveEvent.clientY - y0) / box.height) * 100,
      w: start.w
    });
    const end = () => {
      stage.classList.remove("is-panning");
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", end);
      stage.removeEventListener("pointercancel", end);
    };
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", end);
  });

  imageWatchers.set(value, place);

  const root = el("div", { class: "f-align" },
    el("div", { class: "f-align-head" },
      el("span", { class: "f-label f-label--inline" }, "Crop & align"),
      viewPick),
    stage,
    el("div", { class: "f-align-tools" },
      layerPick,
      el("label", { class: "f-align-zoom" }, "Zoom", zoom, zoomRead),
      reset),
    el("label", { class: "f-align-zoom f-align-split" }, "Preview divider", splitInput),
    el("p", { class: "f-help" }, "Pick a photo, then drag it in the frame to move it and scroll (or use Zoom) to crop in. Overlay shows the After at half strength so edges can be matched. The frame is the shape set in Aspect ratio below, as the gallery draws it (Original compares in 4:3)."));
  place();
  return root;
}

function imageControl(field, value, ctx) {
  const id = nextId();
  // The gallery image doubles as the Before of a comparison, and says so.
  if (field.compareLabel && value.display === "compare") field = { ...field, label: field.compareLabel };
  const input = el("input", {
    id,
    type: "text",
    class: "f-input f-input--mono",
    value: value[field.name] ?? "",
    placeholder: "/project-images/example.png"
  });

  const playback = field.speedName ? playbackControl(field, value, ctx) : null;
  const preview = el("div", { class: "f-thumb" });
  function paint() {
    preview.replaceChildren(
      input.value
        ? thumbImage(input.value, 92)
        : el("span", { class: "f-thumb-empty" }, "no image")
    );
    playback?.refresh(input.value);
    notifyImageChange(value);
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

  return fieldShell(field, el("div", { class: "f-image-row" }, preview, el("div", { class: "f-image-controls" }, input, browse)), playback, id);
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

  return fieldShell(field, el("div", { class: "f-color-row" }, swatch, text), undefined, id);
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
      ? autoGrow(el("textarea", { class: "f-input f-textarea", rows: field.rows || 3, value: entry ?? "", "aria-label": `${field.label} ${index + 1}` }))
      : el("input", { type: "text", class: "f-input", value: entry ?? "", "aria-label": `${field.label} ${index + 1}` });
    input.addEventListener("input", () => {
      list[index] = input.value;
      ctx.onEdit();
    });
    return el("div", { class: `f-row${field.multiline ? " f-row--multiline" : ""}` },
      gripHandle(`${field.label} ${index + 1}`),
      input,
      el("div", { class: "f-row-tools" },
        iconButton("remove", "Remove", () => { list.splice(index, 1); ctx.onStructureChange(); })));
  });

  const reorder = (from, to) => { moveItem(list, from, to); ctx.onStructureChange(); };

  const add = el("button", { type: "button", class: "f-btn f-btn--quiet" }, icon("add"), ` Add ${field.label.replace(/s$/, "").toLowerCase()}`);
  add.addEventListener("click", () => { list.push(""); ctx.onStructureChange(); });

  return el("div", { class: fieldClass(field, "list") },
    el("span", { class: "f-label" }, field.label),
    rows.length === 0 ? el("p", { class: "f-empty" }, "Nothing yet.") : makeSortable(el("div", { class: "f-rows" }, ...rows), reorder, field.name),
    add,
    field.help ? el("p", { class: "f-help" }, field.help) : null);
}

/** Cards the user opened stay open across repaints; a new card opens on its own. */
const openCards = new WeakSet();

/** The card's own words as its title: the image's alt or caption, a bullet's first line, a match's keyword. */
function cardSummary(field, entry, index) {
  const label = `${field.itemLabel || "Item"} ${index + 1}`;
  const text = [entry.alt, entry.caption, entry.text, entry.name, entry.title, entry.keyword, entry.label, entry.src?.split("/").pop()]
    .find((v) => typeof v === "string" && v.trim() !== "");
  if (!text) return el("h3", { class: "f-card-title" }, label, " ", el("small", {}, "· empty"));
  const short = text.length > 72 ? text.slice(0, 70).trimEnd() + "…" : text;
  return el("h3", { class: "f-card-title", title: text }, short, " ", el("small", {}, `· ${label}`));
}

function objectListControl(field, value, ctx) {
  const list = Array.isArray(value[field.name]) ? value[field.name] : (value[field.name] = []);

  const cards = list.map((entry, index) => {
    const thumb = field.gallery && entry.src
      ? el("div", { class: "f-card-thumb" }, thumbImage(entry.src, 38))
      : null;
    // Open when there is little to hide, when the user opened it, or when it was just added.
    const open = list.length <= 2 || openCards.has(entry);

    const card = el("details", { class: "f-card", open: open || undefined },
      el("summary", { class: "f-card-head" },
        // A press on the grip lifts the card; the click it leaves behind must not toggle it.
        el("span", { class: "f-card-grip", onClick: (event) => event.preventDefault() }, gripHandle(`${field.itemLabel || "item"} ${index + 1}`)),
        el("svg", { class: "f-card-caret", width: 12, height: 12, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" },
          el("path", { d: "M6 3l5 5-5 5", stroke: "currentColor", "stroke-width": 1.6, "stroke-linecap": "round", "stroke-linejoin": "round" })),
        thumb,
        cardSummary(field, entry, index),
        // Buttons inside a <summary> would also toggle it; the tools swallow the default action.
        el("div", { class: "f-row-tools", onClick: (event) => event.preventDefault() },
          iconButton("remove", "Remove", () => { list.splice(index, 1); openCards.delete(entry); ctx.onStructureChange(); }))),
      el("div", { class: "f-card-body" }, renderFields(field.fields, entry, ctx)));
    card.addEventListener("toggle", () => { if (card.open) openCards.add(entry); else openCards.delete(entry); });
    if (open) openCards.add(entry);
    return card;
  });

  const add = el("button", { type: "button", class: "f-btn f-btn--quiet" }, icon("add"), ` Add ${(field.itemLabel || "item").toLowerCase()}`);
  add.addEventListener("click", () => {
    const blank = blankFrom(field.fields);
    list.push(blank);
    openCards.add(blank);
    ctx.onStructureChange();
  });

  return el("div", { class: fieldClass(field, "list") },
    el("span", { class: "f-label" }, field.label),
    cards.length === 0
      ? el("p", { class: "f-empty" }, "Nothing yet.")
      : makeSortable(el("div", { class: "f-cards" }, ...cards), (from, to) => { moveItem(list, from, to); ctx.onStructureChange(); }, field.name),
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
  choice: choiceControl,
  image: imageControl,
  imageDisplay: imageDisplayControl,
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
  // Sibling keys a control owns (a GIF's speed) go after the schema's own fields.
  const trailing = [];

  for (const field of fields) {
    const raw = value[field.name];
    const keep = field.always || field.required;

    switch (field.type) {
      case "image": {
        const text = isBlank(raw) ? "" : String(raw).trim();
        if (text !== "" || keep) out[field.name] = text;
        // Only a GIF has a pace to keep, and 1× is the file's own, so it needs no key.
        const speed = field.speedName ? value[field.speedName] : undefined;
        if (isGifSrc(text) && speedOf(speed) !== 1) trailing.push([field.speedName, speedOf(speed)]);
        break;
      }
      case "imageDisplay": {
        // Only a comparison has anything to keep; switching back to Default drops the After.
        if (raw !== "compare") break;
        trailing.push([field.name, "compare"]);
        const after = isBlank(value[field.afterName]) ? "" : String(value[field.afterName]).trim();
        trailing.push([field.afterName, after]);
        for (const key of [field.frameName, field.afterFrameName]) {
          const frame = value[key];
          if (frame && typeof frame === "object") trailing.push([key, { x: frame.x, y: frame.y, w: frame.w }]);
        }
        break;
      }
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

  for (const [key, entry] of trailing) out[key] = entry;

  const known = new Set(fields.flatMap((field) => [field.name, ...(field.emphasisName ? [field.emphasisName] : []), ...(field.speedName ? [field.speedName] : []), ...(field.type === "imageDisplay" ? [field.afterName, field.frameName, field.afterFrameName] : [])]));
  for (const [key, raw] of Object.entries(value)) {
    if (!known.has(key)) out[key] = raw;
  }

  return out;
}
