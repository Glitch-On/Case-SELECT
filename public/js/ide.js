const api = {
  async request(method, url, body) {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return response.json();
  },
  status() { return this.request("GET", "/api/ide/status"); },
  connect() { return this.request("POST", "/api/ide/connect"); },
  disconnect() { return this.request("POST", "/api/ide/disconnect"); },
  schema() { return this.request("GET", "/api/ide/schema"); },
  query(sql) { return this.request("POST", "/api/ide/query", { sql }); },
  command(input) { return this.request("POST", "/api/ide/command", { input }); },
};

const els = {
  status: document.getElementById("connection-status"),
  btnConnect: document.getElementById("btn-connect"),
  btnDisconnect: document.getElementById("btn-disconnect"),
  btnRefreshSchema: document.getElementById("btn-refresh-schema"),
  schemaExplorer: document.getElementById("schema-explorer"),
  editor: document.getElementById("sql-editor"),
  highlight: document.querySelector("#editor-highlight code"),
  highlightPre: document.getElementById("editor-highlight"),
  btnRun: document.getElementById("btn-run"),
  resultsContainer: document.getElementById("results-container"),
  resultsMeta: document.getElementById("results-meta"),
  terminalOutput: document.getElementById("terminal-output"),
  terminalForm: document.getElementById("terminal-form"),
  terminalInput: document.getElementById("terminal-input"),
};

/* ── Connection status ──────────────────────────────── */

function setStatus(status) {
  const connected = Boolean(status.connected);
  els.status.textContent = connected ? `Connected · ${status.mode}` : "Disconnected";
  els.status.className = `status-badge ${connected ? "status-connected" : "status-disconnected"}`;
  els.btnConnect.disabled = connected;
  els.btnDisconnect.disabled = !connected;
}

async function refreshStatus() {
  setStatus(await api.status());
}

/* ── Schema explorer ────────────────────────────────── */

function renderSchema(schema) {
  if (!schema || !schema.tables || schema.tables.length === 0) {
    els.schemaExplorer.innerHTML = `<p class="empty-state">No tables found.</p>`;
    return;
  }

  els.schemaExplorer.innerHTML = "";
  for (const table of schema.tables) {
    const tableEl = document.createElement("div");
    tableEl.className = "schema-table open";

    const header = document.createElement("div");
    header.className = "schema-table-header";
    header.innerHTML = `<span class="chevron">▶</span><span>${escapeHtml(table.name)}</span>`;
    header.addEventListener("click", () => tableEl.classList.toggle("open"));

    const columnsEl = document.createElement("div");
    columnsEl.className = "schema-columns";
    for (const col of table.columns) {
      const colEl = document.createElement("div");
      colEl.className = "schema-column";
      colEl.innerHTML =
        `<span class="col-name">${escapeHtml(col.name)}</span>` +
        (col.isPrimaryKey ? `<span class="pk-badge">PK</span>` : "") +
        `<span class="col-type">${escapeHtml(col.type)}</span>`;
      columnsEl.appendChild(colEl);
    }

    tableEl.appendChild(header);
    tableEl.appendChild(columnsEl);
    els.schemaExplorer.appendChild(tableEl);
  }
}

async function loadSchema() {
  try {
    const schema = await api.schema();
    renderSchema(schema);
  } catch (error) {
    els.schemaExplorer.innerHTML = `<p class="empty-state">Failed to load schema.</p>`;
  }
}

/* ── SQL editor ─────────────────────────────────────── */

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE",
  "CREATE", "TABLE", "DROP", "ALTER", "ADD", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER",
  "ON", "GROUP", "BY", "ORDER", "HAVING", "LIMIT", "OFFSET", "AS", "AND", "OR", "NOT",
  "NULL", "IS", "IN", "BETWEEN", "LIKE", "DISTINCT", "UNION", "ALL", "EXISTS",
  "COUNT", "SUM", "AVG", "MIN", "MAX", "CASE", "WHEN", "THEN", "ELSE", "END",
  "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "UNIQUE", "INDEX", "DEFAULT", "CASCADE",
  "INCREMENT", "IF", "WITH", "ASC", "DESCRIBE",
];

