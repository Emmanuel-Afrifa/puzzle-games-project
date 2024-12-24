// Global variables 
let CANVAS = null; // Initializing the Canvas element
let CONTEXT = null; // Initializing the context
let SCALER =  0.4; 
let SIZE = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    row: 8,
    col: 8}
let PIECES = [];
PIECE_SELECTED = null;
let TOP_PLANE = null;
let BOTTOM_PLANE = null;
let LEFT_PLANE = null;
let RIGHT_PLANE = null;
const PIECE_OFFSET = 20;
let START_TIME = null;
let END_TIME = null;


const img = new Image();
img.setAttribute('crossOrigin', 'anonymous')
img.src = "./pic.jpg";


window.addEventListener('load', onload);

function onload(){

    END_TIME = null;
    START_TIME = null;

    const gameDifficulty = document.getElementById('game-difficulty');
    gameDifficulty.value = 'very-easy'
    gamePlayDifficulty(gameDifficulty.value);


    startGame();
}

function startGame(){
    const canvasDisplay = document.getElementById('rootCanvas')
    canvasDisplay.style.display = 'none';

    // Hiding the start Page
    const startDisplay = document.getElementById('main-container');
    startDisplay.style.display = 'flex';

    // Hiding the end page
    const endPageDisplay = document.getElementById('end-game-page');
    endPageDisplay.style.display = 'none';

    const gameDifficulty = document.getElementById('game-difficulty');
    // set game play level 
    gameDifficulty.addEventListener('click', (event) => {
        const selectedLevel = gameDifficulty[gameDifficulty.selectedIndex].value;
        gamePlayDifficulty(gameDifficulty.value);
    })

    const startButton = document.getElementById('start-game-button');
    startButton.addEventListener('click', gamePlay);
}

function gamePlay(){
    START_TIME = new Date().getTime()
    CANVAS = document.getElementById("rootCanvas");
    CONTEXT = CANVAS.getContext('2d');

    // Showing the Game itself
    const canvasDisplay = document.getElementById('rootCanvas')
    canvasDisplay.style.display = 'block';

    // Hiding the start Page
    const startDisplay = document.getElementById('main-container');
    startDisplay.style.display = 'none';

    // Hiding the end page
    const endPageDisplay = document.getElementById('end-game-page');
    endPageDisplay.style.display = 'none';

    pieceMovements();
    resizeHandler();
    // Preserving aspect ratio of the image
    initializePieces(SIZE.row, SIZE.col);
    window.addEventListener('resize', resizeHandler);
    randomizePieces();
    updateCanvas();

}

function gamePlayDifficulty(level){
    switch(level){
        case 'very-easy':
            SIZE.row = 2;
            SIZE.col = 2;
            break;
        case 'easy': 
            SIZE.row = 3;
            SIZE.col = 3;
            break;
        case 'regular': 
            SIZE.row = 4;
            SIZE.col = 4;
            break;
        case 'intermediate': 
            SIZE.row = 5;
            SIZE.col = 5;
            break;
        case 'hard': 
            SIZE.row = 6;
            SIZE.col = 6;
            break;
        case 'very-hard': 
            SIZE.row = 7;
            SIZE.col = 7;
            break;
        case 'legend': 
            SIZE.row = 8;
            SIZE.col = 8;
            break;
    }
}

function resizeHandler(){
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    if (CANVAS.width <= 450){
        SCALER = 0.4;
    }

    let resize = SCALER*Math.min(
        window.innerWidth/img.width, 
        window.innerHeight/img.height);

    SIZE.width = resize*img.width;
    SIZE.height = resize*img.height;

    SIZE.y = window.innerHeight/2 - SIZE.height/2;
    SIZE.x = window.innerWidth/2 - SIZE.width/2;
    
}

function updateCanvas(){
    CONTEXT.clearRect(0,0, CANVAS.width, CANVAS.height);

    CONTEXT.globalAlpha = 0.3;
    CONTEXT.drawImage(img, SIZE.x, SIZE.y, SIZE.width, SIZE.height);

    // initializePieces(SIZE.row, SIZE.col); // This initializes the pieces array to enable use draw on the individual pieces

    CONTEXT.globalAlpha = 1;
    
    // randomizePieces(); // This function ensures the pieces are randomly scattered on the screen
    for (let i = 0; i<PIECES.length; i++){
        PIECES[i].draw(CONTEXT);
    }
}

