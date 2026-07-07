let board = new Map();
var enPassant = 2;
var player = "w";

class piece {
	constructor(color, pos, iterable){
		if(iterable == undefined){
			this.color = color;
			this.pos = pos;
			this.validMoves = [];
		} else {
			this.color = iterable.color;
			this.pos = iterable.pos;
			this.validMoves = iterable.validMoves;
		}
	}

	assignPos(pos){
		this.pos = pos;
	}
}

class p extends piece{
	constructor(color, pos, iterable){
		super(color, pos, iterable);
		this.type = "p";
		this.twoSquareMoved = false;
		
		if(iterable != undefined)
			this.twoSquareMoved = iterable.twoSquaremoved;
	}
	
	material = 1;
}

class n extends piece{
	constructor(color, pos, iterable){
		super(color, pos, iterable);
		this.type = "n";
	}
	
	material = 3;
}

class b extends piece{
	constructor(color, pos, iterable){
		super(color, pos, iterable);
		this.type = "b";
	}
	
	material = 3;
}

class r extends piece{
	constructor(color, pos, iterable){
		super(color, pos, iterable);
		this.type = "r";
		this.hasMoved = false;
		
		if(iterable != undefined)
			this.hasMoved = iterable.hasMoved;
	}
	
	material = 5;
}

class q extends piece{
	constructor(color, pos, iterable){
		super(color, pos, iterable);
		this.type = "q";
	}
	
	material = 9;
}

class k extends piece{
	constructor(color, pos, iterable){
		super(color, pos, iterable);
		this.type = "k";
		this.hasMoved = false;
		
		if(iterable != undefined)
			this.hasMoved = iterable.hasMoved;
	}
	
	inCheck(boardArr = board){
		return inHeck(boardArr, this.color);
	}
	
	
	inCheckMate(boardArr = board){
		return checkMateCheck(boardArr, this.color);
	}
	
	inStaleMate(boardArr = board){
		return staleMateCheck(boardArr, this.color);
	}
	
	material = 0;
}

function intToRank(i){
	switch(i){
		case 0:
		 return "a";
		 break;
		case 1:
		 return "b"; 
		 break;
		case 2:
		 return "c"; 
		 break;
		case 3:
		 return "d"; 
		 break;
		case 4:
		 return "e"; 
		 break;
		case 5:
		 return "f" 
		 break;
		case 6:
		 return "g"; 
		 break;
		case 7:
		 return "h"; 
	}	
}

function rankToInt(i){
	switch(i){
		case "a":
		 return 0;
		 break;
		case "b":
		 return 1; 
		 break;
		case "c":
		 return 2; 
		 break;
		case "d":
		 return 3; 
		 break;
		case "e":
		 return 4; 
		 break;
		case "f":
		 return 5; 
		 break;
		case "g":
		 return 6; 
		 break;
		case "h":
		 return 7; 
	}	
}

function resetBoard(boardArr = board){
	clearBoard(boardArr);

	boardArr.set("a1", new r("w", "a1"));
	boardArr.set("b1", new n("w", "b1"));
	boardArr.set("c1", new b("w", "c1"));
	boardArr.set("d1", new q("w", "d1"));
	boardArr.set("e1", new k("w", "e1"));
	boardArr.set("f1", new b("w", "f1"));
	boardArr.set("g1", new n("w", "g1"));
	boardArr.set("h1", new r("w", "h1"));

	for(let i = 0; i < 8; i++){
		boardArr.set(intToRank(i)+"2", new p("w", intToRank(i)+"2"));
	}

	boardArr.set("a8", new r("b", "a8"));
	boardArr.set("b8", new n("b", "b8"));
	boardArr.set("c8", new b("b", "c8"));
	boardArr.set("d8", new q("b", "d8"));
	boardArr.set("e8", new k("b", "e8"));
	boardArr.set("f8", new b("b", "f8"));
	boardArr.set("g8", new n("b", "g8"));
	boardArr.set("h8", new r("b", "h8"));

	for(let i = 0; i < 8; i++){
		boardArr.set(intToRank(i)+"7", new p("b", intToRank(i)+"7"));
	}
}

function clear(){
	clearBoard(board);
	updateBoard();
}

function numToPos(i){
	return intToRank(Math.floor(i/8)) + String(i - Math.floor(i/8)*8 + 1);
	}

function posToNum(i){
	return rankToInt(i.charAt(0))*8 + Number(i.charAt(1)) - 1;
	}

function posToArr(i){
	return [rankToInt(i.charAt(0)), Number(i.charAt(1)) - 1]
}

function arrToPos(i){
	return intToRank(i[0])+ String(i[1]+1);
}

//zobrist hashing - every position maps to a single 64-bit integer. each
//(piece, square) pair gets a fixed random key and a position's hash is the
//XOR of the keys of everything on the board, plus side to move, castling
//rights and en passant files. a move updates the hash by XORing only what
//changed (see move()) instead of rehashing the board, and two positions are
//identical iff their hashes are equal, so repetition detection is a single
//integer comparison instead of walking 64 squares
const Z_MASK = (1n << 64n) - 1n;

const ZOBRIST = (() => {
	//xorshift64 with a fixed seed - keys just need to be stable and well spread
	let s = 88172645463325252n;
	function rand(){
		s = s ^ ((s << 13n) & Z_MASK);
		s = s ^ (s >> 7n);
		s = s ^ ((s << 17n) & Z_MASK);
		return s;
	}

	const piece = {};
	for(const color of ["w", "b"])
		for(const type of ["p", "n", "b", "r", "q", "k"]){
			const keys = [];
			for(let i = 0; i < 64; i++)
				keys.push(rand());
			piece[color + type] = keys;
		}

	const ep = [];
	for(let i = 0; i < 8; i++)
		ep.push(rand());

	return {
		piece,
		ep,
		castle: { wk: rand(), wq: rand(), bk: rand(), bq: rand() },
		side: rand()
	};
})();

function pieceHash(piece, sq){
	return ZOBRIST.piece[piece.color + piece.type][posToNum(sq)];
}

//castling rights, read from the same flags the move legality reads
function castleRightsHash(boardArr){
	let h = 0n;

	const wk = boardArr.get("e1");
	if(wk != null && wk.type == "k" && wk.color == "w" && !wk.hasMoved){
		const kr = boardArr.get("h1");
		const qr = boardArr.get("a1");
		if(kr != null && kr.type == "r" && kr.color == "w" && !kr.hasMoved)
			h ^= ZOBRIST.castle.wk;
		if(qr != null && qr.type == "r" && qr.color == "w" && !qr.hasMoved)
			h ^= ZOBRIST.castle.wq;
	}

	const bk = boardArr.get("e8");
	if(bk != null && bk.type == "k" && bk.color == "b" && !bk.hasMoved){
		const kr = boardArr.get("h8");
		const qr = boardArr.get("a8");
		if(kr != null && kr.type == "r" && kr.color == "b" && !kr.hasMoved)
			h ^= ZOBRIST.castle.bk;
		if(qr != null && qr.type == "r" && qr.color == "b" && !qr.hasMoved)
			h ^= ZOBRIST.castle.bq;
	}

	return h;
}

