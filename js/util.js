'use strict'


function createMat(ROWS, COLS) {
    var mat = []
    for (var i = 0; i < ROWS; i++) {
        var row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}



function copyMat(mat) {
    var newMat = [];
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        for (var j = 0; j < mat[0].length; j++) {
            newMat[i][j] = mat[i][j];
        }
    }
    return newMat;
}

function countNeighbors(cellI, cellJ, mat) {
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[i].length) continue;

            if (mat[i][j] === LIFE || mat[i][j] === SUPER_LIFE) neighborsCount++;
        }
    }
    return neighborsCount;
}

function getTime(time) {
    return new Date(time).toString().split(" ")[4];
}


function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// location such as: {i: 2, j: 7}
function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`[data-i="${location.i}"][data-j="${location.j}"]`);
    elCell.style.backgroundColor = value;
}


function renderBoard(mat, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j];
            var className = 'cell cell' + i + '-' + j;
            strHTML += '<td class="' + className + '"> ' + cell + ' </td>'
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}



function startTimeInterval() {
    var gStartTime = Date.now()

    gTimeIntervalID = setInterval(function () {
        var elTimer = document.querySelector('.timeClock')
        var miliSecs = Date.now() - gStartTime
        elTimer.innerText = `${((miliSecs) / 1000).toFixed()}`
    }, 1000)
}

function getEmpty(gBoard) {
    var emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                emptyCells.push({ i, j })
            }
        }
    }
    if (emptyCells.length) {
        var randPlace = drawNum(emptyCells)
    }
    return randPlace
}

function drawNum(gNums) {
    var idx = getRandomInt(0, gNums.length)
    var place = gNums[idx]
    gNums.splice(idx, 1)
    return place
}


function removeModal() {
    var elModal = document.querySelector('.modal')
    elModal.style.display = 'none'
}


function buildBoard() {
    var SIZE = gLevel.SIZE;
    var board = [];
    for (var i = 0; i < SIZE; i++) {
        board.push([]);
        for (var j = 0; j < SIZE; j++) {
            gCell = {
                minesAroundCount: 0,
                isMarked: false,
                isMine: false,
                isShown: false
            }
            board[i][j] = gCell
        }
    }

    return board;
}