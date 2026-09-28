/**
 * Files — the image picker, laid out like a Windows Explorer window.
 *
 * The address bar at the top is the folder you are in; Up and its crumbs go
 * back out. Folders come first, then files. A click selects (Ctrl adds one,
 * Shift a run), a double-click opens a folder or chooses a file. Upload and
 * New folder act on the folder you are in. Anything can be dragged onto a
 * folder or a crumb to move it there, and files dragged in from the desktop
 * upload to wherever they are dropped.
 *
 * Moves and renames go through /api/move, which also rewrites every data file
 * that referred to the old path, so the site never points at a file that has
 * gone. `onMoved` hands each move to the editor so its open copies follow. A
 * path the site's code names directly is refused by the server instead.
 *
 * The same window opens two ways: from an image field's Browse… to choose a
 * file, and from the Files button in the corner to look after them (`manage`),
 * where Choose gives way to Copy path and Open. Either way, the foot says
 * where the selected file or folder is used on the site.
 */

import { el, thumbImage } from "./fields.js";

/** The level above the image folders (public/): it only holds them. */
const TOP = "";
const MAX_UPLOAD_BYTES = 16 * 1024 * 1024;
const NEW_FOLDER = "\u0000new";

const byName = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
const baseName = (p) => p.slice(p.lastIndexOf("/") + 1);
const parentOf = (folder) => (folder.includes("/") ? folder.slice(0, folder.lastIndexOf("/")) : TOP);
const encodePath = (p) => p.split("/").filter(Boolean).map(encodeURIComponent).join("/");
const sizeOf = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
/** "A", "A and B", "A, B and C". */
const listed = (words) => (words.length < 2 ? words.join("") : `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`);
/** A path under `from` (or `from` itself), carried to `to`; anything else as it was. */
const carry = (p, from, to) => (p === from || p.startsWith(`${from}/`) ? to + p.slice(from.length) : p);

function svgIcon(d, size = 15) {
  return el("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
    ...[].concat(d).map((path) => el("path", { d: path })));
}
const ICONS = {
  up: ["M12 19V5", "m5 12 7-7 7 7"],
  folder: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
  newFolder: ["M12 10v6", "M9 13h6", "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"],
  upload: ["M12 3v12", "m17 8-5-5-5 5", "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"],
  chevron: "m9 18 6-6-6-6"
};