//en passant vulnerability - the file of any pawn that just double-moved
function epHash(boardArr){
	let h = 0n;
	boardArr.forEach((piece, sq) => {
		if(piece != null && piece.type == "p" && piece.twoSquareMoved)
			h ^= ZOBRIST.ep[rankToInt(sq.charAt(0))];
	});
	return h;
}

//full recompute - seeds the game hash and cross-checks the incremental
//updates in tests; actual play only ever XORs deltas in move()/promote()
function zobristKey(boardArr, sideToMove){
	let h = sideToMove == "b" ? ZOBRIST.side : 0n;
	boardArr.forEach((piece, sq) => {
		if(piece != null)
			h ^= pieceHash(piece, sq);
	});
	return h ^ castleRightsHash(boardArr) ^ epHash(boardArr);
}

//running hash of the real game position, XOR-updated as moves are made
let gameHash = 0n;

function clearBoard(b){
	for(let i = 0; i < 64; i++){
		b.set(numToPos(i), null);
	}
}

function drawPiece(p, s){
	document.getElementById(s).innerHTML = "";
	if(p == null)
		return;
	
	let elem = document.createElement("div");
	let img = document.createElement("img");
	
	elem.style.height = "100%";
	elem.style.width = "100%";
	
	img.style.height = "95%";
	img.style.width = "95%";
	img.style.zIndex = "2";
	img.draggable = false; //custom drag-and-drop replaces the native ghost-image drag
	
	switch(p.type){
		case "p":
			if(p.color == "w"){
				img.alt = "white pawn";
				img.className = "whitePawn.png";
				img.src = "images/white/pawn.png";
			} else {
				img.alt = "black pawn";
				img.className = "blackPawn";
				img.src = "images/black/pawn.png";
			}				
			break;
		case "n":
			if(p.color == "w"){
				img.alt = "white knight";
				img.className = "whiteKnight";
				img.src = "images/white/knight.png";
			} else {
				img.alt = "black knight";
				img.className = "blackKnight";
				img.src = "images/black/knight.png";
			}
			break;
		case "b":
			if(p.color == "w"){
				img.alt = "white bishop";
				img.className = "whiteBishop";
				img.src = "images/white/bishop.png";
			} else {
				img.alt = "black bishop";
				img.className = "blackBishop";
				img.src = "images/black/bishop.png";
			}
			break;
		case "r":
			if(p.color == "w"){
				img.alt = "white rook";
				img.className = "whiteRook";
				img.src = "images/white/rook.png";
			} else {
				img.alt = "black rook";
				img.className = "blackRook";
				img.src = "images/black/rook.png";
			}
			break;
		case "q":
			if(p.color == "w"){
				img.alt = "white queen";
				img.className = "whiteQueen";
				img.src = "images/white/queen.png";
			} else {
				img.alt = "black queen";
				img.className = "blackQueen";
				img.src = "images/black/queen.png";
			}
			break;
		case "k":
			if(p.color == "w"){
				img.alt = "white king";
				img.className = "whiteKing";
				img.src = "images/white/king.png";
			} else {
				img.alt = "black king";
				img.className = "blackKing";
				img.src = "images/black/king.png";
			}
	}
	
	elem.className = img.className + "Container";
	elem.id = img.className + s + "Container";
	elem.appendChild(img);

	document.getElementById(s).appendChild(elem);

	//a full redraw can land mid-drag - most notably the bot answering while a
	//premove-drag is still in flight (see the comment above dragSourceColor
	//below). Without this, drawPiece's fresh img un-hides the piece the user
	//is still holding, so it appears twice: once under the drag ghost, once
	//back on its home square. Compare colors, not object identity - a move
	//also triggers syncViewToLive's history-replay redraw (buildHistoryBoard
	//replays onto a fresh temp Map), which draws the very same piece again
	//through a brand new object with matching value but different identity,
	//and that harmless redraw must not be mistaken for a capture here. Only
	//an actual enemy piece landing on this square (a genuine capture of the
	//piece being dragged) can change its color, so that's what cancels it.
	if(pointerDown != null && pointerDown.dragging && pointerDown.sq == s){
		if(p.color === dragSourceColor)
			img.style.visibility = "hidden";
		else
			cancelDrag();
	}
}

function updateBoard(boardArr = board){
	for(const [i,j] of boardArr){
		drawPiece(j, i);
	}
}

//initialize() builds all 64 squares (and nulls the board Map), so it's called
//once per orient, not once per square - the old per-square call created 4096
//throwaway divs every flip, which is what made pass & play stutter between moves
function orientBoard(){
	const squares = initialize();
	document.getElementById("boardContainer").innerHTML = "";
	for(let i = 0; i < 64; i++){
		let x = Math.floor(i/8)+8*(i-8*Math.floor(i/8));
		document.getElementById("boardContainer").appendChild(squares[16*Math.floor(x/8)+7-x]);
	}
	updateBoard();
}

function orientBoardR(){
	const squares = initialize();
	document.getElementById("boardContainer").innerHTML = "";
	for(let i = 63; i >= 0; i--){
		let x = Math.floor(i/8)+8*(i-8*Math.floor(i/8));
		document.getElementById("boardContainer").appendChild(squares[16*Math.floor(x/8)+7-x]);
	}
	updateBoard();
}

//orientBoard/orientBoardR only reorder the squares - the rank/file labels are
//static markup, so they need rewriting to match or the coordinates read backwards
function updateLabels(){
	const reversed = player == "b";
	const ranks = reversed ? ["1","2","3","4","5","6","7","8"] : ["8","7","6","5","4","3","2","1"];
	const files = reversed ? ["h","g","f","e","d","c","b","a"] : ["a","b","c","d","e","f","g","h"];

	document.querySelectorAll(".rank-labels span").forEach((el, i) => el.textContent = ranks[i]);
	document.querySelectorAll(".file-labels span").forEach((el, i) => el.textContent = files[i]);
}

//orientBoard/orientBoardR rebuild the squares via initialize(), which nulls every
//board entry as it goes - save and restore the pieces around the flip so a mid-game
//flip doesn't wipe the position
function flipBoard(){
	const saved = new Map(board);

	if(player == "w")
		orientBoard();
	else
		orientBoardR();

	saved.forEach((v, k) => board.set(k, v));
	updateBoard();
	updateLabels();
}

//currently selected square, if any
let selected = null;

//"e2e4"-style log of every real move played, in order - used by the bot's
//opening book (scripts/openings.js) to find how far the game still matches
//a known line. Only ever appended to from completeMove() and bot.js's own
//move application, never from search/simulation, so it only reflects the
//actual game.
let moveHistory = [];

//last opening name actually toasted, so updateOpeningName only speaks up when
//the name changes rather than repeating itself every move inside one line
let lastOpeningName = null;

//plies since the last pawn move or capture - 100 (50 full moves by each side)
//with neither is an automatic draw
let halfmoveClock = 0;

//how many times each position has occurred, keyed by zobrist hash, for
//threefold repetition. The hash covers side to move, castling rights and
//en passant, so "same position" here means same in the full rules sense
let positionCounts = new Map();

function recordPosition(){
	positionCounts.set(gameHash, (positionCounts.get(gameHash) || 0) + 1);
}

