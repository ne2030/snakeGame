const { find, reduce, curry, match } = require('fxjs2');
const { setIdxs, setIdx, compareArr } = require('./fp');
const reverseLinkedList = require('./reverseLinkedList');

const add = curry((a, b) => a + b);
const isEqual = curry((a, b) => a == b);

// 1칸 25px

const initData = {
    width: 500,
    height: 500,
    unit: 25,
    basicSize: 2,
};

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const state = {
    score: 0,
    field: [],
    totalSize: 0,
    head: [0, 0],
    direction: 'down',
    snake: reverseLinkedList(compareArr),
};

// ctx.fillRect(25, 25, 100, 100);
// ctx.clearRect(45, 45, 60, 60);
// ctx.strokeRect(50, 50, 50, 50);

const getRandomDot = () => {
    const marginArea = state.totalSize - state.score - initData.basicSize;
    const randomDot = Math.ceil(Math.random() * marginArea);

    let x = 0;
    let y = 0;
    let count = 0;

    for (const row of state.field) {
        for (const i of row) {
            if (i == 0) {
                count += 1;
                if (count == randomDot) break;
            }
            x += 1;
        }
        if (count == randomDot) break;
        y += 1;
        x = 0;
    }

    return [x, y];
};

const moveDotDirection = (xi, yi, dir) => match(dir)
    .case(isEqual('left'))(() => [xi - 1, yi])
    .case(isEqual('right'))(() => [xi + 1, yi])
    .case(isEqual('down'))(() => [xi, yi + 1])
    .case(isEqual('up'))(() => [xi, yi - 1])
    .else(() => [xi, yi]);

const changeDirection = (dir) => {

};

const drawDot = (xi, yi) => {
    state.field = setIdx(yi, (row => setIdx(xi, 1, row)), state.field);
    ctx.fillRect(xi * 25, yi * 25, 25, 25);
};

const drawRow = (xi, yi, n) => {
    state.field = setIdx(yi, (row => setIdxs(xi, xi + n - 1, 1, row)), state.field);
    ctx.fillRect(xi * 25, yi * 25, n * 25, 25);
};

// const drawBlock = (xi, yi, xi2 = xi + 1, yi2 = yi + 1) => {
//     const fillRow = row => setIdxs(xi, xi2 - 1, 1, row);
//     setIdxs();

//     ctx.fillRect(xi * 25, yi * 25, (xi2 - xi) * 25, (yi2 - yi) * 25);
// };

const deleteDot = (xi, yi) => {
    ctx.clearRect(xi * 25, yi * 25, 25, 25);
    state.field = setIdx(yi, (row => setIdx(xi, 0, row)), state.field);
};

const drawFoodBox = () => drawDot(...getRandomDot());
const moveSnake = () => {
    const { head, tail } = state.snake;
    const [xi, yi] = moveDotDirection(...head.value, state.direction);

    drawDot(xi, yi);
    state.snake.append([xi, yi]);


    // console.log(state.snake.head);
    // console.log(state.snake.tail);


    state.snake.deleteTail();
    deleteDot(...tail.value);


    setTimeout(moveSnake, 1000);
};

(function init({ width, height, unit }) {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    ctx.canvas.classList.add('canvas');

    const createRow = () => Array(width / unit).fill(0);
    const field = Array(height / unit).fill(0).map(createRow);

    state.field = field;
    state.totalSize = (width * height) / (unit * unit);

    const centerY = Math.floor(height / unit / 2);
    const quarterX = Math.floor(width / unit / 4);

    drawRow(quarterX - 1, centerY, 2);
    state.snake.append([quarterX - 1, centerY]);
    state.snake.append([quarterX, centerY]);
}(initData));


drawFoodBox();

setTimeout(moveSnake, 1000);
// moveSnake();
// moveSnake();


console.log(state.field);