export function createFilePicker({ api, dialog, toast, confirmDialog, onMoved }) {
  /** From /api/images: every file (`{ src, folder, name, bytes, kind }`) and every folder path. */
  let images = [];
  let folders = [];
  /** Where the last picker was left, so the next one opens there. */
  let lastFolder = null;

  async function refresh() {
    const payload = await api("/api/images");
    images = payload.images;
    folders = payload.folders;
  }

  const folderExists = (folder) => folder === TOP || folders.includes(folder);

  /**
   * Opens the picker on `current`'s folder. Resolves to the chosen file's
   * path, or null when it is closed without choosing. `pdf` shows PDFs too,
   * for a gallery file; everywhere else they are left out. `manage` opens it
   * to look after files rather than choose one: everything shows, a
   * double-click opens the file in a new tab, and it always resolves null.
   */
  function open(current, { pdf = false, manage = false } = {}) {
    if (manage) pdf = true;
    return new Promise((resolve) => {
      const view = {
        cwd: "project-images",
        /** Selected items, by path: "/project-images/a.jpg", or "/project-images/Folder" for a folder. */
        selected: new Set(),
        anchor: null,
        focus: null,
        /** The item whose name is being typed, or NEW_FOLDER while a folder is being made. */
        renaming: null,
        busy: false,
        current
      };
      /** What is being dragged from this window, readable during dragover (dataTransfer isn't). */
      let dragging = [];
      let settled = false;

      const currentImage = images.find((image) => image.src === current);
      const currentFolder = currentImage?.folder ?? (typeof current === "string" ? parentOf(current.replace(/^\//, "")) : null);
      view.cwd = [currentFolder, lastFolder, "project-images"].find((folder) => folder && folderExists(folder)) ?? TOP;
      if (currentImage) {
        view.selected.add(currentImage.src);
        view.anchor = view.focus = currentImage.src;
      }

      /* ------------------------------------------------------ items --- */

      const shows = (image) => pdf || image.kind !== "pdf";

      /** What the open folder holds: folders first, then files, each in name order the way Explorer sorts. */
      function items() {
        const inside = (folder) => parentOf(folder) === view.cwd;
        const subfolders = folders.filter((folder) => folder !== TOP && inside(folder)).sort((a, b) => byName(baseName(a), baseName(b)))
          .map((folder) => ({
            type: "folder",
            path: `/${folder}`,
            folder,
            name: baseName(folder),
            fixed: !folder.includes("/"),
            count: folders.filter((f) => parentOf(f) === folder).length + images.filter((image) => image.folder === folder && shows(image)).length
          }));
        const files = view.cwd === TOP ? [] : images.filter((image) => image.folder === view.cwd && shows(image)).sort((a, b) => byName(a.name, b.name))
          .map((image) => ({ type: "file", path: image.src, name: image.name, bytes: image.bytes, kind: image.kind }));
        return [...subfolders, ...files];
      }

      let list = [];
      const itemAt = (p) => list.find((item) => item.path === p);

      /* -------------------------------------------------------- dom --- */

      const title = el("h2", {}, manage ? "Files" : pdf ? "Choose an image or PDF" : "Choose an image");
      const upButton = el("button", { type: "button", class: "files-icon-btn", title: "Up one folder (Backspace)", "aria-label": "Up one folder", onClick: () => go(parentOf(view.cwd)) }, svgIcon(ICONS.up));
      const crumbs = el("nav", { class: "files-path", "aria-label": "Folder" });
      const newFolderButton = el("button", { type: "button", class: "f-btn f-btn--quiet", title: "New folder (Ctrl+Shift+N)", onClick: startNewFolder }, svgIcon(ICONS.newFolder), "New folder");
      const fileInput = el("input", { type: "file", multiple: true, accept: pdf ? "image/*,application/pdf,.pdf" : "image/*", hidden: true });
      const uploadButton = el("button", { type: "button", class: "f-btn f-btn--quiet", onClick: () => fileInput.click() }, svgIcon(ICONS.upload), "Upload");
      const grid = el("div", { class: "files-grid", role: "listbox", "aria-multiselectable": "true", tabIndex: -1 });
      const statusText = el("span", {});
      const usage = el("span", { class: "files-usage" });
      const status = el("span", { class: "files-status", "aria-live": "polite" }, statusText, usage);
      const renameButton = el("button", { type: "button", class: "f-btn f-btn--quiet", title: "Rename (F2)", onClick: () => startRename(view.focus) }, "Rename");
      const deleteButton = el("button", { type: "button", class: "f-btn f-btn--danger", title: "Delete (Del)", onClick: deleteSelected }, "Delete");
      const chooseButton = el("button", { type: "button", class: "f-btn f-btn--solid", onClick: () => choose() }, "Choose");
      const copyButton = el("button", { type: "button", class: "f-btn f-btn--quiet", title: "Copy the path to paste into a field", onClick: copyPath }, "Copy path");
      const openButton = el("button", { type: "button", class: "f-btn f-btn--solid", onClick: () => { const item = selectedOne(); if (item) activate(item); } }, "Open");

      fileInput.addEventListener("change", () => {
        const chosen = [...fileInput.files];
        fileInput.value = "";
        upload(chosen, view.cwd);
      });

      /** One tile per item, by path, so selection changes restyle tiles instead of redrawing thumbnails. */
      const tiles = new Map();
      /** "Used in Projects" per path, until the next repaint; anything that changes files repaints. */
      const usageCache = new Map();
      let usageToken = 0;

      function paint() {
        usageCache.clear();
        list = items();
        for (const key of [...view.selected]) if (!itemAt(key)) view.selected.delete(key);
        if (view.focus && !itemAt(view.focus)) view.focus = null;
        paintCrumbs();
        upButton.disabled = view.cwd === TOP;
        const top = view.cwd === TOP;
        newFolderButton.disabled = top;
        uploadButton.disabled = top;
        newFolderButton.title = top ? "Open a folder to make one inside it" : "New folder (Ctrl+Shift+N)";
        uploadButton.title = top ? "Open a folder to upload into it" : "Upload into this folder";
        grid.setAttribute("aria-label", `Contents of ${view.cwd || "public"}`);

        tiles.clear();
        const nodes = list.map((item) => {
          const tile = tileFor(item);
          tiles.set(item.path, tile);
          return tile;
        });
        if (view.renaming === NEW_FOLDER) nodes.unshift(newFolderTile());
        if (nodes.length === 0) {
          nodes.push(el("p", { class: "files-empty" }, top ? "" : "This folder is empty. Drop files here or use Upload."));
        }
        grid.replaceChildren(...nodes);
        paintSelection();
      }

      function paintCrumbs() {
        const parts = view.cwd === TOP ? [] : view.cwd.split("/");
        const trail = [{ folder: TOP, label: "public" }, ...parts.map((part, i) => ({ folder: parts.slice(0, i + 1).join("/"), label: part }))];
        crumbs.replaceChildren(...trail.flatMap(({ folder, label }, i) => {
          const last = i === trail.length - 1;
          const crumb = el("button", {
            type: "button",
            class: "files-crumb",
            "aria-current": last ? "location" : undefined,
            onClick: () => { if (!last) go(folder); }
          }, label);
          if (folder !== TOP) dropTarget(crumb, folder);
          return i === 0 ? [crumb] : [el("span", { class: "files-crumb-sep", "aria-hidden": "true" }, svgIcon(ICONS.chevron, 13)), crumb];
        }));
      }

      function tileFor(item) {
        const isFolder = item.type === "folder";
        const thumb = isFolder ? null : thumbImage(item.path, 220);
        // The tile is what drags; an <img> would otherwise drag itself, looking like a desktop file.
        thumb?.setAttribute("draggable", "false");
        const visual = isFolder
          ? el("span", { class: "files-visual files-visual--folder" }, svgIcon(ICONS.folder, 46))
          : el("span", { class: "files-visual" }, thumb);
        const meta = isFolder
          ? (item.count === 0 ? "Empty" : plural(item.count, "item"))
          : `${item.kind === "pdf" ? "PDF · " : ""}${sizeOf(item.bytes)}`;
        const tile = el("div", {
          class: `files-tile${isFolder ? " files-tile--folder" : ""}${item.path === view.current ? " is-current" : ""}`,
          role: "option",
          tabIndex: -1,
          title: item.name,
          draggable: item.fixed || view.renaming === item.path ? undefined : "true",
          onClick: (event) => select(item.path, event),
          onDblclick: () => activate(item),
          onDragstart: (event) => dragStart(event, item),
          onDragend: dragEnd
        },
          visual,
          el("span", { class: "files-name" }, item.name),
          el("span", { class: "files-meta" }, meta),
          item.path === view.current ? el("span", { class: "files-tag" }, "Current") : null);
        if (isFolder) dropTarget(tile, item.folder);
        if (view.renaming === item.path) tile.replaceChild(nameInput(item.name, isFolder, (name) => commitRename(item, name)), tile.querySelector(".files-name"));
        return tile;
      }

      function newFolderTile() {
        return el("div", { class: "files-tile files-tile--folder is-selected" },
          el("span", { class: "files-visual files-visual--folder" }, svgIcon(ICONS.folder, 46)),
          nameInput("New-folder", true, commitNewFolder),
          el("span", { class: "files-meta" }, "Empty"));
      }

      /** The inline name box, the way Explorer renames: the name without its ending is selected, Enter keeps it, Esc backs out. */
      function nameInput(initial, isFolder, commit) {
        const input = el("input", { type: "text", class: "f-input files-name-input", value: initial, "aria-label": isFolder ? "Folder name" : "File name", spellcheck: false });
        let done = false;
        const finish = (keep) => {
          if (done) return;
          done = true;
          const name = input.value.trim();
          // A new folder is made even under its suggested name; a rename that changed nothing is no rename.
          if (keep && name !== "" && (name !== initial || view.renaming === NEW_FOLDER)) commit(name);
          else { view.renaming = null; paint(); focusTile(); }
        };
        input.addEventListener("keydown", (event) => {
          event.stopPropagation();
          if (event.key === "Enter") { event.preventDefault(); finish(true); }
          if (event.key === "Escape") { event.preventDefault(); finish(false); }
        });
        input.addEventListener("blur", () => finish(true));
        input.addEventListener("click", (event) => event.stopPropagation());
        input.addEventListener("dblclick", (event) => event.stopPropagation());
        queueMicrotask(() => {
          input.focus();
          const dot = isFolder ? -1 : initial.lastIndexOf(".");
          input.setSelectionRange(0, dot > 0 ? dot : initial.length);
        });
        return input;
      }

      function paintSelection() {
        for (const [key, tile] of tiles) {
          const on = view.selected.has(key);
          tile.classList.toggle("is-selected", on);
          tile.setAttribute("aria-selected", String(on));
          tile.tabIndex = key === (view.focus ?? list[0]?.path) ? 0 : -1;
        }
        const chosen = [...view.selected].map(itemAt).filter(Boolean);
        const one = chosen.length === 1 ? chosen[0] : null;
        chooseButton.disabled = !(one && one.type === "file");
        copyButton.disabled = !one;
        openButton.disabled = !one;
        renameButton.disabled = !(one && !one.fixed);
        deleteButton.disabled = chosen.length === 0 || chosen.some((item) => item.fixed);
        if (view.busy) return;
        statusText.textContent = one
          ? (one.type === "file" ? `${one.name} · ${one.kind === "pdf" ? "PDF · " : ""}${sizeOf(one.bytes)}` : `${one.name} · ${one.count === 0 ? "empty" : plural(one.count, "item")}`)
          : chosen.length > 1 ? `${chosen.length} selected` : plural(list.length, "item");
        showUsage(one && !one.fixed ? one : null);
      }

      /**
       * Where the selected file or folder is used: the data files that name it
       * (or anything in it) and any source that does. Asked for a moment after
       * the selection settles, so arrowing through a folder doesn't flood the
       * server, and dropped if the selection has moved on by the time it lands.
       */
      function showUsage(item) {
        const token = ++usageToken;
        usage.textContent = item && usageCache.has(item.path) ? usageCache.get(item.path) : "";
        if (!item || usageCache.has(item.path)) return;
        setTimeout(async () => {
          if (token !== usageToken) return;
          try {
            const refs = await api(`/api/refs?src=${encodeURIComponent(item.path)}`);
            const where = [...refs.uses.map((use) => use.label), ...refs.code.map(baseName)];
            const text = where.length > 0 ? ` · Used in ${listed(where)}` : " · Not used by the site";
            usageCache.set(item.path, text);
            if (token === usageToken && !view.busy) usage.textContent = text;
          } catch {
            // Only a hint; the foot reads fine without it.
          }
        }, 150);
      }

      function setStatus(text) {
        view.busy = Boolean(text);
        statusText.textContent = text || "";
        usage.textContent = "";
        usageToken += 1;
        if (!text) paintSelection();
      }

      const selectedOne = () => (view.selected.size === 1 ? itemAt([...view.selected][0]) : null);

      async function copyPath() {
        const item = selectedOne();
        if (!item) return;
        try {
          await navigator.clipboard.writeText(item.path);
          toast(`Copied ${item.path}`);
        } catch {
          toast(`Couldn't reach the clipboard. The path is ${item.path}`, "error");
        }
      }

      /* -------------------------------------------------- selection --- */

      function select(key, event = {}) {
        if (event.shiftKey && view.anchor && itemAt(view.anchor)) {
          const a = list.findIndex((item) => item.path === view.anchor);
          const b = list.findIndex((item) => item.path === key);
          if (!(event.ctrlKey || event.metaKey)) view.selected.clear();
          for (const item of list.slice(Math.min(a, b), Math.max(a, b) + 1)) view.selected.add(item.path);
        } else if (event.ctrlKey || event.metaKey) {
          if (view.selected.has(key)) view.selected.delete(key);
          else view.selected.add(key);
          view.anchor = key;
        } else {
          view.selected = new Set([key]);
          view.anchor = key;
        }
        view.focus = key;
        paintSelection();
        focusTile();
      }

      function focusTile() {
        const tile = tiles.get(view.focus) ?? null;
        (tile ?? grid).focus({ preventScroll: false });
        tile?.scrollIntoView({ block: "nearest" });
      }

      /** Double-click or Enter: a folder opens; a file is chosen, or, when managing, opens in a new tab. */
      function activate(item) {
        if (item.type === "folder") go(item.folder);
        else if (manage) window.open(item.path, "_blank", "noopener");
        else choose(item.path);
      }

      function go(folder) {
        if (!folderExists(folder)) folder = TOP;
        const from = view.cwd;
        view.cwd = folder;
        view.renaming = null;
        // Going up lands on the folder just left, the way Explorer does.
        const cameFrom = parentOf(from) === folder ? `/${from}` : null;
        view.selected = new Set(cameFrom ? [cameFrom] : []);
        view.anchor = view.focus = cameFrom;
        paint();
        grid.scrollTop = 0;
        focusTile();
      }

      /* --------------------------------------------------- keyboard --- */

      /** Tiles in the first row: how far ↑ and ↓ move. */
      function columns() {
        const all = [...tiles.values()];
        if (all.length === 0) return 1;
        const top = all[0].offsetTop;
        return Math.max(1, all.filter((tile) => tile.offsetTop === top).length);
      }

      grid.addEventListener("keydown", (event) => {
        if (view.renaming) return;
        const index = list.findIndex((item) => item.path === view.focus);
        const ctrl = event.ctrlKey || event.metaKey;
        const move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns(), ArrowUp: -columns(), Home: -Infinity, End: Infinity }[event.key];
        if (move !== undefined && !(event.altKey && event.key === "ArrowUp")) {
          event.preventDefault();
          if (list.length === 0) return;
          const next = index === -1 ? 0 : Math.min(list.length - 1, Math.max(0, index + move));
          select(list[next].path, { shiftKey: event.shiftKey, ctrlKey: false });
          return;
        }
        if (event.key === "Enter" && view.focus && itemAt(view.focus)) { event.preventDefault(); activate(itemAt(view.focus)); return; }
        if (event.key === "Backspace" || (event.altKey && event.key === "ArrowUp")) { event.preventDefault(); if (view.cwd !== TOP) go(parentOf(view.cwd)); return; }
        if (event.key === "Delete") { event.preventDefault(); deleteSelected(); return; }
        if (event.key === "F2") { event.preventDefault(); startRename(view.focus); return; }
        if (ctrl && event.key.toLowerCase() === "a") { event.preventDefault(); view.selected = new Set(list.map((item) => item.path)); paintSelection(); return; }
        if (ctrl && event.shiftKey && event.key.toLowerCase() === "n") { event.preventDefault(); startNewFolder(); }
      });

      // A click on the grid's empty space clears the selection, as it does in Explorer.
      grid.addEventListener("click", (event) => {
        if (event.target !== grid) return;
        view.selected.clear();
        paintSelection();
      });

      /* ---------------------------------------------- drag and drop --- */

      function dragStart(event, item) {
        if (item.fixed || view.renaming) return event.preventDefault();
        if (!view.selected.has(item.path)) select(item.path);
        dragging = [...view.selected].filter((key) => itemAt(key) && !itemAt(key).fixed);
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", dragging.join("\n"));
        for (const key of dragging) tiles.get(key)?.classList.add("is-dragged");
      }

      function dragEnd() {
        dragging = [];
        for (const tile of tiles.values()) tile.classList.remove("is-dragged");
        for (const node of dialog.querySelectorAll(".is-drop")) node.classList.remove("is-drop");
      }

      const fromDesktop = (event) => dragging.length === 0 && Boolean(event.dataTransfer?.types?.includes("Files"));

      /** Can what is being dragged go into `folder`? Not into itself, not into its own folder, never to the top level. */
      function canDrop(event, folder) {
        if (folder === TOP) return false;
        if (fromDesktop(event)) return true;
        if (dragging.length === 0) return false;
        return dragging.every((key) => {
          const inside = key.replace(/^\//, "");
          return folder !== inside && !folder.startsWith(`${inside}/`);
        }) && dragging.some((key) => parentOf(key.replace(/^\//, "")) !== folder);
      }

      /** A folder tile or crumb that takes drops: items from here move into it, files from the desktop upload into it. */
      function dropTarget(node, folder) {
        node.addEventListener("dragover", (event) => {
          if (!canDrop(event, folder)) return;
          event.preventDefault();
          event.stopPropagation();
          event.dataTransfer.dropEffect = fromDesktop(event) ? "copy" : "move";
          node.classList.add("is-drop");
        });
        node.addEventListener("dragleave", (event) => {
          if (!node.contains(event.relatedTarget)) node.classList.remove("is-drop");
        });
        node.addEventListener("drop", (event) => {
          if (!canDrop(event, folder)) return;
          event.preventDefault();
          event.stopPropagation();
          node.classList.remove("is-drop");
          if (fromDesktop(event)) upload([...event.dataTransfer.files], folder);
          else moveInto([...dragging], folder);
          dragEnd();
        });
      }

      // The open folder itself takes desktop files dropped anywhere on its empty space.
      grid.addEventListener("dragover", (event) => {
        if (!fromDesktop(event) || view.cwd === TOP) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        grid.classList.add("is-drop");
      });
      grid.addEventListener("dragleave", (event) => {
        if (!grid.contains(event.relatedTarget)) grid.classList.remove("is-drop");
      });
      grid.addEventListener("drop", (event) => {
        grid.classList.remove("is-drop");
        if (!fromDesktop(event) || view.cwd === TOP) return;
        event.preventDefault();
        upload([...event.dataTransfer.files], view.cwd);
      });

      /* ----------------------------------------------------- actions --- */

      /** "Updated 3 paths in Projects and Proofs." — what a move rewrote, said once. */
      function rewroteNote(results) {
        const byFile = new Map();
        for (const result of results) for (const file of result.rewrote) byFile.set(file.label, (byFile.get(file.label) ?? 0) + file.count);
        if (byFile.size === 0) return "";
        const total = [...byFile.values()].reduce((a, b) => a + b, 0);
        return ` Updated ${plural(total, "path")} in ${[...byFile.keys()].join(" and ")}.`;
      }

      function applyMove(result) {
        view.current = typeof view.current === "string" ? carry(view.current, result.from, result.to) : view.current;
        lastFolder = lastFolder && carry(`/${lastFolder}`, result.from, result.to).slice(1);
        onMoved(result);
      }

      async function moveInto(dragged, folder) {
        // Whatever is already in that folder stays as it is.
        const keys = dragged.filter((key) => parentOf(key.replace(/^\//, "")) !== folder);
        if (keys.length === 0) return;
        const results = [];
        setStatus(`Moving ${plural(keys.length, "item")}…`);
        for (const key of keys) {
          try {
            const result = await api("/api/move", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ from: key, to: `/${folder}/${baseName(key)}` })
            });
            applyMove(result);
            results.push(result);
          } catch (error) {
            toast(error.message, "error");
            break;
          }
        }
        await refresh();
        setStatus("");
        paint();
        if (results.length > 0) toast(`Moved ${results.length === 1 ? baseName(results[0].from) : plural(results.length, "item")} to ${baseName(folder)}.${rewroteNote(results)}`);
      }

      function startRename(key) {
        const item = key && itemAt(key);
        if (!item || item.fixed) return;
        view.renaming = key;
        paint();
      }

      async function commitRename(item, name) {
        view.renaming = null;
        const parent = item.path.slice(0, item.path.lastIndexOf("/"));
        try {
          const result = await api("/api/move", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ from: item.path, to: `${parent}/${name}` })
          });
          applyMove(result);
          await refresh();
          view.selected = new Set([result.to]);
          view.anchor = view.focus = result.to;
          paint();
          focusTile();
          const cleaned = baseName(result.to) !== name ? ` (saved as ${baseName(result.to)})` : "";
          toast(`Renamed to ${baseName(result.to)}${cleaned}.${rewroteNote([result])}`);
        } catch (error) {
          paint();
          focusTile();
          toast(error.message, "error");
        }
      }

      function startNewFolder() {
        if (view.cwd === TOP || view.renaming) return;
        view.renaming = NEW_FOLDER;
        paint();
        grid.scrollTop = 0;
      }

      async function commitNewFolder(name) {
        view.renaming = null;
        try {
          const made = await api("/api/folders", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ parent: `/${view.cwd}`, name })
          });
          await refresh();
          view.selected = new Set([`/${made.folder}`]);
          view.anchor = view.focus = `/${made.folder}`;
          paint();
          focusTile();
          if (made.name !== name) toast(`Made the folder ${made.name}.`);
        } catch (error) {
          paint();
          focusTile();
          toast(error.message, "error");
        }
      }

      async function upload(files, folder) {
        if (folder === TOP || files.length === 0) return;
        const allowed = (file) => file.type.startsWith("image/") || (pdf && (file.type === "application/pdf" || /\.pdf$/i.test(file.name)));
        const skipped = files.filter((file) => !allowed(file)).map((file) => file.name);
        const tooBig = files.filter((file) => allowed(file) && file.size > MAX_UPLOAD_BYTES).map((file) => file.name);
        const queue = files.filter((file) => allowed(file) && file.size <= MAX_UPLOAD_BYTES);
        const uploaded = [];
        for (const [i, file] of queue.entries()) {
          setStatus(`Uploading ${i + 1} of ${queue.length}: ${file.name}…`);
          try {
            const result = await api(`/api/images/${encodePath(folder)}?name=${encodeURIComponent(file.name)}`, {
              method: "POST",
              headers: { "content-type": file.type || "application/octet-stream" },
              body: file
            });
            uploaded.push(result.src);
          } catch (error) {
            toast(`${file.name}: ${error.message}`, "error");
          }
        }
        await refresh();
        setStatus("");
        if (folder === view.cwd && uploaded.length > 0) {
          view.selected = new Set(uploaded);
          view.anchor = view.focus = uploaded.at(-1);
        }
        paint();
        focusTile();
        const notes = [
          uploaded.length > 0 ? `Uploaded ${uploaded.length === 1 ? baseName(uploaded[0]) : plural(uploaded.length, "file")} to ${baseName(folder)}.` : "",
          skipped.length > 0 ? `Skipped ${skipped.join(", ")}: ${pdf ? "images and PDFs" : "images"} only.` : "",
          tooBig.length > 0 ? `Skipped ${tooBig.join(", ")}: over 16 MB.` : ""
        ].filter(Boolean);
        if (notes.length > 0) toast(notes.join("\n"), skipped.length + tooBig.length > 0 ? "error" : "ok");
      }

      async function deleteSelected() {
        const chosen = [...view.selected].map(itemAt).filter(Boolean);
        if (chosen.length === 0 || chosen.some((item) => item.fixed)) return;
        const nonEmpty = chosen.find((item) => item.type === "folder" && item.count > 0);
        if (nonEmpty) {
          toast(`${nonEmpty.name} isn't empty. Move or delete what's in it first.`, "error");
          return;
        }
        // Say where a file is still used before it goes, so a gallery isn't left pointing at nothing.
        const uses = [];
        for (const item of chosen.filter((entry) => entry.type === "file")) {
          try {
            const refs = await api(`/api/refs?src=${encodeURIComponent(item.path)}`);
            const where = [...refs.uses.map((use) => use.label), ...refs.code];
            if (where.length > 0) uses.push(`${item.name} is used in ${where.join(" and ")}.`);
          } catch {
            // The warning is a courtesy; the delete can still go ahead.
          }
        }
        const label = chosen.length === 1 ? chosen[0].name : plural(chosen.length, "item");
        const ok = await confirmDialog({
          title: `Delete ${label}?`,
          body: [`${chosen.length === 1 ? "It is" : "They are"} removed from ${view.cwd} on disk. This can't be undone.`, ...uses].join("\n"),
          action: "Delete",
          danger: true
        });
        if (!ok) return focusTile();
        for (const item of chosen) {
          try {
            if (item.type === "folder") await api(`/api/folders/${encodePath(item.folder)}`, { method: "DELETE" });
            else await api(`/api/images/${encodePath(item.path)}`, { method: "DELETE" });
          } catch (error) {
            toast(error.message, "error");
          }
        }
        await refresh();
        view.selected.clear();
        paint();
        focusTile();
        toast(`Deleted ${label}.`);
      }

      /* ------------------------------------------------------ close --- */

      function choose(key = [...view.selected][0]) {
        const item = key && itemAt(key);
        if (!item || item.type !== "file") return;
        finish(item.path);
      }

      function finish(value) {
        if (settled) return;
        settled = true;
        lastFolder = view.cwd || lastFolder;
        dialog.removeEventListener("cancel", onCancel);
        dialog.removeEventListener("close", onClose);
        dialog.close();
        dialog.replaceChildren();
        dialog.classList.remove("modal--files");
        resolve(value);
      }

      dialog.replaceChildren(
        el("div", { class: "files" },
          el("div", { class: "picker-head" },
            title,
            el("button", { type: "button", class: "f-btn f-btn--quiet", onClick: () => finish(null) }, "Close")),
          el("div", { class: "files-bar" },
            upButton,
            crumbs,
            el("div", { class: "files-bar-actions" }, newFolderButton, uploadButton)),
          grid,
          el("div", { class: "files-foot" },
            status,
            el("div", { class: "files-foot-actions" },
              renameButton,
              deleteButton,
              el("span", { class: "files-foot-gap" }),
              ...(manage
                ? [copyButton, openButton]
                : [el("button", { type: "button", class: "f-btn f-btn--quiet", onClick: () => finish(null) }, "Cancel"), chooseButton]))),
          fileInput)
      );
      dialog.classList.add("modal--files");
      // Escape closes the window, except while a name is being typed (the name box takes it).
      // Handled on cancel rather than trusting a `close` event to arrive; close stays as a backstop,
      // and only counts while the dialog really is shut, so a late close from the last picker
      // can't shut this one.
      function onCancel(event) {
        event.preventDefault();
        if (!view.renaming) finish(null);
      }
      function onClose() {
        if (!dialog.open) finish(null);
      }
      dialog.addEventListener("cancel", onCancel);
      dialog.addEventListener("close", onClose);
      dialog.showModal();
      paint();
      focusTile();
    });
  }

  return { refresh, open };
}