function isThreefoldRepetition(){
	return (positionCounts.get(gameHash) || 0) >= 3;
}

//piece type each promotion actually became, keyed by its ply index in
//moveHistory - moveHistory only stores "e7e8"-style squares, so replaying a
//game (rewind/redo/undo, all below) needs this to reconstruct the position
let promotions = {};

//how many plies of moveHistory are currently shown on the board. Equal to
//moveHistory.length means "live" - anything less is just looking at an
//earlier position. Rewind/redo/live only ever move this pointer and redraw;
//they never touch board, player, or any other real game state
let viewIndex = 0;

//replays moveHistory[0..upToPly) from the standard start into a fresh Map,
//entirely separate from the real board - used to render historical positions
//without disturbing the live game
function buildHistoryBoard(upToPly){
	const temp = new Map();
	resetBoard(temp);

	for(let i = 0; i < upToPly; i++){
		const from = moveHistory[i].slice(0, 2);
		const to = moveHistory[i].slice(2, 4);
		move(from, to, temp, false); //display only, no valid-move lists needed
		if(promotions[i] != null)
			promote(to, promotions[i], temp);
	}

	return temp;
}

function renderHistoryBoard(){
	updateBoard(buildHistoryBoard(viewIndex));

	document.querySelectorAll(".in-check").forEach(el => el.classList.remove("in-check"));
	if(viewIndex === moveHistory.length)
		updateCheckHighlight();

	clearMarkers();
	selected = null;
}

//enables/disables the four history buttons to match viewIndex - Undo only
//depends on there being a real move to take back
function updateHistoryButtons(){
	const set = (id, enabled) => {
		const btn = document.getElementById(id);
		if(btn != null)
			btn.classList.toggle("locked", !enabled);
	};

	set("undo-btn", moveHistory.length > 0);
	set("rewind-btn", viewIndex > 0);
	set("redo-btn", viewIndex < moveHistory.length);
	set("live-btn", viewIndex < moveHistory.length);
}

function stepHistoryView(delta){
	viewIndex = Math.max(0, Math.min(moveHistory.length, viewIndex + delta));
	renderHistoryBoard();
	updateHistoryButtons();
}

function jumpToLive(){
	viewIndex = moveHistory.length;
	renderHistoryBoard();
	updateHistoryButtons();
}

//called after every real move (finishTurn/applyBotMove) - if the viewer had
//wound back into history, a new move snaps it back to the live position
//rather than leaving it pointed at a now-stale board
function syncViewToLive(){
	const wasReviewing = viewIndex !== moveHistory.length;
	viewIndex = moveHistory.length;
	if(wasReviewing)
		renderHistoryBoard();
	updateHistoryButtons();
}

//actual undo - takes back exactly the last real ply. Rebuilds the whole game
//from the trimmed moveHistory rather than trying to reverse one move in
//place, since that automatically gets captures/castling/en passant/promotion
//right the same way replaying always does
function undoMove(){
	if(moveHistory.length === 0)
		return;

	moveHistory.pop();
	delete promotions[moveHistory.length];

	resetBoard(board);
	player = "w";
	halfmoveClock = 0;
	positionCounts = new Map();
	gameHash = zobristKey(board, player);
	recordPosition();

	for(let i = 0; i < moveHistory.length; i++){
		const from = moveHistory[i].slice(0, 2);
		const to = moveHistory[i].slice(2, 4);
		const resetClock = board.get(to) != null || board.get(from).type == "p";

		move(from, to, board, false); //hash and flags per ply, redraw once below
		halfmoveClock = resetClock ? 0 : halfmoveClock + 1;

		if(promotions[i] != null)
			promote(to, promotions[i]);

		player = otherColor(player);
		recordPosition();
	}

	updateValidMoveArray(board); //replay skipped the per-ply recompute
	lastOpeningName = currentOpeningName(moveHistory); //resync without re-toasting
	window.boardLocked = false;
	window.gameEnded = false;
	closeModal("game-over-modal"); //undo can revive a game that had just ended
	clearPremove(); //whatever was queued was aimed at a position that no longer exists

	if(typeof clockOnUndo == "function")
		clockOnUndo(); //resume the clock for whoever is now to move (flags stay final)

	viewIndex = moveHistory.length;
	renderHistoryBoard();
	updateHistoryButtons();
}

//reports the current position's book name (see scripts/openings.js), if any -
//called after every real move, from either side, so it reflects what's
//actually on the board rather than guessing ahead at a reply
function updateOpeningName(){
	if(typeof currentOpeningName != "function")
		return;

	const name = currentOpeningName(moveHistory);
	if(name != lastOpeningName && name != null)
		showToast(name);
	lastOpeningName = name;
}

function clearMarkers(){
	Array.from(document.getElementsByClassName("marker")).forEach(el => el.remove());
}

function showMarkers(sq, piece){
	for(const dest of piece.validMoves){
		let marker = document.createElement("div");
		marker.className = "marker " + (board.get(dest) != null ? "marker-capture" : "marker-move");
		marker.id = "marker" + sq + dest;
		document.getElementById(dest).appendChild(marker);
	}
}

function needsPromotion(sq, boardArr = board){
	const piece = boardArr.get(sq);
	if(piece == null || piece.type != "p")
		return false;

	const rank = sq.charAt(1);
	return (piece.color == "w" && rank == "8") || (piece.color == "b" && rank == "1");
}

function promote(sq, type, boardArr = board){
	const color = boardArr.get(sq).color;

	if(boardArr == board)
		gameHash ^= pieceHash(boardArr.get(sq), sq); //pawn out

	switch(type){
		case "n": boardArr.set(sq, new n(color, sq)); break;
		case "b": boardArr.set(sq, new b(color, sq)); break;
		case "r": boardArr.set(sq, new r(color, sq)); break;
		default:  boardArr.set(sq, new q(color, sq)); break;
	}

	if(boardArr == board)
		gameHash ^= pieceHash(boardArr.get(sq), sq); //promoted piece in
}

//promotion needs a human choice, so it pauses completeMove's turn-handoff
//until the modal reports back which piece was picked
function showPromotionPicker(sq, onChosen){
	const modal = document.getElementById("promotion-modal");
	if(modal == null){
		promote(sq, "q");
		onChosen();
		return;
	}

	const handler = e => {
		const btn = e.target.closest("[data-promote]");
		if(btn == null)
			return;

		const type = btn.getAttribute("data-promote");
		promote(sq, type);
		promotions[moveHistory.length - 1] = type;
		updateValidMoveArray(board);
		updateBoard();
		closeModal("promotion-modal");
		modal.removeEventListener("click", handler);
		onChosen();
	};

	modal.addEventListener("click", handler);
	openModal("promotion-modal");
}

//red pulse on whichever king is currently in check, cleared and re-checked every turn
function updateCheckHighlight(){
	document.querySelectorAll(".in-check").forEach(el => el.classList.remove("in-check"));

	let kingSq = null;
	board.forEach((piece, sq) => {
		if(piece != null && piece.type == "k" && piece.color == player)
			kingSq = sq;
	});

	if(kingSq != null && inHeck(board, player))
		document.getElementById(kingSq).classList.add("in-check");
}

