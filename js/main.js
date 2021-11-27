'use strict'


var gBoard;
var MINE = '💣'
var gFirstClick = 0
var gMineClicked = 0
var MARKED = '🚩'
var EMPTY = ''
var gLifeLeft = 3
var gSafe = 3
var gIsHint = false
var gHintClick = 3


var gLevel = {
    SIZE: 4,
    MINES: 2
};

var gCell;
var gTimeIntervalID;
var gTimeoutId;



var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}


function init() {
    reset()
    showLocalStorage()
    gBoard = buildBoard()
    renderBoard(gBoard)
    clearInterval(gTimeIntervalID)
    changeHintText()
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            var className = (cell.isMine) ? 'mine' : 'cell'
            strHTML += `\t<td data-i ="${i}" data-j="${j}" class="${className}" 
            oncontextmenu="cellMarked(this,event,${i},${j})"
            onclick="cellClicked(this, ${i}, ${j})"></td>\n`
        }
        strHTML += `</tr>\n`
    }
    var elContainer = document.querySelector('.container')
    elContainer.innerHTML = strHTML

}

function cellMarked(elCell, event, i, j) {
    if (!gGame.isOn) return;
    if (gBoard[i][j].isShown) return;
    event.preventDefault();
    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false
        elCell.innerText = EMPTY
        gGame.markedCount--
    } else {
        gBoard[i][j].isMarked = true
        elCell.innerText = MARKED
        gGame.markedCount++
    }
    checkGameOver()
}


function cellClicked(elCell, i, j) {
    var elText = document.querySelector('.lives')
    var elSpan = elText.querySelector('span')

    if (!gGame.isOn) return;
    if (gBoard[i][j].isMarked) return;

    if (!gFirstClick) {
        gFirstClick++
        var pos = {
            i,
            j
        }
        getRandomMine(gBoard, pos)
        buildBoard()
        renderBoard(gBoard)
        startTimeInterval()
        var firstElCell = document.querySelector(`[data-i="${pos.i}"][data-j="${pos.j}"]`)
        var res = setMinesNegsCount(i, j, gBoard)
        firstElCell.innerText = res
        getColor(res, firstElCell)

        if (res === 0) {
            expandShown(gBoard, i, j)
            firstElCell.innerText = EMPTY
        }
    } else {

        if (gIsHint) {
            if (!gBoard[i][j].isShown) {
                gBoard = openNegs(i, j, gBoard)
                setTimeout(function () {
                    closeNegs(i, j, gBoard)
                    elCell.innerText = EMPTY
                    gBoard[i][j].isShown = false
                    elCell.style.backgroundColor = 'white'
                    gBoard[i][j].minesAroundCount = 0

                }, 1000)
                gHintClick--
                changeHintText()
                gIsHint = false
                return;
            } else {
                return;
            }
        }
    }


    if (!gBoard[i][j].isShown) {
        gBoard[i][j].minesAroundCount = 0
        var res = setMinesNegsCount(i, j, gBoard)
        elCell.innerText = res
        gBoard[i][j].isShown = true
        getColor(res, elCell)

        if (res !== MINE) gGame.shownCount++
        if (res === MINE) {
            elSpan.innerHTML = `${--gLifeLeft}`
            gMineClicked++
        }
        if (res === 0) {
            elCell.innerText = EMPTY
            elCell.style.backgroundColor = 'gray'
            expandShown(gBoard, i, j)
        }
    }



    if (gTimeoutId) {
        clearTimeout(gTimeoutId)
        var pos = {
            i,
            j
        }
        if (elCell.innerText === EMPTY) renderCell(pos, 'gray')
        if (elCell.innerText !== EMPTY) renderCell(pos, 'white')
    }



    checkGameOver()
}

function setMinesNegsCount(cellI, cellJ, mat) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (mat[cellI][cellJ].isMine) return MINE;
            if (i === cellI && j === cellJ && !mat[i][j].isMine) {
                continue;
            }
            if (j < 0 || j >= mat[i].length) continue;

            if (mat[i][j].isMine) mat[cellI][cellJ].minesAroundCount++;
        }
    }
    return mat[cellI][cellJ].minesAroundCount++;

}

function gameOver() {
    var elImg = document.querySelector('.restart')
    var elModal = document.querySelector('.modal')
    var strHTML = ''
    gGame.isOn = false
    clearInterval(gTimeIntervalID)

    if (gLifeLeft === 0) {
        strHTML += `<h3>Oh man,
        Better luck next time!</h3>
        <button class="modal-btn" onclick="removeModal()">x</button>`
        elModal.innerHTML = strHTML
        elModal.style.display = 'block'
        elImg.src = `img/3.gif`
        showMines()
    } else {
        strHTML += `<h3>Wow , Incredible Victory!</h3>
        <button class="modal-btn" onclick="removeModal()">x</button>`
        elModal.innerHTML = strHTML
        elModal.style.display = 'block'
        elImg.src = `img/2.gif`
        getLocalStorage()
    }
}


function getRandomMine(gBoard, pos) {
    var minePlaces = []

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (i !== pos.i && j !== pos.j) {
                minePlaces.push(gBoard[i][j])
            }
        }
    }

    for (var i = 0; i < gLevel.MINES; i++) {
        var randPlace = drawNum(minePlaces)
        randPlace.isMine = true
    }
}



