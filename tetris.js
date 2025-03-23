var elt = document.getElementById('calculator');
var calculator = Desmos.Calculator(elt);

var tileTypes = [[[0,0],[0,1],[1,0],[1,1]],
    [[0,0],[-1,0],[-1,-1],[1,0]],
    [[0,0],[0,-1],[0,1],[0,2]],
    [[0,0],[0,-1],[1,0],[1,1]],
    [[0,0],[0,1],[0,-1],[1,1]],
    [[0,0],[0,1],[0,-1],[1,0]]]

var colorPalette = ['#c74440', '#2d70b3', '#388c46', '#6042a6', '#fa7e19', '#000000']

var activeTiles = []
var gameBoard = []
var lineClearScore = [0, 40, 100, 300, 1200]
var piece_num = 0
var gameState = 'init'
var gameOn = true
var dropInterval = 0
var numLines = 0
var score = 0

for(var i = 0; i < 24; i++){
    gameBoard[i] = [];
    for(var j = 0; j < 10; j++){
        gameBoard[i][j] = 0;
    }
}


calculator.setExpression({
    id: 'b1',
    latex: 'y=0\\{0\\le x \\le 10\\}',
    color: '#000000'
})
calculator.setExpression({
    id: 'b2',
    latex: 'y=24\\{0\\le x \\le 10\\}',
    color: '#000000'
})
calculator.setExpression({
    id: 'b3',
    latex: 'x=0\\{0\\le y \\le 24\\}',
    color: '#000000'
})
calculator.setExpression({
    id: '41',
    latex: 'x=10\\{0\\le y \\le 24\\}',
    color: '#000000'
})

function resetGame(){
    numLines = 0; dropInterval = 0; score = 0;
    for(var i = 0; i < 24; i++){
        for(var j = 0; j < 10; j++){
            if(gameBoard[i][j] != 0){
                calculator.removeExpression({id: gameBoard[i][j][0]})
                gameBoard[i][j] = 0;
            }
        }
    }
    activeTiles = []
}

function generatePiece(){
    var piece_type = tileTypes[Math.floor(Math.random() * 6)];
    var init_y = 22, init_x = 4;
    var color = colorPalette[Math.floor(Math.random() * 6)];
    for(var i = 0; i < 4; i++){
        activeTiles[i] = [init_x - piece_type[i][1], init_y - piece_type[i][0], [piece_num, i], color, i == 0];
    }
    return checkForCollision()
}

function shiftPiece(dir){
    for(var tile of activeTiles){
        const newX = dir[0] + tile[0];
        const newY = dir[1] + tile[1];
        if(newX < 0 || newX > 9 || newX < 0 || newY > 23 || 
            (gameBoard[newY][newX] != 0 && gameBoard[newY][newX][0][0] != tile[2][0])){
            return;
        }
    }

    for(var i = 0; i < activeTiles.length; i++){
        // calculator.removeExpression({id: activeTiles[i][2]})
        gameBoard[activeTiles[i][1]][activeTiles[i][0]] = 0 // always remember that gameBoard corresponds to y and x respectivley while active tiles is the other way around :skull:
        activeTiles[i][0] += dir[0];
        activeTiles[i][1] += dir[1];
    }
}

function displayTiles(){
    activeTiles.forEach(function(tile, _){
        gameBoard[tile[1]][tile[0]] = [tile[2], tile[3]]
    })
    for(var i = 0; i < 24; i++){
        for(var j = 0; j < 10; j++){
            if(gameBoard[i][j] != 0){
                calculator.setExpression({
                    id: gameBoard[i][j][0],
                    latex: '\\polygon(('+j+','+i+'),('+(j+1)+','+i+'),('+(j+1)+','+(i+1)+'),('+j+','+(i+1)+'))',
                    color: gameBoard[i][j][1]
                })
            }
        }
    }
}

function checkForCollision(){
    for(var tile of activeTiles){
        var x = tile[0], y = tile[1], identity = tile[2][0];
        if(y == 0 || (gameBoard[y-1][x] != 0 && gameBoard[y-1][x][0][0] != identity)) return true;
    }
    return false;
}