function showGameOverModal(title, sub){
	const modal = document.getElementById("game-over-modal");
	if(modal == null){
		showToast(title);
		return;
	}

	document.getElementById("game-over-title").textContent = title;
	document.getElementById("game-over-sub").textContent = sub;

	//brief pause so the final move (and the check pulse on the mated king)
	//is visible on the board for a moment before the modal covers it
	setTimeout(() => openModal("game-over-modal"), 700);
}

//whether the last real move took a piece - read by finishTurn to pick between
//the move and capture sounds, set by completeMove and bot.js's applyBotMove
let lastMoveCapture = false;

//shared by click-to-move and drag-to-move once a legal (from, to) is chosen
function completeMove(from, to){
	//captured before move() mutates the board - a pawn landing on an empty
	//square diagonally is the en passant case
	const capture = board.get(to) != null || (board.get(from).type == "p" && from.charAt(0) != to.charAt(0));
	const resetClock = capture || board.get(from).type == "p";
	lastMoveCapture = capture;

	move(from, to);
	moveHistory.push(from + to);
	halfmoveClock = resetClock ? 0 : halfmoveClock + 1;
	clearMarkers();
	selected = null;

	if(needsPromotion(to))
		showPromotionPicker(to, finishTurn);
	else
		finishTurn();
}

function finishTurn(){
	player = otherColor(player);
	updateOpeningName();
	recordPosition();
	syncViewToLive();

	const winner = otherColor(player) == "w" ? "White" : "Black";

	//move() just refreshed every piece's validMoves for this exact position, so
	//mate/stalemate falls out of them for free instead of a fresh full-board scan
	let anyMoves = false;
	board.forEach(piece => {
		if(piece != null && piece.color == player && piece.validMoves.length > 0)
			anyMoves = true;
	});

	const inCheck = inHeck(board, player);
	const mate = !anyMoves && inCheck;
	const stale = !anyMoves && !inCheck;
	const fifty = !mate && !stale && halfmoveClock >= 100;
	const repetition = !mate && !stale && !fifty && isThreefoldRepetition();

	//the mover keeps paying for their own promotion-modal dithering, so the
	//clock is only handed over here, after any promotion is resolved
	if(typeof clockOnMove == "function")
		clockOnMove(mate || stale || fifty || repetition);

	if(typeof playSound == "function")
		playSound(mate ? "checkmate" : inCheck ? "check" : lastMoveCapture ? "capture" : "move");

	//flipBoard() rebuilds the square divs from scratch, so the check
	//highlight has to be applied after it, not before
	if(!mate && !stale && !fifty && !repetition){
		if(typeof window.afterPlayerMove === "function")
			window.afterPlayerMove();
		else
			flipBoard(); //pass & play: hand the device over, board flips to face the next player
	}

	updateCheckHighlight();

	if(mate)
		showGameOverModal("Checkmate!", winner + " wins.");
	else if(stale)
		showGameOverModal("Stalemate!", "It's a draw.");
	else if(fifty)
		showGameOverModal("Draw", "50 moves with no pawn move or capture.");
	else if(repetition)
		showGameOverModal("Draw", "Same position repeated three times.");
}

//drag-and-drop, alongside click-to-move. Native <img> dragging is turned off
//(drawPiece sets draggable=false) so this ghost fully replaces the browser's
//own drag-image instead of fighting it. A plain click never touches this -
//pointerDown only ever leads somewhere once the pointer has actually moved.
let pointerDown = null;
let dragGhost = null;
let dragGhostHalfW = 0;
let dragGhostHalfH = 0;

//color of the piece being dragged - a premove-drag can outlive the bot's move
//landing (updateBoard() redraws the whole board mid-drag), so drawPiece uses
//this to tell "still my piece, re-hide it" apart from "got captured out from
//under me, cancel the drag" (see drawPiece above)
let dragSourceColor = null;

function startDrag(sq){
	const img = document.getElementById(sq).querySelector("img");
	if(img == null)
		return;

	dragSourceColor = board.get(sq).color;

	dragGhost = document.createElement("img");
	dragGhost.src = img.src;
	dragGhost.draggable = false;
	dragGhost.style.position = "fixed";
	dragGhost.style.left = "0";
	dragGhost.style.top = "0";
	dragGhost.style.width = img.offsetWidth + "px";
	dragGhost.style.height = img.offsetHeight + "px";
	dragGhost.style.pointerEvents = "none";
	dragGhost.style.zIndex = "999";
	dragGhost.style.opacity = ".9";
	dragGhost.style.willChange = "transform";
	document.body.appendChild(dragGhost);

	//measured once here - reading offsetWidth inside moveDragTo would force a
	//fresh layout on every single pointermove
	dragGhostHalfW = dragGhost.offsetWidth / 2;
	dragGhostHalfH = dragGhost.offsetHeight / 2;

	img.style.visibility = "hidden";
}

function moveDragTo(x, y){
	if(dragGhost == null)
		return;

	//transform, not left/top - the ghost rides the compositor instead of
	//triggering layout on each movement
	dragGhost.style.transform = "translate(" + (x - dragGhostHalfW) + "px," + (y - dragGhostHalfH) + "px)";
}

//right-click mid-drag puts the piece back where it came from (as on chess.com);
//the context menu itself is already suppressed on game pages by ui.js
function cancelDrag(){
	if(pointerDown == null)
		return;

	const img = document.getElementById(pointerDown.sq).querySelector("img");
	if(img != null)
		img.style.visibility = "visible";

	if(dragGhost != null){
		dragGhost.remove();
		dragGhost = null;
	}

	clearMarkers();
	selected = null;
	pointerDown = null;
	dragSourceColor = null;
}

//a mouse is one pointer, so pressing the right button while the left is
//already held ("chorded buttons" in the spec) does NOT fire pointerdown -
//it arrives as a pointermove with the buttons bitmask updated. This
//listener only covers a right-click from a second pointer (e.g. mouse
//while dragging by touch); the mid-drag case is caught in pointermove.
document.addEventListener("pointerdown", e => {
	if(e.button != 2)
		return;

	if(pointerDown != null)
		cancelDrag();
	else if(typeof premove != "undefined" && (premove != null || selected != null)){
		//right-click with nothing in hand clears a queued premove and any
		//selection, chess.com-style
		clearPremove();
		clearMarkers();
		selected = null;
	}
});

function endDrag(from, x, y, isPremove){
	const img = document.getElementById(from).querySelector("img");
	if(img != null)
		img.style.visibility = "visible";

	if(dragGhost != null){
		dragGhost.remove();
		dragGhost = null;
	}

	dragSourceColor = null;

	const under = document.elementFromPoint(x, y);
	const targetSquare = under != null ? under.closest("#boardContainer > div") : null;

	if(isPremove){
		clearMarkers();
		selected = null;
		if(targetSquare != null && premoveTargets(from).includes(targetSquare.id))
			setPremove(from, targetSquare.id);
		return;
	}

	if(targetSquare != null && targetSquare.id != from && board.get(from) != null && board.get(from).validMoves.includes(targetSquare.id))
		completeMove(from, targetSquare.id);
}