// // Initializing the pieces array
function initializePieces(row, col){
    SIZE.row = row;
    SIZE.col = col;

    PIECES = [];
    for (let i = 0; i<row;i++){
        for (let j=0; j<col; j++){
            PIECES.push(new Piece(i,j));
        }
    }

    let count = 0;
    for (let i = 0; i < SIZE.row; i++){
        for (let j = 0; j < SIZE.col; j++){
            const selectedPiece = PIECES[count];

            // Making the bottom tabs randomly with the exception of the 
            // last row
            if (i == SIZE.row - 1){
                selectedPiece.bottom = null;
            }
            else {
                const innerOuterTab = (Math.random() - 0.5) < 0 ? -1 : 1;
                selectedPiece.bottom = innerOuterTab*(Math.random()*0.4+0.3);
            }

            // Maing the right tabs randomly with the exception of the 
            // rightmots pieces
            if (j == SIZE.col - 1){
                selectedPiece.right = null;
            }
            else {
                const innerOuterTab = (Math.random() - 0.5) < 0 ? -1 : 1;
                selectedPiece.right = innerOuterTab*(Math.random()*0.4+0.3);
            }

            // Setting the top pieces tabs to be the opposite of the bottom tabs
            // of the piece directly above them
            if (i == 0){
                selectedPiece.top = null;
            }
            else {
                selectedPiece.top = -PIECES[count - SIZE.col].bottom;
            }

            // Setting the left tab in a similar way
            if (j == 0){
                selectedPiece.left = null;
            }
            else {
                selectedPiece.left = -PIECES[count - 1].right;
            }


            count++;
        }
    }

}

function randomizePieces(){
    // CONTEXT.clearRect(0,0, CANVAS.width, CANVAS.height);

    let allPieces = null;

    const pieceWidth = SIZE.width/SIZE.col;
    const pieceHeight = SIZE.height/SIZE.row;
    
    let leftStartPos = SIZE.x - PIECE_OFFSET - pieceWidth;
    let rightStartPos = SIZE.x + SIZE.width + PIECE_OFFSET;
    let topStartPos = SIZE.y - PIECE_OFFSET - pieceHeight;
    let bottomStartPos = SIZE.y + SIZE.height + PIECE_OFFSET;

    let topStartX = CANVAS.width - CANVAS.width*0.9;
    let topStartY = SIZE.y;
    const totalPieces = SIZE.row * SIZE.col;

    const topBottomWidth = (CANVAS.width - 2*topStartX);
    const leftRightWidth = SIZE.height;

    // numPiecesTop = Math.floor((rightStartPos - leftStartPos + pieceWidth)/pieceWidth);
    const tabOffset = 0.15*Math.min(PIECES[0].height, PIECES[0].width);

    numPiecesTop = Math.floor( CANVAS.width*0.9 /(pieceWidth + tabOffset + 5));
    numPiecesLeft = Math.floor( leftRightWidth / (pieceHeight + tabOffset + 5));

    // let offsetX = (topBottomWidth - numPiecesTop*pieceWidth)/(numPiecesTop-1);
    // let offsetY = (leftRightWidth - numPiecesLeft*pieceHeight) / (numPiecesLeft - 1);

    // Building the top array
    allPieces = [];
    // const topPieces = [[topStartX, topStartPos]];
    for (let i=0; i<numPiecesTop; i++){
        const newCoor = topStartX + i*(pieceWidth + tabOffset + 5);
        allPieces.push([newCoor, topStartPos])
    }

    // Building the bottom array
    for (let i=0; i<numPiecesTop; i++){
        if (allPieces.length < SIZE.row * SIZE.col){
            const newCoor = topStartX + i*(pieceWidth + tabOffset + 5);
            allPieces.push([newCoor, bottomStartPos]);
        }
    }

    // Building the left array
    for (let i = 0; i<numPiecesLeft; i++){
        if (allPieces.length < SIZE.row * SIZE.col){
            const yCoord = topStartY + i*(pieceHeight + tabOffset + 5);
            allPieces.push([leftStartPos, yCoord]);
        }
    }

    // Building the Right array
    for (let i = 0; i<numPiecesLeft; i++){
        if (allPieces.length < SIZE.row * SIZE.col){
            const yCoord = topStartY + i*(pieceHeight + tabOffset + 5);
            allPieces.push([rightStartPos, yCoord]);
        }
    }

    if (allPieces.length < totalPieces){
        const remainingPieces = totalPieces - allPieces.length;
        let leftOverPiecesIndex = 0;
        let secondLayerIndex = 0;
        while (leftOverPiecesIndex < remainingPieces){
            let coords = null;
            if (leftOverPiecesIndex >= 2*numPiecesLeft){
                coords = xOffset(
                    secondLayerIndex,
                    topStartY,
                    pieceHeight,
                    leftStartPos - 2*(tabOffset + 5) - 2*pieceWidth,
                    rightStartPos + 2*(tabOffset + 5) + 2*pieceWidth,
                    (tabOffset + 5)
                )
                secondLayerIndex += 1;
            }
            else {
                coords = xOffset(
                    leftOverPiecesIndex,
                    topStartY,
                    pieceHeight,
                    leftStartPos - (tabOffset + 5) - pieceWidth,
                    rightStartPos + (tabOffset + 5) + pieceWidth,
                    (tabOffset + 5)
                )
            }
            allPieces.push(coords);
            leftOverPiecesIndex += 1;
        }
    }
    

    // console.log(allPieces.length, totalPieces)

    let count = 0
    for (let i=0; i<PIECES.length; i++){
        count += 1;
        let ind = Math.floor(Math.random() * allPieces.length);
        rm_piece = allPieces.splice(ind, 1)[0]

        let loc = {
                // x: Math.random()*(CANVAS.width - PIECES[i].width),
                // y: Math.random()*(CANVAS.height - PIECES[i].height)
                x: rm_piece[0],
                y: rm_piece[1]
            }

        PIECES[i].x = loc.x;
        PIECES[i].y = loc.y;
        PIECES[i].correct = false;
    }
}

