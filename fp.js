const { go, identity, map, L: { indexValues } } = require('fxjs2');

const fp = {};

fp.setIdxs = (idx1, idx2, v, xs) => go(
    xs,
    indexValues,
    map(([item, idx]) => (idx - 1 < idx1 || idx - 1 > idx2 ? item : v)),
);

fp.setIdx = (idx, f, xs) => {
    const nxs = [...xs];
    nxs[idx] = typeof f === 'function' ? f(nxs[idx]) : f;
    return nxs;
};

fp.compareArr = (a1, a2) => a1.map((el, i) => el === a2[i]).every(identity);

module.exports = fp;