document.addEventListener("pointermove", e => {
	if(pointerDown == null)
		return;

	//right button pressed mid-hold: chorded button presses surface here as a
	//pointermove (see note above pointerdown), so this IS the right-click
	if(e.buttons & 2){
		cancelDrag();
		return;
	}

	if(!pointerDown.dragging){
		if(Math.hypot(e.clientX - pointerDown.x, e.clientY - pointerDown.y) < 6)
			return;

		pointerDown.dragging = true;
		selected = pointerDown.sq;
		clearMarkers();
		if(pointerDown.premove)
			showPremoveMarkers(pointerDown.sq);
		else
			showMarkers(pointerDown.sq, board.get(pointerDown.sq));
		startDrag(pointerDown.sq);
	}

	moveDragTo(e.clientX, e.clientY);
});

document.addEventListener("pointerup", e => {
	//only the button that started the drag may drop the piece - releasing a
	//right/middle button mid-drag must not count as a drop
	if(e.button != 0 || pointerDown == null)
		return;

	if(pointerDown.dragging)
		endDrag(pointerDown.sq, e.clientX, e.clientY, pointerDown.premove);

	pointerDown = null;
});

/* --- premoves (vs bot only, as on chess.com) -------------------
   While the bot is thinking the board is locked, but the human may
   still queue one move. It is validated only when it fires - the
   position it lands in doesn't exist yet - so the queueable targets
   are geometric: every square the piece could ever reach from where
   it stands, sliding straight through blockers (they may move away),
   pawn captures onto empty squares included (something may land
   there). If the move turns out illegal, it's silently dropped. */

let premove = null;

//bot.js sets window.HUMAN_COLOR in bot mode - without it there is no
//"not your turn but still your board" state, so premoves stay off
function premoveAllowed(){
	return typeof window.HUMAN_COLOR == "string" && window.boardLocked === true && !window.gameEnded;
}

function premoveTargets(sq){
	const piece = board.get(sq);
	if(piece == null)
		return [];

	const [f, r] = posToArr(sq);
	const out = [];

	const push = (x, y) => {
		if(x < 0 || x > 7 || y < 0 || y > 7)
			return;
		const dest = arrToPos([x, y]);
		const occupant = board.get(dest);
		//unlike the opponent's pieces, our own can't vacate during the
		//opponent's move, so a square they hold can never become legal
		if(occupant == null || occupant.color != piece.color)
			out.push(dest);
	};

	const ray = (dx, dy) => {
		for(let i = 1; i < 8; i++)
			push(f + dx * i, r + dy * i);
	};

	switch(piece.type){
		case "p": {
			const d = piece.color == "w" ? 1 : -1;
			push(f, r + d);
			if(r == (piece.color == "w" ? 1 : 6))
				push(f, r + 2 * d);
			push(f - 1, r + d);
			push(f + 1, r + d);
			break;
		}
		case "n":
			[[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]].forEach(([dx, dy]) => push(f + dx, r + dy));
			break;
		case "b":
			ray(1,1); ray(1,-1); ray(-1,1); ray(-1,-1);
			break;
		case "r":
			ray(1,0); ray(-1,0); ray(0,1); ray(0,-1);
			break;
		case "q":
			ray(1,1); ray(1,-1); ray(-1,1); ray(-1,-1);
			ray(1,0); ray(-1,0); ray(0,1); ray(0,-1);
			break;
		case "k":
			for(let dx = -1; dx <= 1; dx++)
				for(let dy = -1; dy <= 1; dy++)
					if(dx != 0 || dy != 0)
						push(f + dx, r + dy);
			push(f + 2, r); //castling premoves
			push(f - 2, r);
			break;
	}

	return out;
}

//same dots/rings as live move markers, but fed by premoveTargets
function showPremoveMarkers(sq){
	for(const dest of premoveTargets(sq)){
		let marker = document.createElement("div");
		marker.className = "marker " + (board.get(dest) != null ? "marker-capture" : "marker-move");
		marker.id = "marker" + sq + dest;
		document.getElementById(dest).appendChild(marker);
	}
}

function setPremove(from, to){
	clearPremove();
	premove = { from, to };
	document.getElementById(from).classList.add("premove-sq");
	document.getElementById(to).classList.add("premove-sq");
}

function clearPremove(){
	premove = null;
	document.querySelectorAll(".premove-sq").forEach(el => el.classList.remove("premove-sq"));
}

//called by bot.js right after the bot's move lands - the queued move plays
//instantly if it's legal in the new position, otherwise it just evaporates
function executePremove(){
	if(premove == null)
		return;

	const from = premove.from;
	const to = premove.to;
	clearPremove();

	if(window.boardLocked || window.gameEnded || viewIndex !== moveHistory.length)
		return;

	//the bot's move refreshed every validMoves list, so this is the full
	//legality test in the position the premove actually fires in
	const piece = board.get(from);
	if(piece != null && piece.color == player && piece.validMoves.includes(to))
		completeMove(from, to);
}

function initialize(){

	let elem = [];

	for(let i = 0; i < 64; i++){
		elem.push(document.createElement("div"));
		elem[i].id = numToPos(i);

		if((Math.floor(i/8) % 2 == 0 && i % 2 == 0) || (Math.floor(i/8) % 2 == 1 && i % 2 == 1)){
			elem[i].style.backgroundColor = "#7a3626";
		} else {
			elem[i].style.backgroundColor = "#f0cf82";
		}

		elem[i].style.minHeight = "12.5%";
		elem[i].style.minWidth = "12.5%";
		elem[i].style.maxHeight = "12.5%";
		elem[i].style.maxWidth = "12.5%";
		elem[i].style.display = "flex";
		elem[i].style.justifyContent = "center";
		elem[i].style.position = "relative";

		board.set(elem[i].id, null);

		elem[i].addEventListener("pointerdown", e => {
			//left button only - right-click is reserved for cancelling a drag
			if(e.button != 0 || viewIndex !== moveHistory.length || window.gameEnded)
				return;

			const piece = board.get(elem[i].id);

			//locked board = bot's turn: the human can still pick their own
			//piece up, the drop just queues a premove instead of moving
			if(window.boardLocked){
				if(premoveAllowed() && piece != null && piece.color == window.HUMAN_COLOR)
					pointerDown = { sq: elem[i].id, x: e.clientX, y: e.clientY, dragging: false, premove: true };
				return;
			}

			if(piece != null && piece.color == player)
				pointerDown = { sq: elem[i].id, x: e.clientX, y: e.clientY, dragging: false, premove: false };
		});

		elem[i].addEventListener("click", () => {
			if(viewIndex !== moveHistory.length || window.gameEnded)
				return;

			const sq = elem[i].id;

			//click-to-premove while the bot is thinking, mirroring the normal
			//pick-a-piece-then-pick-a-target flow below
			if(window.boardLocked){
				if(!premoveAllowed())
					return;

				if(selected != null && selected != sq && board.get(selected) != null
						&& board.get(selected).color == window.HUMAN_COLOR
						&& premoveTargets(selected).includes(sq)){
					setPremove(selected, sq);
					clearMarkers();
					selected = null;
					return;
				}

				clearMarkers();

				const piece = board.get(sq);
				if(selected != sq && piece != null && piece.color == window.HUMAN_COLOR){
					selected = sq;
					showPremoveMarkers(sq);
				} else {
					//clicking anywhere else cancels the selection and any queued premove
					selected = null;
					clearPremove();
				}
				return;
			}

			//clicking a marked destination actually makes the move
			if(selected != null && board.get(selected) != null && board.get(selected).validMoves.includes(sq)){
				completeMove(selected, sq);
				return;
			}

			clearMarkers();

			//clicking the already-selected square again just deselects
			if(selected == sq){
				selected = null;
				return;
			}

			const piece = board.get(sq);
			if(piece != null && piece.color == player){
				selected = sq;
				showMarkers(sq, piece);
			} else {
				selected = null;
			}
		});
	}
	return elem;
}

