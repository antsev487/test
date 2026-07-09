/* Coach Toolkit V4 Clean Rebuild */
(() => {
  "use strict";

  const BUILD = "v4clean1";
  const POSITIONS = ["GK","RB","RCB","CB","LCB","LB","RWB","LWB","CDM","RCM","CM","LCM","CAM","RW","LW","ST"];
  const BENCH_COUNT = 7;

  const FORMATIONS = {
    "4-3-3": [
      ["GK",50,92],["RB",82,74],["RCB",61,74],["LCB",39,74],["LB",18,74],
      ["RCM",64,52],["CM",50,49],["LCM",36,52],
      ["RW",80,26],["ST",50,20],["LW",20,26]
    ],
    "4-2-3-1": [
      ["GK",50,92],["RB",82,74],["RCB",61,74],["LCB",39,74],["LB",18,74],
      ["RDM",60,56],["LDM",40,56],["RW",78,36],["CAM",50,34],["LW",22,36],["ST",50,18]
    ],
    "4-4-2": [
      ["GK",50,92],["RB",82,74],["RCB",61,74],["LCB",39,74],["LB",18,74],
      ["RM",80,50],["RCM",60,50],["LCM",40,50],["LM",20,50],["RST",58,22],["LST",42,22]
    ],
    "3-4-3": [
      ["GK",50,92],["RCB",66,74],["CB",50,76],["LCB",34,74],
      ["RWB",82,52],["RCM",59,52],["LCM",41,52],["LWB",18,52],
      ["RW",78,25],["ST",50,18],["LW",22,25]
    ],
    "3-5-2": [
      ["GK",50,92],["RCB",66,74],["CB",50,76],["LCB",34,74],
      ["RWB",84,52],["RCM",62,52],["CM",50,48],["LCM",38,52],["LWB",16,52],
      ["RST",58,20],["LST",42,20]
    ],
    "3-4-2-1": [
      ["GK",50,92],["RCB",66,74],["CB",50,76],["LCB",34,74],
      ["RWB",82,52],["RCM",59,52],["LCM",41,52],["LWB",18,52],
      ["RAM",60,32],["LAM",40,32],["ST",50,17]
    ],
    "4-1-4-1": [
      ["GK",50,92],["RB",82,74],["RCB",61,74],["LCB",39,74],["LB",18,74],
      ["CDM",50,58],["RM",80,42],["RCM",60,42],["LCM",40,42],["LM",20,42],["ST",50,18]
    ],
    "5-3-2": [
      ["GK",50,92],["RWB",86,70],["RCB",66,76],["CB",50,78],["LCB",34,76],["LWB",14,70],
      ["RCM",62,50],["CM",50,48],["LCM",38,50],["RST",58,20],["LST",42,20]
    ]
  };

  const state = {
    sb: null,
    user: null,
    profile: null,
    players: [],
    sessions: [],
    attendance: [],
    ratings: [],
    lineups: [],
    liveMatches: [],
    reports: [],
    currentLineup: {},
    activePosition: null,
    moveSource: null,
    dragSource: null,
    live: null,
    timer: null
  };

  const $ = (id) => document.getElementById(id);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const escapeHtml = (value = "") => String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

  const today = () => new Date().toISOString().slice(0,10);
  const playerName = (id) => {
    const p = state.players.find(x => x.id === id);
    return p ? `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Unnamed player" : "Unknown player";
  };
  const playerPositions = (p) => {
    if (Array.isArray(p.positions) && p.positions.length) return p.positions.join(", ");
    if (p.position) return p.position;
    return "No position";
  };
  const formationPositions = (formation) => (FORMATIONS[formation] || []).map(([pos]) => pos);

  function toast(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.remove("hidden");
    setTimeout(() => el.classList.add("hidden"), 2400);
  }

  function scrollToLoginPanel(focusPassword = false) {
    const panel = $("loginPanel");
    if (panel) panel.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      const target = focusPassword ? $("authPassword") : $("authEmail");
      if (target) target.focus();
    }, 350);
  }

  function setMessage(id, message) {
    const el = $(id);
    if (el) el.textContent = message || "";
  }

  function showAuth() {
    $("authView").classList.remove("hidden");
    $("appView").classList.add("hidden");
    $("logoutBtn").classList.add("hidden");
    if ($("topLoginBtn")) $("topLoginBtn").classList.remove("hidden");
    $("userEmail").textContent = "";
  }

  function showApp() {
    $("authView").classList.add("hidden");
    $("appView").classList.remove("hidden");
    $("logoutBtn").classList.remove("hidden");
    if ($("topLoginBtn")) $("topLoginBtn").classList.add("hidden");
    $("userEmail").textContent = state.user?.email || "";
  }

  function requireUser() {
    if (!state.user) {
      toast("Please login first.");
      return false;
    }
    return true;
  }

  function initSupabase() {
    const url =
      window.SUPABASE_URL ||
      (typeof SUPABASE_URL !== "undefined" ? SUPABASE_URL : null) ||
      window.supabaseUrl ||
      window.SUPABASE_PROJECT_URL ||
      null;

    const key =
      window.SUPABASE_ANON_KEY ||
      (typeof SUPABASE_ANON_KEY !== "undefined" ? SUPABASE_ANON_KEY : null) ||
      window.supabaseAnonKey ||
      window.SUPABASE_KEY ||
      null;

    if (!url || !key || !window.supabase) {
      setMessage("authMsg", "Supabase config not found. Keep config.js in the GitHub root and make sure it has SUPABASE_URL and SUPABASE_ANON_KEY.");
      console.warn("Coach Toolkit config check", {
        hasWindowUrl: Boolean(window.SUPABASE_URL),
        hasLexicalUrl: typeof SUPABASE_URL !== "undefined",
        hasWindowKey: Boolean(window.SUPABASE_ANON_KEY),
        hasLexicalKey: typeof SUPABASE_ANON_KEY !== "undefined",
        hasSupabaseLibrary: Boolean(window.supabase)
      });
      return false;
    }

    state.sb = window.supabase.createClient(url, key);
    return true;
  }

  async function safeQuery(label, promise) {
    const { data, error } = await promise;
    if (error) {
      console.warn(`${label}:`, error.message);
      toast(`${label}: ${error.message}`);
      return null;
    }
    return data;
  }

  function populateStaticOptions() {
    $("playerPositions").innerHTML = POSITIONS.map(p => `<option value="${p}">${p}</option>`).join("");
    $("formationSelect").innerHTML = Object.keys(FORMATIONS).map(f => `<option value="${f}">${f}</option>`).join("");
    ["sessionDate","attendanceDate","ratingDate","lineupDate","reportDate"].forEach(id => {
      const el = $(id);
      if (el && !el.value) el.value = today();
    });
  }

  async function init() {
    populateStaticOptions();
    bindEvents();

    if (!initSupabase()) {
      showAuth();
      return;
    }

    const { data } = await state.sb.auth.getSession();
    state.user = data?.session?.user || null;

    state.sb.auth.onAuthStateChange(async (_event, session) => {
      state.user = session?.user || null;
      if (state.user) {
        showApp();
        await loadAll();
      } else {
        showAuth();
      }
    });

    if (state.user) {
      showApp();
      await loadAll();
    } else {
      showAuth();
    }
  }

  function bindEvents() {
    $("loginBtn").addEventListener("click", login);
    $("signupBtn").addEventListener("click", signup);
    if ($("topLoginBtn")) $("topLoginBtn").addEventListener("click", () => scrollToLoginPanel());
    if ($("heroLoginBtn")) $("heroLoginBtn").addEventListener("click", () => scrollToLoginPanel());
    if ($("heroCreateBtn")) $("heroCreateBtn").addEventListener("click", () => scrollToLoginPanel());
    $("logoutBtn").addEventListener("click", logout);
    $("saveProfileBtn").addEventListener("click", saveProfile);
    $("addPlayerBtn").addEventListener("click", addPlayer);
    $("saveSessionBtn").addEventListener("click", saveSession);
    $("attendanceSession").addEventListener("change", renderAttendanceForm);
    $("saveAttendanceBtn").addEventListener("click", saveAttendance);
    $("saveRatingsBtn").addEventListener("click", saveRatings);
    $("formationSelect").addEventListener("change", () => {
      state.currentLineup = {};
      state.moveSource = null;
      renderPitch();
      renderBench();
    });
    $("saveLineupBtn").addEventListener("click", saveLineup);
    $("loadLiveLineupBtn").addEventListener("click", loadLiveLineup);
    $("startLiveBtn").addEventListener("click", startLive);
    $("pauseLiveBtn").addEventListener("click", pauseLive);
    $("halfTimeBtn").addEventListener("click", () => setLiveStatus("half_time"));
    $("secondHalfBtn").addEventListener("click", () => setLiveStatus("second_half"));
    $("fullTimeBtn").addEventListener("click", fullTime);
    $("addSubBtn").addEventListener("click", addSubstitution);
    $("addEventBtn").addEventListener("click", addLiveEvent);
    $("saveLiveMatchBtn").addEventListener("click", saveLiveMatch);
    $("saveReportBtn").addEventListener("click", saveReport);

    $("assignPickerBtn").addEventListener("click", assignPickedPlayer);
    $("movePickerBtn").addEventListener("click", startMoveMode);
    $("clearPickerBtn").addEventListener("click", clearPickedPlayer);
    $("closePickerBtn").addEventListener("click", closePicker);

    $$(".tab").forEach(btn => {
      btn.addEventListener("click", () => {
        $$(".tab").forEach(b => b.classList.remove("active"));
        $$(".view").forEach(v => v.classList.remove("active"));
        btn.classList.add("active");
        $(btn.dataset.tab).classList.add("active");
      });
    });

    $("pitch").addEventListener("click", handlePitchClick);
    $("pitch").addEventListener("dragstart", handleDragStart);
    $("pitch").addEventListener("dragover", e => e.preventDefault());
    $("pitch").addEventListener("drop", handleDrop);
    $("pitch").addEventListener("dragend", () => { state.dragSource = null; });
    $("benchList").addEventListener("change", renderBench);
  }

  async function signup() {
    const email = $("authEmail").value.trim();
    const password = $("authPassword").value;
    const { error } = await state.sb.auth.signUp({ email, password });
    setMessage("authMsg", error ? error.message : "Account created. Check email confirmation if enabled.");
  }

  async function login() {
    const email = $("authEmail").value.trim();
    const password = $("authPassword").value;
    const { error } = await state.sb.auth.signInWithPassword({ email, password });
    setMessage("authMsg", error ? error.message : "");
  }

  async function logout() {
    stopTimer();
    await state.sb.auth.signOut();
    showAuth();
  }

  async function loadAll() {
    if (!requireUser()) return;
    await Promise.all([
      loadProfile(),
      fetchPlayers(),
      fetchSessions(),
      fetchAttendance(),
      fetchRatings(),
      fetchLineups(),
      fetchLiveMatches(),
      fetchReports()
    ]);
    renderAll();
  }

  function renderAll() {
    renderProfile();
    renderDashboard();
    renderPlayers();
    renderSessions();
    renderAttendanceOptions();
    renderAttendanceForm();
    renderAttendanceHistory();
    renderRatingsForm();
    renderRatingsHistory();
    renderPitch();
    renderBench();
    renderLineups();
    renderLiveLineupOptions();
    renderLiveMatch();
    renderLiveMatches();
    renderReports();
  }

  async function loadProfile() {
    const data = await safeQuery("Load profile", state.sb.from("profiles").select("*").eq("user_id", state.user.id).maybeSingle());
    state.profile = data;
  }

  function renderProfile() {
    $("coachName").value = state.profile?.coach_name || "";
    $("clubName").value = state.profile?.club || "";
    $("ageGroup").value = state.profile?.age_group || "";
  }

  async function saveProfile() {
    if (!requireUser()) return;
    const payload = {
      user_id: state.user.id,
      coach_name: $("coachName").value.trim(),
      club: $("clubName").value.trim(),
      age_group: $("ageGroup").value.trim()
    };
    const data = await safeQuery("Save profile", state.sb.from("profiles").upsert(payload, { onConflict: "user_id" }).select().single());
    if (data) {
      state.profile = data;
      toast("Profile saved.");
    }
  }

  async function fetchPlayers() {
    const data = await safeQuery("Load players", state.sb.from("players").select("*").eq("user_id", state.user.id).order("created_at", { ascending: true }));
    state.players = data || [];
  }

  async function addPlayer() {
    if (!requireUser()) return;
    const first = $("playerFirst").value.trim();
    const last = $("playerLast").value.trim();
    const positions = [...$("playerPositions").selectedOptions].map(o => o.value);
    if (!first && !last) return toast("Enter a player name.");

    const payload = { user_id: state.user.id, first_name: first, last_name: last, positions };
    const data = await safeQuery("Add player", state.sb.from("players").insert(payload).select().single());
    if (data) {
      $("playerFirst").value = "";
      $("playerLast").value = "";
      [...$("playerPositions").options].forEach(o => o.selected = false);
      await fetchPlayers();
      renderAll();
      toast("Player added.");
    }
  }

  async function deleteById(table, id) {
    if (!confirm("Delete this item?")) return;
    const data = await safeQuery("Delete", state.sb.from(table).delete().eq("id", id).eq("user_id", state.user.id));
    await loadAll();
  }

  function playerStats(playerId) {
    const att = state.attendance.filter(a => a.player_id === playerId);
    const present = att.filter(a => a.present).length;
    const ratingRows = state.ratings.filter(r => r.player_id === playerId && Number(r.score));
    const avg = ratingRows.length ? (ratingRows.reduce((s,r) => s + Number(r.score), 0) / ratingRows.length).toFixed(1) : "-";
    return { present, total: att.length, avg };
  }

  function renderPlayers() {
    $("playersList").innerHTML = state.players.length ? state.players.map(p => {
      const stats = playerStats(p.id);
      return `<div class="item">
        <div class="item-row">
          <div>
            <strong>${escapeHtml(playerName(p.id))}</strong>
            <div class="badges"><span class="badge">${escapeHtml(playerPositions(p))}</span></div>
            <p class="muted">Attendance: ${stats.present}/${stats.total} · Avg rating: ${stats.avg}</p>
          </div>
          <button class="danger" data-delete-table="players" data-delete-id="${p.id}" type="button">Delete</button>
        </div>
      </div>`;
    }).join("") : `<p class="muted">No players yet.</p>`;

    $$("[data-delete-table]").forEach(btn => {
      btn.onclick = () => deleteById(btn.dataset.deleteTable, btn.dataset.deleteId);
    });
  }

  async function saveSession() {
    if (!requireUser()) return;
    const title = $("sessionTitle").value.trim();
    if (!title) return toast("Enter a session name.");
    const payload = {
      user_id: state.user.id,
      title,
      session_date: $("sessionDate").value || null,
      duration: $("sessionDuration").value.trim(),
      objective: $("sessionObjective").value.trim(),
      setup: $("sessionSetup").value.trim(),
      coach_points: $("sessionCoachPoints").value.trim()
    };
    const data = await safeQuery("Save session", state.sb.from("sessions").insert(payload).select().single());
    if (data) {
      ["sessionTitle","sessionDuration","sessionObjective","sessionSetup","sessionCoachPoints"].forEach(id => $(id).value = "");
      await fetchSessions();
      renderAll();
      toast("Session saved.");
    }
  }

  async function fetchSessions() {
    const data = await safeQuery("Load sessions", state.sb.from("sessions").select("*").eq("user_id", state.user.id).order("session_date", { ascending: false }));
    state.sessions = data || [];
  }

  function renderSessions() {
    $("sessionsList").innerHTML = state.sessions.length ? state.sessions.map(s => `
      <div class="item">
        <div class="item-row">
          <div>
            <strong>${escapeHtml(s.title)}</strong>
            <p class="muted">${s.session_date || ""} · ${escapeHtml(s.duration || "")}</p>
            ${s.objective ? `<p>${escapeHtml(s.objective)}</p>` : ""}
          </div>
          <button class="danger" data-delete-table="sessions" data-delete-id="${s.id}" type="button">Delete</button>
        </div>
      </div>`).join("") : `<p class="muted">No sessions saved yet.</p>`;
    $$("[data-delete-table='sessions']").forEach(btn => btn.onclick = () => deleteById("sessions", btn.dataset.deleteId));
  }

  function renderAttendanceOptions() {
    $("attendanceSession").innerHTML = `<option value="">Select session</option>` + state.sessions.map(s => `<option value="${s.id}">${escapeHtml(s.session_date || "")} — ${escapeHtml(s.title)}</option>`).join("");
  }

  function renderAttendanceForm() {
    const wrap = $("attendanceForm");
    wrap.innerHTML = state.players.length ? state.players.map(p => `
      <label class="check-row">
        <input type="checkbox" data-att-player="${p.id}" />
        <span>${escapeHtml(playerName(p.id))}</span>
      </label>`).join("") : `<p class="muted">Add players first.</p>`;
  }

  async function saveAttendance() {
    if (!requireUser()) return;
    const date = $("attendanceDate").value || today();
    const session = state.sessions.find(s => s.id === $("attendanceSession").value);
    const note = session ? `Session: ${session.title}` : "Session";
    const rows = $$("[data-att-player]").map(input => ({
      user_id: state.user.id,
      player_id: input.dataset.attPlayer,
      attendance_date: date,
      present: input.checked,
      note
    }));
    if (!rows.length) return toast("No players to mark.");
    const data = await safeQuery("Save attendance", state.sb.from("attendance").insert(rows));
    if (data !== null) {
      await fetchAttendance();
      renderAttendanceHistory();
      renderDashboard();
      toast("Attendance saved.");
    }
  }

  async function fetchAttendance() {
    const data = await safeQuery("Load attendance", state.sb.from("attendance").select("*").eq("user_id", state.user.id).order("attendance_date", { ascending: false }));
    state.attendance = data || [];
  }

  function renderAttendanceHistory() {
    const groups = {};
    state.attendance.forEach(a => {
      const key = `${a.attendance_date || ""} · ${a.note || "Session"}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    $("attendanceHistory").innerHTML = Object.keys(groups).length ? Object.entries(groups).map(([key, rows]) => {
      const present = rows.filter(r => r.present).map(r => playerName(r.player_id));
      const absent = rows.filter(r => !r.present).map(r => playerName(r.player_id));
      return `<div class="item">
        <strong>${escapeHtml(key)}</strong>
        <p><b>Present:</b> ${escapeHtml(present.join(", ") || "None")}</p>
        <p><b>Absent:</b> ${escapeHtml(absent.join(", ") || "None")}</p>
      </div>`;
    }).join("") : `<p class="muted">No attendance yet.</p>`;
  }

  async function fetchRatings() {
    const data = await safeQuery("Load ratings", state.sb.from("player_ratings").select("*").eq("user_id", state.user.id).order("rating_date", { ascending: false }));
    state.ratings = data || [];
  }

  function renderRatingsForm() {
    $("ratingsForm").innerHTML = state.players.length ? state.players.map(p => `
      <div class="rating-row">
        <strong>${escapeHtml(playerName(p.id))}</strong>
        <span class="muted">${escapeHtml(playerPositions(p))}</span>
        <input type="number" min="1" max="10" data-rating-score="${p.id}" placeholder="1-10" />
        <input data-rating-note="${p.id}" placeholder="Note" />
      </div>`).join("") : `<p class="muted">Add players first.</p>`;
  }

  async function saveRatings() {
    const date = $("ratingDate").value || today();
    const context = $("ratingContext").value.trim() || "Rating";
    const rows = state.players.map(p => {
      const score = $(`[data-rating-score="${p.id}"]`)?.value;
      const note = $(`[data-rating-note="${p.id}"]`)?.value || "";
      return score ? { user_id: state.user.id, player_id: p.id, rating_date: date, context, score: Number(score), note } : null;
    }).filter(Boolean);
    if (!rows.length) return toast("Enter at least one rating.");
    const data = await safeQuery("Save ratings", state.sb.from("player_ratings").insert(rows));
    if (data !== null) {
      await fetchRatings();
      renderRatingsForm();
      renderRatingsHistory();
      renderDashboard();
      toast("Ratings saved.");
    }
  }

  function renderRatingsHistory() {
    $("ratingsHistory").innerHTML = state.ratings.length ? state.ratings.slice(0,40).map(r => `
      <div class="item">
        <strong>${escapeHtml(playerName(r.player_id))}: ${r.score}/10</strong>
        <p class="muted">${r.rating_date || ""} · ${escapeHtml(r.context || "")}</p>
        ${r.note ? `<p>${escapeHtml(r.note)}</p>` : ""}
      </div>`).join("") : `<p class="muted">No ratings yet.</p>`;
  }

  function selectedBenchIds() {
    return $$("#benchList select").map(s => s.value).filter(Boolean);
  }

  function starterIds(exceptPosition = "") {
    return new Set(Object.entries(state.currentLineup).filter(([pos,id]) => id && pos !== exceptPosition).map(([,id]) => id));
  }

  function usedPlayerIds(exceptPosition = "") {
    const used = starterIds(exceptPosition);
    selectedBenchIds().forEach(id => used.add(id));
    return used;
  }

  function playerOptions(selected = "", exclude = new Set()) {
    return `<option value="">Select player</option>` + state.players
      .filter(p => p.id === selected || !exclude.has(p.id))
      .map(p => `<option value="${p.id}" ${p.id === selected ? "selected" : ""}>${escapeHtml(playerName(p.id))} — ${escapeHtml(playerPositions(p))}</option>`)
      .join("");
  }

  function renderPitch() {
    const formation = $("formationSelect").value || Object.keys(FORMATIONS)[0];
    const coords = FORMATIONS[formation] || [];
    $("pitch").innerHTML = `<div class="center-circle"></div><div class="box top"></div><div class="box bottom"></div>` + coords.map(([pos,x,y]) => {
      const id = state.currentLineup[pos] || "";
      const assigned = Boolean(id);
      const source = state.moveSource === pos;
      const target = state.moveSource && state.moveSource !== pos;
      return `<button class="node ${assigned ? "assigned" : ""} ${source ? "move-source" : ""} ${target ? "move-target" : ""}"
        type="button" draggable="${assigned}" data-position="${pos}" style="left:${x}%;top:${y}%">
        <span><strong>${escapeHtml(pos)}</strong>${escapeHtml(id ? playerName(id) : (state.moveSource ? "Tap here" : "Tap to assign"))}</span>
      </button>`;
    }).join("");
    updateMoveNotice();
  }

  function updateMoveNotice() {
    const el = $("moveNotice");
    if (!state.moveSource) {
      el.classList.add("hidden");
      el.textContent = "";
      return;
    }
    el.classList.remove("hidden");
    el.textContent = `Move mode: ${playerName(state.currentLineup[state.moveSource])} from ${state.moveSource}. Tap another position to move/swap, or tap the same position to cancel.`;
  }

  function handlePitchClick(e) {
    const node = e.target.closest("[data-position]");
    if (!node) return;
    const pos = node.dataset.position;
    if (state.moveSource) {
      completeMove(pos);
      return;
    }
    openPicker(pos);
  }

  function handleDragStart(e) {
    const node = e.target.closest("[data-position]");
    if (!node) return;
    const pos = node.dataset.position;
    if (!state.currentLineup[pos]) {
      e.preventDefault();
      return;
    }
    state.dragSource = pos;
    e.dataTransfer.setData("text/plain", pos);
  }

  function handleDrop(e) {
    const node = e.target.closest("[data-position]");
    if (!node) return;
    e.preventDefault();
    const target = node.dataset.position;
    const source = e.dataTransfer.getData("text/plain") || state.dragSource;
    if (!source || source === target) return;
    swapOrMove(source, target);
    state.dragSource = null;
  }

  function swapOrMove(source, target) {
    const sourceId = state.currentLineup[source];
    const targetId = state.currentLineup[target];
    if (!sourceId) return;
    state.currentLineup[target] = sourceId;
    if (targetId) state.currentLineup[source] = targetId;
    else delete state.currentLineup[source];
    renderPitch();
  }

  function openPicker(position) {
    state.activePosition = position;
    $("pickerTitle").textContent = `Select player for ${position}`;
    $("pickerSelect").innerHTML = playerOptions(state.currentLineup[position] || "", usedPlayerIds(position));
    $("movePickerBtn").classList.toggle("hidden", !state.currentLineup[position]);
    $("playerPickerModal").classList.remove("hidden");
  }

  function closePicker() {
    $("playerPickerModal").classList.add("hidden");
    state.activePosition = null;
  }

  function assignPickedPlayer() {
    if (!state.activePosition) return;
    const id = $("pickerSelect").value;
    if (id) {
      Object.keys(state.currentLineup).forEach(pos => {
        if (pos !== state.activePosition && state.currentLineup[pos] === id) delete state.currentLineup[pos];
      });
      state.currentLineup[state.activePosition] = id;
    }
    closePicker();
    renderPitch();
    renderBench();
  }

  function startMoveMode() {
    if (!state.activePosition || !state.currentLineup[state.activePosition]) return;
    state.moveSource = state.activePosition;
    closePicker();
    renderPitch();
  }

  function completeMove(target) {
    const source = state.moveSource;
    if (!source) return;
    if (source === target) {
      state.moveSource = null;
      renderPitch();
      return;
    }
    swapOrMove(source, target);
    state.moveSource = null;
    renderPitch();
  }

  function clearPickedPlayer() {
    if (state.activePosition) delete state.currentLineup[state.activePosition];
    closePicker();
    renderPitch();
    renderBench();
  }

  function renderBench() {
    const current = selectedBenchIds();
    const starters = starterIds();
    const deduped = [];
    current.forEach(id => {
      if (id && !starters.has(id) && !deduped.includes(id)) deduped.push(id);
    });
    $("benchList").innerHTML = Array.from({ length: BENCH_COUNT }).map((_, i) => {
      const selected = deduped[i] || "";
      const others = new Set(deduped.filter((id, idx) => id && idx !== i));
      const exclude = new Set([...starters, ...others]);
      return `<label>Bench ${i + 1}<select>${playerOptions(selected, exclude)}</select></label>`;
    }).join("");
  }

  async function saveLineup() {
    const opponent = $("lineupOpponent").value.trim();
    const formation = $("formationSelect").value;
    if (!opponent) return toast("Enter opponent.");
    const lineup = { ...state.currentLineup };
    const bench = selectedBenchIds();

    const starters = Object.values(lineup).filter(Boolean);
    const duplicateStarter = starters.find((id, idx) => starters.indexOf(id) !== idx);
    if (duplicateStarter) return toast(`${playerName(duplicateStarter)} is selected twice.`);
    const duplicateBench = bench.find((id, idx) => bench.indexOf(id) !== idx);
    if (duplicateBench) return toast(`${playerName(duplicateBench)} is on the bench twice.`);
    const starterOnBench = bench.find(id => starters.includes(id));
    if (starterOnBench) return toast(`${playerName(starterOnBench)} is starter and bench.`);

    const payload = {
      user_id: state.user.id,
      opponent,
      match_date: $("lineupDate").value || null,
      formation,
      lineup,
      bench,
      notes: $("lineupNotes").value.trim()
    };
    const data = await safeQuery("Save lineup", state.sb.from("match_day_lineups").insert(payload).select().single());
    if (data) {
      await fetchLineups();
      renderLineups();
      renderLiveLineupOptions();
      toast("Lineup saved.");
    }
  }

  async function fetchLineups() {
    const data = await safeQuery("Load lineups", state.sb.from("match_day_lineups").select("*").eq("user_id", state.user.id).order("created_at", { ascending: false }));
    state.lineups = data || [];
  }

  function orderedLineupText(lineup, formation) {
    const order = formationPositions(formation);
    const obj = lineup || {};
    const ordered = order.filter(pos => obj[pos]).map(pos => `${pos}: ${playerName(obj[pos])}`);
    const extra = Object.keys(obj).filter(pos => !order.includes(pos) && obj[pos]).map(pos => `${pos}: ${playerName(obj[pos])}`);
    return ordered.concat(extra);
  }

  function renderLineups() {
    $("lineupsList").innerHTML = state.lineups.length ? state.lineups.map(l => {
      const starters = orderedLineupText(l.lineup, l.formation);
      const bench = Array.isArray(l.bench) ? l.bench.map(playerName) : [];
      return `<div class="item">
        <div class="item-row">
          <div>
            <strong>${escapeHtml(l.formation || "")} vs ${escapeHtml(l.opponent || "")}</strong>
            <p class="muted">${l.match_date || ""}</p>
          </div>
          <button class="danger" data-delete-table="match_day_lineups" data-delete-id="${l.id}" type="button">Delete</button>
        </div>
        <p><b>Starting XI:</b> ${escapeHtml(starters.join(" | ") || "None")}</p>
        <p><b>Bench:</b> ${escapeHtml(bench.join(", ") || "None")}</p>
      </div>`;
    }).join("") : `<p class="muted">No saved lineups yet.</p>`;
    $$("[data-delete-table='match_day_lineups']").forEach(btn => btn.onclick = () => deleteById("match_day_lineups", btn.dataset.deleteId));
  }

  function renderLiveLineupOptions() {
    const selected = $("liveLineupSelect").value;
    $("liveLineupSelect").innerHTML = `<option value="">Select saved lineup</option>` + state.lineups.map(l => {
      const label = `${l.match_date || "No date"} — ${l.formation || ""} vs ${l.opponent || ""}`;
      return `<option value="${l.id}" ${l.id === selected ? "selected" : ""}>${escapeHtml(label)}</option>`;
    }).join("");
  }

  function createLiveFromLineup(lineup) {
    const status = "not_started";
    const duration_seconds = 0;
    const playerState = {};
    Object.entries(lineup.lineup || {}).forEach(([pos, id]) => {
      playerState[id] = { id, position: pos, onPitch: true, start: 0, end: null };
    });
    (lineup.bench || []).forEach(id => {
      if (!playerState[id]) playerState[id] = { id, position: "Bench", onPitch: false, start: null, end: null };
    });
    return {
      lineup_id: lineup.id,
      opponent: lineup.opponent,
      match_date: lineup.match_date,
      formation: lineup.formation,
      lineup: lineup.lineup || {},
      bench: lineup.bench || [],
      score_for: 0,
      score_against: 0,
      status,
      duration_seconds,
      substitutions: [],
      events: [],
      player_minutes: playerState
    };
  }

  function loadLiveLineup() {
    const lineup = state.lineups.find(l => l.id === $("liveLineupSelect").value);
    if (!lineup) return toast("Select a saved lineup.");
    stopTimer();
    state.live = createLiveFromLineup(lineup);
    $("scoreFor").value = 0;
    $("scoreAgainst").value = 0;
    renderLiveMatch();
    toast("Lineup loaded.");
  }

  function currentMinute() {
    return Math.floor((state.live?.duration_seconds || 0) / 60);
  }

  function formatClock(seconds = 0) {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  function startLive() {
    if (!state.live) return toast("Load a lineup first.");
    state.live.status = state.live.status === "not_started" ? "first_half" : state.live.status;
    stopTimer();
    state.timer = setInterval(() => {
      state.live.duration_seconds += 1;
      renderLiveMatch();
    }, 1000);
    renderLiveMatch();
  }

  function stopTimer() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
  }

  function pauseLive() {
    stopTimer();
    if (state.live) {
      state.live.status = "paused";
      renderLiveMatch();
    }
  }

  function setLiveStatus(status) {
    if (!state.live) return toast("Load a lineup first.");
    stopTimer();
    state.live.status = status;
    renderLiveMatch();
  }

  function fullTime() {
    if (!state.live) return toast("Load a lineup first.");
    stopTimer();
    state.live.status = "full_time";
    const min = currentMinute();
    Object.values(state.live.player_minutes).forEach(p => {
      if (p.onPitch && p.end === null) {
        p.end = min;
        p.onPitch = false;
      }
    });
    renderLiveMatch();
  }

  function playerMinuteTotal(record) {
    const min = currentMinute();
    if (record.start === null || record.start === undefined) return 0;
    const end = record.end === null || record.end === undefined ? min : record.end;
    return Math.max(0, end - record.start);
  }

  function livePlayerOptions(filter) {
    if (!state.live) return `<option value="">No live match</option>`;
    const records = Object.values(state.live.player_minutes || {});
    return `<option value="">Select player</option>` + records
      .filter(r => filter ? filter(r) : true)
      .map(r => `<option value="${r.id}">${escapeHtml(playerName(r.id))} — ${escapeHtml(r.position || "")}</option>`)
      .join("");
  }

  function renderLiveMatch() {
    if (!state.live) {
      $("liveClock").textContent = "00:00";
      $("liveStatus").textContent = "Not started";
      $("liveSummary").innerHTML = `<p class="muted">Load a saved lineup to start.</p>`;
      $("subOff").innerHTML = `<option value="">Load lineup first</option>`;
      $("subOn").innerHTML = `<option value="">Load lineup first</option>`;
      $("eventPlayer").innerHTML = `<option value="">No player</option>`;
      return;
    }

    state.live.score_for = Number($("scoreFor").value || state.live.score_for || 0);
    state.live.score_against = Number($("scoreAgainst").value || state.live.score_against || 0);

    $("liveClock").textContent = formatClock(state.live.duration_seconds);
    $("liveStatus").textContent = state.live.status.replaceAll("_"," ");
    $("subMinute").value = currentMinute();
    $("eventMinute").value = currentMinute();
    $("subOff").innerHTML = livePlayerOptions(r => r.onPitch);
    $("subOn").innerHTML = livePlayerOptions(r => !r.onPitch);
    $("eventPlayer").innerHTML = `<option value="">No player</option>` + livePlayerOptions().replace(`<option value="">Select player</option>`, "");

    const records = Object.values(state.live.player_minutes || {});
    const active = records.filter(r => r.onPitch);
    const all = records.sort((a,b) => playerName(a.id).localeCompare(playerName(b.id)));

    $("liveSummary").innerHTML = `
      <div class="item">
        <strong>${escapeHtml(state.live.opponent || "Opponent")} · ${state.live.score_for}-${state.live.score_against}</strong>
        <p class="muted">${escapeHtml(state.live.formation || "")} · Minute ${currentMinute()}</p>
      </div>
      <h3>On Pitch (${active.length})</h3>
      ${active.map(r => `<div class="live-player"><span>${escapeHtml(playerName(r.id))} <span class="muted">(${escapeHtml(r.position)})</span></span><strong>${playerMinuteTotal(r)} min</strong></div>`).join("") || `<p class="muted">No active players.</p>`}
      <h3>Minutes</h3>
      ${all.map(r => `<div class="live-player"><span>${escapeHtml(playerName(r.id))}</span><strong>${playerMinuteTotal(r)} min</strong></div>`).join("")}
      <h3>Substitutions</h3>
      <div class="timeline">${(state.live.substitutions || []).map(s => `<div class="item">${s.minute}' ${escapeHtml(playerName(s.off))} off → ${escapeHtml(playerName(s.on))} on</div>`).join("") || `<p class="muted">No substitutions yet.</p>`}</div>
      <h3>Events</h3>
      <div class="timeline">${(state.live.events || []).map(ev => `<div class="item">${ev.minute}' <b>${escapeHtml(ev.type)}</b> ${ev.player ? escapeHtml(playerName(ev.player)) : ""} ${ev.note ? `· ${escapeHtml(ev.note)}` : ""}</div>`).join("") || `<p class="muted">No events yet.</p>`}</div>
    `;
  }

  function addSubstitution() {
    if (!state.live) return toast("Load a lineup first.");
    const off = $("subOff").value;
    const on = $("subOn").value;
    const minute = Number($("subMinute").value || currentMinute());
    if (!off || !on) return toast("Select off and on players.");
    if (off === on) return toast("Off and on cannot be same player.");

    const offRec = state.live.player_minutes[off];
    const onRec = state.live.player_minutes[on];
    if (!offRec || !onRec) return toast("Invalid substitution.");

    offRec.onPitch = false;
    offRec.end = minute;
    onRec.onPitch = true;
    onRec.start = minute;
    onRec.end = null;
    state.live.substitutions.push({ off, on, minute });
    renderLiveMatch();
  }

  function addLiveEvent() {
    if (!state.live) return toast("Load a lineup first.");
    state.live.events.push({
      type: $("eventType").value,
      player: $("eventPlayer").value || null,
      minute: Number($("eventMinute").value || currentMinute()),
      note: $("eventNote").value.trim()
    });
    $("eventNote").value = "";
    renderLiveMatch();
  }

  async function saveLiveMatch() {
    if (!state.live) return toast("Load a lineup first.");
    const payload = {
      user_id: state.user.id,
      lineup_id: state.live.lineup_id,
      opponent: state.live.opponent || "Opponent",
      match_date: state.live.match_date || today(),
      formation: state.live.formation,
      lineup: state.live.lineup || {},
      bench: state.live.bench || [],
      score_for: Number($("scoreFor").value || 0),
      score_against: Number($("scoreAgainst").value || 0),
      status: state.live.status,
      duration_seconds: state.live.duration_seconds || 0,
      substitutions: state.live.substitutions || [],
      events: state.live.events || [],
      player_minutes: state.live.player_minutes || {}
    };
    const data = await safeQuery("Save live match", state.sb.from("live_matches").insert(payload).select().single());
    if (data) {
      await fetchLiveMatches();
      renderLiveMatches();
      renderDashboard();
      toast("Live match saved.");
    }
  }

  async function fetchLiveMatches() {
    const data = await safeQuery("Load live matches", state.sb.from("live_matches").select("*").eq("user_id", state.user.id).order("created_at", { ascending: false }));
    state.liveMatches = data || [];
  }

  function renderLiveMatches() {
    $("liveMatchesList").innerHTML = state.liveMatches.length ? state.liveMatches.map(m => `
      <div class="item">
        <strong>${escapeHtml(m.opponent || "Opponent")} · ${m.score_for ?? 0}-${m.score_against ?? 0}</strong>
        <p class="muted">${m.match_date || ""} · ${escapeHtml(m.formation || "")} · ${formatClock(m.duration_seconds || 0)}</p>
        <p>Subs: ${(m.substitutions || []).length} · Events: ${(m.events || []).length}</p>
      </div>`).join("") : `<p class="muted">No saved live matches yet.</p>`;
  }

  async function saveReport() {
    const opponent = $("reportOpponent").value.trim();
    if (!opponent) return toast("Enter opponent.");
    const payload = {
      user_id: state.user.id,
      opponent,
      match_date: $("reportDate").value || null,
      score: $("reportScore").value.trim(),
      positives: $("reportPositives").value.trim(),
      improvements: $("reportImprovements").value.trim(),
      summary: $("reportSummary").value.trim()
    };
    const data = await safeQuery("Save report", state.sb.from("match_reports").insert(payload).select().single());
    if (data) {
      await fetchReports();
      renderReports();
      renderDashboard();
      toast("Report saved.");
    }
  }

  async function fetchReports() {
    const data = await safeQuery("Load reports", state.sb.from("match_reports").select("*").eq("user_id", state.user.id).order("match_date", { ascending: false }));
    state.reports = data || [];
  }

  function renderReports() {
    $("reportsList").innerHTML = state.reports.length ? state.reports.map(r => `
      <div class="item">
        <div class="item-row">
          <div>
            <strong>${escapeHtml(r.opponent)} · ${escapeHtml(r.score || "")}</strong>
            <p class="muted">${r.match_date || ""}</p>
            ${r.summary ? `<p>${escapeHtml(r.summary)}</p>` : ""}
          </div>
          <button class="danger" data-delete-table="match_reports" data-delete-id="${r.id}" type="button">Delete</button>
        </div>
      </div>`).join("") : `<p class="muted">No reports yet.</p>`;
    $$("[data-delete-table='match_reports']").forEach(btn => btn.onclick = () => deleteById("match_reports", btn.dataset.deleteId));
  }

  function renderDashboard() {
    $("countPlayers").textContent = state.players.length;
    $("countSessions").textContent = state.sessions.length;
    $("countLineups").textContent = state.lineups.length;
    $("countLive").textContent = state.liveMatches.length;
  }

  document.addEventListener("DOMContentLoaded", init);

  // Deliberately expose only for debugging in browser console.
  window.CoachToolkitV4 = { state, BUILD };
})();
