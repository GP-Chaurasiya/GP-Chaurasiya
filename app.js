const DEFAULT_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='60' fill='%23d8e0ef'/%3E%3Ctext x='60' y='66' text-anchor='middle' fill='%23586b88' font-size='18' font-family='Arial'%3ETeam%3C/text%3E%3C/svg%3E";

const state = {
  teams: JSON.parse(localStorage.getItem("teams") || "[]"),
  reports: JSON.parse(localStorage.getItem("reports") || "[]"),
  activeMatch: null,
};

const els = {
  teamForm: document.getElementById("team-form"),
  teamName: document.getElementById("team-name"),
  teamId: document.getElementById("team-id"),
  teamCourse: document.getElementById("team-course"),
  teamPhoto: document.getElementById("team-photo"),
  teamList: document.getElementById("team-list"),
  teamASelect: document.getElementById("team-a"),
  teamBSelect: document.getElementById("team-b"),
  matchForm: document.getElementById("match-form"),
  sport: document.getElementById("sport"),
  matchStatus: document.getElementById("match-status"),

  scoreboard: document.getElementById("scoreboard"),
  sportLabel: document.getElementById("sport-label"),
  scoreTeamA: document.getElementById("score-team-a"),
  scoreTeamB: document.getElementById("score-team-b"),
  scoreCourseA: document.getElementById("score-course-a"),
  scoreCourseB: document.getElementById("score-course-b"),
  scorePhotoA: document.getElementById("score-photo-a"),
  scorePhotoB: document.getElementById("score-photo-b"),
  scoreA: document.getElementById("score-a"),
  scoreB: document.getElementById("score-b"),
  endMatch: document.getElementById("end-match"),

  result: document.getElementById("result"),
  reportTableBody: document.querySelector("#report-table tbody"),
  downloadJson: document.getElementById("download-json"),
  downloadCsv: document.getElementById("download-csv"),
  printReport: document.getElementById("print-report"),
  clearData: document.getElementById("clear-data"),
};

function save() {
  localStorage.setItem("teams", JSON.stringify(state.teams));
  localStorage.setItem("reports", JSON.stringify(state.reports));
}

function teamOptionHtml(team) {
  return `<option value="${team.id}">${team.name} (${team.course})</option>`;
}

function renderTeams() {
  els.teamList.innerHTML = state.teams
    .map(
      (t) => `
      <li>
        <img class="avatar" src="${t.photo || DEFAULT_IMG}" alt="${t.name}" />
        <div>
          <strong>${t.name}</strong><br />
          <small>ID: ${t.id} • ${t.course}</small>
        </div>
      </li>
    `
    )
    .join("");

  const options = ['<option value="">Choose team</option>']
    .concat(state.teams.map(teamOptionHtml))
    .join("");

  els.teamASelect.innerHTML = options;
  els.teamBSelect.innerHTML = options;
}

function renderReports() {
  els.reportTableBody.innerHTML = state.reports
    .map(
      (r) => `
      <tr>
        <td>${new Date(r.date).toLocaleString()}</td>
        <td>${r.sport}</td>
        <td>${r.teamA.name}</td>
        <td>${r.scoreA} - ${r.scoreB}</td>
        <td>${r.teamB.name}</td>
        <td>${r.winner.name}</td>
        <td>${r.runnerUp.name}</td>
      </tr>
    `
    )
    .join("");
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

els.teamForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = els.teamId.value.trim();
  if (state.teams.some((t) => t.id === id)) {
    alert("Team ID already exists.");
    return;
  }

  const photo = await readFileAsDataURL(els.teamPhoto.files[0]);
  state.teams.push({
    name: els.teamName.value.trim(),
    id,
    course: els.teamCourse.value.trim(),
    photo,
  });

  save();
  renderTeams();
  els.teamForm.reset();
});

els.matchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const teamA = state.teams.find((t) => t.id === els.teamASelect.value);
  const teamB = state.teams.find((t) => t.id === els.teamBSelect.value);

  if (!teamA || !teamB) return alert("Select both teams.");
  if (teamA.id === teamB.id) return alert("Team A and Team B must be different.");

  state.activeMatch = {
    date: new Date().toISOString(),
    sport: els.sport.value,
    teamA,
    teamB,
    scoreA: 0,
    scoreB: 0,
  };

  renderActiveMatch();
});

