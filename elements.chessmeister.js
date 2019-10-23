/**
 * DISCLAIMER
 * This project is NOT about Chess! 
 * The topic of Chess was chosen for educational purposes to demonstrate W3C Standard Custom Elements, CSS Grid and Native JavaScript DOM performance
 * 
 * License: UNlicense - https://unlicense.org/
 * 
 * 
 * Autonomous Custom Elements:
 *  <chessmeister-board>
 *  <board-layer>
 *
 * Extended Buil-In Elements:
 *  <img is=white-pawn />
 *  <img is=black-rook />
 *  <img is=...-knight />
 *  <img is=...-bishop />
 *  <img is=...-queen />
 *  <img is=...-king />
 */

// Custom Element names
const ChesslyNameSpace = "chessmeister";
const ChesslyBoardLayer = ChesslyNameSpace + "-board-layer";
const ChesslySquareNameSpace = ChesslyNameSpace + "-square-";
const ChesslyBoardSquareWhite = ChesslySquareNameSpace + "white";
const ChesslyBoardSquareBlack = ChesslySquareNameSpace + "black";

/**
 * returns True/False indicating odd value (for both negative and positive x)
 * @param {number} x
 */
let isOdd = x => (x === 0 ? false : (x & -x) === 1); // isOdd returns T/F for negative and possible values

/**
 * chunck a string in equal sizes
 * @param {array} arr - input array 
 * @param {number} size
 */
let chunk = (
  arr, // input Array
  size, // chunk size
  //declare helper array
  result = [] // result: initialized on first call, set in recursion call
) => (
    result.push(arr.splice(0, size))  // push first size chunk
    ,
    result.concat(                    // process remaining chunk
      arr.length
        ? chunk(arr, size)
        : []                          // concat needs an argument , [] is concatted last!
    )
  );

/**
 * extend Array to store board destinations for every chess piece 
 * adds Chess related methods
 * @param {board} board - reference to chessmeister-board this array applies to
 */
class ChessPieceDestinations extends Array {
  constructor(board) {
    super();
    this.board = board;
  }
  _filter(char = ___SQUARE_ATTACK_MARKER___) {
    return this.filter(location => location.length > 2 && location[2] === char)
  }
  get attacks() {// get X marked locations
    return this._filter(___SQUARE_ATTACK_MARKER___);
  }
  get defends() {// get Z marked locations
    return this._filter(___SQUARE_DEFEND_MARKER___);
  }
  get pieces() {// gets all pieces in current piece destination square
    return this.map(square => this.board.piece(squarenameUpperCase(square)));
  }
  //todo get undefened(){// get destination squares that are not defended
  // requires analysis of whole board
  //}
}

/**
 * WORK IN PROGRESS
 * extend Event 
 * @param - default Event parameters
 */
class ChesslyEvent extends Event {//! buggy in Edge and Safari! requires changing prototype workaround
  constructor(typeArg, eventInit) {
    super(typeArg, eventInit);
    this.newState = eventInit.newState;
  }
}

// myElem.dispatchEvent(new ChesslyEvent(
//   "state-change",
//   {
//     newState: {

//     }
//   }
// ));


// ======================================================== Drag events
/**
 * start drag administration after dragstart or touchmove (mobile)
 * @param {event}
 */
let start_drag = event => {
  let piece = event.target;
  let { board, at: square } = piece;
  //mark the locations this piece can goto
  piece._show_moves_on_Moves_and_Destinations_layers(square);
  //mark the start location
  board.draggingFromsquare = board.layerDestinations.squares(piece.at);
  board.draggingFromsquare.setAttribute(___ATTR_DRAGSTART___, piece.is);
}

/**
 * clear up after dragging a piece
 * @param {event} 
 */
let clear_drag = event => {
  let piece = event.target;
  let { board } = piece;
  if (!board.draggingPiece) {
    board.layerMoves.clear_squares_with_from_attributes();
    board.layerDestinations.clear_squares_with_from_attributes();
  }
}

/**
 * end dragging a piece, send event
 * @param {event}
 */
let end_drag = event => {
  let { board } = event.target;
  let piece = board.piece(event.target.at);    // pieces at square

  if (board && board.draggingFromsquare) {//dragging piece in same board
    board.dispatch('dragged', {
      piece,
      is: piece.is,
      at: event.target.at,
      move: FEN_translation_Map.get(piece.is) + event.target.at
    });

    board.draggingFromsquare.removeAttribute(___ATTR_DRAGSTART___);
    board.draggingFromsquare = false;
    if (piece.length > 1) {
      if (piece[0] === board.draggingPiece) piece[1].remove();
      else piece[0].remove();
    }
    board.draggingPiece = false;
    event.target.board.show_moves_piece_in_square();           // clear moves
    clear_drag(event);                        // clear destinations
  } else {
    // dragging something from outside board
    console.warn("end dragging", event.target);

  }
}

// ======================================================== App declaration

const ___SQUARECOUNT___ = 8;//chess or checkers or any board width/height

//!TAKE CARE for readablity constants can also be used hardcoded in CSS declarations (way below)

//configurable
const ___WHITE___ = "white";
const ___BLACK___ = "black";

//configurable element names
const ___PIECE_PAWN___ = "pawn";
const ___PIECE_ROOK___ = "rook";
const ___PIECE_KNIGHT___ = "knight";
const ___PIECE_BISHOP___ = "bishop";
const ___PIECE_QUEEN___ = "queen";
const ___PIECE_KING___ = "king";

//constants
const ___ATTACKED_BY___ = "attackers";
const ___DEFENDED_BY___ = "defenders";

const ___SQUARE_POTENTIAL_ATTACK_MARKER___ = "x";
const ___SQUARE_ATTACK_MARKER___ = "X";
const ___SQUARE_POTENTIAL_DEFEND_MARKER___ = "z";
const ___SQUARE_DEFEND_MARKER___ = "Z";

const ___LAYER_ID_SQUARES___ = "all_board_squares";
const ___LAYER_ID_MOVES___ = "allowed_piece_moves";
const ___LAYER_ID_PIECES___ = "pieces_on_board";
const ___LAYER_ID_DESTINATIONS___ = "piece_destinations";
const ___PROTECTED_BY___ = "protectors";
const ___PROTECTED_BY_WHITE___ = ___PROTECTED_BY___ + ___WHITE___;
const ___PROTECTED_BY_BLACK___ = ___PROTECTED_BY___ + ___BLACK___;
const ___SQUARE_RELATIONS___ = "relations";

const ___ATTR_PIECE___ = "piece";
const ___ATTR_FROM___ = "from";
const ___ATTR_FEN___ = "fen";
const ___EMPTYSQUARE___ = ".";
const ___ELEMENT_IS___ = "is";

const ___AT___ = "at";
const ___OUTLINE___ = "outline";
const ___ATTR_DRAGSTART___ = "dragstart";

const ___ATTR_SHOW_DESTINATIONS___ = "destination";
const ___ATTR_SHOW_MOVES___ = "moves";
const ___ATTR_STATIC___ = "static";

const ___OUTLINE_ATTACKS___ = false;//"red";// set to CSS colorvalue to outline SVG piece//todo isn't reset while dragging

const ___ATTR_RESULT___ = ['1-0', '0-1', '1/2-1/2', '*'];//!todo

const css_F12friendly_linebreak = `\n`;// for user inspecting F12 elements console, display linebreaks in CSS

// Forsyth Edwards Notation
// maps P->white-pawn and white-pawn->P
let FEN_translation_Map = new Map();

