import { reduce, some, every, reject, find, map, each, go, range, curry, match } from 'fxjs2';
import { setIdx, compareArr, getMatItem } from './fp';
import reverseLinkedList from './reverseLinkedList';

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
const globalContext = canvas.getContext('2d');

const state = {
    score: 0,
    field: [],
    totalSize: 0,
    head: [0, 0],
    direction: 'right',
    snake: null,
    timeCanceler: null,
    speed: 200,
    foods: [],
    status: 'off',
};

/*
* Functions
*/

const updateBtn = (el, disable) => {
    el.disabled = disable;
    return disable ? el.classList.add('disabled') : el.classList.remove('disabled');
};

const end = () => {
    state.timeCanceler();
    startBtn.classList.remove('hidden');

    state.status = 'off';

    updateBtn(startBtn, false);
};

const initGame = (width, height, unit) => {
    const createRow = () => Array(width).fill(0);
    const field = Array(height).fill(0).map(createRow);

    state.direction = 'right';
    state.field = field;
    state.snake = reverseLinkedList(compareArr);

    globalContext.clearRect(0, 0, width * unit, height * unit);

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
        if (stop) return;
        if (!start || (timestamp - start >= interval)) {
            start = timestamp;
            f();
        }
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    return () => { stop = true; };
};

const moveDot = (xi, yi, dir) => match(dir)
    .case(isEqual('left'))(() => [xi - 1, yi])
    .case(isEqual('right'))(() => [xi + 1, yi])
    .case(isEqual('down'))(() => [xi, yi + 1])
    .case(isEqual('up'))(() => [xi, yi - 1])
    .else(() => [xi, yi]);

const drawDot = ([xi, yi], color) => {
    const ctx = canvas.getContext('2d');
    const reducedUnit = initData.unit - 2; // stroke 가 겹치지 않기 위해 1픽셀 줄임
    state.field = setIdx(yi, (row => setIdx(xi, 1, row)), state.field);
    ctx.strokeRect(xi * 25 + 1, yi * 25 + 1, reducedUnit, reducedUnit);
    ctx.fillStyle = color;
    ctx.fillRect(xi * 25 + 1, yi * 25 + 1, reducedUnit, reducedUnit);
};

const deleteDot = ([xi, yi]) => {
    globalContext.clearRect(xi * 25, yi * 25, 25, 25);
    state.field = setIdx(yi, (row => setIdx(xi, 0, row)), state.field);
};

const drawFood = () => {
    const ctx = canvas.getContext('2d');
    const dot = getRandomDot();
    state.foods.push(dot);

    ctx.fillStyle = 'red';
    drawDot(dot);
    ctx.fillStyle = 'black';
};

const eatFood = (dot) => {
    drawDot(dot);
    state.foods = reject(compareArr(dot), state.food);
    state.score += 1;

    drawFood();
};

const isFood = dot => some(compareArr(dot), state.foods);

const moveSnake = () => {
    const { head, tail } = state.snake;
    const dot = moveDot(...head.value, state.direction);

    const nextDotType = match(getMatItem(dot, state.field))
        .case(undefined)(() => 'block')
        .case(0)(() => 'empty')
        .case(() => isFood(dot))(() => 'food')
        .else(() => 'block');

    if (nextDotType === 'block') return end();
    if (nextDotType === 'food') eatFood(dot);

    if (nextDotType === 'empty') {
        state.snake.deleteTail();
        deleteDot(tail.value);

        drawDot(dot, 'yellow');
    }

    state.snake.append(dot);
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

    const snakeDots = go(
        range(basicSize),
        map(offsetX => [startX + offsetX, centerY]),
    );

    each(dot => drawDot(dot, 'yellow'), snakeDots);
    each(state.snake.append, snakeDots);

    drawFood();

    state.timeCanceler = drawInterval(state.speed, moveSnake);
    canvas.focus();

    updateBtn(startBtn, true);
};


(function init({ width, height, unit }) {
    globalContext.canvas.width = width * unit;
    globalContext.canvas.height = height * unit;
    globalContext.canvas.classList.add('canvas');

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

window.drawDot = drawDot;