function renderActiveMatch() {
  const m = state.activeMatch;
  if (!m) {
    els.scoreboard.classList.add("hidden");
    els.matchStatus.textContent = "No active match.";
    return;
  }

  els.scoreboard.classList.remove("hidden");
  els.matchStatus.textContent = `Live: ${m.teamA.name} vs ${m.teamB.name}`;
  els.sportLabel.textContent = m.sport.toUpperCase();
  els.scoreTeamA.textContent = m.teamA.name;
  els.scoreTeamB.textContent = m.teamB.name;
  els.scoreCourseA.textContent = `${m.teamA.course} • ID ${m.teamA.id}`;
  els.scoreCourseB.textContent = `${m.teamB.course} • ID ${m.teamB.id}`;
  els.scorePhotoA.src = m.teamA.photo || DEFAULT_IMG;
  els.scorePhotoB.src = m.teamB.photo || DEFAULT_IMG;
  els.scoreA.textContent = m.scoreA;
  els.scoreB.textContent = m.scoreB;
}

els.scoreboard.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn || !state.activeMatch) return;

  switch (btn.dataset.action) {
    case "inc-a":
      state.activeMatch.scoreA += 1;
      break;
    case "dec-a":
      state.activeMatch.scoreA = Math.max(0, state.activeMatch.scoreA - 1);
      break;
    case "inc-b":
      state.activeMatch.scoreB += 1;
      break;
    case "dec-b":
      state.activeMatch.scoreB = Math.max(0, state.activeMatch.scoreB - 1);
      break;
    default:
      break;
  }
  renderActiveMatch();
});

els.endMatch.addEventListener("click", () => {
  const m = state.activeMatch;
  if (!m) return;

  let winner = m.teamA;
  let runnerUp = m.teamB;

  if (m.scoreB > m.scoreA) {
    winner = m.teamB;
    runnerUp = m.teamA;
  } else if (m.scoreA === m.scoreB) {
    const tieWinner = confirm("Scores are tied. Click OK: Team A wins, Cancel: Team B wins.");
    winner = tieWinner ? m.teamA : m.teamB;
    runnerUp = tieWinner ? m.teamB : m.teamA;
  }

  const report = {
    ...m,
    winner,
    runnerUp,
    department: "Department of Computer Science",
  };

  state.reports.unshift(report);
  save();
  renderResult(report);
  renderReports();

  state.activeMatch = null;
  renderActiveMatch();
  els.matchForm.reset();
});

function renderResult(report) {
  els.result.classList.remove("empty");
  els.result.innerHTML = `
    <div class="result-grid">
      <div class="result-card">
        <h3>🏆 Winner</h3>
        <img src="${report.winner.photo || DEFAULT_IMG}" alt="${report.winner.name}" />
        <p><strong>${report.winner.name}</strong><br /><small>${report.winner.course}</small></p>
      </div>
      <div class="result-card">
        <h3>🥈 Runner-up</h3>
        <img src="${report.runnerUp.photo || DEFAULT_IMG}" alt="${report.runnerUp.name}" />
        <p><strong>${report.runnerUp.name}</strong><br /><small>${report.runnerUp.course}</small></p>
      </div>
    </div>
    <p><strong>Match:</strong> ${report.teamA.name} ${report.scoreA} - ${report.scoreB} ${report.teamB.name} (${report.sport})</p>
    <p><strong>Department:</strong> ${report.department}</p>
  `;
}

function downloadText(filename, type, content) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

els.downloadJson.addEventListener("click", () => {
  const payload = {
    department: "Department of Computer Science",
    exportedAt: new Date().toISOString(),
    teams: state.teams,
    matches: state.reports,
  };
  downloadText("computer-science-sports-report.json", "application/json", JSON.stringify(payload, null, 2));
});

els.downloadCsv.addEventListener("click", () => {
  const header = ["Date", "Sport", "Team A", "Score A", "Team B", "Score B", "Winner", "Runner-up"];
  const rows = state.reports.map((r) => [
    new Date(r.date).toISOString(),
    r.sport,
    r.teamA.name,
    r.scoreA,
    r.teamB.name,
    r.scoreB,
    r.winner.name,
    r.runnerUp.name,
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  downloadText("computer-science-sports-report.csv", "text/csv", csv);
});

els.printReport.addEventListener("click", () => {
  window.print();
});

els.clearData.addEventListener("click", () => {
  if (!confirm("Clear all teams and reports?")) return;
  localStorage.removeItem("teams");
  localStorage.removeItem("reports");
  location.reload();
});

renderTeams();
renderReports();
renderActiveMatch();
