/* ============================================================
   OFFLINE CHESS — time controls and game clocks
   Two halves, one file so setup and game classify identically:
   - parse/classify/format helpers, used by setup.html's picker
     (via ui.js) and by the game page's nav title
   - the actual ticking clock for game.html: increment on each
     completed move, flag = loss on time (or a draw if the other
     side can't possibly mate)
   Loaded before ui.js on setup and before init.js on the game
   page, so both can call the helpers freely.
   ============================================================ */

//"180+2" -> {base: 180, inc: 2}, both in seconds. null = untimed. Tolerant
//about the separator because "+" in a hand-typed query string decodes to a space
function parseTimeControl(str){
	if(str == null || str == "" || str == "none")
		return null;

	const m = /^(\d+)[+\s|-](\d+)$/.exec(str);
	if(m == null)
		return null;

	const base = Number(m[1]);
	const inc = Number(m[2]);
	return base > 0 ? { base, inc } : null;
}

//chess.com's speed buckets, by estimated game duration = base + 40 * increment
//(an average game lasts ~40 moves a side, so each increment second is paid ~40
//times). 60-minute games still count as rapid, as on chess.com - only past
//that does it become classical
function classifyTimeControl(base, inc){
	const est = base + 40 * inc;

	if(est < 180) return "Bullet";
	if(est < 600) return "Blitz";
	if(est <= 3600) return "Rapid";
	return "Classical";
}

//"3 | 2" with increment, "10 min" without - chess.com's own labels
function formatTimeControl(base, inc){
	const mins = base % 60 == 0 ? String(base / 60) : (base / 60).toFixed(1);
	return inc > 0 ? mins + " | " + inc : mins + " min";
}

/* --- game clock (only wakes up on a timed game page) ---------- */

const GAME_TC = parseTimeControl(new URLSearchParams(window.location.search).get("tc"));

//remaining milliseconds per color - floats, decremented by real elapsed time
//so a main thread blocked by the bot's search still gets billed accurately
let clockTimes = null;
let clockLastTick = 0;
let clockDead = false;

function clockDisplay(ms){
	ms = Math.max(0, ms);
	const s = ms / 1000;

	//under ten seconds the tenths matter (and are most of the drama)
	if(s < 10)
		return "0:0" + s.toFixed(1);

	const total = Math.floor(s);
	const sec = String(total % 60).padStart(2, "0");
	const min = Math.floor(total / 60) % 60;

	if(total >= 3600)
		return Math.floor(total / 3600) + ":" + String(min).padStart(2, "0") + ":" + sec;

	return min + ":" + sec;
}

function renderClocks(){
	for(const color of ["w", "b"]){
		const el = document.getElementById("clock-" + color);
		if(el == null)
			continue;

		el.textContent = clockDisplay(clockTimes[color]);
		el.classList.toggle("clock-active", !clockDead && color == player);
		el.classList.toggle("clock-low", clockTimes[color] < 20000);
	}
}

//the winner-on-time still needs mating material - a bare king can't win, so
//flagging against one is a draw instead (same rule as chess.com)
function canPossiblyMate(color){
	let men = 0;
	board.forEach(piece => {
		if(piece != null && piece.color == color && piece.type != "k")
			men++;
	});
	return men > 0;
}

function clockFlag(loser){
	clockDead = true;
	clockTimes[loser] = 0;
	renderClocks();

	window.boardLocked = true;
	window.gameEnded = true;

	if(typeof playSound == "function")
		playSound("checkmate");

	const winner = otherColor(loser) == "w" ? "White" : "Black";
	if(canPossiblyMate(otherColor(loser)))
		showGameOverModal("Time's Up!", winner + " wins on time.");
	else
		showGameOverModal("Draw", "Timeout, but " + winner.toLowerCase() + " has no mating material.");
}

function clockTick(){
	if(clockDead)
		return;

	const now = performance.now();
	clockTimes[player] -= now - clockLastTick;
	clockLastTick = now;

	if(clockTimes[player] <= 0)
		clockFlag(player);
	else
		renderClocks();
}

//called from finishTurn/applyBotMove after the turn has already been handed
//over, so the mover is the side that is NOT to move anymore
function clockOnMove(gameOver){
	if(clockTimes == null || clockDead)
		return;

	clockTick(); //bill the mover up to this exact moment
	if(clockDead)
		return;

	clockTimes[otherColor(player)] += GAME_TC.inc * 1000;

	if(gameOver)
		clockDead = true;

	renderClocks();
}

//undo can revive a game that had just ended by mate/draw - the clock resumes
//for whoever is now to move. A flag is final though: the time is really gone
function clockOnUndo(){
	if(clockTimes == null)
		return;

	if(clockDead && clockTimes.w > 0 && clockTimes.b > 0){
		clockDead = false;
		clockLastTick = performance.now();
	}
	renderClocks();
}

if(GAME_TC != null && document.getElementById("clock-w") != null){
	clockTimes = { w: GAME_TC.base * 1000, b: GAME_TC.base * 1000 };
	clockLastTick = performance.now();

	//"Local vs Bot · Blitz 3 | 2" - the requested "what speed is this" label
	const label = document.querySelector("[data-mode-label]");
	if(label != null)
		label.textContent += " · " + classifyTimeControl(GAME_TC.base, GAME_TC.inc)
			+ " " + formatTimeControl(GAME_TC.base, GAME_TC.inc);

	renderClocks();
	setInterval(clockTick, 100);
}
