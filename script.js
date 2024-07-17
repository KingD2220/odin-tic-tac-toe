function Gameboard() {
    const board = [];

    for (let i = 0; i < 3; i++) {
        board[i] = [];
        for (let j = 0; j < 3; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;

    const occupyCoordinates = (row, col, player) => {
        const cell = board[row][col];
        const occupied = cell.getOccupancy();
        if (!occupied) {
            cell.occupyCell(player);
            return true;
        }
        return false;
    };

    const getCoordinateOccupancy = (row, col) => {
        return board[row][col].getOccupancy();
    };

    return { getBoard, occupyCoordinates, getCoordinateOccupancy };
}

function Cell() {
    let occupancy = 0;

    const occupyCell = (player) => {
        occupancy = player;
    };

    const getOccupancy = () => occupancy;

    return { occupyCell, getOccupancy };
}

function GameController(playerOneName = 'Player One', playerOneToken = 'X', playerTwoName = 'Player Two', playerTwoToken = 'O') {
    let board = Gameboard();

    let moves = 0;

    const players = [
        { name: playerOneName, token: playerOneToken }, { name: playerTwoName, token: playerTwoToken }];

    let activePlayer = players[0];

    const switchPlayer = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }

    const getActivePlayer = () => activePlayer;

    const getNextPlayer = () => {
        return activePlayer === players[0] ? players[1] : players[0];
    };

    const incrementMoves = () => moves++;

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn`)
    }

    const checkWinner = () => {
        let a;
        let b;
        let c;

        //Check rows
        for (let i = 0; i < 3; i++) {
            a = board.getCoordinateOccupancy(i, 0);
            b = board.getCoordinateOccupancy(i, 1);
            c = board.getCoordinateOccupancy(i, 2);

            if (a != 0 && a === b && a === c) {
                return true;
            }
        }

        //Check cols
        for (let i = 0; i < 3; i++) {
            a = board.getCoordinateOccupancy(0, i);
            b = board.getCoordinateOccupancy(1, i);
            c = board.getCoordinateOccupancy(2, i);

            if (a != 0 && a === b && a === c) {
                return true;
            }
        }

        //Check diagonals

        a = board.getCoordinateOccupancy(0, 0);
        b = board.getCoordinateOccupancy(1, 1);
        c = board.getCoordinateOccupancy(2, 2);

        if (a != 0 && a === b && a === c) {
            return true;
        }

        a = board.getCoordinateOccupancy(0, 2);
        b = board.getCoordinateOccupancy(1, 1);
        c = board.getCoordinateOccupancy(2, 0);

        if (a != 0 && a === b && a === c) {
            return true;
        }

        return false;
    };

    const checkState = () => {
        if (checkWinner()) {
            return 'win';
        }
        if (moves === 9) {
            return 'tie';
        }
        else return 'inprogress'
    };

    const playRound = (row, col) => {

        //Attempt to occupy coordinates
        //Valid move (vacant)
        if (board.occupyCoordinates(row, col, getActivePlayer().token)) {
            console.log(`${getActivePlayer().name} occupies row ${row}, col ${col}...`);
            
            incrementMoves();
            switchPlayer();

            return checkState();
        }
        //Invalid move (occupied)
        else {
            console.log(`Space is already occupied. Try again ${getActivePlayer().name}.`);
            board.printBoard();

            return 'invalid';
        }
    };

    return { playRound, getActivePlayer, getNextPlayer, checkState };
}

function ScreenController() {
    let game = GameController();
    const formDialog = document.querySelector('.form-dialog')
    const playerTurnText = document.querySelector('.turn');
    const boardContainer = document.querySelector('.board-container')
    const restartButton = document.querySelector('.restart');
    const resultDialog = document.querySelector('.result-dialog');
    const playAgainButton = document.querySelector('.play-again');

    formDialog.showModal();

    //Board click listener
    boardContainer.addEventListener('click', (e) => {
        const targetCell = e.target;
        const row = targetCell.getAttribute('data-row');
        const col = targetCell.getAttribute('data-col');
        const activePlayer = game.getActivePlayer();
        
        switch(game.playRound(row, col)) {
            case 'inprogress': 
                displayTurn(targetCell, activePlayer);
                break;
            case 'win':
                displayTurn(targetCell, activePlayer);
                displayResult(`${activePlayer.name} Wins!`);
                break;
            case 'tie':
                displayTurn(targetCell, activePlayer);
                displayResult('Draw! Try Again.');
                break;
        }
    });

    //Button listeners
    restartButton.addEventListener('click', () => {
        resetGame();
        resetDisplay();
    });

    //Play again listener
    playAgainButton.addEventListener('click', () => {
        resetGame();
        resetDisplay();
    });

    //Start Game
    formDialog.addEventListener('submit', (e) => {
        const names = new FormData(e.target);
        const nameOne = names.get('p1') === '' ? undefined : names.get('p1');
        const nameTwo = names.get('p2') === '' ? undefined : names.get('p2');
        game = GameController(nameOne, 'X', nameTwo, 'O');
        updatePlayerTurn();
        formDialog.close();
    });

    const displayTurn = (cell, player) => {
        cell.textContent = player.token;
        updatePlayerTurn();
    }

    const updatePlayerTurn = () => {
        let player = game.getActivePlayer();
        playerTurnText.textContent = `${player.name}'s Turn - ( ${player.token} )`;
    }

    const displayResult = (message) => {
        let winScreen = document.querySelector('.result-message')
        winScreen.textContent = message;
        winScreen.appendChild(playAgainButton);
        resultDialog.showModal();
    }

    const resetDisplay = () => {
        boardContainer.innerHTML = `   
        <div class="cell" data-row="0" data-col="0"></div>
        <div class="cell" data-row="0" data-col="1"></div>
        <div class="cell" data-row="0" data-col="2"></div>
        <div class="cell" data-row="1" data-col="0"></div>
        <div class="cell" data-row="1" data-col="1"></div>
        <div class="cell" data-row="1" data-col="2"></div>
        <div class="cell" data-row="2" data-col="0"></div>
        <div class="cell" data-row="2" data-col="1"></div>
        <div class="cell" data-row="2" data-col="2"></div>
        `
    }

    const resetGame = () => {
        game = GameController(game.getActivePlayer().name, game.getActivePlayer().token, game.getNextPlayer().name, game.getNextPlayer().token);
        resultDialog.close();
    }
}

ScreenController();