function restart() {
    removeModal()
    init()

}

function checkGameOver() {
    if (gLifeLeft === 0) return gameOver()
    if (gGame.shownCount === ((gLevel.SIZE ** 2) - gLevel.MINES) &&
        (gGame.markedCount === (Math.abs(gLevel.MINES - gMineClicked)))) return gameOver()
}


function setLevel(SIZE, MINES) {
    gLevel = {
        SIZE,
        MINES
    }
    init()
    removeModal()
}

function safeBtn() {
    var elDiv = document.querySelector('.safe')
    var elSafeSpan = elDiv.querySelector('h5 span')
    if (gSafe) {
        var res = getEmpty(gBoard)
        var elRandCell = document.querySelector(`[data-i="${res.i}"][data-j="${res.j}"]`)
        elRandCell.style.backgroundColor = 'cyan'
        gTimeoutId = setTimeout(function () {
            elRandCell.style.backgroundColor = 'white'
        }, 3000)
    } else {
        return
    }
    elSafeSpan.innerText = --gSafe
}




function expandShown(board, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) {
                continue;
            }
            if (j < 0 || j >= board[i].length) continue;

            if (board[i][j].isMine) board[cellI][cellJ].minesAroundCount++;

            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)

            if (!gBoard[i][j].isShown) {
                var res = setMinesNegsCount(i, j, gBoard)
                elCell.style.backgroundColor = 'gray'
                elCell.innerText = res
                gBoard[i][j].isShown = true
                gGame.shownCount++
                getColor(res, elCell)
                if (res === 0) {
                    elCell.innerText = EMPTY
                    expandShown(gBoard, i, j)
                }
            }

        }
    }
}


function showMines() {
    var elMines = document.querySelectorAll('.mine');
    for (var i = 0; i < elMines.length; i++) {
        var elMine = elMines[i];
        elMine.innerText = MINE
        elMine.style.backgroundColor = 'red';
    }
}



function getLocalStorage() {
    var elRecordEasy = document.querySelector('.easy')
    var elRecordHard = document.querySelector('.hard')
    var elRecordExpert = document.querySelector('.expert')
    var elTimer = document.querySelector('.timeClock')
    if (gLevel.SIZE === 4 && elTimer.innerText < localStorage.getItem("Record Time Easy:") ||
        gLevel.SIZE === 4 && !localStorage.getItem("Record Time Easy:")) {
        localStorage.setItem("Record Time Easy:", `${elTimer.innerText}`);
        elRecordEasy.innerText = `*Easy Time Record: ${localStorage.getItem("Record Time Easy:")}s`
    }
    if (gLevel.SIZE === 8 && elTimer.innerText < localStorage.getItem("Record Time Hard:") ||
        gLevel.SIZE === 8 && !localStorage.getItem("Record Time Hard:")) {
        localStorage.setItem("Record Time Hard:", `${elTimer.innerText}`);
        elRecordHard.innerText = `*Hard Time Record: ${localStorage.getItem("Record Time Hard:")}s`
    }
    if (gLevel.SIZE === 12 && elTimer.innerText < localStorage.getItem("Record Time Expert:") ||
        gLevel.SIZE === 12 && !localStorage.getItem("Record Time Expert:")) {
        localStorage.setItem("Record Time Expert:", `${elTimer.innerText}`);
        elRecordExpert.innerText = `*Expert Time Record: ${localStorage.getItem("Record Time Expert:")}s`
    }

}

function showLocalStorage() {
    var elRecordEasy = document.querySelector('.easy')
    var elRecordHard = document.querySelector('.hard')
    var elRecordExpert = document.querySelector('.expert')

    if (!localStorage.getItem("Record Time Easy:")) {
        elRecordEasy.innerText = `*Easy Time Record:`
    } else {
        elRecordEasy.innerText = `*Easy Time Record: ${localStorage.getItem("Record Time Easy:")}s`
    }
    if (!localStorage.getItem("Record Time Hard:")) {
        elRecordHard.innerText = `*Hard Time Record:`
    } else {
        elRecordHard.innerText = `*Hard Time Record: ${localStorage.getItem("Record Time Hard:")}s`
    }

    if (!localStorage.getItem("Record Time Expert:")) {
        elRecordExpert.innerText = `*Expert Time Record:`
    } else {
        elRecordExpert.innerText = `*Expert Time Record: ${localStorage.getItem("Record Time Expert:")}s`
    }
}


function reset() {
    var elDiv = document.querySelector('.safe')
    var elSafeSpan = elDiv.querySelector('h5 span')
    var elImg = document.querySelector('.restart')
    var elSpan = document.querySelector('span')
    var elTimer = document.querySelector('.timeClock')
    elImg.src = `img/1.gif`
    gGame.isOn = true
    gMineClicked = 0
    gFirstClick = 0
    gGame.markedCount = 0
    gGame.shownCount = 0
    gLifeLeft = 3
    gSafe = 3
    gHintClick = 3
    elSafeSpan.innerText = gSafe
    elSpan.innerText = gLifeLeft
    elTimer.innerText = ''
}