const $ = (id) => document.getElementById(id);
const today = () => new Date().toISOString().slice(0, 10);

let sb = null;
let currentUser = null;
let players = [];
let sessions = [];
let attendanceRows = [];
let ratingRows = [];
let matches = [];

function isConfigured() {
  return (
    typeof SUPABASE_URL === "string" &&
    typeof SUPABASE_ANON_KEY === "string" &&
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("PASTE_") &&
    !SUPABASE_ANON_KEY.includes("PASTE_")
  );
}

function msg(text) {
  $("authMessage").textContent = text || "";
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setDefaults() {
  ["sessionDate", "attendanceDate", "ratingsDate", "matchDate"].forEach((id) => {
    const el = $(id);
    if (el && !el.value) el.value = today();
  });
}

function showApp() {
  $("authView").classList.add("hidden");
  $("appView").classList.remove("hidden");
  $("logoutBtn").classList.remove("hidden");
}

function showAuth() {
  $("authView").classList.remove("hidden");
  $("appView").classList.add("hidden");
  $("logoutBtn").classList.add("hidden");
}

function setLoading(buttonId, isLoading, textWhenLoading = "Saving...") {
  const btn = $(buttonId);
  if (!btn) return;
  if (isLoading) {
    btn.dataset.originalText = btn.textContent;
    btn.textContent = textWhenLoading;
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.originalText || btn.textContent;
    btn.disabled = false;
  }
}

function requireUser() {
  if (!currentUser) {
    alert("Please log in first.");
    return false;
  }
  return true;
}

async function init() {
  setDefaults();

  if (!isConfigured()) {
    $("setupWarning").classList.remove("hidden");
    ["signUpBtn", "loginBtn"].forEach((id) => ($(id).disabled = true));
    msg("Backend is not configured yet. Paste your Supabase values into config.js.");
    return;
  }

  sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data } = await sb.auth.getSession();
  currentUser = data.session?.user || null;

  sb.auth.onAuthStateChange(async (_event, session) => {
    currentUser = session?.user || null;
    if (currentUser) {
      showApp();
      await loadAll();
    } else {
      showAuth();
    }
  });

  if (currentUser) {
    showApp();
    await loadAll();
  } else {
    showAuth();
  }
}

async function signUp() {
  if (!sb) return;
  const email = $("email").value.trim();
  const password = $("password").value.trim();

  if (!email || !password) return msg("Enter email and password.");
  if (password.length < 6) return msg("Password must be at least 6 characters.");

  setLoading("signUpBtn", true, "Creating...");
  const { data, error } = await sb.auth.signUp({ email, password });
  setLoading("signUpBtn", false);

  if (error) return msg(error.message);

  if (data.session?.user) {
    currentUser = data.session.user;
    msg("");
    showApp();
    await loadAll();
  } else {
    msg("Account created. Check your email to confirm, then log in. For MVP testing, you can disable email confirmation in Supabase Auth settings.");
  }
}

async function login() {
  if (!sb) return;
  const email = $("email").value.trim();
  const password = $("password").value.trim();

  if (!email || !password) return msg("Enter email and password.");

  setLoading("loginBtn", true, "Logging in...");
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  setLoading("loginBtn", false);

  if (error) return msg(error.message);

  currentUser = data.user;
  msg("");
  showApp();
  await loadAll();
}

async function logout() {
  if (!sb) return;
  await sb.auth.signOut();
  currentUser = null;
  showAuth();
}

async function saveProfile() {
  if (!requireUser()) return;

  const payload = {
    user_id: currentUser.id,
    coach_name: $("coachName").value.trim(),
    club: $("coachClub").value.trim(),
    age_group: $("coachAgeGroup").value.trim(),
  };

  setLoading("saveProfileBtn", true);
  const { error } = await sb.from("profiles").upsert(payload, { onConflict: "user_id" });
  setLoading("saveProfileBtn", false);

  if (error) return alert(error.message);
  await loadProfile();
  alert("Profile saved.");
}

async function loadProfile() {
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (error) return console.error(error);

  $("coachName").value = data?.coach_name || "";
  $("coachClub").value = data?.club || "";
  $("coachAgeGroup").value = data?.age_group || "";
  $("welcomeTitle").textContent = data?.coach_name ? `Welcome, ${data.coach_name}` : "Welcome coach";
}

