//bot for mode=bot, minimax with depth per difficulty (novice/club/master -
//engine stays locked in setup.html, no depth mapped for it yet)
//inert on every other page/mode - only does anything once player color check below passes

const mode = new URLSearchParams(window.location.search).get("mode");

if(mode === "bot"){

	const BOT_COLOR = "b";
	const DEPTH_BY_DIFFICULTY = { novice: 2, club: 3, master: 4 };
	const difficulty = new URLSearchParams(window.location.search).get("difficulty");
	const BOT_DEPTH = DEPTH_BY_DIFFICULTY[difficulty] || DEPTH_BY_DIFFICULTY.novice;

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

	//cheap MVV-LVA-ish ordering so alpha-beta prunes far more - captures first,
	//biggest victim/smallest attacker first, quiet moves left in generated order
	function orderMoves(boardArr, moves){
		return moves.slice().sort((a, b) => {
			const capA = boardArr.get(a[1]);
			const capB = boardArr.get(b[1]);
			const scoreA = capA != null ? capA.material * 10 - boardArr.get(a[0]).material : -1;
			const scoreB = capB != null ? capB.material * 10 - boardArr.get(b[0]).material : -1;
			return scoreB - scoreA;
		});
	}

	function evaluate(boardArr){
		let score = 0;
		boardArr.forEach(piece => {
			if(piece != null)
				score += (piece.color == BOT_COLOR ? 1 : -1) * piece.material;
		});
		return score;
	}

	//checkmate/stalemate has to be checked at every ply, leaf included - skipping it
	//at the leaf (the old bug) means the search is blind to "opponent's very next
	//reply is mate", which is exactly how it walked into things like Scholar's Mate
	function search(boardArr, depth, alpha, beta, color){
		const moves = orderMoves(boardArr, legalMoves(boardArr, color));

		if(moves.length === 0)
			return inHeck(boardArr, color) ? (color == BOT_COLOR ? -9000 - depth : 9000 + depth) : 0;

		if(depth === 0)
			return evaluate(boardArr);

		const maximizing = color == BOT_COLOR;
		let best = maximizing ? -Infinity : Infinity;

		for(const [from, to] of moves){
			const next = cloneBoard(boardArr);
			moveNoCheck(from, to, next);
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

	function chooseBotMove(depth){
		const moves = orderMoves(board, legalMoves(board, BOT_COLOR));
		let bestMove = null;
		let bestScore = -Infinity;
		let alpha = -Infinity;

		for(const [from, to] of moves){
			const next = cloneBoard(board);
			moveNoCheck(from, to, next);
			if(needsPromotion(to, next))
				promote(to, "q", next);
			const score = search(next, depth - 1, alpha, Infinity, otherColor(BOT_COLOR));

			if(score > bestScore){
				bestScore = score;
				bestMove = [from, to];
			}
			if(bestScore > alpha)
				alpha = bestScore;
		}
		return bestMove;
	}

	//shared tail end for both a book move and a searched move - applies it to
	//the real board, handles promotion, and passes the turn back
	function applyBotMove(from, to){
		move(from, to);
		moveHistory.push(from + to);
		updateOpeningName();

		if(needsPromotion(to)){
			promote(to, "q");
			updateValidMoveArray(board);
			updateBoard();
		}

		player = otherColor(player);
		updateCheckHighlight();

		const winner = otherColor(player) == "w" ? "White" : "Black";
		if(checkMateCheck(board, player))
			showGameOverModal("Checkmate!", winner + " wins.");
		else if(staleMateCheck(board, player))
			showGameOverModal("Stalemate!", "It's a draw.");

		window.boardLocked = false;
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

		//let the toast paint before the search blocks the main thread
		setTimeout(() => {
			const chosen = chooseBotMove(BOT_DEPTH);
			if(chosen != null)
				applyBotMove(chosen[0], chosen[1]);
			else
				window.boardLocked = false;
		}, 60);
	};
}