let files = [];// A to H
let ranks = [];// 1 to 8
let cnt = ___SQUARECOUNT___;
//fill files and ranks
do {
  files.unshift(String.fromCharCode(64 + cnt)); // A,B,C,D,...
  ranks.push(String(cnt));                      // 1,2,3,4,...
} while (--cnt);
let ranksAscending = [...ranks].reverse(); // 1 to N
let all_board_squares = ranks.map(rank => files.map(file => file + rank)).flat();  // 'A8'.. 'H1'

/**
 * make sure notation is always 2 characters UPPERcase: A1
 * @param {array} square
 */
let squarenameUpperCase = square => (square[0] + square[1]).toUpperCase();

/**
 * return true/false if square is a valid square
 * @param {array} square
 */
let is_square = square => all_board_squares.includes(square);

/**
 * translate current cell to other location:
 * ( 'D5' , 1 , -1 ) returns E4
 * @param {string} sq
 * @param {number} hf - horizontal file displacement
 * @param {number} vr - vertical rank displacement
 */
let translateSquare = (
  sq, // square: 'D5'
  hf, // horizontal/file translate: -1 0 1
  vr, // vertical/rank translate: -1 0 1
  //! parameters below are declarations, not used as parameter
  val = (
    // function!! *!*
    a, // files OR ranks array
    v, // current file/rank value
    t, // translate: -1 or 0 or 1
    n = a.indexOf(v) + t // new index in files/ranks array *!*
  ) =>
    n > -1 &&
    n < ___SQUARECOUNT___ && // new index is on board
    a[n], // return false or new rank/file

  file = val(files, sq[0], hf), // new file from square translate
  rank = val(ranksAscending, sq[1], vr) // new rank from square translate
) => file && rank && file + rank; // if valid file/rank then return 'D6'


/**
 * create Object from DOM element attributes
 * @param {DOM element} CE
 */
let attributes_to_parametersObject = (
  CE, // input: Custom Element
  init = {}, // optional initial/default parameters  attr-key:value
  attrs = CE.getAttributeNames() // attribute names to be processed
) =>
  attrs.reduce(
    (pars, attr) => (
      (pars[attr] = CE.getAttribute(attr) || undefined), // add parameter  attr-key:value
      pars // return pars in reduce loop
    ),
    init // optional initial/default parameters  attr-key:value
  );

/**
 * create properties on Custom Element from (observed)attributes
 * @param {DOMelement} CE - Custom Element this reference
 * @param {array} attrs - optional parameter, default gets CE.constructor.observedAttributes
 */
let make_Object_properties_from_attributes = (
  CE,
  attrs = CE.constructor.observedAttributes
) =>
  attrs.map(attr =>
    Object.defineProperty(CE, attr, {
      get() {
        return CE.getAttribute(attr);
      },
      set(val) {
        val == undefined
          ? CE.removeAttribute(attr)
          : CE.setAttribute(attr, val);
      },
      configurable: true
    })
  );

/**
 * returns SVG string for chess piece 
 * @param {*} {is:'white-king'}
 */