function checkForLineClear(){
    var lineClears = [], cnt = 0;
    gameBoard.forEach(function(row, idx){
        var clearRow = true;
        for(var tile of row){
            if(tile == 0){
                clearRow = false;
                break;
            }
        }
        if(clearRow){
            lineClears.push(idx);
            for(var i = 0; i < 10; i++){
                calculator.removeExpression({id: gameBoard[idx][i][0]});
                gameBoard[idx][i] = 0;
            }
            cnt++;
        }
    });
    numLines += cnt;
    var shift = 0;
    for(var i = 0; i < 24; i++){
        if(shift < lineClears.length && i == lineClears[shift]){
            shift++;
            continue;
        }
        for(var j = 0; j < 10; j++){
            if(gameBoard[i][j] != 0){
                let tmp = gameBoard[i][j];
                gameBoard[i][j] = 0;
                gameBoard[i-shift][j] = tmp;
            }
        }
    }
    return cnt;
}

function rotatePiece(){
    var center_x = 0, center_y = 0;
    var offsets = [], rotatePiece = []
    var color = activeTiles[0][3]
    for(let tile of activeTiles){
        if(tile[4]){
            center_x = tile[0];
            center_y = tile[1];
            break;
        }
    }
    for(let tile of activeTiles){
        offsets.push([center_y - tile[1], tile[0] - center_x])
    }
    var valid = true;
    offsets.forEach(function(diff, idx){
        const new_x = center_x + diff[0]
        const new_y = center_y + diff[1]
        if(new_x > 9 || new_x < 0 || new_y > 23 || new_y < 0 || (gameBoard[new_y][new_x] != 0 && gameBoard[new_y][new_x][0][0] != piece_num)){
            valid = false;
            return;
        }
        rotatePiece.push([new_x, new_y, [piece_num, idx], color, diff[0] == 0 && diff[1] == 0])
    })
    if(!valid) return;
    for(let tile of activeTiles) gameBoard[tile[1]][tile[0]] = 0
    activeTiles = Array.from(rotatePiece)
    // document.getElementById("index").innerHTML = rotatePiece;
}

/*
DEBUGGING CODE
*/
// generatePiece()
// displayTiles()
// for(var i = 0; i < 4; i++){
//     shiftPiece([0, -1])
//     displayTiles()
// }
// console.log(gameBoard)
// rotatePiece()
// displayTiles()
// console.log(gameBoard)


function gameLoop(){
    calculator.setExpression({
        id: 'INFO',
        latex: "(20, 15)",
        showLabel: true,
        label: 'Line Clears: ' + numLines + '\nLevel: ' + Math.floor(numLines / 10) + '\nScore: ' + score
    })
    if(gameState == 'init'){
        resetGame()
        gameState = 'generate'
    }
    else if(gameState == 'generate'){
        piece_num++;
        activeTiles = []
        var reset = generatePiece()
        gameState = reset ? 'init' : 'Falling'
        displayTiles()
    }
    else if(gameState == 'Falling'){
        if(checkForCollision()){
            gameState = 'generate'
            score += (Math.floor(numLines / 10)+1) * lineClearScore[checkForLineClear()]
        }
        dropInterval = (dropInterval + 1) % (50 - Math.min(5 * Math.floor(numLines / 10), 48))
        if(dropInterval == 0){
            shiftPiece([0, -1])
            displayTiles()
        }
    }
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 40){
        event.preventDefault();
        shiftPiece([0, -1])
        displayTiles()
    }
    if(event.keyCode == 37){
        event.preventDefault();
        shiftPiece([-1, 0])
        displayTiles()
    }
    if(event.keyCode == 39){
        event.preventDefault();
        shiftPiece([1, 0])
        displayTiles()
    }
    if(event.keyCode == 38){
        event.preventDefault();
        rotatePiece()
        displayTiles()
    }
});

document.addEventListener('DOMContentLoaded', function(){
    gameLoop();
})
