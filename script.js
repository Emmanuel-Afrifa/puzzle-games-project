// Global variables 
let CANVAS = null; // Initializing the Canvas element
let CONTEXT = null; // Initializing the context
let SCALER =  0.5; 
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



const img = new Image();
img.setAttribute('crossOrigin', 'anonymous')
img.src = "./pic.jpg";


window.addEventListener('load', onload);

function onload(){
    CANVAS = document.getElementById("rootCanvas");
    CONTEXT = CANVAS.getContext('2d');
    // CONTEXT.shadowOffsetY = 20;
    // CONTEXT.shadowOffsetX = 20;
    // CONTEXT.shadowBlur = 1;
    // CONTEXT.shadowColor = "black"
    // CONTEXT.textAlign = 'center';
    // CONTEXT.fillStyle = "white";

    pieceMovements();

    resizeHandler();
    // Preserving aspect ratio of the image
    initializePieces(SIZE.row, SIZE.col);
    window.addEventListener('resize', resizeHandler);
    randomizePieces();
    updateCanvas();
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
    console.log(CANVAS.width/pieceWidth)

    const topBottomWidth = (CANVAS.width - 2*topStartX);
    console.log(pieceWidth, CANVAS.width, totalPieces)
    const leftRightWidth = SIZE.height;

    // numPiecesTop = Math.floor((rightStartPos - leftStartPos + pieceWidth)/pieceWidth);
    numPiecesTop = Math.floor(topBottomWidth/(pieceWidth + 5));
    numPiecesLeft = Math.floor( leftRightWidth / (pieceHeight + 5) );
    
    console.log(numPiecesLeft)


    // let offsetX = (topBottomWidth - numPiecesTop*pieceWidth)/(numPiecesTop-1);
    // let offsetY = (leftRightWidth - numPiecesLeft*pieceHeight) / (numPiecesLeft - 1);

    // Building the top array
    allPieces = [];
    // const topPieces = [[topStartX, topStartPos]];

    for (let i=0; i<numPiecesTop; i++){
        const newCoor = topStartX + i*(pieceWidth + 5);
        allPieces.push([newCoor, topStartPos])
    }

    // Building the bottom array
    for (let i=0; i<numPiecesTop; i++){
        if (allPieces.length < SIZE.row * SIZE.col){
            const newCoor = topStartX + 12 + i*(pieceWidth + 5);
            allPieces.push([newCoor, bottomStartPos]);
        }
    }

    // Building the left array
    for (let i = 0; i<numPiecesLeft; i++){
        if (allPieces.length < SIZE.row * SIZE.col){
            const yCoord = topStartY + i*(pieceHeight + 5);
            allPieces.push([leftStartPos, yCoord]);
        }
    }

    // Building the Right array
    for (let i = 0; i<numPiecesLeft; i++){
        if (allPieces.length < SIZE.row * SIZE.col){
            const yCoord = topStartY + i*(pieceHeight + 5);
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
                    leftStartPos - 2*8 - 2*pieceWidth,
                    rightStartPos + 2*8 + 2*pieceWidth,
                )
                secondLayerIndex += 1;
            }
            else {
                coords = xOffset(
                    leftOverPiecesIndex,
                    topStartY,
                    pieceHeight,
                    leftStartPos - 10 - pieceWidth,
                    rightStartPos + 10 + pieceWidth,
                )
            }
            allPieces.push(coords);
            leftOverPiecesIndex += 1;
        }
    }
    

    console.log(allPieces.length, totalPieces)

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
    }
}

function xOffset(leftOverPiecesIndex, topStartY, pieceHeight, leftOffset, rightOffset){
    const isLeft = leftOverPiecesIndex % 2 == 0;
    const xCoord = isLeft ? leftOffset : rightOffset;
    const yCoord = topStartY + Math.floor(leftOverPiecesIndex / 2)*(pieceHeight + 5);
    console.log(yCoord)
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
    if (PIECE_SELECTED != null){
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
    if (PIECE_SELECTED != null){
        PIECE_SELECTED.x = event.x - PIECE_SELECTED.offset.x;
        PIECE_SELECTED.y = event.y - PIECE_SELECTED.offset.y;
    }
    updateCanvas();
}

function mouseUpEvent(){
    if (PIECE_SELECTED != null){
        if (PIECE_SELECTED.isClose()){
            PIECE_SELECTED.snapInPlace();
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
    }

    // Function to draw/cut pieces
    draw(context){
        context.beginPath();

        context.drawImage(img,
            this.colIndex*img.width/SIZE.col,
            this.rowIndex*img.height/SIZE.row,
            img.width/SIZE.col,
            img.height/SIZE.row,
            this.x,
            this.y,
            this.width,
            this.height
        );

        context.rect(this.x, this.y, this.width, this.height);
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
    snapInPlace(){
        this.x = this.correctX;
        this.y = this.correctY;
    }

}

function distance(point1, point2){
    return Math.sqrt(
        (point1.x - point2.x) * (point1.x - point2.x) + 
        (point1.y - point2.y) * (point1.y - point2.y)
    );
}