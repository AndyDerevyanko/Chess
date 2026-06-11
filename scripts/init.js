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

function resetBoard(){
	clearBoard(board);
	
	board.set("a1", new r("w", "a1"));
	board.set("b1", new n("w", "b1"));
	board.set("c1", new b("w", "c1"));
	board.set("d1", new q("w", "d1"));
	board.set("e1", new k("w", "e1"));
	board.set("f1", new b("w", "f1"));
	board.set("g1", new n("w", "g1"));
	board.set("h1", new r("w", "h1"));
	
	for(let i = 0; i < 8; i++){
		board.set(intToRank(i)+"2", new p("w", intToRank(i)+"2"));
	}
	
	board.set("a8", new r("b", "a8"));
	board.set("b8", new n("b", "b8"));
	board.set("c8", new b("b", "c8"));
	board.set("d8", new q("b", "d8"));
	board.set("e8", new k("b", "e8"));
	board.set("f8", new b("b", "f8"));
	board.set("g8", new n("b", "g8"));
	board.set("h8", new r("b", "h8"));
	
	for(let i = 0; i < 8; i++){
		board.set(intToRank(i)+"7", new p("b", intToRank(i)+"7"));
	}
	
	board.forEach((v1, k1) =>{
		if(v1 != null)
			board.forEach((v2,k2) => {
				if(checkMove(k1, k2))
					v1.validMoves.push(k2);
			});
	}); 
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
	
	
}

function updateBoard(){
	for(const [i,j] of board){
		drawPiece(j, i);
	}
}

function orientBoard(){
	document.getElementById("boardContainer").innerHTML = "";
	for(let i = 0; i < 64; i++){
		let x = Math.floor(i/8)+8*(i-8*Math.floor(i/8));
		document.getElementById("boardContainer").appendChild(initialize()[16*Math.floor(x/8)+7-x]); 
	}
	updateBoard();
}

function orientBoardR(){
	document.getElementById("boardContainer").innerHTML = "";
	for(let i = 63; i >= 0; i--){
		let x = Math.floor(i/8)+8*(i-8*Math.floor(i/8));
		document.getElementById("boardContainer").appendChild(initialize()[16*Math.floor(x/8)+7-x]); 
	}
	updateBoard();
}

function initialize(){
			
	let elem = [];
	
	for(let i = 0; i < 64; i++){
		elem.push(document.createElement("div"));
		elem[i].id = numToPos(i);
		
		if((Math.floor(i/8) % 2 == 0 && i % 2 == 0) || (Math.floor(i/8) % 2 == 1 && i % 2 == 1)){
			elem[i].style.backgroundColor = "brown";
		} else {
			elem[i].style.backgroundColor = "yellow";
		}
		
		elem[i].style.minHeight = "12.5%";
		elem[i].style.minWidth = "12.5%";
		elem[i].style.maxHeight = "12.5%";
		elem[i].style.maxWidth = "12.5%";
		elem[i].style.display = "flex";
		elem[i].style.justifyContent = "center";
		
		board.set(elem[i].id, null);
		
		elem[i].addEventListener("click", () => {
			if(board.get(elem[i].id) != null){
				if(document.getElementsByClassName("marker" + elem[i].id).length != 0){
					document.querySelectorAll("[alt=marker]").forEach(element => element.remove());
					Array.from(document.getElementsByClassName("marker")).forEach(element => element.remove());
				} else {
					document.querySelectorAll("[alt=marker]").forEach(element => element.remove());
					Array.from(document.getElementsByClassName("marker")).forEach(element => element.remove());
					
					for(j of board.get(elem[i].id).validMoves){
						let marker = document.createElement("div");
						let markerImg = document.createElement("img");
						marker.className = "marker";
						marker.id = "marker" + elem[i].id + j;
						marker.alt = "marker";
						marker.zIndex = "1";
						marker.position = "relative";
						marker.style.height = "100%";
						marker.style.width = "100%";
						markerImg.style.height = "80%";
						markerImg.style.marginLeft = "10%";
						markerImg.style.marginTop = "10%";
						markerImg.src = "images/board/selection.png";
						markerImg.alt = "marker";
						markerImg.style.filter = "opacity(30%)";
						marker.appendChild(markerImg);
						document.getElementById(j).appendChild(marker);
					}
				}
			} else throw "square is null?";
		});
	}
	return elem;
}

function checkMove(start, end, boardArr = board){
	return checkMoveNoHeckCheck(start, end, boardArr) && !inHeck(moveBoardNoCheck(start, end, boardArr), boardArr.get(start).color);
}