function SVG_chesspiece({
  is, // white-pawn, black-rook etc
  //default optional settings:
  outline = "#666",       // red outline
  detailcolor = "#888",   // small lines in pawn and rook, circles in king
  //width and height
  size = 900,             // larger value is smaller piece org:993 
  translate = "20,0",     // To center piece in square  org:50,0
  circlesize = 50,
  // 0 = white , 1 = black
  piececolors = [["eee", "999"], ["111", "888"]], // white,lightgrey  black,drakgrey
  fillcolors = ["gold", "silver"]                 // fill queen crown-circles and other details
}) {
  let color = is.includes(___WHITE___) ? 0 : 1;
  let stopcolors = piececolors[color];
  let fillcolor = fillcolors[color];
  let circle = (cx, cy, r, fcolor = fillcolor) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fcolor}"></circle>`;
  let svg = `data:image/svg+xml` +
    `,<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='${size}' height='${size}'>` +
    `${`<defs><linearGradient id='a'><stop offset='50%' stop-color='#${stopcolors[0]}'/><stop offset='100%' stop-color='#${stopcolors[1]}'/></linearGradient></defs>` +
    `<g stroke='${outline}' stroke-width='16' stroke-linecap='round' stroke-linejoin='round' fill='url(#a)' transform='translate(${translate})'>` +
    {
      none: ``,
      [___PIECE_PAWN___]:
        `<path d='M397 467c2 170-86 221-128 250-34 24-25 83 20 86 28 1 277 2 306-1 51-6 53-67 20-88-53-32-136-69-139-247 0-33-79-30-79 0z'/>` +
        `<path d='M340 433c-74 19-100 66-100 66h409s-43-52-110-67c-85-19-129-17-199 1'/>` +
        `<path d='M339 714h188' stroke='${detailcolor}'/>`
        + circle(435, 300, 110, ""),
      [___PIECE_KNIGHT___]: `<path d='M529 402c0 76-89 142-176 109-13-5-134 105-154 90-15-12 17-61 15-55-11 30-61 63-100 20-16-16-11-64 22-103 35-41 70-104 84-140 28-73 17-75 69-141 10-12-16-60-6-92 37 7 51 44 69 60 10-23 3-85 21-82 17 3 38 56 67 80 351 108 349 670 250 672-121 2-266 2-388 0-29-1-43-39-37-62 27-108 142-185 198-222 58-39 68-77 66-134M345 294c-29-5-55 3-76 24m29 8c11 10 24 11 26-7M151 518c-14-4-24 18-15 19m181-63l9 12m203-117v-25M326 163l-10 5m63-59c30 42 41 51 5 44M454 131c87 26 72 7 91 37 10 17 24-6 58-4 18 1-50-27-59-38-12-16-102 1-90 5M580 200c27 20 47-1 46 35-1 25 32 8 48 19 15 9 30-29 21-29-15 0-39 7-34-9 9-36-89-22-81-16M660 278c5 2 34 21 32 30-7 48 29 45 44 50 21 7-1-18-12-31s8-19 6-27c-4-30-73-23-70-22M710 379c5 8 17 18 21 32s5 26 13 41c7 15 38 13 51 9 17-6-43-24-29-52 8-18-58-35-56-30M438 730l-26 61'/>`,
      [___PIECE_ROOK___]:
        `<path d='M200 323s4-117 18-156c30-6 89-9 126-4 1 24-5 74-1 97 33-2 101 2 144-2 1-28-7-68 1-99 27-2 89-4 118 8-4 40 0 95 0 95l76 2-11 60c-95 36-412 30-471-1z'/>` + //rear buttress
        `<path d='M251 702c-24 24-74 49-110 56-5 17-10 37 0 58h586c6-24 11-41 5-60-38-7-83-19-117-54M198 769c149 0 312-6 472 0'/>` + //base
        `<path d='M253 311c-4 45-5 357-4 394 55-4 312-5 368 0-3-70-2-393-2-393'/>` + //tower
        `<path d='M291 635c40-3 124-6 216-3m-217-62c51-5 100-6 171-6m-170-59c72-5 74-5 152-6m-152-58c36-3 58-5 102-4m-58 21v24m55 39l1 25m-56 40v24m117-26v26m-62 42l1 27m-99-296c28-3 42-4 66-3' stroke='${detailcolor}'/>` + //bricks
        `<path d='M132 161l14 96c32 22 50 30 53 67 97-17 387-13 475 0 6-34 16-39 63-68 6-44 11-66 11-92-14-3-115-34-128-29-4 26 2 49-4 73-38 2-71 1-111-9 0-34 0-52 2-77-17-6-115-7-134-1-3 32 1 49-2 78-33 9-65 7-105 9-4-34 2-46 2-70-17-4-121 18-136 23z'/>` + //butress
        `<path d='M189 262c148-14 368-15 496 4' fill='none'/>`, //butress lines
      [___PIECE_BISHOP___]:
        `<path d='M436 217c11-18 39-51 68-67a511 511 0 0 1 134 339c1 63-32 126-53 149'/>` +
        `<path d='M565 687c7-53-294-49-281 3 10 22 2 50 2 50s69-10 146-9c77 2 129 8 129 8s-2-36 4-52z'/>` +
        `<path d='M279 682c-22-8-39-40-53-61-23-33-37-101-23-178 13-77 86-225 161-291 91 66 150 165 196 298 25 71 37 149 15 230-54-11-234-21-296 2z'/>` +
        `<path d='M490 135c12-21-20-35-3-50 9-8 25-9 35 2 13 15-23 29-6 48'/>` +
        `<path d='M350 139c13-21-19-35-2-50 9-8 25-9 34 2 13 15-22 29-5 48'/>` +
        `<path d='M436 712c-9-2-18 2-21-1-5-3-4-18-1-22 2-3 33-3 36 0 3 2 0 20-2 25'/>` +
        //                + `<path d='M381 349c-11 1-17 14-15 25-1 9 3 20-4 27-10 4-21 0-31-1-9-1-19-4-27 1-5 7 1 17 9 20 15 6 32 3 47 10 5 5 4 13 5 19 5 36 5 74 16 109 3 8 7 18 17 18 7-2 6-12 7-18-1-40-12-79-14-119 0-4 0-9 5-9 18-5 39 0 55-10 7-4 13-18 2-19-19-3-39 5-58 1-6-2-5-10-6-15-1-12 3-25-2-36-1-2-3-4-6-3z' fill='${fillcolor}'/>`
        `<path d='M318 803c56 0 83-32 107-32 25 0 48 32 108 32 32 0 202 3 192-23-9-25-116 9-152-9-19-10-25-12-49-16-66-10-133-9-192 0-26 4-37 9-52 19-25 16-130-19-138 6-9 25 108 24 176 23z'/>` + //base
        `<path d='M636 91c-21 0-36 17-45 34-5 11-15 19-21 30-1 7 8 9 13 7 12-2 22-12 26-23 5-12 16-21 28-22 13-2 25 8 27 20 4 13 2 28-8 37-16 17-40 24-53 44L382 655c-26 53-53 106-76 160-1 7-7 15-4 22 5 3 10-2 14-5 16-14 25-35 35-53 45-86 87-174 130-261l142-284c13-20 39-27 54-46 10-10 16-24 15-39-1-24-15-51-40-56-6-2-11-2-16-2z' fill='${fillcolor}'/>`,
      [___PIECE_QUEEN___]:
        `<path d='M244 825l-50-166 433 1-49 170-334-5z'/>` +
        `<path d='M613 716a633 633 0 0 0-403 0c13 31 16 93 16 93 101-28 272-27 372 4 0 0 2-66 15-97M195 698c122-53 313-54 436 0 12-105 50-234 122-327-54 21-134 158-180 184-37-76 35-274 63-316-47 28-146 203-175 285-43-94-33-271-34-345-32 69-73 229-78 342-81-61-109-225-131-290-12 94 9 257 23 323A907 907 0 0 1 75 374c65 155 89 202 120 324zM245 825c88 11 232 15 333 5-57-26-260-25-333-5M846 352c2-14-13-18-27-37-20 8-43 17-59 40 41-8 60 4 86-3M715 206c-5-6-2-16-40-37l-49 61c27-9 71-21 89-24M475 83c-9 0-35 4-51 12-5 12-2 48 0 77 15-25 49-67 51-89M227 155c-11-12-23-11-51-15 1 34 21 43 33 70 15-25 13-26 18-55M50 290c-13 3-14 30-19 44 16 17 31 26 44 52 14-25-9-77-25-96z'/>` +
        circle(87, 383, circlesize) +
        circle(211, 231, circlesize) +
        circle(422, 179, circlesize) +
        circle(630, 238, circlesize) +
        circle(754, 365, circlesize),
      [___PIECE_KING___]:
        `<path d='M289 612c23-33-7-125 0-168 11-68 101-114 113-74 14 47-43 51-60 91-14 36-11 96 18 132M587 617c-23-33 7-126 0-168-12-68-102-114-114-75-14 48 44 52 60 91 15 37 12 97-17 133M401 288c5-15 19-71 14-87-22-2-69 18-99 12-9-16-14-49-2-67 28-8 88 6 105 9 6-17-15-68-11-86 19-9 66-8 79 1 0 19-28 66-29 82 19-1 77-17 97-13 9 17 11 47-3 66-22 7-78-9-101-5-10 20 5 72 9 87'/>` +
        `<path d='M408 372c-24-22-35-22-30-75 4-46 106-44 108-2 3 52-14 55-26 81M271 830l-64-196 471-2-75 204-332-6z'/>` +
        `<path d='M643 717c-93-48-307-50-407 2 14 44 20 94 20 94 91-29 277-30 367 4 0 0 10-67 20-100M554 574c-29-16-90-54-122-55-25-1-77 33-104 53-115-52-114-153-33-171 13-3 52 0 78-1-8-23-17-39-9-69-18-12-42-20-70-22a351 351 0 0 0-25 0c-81 1-165 30-177 105-18 109 79 173 114 289 110-63 364-59 470-5 28-89 140-193 115-284-23-84-136-109-210-105-30 2-59 12-81 25 4 24-4 44-11 64 34 0 94-8 118 6 52 29 56 136-53 170z'/>` +
        `<path d='M328 573c38-27 56-80 55-123-2-62-35-72-16-126 12-37 119-39 131 1 14 47-23 76-17 124 7 56 7 93 72 127M276 833c88 10 228 12 327 2-69-28-256-28-327-2z'/>` +
        circle(330, 743, circlesize / 2) +
        circle(440, 737, circlesize / 2) +
        circle(550, 743, circlesize / 2)
    }[is.split("-")[1]]}</g></svg>`;//get piece type as object key: pawn,rook,...

  //note: escape() function can be used but is officialy deprecated
  return svg
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/#/g, "%23");
}

