'use strict';
const WALL = '#';
const BOX = '📦';
const EMPTY = ' ';
const TARGET = '🎯';
const PLAYER = '😀';
const GOLD = '🏆';
const CLOCK = '⏰';
const MAGNET = '🧲';
const WATER = '🌊';
const GLUE = '💩';

//---------------- Global variables---------------------------------------//
var gBoard = null;
var gSize = 10;
var gGame = {
    score: 0,
    numOfPlacedBoxes: 0,
    isOn: false,
    countTenSteps: -1,
    magnetOn: 0,
    pullDirection: null,
    // isThereBonus: true
};
var gTimer = null;
var gGamerPos = null;
var gBoxes = null;
var gTargets = null;
var gBonus = null;
var gObstacles = null;
var gBonusesTypes = [GOLD, CLOCK, MAGNET];
var gElGameOver = null;
var gElExplanation = null;
var gExplanationPeriod = 2000;

//---------------------------------------------------------------------------//
function init() {
    gElGameOver = document.querySelector('.endModal');
    if (!gGame.isOn)
        gElGameOver.style.display = 'none';

    gElExplanation = document.querySelector('.explanationModal span');
    gElExplanation.innerHTML = gExplanation1;

    gGame.score = 0;
    gGame.numOfPlacedBoxes = 0;
    gGame.isOn = true;
    gGame.countTenSteps = -1;
    gGame.magnetOn = 0;
    gGame.pullDirection = null;
    gGamerPos = {    //will be replaced with better method of putting boxes
        x: 7,
        y: 7,
    };
    gBoxes =          //will be replaced with better method of putting boxes
        [
            { x: 7, y: 5 },
            { x: 6, y: 7 }
        ];
    gTargets =          //will be replaced with better method of putting boxes
        [
            { x: 2, y: 5 },
            { x: 3, y: 5 }
        ];
    gBonus = {    //will be replaced with better method of putting boxes
        x: 3,
        y: 3,
    };
    gObstacles =          //will be replaced with better method of putting boxes
        [
            { x: 6, y: 6 },
            { x: 5, y: 7 }
        ];

    gBoard = createBoard();
    clearInterval(gTimer);
    printBoard(gBoard, '.board-container');
    switchBonus();
    gTimer = setInterval(function () { switchBonus(); }, 10000);
}