async function addPlayer() {
  if (!requireUser()) return;

  const first = $("playerFirst").value.trim();
  const last = $("playerLast").value.trim();
  if (!first && !last) return alert("Add at least a first name or surname.");

  const payload = {
    user_id: currentUser.id,
    first_name: first,
    last_name: last,
    position: $("playerPosition").value.trim(),
    dominant_foot: $("playerFoot").value,
    dob: $("playerDob").value || null,
  };

  setLoading("addPlayerBtn", true, "Adding...");
  const { error } = await sb.from("players").insert(payload);
  setLoading("addPlayerBtn", false);

  if (error) return alert(error.message);

  ["playerFirst", "playerLast", "playerPosition", "playerDob"].forEach((id) => ($(id).value = ""));
  $("playerFoot").value = "";
  await loadPlayers();
  await loadCounts();
}

async function deleteRow(table, id) {
  if (!requireUser()) return;
  if (!confirm("Delete this item?")) return;

  const { error } = await sb.from(table).delete().eq("id", id).eq("user_id", currentUser.id);
  if (error) return alert(error.message);

  await loadAll();
}

async function loadPlayers() {
  const { data, error } = await sb
    .from("players")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) return console.error(error);
  players = data || [];

  $("playersList").innerHTML =
    players
      .map(
        (p) => `
    <div class="item">
      <div class="item-row">
        <div>
          <strong>${escapeHtml(`${p.first_name || ""} ${p.last_name || ""}`.trim())}</strong>
          <small>${escapeHtml(p.position || "No position")} • ${escapeHtml(p.dominant_foot || "Foot not set")} ${p.dob ? "• DOB " + p.dob : ""}</small>
        </div>
        <button class="danger" onclick="deleteRow('players','${p.id}')">Delete</button>
      </div>
    </div>
  `
      )
      .join("") || `<p class="muted">No players added yet.</p>`;

  renderAttendance();
  renderRatings();
}

async function saveSession() {
  if (!requireUser()) return;

  const title = $("sessionTitle").value.trim();
  if (!title) return alert("Session title required.");

  const payload = {
    user_id: currentUser.id,
    title,
    session_date: $("sessionDate").value || today(),
    duration: $("sessionDuration").value.trim(),
    objective: $("sessionObjective").value.trim(),
    setup: $("sessionSetup").value.trim(),
    coach_points: $("sessionCoachPoints").value.trim(),
  };

  setLoading("saveSessionBtn", true);
  const { error } = await sb.from("sessions").insert(payload);
  setLoading("saveSessionBtn", false);

  if (error) return alert(error.message);

  ["sessionTitle", "sessionDuration", "sessionObjective", "sessionSetup", "sessionCoachPoints"].forEach((id) => ($(id).value = ""));
  await loadSessions();
  await loadCounts();
}

async function loadSessions() {
  const { data, error } = await sb
    .from("sessions")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("session_date", { ascending: false });

  if (error) return console.error(error);
  sessions = data || [];

  $("sessionsList").innerHTML =
    sessions
      .map(
        (s) => `
    <div class="item">
      <div class="item-row">
        <div>
          <strong>${escapeHtml(s.title)}</strong>
          <small>${s.session_date || ""} • ${escapeHtml(s.duration || "Duration not set")}</small>
        </div>
        <button class="danger" onclick="deleteRow('sessions','${s.id}')">Delete</button>
      </div>
      ${s.objective ? `<p><b>Objective:</b> ${escapeHtml(s.objective)}</p>` : ""}
      ${s.setup ? `<p><b>Setup:</b> ${escapeHtml(s.setup)}</p>` : ""}
      ${s.coach_points ? `<p><b>Coach points:</b> ${escapeHtml(s.coach_points)}</p>` : ""}
    </div>
  `
      )
      .join("") || `<p class="muted">No sessions saved yet.</p>`;
}