// Create all chesspieces as Custom Element extended from IMG
[
  ___WHITE___,
  ___BLACK___
].map(color =>
  [
    ___PIECE_PAWN___,
    ___PIECE_ROOK___,
    ___PIECE_KNIGHT___,
    ___PIECE_BISHOP___,
    ___PIECE_QUEEN___,
    ___PIECE_KING___
  ].map(piecename => {
    let piece_is = color + "-" + piecename; // white-pawn, white-rook, ...

    //register Forsyth-Edward-Notations
    let fen = piecename == ___PIECE_KNIGHT___ ? "n" : piecename[0]; // prnbqk
    if (color == ___WHITE___) fen = fen.toUpperCase();              // white : PRNBQK
    FEN_translation_Map.set(piece_is, fen);                         // white-king -> K
    FEN_translation_Map.set(fen, piece_is);                         // K -> white-king

    //define Custom Element extending IMG to use: <img is=white-pawn />
    customElements.define(
      piece_is,
      class extends HTMLImageElement {
        static get observedAttributes() {
          return [___AT___, ___ELEMENT_IS___, ___ATTACKED_BY___, ___OUTLINE___];
        }
        constructor() {
          super();
          this.setAttribute(___ELEMENT_IS___, piece_is); // required to set explicitly for .createElement usage
        }
        connectedCallback() {// piece IMG
          this._set_IMG_src();
          this.board = this.getRootNode().host;
          if (this.board && this.board.is_interactive) this.make_piece_interactive();
          //piece public properties
          let pieceArray = _ => new ChessPieceDestinations(this.board);
          this.destinations = pieceArray();
          this.defended_from = pieceArray();
          this.attacked_from = pieceArray();
        }

        _set_IMG_src() {//chesspiece element:set src in connected or attributechange callback
          //extract attributes to be passed to SVG creation function
          let parameters = attributes_to_parametersObject(
            this,
            {},// optional default settings
            this.constructor.observedAttributes// todo test if attributenames is better?
          );
          if (this.board) {//todo get CSS property value from board to decorate chess piece
            //parameters.piececolors = [["eee", "999"], ["111", "888"]]; // white,lightgrey  black,drakgrey
          }
          this.src = SVG_chesspiece(parameters);
        }
        _show_piece_moves(//chesspiece element:show my moves on a board-layer
          attack_from_square,
          layers = [this.board.layerDestinations]//for now second param is always set
        ) {
          this.calculate_piece_moves().piece_destinations// array [...,"B5","","A6X",...] with piece destinations and attack X info
            .filter(to_square => to_square.length == 2 || to_square[2] == ___SQUARE_ATTACK_MARKER___)// empty or attacking square
            .map(to_square => {
              if (attack_from_square == this.at) {
                let { piece, piece_is, square_element } = this.board.squareData(squarenameUpperCase(to_square));
                if (to_square[2] == ___SQUARE_ATTACK_MARKER___) piece.attackFrom(this.at); // set image outline
                //else empty square piece can move to
                layers.map(layer => layer.mark_attack_from_to_square(attack_from_square, to_square));
              }
            })
        }
        // update 2 existing board-layers
        _show_moves_on_Moves_and_Destinations_layers(square) {
          this._show_piece_moves(square, [this.board.layerMoves]);
          this._show_piece_moves(square, [this.board.layerDestinations]);
        }

        make_piece_interactive() {
          this.setAttribute("draggable", "draggable");
          this.addEventListener("dragstart", event => {
            let piece = event.target;
            piece.board.draggingPiece = piece;
            piece._show_moves_on_Moves_and_Destinations_layers(piece.at);
            start_drag(event);
          });
          //mouseover
          this.addEventListener("mouseover", event => {
            let piece = event.target;
            if (!piece.board.draggingPiece)
              piece._show_moves_on_Moves_and_Destinations_layers(piece.at);
          });
          this.addEventListener("touchmove", event => {
            event.preventDefault();
            if (event.target.board) {
              let piece = event.target;
              let { board } = piece;
              let { pageX, pageY } = event.targetTouches[0];
              let square = board.square_from_position(pageX, pageY);
              if (!board.draggingPiece) start_drag(event);
              //if dragged piece to ANOTHER square
              //todo merge with board._showdraggingpiece()
              if (!board.draggingPiece || square != board.draggingPiece.at) {
                board.draggingPiece = piece;
                event.target.at = square;
                board.show_moves_piece_in_square(square);
              }
            }
          }, { passive: true });
          this.addEventListener("touchend", end_drag, { passive: true });
          this.addEventListener("mouseout", clear_drag);
          this.addEventListener("click", event => {
            let piece = event.target;
            piece.board.dispatch('click', {
              type: "piece",
              square: piece.at
            });
          });
        }

        attributeChangedCallback(name, oldValue, newValue) {
          if (name == ___AT___) this._at_square = squarenameUpperCase(newValue);
          this._set_IMG_src();
        }
        get at() {
          return this._at_square;
        }
        set at(square) {
          this.setAttribute(___AT___, squarenameUpperCase(square));
        }
        outline(color = false) {
          if (color)
            this.setAttribute(___OUTLINE___, color);
          else
            this.removeAttribute(___OUTLINE___);
        }
        attackFrom(square = false) {
          if (
            ___OUTLINE_ATTACKS___
            && square
            && this.board.draggingPiece
          )
            this.setAttribute(___OUTLINE___, ___OUTLINE_ATTACKS___);
          else
            this.removeAttribute(___OUTLINE___);
        }
        get fen() {
          return FEN_translation_Map.get(piece_is);
        }
        get color() {
          return color;
        }
        get is() {
          return this.getAttribute(___ELEMENT_IS___);
        }
        rect() {
          return this.getBoundingClientRect();
        }
        to(square) {
          let from = this.board.piece(this.at).rect();//destructure!
          let to = this.board.layerSquares.squares(square).rect;
          this.animate(
            [
              {
                /*start*/
              },
              { transform: `translate(${to.x - from.x}px,${to.y - from.y}px)` }
            ],
            { duration: 500 }
          ).onfinish = () => {
            this.at = square;
            this.board.dispatch("moved");
          }
        }
        data() {
          return {
            square: this.at,
            piece_is: this.is,
            fen: this.fen,
            color: this.color,
            destinations: this.destinations,
            attacked_from: this.attacked_from,
            defended_from: this.defended_from,
            squareData: this.board.squareData(this.at),
            [___ATTACKED_BY___]: this.getAttribute(___ATTACKED_BY___),
            [___DEFENDED_BY___]: this.getAttribute(___DEFENDED_BY___)
          }
        }
        calculate_piece_moves(square = this.at) {
          let _pieceboard = this.board;
          let _piece_squareData = _pieceboard.squareData(square);
          let { idxFile, idxRank, piece_is, fen, playdirection } = _piece_squareData;
          let _startFile = idxFile;
          let _startRank = idxRank;
          let idxBorder = ___SQUARECOUNT___ + 1;  // playingfield is from 1 to squarecount
          let _reachableSquares = new ChessPieceDestinations(_pieceboard);
          let _attackMode = true;                  // default , pawn sets attackmode to false for forward moves
          //let inbetweenPieces = [];
          let _isAfterBlockingPiece = false;      // detect how far we can move
          let _checksquareData = false;           // save some CPU cycles, don't declare in a loop

          this.destinations.length = 0;
          this.attacked_from.length = 0;
          this.defended_from.length = 0;

          let reset = _ => {
            _isAfterBlockingPiece = false;
            idxFile = _startFile;                  // reset idxFile to current square
            idxRank = _startRank;                  // reset idxRank
          };
          let recordDestination = (
            _sqData,
            _xz_char,                                   // attack x/X or defend z/Z
            _attr_def_type = false
          ) => {
            if (_isAfterBlockingPiece) {
              _sqData.square += _xz_char;                // square can't be reach directly: x z
            } else {
              _sqData.square_element[_attr_def_type] = square + fen;
              _sqData.square += _xz_char.toUpperCase();  // direct attack X or defend Z
            }
            return _sqData.square;
          };
          let attack_or_defend = (  //call by default for all pieces AND pawn
            _checksquare,
            _noBlockingCheck
          ) => {
            _checksquareData = _pieceboard.squareData(_checksquare);
            if (_checksquareData.piece) {
              if ( /* owncolor */ playdirection == _checksquareData.playdirection) {
                _checksquare = recordDestination(
                  _checksquareData,
                  ___SQUARE_POTENTIAL_DEFEND_MARKER___,
                  "set_defended_By"
                );
                this.defended_from.push(_checksquare);
              } else {
                if (_attackMode) {//pawns forward moves can't attack
                  _checksquare = recordDestination(
                    _checksquareData,
                    ___SQUARE_POTENTIAL_ATTACK_MARKER___,
                    "attacked_By"
                  );
                }
                this.attacked_from.push(_checksquare);
              }
              if (_noBlockingCheck) _checksquare = _checksquare.toUpperCase();
              //inbetweenPieces.push(checksquareData);
              if (!_noBlockingCheck) _isAfterBlockingPiece = _checksquareData;
            } else {
              if (_isAfterBlockingPiece)
                _checksquare += ___SQUARE_POTENTIAL_DEFEND_MARKER___;// protected square AFTER a blocking piece
              else {
                //checksquareData.square_element.add_relationData(squareData);
                //squareData.square_element.add_relationData(checksquareData);
                _checksquareData.square_element.set_protected_By(square, piece_is);
              }
            }
            _reachableSquares.push(_checksquare);
            return _checksquare;
          };
          let _add_destination_square = (
            //idxFile and idxRank are locally scoped variables
            _add_square = files[idxFile - 1] + ranksAscending[idxRank - 1],
            _noBlockingCheck = false
          ) => {
            if (_add_square) attack_or_defend(_add_square, _noBlockingCheck);
            //else this is at my own square
          };
          let straights = _ => {
            //idxFile and idxRank are locally scoped variables
            //so function can be used for any dimension board (ie. checkers is 10x10)
            while (idxRank++ < idxBorder - 1) _add_destination_square(); //forward
            reset();
            while (idxFile++ < idxBorder - 1) _add_destination_square(); //right
            reset();
            while (--idxRank) _add_destination_square(); //back
            reset();
            while (--idxFile) _add_destination_square(); //left
            reset();
            return _reachableSquares;
          };
          let diagonals = _ => {
            while (++idxFile < idxBorder && ++idxRank < idxBorder) _add_destination_square(); //forward-right
            reset();
            while (++idxFile < idxBorder && --idxRank) _add_destination_square(); //backward-right
            reset();
            while (--idxFile && --idxRank) _add_destination_square(); //backward-left
            reset();
            while (--idxFile && ++idxRank < idxBorder) _add_destination_square(); //forward-left
            reset();
            return _reachableSquares;
          };
          let _procesDestinations = (
            _piece_offset_destinations,        // array [ [0,1] , [1,1] ]
            _add_tocell_as_destination = true // pawns can only go diagonal while taking another piece
          ) =>
            _reachableSquares.concat(
              //todo use reduce instead of map and later filter?
              _piece_offset_destinations.map(loc => {
                let tocell = translateSquare(
                  square,                 // current processing square
                  playdirection * loc[0], // black or white piece offset
                  playdirection * loc[1]
                );
                if (tocell) {     // if offset location is within board
                  if (_add_tocell_as_destination)
                    _add_destination_square(
                      tocell,
                      true /* do not check for blocking pieces*/
                    );
                  // need to return squareDate for pawn processing
                  // will be filtered away later
                  return _pieceboard.squareData(tocell);
                } else {
                  return false;   // off board locations are filtered away
                }
              })
            );

          let _castlingMoves = _ => [];   // todo add castling logic

          this.destinations.push(...{// spread regular array values into extended ChessPieceDestinations
            [___PIECE_PAWN___]: _ => {
              //todo add en-passant move
              let _pawnDiagonalMoves = _procesDestinations(
                [[-1, 1], [1, 1]],                        // diagonal moves
                false                                     // but NOT destinations if they are empty squares
              );
              let _pawnAttacks = _pawnDiagonalMoves       // diagonals moves only valid
                .filter(squareData => squareData.piece)   // only if there is a piece in the other square
                .map(squareData => attack_or_defend(
                  squareData.square,                      // record destination square
                  true                                    // true=no blocking check
                ));
              // 1 or 2 moves forward can not attack
              _attackMode = false;
              _isAfterBlockingPiece = true;
              let _pawnForwardMoves = [[0, 1]];
              if (idxRank == 2 || idxRank == 7) _pawnForwardMoves.push([0, 2]); // no need to check direction, illegal move is off the board anyway
              return [//todo refactor using .reduce
                ..._pawnAttacks,
                ..._procesDestinations(
                  _pawnForwardMoves,
                  false
                ).filter(squareData => !(_isAfterBlockingPiece && squareData.piece))  // keep the destination pawn can goto
                  .map(squareData => squareData.square)                               // only record the square label
              ];
            },
            [___PIECE_KNIGHT___]: _ => _procesDestinations([
              [2, -1],
              [2, 1],
              [1, 2],
              [-1, 2],
              [-2, 1],
              [-2, -1],
              [-1, -2],
              [1, -2]
            ]),
            [___PIECE_BISHOP___]: diagonals,
            [___PIECE_QUEEN___]: _ => [...straights(), ...diagonals()],
            [___PIECE_KING___]: _ => {
              return [..._procesDestinations([
                [1, -1],// NW
                [1, 0],//N
                [1, 1],//NE
                [0, 1],//E
                [-1, 1],//SE
                [0, -1],//S
                [-1, -1],//SW
                [-1, 0]//W
              ]), ..._castlingMoves()]
            },
            [___PIECE_ROOK___]: _ => {
              return [...straights(), ..._castlingMoves()]
            }

          }[piece_is.split`-`[1]]()         // execute piece function; ie. "king"() returns array of destinations
            .filter(square =>
              square                        // delete all empty/false locations
              && typeof square === "string" // delete all squareData from pawn processing
            )
          );// this.destinations ChessPieceDestinations Array

          if (this.board.id == "ChessMeisterDemo" && FEN_translation_Map.get(this.is) == "k") console.warn(this.at, this.is, this.destinations);

          return {
            piece_destinations: this.destinations
            //inbetweenPieces
          };
        }
      }, // <<< class [color]-[piece]
      { extends: "img" }
    );
  })
);
class SquareElement extends HTMLElement {
  static get observedAttributes() {
    return [];
  }
  constructor() {
    super();
  }
  connectedCallback() {
    this.board = this.getRootNode().host;
    this.reset_square();
  }
  set square(square) {
    this._square = square;
  }
  get square() {
    return this._square;
  }
  get at() {
    return this.square;//double because dragenter (img or square) wants .at
  }
  get rect() {
    return this.getBoundingClientRect();
  }
  reset_square() {
    if (this.board) {
      this._relations = {
        [___ATTACKED_BY___]: new Set(),
        [___DEFENDED_BY___]: new Set(),
        [___PROTECTED_BY_WHITE___]: new Set(),
        [___PROTECTED_BY_BLACK___]: new Set(),
        [___SQUARE_RELATIONS___]: new Set()
      };
      this.removeAttribute(___ATTR_FROM___);
      this.removeAttribute(___PROTECTED_BY_WHITE___);
      this.removeAttribute(___PROTECTED_BY_BLACK___);
      this.removeAttribute(___PROTECTED_BY_WHITE___ + "_count");
      this.removeAttribute(___PROTECTED_BY_BLACK___ + "_count");
      this.removeAttribute(___DEFENDED_BY___);
      this.removeAttribute(___DEFENDED_BY___ + "_count");
      this.removeAttribute(___ATTACKED_BY___);
      this.removeAttribute(___ATTACKED_BY___ + "_count");
      this.setAttribute(___ATTR_PIECE___, "none");
    }
  }
  get relations() {
    return this._relations;
  }
  set_square_relations() {
    if (this.board) {
      let { piece, piece_is, square_element } = this.board.squareData(this.square);

      let setElementRelations = (square_element, attrName) => {
        let relations = [...square_element._relations[attrName]]; // attacked_By , set_defended_By
        let set_square_and_piece = el => {              // el is img OR square-white/square-black
          if (relations.length) {
            el.setAttribute(attrName, relations.join(","));
            el.setAttribute(attrName + "_count", relations.length);
          } else {
            el.removeAttribute(attrName);
            el.removeAttribute(attrName + "_count");
          }
        };
        set_square_and_piece(square_element); // square is
        if (piece) set_square_and_piece(piece); // square is
      };

      let setSquareRelations = square_element => {
        setElementRelations(square_element, ___ATTACKED_BY___);
        setElementRelations(square_element, ___DEFENDED_BY___);
        setElementRelations(square_element, ___PROTECTED_BY_WHITE___);
        setElementRelations(square_element, ___PROTECTED_BY_BLACK___);
        square_element.setAttribute(___ATTR_PIECE___, piece_is); // piece_is = 'none'
      }

      setSquareRelations(this);
      //setSquareRelations(this.board.layerMoves.squares(this.square));
    }
  }
  add_relationData(square) {
    //this._relations[___SQUARE_RELATIONS___].add(square);
  }
  set attacked_By(piece) {
    this._relations[___ATTACKED_BY___].add(piece);
  }
  set_protected_By(square, piece_is) {
    let piece_color = piece_is.split('-')[0];
    this._relations[___PROTECTED_BY___ + piece_color].add(square);
  }
  set set_defended_By(piece) {
    this._relations[___DEFENDED_BY___].add(piece);
  }
  get piece() {
    return this.board.piece(this._square);
  }
}
customElements.define(ChesslyBoardSquareWhite, class extends SquareElement { });
customElements.define(ChesslyBoardSquareBlack, class extends SquareElement { });