//---------------------------------------------------------------------------//
function createBoard() {
    var board = [];
    for (var i = 0; i < gSize; i++) {
        board.push([]);
        for (var j = 0; j < gSize; j++) {
            board[i][j] = { background: EMPTY, content: EMPTY };

            if (i === 0 || i === gSize - 1 ||
                j === 0 || j === gSize - 1 ||
                (j === 3 && i > 4 && i < gSize - 2)) {
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

    board[gGamerPos.x][gGamerPos.y].content = PLAYER; // Lay the player

    //Lay the obstacles
    board[gObstacles[0].x][gObstacles[0].y].background = GLUE;
    board[gObstacles[0].x][gObstacles[0].y].content = GLUE;

    board[gObstacles[1].x][gObstacles[1].y].background = WATER;
    board[gObstacles[1].x][gObstacles[1].y].content = WATER;

    //Lay one bonus
    board[gBonus.x][gBonus.y].background = GOLD;
    board[gBonus.x][gBonus.y].content = GOLD;

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
            if (mat[i][j].background === WALL)
                strHTML += '<td class="' + className + ' wall"></td>';
            else
                strHTML += '<td class="' + className + '"> ' + cell + ' </td>';
        }
        strHTML += '</tr>';
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

//---------------------------------------------------------------------------//
function updateScore(value) {
    // Update both the model and the dom for the score
    gGame.score += value;
    document.querySelector('score').innerText = 'Score: ' + gGame.score;
}

//---------------------------------------------------------------------------//
function checkGameOver() {
    if (gGame.numOfPlacedBoxes === gBoxes.length) {
        gGame.isOn = false;
        clearInterval(gTimer);
        gElGameOver = document.querySelector('.endModal');
        gElGameOver.style.display = 'block';
    }
}

//---------------------------------------------------------------------------//
function moveTo(eventKeyboard) {
    if (!gGame.isOn) return;

    var nextLocation = getNextLocation(eventKeyboard);
    // User pressed none-relevant key in the keyboard
    if (!nextLocation) return;

    var nextCell = gBoard[nextLocation.x][nextLocation.y];

    // Hitting a WALL, will not move anywhere
    if (nextCell.content === WALL) return;

    if (nextCell.content === BOX) {
        if (!tryMovingBox(gGamerPos.x, gGamerPos.y, eventKeyboard.code))
            return;
    }
    else {
        if (gGame.magnetOn === 2) {
            if ((gGamerPos.x - nextLocation.x === gGame.pullDirection.deltaX) &&
                (gGamerPos.y - nextLocation.y === gGame.pullDirection.deltaY)) {
                var pullABox = true;
            }
        }

        if (pullABox) {
            gBoard[gGame.pullDirection.x][gGame.pullDirection.y].content = gBoard[gGame.pullDirection.x][gGame.pullDirection.y].background;
            renderCell({ x: gGame.pullDirection.x, y: gGame.pullDirection.y }, gBoard[gGame.pullDirection.x][gGame.pullDirection.y].content);
            gBoard[gGamerPos.x][gGamerPos.y].content = BOX;
            gGame.magnetOn = 0;
            gGame.pullDirection = null;
            gElExplanation = document.querySelector('.explanationModal span');
            gElExplanation.innerHTML = '';
            gMagnetReminder = '';
        } else {
            gBoard[gGamerPos.x][gGamerPos.y].content = gBoard[gGamerPos.x][gGamerPos.y].background;
        }
        renderCell(gGamerPos, gBoard[gGamerPos.x][gGamerPos.y].content);

        gElExplanation = document.querySelector('.explanationModal span');
        if (nextCell.background === GOLD) {
            updateScore(-10);                  // it adds 10 points instead of adding 100
            gElExplanation.innerHTML = gExplanationGold;
            setTimeout(function () { gElExplanation.innerHTML = ''+gMagnetReminder; }, gExplanationPeriod);
            terminateBonus();
        } else if (nextCell.background === CLOCK) {
            gGame.countTenSteps++;
            gElExplanation.innerHTML = gExplanationClock;
            setTimeout(function () { gElExplanation.innerHTML = ''+gMagnetReminder; }, gExplanationPeriod);
            terminateBonus();
        } else if (nextCell.background === MAGNET) {
            gGame.magnetOn = 1;
            gElExplanation.innerHTML = gExplanationMagnet1;
            gMagnetReminder = '🧲 You still have a magnet :)';
         //   setTimeout(function () { gElExplanation.innerHTML = ''; }, gExplanationPeriod);
            terminateBonus();
        } else if (nextCell.background === GLUE) {
            updateScore(5);
            gGame.isOn = false;
            gElExplanation.innerHTML = gExplanationGlue;
            setTimeout(function () { gElExplanation.innerHTML = ''+gMagnetReminder; }, gExplanationPeriod);
            setTimeout(function () { gGame.isOn = true; }, 5000);
        }
        // Update the player   
        gGamerPos = nextLocation;

        gBoard[nextLocation.x][nextLocation.y].content = PLAYER;
        renderCell({ x: nextLocation.x, y: nextLocation.y }, PLAYER);
        updateScore(1);
    }
}

//---------------------------------------------------------------------------//
function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell${location.x}-${location.y}`);
    elCell.innerHTML = value;
}

//---------------------------------------------------------------------------//
function tryMovingBox(i, j, direction) {
    var deltaI = 0;
    var deltaJ = 0;
    var row = 0;
    var col = 0;

    switch (direction) {
        case 'ArrowUp': {
            deltaI = -1;
            break;
        }
        case 'ArrowDown': {
            deltaI = 1;
            break;
        }
        case 'ArrowLeft': {
            deltaJ = -1;
            break;
        }
        case 'ArrowRight': {
            deltaJ = 1;
            break;
        }
        default: return false;
    }

    if (gGame.magnetOn === 1 && gBoard[i + (deltaI * 2)][j + (deltaJ * 2)].background === WALL) {
        gGame.magnetOn = 2; // now the player can pull the box
        gGame.pullDirection = { x: i + deltaI, y: j + deltaJ, deltaX: deltaI, deltaY: deltaJ };
        gElExplanation = document.querySelector('.explanationModal span');
        gElExplanation.innerHTML = gExplanationMagnet2;
        setTimeout(function () { gElExplanation.innerHTML = ''+gMagnetReminder; }, gExplanationPeriod);
        return false;
    }

    if (gBoard[i + (deltaI * 2)][j + (deltaJ * 2)].background === WALL || gBoard[i + (deltaI * 2)][j + (deltaJ * 2)].content === BOX)
        return false;

    var slide = 0;
    if (gBoard[i + (deltaI * 2)][j + (deltaJ * 2)].background === WATER){
        slide = true;
        gElExplanation = document.querySelector('.explanationModal span');
        gElExplanation.innerHTML = gExplanationWater;
        setTimeout(function () { gElExplanation.innerHTML = ''+gMagnetReminder; }, gExplanationPeriod);
    }
    do {
            gBoard[(i + row) + (deltaI * 2)][(j + col) + (deltaJ * 2)].content = BOX;
            renderCell({ x: (i + row) + (deltaI * 2), y: (j + col) + (deltaJ * 2) }, BOX);

            gGamerPos.x += deltaI;
            gGamerPos.y += deltaJ;
            gBoard[gGamerPos.x][gGamerPos.y].content = PLAYER;
            renderCell({ x: gGamerPos.x, y: gGamerPos.y }, PLAYER);

            gBoard[i + row][j + col].content = gBoard[i + row][j + col].background;
            renderCell({ x: i + row, y: j + col }, gBoard[i + row][j + col].content);
    
        updateScore(1);
        row += deltaI;
        col += deltaJ;
    } while (slide && gBoard[(i + row) + (deltaI * 2)][(j + col) + (deltaJ * 2)].background != WALL &&
        gBoard[(i + row) + (deltaI * 2)][(j + col) + (deltaJ * 2)].content != BOX)

    if (gBoard[(i + row) + deltaI][(j + col) + deltaJ].background === TARGET) {
        gGame.numOfPlacedBoxes++;
    }
    if (gBoard[i + deltaI][j + deltaJ].background === TARGET) {
        gGame.numOfPlacedBoxes--;
    }

    checkGameOver();
    return true;
}

//---------------------------------------------------------------------------//
function getNextLocation(keyboardEvent) {
    var nextLocation = {
        x: gGamerPos.x,
        y: gGamerPos.y
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
function updateScore(addThis) {
    // Don't update if the Player has 10 free steps
    if (addThis === 1) {
        if (gGame.countTenSteps >= 0 && gGame.countTenSteps < 9) {
            gGame.countTenSteps++;
            return;
        }
        else if (gGame.countTenSteps === 9) {
            gGame.countTenSteps = -1;
            return;
        }
    }

    gGame.score += addThis;
    document.querySelector('.score').innerText = 'Score: ' + gGame.score;
}

//---------------------------------------------------------------------------//
function switchBonus() {
    var oldPos = gBonus;
    var bonusType = gBonusesTypes[Math.floor(Math.random() * 3)];
    var newPos = getRandomEmptyCell();

    gBoard[newPos.x][newPos.y].background = bonusType;
    gBoard[newPos.x][newPos.y].content = bonusType;
    renderCell(newPos, bonusType);

    gBoard[oldPos.x][oldPos.y].background = EMPTY;
    gBoard[oldPos.x][oldPos.y].content = EMPTY;
    renderCell(oldPos, EMPTY);
    gBonus = newPos;
    setTimeout(function () { terminateBonus(); }, 5000);
}

//---------------------------------------------------------------------------//
function terminateBonus() {
    gBoard[gBonus.x][gBonus.y].background = EMPTY;
    gBoard[gBonus.x][gBonus.y].content = EMPTY;
    renderCell(gBonus, EMPTY);
}

//---------------------------------------------------------------------------//
function getRandomEmptyCell() {
    var min = 1;
    var max = gSize - 1;
    var randomInRow;
    var randomInCol;
    do {
        randomInRow = Math.floor(Math.random() * (max - min + 1)) + min;
        randomInCol = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (gBoard[randomInRow][randomInCol].content != EMPTY)

    return ({ x: randomInRow, y: randomInCol });
}

var gExplanation1 = 'Push those boxes to their targets... \n One box at a time... \n We are counting your steps.  \n You have 5 seconds to collcet bonuses that appear on the board';
var gExplanationGold = '🏆 You Collected Gold Trophy - 10 points will be reduced from your score!';
var gExplanationClock = '⏰ You Collected 10 un-counted Steps!... Go ahead and use them';
var gExplanationMagnet1 = '🧲 You Collceted a Magnet!... You can now pull a stuck box... BUMP into the box and then pull it back';
var gExplanationMagnet2 = '🧲 Now pull back the box...';
var gExplanationGlue = '💩 You stepped on shitty glue... you are stuck here for 5 sec :(';
var gExplanationWater = '🌊 You pushed a box over water and it slipped all the way';
var gMagnetReminder = '';