function highlightSql(code) {
  let escaped = escapeHtml(code);

  const pattern = new RegExp(
    `(\\-\\-[^\\n]*)|('(?:[^'\\\\]|\\\\.)*')|(\\b\\d+(?:\\.\\d+)?\\b)|\\b(${SQL_KEYWORDS.join("|")})\\b`,
    "gi",
  );

  escaped = escaped.replace(pattern, (match, comment, str, num, keyword) => {
    if (comment) return `<span class="tok-comment">${comment}</span>`;
    if (str) return `<span class="tok-string">${str}</span>`;
    if (num) return `<span class="tok-number">${num}</span>`;
    if (keyword) return `<span class="tok-keyword">${keyword}</span>`;
    return match;
  });

  return escaped + "\n";
}

function syncEditor() {
  els.highlight.innerHTML = highlightSql(els.editor.value);
  els.highlightPre.scrollTop = els.editor.scrollTop;
  els.highlightPre.scrollLeft = els.editor.scrollLeft;
}

function insertTab() {
  const start = els.editor.selectionStart;
  const end = els.editor.selectionEnd;
  els.editor.value = els.editor.value.slice(0, start) + "  " + els.editor.value.slice(end);
  els.editor.selectionStart = els.editor.selectionEnd = start + 2;
  syncEditor();
}

/* ── Query execution ────────────────────────────────── */

async function runQuery() {
  const sql = els.editor.value.trim();
  if (!sql) return;

  els.resultsMeta.textContent = "Running…";
  els.resultsContainer.innerHTML = `<p class="empty-state">Executing…</p>`;

  const outcome = await api.query(sql);

  if (outcome.success) {
    renderResults(outcome.result, outcome.message);
  } else {
    renderError(outcome.error);
  }
}

function renderResults(result, message) {
  if (!result || result.rows.length === 0) {
    els.resultsMeta.textContent = message || "0 rows";
    els.resultsContainer.innerHTML = `<p class="result-success">${escapeHtml(message || "Query executed successfully.")}</p>`;
    return;
  }

  const table = document.createElement("table");
  table.className = "results-table";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  for (const column of result.columns) {
    const th = document.createElement("th");
    th.textContent = column;
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const row of result.rows) {
    const tr = document.createElement("tr");
    for (const column of result.columns) {
      const td = document.createElement("td");
      const value = row[column];
      if (value === null || value === undefined) {
        td.textContent = "NULL";
        td.className = "null";
      } else {
        td.textContent = String(value);
        td.title = String(value);
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  els.resultsMeta.textContent = message || `${result.rowCount} row(s)`;
  els.resultsContainer.innerHTML = "";
  els.resultsContainer.appendChild(table);
}

function renderError(error) {
  els.resultsMeta.textContent = "Error";
  const div = document.createElement("div");
  div.className = "result-error";
  div.textContent = error || "Unknown error";
  els.resultsContainer.innerHTML = "";
  els.resultsContainer.appendChild(div);
}

/* ── Terminal ───────────────────────────────────────── */

function termLine(text, className) {
  const p = document.createElement("p");
  p.className = `term-line ${className || ""}`;
  p.textContent = text;
  els.terminalOutput.appendChild(p);
  els.terminalOutput.scrollTop = els.terminalOutput.scrollHeight;
}

async function runTerminal() {
  const input = els.terminalInput.value;
  els.terminalInput.value = "";
  termLine(`> ${input}`, "term-cmd");

  if (!input.trim()) return;

  if (input.trim() === "\\clear") {
    els.terminalOutput.innerHTML = "";
    return;
  }

  const outcome = await api.command(input);

  if (outcome.success) {
    if (outcome.message === "__CLEAR__") {
      els.terminalOutput.innerHTML = "";
      return;
    }
    termLine(outcome.message || "OK", "term-success");
  } else {
    termLine(outcome.error || "Unknown error", "term-error");
  }
}

/* ── Utilities ──────────────────────────────────────── */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── Wiring ─────────────────────────────────────────── */

els.btnConnect.addEventListener("click", async () => {
  setStatus(await api.connect());
  loadSchema();
});

els.btnDisconnect.addEventListener("click", async () => {
  setStatus(await api.disconnect());
});

els.btnRefreshSchema.addEventListener("click", loadSchema);

els.btnRun.addEventListener("click", runQuery);

els.editor.addEventListener("input", syncEditor);
els.editor.addEventListener("scroll", () => {
  els.highlightPre.scrollTop = els.editor.scrollTop;
  els.highlightPre.scrollLeft = els.editor.scrollLeft;
});

els.editor.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    event.preventDefault();
    insertTab();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    runQuery();
  }
});

els.terminalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  runTerminal();
});

/* ── Init ───────────────────────────────────────────── */

refreshStatus();
syncEditor();