function move(start, end, boardArr = board){
	if(checkMoveNoHeckCheck(start, end, boardArr) && !inHeck(moveBoardNoCheck(start, end, boardArr), boardArr.get(start).color) /*&& boardArr.get(start).color == player*/){
		moveNoCheck(start, end, boardArr);
	} else return false; 
			
	
	if(boardArr == board)
		updateBoard();
	
	if(checkMateCheck(boardArr, otherColor(boardArr.get(end).color)) && boardArr == board){
		console.log("checkmate!");
	}
	
	if(staleMateCheck(boardArr, otherColor(boardArr.get(end).color)) && boardArr == board){
		console.log("stalemate!");
	}
	
	boardArr.forEach((v1, k1) => {
		if(v1 != null){
			v1.validMoves.length = 0;
			boardArr.forEach((v2,k2) => {
				if(checkMove(k1, k2, boardArr))
					v1.validMoves.push(k2);
			});
		}	
	});
	
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

function moveNoCheck(start, end, boardArr = board){
	//try{
	if(boardArr.get(start) == null)
		return;
	
	boardArr.forEach(v => {
		if(v != null){
			if(v.type == "p"){
				v.twoSquareMoved = false;
			}
		}
		})
		
	if(boardArr.get(end) != null){
		if((Math.abs(posToArr(start)[1] - posToArr(end)[1]) == 2) && boardArr.get(start).type == "p")
			boardArr.get(end).twoSquareMoved = true;
		
		if(boardArr.get(end).type == "r" || boardArr.get(start).type == "k")
			boardArr.get(end).hasMoved = true;


		if(checkMoveNoHeckCheck(start, end) == enPassant)
			boardArr.set(end.charAt(0) + start.charAt(1), null);
	}
	
	boardArr.set(end, boardArr.get(start));
	boardArr.set(start, null);

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
	//} catch(error) {
		//console.log(boardArr);
		//console.log(start, end);
	//}
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
			if(!((Math.abs(x1-x2) == 1 || Math.abs(x1-x2) == 0) && (Math.abs(y1-y2) == 1 || Math.abs(y1-y2) == 0))){
				if(first.color == "w"){
					if(Math.abs(x1-x2) == 2 && start == "e1" && boardArr.get(start).hasMoved == false && !first.inCheck()){
						if(end == "g1"){
							if(boardArr.get("h1") == null || boardArr.get("h1").type != "r" || boardArr.get("h1").hasMoved)
								if(boardArr.get("f1") != null || boardArr.get("g1") != null)
									return false;
						} else if(end == "c1") {
							if(boardArr.get("a1") == null || boardArr.get("a1").type != "r" || boardArr.get("a1").hasMoved)
								if(boardArr.get("b1") != null || boardArr.get("c1") != null || boardArr.get("d1") != null)
									return false;
						} else return false;
					} else return false;
				} else {
					if(Math.abs(x1-x2) == 2 && start == "e8" && boardArr.get(start).hasMoved == false && !first.inCheck()){
						if(end == "g8") {
							if(boardArr.get("h8") == null || boardArr.get("h8").type != "r" || boardArr.get("h8").hasMoved)
								if(boardArr.get("f8") != null || boardArr.get("g8") != null)
									return false;
						} else if(end == "c8") {
							if(boardArr.get("a8") == null || boardArr.get("a8").type != "r" || boardArr.get("a8").hasMoved)
								if(boardArr.get("b8") != null || boardArr.get("c8") != null || boardArr.get("d8") != null)
									return false;
						} else return false;
					} else return false;
				}
			}
		}
	}
	
	return true;
}
	
function inHeck(boardArr = board, color){
	if(boardArr.length == 0)
		return false;
	
	var kingPos;
	let returnStatement = false;
	
	if(color == "w"){
		boardArr.forEach((v, k) => {
			if(v != null && v.type == "k" && v.color == "w")
				kingPos = k;
		});
		
		boardArr.forEach((v, k) => {
			if(v != null && v.color == "b"){
				if(checkMoveNoHeckCheck(k, kingPos, boardArr))
					returnStatement = true;
			}
		});
	} else if(color == "b"){
		boardArr.forEach((v, k) => {
			if(v != null && v.type == "k" && v.color == "b")
				kingPos = k;
		});
		
		boardArr.forEach((v, k) => {
			if(v != null && v.color == "w"){
				if(checkMoveNoHeckCheck(k, kingPos, boardArr))
					returnStatement = true;
			}
		});
	} else throw ("undefined color");
	return returnStatement;
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
	
	let returnStatement = false;
	
	boardArr.forEach((v1, k1) => {
		boardArr.forEach((v2, k2) => {
			let boardPos = new Map(boardArr);
			if(v1 != null && v1.color == color && checkMove(k1, k2, boardPos))
				returnStatement = true;
		});
	});
	
	return returnStatement;
}
	
	//start
	
	orientBoard();
	resetBoard();
	updateBoard();
	
	
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