function checkMove(start, end, boardArr = board){
	return checkMoveNoHeckCheck(start, end, boardArr) && !inHeck(moveBoardNoCheck(start, end, boardArr), boardArr.get(start).color);
}

//refresh=false is for replaying known-good history (undo, rewind/redo): it
//skips the full valid-move recompute and the board redraw per ply, both of
//which only matter for the final position - the caller does each once at the end
function move(start, end, boardArr = board, refresh = true){
	if(!(checkMoveNoHeckCheck(start, end, boardArr) && !inHeck(moveBoardNoCheck(start, end, boardArr), boardArr.get(start).color)))
		return false;

	const real = boardArr == board;

	if(real){
		//incremental zobrist update - XOR out exactly what this move touches,
		//then XOR the new state back in below. The board is never rehashed
		const mover = boardArr.get(start);
		const captured = boardArr.get(end);

		gameHash ^= pieceHash(mover, start);

		if(captured != null){
			gameHash ^= pieceHash(captured, end);
		} else if(mover.type == "p" && start.charAt(0) != end.charAt(0)){
			//en passant - the victim is beside the destination
			const capSq = end.charAt(0) + start.charAt(1);
			const victim = boardArr.get(capSq);
			if(victim != null)
				gameHash ^= pieceHash(victim, capSq);
		}

		if(mover.type == "k" && Math.abs(posToArr(start)[0] - posToArr(end)[0]) == 2){
			const rookPath = { g1: ["h1","f1"], c1: ["a1","d1"], g8: ["h8","f8"], c8: ["a8","d8"] }[end];
			const rook = boardArr.get(rookPath[0]);
			if(rook != null)
				gameHash ^= pieceHash(rook, rookPath[0]) ^ pieceHash(rook, rookPath[1]);
		}

		//old flag-derived state out, new state back in after the move
		gameHash ^= epHash(boardArr) ^ castleRightsHash(boardArr);
	}

	moveNoCheck(start, end, boardArr);
	updateMoveFlags(start, end, boardArr);

	if(real){
		gameHash ^= pieceHash(boardArr.get(end), end);
		gameHash ^= epHash(boardArr) ^ castleRightsHash(boardArr) ^ ZOBRIST.side;
		if(refresh)
			updateBoard();
	}

	if(refresh)
		updateValidMoveArray(boardArr);

	return true;
}

function updateValidMoveArray(boardArr = board){
	boardArr.forEach((v1, k1) => {
		if(v1 != null){
			v1.validMoves.length = 0;
			boardArr.forEach((v2,k2) => {
				if(checkMove(k1, k2, boardArr))
					v1.validMoves.push(k2);
			});
		}	
	});
}

//pure board mechanics - squares only, never piece flags. checkMove tests
//moves on Map copies that still share piece objects with the real board, so
//anything here that mutated a piece would corrupt real game state
function moveNoCheck(start, end, boardArr = board){
	if(boardArr.get(start) == null)
		return;

	//en passant - the captured pawn sits beside the destination, not on it
	if(boardArr.get(start).type == "p" && checkMoveNoHeckCheck(start, end, boardArr) == enPassant)
		boardArr.set(end.charAt(0) + start.charAt(1), null);

	boardArr.set(end, boardArr.get(start));
	boardArr.set(start, null);

	//castling - bring the rook along
	if(boardArr.get(end).type == "k" && Math.abs(posToArr(start)[0] - posToArr(end)[0]) == 2){
		if(end == "g1"){
			boardArr.set("f1", boardArr.get("h1"));
			boardArr.set("h1", null);
		} else if(end == "c1"){
			boardArr.set("d1", boardArr.get("a1"));
			boardArr.set("a1", null);
		} else if(end == "g8"){
			boardArr.set("f8", boardArr.get("h8"));
			boardArr.set("h8", null);
		} else if(end == "c8"){
			boardArr.set("d8", boardArr.get("a8"));
			boardArr.set("a8", null);
		}
	}
}

//the state transitions that outlive the move: en passant windows open and
//close, kings and rooks spend their castling rights. Only called where a
//move is actually being kept - move() for the real game, and the bot's
//search, which deep-clones its boards first - never from checkMove's
//shared-piece hypotheticals (see moveNoCheck comment)
function updateMoveFlags(start, end, boardArr = board){
	boardArr.forEach(piece => {
		if(piece != null && piece.type == "p")
			piece.twoSquareMoved = false;
	});

	const mover = boardArr.get(end);
	if(mover == null)
		return;

	if(mover.type == "p" && Math.abs(posToArr(start)[1] - posToArr(end)[1]) == 2)
		mover.twoSquareMoved = true;

	if(mover.type == "k" || mover.type == "r"){
		mover.hasMoved = true;

		//castling spends the rook's rights too
		if(mover.type == "k" && Math.abs(posToArr(start)[0] - posToArr(end)[0]) == 2){
			const rook = boardArr.get(end == "g1" ? "f1" : end == "c1" ? "d1" : end == "g8" ? "f8" : "d8");
			if(rook != null)
				rook.hasMoved = true;
		}
	}
}

function moveBoardNoCheck(start, end, boardArr = board){
	let boardPos = new Map(boardArr);
		moveNoCheck(start, end, boardPos);
		return boardPos;
}

