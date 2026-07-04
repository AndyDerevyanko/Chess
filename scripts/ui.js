let toastTimer = null;

function showToast(message){
	let toast = document.getElementById("toast");

	if(toast == null){
		toast = document.createElement("div");
		toast.id = "toast";
		document.body.appendChild(toast);
	}

	toast.textContent = message;
	toast.classList.remove("show");
	// force reflow so re-triggering the animation works
	void toast.offsetWidth;
	toast.classList.add("show");

	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

//modals

function openModal(id){
	const modal = document.getElementById(id);
	if(modal != null)
		modal.classList.add("open");
}

function closeModal(id){
	const modal = document.getElementById(id);
	if(modal != null)
		modal.classList.remove("open");
}

document.addEventListener("click", e => {
	// backdrop click closes its modal
	if(e.target.classList.contains("modal-backdrop"))
		e.target.closest(".modal").classList.remove("open");
});

document.addEventListener("keydown", e => {
	if(e.key === "Escape")
		document.querySelectorAll(".modal.open").forEach(m => m.classList.remove("open"));
});

//data-open-modal="id" opens, data-close-modal closes, data-toast="msg" shows a toast

document.addEventListener("click", e => {
	//closes own modal then opens the next, so a confirm can chain into another modal
	const closer = e.target.closest("[data-close-modal]");
	if(closer != null){
		const modal = closer.closest(".modal");
		if(modal != null)
			modal.classList.remove("open");
	}

	const opener = e.target.closest("[data-open-modal]");
	if(opener != null)
		openModal(opener.getAttribute("data-open-modal"));

	const toaster = e.target.closest("[data-toast]");
	if(toaster != null)
		showToast(toaster.getAttribute("data-toast"));
});

//choice-row: clicking a .choice selects it (visual only), .locked ones just toast

document.querySelectorAll(".choice-row").forEach(row => {
	row.addEventListener("click", e => {
		const choice = e.target.closest(".choice");
		if(choice == null)
			return;

		if(choice.classList.contains("locked")){
			showToast(choice.getAttribute("data-toast") || "Coming soon");
			return;
		}

		row.querySelectorAll(".choice").forEach(c => c.classList.remove("selected"));
		choice.classList.add("selected");
	});
});

//toggle switches, visual only

document.querySelectorAll(".toggle").forEach(toggle => {
	toggle.addEventListener("click", () => toggle.classList.toggle("on"));
});

//clicking a .mode-card selects it and points the start button at ?mode=<data-mode>

function wireModeCards(){
	const cards = document.querySelectorAll(".mode-card[data-mode]");
	const startBtn = document.getElementById("start-game-btn");

	if(cards.length === 0)
		return;

	cards.forEach(card => {
		card.addEventListener("click", () => {
			cards.forEach(c => c.classList.remove("selected"));
			card.classList.add("selected");

			if(startBtn != null)
				startBtn.setAttribute("href", "game.html?mode=" + card.getAttribute("data-mode"));
		});
	});
}

wireModeCards();

//reads ?mode= from the url and fills any [data-mode-label], purely cosmetic

function applyModeLabel(){
	const labels = document.querySelectorAll("[data-mode-label]");
	if(labels.length === 0)
		return;

	const mode = new URLSearchParams(window.location.search).get("mode");

	const text = (mode === "bot") ? "Local vs Bot" : "Pass & Play";
	const opponent = (mode === "bot") ? "Retro Bot" : "Player 2";

	labels.forEach(el => { el.textContent = text; });

	document.querySelectorAll("[data-opponent-label]").forEach(el => {
		el.textContent = opponent;
	});
}

applyModeLabel();

//static starting position for any .mini-board, display only, no game state
//square parity matches the real board in init.js (a1 dark)

function renderMiniBoard(container){
	const backRank = ["rook","knight","bishop","queen","king","bishop","knight","rook"];

	container.innerHTML = "";

	for(let rank = 8; rank >= 1; rank--){
		for(let file = 0; file < 8; file++){
			const sq = document.createElement("div");
			sq.className = "sq " + (((file + rank) % 2 === 1) ? "dark" : "light");

			let src = null;
			let alt = null;

			if(rank === 8){ src = "images/black/" + backRank[file] + ".png"; alt = "black " + backRank[file]; }
			if(rank === 7){ src = "images/black/pawn.png";                   alt = "black pawn"; }
			if(rank === 2){ src = "images/white/pawn.png";                   alt = "white pawn"; }
			if(rank === 1){ src = "images/white/" + backRank[file] + ".png"; alt = "white " + backRank[file]; }

			if(src != null){
				const img = document.createElement("img");
				img.src = src;
				img.alt = alt;
				sq.appendChild(img);
			}

			container.appendChild(sq);
		}
	}
}

document.querySelectorAll(".mini-board[data-auto-render]").forEach(renderMiniBoard);

//highlight cursor over nav-link/menu-btn/choice buttons, moved by arrow keys or mouse hover
//each modal gets its own cursor so it behaves the same inside as outside, visual only, never clicks

function createFocusGroup(candidates){
	if(candidates.length === 0)
		return null;

	candidates.forEach(el => {
		if(el.querySelector(".nav-arrow") != null)
			return;

		const left = document.createElement("span");
		left.className = "nav-arrow nav-arrow-left";
		left.setAttribute("data-icon", "arrowLeft");

		const right = document.createElement("span");
		right.className = "nav-arrow nav-arrow-right";
		right.setAttribute("data-icon", "arrowRight");

		el.insertBefore(left, el.firstChild);
		el.appendChild(right);
	});

	let activeIndex = candidates.findIndex(el => el.classList.contains("primary"));
	if(activeIndex === -1)
		activeIndex = 0;

	function setActive(i){
		candidates[activeIndex].classList.remove("focus-active");
		activeIndex = ((i % candidates.length) + candidates.length) % candidates.length;
		candidates[activeIndex].classList.add("focus-active");
	}

	candidates[activeIndex].classList.add("focus-active");

	candidates.forEach((el, i) => {
		el.addEventListener("mouseenter", () => setActive(i));
	});

	return {
		next: () => setActive(activeIndex + 1),
		prev: () => setActive(activeIndex - 1)
	};
}

function setupFocusNav(){
	const pageCandidates = Array.from(document.querySelectorAll(".nav-link, .menu-btn, .game-actions .choice"))
		.filter(el => el.closest(".modal") == null);

	const pageGroup = createFocusGroup(pageCandidates);

	const modalGroups = new Map();
	document.querySelectorAll(".modal").forEach(modal => {
		const group = createFocusGroup(Array.from(modal.querySelectorAll(".menu-btn")));
		if(group != null)
			modalGroups.set(modal, group);
	});

	if(typeof renderIcons === "function")
		renderIcons();

	document.addEventListener("keydown", e => {
		const active = document.activeElement;
		if(active != null && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable))
			return;

		const openModal = document.querySelector(".modal.open");
		const group = openModal != null ? modalGroups.get(openModal) : pageGroup;

		if(group == null)
			return;

		if(e.key === "ArrowDown" || e.key === "ArrowRight"){
			e.preventDefault();
			group.next();
		} else if(e.key === "ArrowUp" || e.key === "ArrowLeft"){
			e.preventDefault();
			group.prev();
		}
	});
}

