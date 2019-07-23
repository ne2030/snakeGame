const { some, every, reject, find, map, each, go, range, curry, match } = require('fxjs2');
const { setIdxs, setIdx, compareArr, getMatItem } = require('./fp');
const reverseLinkedList = require('./reverseLinkedList');

/*
* Utils
*/

const add = curry((a, b) => a + b);
const isEqual = curry((a, b) => a == b);
const and = (...fs) => arg => every(f => f(arg), fs);

// 1칸 25px

/*
* Constants
*/

const initData = {
    width: 20,
    height: 20,
    unit: 25,
    basicSize: 2,
};

const arrowCodes = [
    { dir: 'left', code: 37, type: 'hori' },
    { dir: 'up', code: 38, type: 'vert' },
    { dir: 'right', code: 39, type: 'hori' },
    { dir: 'down', code: 40, type: 'vert' },
];

/*
* States
*/

const canvas = document.getElementById('board');
const startBtn = document.getElementById('start');
const ctx = canvas.getContext('2d');

const state = {
    score: 0,
    field: [],
    totalSize: 0,
    head: [0, 0],
    direction: 'right',
    snake: null,
    timeCanceler: null,
    speed: 100,
    foods: [],
    status: 'off',
};

/*
* Functions
*/

const end = () => {
    state.timeCanceler();
    startBtn.classList.remove('hidden');

    state.status = 'off';
};

const initGame = (width, height, unit) => {
    const createRow = () => Array(width).fill(0);
    const field = Array(height).fill(0).map(createRow);

    state.direction = 'right';
    state.field = field;
    state.snake = reverseLinkedList(compareArr);

    ctx.clearRect(0, 0, width * unit, height * unit);

    state.status = 'on';
};

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

const drawInterval = (interval, f) => {
    let start;
    let stop = false;

    const loop = (timestamp) => {
        if (!start) {
            start = timestamp;
            f();
        }
        if (timestamp - start >= interval) {
            start = timestamp;
            f();
        }
        if (stop) return;
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    return () => {
        stop = true;
    };
};

const moveDot = (xi, yi, dir) => match(dir)
    .case(isEqual('left'))(() => [xi - 1, yi])
    .case(isEqual('right'))(() => [xi + 1, yi])
    .case(isEqual('down'))(() => [xi, yi + 1])
    .case(isEqual('up'))(() => [xi, yi - 1])
    .else(() => [xi, yi]);

const drawDot = (xi, yi) => {
    state.field = setIdx(yi, (row => setIdx(xi, 1, row)), state.field);
    ctx.fillRect(xi * 25, yi * 25, 25, 25);
};

const drawRow = (xi, yi, n) => {
    state.field = setIdx(yi, (row => setIdxs(xi, xi + n - 1, 1, row)), state.field);
    ctx.fillRect(xi * 25, yi * 25, n * 25, 25);
};

const deleteDot = (xi, yi) => {
    ctx.clearRect(xi * 25, yi * 25, 25, 25);
    state.field = setIdx(yi, (row => setIdx(xi, 0, row)), state.field);
};

const drawFood = () => {
    const [xi, yi] = getRandomDot();
    state.foods.push([xi, yi]);
    ctx.fillStyle = 'red';
    drawDot(xi, yi);
    ctx.fillStyle = 'black';
};

const eatFood = (xi, yi) => {
    drawDot(xi, yi);
    state.foods = reject(compareArr([xi, yi]), state.food);
    state.score += 1;

    drawFood();
};

const isFood = (xi, yi) => some(compareArr([xi, yi]), state.foods);

const moveSnake = () => {
    const { head, tail } = state.snake;
    const [xi, yi] = moveDot(...head.value, state.direction);

    const nextDotType = match(getMatItem([xi, yi], state.field))
        .case(undefined)(() => 'block')
        .case(0)(() => 'empty')
        .case(() => isFood(xi, yi))(() => 'food')
        .else(() => 'block');

    if (nextDotType === 'block') return end();

    if (nextDotType === 'food') {
        eatFood(xi, yi);
    }

    if (nextDotType === 'empty') {
        drawDot(xi, yi);

        state.snake.deleteTail();
        deleteDot(...tail.value);
    }

    state.snake.append([xi, yi]);
};

const changeDirection = (dir) => {
    state.direction = dir;
    state.timeCanceler();
    state.timeCanceler = drawInterval(state.speed, moveSnake);
};

const start = ({ width, height, basicSize, unit }) => {
    initGame(width, height, unit);

    const centerY = Math.floor(height / 2);
    const startX = Math.floor(width / 5);

    drawRow(startX, centerY, basicSize);

    go(
        range(basicSize),
        map(offsetX => [startX + offsetX, centerY]),
        each(state.snake.append),
    );

    drawFood();

    state.timeCanceler = drawInterval(state.speed, moveSnake);
    canvas.focus();

    startBtn.classList.add('hidden');
};


(function init({ width, height, unit }) {
    ctx.canvas.width = width * unit;
    ctx.canvas.height = height * unit;
    ctx.canvas.classList.add('canvas');

    canvas.addEventListener('keydown', (e) => {
        if (state.status === 'off') return;

        const newArrow = find(arrow => arrow.code === e.keyCode, arrowCodes);
        const prevArrow = find(arrow => arrow.dir === state.direction, arrowCodes);

        if (!newArrow) return;
        if (prevArrow.type !== newArrow.type) changeDirection(newArrow.dir);
    });

    const createRow = () => Array(width).fill(0);
    const field = Array(height).fill(0).map(createRow);

    state.field = field;
    state.totalSize = (width * height);


    startBtn.onclick = () => start(initData);
}(initData));
