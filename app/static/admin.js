/* User management (admin only).
 *
 * Everything shown here is checked again on the server (main.py, require()
 * and require_write()); hiding a button is a courtesy, not the protection.
 * The texts come from i18n.py as a JSON data block in admin.html.
 */
"use strict";

const TEXTS = JSON.parse(document.getElementById("adm-texts").textContent);
const GROUPS = ["admin", "portfolio", "general"];
const LOCALE = document.documentElement.lang === "en" ? "en-US" : "de-DE";

function t(key, params) {
  const text = TEXTS[key] || key;
  return params ? text.replace(/\{(\w+)\}/g, (m, n) => (params[n] === undefined ? m : params[n])) : text;
}

const el = (id) => document.getElementById(id);

async function api(path, options) {
  options = Object.assign({ credentials: "same-origin" }, options);
  options.headers = Object.assign({ "X-Requested-With": "chart" }, options.headers || {});
  if (options.json !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.json);
    delete options.json;
  }
  const response = await fetch(path, options);
  if (response.status === 401) { window.location.href = "/login"; throw new Error(""); }
  let body = null;
  try { body = await response.json(); } catch (e) { /* not JSON */ }
  if (!response.ok) {
    const detail = body && body.detail;
    throw new Error(typeof detail === "string" ? detail : "HTTP " + response.status);
  }
  return body;
}

function status(message, isError) {
  const box = el("adm-status");
  box.hidden = !message;
  box.textContent = message || "";
  box.classList.toggle("adm-error", Boolean(isError));
}

function when(epoch) {
  if (!epoch) return t("admin.never");
  return new Date(epoch * 1000).toLocaleString(LOCALE, {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

function button(label, cls, onClick, title) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = cls;
  b.textContent = label;
  if (title) b.title = title;
  b.addEventListener("click", onClick);
  return b;
}

async function refresh() {
  let data;
  try {
    data = await api("/api/admin/users");
  } catch (error) {
    status(error.message, true);
    return;
  }
  render(data);
}

function render(data) {
  const table = el("adm-users");
  table.innerHTML = "";
  const head = table.createTHead().insertRow();
  ["admin.col_user", "admin.col_groups", "admin.col_last_login", "admin.col_created",
   "admin.col_sessions", "admin.col_password", ""].forEach((key) => {
    const th = document.createElement("th");
    th.textContent = key ? t(key) : "";
    head.appendChild(th);
  });
  const body = table.createTBody();

  data.users.forEach((u) => {
    const me = u.id === data.me;
    const tr = body.insertRow();

    const name = tr.insertCell();
    name.textContent = u.username;
    if (me) {
      const you = document.createElement("span");
      you.className = "muted";
      you.textContent = " (" + t("admin.you") + ")";
      name.appendChild(you);
    }

    // Groups: a change is saved right away. If the server refuses (own admin
    // group, last admin), the box springs back.
    const groups = document.createElement("div");
    groups.className = "adm-group-cell";
    tr.insertCell().appendChild(groups);
    GROUPS.forEach((g) => {
      const label = document.createElement("label");
      label.className = "adm-check";
      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = u.groups.includes(g);
      box.disabled = me && g === "admin";
      box.addEventListener("change", async () => {
        const wanted = GROUPS.filter((x) =>
          (x === g ? box.checked : u.groups.includes(x)));
        try {
          await api("/api/admin/users/" + u.id + "/groups", { method: "PUT", json: { groups: wanted } });
        } catch (error) {
          box.checked = !box.checked;
          status(error.message, true);
          return;
        }
        u.groups = wanted;
        status(t("admin.saved_groups", { user: u.username }), false);
      });
      label.append(box, " " + t("group." + g));
      groups.appendChild(label);
    });

    tr.insertCell().textContent = when(u.last_login);
    tr.insertCell().textContent = when(u.created_at);

    const sessions = tr.insertCell();
    sessions.className = "adm-nowrap";
    sessions.append(String(u.sessions) + " ");
    if (u.sessions && !me) {
      sessions.appendChild(button(t("admin.end_sessions"), "ghost adm-small", async () => {
        if (!window.confirm(t("admin.confirm_sessions", { user: u.username }))) return;
        try {
          const r = await api("/api/admin/users/" + u.id + "/sessions", { method: "DELETE" });
          status(t("admin.ended", { count: r.ended, user: u.username }), false);
        } catch (error) {
          status(error.message, true);
          return;
        }
        refresh();
      }, t("admin.end_sessions_title")));
    }

    // A form of its own: Enter sets the password, and the browser knows the
    // field belongs to something (it complains about loose password fields).
    const pw = document.createElement("form");
    pw.className = "adm-nowrap";
    tr.insertCell().appendChild(pw);
    const field = document.createElement("input");
    field.type = "password";
    field.autocomplete = "new-password";
    field.placeholder = t("admin.password_placeholder");
    field.maxLength = 200;
    field.className = "adm-pw";
    // Tells a password manager whose password this is.
    const who = document.createElement("input");
    who.type = "text";
    who.hidden = true;
    who.autocomplete = "username";
    who.value = u.username;
    const setButton = button(t("admin.set_password"), "ghost adm-small", () => {});
    setButton.type = "submit";
    pw.append(who, field, setButton);
    pw.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await api("/api/admin/users/" + u.id + "/password", { method: "PUT", json: { password: field.value } });
      } catch (error) {
        status(error.message, true);
        return;
      }
      field.value = "";
      status(t("admin.saved_password", { user: u.username }), false);
      // Setting one's own password ends one's own session as well.
      if (me) { window.location.href = "/login"; return; }
      refresh();
    });

    const actions = tr.insertCell();
    if (!me) {
      actions.appendChild(button(t("admin.delete"), "ghost adm-small adm-danger", async () => {
        if (!window.confirm(t("admin.confirm_delete", { user: u.username }))) return;
        try {
          await api("/api/admin/users/" + u.id, { method: "DELETE" });
        } catch (error) {
          status(error.message, true);
          return;
        }
        status(t("admin.deleted", { user: u.username }), false);
        refresh();
      }));
    }
  });
}

el("adm-create").addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = el("adm-username").value.trim().toLowerCase();
  const groups = Array.from(document.querySelectorAll('#adm-create input[name="group"]:checked'))
    .map((b) => b.value);
  try {
    await api("/api/admin/users", { method: "POST",
      json: { username: username, password: el("adm-password").value, groups: groups } });
  } catch (error) {
    status(error.message, true);
    return;
  }
  el("adm-username").value = "";
  el("adm-password").value = "";
  status(t("admin.created", { user: username }), false);
  refresh();
});

refresh();