let gridrepeat = gap => `repeat(${___SQUARECOUNT___}, ${(100 - (___SQUARECOUNT___ - 1) * gap) / ___SQUARECOUNT___}%)`;
let cssgrid = gap =>
  `position:absolute;
  width:100%;
  height:100%;
  box-sizing: border-box;` + css_F12friendly_linebreak +
  `display:grid;
  grid-gap:${gap};
  grid-template-columns:${gridrepeat(gap)};
  grid-template-rows:${gridrepeat(gap)};` + css_F12friendly_linebreak +
  `  grid-template-areas: ${css_F12friendly_linebreak + ' "' + chunk([...all_board_squares], ___SQUARECOUNT___).join('"' + css_F12friendly_linebreak + ' "').replace(/,/g, " ") + '"' + css_F12friendly_linebreak};` + css_F12friendly_linebreak +
  `  grid-auto-flow:row`;

let game_css =
  `<style>:root {
    all:initial;
    display:block;
  }` + css_F12friendly_linebreak +
  `*{
    box-sizing:border-box;
  }` + css_F12friendly_linebreak +
  `#board{
    position:relative;
    /* border:var(--border, 1vh solid black); */
    width:100%;
    max-width:70vh;
    margin:0 auto;
  }` + css_F12friendly_linebreak +

  // square sized board
  `#board:after{
    content:"";
    display:block;
    padding-bottom:100%;
  }` + css_F12friendly_linebreak +

  //only Chrome does conic-gradient to create a checkboard layout:
  //+ `#board{--sqblack:#b58863;--sqwhite:#00d9b5;--sqempty:green;}`
  //+ `#board{background:conic-gradient(var(--sqblack) 0.25turn, var(--sqwhite) 0.25turn 0.5turn, var(--sqblack) 0.5turn 0.75turn, var(--sqwhite) 0.75turn) top left/25% 25% repeat}`
  `${ChesslyBoardSquareWhite}{
    --bgcolor:var(--${ChesslyNameSpace}-squarewhite-color,#f0e9c5)
  }` + css_F12friendly_linebreak +
  `${ChesslyBoardSquareBlack}{
    --bgcolor:var(--${ChesslyNameSpace}-squareblack-color,#b58863)
  }` + css_F12friendly_linebreak +
  `#${___LAYER_ID_SQUARES___} ${ChesslyBoardSquareWhite},
   #${___LAYER_ID_SQUARES___} ${ChesslyBoardSquareBlack}{
    background-color:var(--bgcolor);
  }` + css_F12friendly_linebreak +

  //create grid-area for every square name (A1 to H8)
  `${all_board_squares.map(square => `[${___AT___}="${square}"]{ grid-area:${square} }`).join(css_F12friendly_linebreak)}` + css_F12friendly_linebreak +

  `${ChesslyBoardLayer}{
    ${cssgrid(0)};
    user-select:none
  }` + css_F12friendly_linebreak +

  `${ChesslyBoardSquareWhite}:not([${___AT___}]),${ChesslyBoardSquareBlack}:not([${___AT___}]){
    border:1px solid red
  }` + css_F12friendly_linebreak +// extra warning for squares without a piece

  // squarenames A1 - H8  in empty squares
  `#${___LAYER_ID_SQUARES___} >*[piece="none"]:before{
    font-size:var(--squarefontsize,0px);
    z-index:1;
    display:block;
    content:attr(at);
    position:relative;
    text-align:center;
    top:40%;
    color:var(--${ChesslyNameSpace}-squarelabel-color,#444);
    font-family:arial;
  }` +

  // testing options
  // `#${___LAYER_ID_SQUARES___} >*{border:1px solid red}` + //cell File/Rank text
  // `#${___LAYER_ID_SQUARES___} >*{position:relative;border:1px solid red}` + //cell File/Rank text

  // squares that can be reached by the current selected piece (at square ___ATTR_FROM___)
  `#${___LAYER_ID_DESTINATIONS___} >*[${___ATTR_FROM___}]{
    border:var(--${ChesslyNameSpace}-allowed-destinations,.5vh solid orange)
  }` + css_F12friendly_linebreak +//destinations

  // (dragstart) location where current piece start dragging
  `#${___LAYER_ID_DESTINATIONS___} >*[${___ATTR_DRAGSTART___}]{
    border:.5vh dashed var(--bgcolor);
    background:lightgreen;
  }` + css_F12friendly_linebreak +

  // WHILE DRAGGING a piece: possible moves for this piece on this board
  `#${___LAYER_ID_MOVES___} >*[${___ATTR_FROM___}]{
    width:90%;
    height:90%;
    margin:5%;
    border:var(--${ChesslyNameSpace}-piece-destinations,.5vh dashed green)
  }` + css_F12friendly_linebreak +

  //rotate black to bottom of board
  `.rotated,.rotated img{
    transform:rotate(180deg)
  }` + css_F12friendly_linebreak +

  //extra testing: img without an at= location  (possible if user defined IMG in lightDOM)
  `img:not([${___AT___}]){
    background:red;
  }` + css_F12friendly_linebreak +

  //all positioned pieces
  `img[${___AT___}]{
    width:100%;
    z-index:11;
  }` + css_F12friendly_linebreak +

  `</style>` + css_F12friendly_linebreak +


  `<style id=attack_and_defend_dropshadow>` +
  `#${___LAYER_ID_PIECES___}{
    --dropshadow-attack:
        drop-shadow(var(--dropsize) 0px 1px var(--${ChesslyNameSpace}-attack-color,darkred));
    --dropshadow-defense:
        drop-shadow(calc(-1*var(--dropsize)) 0px 1px darkgreen)
  }` +
  // you can't set :before and :after psuedo selectors on IMG elements
  // thus can't set drop-shadows there, using filter instead
  `#${___LAYER_ID_PIECES___} img[${___ATTACKED_BY___}][${___DEFENDED_BY___}]{
    filter:var(--dropshadow-attack) var(--dropshadow-defense)
  }`+
  `#${___LAYER_ID_PIECES___} img[${___ATTACKED_BY___}]:not([${___DEFENDED_BY___}]){
    filter:var(--dropshadow-attack)
  }` +
  `#${___LAYER_ID_PIECES___} img[${___DEFENDED_BY___}]:not([${___ATTACKED_BY___}]){
    filter:var(--dropshadow-defense)
  }` +
  /* Attacked piece without defenders gets red on both sides */
  `#${___LAYER_ID_PIECES___} img[${___ATTACKED_BY___}]:not([${___DEFENDED_BY___}]){
    filter:
      drop-shadow(var(--dropsize) 0px 1px red) 
      drop-shadow(calc(-1*var(--dropsize)) 0px 1px var(--${ChesslyNameSpace}-undefended-color,red));` +
  `</style>` +


  `<style id=attack_and_defend_counters>
  #${___LAYER_ID_SQUARES___} [${___DEFENDED_BY___}]:before,
  #${___LAYER_ID_SQUARES___} [${___ATTACKED_BY___}]:after
  {
    z-index:1;
    display:none;/*//!todo set to block when counters bug is fixed */
    position:relative;
    width:80%;
    height:100%;
    margin:0 auto;
  }
  #${___LAYER_ID_SQUARES___} [${___DEFENDED_BY___}]:before{
    content:attr(${___DEFENDED_BY___}_count);
    text-align:left;
    color:green;
  }
  #${___LAYER_ID_SQUARES___} [${___ATTACKED_BY___}]:after{
    content:attr(${___ATTACKED_BY___}_count);
    text-align:right;
    color:red;
  }
  </style>` +


  `<style id=css_interactive_board>
  #board{
    touch-action:none;
  }
  img[${___AT___}]{
      cursor:grab
  }
  </style>`;