function renderAttendance() {
  $("attendanceList").innerHTML =
    players
      .map(
        (p) => `
    <div class="check-item">
      <label>
        <input type="checkbox" class="attendance-check" data-player="${p.id}" />
        ${escapeHtml(`${p.first_name || ""} ${p.last_name || ""}`.trim())}
      </label>
      <span class="muted">${escapeHtml(p.position || "")}</span>
    </div>
  `
      )
      .join("") || `<p class="muted">Add players first.</p>`;
}

async function saveAttendance() {
  if (!requireUser()) return;

  const date = $("attendanceDate").value || today();
  const note = $("attendanceNote").value.trim();

  const rows = [...document.querySelectorAll(".attendance-check")].map((input) => ({
    user_id: currentUser.id,
    player_id: input.dataset.player,
    attendance_date: date,
    present: input.checked,
    note,
  }));

  if (!rows.length) return alert("Add players first.");

  setLoading("saveAttendanceBtn", true);
  const { error } = await sb.from("attendance").insert(rows);
  setLoading("saveAttendanceBtn", false);

  if (error) return alert(error.message);
  await loadAttendanceHistory();
  await loadCounts();
  alert("Attendance saved.");
}

async function loadAttendanceHistory() {
  const { data, error } = await sb
    .from("attendance")
    .select("id, attendance_date, present, note, player_id, players(first_name,last_name,position)")
    .eq("user_id", currentUser.id)
    .order("attendance_date", { ascending: false })
    .limit(60);

  if (error) return console.error(error);
  attendanceRows = data || [];

  $("attendanceHistory").innerHTML =
    attendanceRows
      .map((r) => {
        const name = `${r.players?.first_name || ""} ${r.players?.last_name || ""}`.trim() || "Deleted player";
        return `
          <div class="item">
            <div class="item-row">
              <div>
                <strong>${escapeHtml(name)}</strong>
                <small>${r.attendance_date} • ${escapeHtml(r.players?.position || "")} ${r.note ? "• " + escapeHtml(r.note) : ""}</small>
              </div>
              <div>
                <span class="badge ${r.present ? "good" : "bad"}">${r.present ? "Present" : "Absent"}</span>
                <button class="danger" onclick="deleteRow('attendance','${r.id}')">Delete</button>
              </div>
            </div>
          </div>
        `;
      })
      .join("") || `<p class="muted">No attendance saved yet.</p>`;
}

function renderRatings() {
  $("ratingsList").innerHTML =
    players
      .map(
        (p) => `
    <div class="rating-item">
      <div>
        <strong>${escapeHtml(`${p.first_name || ""} ${p.last_name || ""}`.trim())}</strong>
        <p class="muted">${escapeHtml(p.position || "")}</p>
      </div>
      <div class="rating-controls">
        <label>Rating
          <input type="number" min="1" max="10" value="7" class="rating-score" data-player="${p.id}" />
        </label>
        <label>Note
          <input type="text" class="rating-note" data-player="${p.id}" placeholder="Sharp, needs scanning..." />
        </label>
      </div>
    </div>
  `
      )
      .join("") || `<p class="muted">Add players first.</p>`;
}

async function saveRatings() {
  if (!requireUser()) return;

  const date = $("ratingsDate").value || today();
  const context = $("ratingsContext").value.trim();
  const scoreInputs = [...document.querySelectorAll(".rating-score")];

  if (!scoreInputs.length) return alert("Add players first.");

  const rows = scoreInputs.map((input) => {
    const playerId = input.dataset.player;
    const note = document.querySelector(`.rating-note[data-player="${playerId}"]`)?.value || "";
    const score = Math.max(1, Math.min(10, Number(input.value || 1)));

    return {
      user_id: currentUser.id,
      player_id: playerId,
      rating_date: date,
      context,
      score,
      note,
    };
  });

  setLoading("saveRatingsBtn", true);
  const { error } = await sb.from("player_ratings").insert(rows);
  setLoading("saveRatingsBtn", false);

  if (error) return alert(error.message);
  await loadRatingsHistory();
  alert("Ratings saved.");
}

