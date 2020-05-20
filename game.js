'use strict';
const WALL = '#';
const BOX = '@';
const EMPTY = ' ';
const TARGET = '+';
const PLAYER = '&';

//---------------- Global variables---------------------------------------//
var gBoard = null;
var gGame = {
    score: 0,
    numOfPlacedBoxes: 0,
    isOn: false
};
var gPlayer = {
    x: 7,
    y: 7,
    //  standingOnTarget: false
};
var gBoxes =          //will be replaced with better method of putting boxes
    [
        { x: 7, y: 5 },
        { x: 6, y: 7 }
    ];
var gTargets =          //will be replaced with better method of putting boxes
    [
        { x: 2, y: 2 },
        { x: 3, y: 2 }
    ];

//---------------------------------------------------------------------------//
function init() {
    gBoard = buildBoard();
    printBoard(gBoard, '.board-container');
    gGame.isOn = true;
}

//---------------------------------------------------------------------------//
function buildBoard() {
    var SIZE = 10;
    var board = [];
    for (var i = 0; i < SIZE; i++) {
        board.push([]);
        for (var j = 0; j < SIZE; j++) {
            board[i][j] = { background: EMPTY, content: EMPTY };

            if (i === 0 || i === SIZE - 1 ||
                j === 0 || j === SIZE - 1 ||
                (j === 3 && i > 4 && i < SIZE - 2)) {
                board[i][j] = { background: WALL, content: WALL };
            }
        }
    }
    for (var h = 0; h < gTargets.length; h++) {  //Lay the targets
        board[gTargets[h].x][gTargets[h].y].background = TARGET;
        board[gTargets[h].x][gTargets[h].y].content = TARGET;
    }

    for (var k = 0; k < gBoxes.length; k++)  //Lay the boxes
        board[gBoxes[k].x][gBoxes[k].y].content = BOX;

    board[gPlayer.x][gPlayer.y].content = PLAYER; // Lay the player

    return board;
}

//---------------------------------------------------------------------------//
function printBoard(mat, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j].content;
            var className = 'cell cell' + i + '-' + j;
            strHTML += '<td class="' + className + '"> ' + cell + ' </td>'
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

//---------------------------------------------------------------------------//
function updateScore(value) {
    // Update both the model and the dom for the score
    gGame.score += value;
    document.querySelector('header h3 span').innerText = gGame.score;
}

//---------------------------------------------------------------------------//
function isGameOver() {
    if (gGame.numOfPlacedBoxes === gBoxes.length) {
        gGame.isOn = false;
        alert('yeyyyy');
    }
}

//---------------------------------------------------------------------------//
function movePlayer(eventKeyboard) {
    if (!gGame.isOn) return;

    var nextLocation = getNextLocation(eventKeyboard);
    // User pressed none-relevant key in the keyboard
    if (!nextLocation) return;

    var nextCell = gBoard[nextLocation.x][nextLocation.y];

    // Hitting a WALL, will not move anywhere
    if (nextCell.background === WALL) return;

    // Hitting Box 
    if (nextCell.content === BOX)
        if (!tryMovingBox(gPlayer.x, gPlayer.y, eventKeyboard.code))
            return;
    
    updateScore(); 
    isGameOver();

    gBoard[gPlayer.x][gPlayer.y].content = gBoard[gPlayer.x][gPlayer.y].background;
    renderCell(gPlayer, gBoard[gPlayer.x][gPlayer.y].content);

    // Update the player   
    gPlayer.x = nextLocation.x;
    gPlayer.y = nextLocation.y;

    gBoard[nextLocation.x][nextLocation.y].content = PLAYER;
    renderCell({ x: nextLocation.x, y: nextLocation.y }, PLAYER);

}

//---------------------------------------------------------------------------//
function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell${location.x}-${location.y}`);
    elCell.innerHTML = value;
}

//---------------------------------------------------------------------------//
function tryMovingBox(i, j, direction) {
    switch (direction) {
        case 'ArrowUp': {
            if (gBoard[i - 2][j].background === WALL || gBoard[i - 2][j].content === BOX)
                return false;

            gBoard[i - 2][j].content = BOX;
            renderCell({ x: i - 2, y: j }, BOX);

            gBoard[i - 1][j].content = gBoard[i - 1][j].background;
            renderCell({ x: i - 1, y: j }, gBoard[i - 1][j].background);

            if (gBoard[i - 2][j].background === TARGET) gGame.numOfPlacedBoxes++;
            if (gBoard[i - 1][j].background === TARGET) gGame.numOfPlacedBoxes--;
            break;
        }
        case 'ArrowDown':
            if (gBoard[i + 2][j].background === WALL || gBoard[i + 2][j].content === BOX)
                return false;

            gBoard[i + 2][j].content = BOX;
            renderCell({ x: i + 2, y: j }, BOX);

            gBoard[i + 1][j].content = gBoard[i + 1][j].background;
            renderCell({ x: i + 1, y: j }, gBoard[i + 1][j].background);

            if (gBoard[i + 2][j].background === TARGET) gGame.numOfPlacedBoxes++;
            if (gBoard[i + 1][j].background === TARGET) gGame.numOfPlacedBoxes--;
            break;
        case 'ArrowLeft':
            if (gBoard[i][j - 2].background === WALL || gBoard[i][j - 2].content === BOX)
                return false;

            gBoard[i][j - 2].content = BOX;
            renderCell({ x: i, y: j - 2 }, BOX);

            gBoard[i][j - 1].content = gBoard[i][j - 1].background;
            renderCell({ x: i, y: j - 1 }, gBoard[i][j - 1].background);

            if (gBoard[i][j - 2].background === TARGET) gGame.numOfPlacedBoxes++;
            if (gBoard[i][j - 1].background === TARGET) gGame.numOfPlacedBoxes--;
            break;
        case 'ArrowRight':
            if (gBoard[i][j + 2].background === WALL || gBoard[i][j + 2].content === BOX)
                return false;

            gBoard[i][j + 2].content = BOX;
            renderCell({ x: i, y: j + 2 }, BOX);

            gBoard[i][j + 1].content = gBoard[i][j + 1].background;
            renderCell({ x: i, y: j + 1 }, gBoard[i][j + 1].background);

            if (gBoard[i][j + 2].background === TARGET) gGame.numOfPlacedBoxes++;
            if (gBoard[i][j + 1].background === TARGET) gGame.numOfPlacedBoxes--;
            break;
        default: return false;
    }
    return true;
}

//---------------------------------------------------------------------------//
function getNextLocation(keyboardEvent) {
    var nextLocation = {
        x: gPlayer.x,
        y: gPlayer.y
    };

    switch (keyboardEvent.code) {
        case 'ArrowUp':
            nextLocation.x--;
            break;
        case 'ArrowDown':
            nextLocation.x++;
            break;
        case 'ArrowLeft':
            nextLocation.y--;
            break;
        case 'ArrowRight':
            nextLocation.y++;
            break;
        default: return null;
    }
    return nextLocation;
}

//---------------------------------------------------------------------------//
function updateScore() {
    // Update both the model and the dom for the score
    gGame.score ++;
    document.querySelector('header h3 span').innerText = gGame.score;
  }