setupFocusNav();

//solved count per tier from localStorage, no puzzle engine yet so this just shows last save

function setupPuzzleProgress(){
	const tiers = document.querySelectorAll(".puzzle-tier[data-tier]");
	if(tiers.length === 0)
		return;

	tiers.forEach(tier => {
		const key = "offlineChess.puzzleProgress." + tier.getAttribute("data-tier");
		const total = Number(tier.getAttribute("data-total")) || 0;
		const solved = Math.min(Number(localStorage.getItem(key)) || 0, total);

		const solvedEl = tier.querySelector(".tier-solved");
		const fillEl = tier.querySelector(".progress-fill");

		if(solvedEl != null)
			solvedEl.textContent = solved;

		if(fillEl != null)
			fillEl.style.width = (total === 0 ? 0 : (solved / total) * 100) + "%";
	});
}

setupPuzzleProgress();

//rename via the edit icon, persisted to localStorage so it survives a reload
//only one template game exists right now so a single storage key is enough

function setupGameNameEditor(){
	const nameEl = document.getElementById("game-name");
	const editBtn = document.getElementById("edit-name-btn");

	if(nameEl == null || editBtn == null)
		return;

	const STORAGE_KEY = "offlineChess.analysisGameName";
	const defaultName = nameEl.textContent.trim();
	const saved = localStorage.getItem(STORAGE_KEY);

	if(saved)
		nameEl.textContent = saved;

	function selectAll(){
		const range = document.createRange();
		range.selectNodeContents(nameEl);
		const sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	}

	function commit(){
		nameEl.contentEditable = "false";
		nameEl.classList.remove("editing");
		const value = nameEl.textContent.trim() || defaultName;
		nameEl.textContent = value;
		localStorage.setItem(STORAGE_KEY, value);
	}

	editBtn.addEventListener("click", () => {
		nameEl.contentEditable = "true";
		nameEl.classList.add("editing");
		nameEl.focus();
		selectAll();
	});

	nameEl.addEventListener("keydown", e => {
		if(e.key === "Enter"){
			e.preventDefault();
			nameEl.blur();
		} else if(e.key === "Escape"){
			nameEl.textContent = localStorage.getItem(STORAGE_KEY) || defaultName;
			nameEl.blur();
		}
	});

	nameEl.addEventListener("blur", commit);
}

setupGameNameEditor();
