//bot for mode=bot, minimax with depth per difficulty (novice/club/master -
//engine stays locked in setup.html, no depth mapped for it yet)
//inert on every other page/mode - only does anything once player color check below passes

const mode = new URLSearchParams(window.location.search).get("mode");

if(mode === "bot"){

	const BOT_COLOR = "b";

	//init.js premove support keys off this: it marks whose pieces may be
	//picked up while the board is locked for the bot's think
	window.HUMAN_COLOR = "w";

	const DEPTH_BY_DIFFICULTY = { novice: 2, club: 3, master: 4 };
	const difficulty = new URLSearchParams(window.location.search).get("difficulty");
	const BOT_DEPTH = DEPTH_BY_DIFFICULTY[difficulty] || DEPTH_BY_DIFFICULTY.novice;

	//novice stays a pure bean-counter - only club and master get the positional eval
	const SMART_EVAL = BOT_DEPTH >= 3;

	//how much heavy material is still around, 24 = fresh board. drives the blend
	//between middlegame and endgame scoring below
	const PHASE_WEIGHT = { p: 0, n: 1, b: 1, r: 2, q: 4, k: 0 };

	//piece-square tables, read like a diagram: first row is rank 8, columns a-h,
	//centipawns from white's side (black mirrors the rank). the classic
	//"simplified evaluation function" numbers - pawns and minors get paid for the
	//center, knights hate the rim, rooks like the 7th
	const PST = {
		p: [
			[  0,  0,  0,  0,  0,  0,  0,  0],
			[ 50, 50, 50, 50, 50, 50, 50, 50],
			[ 10, 10, 20, 30, 30, 20, 10, 10],
			[  5,  5, 10, 25, 25, 10,  5,  5],
			[  0,  0,  0, 20, 20,  0,  0,  0],
			[  5, -5,-10,  0,  0,-10, -5,  5],
			[  5, 10, 10,-20,-20, 10, 10,  5],
			[  0,  0,  0,  0,  0,  0,  0,  0]
		],
		n: [
			[-50,-40,-30,-30,-30,-30,-40,-50],
			[-40,-20,  0,  0,  0,  0,-20,-40],
			[-30,  0, 10, 15, 15, 10,  0,-30],
			[-30,  5, 15, 20, 20, 15,  5,-30],
			[-30,  0, 15, 20, 20, 15,  0,-30],
			[-30,  5, 10, 15, 15, 10,  5,-30],
			[-40,-20,  0,  5,  5,  0,-20,-40],
			[-50,-40,-30,-30,-30,-30,-40,-50]
		],
		b: [
			[-20,-10,-10,-10,-10,-10,-10,-20],
			[-10,  0,  0,  0,  0,  0,  0,-10],
			[-10,  0,  5, 10, 10,  5,  0,-10],
			[-10,  5,  5, 10, 10,  5,  5,-10],
			[-10,  0, 10, 10, 10, 10,  0,-10],
			[-10, 10, 10, 10, 10, 10, 10,-10],
			[-10,  5,  0,  0,  0,  0,  5,-10],
			[-20,-10,-10,-10,-10,-10,-10,-20]
		],
		r: [
			[  0,  0,  0,  0,  0,  0,  0,  0],
			[  5, 10, 10, 10, 10, 10, 10,  5],
			[ -5,  0,  0,  0,  0,  0,  0, -5],
			[ -5,  0,  0,  0,  0,  0,  0, -5],
			[ -5,  0,  0,  0,  0,  0,  0, -5],
			[ -5,  0,  0,  0,  0,  0,  0, -5],
			[ -5,  0,  0,  0,  0,  0,  0, -5],
			[  0,  0,  0,  5,  5,  0,  0,  0]
		],
		q: [
			[-20,-10,-10, -5, -5,-10,-10,-20],
			[-10,  0,  0,  0,  0,  0,  0,-10],
			[-10,  0,  5,  5,  5,  5,  0,-10],
			[ -5,  0,  5,  5,  5,  5,  0, -5],
			[  0,  0,  5,  5,  5,  5,  0, -5],
			[-10,  5,  5,  5,  5,  5,  0,-10],
			[-10,  0,  5,  0,  0,  0,  0,-10],
			[-20,-10,-10, -5, -5,-10,-10,-20]
		]
	};

	//two king tables blended by phase: early it pays to castle and hide behind
	//pawns, late the king has to come out and work
	const PST_KING_MG = [
		[-30,-40,-40,-50,-50,-40,-40,-30],
		[-30,-40,-40,-50,-50,-40,-40,-30],
		[-30,-40,-40,-50,-50,-40,-40,-30],
		[-30,-40,-40,-50,-50,-40,-40,-30],
		[-20,-30,-30,-40,-40,-30,-30,-20],
		[-10,-20,-20,-20,-20,-20,-20,-10],
		[ 20, 20,  0,  0,  0,  0, 20, 20],
		[ 20, 30, 10,  0,  0, 10, 30, 20]
	];
	const PST_KING_EG = [
		[-50,-40,-30,-20,-20,-30,-40,-50],
		[-30,-20,-10,  0,  0,-10,-20,-30],
		[-30,-10, 20, 30, 30, 20,-10,-30],
		[-30,-10, 30, 40, 40, 30,-10,-30],
		[-30,-10, 30, 40, 40, 30,-10,-30],
		[-30,-10, 20, 30, 30, 20,-10,-30],
		[-30,-30,  0,  0,  0,  0,-30,-30],
		[-50,-30,-30,-30,-30,-30,-30,-50]
	];

	//endgame pawn table - placement stops mattering, distance to promotion is all
	const PST_PAWN_EG = [
		[  0,  0,  0,  0,  0,  0,  0,  0],
		[ 80, 80, 80, 80, 80, 80, 80, 80],
		[ 50, 50, 50, 50, 50, 50, 50, 50],
		[ 30, 30, 30, 30, 30, 30, 30, 30],
		[ 20, 20, 20, 20, 20, 20, 20, 20],
		[ 10, 10, 10, 10, 10, 10, 10, 10],
		[ 10, 10, 10, 10, 10, 10, 10, 10],
		[  0,  0,  0,  0,  0,  0,  0,  0]
	];

	function pstValue(table, color, file, rank){
		return table[color == "w" ? 7 - rank : rank][file];
	}

	function clonePiece(orig){
		if(orig == null)
			return null;

		let copy;
		switch(orig.type){
			case "p": copy = new p(orig.color, orig.pos); copy.twoSquareMoved = orig.twoSquareMoved; break;
			case "n": copy = new n(orig.color, orig.pos); break;
			case "b": copy = new b(orig.color, orig.pos); break;
			case "r": copy = new r(orig.color, orig.pos); copy.hasMoved = orig.hasMoved; break;
			case "q": copy = new q(orig.color, orig.pos); break;
			case "k": copy = new k(orig.color, orig.pos); copy.hasMoved = orig.hasMoved; break;
		}
		return copy;
	}

	function cloneBoard(boardArr){
		const copy = new Map();
		boardArr.forEach((v, k) => copy.set(k, clonePiece(v)));
		return copy;
	}

	//own move generator instead of updateValidMoveArray - that recomputes
	//BOTH colors' moves every call, and we only ever want one side at a time here
	function legalMoves(boardArr, color){
		const moves = [];
		boardArr.forEach((piece, from) => {
			if(piece == null || piece.color != color)
				return;
			boardArr.forEach((_, to) => {
				if(checkMove(from, to, boardArr))
					moves.push([from, to]);
			});
		});
		return moves;
	}

	//ordering so alpha-beta prunes far more - captures first (biggest victim,
	//smallest attacker), then quiet moves by how much their square improves
	function moveScore(boardArr, from, to){
		const victim = boardArr.get(to);
		const mover = boardArr.get(from);

		if(victim != null)
			return 100000 + victim.material * 10 - mover.material;

		if(SMART_EVAL && PST[mover.type] != null){
			const [ff, fr] = posToArr(from);
			const [tf, tr] = posToArr(to);
			return pstValue(PST[mover.type], mover.color, tf, tr)
			     - pstValue(PST[mover.type], mover.color, ff, fr);
		}

		return 0;
	}

	function orderMoves(boardArr, moves){
		return moves
			.map(m => [moveScore(boardArr, m[0], m[1]), m])
			.sort((a, b) => b[0] - a[0])
			.map(pair => pair[1]);
	}

	//centipawns, positive = good for the bot. material always; on club/master
	//also piece placement (tapered mg/eg), passed pawns, a middlegame pawn
	//shield in front of the king, and a mop-up push in won endgames
	function evaluate(boardArr){
		let score = 0;
		let material = 0;
		let phase = 0;
		const kings = {};
		const pawns = { w: [], b: [] };

		boardArr.forEach((piece, sq) => {
			if(piece == null)
				return;

			const sign = piece.color == BOT_COLOR ? 1 : -1;
			score += sign * piece.material * 100;
			material += sign * piece.material * 100;

			if(!SMART_EVAL)
				return;

			phase += PHASE_WEIGHT[piece.type];
			const [file, rank] = posToArr(sq);

			if(piece.type == "k")
				kings[piece.color] = [file, rank];
			else if(piece.type == "p")
				pawns[piece.color].push([file, rank]);
			else
				score += sign * pstValue(PST[piece.type], piece.color, file, rank);
		});

		if(!SMART_EVAL)
			return score;

		const mg = Math.min(phase, 24) / 24; //1 = full middlegame, 0 = bare-kings endgame

		//pawns per file, for spotting isolated and doubled pawns below
		const fileCounts = { w: [0,0,0,0,0,0,0,0], b: [0,0,0,0,0,0,0,0] };
		for(const color of ["w", "b"])
			for(const [file] of pawns[color])
				fileCounts[color][file]++;

		for(const color of ["w", "b"]){
			const sign = color == BOT_COLOR ? 1 : -1;
			const enemy = pawns[otherColor(color)];

			for(const [file, rank] of pawns[color]){
				//isolated - no friendly pawn on either adjacent file, so
				//nothing can ever defend it
				if((file == 0 || fileCounts[color][file - 1] == 0) && (file == 7 || fileCounts[color][file + 1] == 0))
					score -= sign * 15;

				//doubled - stacked pawns block each other's way forward
				if(fileCounts[color][file] > 1)
					score -= sign * 8;
				//placement early, raw promotion distance late
				score += sign * Math.round(
					pstValue(PST.p, color, file, rank) * mg +
					pstValue(PST_PAWN_EG, color, file, rank) * (1 - mg));

				//passed pawn - no enemy pawn can ever block or capture it
				let passed = true;
				for(const [ef, er] of enemy)
					if(Math.abs(ef - file) <= 1 && (color == "w" ? er > rank : er < rank)){
						passed = false;
						break;
					}

				if(passed){
					const advance = color == "w" ? rank : 7 - rank;
					score += sign * Math.round((10 + advance * advance * 4) * (1.4 - mg));
				}
			}

			if(kings[color] == null)
				continue;

			const [kf, kr] = kings[color];

			//castle and hide early, centralize late
			score += sign * Math.round(
				pstValue(PST_KING_MG, color, kf, kr) * mg +
				pstValue(PST_KING_EG, color, kf, kr) * (1 - mg));

			//pawn shield - own pawns one or two squares in front of the king
			if(mg > .5){
				let shield = 0;
				for(const [pf, pr] of pawns[color]){
					const steps = color == "w" ? pr - kr : kr - pr;
					if(Math.abs(pf - kf) <= 1 && steps >= 1 && steps <= 2)
						shield += steps == 1 ? 12 : 6;
				}
				score += sign * Math.round(shield * mg);
			}
		}

		//mop-up: clearly ahead with little left - corner their king and walk ours
		//over, since a lone queen or rook can't mate without the king's help
		if(mg < .4 && Math.abs(material) >= 300 && kings.w != null && kings.b != null){
			const loserColor = material > 0 ? otherColor(BOT_COLOR) : BOT_COLOR;
			const [lf, lr] = kings[loserColor];
			const cornered = Math.max(Math.abs(lf - 3.5), Math.abs(lr - 3.5)) * 2;
			//chebyshev, not manhattan - kings cover diagonals at full speed, and
			//manhattan rates a diagonal approach as no progress, which left the
			//king shuffling on an eval plateau instead of walking in for the mate
			const kingGap = Math.max(Math.abs(kings.w[0] - kings.b[0]), Math.abs(kings.w[1] - kings.b[1]));
			score += (material > 0 ? 1 : -1) * Math.round((cornered * 16 + (8 - kingGap) * 14) * (1 - mg));
		}

		return score;
	}

	//checkmate/stalemate has to be checked at every ply, leaf included - skipping it
	//at the leaf (the old bug) means the search is blind to "opponent's very next
	//reply is mate", which is exactly how it walked into things like Scholar's Mate
	function search(boardArr, depth, alpha, beta, color){
		const moves = orderMoves(boardArr, legalMoves(boardArr, color));

		//mate score dwarfs any possible eval (max material+position is ~5000cp);
		//the +depth prefers the fastest mate among several
		if(moves.length === 0)
			return inHeck(boardArr, color) ? (color == BOT_COLOR ? -100000 - depth : 100000 + depth) : 0;

		if(depth === 0)
			return evaluate(boardArr);

		const maximizing = color == BOT_COLOR;
		let best = maximizing ? -Infinity : Infinity;

		for(const [from, to] of moves){
			const next = cloneBoard(boardArr);
			moveNoCheck(from, to, next);
			updateMoveFlags(from, to, next); //clone owns its pieces, safe to flag
			if(needsPromotion(to, next))
				promote(to, "q", next); //always queen in search - simplest reasonable assumption
			const score = search(next, depth - 1, alpha, beta, otherColor(color));

			if(maximizing){
				if(score > best) best = score;
				if(best > alpha) alpha = best;
			} else {
				if(score < best) best = score;
				if(best < beta) beta = best;
			}
			if(alpha >= beta)
				break;
		}
		return best;
	}

	//zobrist hashes of positions the bot has already produced this game,
	//penalized at the root so a won endgame doesn't shuffle the same two
	//positions until the threefold rule hands the opponent a draw
	const seenAfterBotMove = new Map();

	function recordBotPosition(){
		seenAfterBotMove.set(gameHash, (seenAfterBotMove.get(gameHash) || 0) + 1);
	}

	//async so it can yield between root moves - a synchronous search blocks
	//the whole main thread for its entire duration, which starves every other
	//timer including the game clock's setInterval (JS runs one macrotask at a
	//time, so nothing else - not even a 100ms tick - can fire mid-computation).
	//The total time billed is still correct either way (clockTick reads real
	//elapsed wall time), but without yielding the clock visibly freezes for
	//the whole think and then jumps, instead of ticking down normally
	async function chooseBotMove(depth){
		const moves = orderMoves(board, legalMoves(board, BOT_COLOR));
		let bestMove = null;
		let bestScore = -Infinity;
		let alpha = -Infinity;

		for(const [from, to] of moves){
			const next = cloneBoard(board);
			moveNoCheck(from, to, next);
			updateMoveFlags(from, to, next);
			if(needsPromotion(to, next))
				promote(to, "q", next);
			let score = search(next, depth - 1, alpha, Infinity, otherColor(BOT_COLOR));
			score -= 45 * (seenAfterBotMove.get(zobristKey(next, otherColor(BOT_COLOR))) || 0);

			if(score > bestScore){
				bestScore = score;
				bestMove = [from, to];
			}
			if(bestScore > alpha)
				alpha = bestScore;

			await new Promise(resolve => setTimeout(resolve, 0));
		}
		return bestMove;
	}

	//shared tail end for both a book move and a searched move - applies it to
	//the real board, handles promotion, and passes the turn back
	function applyBotMove(from, to){
		//captured before move() mutates the board - see the matching comment
		//in init.js's completeMove()
		const capture = board.get(to) != null || (board.get(from).type == "p" && from.charAt(0) != to.charAt(0));
		const resetClock = capture || board.get(from).type == "p";
		lastMoveCapture = capture;

		move(from, to);
		moveHistory.push(from + to);
		updateOpeningName();
		halfmoveClock = resetClock ? 0 : halfmoveClock + 1;

		if(needsPromotion(to)){
			promote(to, "q");
			promotions[moveHistory.length - 1] = "q";
			updateValidMoveArray(board);
			updateBoard();
		}

		recordBotPosition();

		player = otherColor(player);
		updateCheckHighlight();
		recordPosition();
		syncViewToLive(); //if the human wound the viewer back mid-think, snap it forward again

		//same shortcut as init.js's finishTurn - the validMoves lists were just
		//recomputed for this position, so mate/stalemate reads them directly
		let anyMoves = false;
		board.forEach(piece => {
			if(piece != null && piece.color == player && piece.validMoves.length > 0)
				anyMoves = true;
		});

		const inCheck = inHeck(board, player);
		const mate = !anyMoves && inCheck;
		const stale = !anyMoves && !inCheck;
		const over = mate || stale || halfmoveClock >= 100 || isThreefoldRepetition();

		if(typeof clockOnMove == "function")
			clockOnMove(over);

		if(typeof playSound == "function")
			playSound(mate ? "checkmate" : inCheck ? "check" : capture ? "capture" : "move");

		const winner = otherColor(player) == "w" ? "White" : "Black";
		if(mate)
			showGameOverModal("Checkmate!", winner + " wins.");
		else if(stale)
			showGameOverModal("Stalemate!", "It's a draw.");
		else if(halfmoveClock >= 100)
			showGameOverModal("Draw", "50 moves with no pawn move or capture.");
		else if(isThreefoldRepetition())
			showGameOverModal("Draw", "Same position repeated three times.");

		window.boardLocked = false;

		//a premove queued during the think fires now - tiny delay so the
		//bot's own move is visible on the board for a beat first
		if(!over && typeof executePremove == "function")
			setTimeout(executePremove, 120);
	}

	window.afterPlayerMove = function(){
		if(player !== BOT_COLOR)
			return;

		window.boardLocked = true;

		//book moves stay quiet here - applyBotMove's own updateOpeningName() call
		//announces whatever the resulting position is actually named, once it's
		//actually been played, instead of previewing a guess before it lands
		const book = typeof pickBookMove === "function" ? pickBookMove(moveHistory) : null;
		if(book != null){
			setTimeout(() => applyBotMove(book.from, book.to), 400);
			return;
		}

		showToast("Bot is thinking...");

		//let the toast paint before the search starts - chooseBotMove is now
		//async and yields between root moves, so the game clock keeps ticking
		//visibly throughout instead of freezing for the whole think
		setTimeout(async () => {
			const chosen = await chooseBotMove(BOT_DEPTH);
			if(chosen != null)
				applyBotMove(chosen[0], chosen[1]);
			else
				window.boardLocked = false;
		}, 60);
	};
}