async function loadRatingsHistory() {
  const { data, error } = await sb
    .from("player_ratings")
    .select("id, rating_date, context, score, note, player_id, players(first_name,last_name,position)")
    .eq("user_id", currentUser.id)
    .order("rating_date", { ascending: false })
    .limit(60);

  if (error) return console.error(error);
  ratingRows = data || [];

  $("ratingsHistory").innerHTML =
    ratingRows
      .map((r) => {
        const name = `${r.players?.first_name || ""} ${r.players?.last_name || ""}`.trim() || "Deleted player";
        return `
          <div class="item">
            <div class="item-row">
              <div>
                <strong>${escapeHtml(name)}</strong>
                <small>${r.rating_date} • ${escapeHtml(r.context || "No context")} • ${escapeHtml(r.players?.position || "")}</small>
              </div>
              <div>
                <span class="badge good">${r.score}/10</span>
                <button class="danger" onclick="deleteRow('player_ratings','${r.id}')">Delete</button>
              </div>
            </div>
            ${r.note ? `<p>${escapeHtml(r.note)}</p>` : ""}
          </div>
        `;
      })
      .join("") || `<p class="muted">No ratings saved yet.</p>`;
}

async function saveMatch() {
  if (!requireUser()) return;

  const opponent = $("matchOpponent").value.trim();
  if (!opponent) return alert("Opponent required.");

  const payload = {
    user_id: currentUser.id,
    opponent,
    match_date: $("matchDate").value || today(),
    score: $("matchScore").value.trim(),
    positives: $("matchPositives").value.trim(),
    improvements: $("matchImprove").value.trim(),
    summary: $("matchSummary").value.trim(),
  };

  setLoading("saveMatchBtn", true);
  const { error } = await sb.from("match_reports").insert(payload);
  setLoading("saveMatchBtn", false);

  if (error) return alert(error.message);

  ["matchOpponent", "matchScore", "matchPositives", "matchImprove", "matchSummary"].forEach((id) => ($(id).value = ""));
  await loadMatches();
  await loadCounts();
}

async function loadMatches() {
  const { data, error } = await sb
    .from("match_reports")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("match_date", { ascending: false });

  if (error) return console.error(error);
  matches = data || [];

  $("matchesList").innerHTML =
    matches
      .map(
        (m) => `
    <div class="item">
      <div class="item-row">
        <div>
          <strong>vs ${escapeHtml(m.opponent)}</strong>
          <small>${m.match_date || ""} • ${escapeHtml(m.score || "Score not set")}</small>
        </div>
        <button class="danger" onclick="deleteRow('match_reports','${m.id}')">Delete</button>
      </div>
      ${m.positives ? `<p><b>Went well:</b> ${escapeHtml(m.positives)}</p>` : ""}
      ${m.improvements ? `<p><b>Improve:</b> ${escapeHtml(m.improvements)}</p>` : ""}
      ${m.summary ? `<p><b>Summary:</b> ${escapeHtml(m.summary)}</p>` : ""}
    </div>
  `
      )
      .join("") || `<p class="muted">No match reports saved yet.</p>`;
}

async function loadCounts() {
  $("statPlayers").textContent = players.length;
  $("statSessions").textContent = sessions.length;
  $("statAttendance").textContent = attendanceRows.length;
  $("statMatches").textContent = matches.length;
}

async function loadAll() {
  if (!requireUser()) return;
  await loadProfile();
  await loadPlayers();
  await loadSessions();
  await loadAttendanceHistory();
  await loadRatingsHistory();
  await loadMatches();
  await loadCounts();
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tool").forEach((p) => p.classList.remove("active-panel"));
    tab.classList.add("active");
    $(tab.dataset.tab).classList.add("active-panel");
  });
});

$("signUpBtn").addEventListener("click", signUp);
$("loginBtn").addEventListener("click", login);
$("logoutBtn").addEventListener("click", logout);
$("refreshBtn").addEventListener("click", loadAll);
$("saveProfileBtn").addEventListener("click", saveProfile);
$("addPlayerBtn").addEventListener("click", addPlayer);
$("saveSessionBtn").addEventListener("click", saveSession);
$("saveAttendanceBtn").addEventListener("click", saveAttendance);
$("saveRatingsBtn").addEventListener("click", saveRatings);
$("saveMatchBtn").addEventListener("click", saveMatch);

init();
