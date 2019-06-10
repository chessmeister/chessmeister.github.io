# CheSSly.js - a Custom Element UI experiment on a chess board

## A single 8300 **Bytes** GZ (23KB minified) file creating chess pieces and board

## Demo: https://chessly.github.io

![](https://i.imgur.com/AZmMjfC.jpg)

````html
<head>
    <script src="chessly.js"></script>
</head>
````

Chessly extends Built In IMG element to display chess pieces: (no external SVG files required)

````html
<img is="white-king">
<img is="white-knight">
<img is="black-rook">
````

For more information on SVG and Custom Elements see: <a
    href="https://card-ts.github.io/playingcardts/">https://card-ts.github.io/playingcardts/</a>


Chessly creates an autonomous Web Component displaying a full chess board:

````html
<chessly-board fen="...."></chessly-board>
````

The board can be configured with CSS variables:</h3>

````css
chessly-board {
    --chessly-squarelabel-color: black;// transparent sets squarelabels not visible
    --chessly-attack-color: darkred;
    --chessly-defend-color: darkgreen;
    --chessly-undefended-color: red;
    --chessly-squarewhite-color: #f0e9c5;
    --chessly-squareblack-color: #b58863;
}
````

# License: Unlicense

My first thought was making it a [Beerware License](https://en.wikipedia.org/wiki/Beerware) 

But that is not an officially registered license. So I went with the [Unlicense](https://choosealicense.com/licenses/unlicense/)  
Which basically says you can do anything you want with what I created. But you can't sue me.

🍺🍺🍺 ... you can still buy me a beer though  
If you are flying from the US to Amsterdam, bring me anything from the [Heretic Brewing Company](http://hereticbrewing.com/beers)

Cheers!

https://choosealicense.com/licenses/unlicense/

<hr>

# Resources

* convert PGN to FEN : http://www.chess-poster.com/english/lt_pgn_to_fen/lt_pgn_fen.htm
* implement a Chess Game: https://github.com/sandy98/chess-board

* https://rexxars.github.io/react-chess/  
  React - **50KB**!! GZipped - interaction: move pieces , no chessrules

* Created by the maker of https://card-ts.github.io/playingcardts
Published: 2019-06-10 14:07 