function checkMoveNoHeckCheck(start, end, boardArr = board){
	let x1 = posToArr(start)[0];
	let x2 = posToArr(end)[0];
	let y1 = posToArr(start)[1];
	let y2 = posToArr(end)[1];
	
	let first = boardArr.get(start);
	let last = boardArr.get(end);
	
	if(start == end)
		return false;
	
	if(first == null)
		return false;
	
	if(last != null)
		if(last.color == first.color)
			return false;
	
	
	switch(first.type){		
		case "p": {
		
			if(first.color == "w")
				if(y2 < y1) 
					return false;
				
			if(first.color == "b")
				if(y2 > y1) 
					return false;
				
			if(x1 == x2){
				if(Math.abs(y2-y1) == 2){
					if(boardArr.get(arrToPos([x1,y2])) == null && boardArr.get(arrToPos([x1,(y1+y2)/2])) == null){
						if(first.color == "w"){
							if(y1 != 1)
								return false;	
						} else {
							if(y1 != 6)
								return false;
						}
					} else return false;
				} else if(Math.abs(y2-y1) == 1){
					if(boardArr.get(arrToPos([x1,y2])) != null)
						return false;
				} else return false;
			} else if(Math.abs(x1 - x2) == 1){
				if(last != null){
					if(Math.abs(y1 - y2) != 1)
						return false;
				} else {
					if(last == null){
						if(boardArr.get(arrToPos([x2,y1])) != null
							&& boardArr.get(arrToPos([x2,y2])) == null
							&& boardArr.get(arrToPos([x2,y1])).type == "p" 
							&& boardArr.get(arrToPos([x2,y1])).color != first.color 
							&& boardArr.get(arrToPos([x2,y1])).twoSquareMoved)
							return enPassant;
						else return false;
					} else return false;
				}
			} else return false;
			return true;
			break;
			
		} 
		case "n": {
		
			if(!((Math.abs(x1 - x2) == 2 && Math.abs(y1 - y2) == 1) || (Math.abs(y1 - y2) == 2 && Math.abs(x1 - x2) == 1)))
				return false;
			
			break;
			
		} 
		case "b": {
			if(Math.abs(x1 - x2) == Math.abs(y1 - y2)){
					if(x2 - x1 > 0){
						if(y2 - y1 > 0){
							for(let i = 1; i < Math.abs(x1-x2); i++)
								if(boardArr.get(arrToPos([x1+i,y1+i])) != null)
									return false;
						} else {
							for(let i = 1; i < Math.abs(x1-x2); i++)
								if(boardArr.get(arrToPos([x1+i,y1-i])) != null)
									return false;
						}
					} else {
						if(y2 - y1 > 0){ 
							for(let i = 1; i < Math.abs(x1-x2); i++)
								if(boardArr.get(arrToPos([x1-i,y1+i])) != null)
									return false;
						} else {
							for(let i = 1; i < Math.abs(x1-x2); i++)
								if(boardArr.get(arrToPos([x1-i,y1-i])) != null)
									return false;
						}
					}
				} else return false;
			
			break;
		
		}
		case "r": {
		
			if(x1 == x2){
				if(y2 - y1 > 0){
					for(let i = 1; i < Math.abs(y2-y1); i++)
						if(boardArr.get(arrToPos([x1,y1+i])) != null)
							return false;
				} else {
					for(let i = 1; i < Math.abs(y2-y1); i++)
						if(boardArr.get(arrToPos([x1,y1-i])) != null)
							return false;
				}
			} 
			
			else if(y1 == y2){
				if(x2 - x1 > 0){
					for(let i = 1; i < Math.abs(x2-x1); i++)
						if(boardArr.get(arrToPos([x1+i,y1])) != null)
							return false;
				} else {
					for(let i = 1; i < Math.abs(x2-x1); i++)
						if(boardArr.get(arrToPos([x1-i,y1])) != null)
							return false;
				}
			} else return false;
			
			break;
		
		}
		case "q": {
			
			if(Math.abs(x1 - x2) == Math.abs(y1 - y2)){
					if(x2 - x1 > 0){
						if(y2 - y1 > 0){
							for(let i = 1; i < Math.abs(x1-x2); i++)
								if(boardArr.get(arrToPos([x1+i,y1+i])) != null)
									return false;
						} else {
							for(let i = 1; i < Math.abs(x1-x2); i++)
								if(boardArr.get(arrToPos([x1+i,y1-i])) != null)
									return false;
						}
					} else {
						if(y2 - y1 > 0){ 
							for(let i = 1; i < Math.abs(x1-x2); i++)
								if(boardArr.get(arrToPos([x1-i,y1+i])) != null)
									return false;
						} else {
							for(let i = 1; i < Math.abs(x1-x2); i++)
								if(boardArr.get(arrToPos([x1-i,y1-i])) != null)
									return false;
						}
					}
			} else if(x1 == x2){
				if(y2 - y1 > 0){
					for(let i = 1; i < Math.abs(y2-y1); i++)
						if(boardArr.get(arrToPos([x1,y1+i])) != null)
							return false;
				} else {
					for(let i = 1; i < Math.abs(y2-y1); i++)
						if(boardArr.get(arrToPos([x1,y1-i])) != null)
							return false;
				}
			} 
			
			else if(y1 == y2){
				if(x2 - x1 > 0){
					for(let i = 1; i < Math.abs(x2-x1); i++)
						if(boardArr.get(arrToPos([x1+i,y1])) != null)
							return false;
				} else {
					for(let i = 1; i < Math.abs(x2-x1); i++)
						if(boardArr.get(arrToPos([x1-i,y1])) != null)
							return false;
				}
			} else return false;
			
			break;
		}
		case "k": {
			//normal one-square step - the generic checks above already cover it
			if(Math.abs(x1-x2) <= 1 && Math.abs(y1-y2) <= 1)
				break;

			//castling: two squares sideways off the home square, king never
			//moved and not in check, own unmoved rook in the corner, path
			//clear, and the square the king crosses not attacked either
			if(Math.abs(x1-x2) != 2 || y1 != y2)
				return false;

			const rank = first.color == "w" ? "1" : "8";

			if(start != "e" + rank || first.hasMoved || inHeck(boardArr, first.color))
				return false;

			if(end == "g" + rank){
				const rook = boardArr.get("h" + rank);
				if(rook == null || rook.type != "r" || rook.color != first.color || rook.hasMoved)
					return false;
				if(boardArr.get("f" + rank) != null || boardArr.get("g" + rank) != null)
					return false;
				if(inHeck(moveBoardNoCheck(start, "f" + rank, boardArr), first.color))
					return false;
			} else if(end == "c" + rank){
				const rook = boardArr.get("a" + rank);
				if(rook == null || rook.type != "r" || rook.color != first.color || rook.hasMoved)
					return false;
				if(boardArr.get("b" + rank) != null || boardArr.get("c" + rank) != null || boardArr.get("d" + rank) != null)
					return false;
				if(inHeck(moveBoardNoCheck(start, "d" + rank, boardArr), first.color))
					return false;
			} else return false;
		}
	}
	
	return true;
}
	
//the single hottest function in the engine - every legality test funnels
//through here, so it bails on the first attacker instead of scanning on
function inHeck(boardArr = board, color){
	let kingPos = null;

	for(const [sq, piece] of boardArr)
		if(piece != null && piece.type == "k" && piece.color == color){
			kingPos = sq;
			break;
		}

	if(kingPos == null)
		return false;

	for(const [sq, piece] of boardArr)
		if(piece != null && piece.color != color && checkMoveNoHeckCheck(sq, kingPos, boardArr))
			return true;

	return false;
}

function checkMateCheck(boardArr = board, color){
	
	if(!inHeck(boardArr, color))
		return false;
	
	
	return !checkForValidMoves(boardArr, color);
}	

function staleMateCheck(boardArr = board, color){

	if(inHeck(boardArr, color))
		return false;
	
	return !checkForValidMoves(boardArr, color);
}	

function otherColor(color){
	if(color == "w"){
		return "b";
	} else {
		return "w";
	}
}

