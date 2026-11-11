const TEAMS = [
  { id: 'aurora', city: 'Aurora', name: 'Voyagers', short: 'AV', color: '#00d3a0' },
  { id: 'saffron', city: 'Saffron', name: 'Blazers', short: 'SB', color: '#ff8755' },
  { id: 'indigo', city: 'Indigo', name: 'Storm', short: 'IS', color: '#72a7ff' },
  { id: 'royal', city: 'Royal', name: 'Titans', short: 'RT', color: '#f8dc6c' }
];

const FIRST_NAMES = [
  'Aarav', 'Kabir', 'Ishaan', 'Rohan', 'Vihaan', 'Aditya', 'Arjun', 'Reyansh', 'Krish', 'Dhruv',
  'Aman', 'Yash', 'Siddh', 'Kian', 'Nikhil', 'Pranav', 'Vikram', 'Dev', 'Om', 'Aaryan',
  'Rahul', 'Himanshu', 'Zayan', 'Ritvik', 'Kunal', 'Tanish', 'Harsh', 'Naman', 'Varun', 'Shivam',
  'Aniket', 'Kartik', 'Aiden', 'Eshan', 'Tanmay', 'Jay', 'Ayaan', 'Vyom', 'Mihir', 'Madhav',
  'Rudra', 'Amit', 'Jatin', 'Samar', 'Shaurya', 'Bharat', 'Luv', 'Ritwik', 'Divyansh', 'Tejas',
  'Uday', 'Neel', 'Rishabh', 'Abhinav', 'Manav', 'Ahaan', 'Ivaan', 'Keshav', 'Nirav', 'Aviral',
  'Samarth', 'Akshay', 'Parth', 'Naitik', 'Bhavya', 'Pratyush', 'Sarthak', 'Daanish', 'Mayank', 'Dhrumil',
  'Kavin', 'Moksh', 'Yug', 'Vansh', 'Jai', 'Hemant', 'Vivaan', 'Riaan', 'Chaitanya', 'Aryan',
  'Swaraj', 'Dhairya', 'Niketan', 'Tanush', 'Adwait', 'Eklavya', 'Ritansh', 'Jivansh', 'Ishan', 'Swayam'
];

const LAST_NAMES = [
  'Patel', 'Singh', 'Mehta', 'Sharma', 'Verma', 'Saxena', 'Nair', 'Reddy', 'Iyer', 'Kapoor',
  'Chopra', 'Joshi', 'Bose', 'Goyal', 'Malhotra', 'Mishra', 'Pillai', 'Bhatia', 'Dutta', 'Lal',
  'Agarwal', 'Tripathi', 'Khanna', 'Arora', 'Kulkarni', 'Sethi', 'Sen', 'Parikh', 'Jain', 'Rana',
  'Khan', 'Pandey', 'Purohit', 'Suri', 'Anand', 'Gupta', 'Banerjee', 'Dhar', 'Mandal', 'Roy',
  'Vora', 'Nanda', 'Rajput', 'Srivastava', 'Bharadwaj', 'Kumar', 'Bajaj', 'Saluja', 'Naik', 'Tiwari',
  'Shah', 'Kaul', 'Yadav', 'Mohan', 'Sawant', 'Desai', 'Kamble', 'Chaudhary', 'Chawla', 'Nadkarni'
];

const roles = ['Batter', 'Bowler', 'All-Rounder', 'Keeper'];
const state = {
  selectedTeam: null,
  userSquad: [],
  budget: 100,
  clubs: [],
  lotIndex: 0,
  match: null,
  pool: [],
  auctionLots: [],
  currentBid: 0,
  soundOn: true,
  audioContext: null,
  sceneAPI: null,
  markerPosition: 3,
  markerDirection: 1,
  deliveryTimeout: null,
  timingRaf: null
};

const $ = (id) => document.getElementById(id);

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.toggle('active', screen.id === screenId);
  });
}

