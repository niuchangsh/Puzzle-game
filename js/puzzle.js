/**** define variables ****/
let background = document.getElementById("background");
let context = background.getContext('2d');
let bg_Width = 500; // width of background
let padding = 10; // interval of images
let column = 3; 
let imageWidth = (bg_Width - (padding * (column + 1))) / column; 
let imageIndexForPosition = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // imageIndexForPosition[i] means the index of image(0-8) in i position
let lastIndex = 8;    // the last index of images is 8
let isFinish = false; // whether the game has been finished


/**** define functions ****/
/* the area of image in a position */
const rectForPosition = function(position) {  // position parameter is the position of a image
    if (position < 0 || position > lastIndex) {   // input is illegal
        return [0, 0, 0, 0];
    }
    let x = (position % column) * (padding + imageWidth) + padding;    // coordinates of a image (top left point)
    let y = parseInt(position / column) * (padding + imageWidth) + padding;
    return [x, y, imageWidth, imageWidth];  // imageWidth = imageHeight
}


/* draw a image */
const drawImageItem = function(index, position) {          
    let img = new Image();
    img.src = './images/starrysky_0' + String(index+1) + '.gif';   // String(index+1) is used to change the index to string
    img.onload = function() {
        let rect = rectForPosition(position);
        context.drawImage(img, rect[0], rect[1], rect[2], rect[3]);
    }
}


/* update informations of the image after changing its positon */
const refreshImagePositions = function(origin, target) {     // the original/next position of the image
    let originRect = rectForPosition(origin);
    context.clearRect(originRect[0], originRect[1], originRect[2], originRect[3]);
    drawImageItem(imageIndexForPosition[target], target);
}


/* get left/right/top/bottom neighbor of the present position ***/
const leftOfPosition = function(position) {
    return (position % column) === 0 ? -1 : position - 1;    // return -1 if the present position doesn't have a left/right/top/bottom neighbor
}
const rightOfPosition = function(position) {
    return (position % column) === (column - 1) ? -1 : position + 1;
}
const topOfPosition = function(position) {
    return position - column;
}
const bottomOfPosition = function(position) {
    return position + column;
}


/* check whether a position is empty */
const isPositionEmpty = function(position) {
    if (position < 0 || position > lastIndex) {
        return false;
    } 
    if (imageIndexForPosition[position] === lastIndex) {   // position of the last image is empty
        return true;
    } else {
        return false;
    }
}


/* move a image if can */
const moveImageIfCanAtPosition = function(position) {
    let top = topOfPosition(position);
    let left = leftOfPosition(position);
    let bottom = bottomOfPosition(position);
    let right = rightOfPosition(position);
    let targetPositioin = -1; 
    
    if (isPositionEmpty(top)) {
        targetPositioin = top;
    } else if (isPositionEmpty(left)) {
        targetPositioin = left;
    } else if (isPositionEmpty(bottom)) {
        targetPositioin = bottom;
    } else if (isPositionEmpty(right)) {
        targetPositioin = right;
    }

    // move to the empty position 
    if (targetPositioin >= 0) {
        imageIndexForPosition[targetPositioin] = imageIndexForPosition[position];
        imageIndexForPosition[position] = lastIndex;
        background.emptyPosition = position; // 更新空位的位置
        return targetPositioin;
    }
    else{
        return -1;
    }
}


/* initialize the positions of images */
const setupRandomPosition = function() {
    let list1 = [4, 3, 2, 8, 0, 7, 5, 6, 1];
    let list2 = [2, 0, 5, 6, 8, 7, 3, 1, 4];
    let list3 = [3, 7, 2, 4, 1, 6, 8, 0, 5];
    let list4 = [3, 2, 4, 1, 7, 6, 5, 0, 8];
    let lists = [list1, list2, list3, list4];

    // select one of four lists randomly
    imageIndexForPosition = lists[parseInt(Math.random() * 4)];

    // get the empty position
    let emptyPosition = 0;
    for (let i = imageIndexForPosition.length - 1; i >= 0; i--) {
        if (imageIndexForPosition[i] === lastIndex) {
            emptyPosition = i;
            break;
        }
    }

    // the empty position will move randomly in 10 times
    let times = 10;
    while (times--) {
        // select which direction the empty position will move to randomly
        let direction = parseInt(Math.random() * 4);

        let target = -1;
        if (direction === 0) {
            target = topOfPosition(emptyPosition);
        } else if (direction === 1) {
            target = leftOfPosition(emptyPosition); 
        } else if (direction === 2) {
            target = rightOfPosition(emptyPosition); 
        } else if (direction === 3) {
            target = bottomOfPosition(emptyPosition); 
        }
        if (target < 0 || target > lastIndex) {  // target position is illegal
            continue;
        }
        let result = moveImageIfCanAtPosition(target);
        if (result >= 0) { // update the empty position if move successfully
            emptyPosition = target;
        }
    }

    background.emptyPosition = emptyPosition;
}


/* draw all images */
const drawAllImage = function() {
    for (let position = 0; position < column * column; position++) {
        let index = imageIndexForPosition[position];
        if (index === lastIndex) { // the last image(index is 8) will not be drawn
            continue;
        }
        drawImageItem(index, position);
    }
}


/* initial onload */
window.onload = function() {
    setupRandomPosition();
    drawAllImage();
}


/* check whether the game is finished */
const checkIfFinish = function() {
    for (let index = 0; index < imageIndexForPosition.length; index++) {
        if (index != imageIndexForPosition[index]) {
            return false;
        }
    }
    return true;
}


/* click a image to change its position */
background.onclick = function(e) {
    if (isFinish) {     // check whether the game has been finished
        return;
    }
    let x = parseInt(e.offsetX / (padding + imageWidth));
    let y = parseInt(e.offsetY / (padding + imageWidth));
    let position = y * column + x;
    let target = moveImageIfCanAtPosition(position);
    if (target >= 0) {
        refreshImagePositions(position, target);
    }
    if (checkIfFinish()) {
        drawImageItem(imageIndexForPosition[lastIndex], lastIndex);
        window.alert("Bingo!");
        isFinish = true;
    }
};