function xOffset(leftOverPiecesIndex, topStartY, pieceHeight, leftOffset, rightOffset, verticalOffset){
    const isLeft = leftOverPiecesIndex % 2 == 0;
    const xCoord = isLeft ? leftOffset : rightOffset;
    const yCoord = topStartY + Math.floor(leftOverPiecesIndex / 2)*(pieceHeight + verticalOffset);
    return [xCoord, yCoord]

}

function pieceMovements(){
    CANVAS.addEventListener('mousedown', mouseDownEvent);
    CANVAS.addEventListener('mousemove', mouseMoveEvent);
    CANVAS.addEventListener('mouseup', mouseUpEvent);
    CANVAS.addEventListener('touchstart', touchStartEvent);
    CANVAS.addEventListener('touchmove', touchMoveEvent);
    CANVAS.addEventListener('touchend', touchEndEvent);
}

function mouseDownEvent(event){
    PIECE_SELECTED = getPressedPiece(event);
    if (PIECE_SELECTED != null && !PIECE_SELECTED.inPlace){
        const pieceIndex = PIECES.indexOf(PIECE_SELECTED);
        if (pieceIndex > -1){
            PIECES.splice(pieceIndex, 1);
            PIECES.push(PIECE_SELECTED);
        }
        PIECE_SELECTED.offset = {
            x: event.x - PIECE_SELECTED.x,
            y: event.y - PIECE_SELECTED.y
        }
    }
}

function mouseMoveEvent(event){
    if (PIECE_SELECTED != null && !PIECE_SELECTED.inPlace){
        PIECE_SELECTED.x = event.x - PIECE_SELECTED.offset.x;
        PIECE_SELECTED.y = event.y - PIECE_SELECTED.offset.y;
    }
    updateCanvas();
}

function mouseUpEvent(){
    if (PIECE_SELECTED != null){
        if (PIECE_SELECTED.isClose()){
            PIECE_SELECTED.snapInPlace();
            if (gameComplete(PIECE_SELECTED) && END_TIME == null){
                END_TIME = new Date().getTime();
                gameOver();
            }
        }
    }
    updateCanvas();
    PIECE_SELECTED = null;
}

function touchStartEvent(event){
    let loc={x: event.touches[0].clientX, y: event.touches[0].clientY};
    mouseDownEvent(loc);
}

function touchMoveEvent(event){
    let loc={x: event.touches[0].clientX, y: event.touches[0].clientY};
    mouseMoveEvent(loc);
}

function touchEndEvent(){
    mouseUpEvent();
}


function getPressedPiece(location){
    // console.log(location.x)
    for (let i = PIECES.length-1; i>=0; i--){
        if ((location.x > PIECES[i].x && location.x < PIECES[i].x + PIECES[i].width) &&
            (location.y > PIECES[i].y && location.y < PIECES[i].y + PIECES[i].height)
        ){
            return PIECES[i]
        }
        
    }
    return null;
}