customElements.define(ChesslyBoardLayer, class extends HTMLElement {
  // Methods:
  // clear_layer()
  // mark_attack_from_to_square(from_square, to_square)
  // clear_squares_with_from_attributes()
  // layerHTML(
  // reset_squares()
  // set_square_relations()
  // squares(selector = "*")
  // add_board_layer_piece(piece_is, square, append = true)

  static get observedAttributes() {
    return [];
  }
  constructor() {
    super();
    this._squares_marked_from = new Set();
  }
  connectedCallback() {
  }
  clear_layer() {
    this.innerHTML = "";
    this.clear_squares_with_from_attributes();
  }
  mark_attack_from_to_square(from_square, to_square) {
    let square = squarenameUpperCase(to_square);
    let piece_or_square_element = this.squares(square);
    this._squares_marked_from.add(square);
    if (piece_or_square_element)
      piece_or_square_element.setAttribute(___ATTR_FROM___, from_square);
  }
  clear_squares_with_from_attributes() {
    if (this.children.length) {
      this._squares_marked_from.forEach(square => {
        let square_element = this.squares(square);
        if (square_element) square_element.removeAttribute(___ATTR_FROM___);
      });
    }
    this._squares_marked_from.clear();
  }
  layerHTML(
    //default function for squares layer; adds attribute and listner
    filterFunc = (element, squareData) => {
      element.setAttribute(___ATTR_PIECE___, squareData.piece_is);
      return true
    }
  ) {
    let board = this.getRootNode().host;
    this.clear_layer();
    let squares = all_board_squares.map(square => {
      let squareData = board.squareData(square);
      let { idxFile, idxRank } = squareData;
      let squarecolor = [___BLACK___, ___WHITE___][~~(isOdd(idxFile) ^ isOdd(idxRank))];
      let element = document.createElement(ChesslySquareNameSpace + squarecolor);
      element.square = square;
      element.setAttribute(___AT___, square);
      element.onclick = event => {
        console.warn("click", square, this, event.target.id, event);
        board.dispatch('click', { type: 'square', square });
      }
      //filterFunc callback (default:true) determines if a square HTML is actually added
      if (filterFunc(element, squareData)) return element;
      else return false;
    });
    this.append(...squares);
    return this; //chaining
  }
  reset_squares() {
    this.squares().map(square_element => square_element.reset_square());
  }
  set_square_relations() {
    this.squares().map(square_element => square_element.set_square_relations());
  }
  squares(selector = "*") {
    if (this.children.length === 0) return false;
    // get one or more pieces from the board
    // squares('E2') square/piece at E2
    // squares('E') all in column E
    // squares('2') all in row 2
    if (selector != "*" && selector.length < 3) selector = `[${___AT___}*="${selector}" i]`;
    let elements = [...this.querySelectorAll(selector)];
    // returns:
    // Array of elements
    // first/only element
    // false
    return elements.length > 1
      ? elements
      : elements.length
        ? elements[0]
        : false;
  }
  add_board_layer_piece(piece_is, square, append = true) {
    if (square && append) {
      let piece = document.createElement("img", { is: piece_is });
      //piece.decoding = "async";//? any use?
      piece.setAttribute(___AT___, (square = squarenameUpperCase(square)));
      return this.appendChild(piece);
    } else {
      this.insertAdjacentHTML("beforeend", `<img is=${piece_is} at=${square}>`);
    }
  }
});