function checkForValidMoves(boardArr = board, color){
	//checkMove never mutates its board (it simulates on its own copy), so no
	//defensive clone per pair - and one legal move is all this needs to find
	for(const [k1, v1] of boardArr){
		if(v1 == null || v1.color != color)
			continue;

		for(const k2 of boardArr.keys())
			if(checkMove(k1, k2, boardArr))
				return true;
	}

	return false;
}
	
	//start
	
	orientBoard();
	resetBoard();
	updateValidMoveArray(); //resetBoard only places pieces, moves are derived here
	updateBoard();
	gameHash = zobristKey(board, player); //seeded once, XOR-updated from here on
	recordPosition(); //starting position counts toward repetition too
	updateHistoryButtons();

	//history controls - each just ignores the click while its own .locked
	//class says there's nothing to do (mirrors the .choice.locked pattern
	//used for the difficulty/mode choice rows)
	const wireHistoryButton = (id, action) => {
		const btn = document.getElementById(id);
		if(btn != null)
			btn.addEventListener("click", () => { if(!btn.classList.contains("locked")) action(); });
	};

	wireHistoryButton("undo-btn", undoMove);
	wireHistoryButton("rewind-btn", () => stepHistoryView(-1));
	wireHistoryButton("redo-btn", () => stepHistoryView(1));
	wireHistoryButton("live-btn", jumpToLive);
	
	
	// move("e2","e4");
	// move("e7","e5");
	// move("f1","c4");
	// move("f8","c5");
	// move("d1","f3");
	// move("b8","c6");
	// //move("f3","f7");
	
	// document.getElementById("button").onclick = () => {
	// 	move(document.getElementById("textbox").value.charAt(0) + document.getElementById("textbox").value.charAt(1), 
	// 	document.getElementById("textbox").value.charAt(2) + document.getElementById("textbox").value.charAt(3));
	// }
	
	
	
	class engine{
		thinker = [];
		depth = -1;
		maxDepth = 5;
		thinkerProg = [];
		
		constructor(){
			if(player == "w")
				this.color = "b";
			else 
				this.color = "w";
			
			for(let i = 0; i < depth*2 + 1; i++) 
				this.thinkerProg.push(0);
			
		}
		
		move(){
			
		}
		
		returnPush(array, elem){
			let cArray = array;
			cArray.push(elem);
			return cArray;
		}
		
		parseMove(m){
			return [m.charAt(0) + m.charAt(1), m.charAt(2) + m.charAt(3)];
		}
		
		progColor(elem){
			if(elem % 2 == 0) 
				return this.color;
			else return otherColor(this.color);
		}
		
		resetThinker(){
			this.thinker = [];
			this.depth = 0;
			this.thinkerProg = [];
			for(let i = 0; i <= depth*2 + 1; i++) 
				this.thinkerProg.push(0);
		}
		
		getValidMoveArray(boardArr = board, color){
			moveArray = [];
			
			boardArr.forEach((v, k) => {
				if(v != null && v.color == color){
					v.validMoves.forEach(elem => {moveArray.push(k + elem);});
					count++;
				}
			});
			
			if(moveArray == []){
				if(checkMateCheck(boardArr, this.color))
					return ["1"];
				
				if(checkMateCheck(boardArr, otherColor(this.color)))
					return ["-1"];
				
				if(staleMateCheck(boardArr, this.color) || staleMateCheck(boardArr, otherColor(this.color)))
					return ["0"];
				
			} else return moveArray;
		}
		
		pushMove(boardArr = board){
			
			let boardPos = new Map(boardArr);
			
			let thisMove = [];
			
			for(let i = 0;; i++){
				
				let valids = getValidMoveArray(boardPos, progColor(i));
				
				if(valids[thinkerProg[i]] == "-1" || valids[thinkerProg[i]] == "1" || valids[thinkerProg[i]] == "0"){
					thisMove.push(valids[thinkerProg[i]]);
					
					for(let j = i; j < thinkerProg.length; j++)
						thisMove.push(valids[thinkerProg[i]]);
					
					break;
				} else {
					
					thisMove.push(valids[thinkerProg[i]]);
					
					if(i == thinkerProg.length - 1)
						break;
					
					
					move(...parseMove(valids[thinkerProg[i]]), boardPos);
				
				}
			}
			
			thinker.push(thisMove);
			
		}
		
		getValidMovesIt(it, boardArr = board){
			let boardPos = new Map(boardArr);
			
			for(let i = 0; i <= it; i++){
				let valids = getValidMoveArray(boardPos, progColor(i));
				
				if(valids[thinkerProg[i]] == "-1" || valids[thinkerProg[i]] == "1" || valids[thinkerProg[i]] == "0")
					return [valids[thinkerProg[i]]];
				
				 else move(...parseMove(valids[thinkerProg[i]]), boardPos);
			}
				
			return getValidMoveArray(boardPos, progColor(it));
		}
		
		// updateThinkerProg(boardArr = board){
			
		// 	let isReset = true;
			
		// 	for(let i of thinkerProg)
		// 		if(i != getValidMovesIt(i, boardArr).length - 1)
		// 			isReset = false;
			
		// 	if(isReset)
		// 		return [false, -1];
			
		// 	let currPos = thinkerProg.length - 1;
			
		// 	for(; thinkerProg[currPos] != getValidMovesIt(i, boardArr).length - 1; currPos--);
				
		// 	thinkerProg[currPos]++;
			
		// 	if(currPos != thinkerProg.length - 1){
		// 		for(let i = currPos + 1; i < thinkerProg.length; i++)
		// 		thinkerProg[i] = 0;
		// 	}
			
		// 	if(thinkerProg[currPos] == getValidMovesIt(i, boardArr).length - 1)
		// 		return [true, currPos];
		// 	else 
		// 		return [true, -1];
		// }
		
	// 	evalCut(boardArr = board){
	// 		//let currIt = thinkerProg.length - 1;
			
	// 		while(true){
	// 			pushMove(boardArr, processArray);
				
	// 			//let max;
				
	// 			let u = updateThinkerProg();
				
				
	// 			if(!u[0])
	// 				return;
				
				
	// 			if(u[1] != -1){
	// 				for(let i = 0; i < thinker.length; i++){
	// 					let boardPos = new Map(boardArr);
	// 					let subThinker = [];
						
	// 					subThinker.push(i);
						
	// 					for(let j = 0; j < thinker.length; j++){
	// 						let isSame = true;
							
	// 						if(i != j)
	// 							for(let k = 0; k <= u[1]; k++)
	// 								if(thinker[j][k] != thinker[i][k])
	// 									isSame = false;
							
	// 						if(isSame)
	// 							subThinker.push(j);
	
	// 					}
						
	// 					if(u[1] % 2 == 0){
	// 						let max = -
	// 						for(j of subThinker){
								
	// 						}
	// 					} else {
							
	// 					}		
	// 				}	
	// 			}
	// 		}
	// 	}
		
	// 	getMaterialSum(boardArr = board){
			
	// 		if(checkMateCheck(boardArr, this.color))
	// 			return -558;
			
	// 		if(checkMateCheck(boardArr, otherColor(this.color)))
	// 			return 558;
			
			
	// 		if(staleMateCheck(boardArr, this.color) || staleMateCheck(boardArr, otherColor(this.color)))
	// 			return 0;
				
	// 		let sum = 0; 
			
	// 		boardArr.forEach(v => {
	// 			if(v != null && v.color == this.color){
	// 				sum+=v.material;
	// 			}
	// 		})
			
	// 		boardArr.forEach(v => {
	// 			if(v != null && v.color != this.color){
	// 				sum-=v.material;
	// 			}
	// 		})
			
	// 		return sum;
	// 	}
	}