// Defining the game over function
function gameOver(){
    const canvasDisplay = document.getElementById('rootCanvas')
    // Hiding the Game itself
    canvasDisplay.style.display = 'none';

    // removing all the event listeners from the canvas element
    removeCanvasEventListeners();
    // resetting the game level to very-easy
    const gameDifficulty = document.getElementById('game-difficulty');
    gameDifficulty.value = 'very-easy';
    gamePlayDifficulty(gameDifficulty.value);

    const startDisplay = document.getElementById('main-container');
    // Hiding the start Page
    startDisplay.style.display = 'none';

    // displaying the time taken
    getTimeElapsed(END_TIME - START_TIME);

    const endPageDisplay = document.getElementById('end-game-page');
    // Showing the end page
    endPageDisplay.style.display = 'flex';

    const nextGameButton = document.getElementById('next-game-button');
    nextGameButton.addEventListener('click', onload);
}

function getTimeElapsed(timeInMilleSeconds){
    let seconds = Math.floor(timeInMilleSeconds/1000);
    let actSecs = Math.floor((seconds%60));
    let actMins = Math.floor((seconds % (60 * 60))/60);
    let actHrs = Math.floor((seconds % (60*60*60))/(60*60));

    let elapsedTime = 
    actHrs.toString().padStart(2, '0');
    elapsedTime += ':';
    elapsedTime += actMins.toString().padStart(2, '0');
    elapsedTime += ':';
    elapsedTime += actSecs.toString().padStart(2, '0');

    const timer = document.getElementById('time');
    timer.textContent = elapsedTime;
}

// function to remove all the event listeners from the canvas page
function removeCanvasEventListeners(){
    function pieceMovements(){
        CANVAS.removeEventListener('mousedown', mouseDownEvent);
        CANVAS.removeEventListener('mousemove', mouseMoveEvent);
        CANVAS.removeEventListener('mouseup', mouseUpEvent);
        CANVAS.removeEventListener('touchstart', touchStartEvent);
        CANVAS.removeEventListener('touchmove', touchMoveEvent);
        CANVAS.removeEventListener('touchend', touchEndEvent);
    }
}

// // Defining the pieces class
class Piece{
    constructor(rowIndex, colIndex){
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
        this.height = SIZE.height/SIZE.row;
        this.width = SIZE.width/SIZE.col;
        this.x = SIZE.x + this.width*this.colIndex;
        this.y = SIZE.y + this.height*this.rowIndex;
        this.correctX = this.x;
        this.correctY = this.y;
        this.inPlace = false;
        this.correct = true;
    }