customElements.define(
  ChesslyNameSpace + "-board",
  class extends HTMLElement {
    static get observedAttributes() {
      return [___ATTR_FEN___, ___ATTR_STATIC___];
    }
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._initialpieces_in_lightDOM = this.innerHTML;
      this._initfen = false;
    }

    make_board_interactive(interactive = true) {
      this.is_interactive = interactive;
      window.bb = this;

      this.shadowRoot.querySelector('[id="css_interactive_board"]').disabled = !interactive;

      this.layerMoves.layerHTML(() => true); // shows cell numbers for empty fields
      this.layerDestinations.layerHTML(() => true); // shows destinations

      //listeners on #board child div
      this.board.addEventListener("dragenter", this._showdraggingpiece);
      this.board.addEventListener("dragend", end_drag);
    }

    _showdraggingpiece(event) {
      let piece = event.target;
      let { board, at: square } = piece;
      if (square && board.draggingPiece) { //if inside board
        if (square !== board.draggingPiece.at) {
          board.draggingPiece.at = square;
          board.show_moves_piece_in_square(square);
          //! TODO: dispatching CustomEvents are async, thus block updating the piece location
          //setTimeout(() => board.dispatch("dragging", { square }), 0);
        }
      }
    }
    setProperty(name, value) {
      this.board.style.setProperty("--" + name, value);
    }
    connectedCallback() {
      this.innerHTML = ""; //clear lightDOM
      this.shadowRoot.innerHTML = game_css + `<div id=board></div>`;
      this.board = this.shadowRoot.querySelector("#board");
      this.layerSquares = this.addlayer(___LAYER_ID_SQUARES___); //default 64 empty squares
      this.layerMoves = this.addlayer(___LAYER_ID_MOVES___); //default 64 empty squares
      this.layerPieces = this.addlayer(___LAYER_ID_PIECES___);
      this.layerPieces.innerHTML = this._initialpieces_in_lightDOM;
      delete this._initialpieces_in_lightDOM;
      //destinations above all other layers, so board capture dragenter event
      this.layerDestinations = this.addlayer(___LAYER_ID_DESTINATIONS___); //default 64 empty squares
      this.is_interactive = !this.hasAttribute(___ATTR_STATIC___);
      //once the pieces are on the board, calc underlying layers
      this.layerSquares.layerHTML(); // shows cell numbers for empty fields
      if (this.is_interactive) this.make_board_interactive();

      let rect = this.board.getBoundingClientRect();
      let boardwidth = rect.width;
      this.setProperty("dropsize", boardwidth / 100 + "px");  // size of dropshadows
      if (boardwidth > 300) this.setProperty("squarefontsize", boardwidth / 45 + "px");// size of A1..H8 square label
      //this.setProperty("border", "12px");

      if (this._initfen) this.setfen(this._initfen);
    }
    addlayer(id) {
      let layer = document.createElement(ChesslyBoardLayer);
      layer.id = id;//used by CSS
      return this.board.appendChild(layer);
    }
    add_board_piece(
      piece_is,
      square,
      //default layer:
      layer = this.layerPieces
    ) {
      if (is_square(square)) {
        if (piece_is.length < 3) piece_is = FEN_translation_Map(piece_is);
        layer.add_board_layer_piece(piece_is, square);
      }
    }

    remove_board_piece(square) {
      let piece = this.layerPieces.squares(square);
      if (piece) {
        piece.remove();
        this.clear_board_moves();
      }
    }

    clear_board() {
      this.layerSquares.reset_squares();
      this.layerMoves.clear_layer();
      this.layerDestinations.clear_layer();
      this.layerPieces.clear_layer();
    }

    clear_board_moves() {
      this.layerSquares.reset_squares();
      this.layerMoves.clear_squares_with_from_attributes();
      this.layerDestinations.clear_squares_with_from_attributes();
    }
    show_moves_piece_in_square(from_square) {
      this.clear_board_moves();
      if (this.is_interactive) {
        //if (from_square) 
        [...this.layerPieces.children].map(piece => {
          piece._show_piece_moves(from_square, [this.layerMoves]);
        });
        this.layerSquares.set_square_relations();//loop all squares updating this.board.layerSquares with correct attribute data
        if (document.location.href.includes('fen')) history.pushState({}, "", "?fen=" + encodeURI(this.fen));
      }
    }
    setfen(fen) {
      delete this._initfen;
      this.layerPieces.clear_layer();
      fen.split("/").map((rank, idx) => {
        rank
          .split``
          .map(
            fen => fen == Number(fen)         // number
              ? ___EMPTYSQUARE___.repeat(fen) // then add number empty squares
              : fen                           // else fen character
          )
          .join``
          .split``
          .map((fen, file) => {
            // join everything to one string (the repeat took 1 array position)
            // and split again so we get 64 values
            let piece_is = FEN_translation_Map.get(fen);
            let square = files[file % ___SQUARECOUNT___] + ranks[idx % ___SQUARECOUNT___];
            if (piece_is) this.add_board_piece(piece_is, square);
          });
      });
      //once the pieces are on the board, calc underlying layers
      this.layerSquares.layerHTML();
      this.show_moves_piece_in_square();
      this.dispatch('fen', {
        fen
      });
    }
    set fen(fen) {
      this.setAttribute(___ATTR_FEN___, fen);
    }
    get fen() {
      if (this._initfen) return this._initfen;
      //todo move fen to layer for multiple pieces layer
      let fen = "";
      let empty = 0;
      let addempties = (empties = empty ? empty : "") => (empty = 0, empties);
      let add = char => (fen += addempties() + char);       // add new FEN character,including counting empties
      [...this.layerSquares.children].map((sq, idx) => {    // loop all squares
        if (idx && !(idx % ___SQUARECOUNT___)) add("/");          // if new rank(row) add a /
        if (sq.piece) {                                     // if piece in this square add fen character
          if (sq.piece.length && this.draggingPiece) add(this.draggingPiece.fen); //   if dragging over another piece, use draggingPiece FEN
          else add(sq.piece.fen);                           //   else piece FEN
        }
        else empty++;                                       // else count empties
      });
      fen += addempties();                                  // add remaining empties
      return fen;
    }
    game(nr) {
      this.fen = games[nr].fen;
    }
    moves(square) {
      let piece = this.layerPieces.squares(square);
      if (piece)
        return piece.calculate_piece_moves().piece_destinations;
      else
        return [];
    }
    get pieces() {
      return this.piece('*');
    }
    piece(
      fen_is = "K",//just any default
      selector = false// optional custom selector string
    ) {
      if (is_square(fen_is)) {  // selector is A1 to H8 square
        selector = fen_is;
      } else {                              // selector is FEN or *
        if (fen_is == '*')
          selector = '*';
        else
          if (fen_is.length < 2) fen_is = FEN_translation_Map.get(fen_is);
        if (!selector) {
          if (fen_is.includes("-"))
            selector = `[is="${fen_is}"]`;
          else
            selector = fen_is = `[is*="${fen_is}"]`;
        }
      }
      return this.layerPieces.squares(selector);
    }
    isCheck(
      check = char => this.piece(char).hasAttribute(___ATTACKED_BY___)
    ) {
      return check('K') ? ___WHITE___ : check('k') ? ___BLACK___ : false;
    }
    isMate() {
      //!requires current player
      let piece = this.piece('K').data();
      return piece;

    }
    move(sq1, sq2) {
      let piece;
      if (sq1.length === 3) {
        let piece = FEN_translation_Map.get(sq1[0]);
        //todo where is this piece on the board?
        sq2 = sq1.slice(1);
      } else {
        piece = this.piece(sq1);
      }
      if (piece) piece.to(sq2);
      return this;//chaining
    }
    rotate() {
      this.board.classList.toggle("rotated");
    }
    get squares() {//top left to bottom right: "A8","A7","A6"... "G1","H1"
      return all_board_squares;
    }
    get files() {
      return files;
    }
    get ranks() {
      return ranksAscending;
    }
    square_from_position(x, y) {// pageX, pageY screen coordinates
      let boardrect = this.getBoundingClientRect();
      let squarewidth = boardrect.width / ___SQUARECOUNT___;
      let getindex = position => {
        let idx = 1;
        while (position > idx * squarewidth) idx++;
        return idx - 1;
      }
      let file = files[getindex(x - boardrect.left)]; // A to H
      let rank = ranks[getindex(y - boardrect.top)];  // 8 to 1
      if (file && rank) return file + rank;
      else return false;
    }
    attributeChangedCallback(name, oldValue, newValue) {
      if (name == ___ATTR_FEN___) {
        if (this.board) this.setfen(newValue);
        else this._initfen = newValue;
      } else if (name == ___ATTR_STATIC___) {
        if (oldValue && newValue === "true")
          this.make_board_interactive();
      }
    }
    squareData(fensquare) {
      let file = fensquare[0];
      let rank = fensquare[1];
      let square = file + rank;
      let idxFile = files.indexOf(file) + 1; // 1 to 8
      let idxRank = ranksAscending.indexOf(rank) + 1; // 1 to 8
      let piece_is = "none";
      let playdirection = false;
      let piece = this.layerPieces && this.piece(square);
      if (piece.length > 1) {
        if (this.draggingPiece) piece = this.draggingPiece;
        else piece = piece[1];
      }
      let square_element = this.layerSquares.squares(square);
      if (piece) {
        piece_is = piece.is;
        playdirection = piece_is.includes(___WHITE___) ? 1 : -1;
      }
      return {
        board: this.board,
        square,     // A1 to H8
        file,       // A  H
        rank,       // 1  8
        idxFile,    // A=1 H=8
        idxRank,    // 1, .. , 8
        piece,      // false OR DOM element <img is='white-queen'>
        piece_is,   // white-queen
        square_element, // <white-square> or <black-square>
        fen: FEN_translation_Map.get(piece_is),
        playdirection
      };
    }

    dispatch(eventname, detail = {}) {
      detail.name = eventname;
      this.dispatchEvent(
        new CustomEvent(ChesslyNameSpace + "-event", {
          bubbles: true,    // event bubbles UP the DOM
          composed: true,   // !!! required so Event bubbles through the shadowDOM boundaries
          detail
        }));
      return false;
    }

    start(fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w") {
      this.fen = fen;
    }

  }
);

// let board = document.querySelector("chessmeister-board");
// board.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
// board.fen = "4rrk1/1b2b2p/ppn5/3p1pnq/1P1N2p1/P1PB2P1/5PNP/R1BQ1RK1";
// board.fen = '8/2R5/5q1k/3Q2N1/3p4/PP3pPP/5n1K/4r3';
// board.add_board_piece("white-queen", "E4");
// board.show_moves_piece_in_square("D1");

console.log(ChesslyNameSpace + ' loaded');