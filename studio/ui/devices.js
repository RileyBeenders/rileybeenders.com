/**
 * Devices — who else on the network may open the dev site.
 *
 * Under `npm run site` the device gate turns every other device away until it
 * is allowed here, for a while. A device that tried shows up under "Waiting at
 * the door" with a one-click Allow, so the flow is: open the site's address on
 * the phone, come back here, allow it.
 */

import { el } from "./fields.js";

const POLL_MS = 5000;

const DURATIONS = [
  { value: "1h", label: "1 hour" },
  { value: "4h", label: "4 hours" },
  { value: "8h", label: "8 hours" },
  { value: "24h", label: "24 hours" },
  { value: "session", label: "until the server stops" }
];

const timeOfDay = (ms) => new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

function ago(ms, now) {
  const seconds = Math.max(0, Math.round((now - ms) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.round(minutes / 60)} h ago`;
}

function left(expiresAt, now) {
  const minutes = Math.max(0, Math.ceil((expiresAt - now) / 60000));
  if (minutes < 60) return `${minutes} min left`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${String(minutes % 60).padStart(2, "0")} min left`;
}

/** "iPhone · Safari" from a user-agent string — enough to tell devices apart. */
export function describeAgent(agent = "") {
  const device =
    /iPhone/.test(agent) ? "iPhone"
    : /iPad/.test(agent) ? "iPad"
    : /Android/.test(agent) ? "Android"
    : /Macintosh/.test(agent) ? "Mac"
    : /Windows/.test(agent) ? "Windows PC"
    : /Linux/.test(agent) ? "Linux"
    : "Device";
  const browser =
    /Edg\//.test(agent) ? "Edge"
    : /OPR\//.test(agent) ? "Opera"
    : /Firefox\//.test(agent) ? "Firefox"
    : /Chrome\//.test(agent) ? "Chrome"
    : /Safari\//.test(agent) ? "Safari"
    : "";
  return browser ? `${device} · ${browser}` : device;
}

const target = (grant) => (grant.prefix === (grant.address.includes(":") ? 128 : 32) ? grant.address : `${grant.address}/${grant.prefix}`);

/**
 * @param {object} deps
 * @param {(path: string, options?: RequestInit) => Promise<any>} deps.api
 * @param {HTMLDialogElement} deps.dialog
 * @param {HTMLButtonElement} deps.button   the topbar control that opens the panel
 * @param {(message: string, tone?: string) => void} deps.toast
 * @param {(options: object) => Promise<boolean>} deps.confirmDialog
 */
export function createDevicesPanel({ api, dialog, button, toast, confirmDialog }) {
  let snapshot = null;
  let duration = "8h";
  let timer = null;

  async function refresh() {
    try {
      snapshot = await api("/api/access");
    } catch (error) {
      snapshot = null;
      if (dialog.open) toast(error.message, "error");
    }
    paintButton();
    if (dialog.open) paintLists();
  }

  function schedule() {
    window.clearTimeout(timer);
    // Nothing changes on its own without a gate, unless the panel is open and one may be starting.
    if (!snapshot?.gate && !dialog.open) return;
    // Faster while the panel is open, so a fresh knock shows within a beat.
    timer = window.setTimeout(async () => {
      if (document.visibilityState === "visible") await refresh();
      schedule();
    }, dialog.open ? 2500 : POLL_MS);
  }

  function paintButton() {
    const grants = snapshot?.grants?.length ?? 0;
    const knocks = snapshot?.knocks?.length ?? 0;
    button.replaceChildren(
      deviceIcon(),
      el("span", {}, "Devices"),
      ...(grants > 0 ? [el("span", { class: "devices-count", title: `${grants} allowed` }, String(grants))] : []),
      ...(knocks > 0 ? [el("span", { class: "devices-knock", title: `${knocks} waiting at the door` })] : [])
    );
    button.title = knocks > 0
      ? `${knocks} device${knocks === 1 ? "" : "s"} waiting to be allowed in`
      : "Let a phone or another device open the dev site";
  }

  async function allow(targetText, label) {
    try {
      const result = await api("/api/access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ target: targetText, label, duration })
      });
      snapshot = result;
      paintButton();
      paintLists();
      const grant = result.grant;
      toast(`${target(grant)} can open the site ${grant.expiresAt ? `until ${timeOfDay(grant.expiresAt)}` : "until the server stops"}.`);
    } catch (error) {
      toast(error.message, "error");
    }
  }

  async function revoke(grant) {
    const ok = await confirmDialog({
      title: `Stop ${grant.label || target(grant)} from opening the site?`,
      body: "Any page it has open stops updating; the next request is turned away.",
      action: "Revoke",
      danger: true
    });
    if (!ok) return;
    try {
      snapshot = await api(`/api/access/${encodeURIComponent(grant.address)}/${grant.prefix}`, { method: "DELETE" });
      paintButton();
      paintLists();
      toast(`${target(grant)} is no longer allowed.`);
    } catch (error) {
      toast(error.message, "error");
    }
  }

  /** The two lists that change on their own; everything else is built once per open. */
  let knockList = null;
  let grantList = null;

  function paintLists() {
    if (!knockList || !grantList) return;
    const now = snapshot?.now ?? Date.now();
    const gate = snapshot?.gate ?? null;
    const grants = snapshot?.grants ?? [];
    const knocks = snapshot?.knocks ?? [];

    knockList.replaceChildren(
      knocks.length === 0
        ? el("p", { class: "f-empty" }, gate ? "Nobody yet. A device that tries the address above shows up here." : "Nothing to show while the gate is off.")
        : el("ul", { class: "devices-list" }, ...knocks.map((knock) =>
            el("li", { class: "devices-row" },
              el("code", { class: "devices-address" }, knock.address),
              el("span", { class: "devices-meta" }, describeAgent(knock.agent), " · ", knock.path, " · ", ago(knock.at, now)),
              el("button", { type: "button", class: "f-btn f-btn--solid", onClick: () => allow(knock.address, describeAgent(knock.agent)) }, "Allow"))))
    );

    grantList.replaceChildren(
      grants.length === 0
        ? el("p", { class: "f-empty" }, "No other device can open the site right now.")
        : el("ul", { class: "devices-list" }, ...grants.map((grant) =>
            el("li", { class: "devices-row" },
              el("code", { class: "devices-address" }, target(grant)),
              el("span", { class: "devices-meta" },
                grant.label ? `${grant.label} · ` : "",
                grant.expiresAt ? `until ${timeOfDay(grant.expiresAt)} · ${left(grant.expiresAt, now)}` : "until the server stops"),
              el("button", { type: "button", class: "f-btn f-btn--danger", onClick: () => revoke(grant) }, "Revoke"))))
    );
  }

  function paint() {
    const gate = snapshot?.gate ?? null;
    const lan = snapshot?.lan ?? [];

    const durationSelect = el("select", { class: "f-input f-select f-input--short", "aria-label": "How long a device stays allowed", onChange: (event) => { duration = event.target.value; } },
      ...DURATIONS.map((option) => el("option", { value: option.value, selected: option.value === duration }, option.label)));

    const address = el("input", { type: "text", class: "f-input f-input--mono", placeholder: "10.1.1.57, or 10.1.1.0/24 for the whole network", "aria-label": "Address or range", autocomplete: "off", spellcheck: false });
    const label = el("input", { type: "text", class: "f-input", placeholder: "Label, e.g. Riley's phone", "aria-label": "Label", autocomplete: "off" });
    const form = el("form", {
      class: "devices-form",
      onSubmit: async (event) => {
        event.preventDefault();
        await allow(address.value, label.value);
        address.value = "";
        label.value = "";
      }
    },
      address,
      label,
      el("button", { type: "submit", class: "f-btn f-btn--solid" }, "Allow"));

    knockList = el("div", { class: "devices-list-slot" });
    grantList = el("div", { class: "devices-list-slot" });

    dialog.replaceChildren(
      el("div", { class: "devices" },
        el("div", { class: "picker-head" },
          el("div", { class: "picker-head-title" },
            el("h2", {}, "Devices on your network"),
            el("span", { class: `tag${gate ? "" : " tag--off"}` }, gate ? `Gate on :${gate.port}` : "Gate off")),
          el("button", { type: "button", class: "f-btn f-btn--quiet", onClick: () => dialog.close() }, "Close")),

        el("div", { class: "devices-body" },
          gate
            ? null
            : el("p", { class: "devices-notice" },
                "The device gate isn't running, so nothing outside this machine can reach the site. Start everything with ",
                el("code", {}, "npm run site"),
                " and devices can be let in from here."),

          el("section", { class: "devices-section" },
            el("h3", { class: "f-label" }, "On a phone or tablet, open"),
            lan.length === 0
              ? el("p", { class: "f-empty" }, "No local-network address found — this machine isn't on a network other devices can see.")
              : el("div", { class: "devices-urls" }, ...lan.map((host) => lanUrl(`http://${host}:${gate?.port ?? 3000}`))),
            el("p", { class: "f-help" }, "The device is turned away with a page that shows its address; allow it below and that page loads the site on its own.")),

          el("section", { class: "devices-section" },
            el("div", { class: "devices-section-head" },
              el("h3", { class: "f-label" }, "Waiting at the door"),
              el("label", { class: "devices-duration" }, el("span", {}, "Allow for"), durationSelect)),
            knockList),

          el("section", { class: "devices-section" },
            el("h3", { class: "f-label" }, "Allowed"),
            grantList),

          el("section", { class: "devices-section" },
            el("h3", { class: "f-label" }, "Add a device by address"),
            form,
            el("p", { class: "f-help" }, "Only local-network addresses can be allowed, and never anything wider than one network (/16). Grants end on their own; the list survives a restart, “until the server stops” does not."))))
    );

    paintLists();
    address.focus();
  }

  function lanUrl(url) {
    return el("div", { class: "devices-url" },
      el("code", {}, url),
      el("button", {
        type: "button",
        class: "f-btn f-btn--quiet",
        onClick: async () => {
          try {
            await navigator.clipboard.writeText(url);
            toast(`Copied ${url}`);
          } catch {
            toast("Couldn't copy — select the address instead.", "error");
          }
        }
      }, "Copy"));
  }

  async function open() {
    await refresh();
    paint();
    dialog.showModal();
    schedule();
  }

  // Back to the slow poll. The content stays put: open() repaints it, and a
  // late close event must never wipe a panel that has just been reopened.
  dialog.addEventListener("close", schedule);
  button.addEventListener("click", open);
  paintButton();

  return {
    /** Loads the first snapshot; polling then runs only while there is a gate to watch. */
    async start() {
      await refresh();
      schedule();
    }
  };
}

/** Lucide's smartphone, at the size the topbar's other icons use. */
function deviceIcon() {
  return el("svg", {
    width: 13, height: 13, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round",
    "aria-hidden": "true"
  },
    el("rect", { width: 14, height: 20, x: 5, y: 2, rx: 2, ry: 2 }),
    el("path", { d: "M12 18h.01" }));
}