    // Function to draw/cut pieces
    draw(context){
        context.beginPath();
        context.lineWidth = 0.01;
        // context.strokeStyle = 'red';

        const minLen = Math.min(this.width, this.height);
        const neck = 0.03*minLen;
        const tabWidth = 0.25*minLen;
        const tabHeight = 0.15*minLen;

        // context.rect(this.x, this.y, this.width, this.height);
        // from top left
        context.moveTo(this.x, this.y);
        

        // to top right
        if (this.top){
            context.lineTo(
                this.x + this.width*Math.abs(this.top) - neck, this.y);
            
            context.bezierCurveTo(
                this.x + this.width*Math.abs(this.top) - neck,
                this.y - tabHeight * Math.sign(this.top)*0.2,

                this.x + this.width *Math.abs(this.top) - tabWidth,
                this.y - tabHeight * Math.sign(this.top),

                this.x + this.width * Math.abs(this.top),
                this.y - tabHeight*Math.sign(this.top)
            );

            context.bezierCurveTo(
                this.x + this.width *Math.abs(this.top) + tabWidth,
                this.y - tabHeight * Math.sign(this.top),

                this.x + this.width*Math.abs(this.top) + neck,
                this.y - tabHeight * Math.sign(this.top)*0.2,

                this.x + this.width*Math.abs(this.top) + neck, 
                this.y
            )
            
            // context.lineTo(
            //     this.x + this.width * Math.abs(this.top),
            //     this.y - tabHeight*Math.sign(this.top)
            // );
            // context.lineTo(
            //     this.x + this.width*Math.abs(this.top) + neck, this.y);
        }
        context.lineTo(this.x + this.width, this.y);
        
        // to bottom right
        if (this.right){
            context.lineTo(
                this.x+this.width, this.y+this.height*Math.abs(this.right) - neck);

            context.bezierCurveTo(
                this.x + this.width - tabHeight*Math.sign(this.right)*0.2,
                this.y + this.height * Math.abs(this.right) - neck,

                this.x + this.width - tabHeight * Math.sign(this.right),
                this.y + this.height*Math.abs(this.right) - tabWidth,

                this.x + this.width - tabHeight * Math.sign(this.right),
                this.y + this.height * Math.abs(this.right)
            );

            context.bezierCurveTo(
                this.x + this.width - tabHeight*Math.sign(this.right),
                this.y + this.height * Math.abs(this.right) + tabWidth,

                this.x + this.width - tabHeight * Math.sign(this.right)*0.2,
                this.y + this.height * Math.abs(this.right) + neck,

                this.x + this.width,
                this.y + this.height*Math.abs(this.right) + neck
            );

            // context.lineTo(
            //     this.x+this.width - tabHeight*Math.sign(this.right),
            //     this.y + this.height*Math.abs(this.right)
            // );
            context.lineTo(
                this.x+this.width, this.y+this.height*Math.abs(this.right) + neck);
        }
        context.lineTo(this.x + this.width, this.y + this.height);

        // to bottom left
        if (this.bottom){
            context.lineTo(
                this.x + this.width*Math.abs(this.bottom) + neck, this.y + this.height);

            context.bezierCurveTo(
                this.x + this.width*Math.abs(this.bottom) + neck,
                this.y + this.height + tabHeight * Math.sign(this.bottom)*0.2,

                this.x + this.width*Math.abs(this.bottom) + tabWidth,
                this.y + this.height + tabHeight*Math.sign(this.bottom),

                this.x + this.width*Math.abs(this.bottom),
                this.y + this.height + tabHeight*Math.sign(this.bottom)
            );

            context.bezierCurveTo(
                this.x + this.width * Math.abs(this.bottom) - tabWidth,
                this.y + this.height + tabHeight*Math.sign(this.bottom),

                this.x + this.width * Math.abs(this.bottom) - neck,
                this.y + this.height + tabHeight*Math.sign(this.bottom)*0.2,

                this.x + this.width*Math.abs(this.bottom) - neck,
                this.y + this.height
            )

            // context.lineTo(
            //     this.x + this.width*Math.abs(this.bottom),
            //     this.y + this.height + tabHeight*Math.sign(this.bottom)
            // );
            // context.lineTo(
            //     this.x + this.width*Math.abs(this.bottom) - neck, this.y + this.height);
        }
        context.lineTo(this.x, this.y + this.height);

        // to top left
        if (this.left){
            context.lineTo(this.x, this.y+this.height*Math.abs(this.left) + neck);

            context.bezierCurveTo(
                this.x + tabHeight * Math.sign(this.left)*0.2,
                this.y + this.height * Math.abs(this.left) + neck,

                this.x + tabHeight*Math.sign(this.left),
                this.y + this.height * Math.abs (this.left) + tabWidth,

                this.x + tabHeight*Math.sign(this.left),
                this.y + this.height * Math.abs(this.left)
            );

            context.bezierCurveTo(
                this.x + tabHeight * Math.sign(this.left),
                this.y + this.height * Math.abs(this.left) - tabWidth,

                this.x + tabHeight*Math.sign(this.left)*0.2,
                this.y + this.height*Math.abs(this.left) - neck,

                this.x,
                this.y + this.height*Math.abs(this.left) - neck
            )

            // context.lineTo(
            //     this.x + tabHeight*Math.sign(this.left),
            //     this.y + this.height*Math.abs(this.left)
            // );
            // context.lineTo(this.x, this.y+this.height*Math.abs(this.left) - neck);
        }
        context.lineTo(this.x, this.y);

        context.save();
        context.clip();

        const scaledTabHeight = Math.min(img.width/SIZE.col, img.height/SIZE.row)*tabHeight/minLen;

        context.drawImage(img,
            this.colIndex*img.width/SIZE.col - scaledTabHeight,
            this.rowIndex*img.height/SIZE.row - scaledTabHeight,
            img.width/SIZE.col + scaledTabHeight*2,
            img.height/SIZE.row + scaledTabHeight*2,
            this.x - tabHeight,
            this.y - tabHeight,
            this.width + 2*tabHeight,
            this.height + 2*tabHeight
        );

        context.restore();

        context.stroke();
    }

    // Implementing the function that snaps the piece to its correct place if it's close enough
    isClose(){
        if (distance({
            x: this.x, y: this.y
        }, {x: this.correctX, y: this.correctY}) < this.width/3 )
        {
            return true;
        }
        return false;
    }

    // Snapping the pie to its correct position when it's near it.
    snapInPlace(){
        this.x = this.correctX;
        this.y = this.correctY;
        this.inPlace = true;
        this.correct = true;
    }

}

function gameComplete(){
    for (let i=0; i<PIECES.length; i++){
        if (PIECES[i].correct == false){
            return false;
        }
    }
    return true;
}

function distance(point1, point2){
    return Math.sqrt(
        (point1.x - point2.x) * (point1.x - point2.x) + 
        (point1.y - point2.y) * (point1.y - point2.y)
    );
}