//novice bot for mode=bot, 2-ply minimax on material, other difficulty tiers stay locked in setup.html
//inert on every other page/mode - only does anything once player color check below passes

const mode = new URLSearchParams(window.location.search).get("mode");

if(mode === "bot"){

	const BOT_COLOR = "b";
	const BOT_DEPTH = 2;

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

	//validMoves is only trustworthy right after updateValidMoveArray runs on that exact board
	function legalMoves(boardArr, color){
		updateValidMoveArray(boardArr);
		const moves = [];
		boardArr.forEach((piece, from) => {
			if(piece != null && piece.color == color)
				piece.validMoves.forEach(to => moves.push([from, to]));
		});
		return moves;
	}

	function evaluate(boardArr){
		let score = 0;
		boardArr.forEach(piece => {
			if(piece != null)
				score += (piece.color == BOT_COLOR ? 1 : -1) * piece.material;
		});
		return score;
	}

	//alpha-beta, terminal (checkmate/stalemate) only checked where we already generated moves for real
	function search(boardArr, depth, alpha, beta, color){
		if(depth === 0)
			return evaluate(boardArr);

		const moves = legalMoves(boardArr, color);
		if(moves.length === 0)
			return inHeck(boardArr, color) ? (color == BOT_COLOR ? -9000 - depth : 9000 + depth) : 0;

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

	function chooseBotMove(){
		const moves = legalMoves(board, BOT_COLOR);
		let bestMove = null;
		let bestScore = -Infinity;
		let alpha = -Infinity;

		for(const [from, to] of moves){
			const next = cloneBoard(board);
			moveNoCheck(from, to, next);
			if(needsPromotion(to, next))
				promote(to, "q", next);
			const score = search(next, BOT_DEPTH - 1, alpha, Infinity, otherColor(BOT_COLOR));

			if(score > bestScore){
				bestScore = score;
				bestMove = [from, to];
			}
			if(bestScore > alpha)
				alpha = bestScore;
		}
		return bestMove;
	}

	window.afterPlayerMove = function(){
		if(player !== BOT_COLOR)
			return;

		window.boardLocked = true;
		showToast("Bot is thinking...");

		//let the toast paint before the search blocks the main thread
		setTimeout(() => {
			const chosen = chooseBotMove();
			if(chosen != null){
				move(chosen[0], chosen[1]);

				if(needsPromotion(chosen[1])){
					promote(chosen[1], "q");
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
			}
			window.boardLocked = false;
		}, 60);
	};
}