function showToast(message) {
  const toast = $('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function generatePlayerPool() {
  const pool = [];
  for (let i = 0; i < 100; i += 1) {
    const role = roles[i % roles.length];
    const bat = 45 + Math.floor(Math.random() * 42);
    const bowl = 40 + Math.floor(Math.random() * 44);
    const field = 38 + Math.floor(Math.random() * 30);
    const skill = Math.round((bat + bowl + field) / 3);
    const value = Math.max(8, Math.round((skill * 0.55) + (role === 'All-Rounder' ? 10 : role === 'Keeper' ? 8 : 5)));
    pool.push({
      id: `p${i + 1}`,
      name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[(i * 3) % LAST_NAMES.length]}`,
      role,
      bat,
      bowl,
      field,
      value,
      skill,
      color: ['#00d3a0', '#ff8755', '#72a7ff', '#f8dc6c'][i % 4]
    });
  }
  return pool.sort((a, b) => b.skill - a.skill);
}

function createAuctionLots() {
  if (!state.pool.length) state.pool = generatePlayerPool();
  return state.pool.slice(0, 12).map((player, index) => ({
    ...player,
    lot: index + 1,
    currentBid: Math.max(8, Math.round(player.value * 0.75)),
    sold: false
  }));
}

function renderTeams() {
  const teamGrid = $('teamGrid');
  if (!teamGrid) return;
  teamGrid.innerHTML = TEAMS.map((team) => `
    <button class="team-card" type="button" data-team-id="${team.id}" style="--team-color:${team.color}">
      <div class="team-card-head">
        <span class="team-crest" style="--team-color:${team.color}">${team.short}</span>
        <span class="pick-label">PICK</span>
      </div>
      <div class="team-city">${team.city}</div>
      <h3>${team.name}</h3>
      <p>${team.city} heritage · flexible balance · title push</p>
    </button>
  `).join('');

  teamGrid.querySelectorAll('.team-card').forEach((button) => {
    button.addEventListener('click', () => {
      const team = TEAMS.find((entry) => entry.id === button.dataset.teamId);
      if (!team) return;
      selectTeam(team);
    });
  });
}

function selectTeam(team) {
  state.selectedTeam = team;
  state.userSquad = [];
  state.budget = 100;
  state.clubs = [];
  state.lotIndex = 0;
  state.auctionLots = createAuctionLots();
  state.currentBid = 0;

  document.querySelectorAll('.team-card').forEach((card) => {
    const active = card.dataset.teamId === team.id;
    card.classList.toggle('selected', active);
  });

  renderAuction();
  showScreen('auctionScreen');
}

function renderAuction() {
  const lot = state.auctionLots[state.lotIndex];
  const purse = $('purseAmount');
  const progress = $('auctionProgress');
  const lotLabel = $('lotLabel');
  const playerLot = $('playerLot');
  const auctionActions = $('auctionActions');
  const auctionFeed = $('auctionFeed');
  const squadList = $('squadList');
  const squadCount = $('squadCount');
  const opponentMiniList = $('opponentMiniList');

  if (!lot) {
    finalizeAuction();
    return;
  }

  if (purse) purse.textContent = String(state.budget);
  const purseBar = $('purseBar');
  if (purseBar) purseBar.style.width = `${state.budget}%`;
  if (progress) progress.style.width = `${((state.lotIndex + 1) / state.auctionLots.length) * 100}%`;
  if (lotLabel) lotLabel.innerHTML = `LOT ${String(state.lotIndex + 1).padStart(2, '0')} <b>/ 12</b>`;

  const minBid = Math.max(8, Math.round(lot.value * 0.75));
  state.currentBid = minBid;

  if (playerLot) {
    playerLot.innerHTML = `
      <div class="player-art" style="--player-color:${lot.color};--jersey:${lot.color}">
        <div class="player-silhouette">
          <div class="head"></div>
          <div class="body"></div>
          <div class="arm left"></div>
          <div class="arm right"></div>
          <div class="legs"></div>
        </div>
      </div>
      <div class="player-info">
        <div class="player-role">${lot.role}</div>
        <h3>${lot.name}</h3>
        <div class="player-country">${lot.skill} overall · ${lot.role} profile</div>
        <div class="player-stats">
          <div class="stat"><b>${lot.bat}</b><span>BAT</span></div>
          <div class="stat"><b>${lot.bowl}</b><span>BOWL</span></div>
          <div class="stat"><b>${lot.field}</b><span>FLD</span></div>
        </div>
      </div>
      <div class="player-price">
        <small>BASE VALUE</small>
        <b>₹${lot.value}</b>
        <span>Current bid<br><strong>₹${minBid}</strong></span>
      </div>
    `;
  }

  if (auctionActions) {
    auctionActions.innerHTML = `
      <button class="bid-button" id="bidButton" type="button">BID ₹${minBid}</button>
      <button class="pass-button" id="passButton" type="button">PASS</button>
    `;
    $('bidButton').addEventListener('click', () => handleBid(lot));
    $('passButton').addEventListener('click', () => advanceLot('Passed on this lot.'));
  }

  if (auctionFeed) {
    auctionFeed.textContent = `${lot.name} enters the arena. ${state.userSquad.length} signings already in your squad.`;
  }

  renderSquadList();
  renderRivals();
}

function renderSquadList() {
  const squadList = $('squadList');
  const squadCount = $('squadCount');
  if (!squadList || !squadCount) return;

  squadCount.textContent = `${state.userSquad.length} / 5`;
  if (!state.userSquad.length) {
    squadList.innerHTML = '<div class="empty-squad">Your first signing<br>is waiting out there.</div>';
    return;
  }

  squadList.innerHTML = state.userSquad.map((player) => `
    <div class="squad-player">
      <span class="squad-name">${player.name.split(' ')[0]}</span>
      <span class="squad-role">${player.role}</span>
      <span class="squad-value">₹${player.value}</span>
    </div>
  `).join('');
}

function renderRivals() {
  const list = $('opponentMiniList');
  if (!list) return;

  const teams = TEAMS.filter((team) => team.id !== state.selectedTeam?.id);
  list.innerHTML = teams.map((team) => `
    <div class="mini-team">
      <span class="team-crest" style="--team-color:${team.color}">${team.short}</span>
      <div>
        <strong>${team.city}</strong>
        <small>${team.name}</small>
      </div>
    </div>
  `).join('');
}

function handleBid(lot) {
  if (!state.selectedTeam) return;
  if (state.userSquad.length >= 5) {
    showToast('Your squad is already full.');
    return;
  }

  const bid = Math.max(8, Math.round(lot.value * 0.75));
  if (state.budget < bid) {
    showToast('You do not have enough purse left.');
    advanceLot('Your purse cannot cover this lot.');
    return;
  }

  state.budget -= bid;
  const player = { ...lot, value: bid };
  state.userSquad.push(player);
  state.auctionLots[state.lotIndex].sold = true;
  showToast(`${player.name.split(' ')[0]} signed for ₹${bid}.`);
  advanceLot(`${player.name} joins the ${state.selectedTeam.city} ${state.selectedTeam.name}.`);
}

function advanceLot(feedText) {
  const auctionFeed = $('auctionFeed');
  if (auctionFeed) {
    auctionFeed.textContent = feedText || 'Quick decision. Every credit matters.';
  }

  state.lotIndex += 1;
  if (state.lotIndex >= state.auctionLots.length || state.userSquad.length >= 5) {
    finalizeAuction();
    return;
  }

  renderAuction();
}

function finalizeAuction() {
  const remainingSlots = Math.max(0, 5 - state.userSquad.length);
  if (remainingSlots > 0 && state.userSquad.length < 5) {
    const available = state.pool.filter((player) => !state.userSquad.some((signed) => signed.id === player.id));
    for (let i = 0; i < remainingSlots; i += 1) {
      const chosen = available[i % available.length] || { name: 'Wildcard', role: 'All-Rounder', value: 10, bat: 50, bowl: 50, field: 50 };
      state.userSquad.push({ ...chosen, value: Math.min(15 + (i * 3), 24) });
    }
  }

  const auctionFeed = $('auctionFeed');
  if (auctionFeed) {
    auctionFeed.textContent = 'Auction complete. Your squad is locked in. Time for the match.';
  }

  if ($('auctionActions')) {
    $('auctionActions').innerHTML = `
      <button class="bid-button" id="continueButton" type="button">BEGIN MATCH</button>
    `;
    $('continueButton').addEventListener('click', () => {
      buildAIClubs();
      startMatch();
    });
  }

  renderSquadList();
  renderRivals();
}

function buildAIClubs() {
  const rivalTeams = TEAMS.filter((team) => team.id !== state.selectedTeam.id);
  const teamPool = state.pool.filter((player) => !state.userSquad.some((signed) => signed.id === player.id));

  state.clubs = rivalTeams.map((team) => {
    const squad = [];
    for (let i = 0; i < 5; i += 1) {
      const player = teamPool[(Math.random() * teamPool.length) | 0];
      if (!player) continue;
      squad.push({
        id: `${team.id}-${i}`,
        name: player.name,
        role: player.role,
        bat: player.bat,
        bowl: player.bowl,
        field: player.field,
        value: Math.max(10, Math.round(player.value * 0.8))
      });
    }
    return { team, squad };
  });
}

function buildMatchState() {
  state.match = {
    innings: 1,
    balls: 0,
    runs: 0,
    wickets: 0,
    target: 0,
    currentBatter: 0,
    opponentRuns: 0,
    overRuns: 0,
    overWickets: 0,
    processing: false,
    opponent: null
  };

  const opponent = state.clubs.slice().sort((a, b) => {
    const scoreA = a.squad.reduce((sum, player) => sum + player.bat + player.bowl, 0);
    const scoreB = b.squad.reduce((sum, player) => sum + player.bat + player.bowl, 0);
    return scoreB - scoreA;
  })[0] || { team: TEAMS.find((team) => team.id !== state.selectedTeam.id), squad: [] };

  state.match.opponent = opponent;
}

function startMatch() {
  buildMatchState();
  const match = state.match;
  const opponent = match.opponent;

  $('homeCrest').textContent = state.selectedTeam.short;
  $('homeCrest').style.setProperty('--team-color', state.selectedTeam.color);
  $('awayCrest').textContent = opponent.team.short;
  $('awayCrest').style.setProperty('--team-color', opponent.team.color);
  $('scoreCrest').textContent = state.selectedTeam.short;
  $('scoreCrest').style.setProperty('--team-color', state.selectedTeam.color);
  $('homeTeamName').textContent = `${state.selectedTeam.city} ${state.selectedTeam.name}`;
  $('awayTeamName').textContent = `${opponent.team.city} ${opponent.team.name}`;
  $('battingTeamName').textContent = `${state.selectedTeam.city} ${state.selectedTeam.name}`;
  $('battingSubtitle').textContent = 'BATTING · INNINGS 1';
  $('inningsLabel').textContent = 'YOUR INNINGS · 2 OVERS';
  $('matchTitle').innerHTML = 'LIGHTS. CAMERA. <em>CRICKET.</em>';
  $('targetChip').hidden = true;
  $('scoreValue').innerHTML = '0<span>/0</span>';
  $('overValue').textContent = '0.0';
  $('ballsLeft').textContent = '12 BALLS LEFT';
  $('ballDots').innerHTML = Array.from({ length: 12 }, () => '<i class="ball-dot"></i>').join('');
  $('commentary').textContent = 'The crowd is on its feet. Here we go!';
  $('matchControls').innerHTML = `
    <div class="match-prompt">
      <span class="prompt-icon">✦</span>
      <div><b>READY FOR THE FIRST BALL?</b><small>Tap bowl to start. Then time your shot.</small></div>
    </div>
    <button class="primary-button bowl-button" id="bowlButton" type="button">BOWL <span>↗</span></button>
    <button class="primary-button hit-button" id="hitButton" type="button" hidden>HIT! <span>↗</span></button>
  `;
  $('bowlButton').addEventListener('click', bowlDelivery);
  $('hitButton').addEventListener('click', hitDelivery);
  renderBatters();
  showScreen('matchScreen');
  $('stadiumScore').hidden = false;
  $('arenaScore').textContent = '0/0';
  $('arenaOvers').textContent = '0.0 OVERS';
}

function renderBatters() {
  const batters = state.userSquad.slice().sort((a, b) => b.bat - a.bat).slice(0, 5);
  const list = $('batterList');
  if (!list) return;

  list.innerHTML = batters.map((player, index) => `
    <div class="batter-item">
      <b>${index === state.match.currentBatter ? '▶ ' : ''}${player.name.split(' ')[0]} ${player.name.split(' ').slice(-1)[0][0]}.</b>
      <span>${player.bat} BAT</span>
    </div>
  `).join('');
}

function bowlDelivery() {
  if (!state.match || state.match.processing || state.match.balls >= 12) return;
  state.match.processing = true;
  const button = $('bowlButton');
  if (button) {
    button.disabled = true;
    button.textContent = 'BOWLING…';
  }

  $('commentary').textContent = 'The bowler begins the run-up…';
  if (state.sceneAPI) state.sceneAPI.ball(true);
  if (state.soundOn) playTone(190, .07);

  state.deliveryTimeout = setTimeout(() => {
    if (!state.match || state.match.balls >= 12) return;
    $('commentary').textContent = 'Here it comes! Time your shot…';
    $('timingText').textContent = 'TAP THE GREEN!';
    const hit = $('hitButton');
    hit.hidden = false;
    const timing = $('timingMarker');
    timing.style.display = 'block';
    state.markerPosition = 3;
    state.markerDirection = 1;
    cancelAnimationFrame(state.timingRaf);

    const animateTiming = () => {
      if (!state.match || !state.match.processing) return;
      state.markerPosition += state.markerDirection * .92;
      if (state.markerPosition >= 98) {
        state.markerPosition = 98;
        state.markerDirection = -1;
      }
      if (state.markerPosition <= 2) {
        state.markerPosition = 2;
        state.markerDirection = 1;
      }
      timing.style.left = `${state.markerPosition}%`;
      state.timingRaf = requestAnimationFrame(animateTiming);
    };

    state.timingRaf = requestAnimationFrame(animateTiming);
    state.deliveryTimeout = setTimeout(() => {
      if (state.match && state.match.processing) resolveBall(null);
    }, 1450);
  }, 720);
}

function hitDelivery() {
  if (!state.match || !state.match.processing) return;
  clearTimeout(state.deliveryTimeout);
  cancelAnimationFrame(state.timingRaf);

  const marker = $('timingMarker');
  marker.style.display = 'none';
  const pos = state.markerPosition;
  let outcome;

  if (pos >= 54 && pos <= 73) {
    outcome = { runs: 6, wicket: false, text: ['IN THE SLOT… THAT IS HUGE! SIX!', 'Perfect connection! It sails over the rope for six!', 'Launched into the night sky! That’s a maximum!'][Math.floor(Math.random() * 3)], quality: 'PERFECT TIMING · SIX' };
  } else if ((pos >= 35 && pos < 54) || (pos > 73 && pos <= 83)) {
    outcome = { runs: 4, wicket: false, text: ['Timed beautifully! Four runs!', 'Cracked through the gap — that races away!', 'What a shot! It beats the field for four!'][Math.floor(Math.random() * 3)], quality: 'GREAT TIMING · FOUR' };
  } else if ((pos >= 23 && pos < 35) || (pos > 83 && pos <= 91)) {
    outcome = { runs: Math.random() < 0.5 ? 2 : 1, wicket: false, text: ['Good placement, they come back for two.', 'Worked into the gap for a single.', 'Smart cricket, easy runs.'][Math.floor(Math.random() * 3)], quality: 'GOOD CONTACT' };
  } else if (Math.random() < 0.31) {
    outcome = { runs: 0, wicket: true, text: ['Oh no! Dragged on — the stumps are shattered!', 'A mistimed swing… straight into the fielder’s hands!', 'The bowler wins that battle. You’re out!'][Math.floor(Math.random() * 3)], quality: 'MISTIMED · WICKET' };
  } else {
    outcome = { runs: 0, wicket: false, text: ['Beaten! The bowler gets away with one.', 'No run. The fielders are right on it.', 'A swing and a miss — dot ball.'][Math.floor(Math.random() * 3)], quality: 'TOO EARLY / TOO LATE' };
  }

  resolveBall(outcome);
}

function resolveBall(outcome) {
  if (!state.match || !state.match.processing) return;
  const match = state.match;
  match.processing = false;
  clearTimeout(state.deliveryTimeout);
  cancelAnimationFrame(state.timingRaf);

  $('hitButton').hidden = true;
  const bowlButton = $('bowlButton');
  if (bowlButton) {
    bowlButton.disabled = false;
    bowlButton.innerHTML = 'BOWL <span>↗</span>';
  }
  $('timingMarker').style.display = 'none';

  if (!outcome) {
    outcome = { runs: 0, wicket: false, text: 'Missed the moment! The ball slips through for a dot.', quality: 'TOO LATE' };
  }

  const dot = $('ballDots').children[match.balls];
  if (dot) {
    dot.textContent = outcome.wicket ? 'W' : outcome.runs;
    dot.classList.add(outcome.wicket ? 'wicket' : outcome.runs >= 4 ? 'boundary' : outcome.runs ? 'scored' : '');
  }

  match.balls += 1;
  if (outcome.wicket) {
    match.wickets += 1;
    match.currentBatter = Math.min(match.currentBatter + 1, Math.max(0, state.userSquad.length - 1));
  } else {
    match.runs += outcome.runs;
  }

  match.overRuns += outcome.runs;
  if (outcome.wicket) match.overWickets += 1;

  $('scoreValue').innerHTML = `${match.runs}<span>/${match.wickets}</span>`;
  $('overValue').textContent = `${Math.floor(match.balls / 6)}.${match.balls % 6}`;
  $('ballsLeft').textContent = `${12 - match.balls} BALLS LEFT`;
  $('commentary').textContent = outcome.text;
  $('timingText').textContent = outcome.quality || 'MISSED';
  $('arenaScore').textContent = `${match.runs}/${match.wickets}`;
  $('arenaOvers').textContent = `${Math.floor(match.balls / 6)}.${match.balls % 6} OVERS`; 
  renderBatters();

  if (state.soundOn) playTone(outcome.runs >= 4 ? 760 : outcome.wicket ? 150 : 390, .08);

  if (match.innings === 2 && match.runs >= match.target) {
    endMatch(true);
    return;
  }

  if (match.balls >= 12 || match.wickets >= Math.min(5, state.userSquad.length)) {
    if (match.innings === 1) {
      startSecondInnings();
    } else {
      endMatch(match.runs >= match.target);
    }
    return;
  }

  if (bowlButton) bowlButton.disabled = false;
}

function startSecondInnings() {
  const opponent = state.match.opponent;
  let rating = 0;
  opponent.squad.forEach((player) => {
    rating += player.bat;
  });
  const skill = Math.min(0.38, Math.max(0.18, rating / Math.max(1, opponent.squad.length) / 280));

  let runs = 0;
  for (let i = 0; i < 12; i += 1) {
    if (Math.random() < skill * 0.43) {
      runs += 4 + (Math.random() < 0.17 ? 2 : 0);
    } else if (Math.random() < skill * 0.84) {
      runs += 1 + (Math.random() < 0.25 ? 1 : 0);
    }
  }

  state.match.opponentRuns = runs;
  state.match.target = runs + 1;
  state.match.innings = 2;
  state.match.balls = 0;
  state.match.runs = 0;
  state.match.wickets = 0;
  state.match.currentBatter = 0;
  state.match.overRuns = 0;
  state.match.overWickets = 0;

  $('battingTeamName').textContent = `${state.selectedTeam.city} ${state.selectedTeam.name}`;
  $('battingSubtitle').textContent = 'BATTING · INNINGS 2';
  $('inningsLabel').textContent = `CHASE · ${state.match.target} TO WIN`;
  $('matchTitle').innerHTML = 'CHASE THE <em>TARGET.</em>';
  $('targetChip').hidden = false;
  $('targetValue').textContent = state.match.target;
  $('scoreValue').innerHTML = '0<span>/0</span>';
  $('overValue').textContent = '0.0';
  $('ballsLeft').textContent = '12 BALLS LEFT';
  $('ballDots').innerHTML = Array.from({ length: 12 }, () => '<i class="ball-dot"></i>').join('');
  $('commentary').textContent = `${opponent.team.city} ${opponent.team.name} post ${state.match.opponentRuns}. Your chase starts now!`;
  $('timingText').textContent = 'WAIT FOR THE DELIVERY';
  const bowlButton = $('bowlButton');
  if (bowlButton) {
    bowlButton.disabled = false;
    bowlButton.innerHTML = 'BOWL <span>↗</span>';
  }
  $('stadiumScore').hidden = false;
  $('arenaScore').textContent = '0/0';
  $('arenaOvers').textContent = '0.0 OVERS';
}

function endMatch(won) {
  if (!state.match) return;

  const match = state.match;
  match.processing = false;
  clearTimeout(state.deliveryTimeout);
  cancelAnimationFrame(state.timingRaf);

  const yourScore = match.runs;
  const finalWon = match.innings === 2 ? won : match.opponentRuns < match.runs + 1;

  $('resultKicker').textContent = finalWon ? 'VICTORY · CHAMPIONS' : 'FULL TIME';
  $('resultTitle').innerHTML = finalWon ? 'WHAT A <em>FINISH.</em>' : 'BACK FOR <em>MORE.</em>';
  const margin = finalWon ? `${state.selectedTeam.city} ${state.selectedTeam.name} take the final!` : `${match.opponent.team.city} ${match.opponent.team.name} hold their nerve.`;
  $('resultSummary').textContent = `${margin} ${state.userSquad.length} stars, one unforgettable night.`;

  const opponentTag = `${match.opponent.team.city} ${match.opponent.team.name}`;
  $('resultScoreline').innerHTML = `
    <div class="result-side"><b>${match.opponentRuns}</b><small>${opponentTag}</small></div>
    <span class="result-vs">VS</span>
    <div class="result-side"><b>${yourScore}</b><small>${state.selectedTeam.city} ${state.selectedTeam.name}</small></div>
  `;

  showScreen('resultScreen');
  if (state.soundOn) playTone(finalWon ? 880 : 230, .3);
}

function resetGame() {
  state.selectedTeam = null;
  state.userSquad = [];
  state.budget = 100;
  state.clubs = [];
  state.lotIndex = 0;
  state.match = null;
  state.pool = generatePlayerPool();
  state.auctionLots = [];
  $('stadiumScore').hidden = true;
  $('arenaTeamName').textContent = 'YOUR FRANCHISE STARTS HERE';
  showScreen('welcomeScreen');
}

function playTone(freq, duration) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    state.audioContext = state.audioContext || new Ctx();
    if (state.audioContext.state === 'suspended') state.audioContext.resume();
    const osc = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.055, state.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, state.audioContext.currentTime + duration);
    osc.connect(gain);
    gain.connect(state.audioContext.destination);
    osc.start();
    osc.stop(state.audioContext.currentTime + duration);
  } catch (error) {
    // Sound is optional.
  }
}

function setupThreeD() {
  const canvas = $('stadiumCanvas');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x051a16, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x071b17, 12, 28);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 5, 12);

  const stadiumGroup = new THREE.Group();
  scene.add(stadiumGroup);

  const field = new THREE.Mesh(
    new THREE.CylinderGeometry(6.7, 6.7, 0.35, 64),
    new THREE.MeshStandardMaterial({ color: 0x1b7f5a, roughness: 0.9, metalness: 0.05 })
  );
  field.position.y = -0.7;
  stadiumGroup.add(field);

  const pitch = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.08, 6.2),
    new THREE.MeshStandardMaterial({ color: 0xf2e9d5, roughness: 0.85 })
  );
  pitch.position.set(0, -0.45, 0);
  stadiumGroup.add(pitch);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(5.8, 0.18, 16, 60),
    new THREE.MeshStandardMaterial({ color: 0x2ef2bf, emissive: 0x114731, roughness: 0.7 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.55;
  stadiumGroup.add(ring);

  const stands = new THREE.Mesh(
    new THREE.CylinderGeometry(9.5, 9.8, 3.2, 64, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x122c27, side: THREE.DoubleSide, roughness: 0.8 })
  );
  stands.position.y = 0.2;
  stadiumGroup.add(stands);

  const lights = [];
  for (let i = 0; i < 6; i += 1) {
    const light = new THREE.PointLight(0xf2f6ff, 1.1, 35, 2);
    const angle = (Math.PI * 2 * i) / 6;
    light.position.set(Math.cos(angle) * 8, 5, Math.sin(angle) * 8);
    lights.push(light);
    scene.add(light);
  }

  const ambient = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambient);

  const ballGeo = new THREE.SphereGeometry(0.16, 18, 18);
  const ballMat = new THREE.MeshStandardMaterial({ color: 0xfef8e7, emissive: 0x271d09, roughness: 0.5 });
  const ball = new THREE.Mesh(ballGeo, ballMat);
  ball.position.set(0, 0.55, 3);
  scene.add(ball);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function animate() {
    const t = performance.now() * 0.001;
    stadiumGroup.rotation.y = t * 0.18;
    ball.rotation.x += 0.08;
    ball.rotation.y += 0.12;
    if (ball.userData && ball.userData.active) {
      const phase = (performance.now() - ball.userData.start) / 700;
      ball.position.x = 0.5 * phase;
      ball.position.z = 3 - (phase * 5);
      ball.position.y = 0.65 + Math.sin(phase * Math.PI) * 0.25;
      if (phase > 1) {
        ball.position.set(0, 0.55, 3);
        ball.userData.active = false;
      }
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  resize();
  animate();

  state.sceneAPI = {
    ball: (active) => {
      ball.userData = { active: !!active, start: performance.now() };
    },
    resize,
    scene,
    camera
  };

  window.addEventListener('resize', resize, { passive: true });
}

function init() {
  state.pool = generatePlayerPool();
  setupThreeD();
  renderTeams();

  $('startButton').addEventListener('click', () => showScreen('franchiseScreen'));
  $('soundToggle').addEventListener('click', () => {
    state.soundOn = !state.soundOn;
    $('soundToggle').querySelector('span').textContent = state.soundOn ? 'Sound on' : 'Sound off';
  });
  $('ambientToggle').addEventListener('click', () => {
    state.soundOn = !state.soundOn;
    $('soundToggle').querySelector('span').textContent = state.soundOn ? 'Sound on' : 'Sound off';
    showToast(state.soundOn ? 'Sound enabled' : 'Sound muted');
  });
  $('rematchButton').addEventListener('click', () => {
    if (state.selectedTeam && state.userSquad.length) startMatch();
    else resetGame();
  });
  $('homeButton').addEventListener('click', resetGame);
  $('stadiumCanvas').addEventListener('dblclick', () => {
    if (state.sceneAPI) state.sceneAPI.resize();
  });
}

init();
