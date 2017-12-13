global = window.global || window;
global.displayCanvas = null;
global.displayWidth = -1;
global.displayHeight = -1;
global.activeContext = null;
global.frameEnterHooks = [];
global.lastRenderTime = new Date();
global.startTime = new Date();
global.tickRate = -1;
global.ticksExecuted = 0;
global.tickEnterHooks = [];
global.displaySizedRenderTargets = [];
global.measuredTickExecutionTimes = [];
global.measuredRenderExecutionTimes = [];
global.measuredRenderIntervals = [];
global.lastCompositeOperation = '';

// ArrowLeft, ArrowRight, ArrowUp, ArrowDown
global.Key = {
    isDown: function (key) {
        return !!global.Key[key.toLowerCase()];
    }
};

function createRenderContext(width, height) {
    return createRenderTargetAndContext(width, height)[1];
}

function createRenderTargetAndContext(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    return [canvas, context];
}

function createDisplaySizedRenderContext() {
    return createDisplaySizedRenderTargetAndContext()[1];
}

function createDisplaySizedRenderTargetAndContext() {
    const res = createRenderTargetAndContext(global.displayWidth, global.displayHeight);
    global.displaySizedRenderTargets.push(res[0]);
    return res;
}

function swapActiveRenderContext(context) {
    const old = global.activeContext;
    global.activeContext = context;
    return old;
}

function init(width, height, tickRate) {
    if (global.canvas) {
        throw 'Cannot call initDisplay multiple times!';
    }

    document.addEventListener('keydown', (evt) => { global.Key[evt.keyCode] = global.Key[evt.key.toLowerCase()] = global.Key[evt.code.toLowerCase()] = true; });
    document.addEventListener('keyup', (evt) => { global.Key[evt.keyCode] = global.Key[evt.key.toLowerCase()] = global.Key[evt.code.toLowerCase()] = false; });

    [global.displayCanvas, global.activeContext] = createRenderTargetAndContext(width, height);
    global.displaySizedRenderTargets.push(global.displayCanvas);
    setDisplaySize(width, height);

    const append = () => document.body.appendChild(global.displayCanvas);
    if (!document.body) {
        window.onload = append;
    } else {
        append();
    }

    global.tickRate = tickRate || 60;
    window.requestAnimationFrame(renderStep);
}

function setDisplaySize(width, height) {
    if (global.displayWidth == width && global.displayHeight == height) return;
    global.displayWidth = width;
    global.displayHeight = height;
    global.displaySizedRenderTargets.forEach(rt => {
        rt.width = width;
        rt.height = height;
    });
}

function renderStep() {
    var now = new Date();
    var dt = (now - global.lastRenderTime) / 1000;
    var t = (now - global.startTime) / 1000;
    var lastT = (global.lastRenderTime - global.startTime) / 1000;

    const ticksDesired = Math.floor(t * global.tickRate);
    let i = 0;
    for (; global.ticksExecuted < ticksDesired; i++ , global.ticksExecuted++) {
        const dt = 1 / global.tickRate;
        tickEnterHooks.forEach(hook => hook(dt, lastT + i * dt));

        const tcur = (new Date() - now) / 1000;
        if (tcur > 1) {
            console.warn(`Early break out of tick loop: ${i} done, ${ticksDesired - global.ticksExecuted} remaining`);
            global.ticksExecuted = ticksDesired;
            break;
        }
    }

    const tStepsComplete = new Date();
    frameEnterHooks.forEach(hook => hook(dt, t));
    const tRenderComplete = new Date();

    global.lastRenderTime = now;
    window.requestAnimationFrame(renderStep);

    // perf counters
    global.measuredTickExecutionTimes.push([i, (tStepsComplete - now) / 1000]);
    global.measuredRenderExecutionTimes.push((tRenderComplete - tStepsComplete) / 1000);
    global.measuredRenderIntervals.push(dt);
    if (global.measuredRenderExecutionTimes.length > 30) {
        global.measuredTickExecutionTimes.shift();
        global.measuredRenderExecutionTimes.shift();
        global.measuredRenderIntervals.shift();
    }
}

function onFrameEnter(handler) {
    global.frameEnterHooks.push(handler);
}

function onTickEnter(handler) {
    global.tickEnterHooks.push(handler);
}

function assert(val, msg) {
    if (!val) throw (msg || 'assertion failed');
}

function getScreenRect() {
    return {
        x: 0,
        y: 0,
        width: global.displayWidth,
        height: global.displayHeight
    };
}

function clear(color) {
    if (!color) {
        return clearRect.apply(window, [getScreenRect()]);
    } else {
        var args = [color].concat(getScreenRect());
        return fillRect.apply(window, args);
    }
}

function clearRect() {
    assert(arguments.length == 1 || arguments.length == 4, 'clearRect must take 1 or 4 arguments');
    global.activeContext.clearRect.apply(
        global.activeContext,
        arguments.length == 1
            ? flattenRectangle(arguments[0])
            : arguments);
}

function fillRect() {
    assert(arguments.length == 2 || arguments.length == 5, 'fillRect must take 2 or 5 arguments');
    global.activeContext.fillStyle = arguments[0];
    global.activeContext.fillRect.apply(
        global.activeContext,
        arguments.length == 2
            ? flattenRectangle(arguments[1])
            : Array.apply(null, arguments).slice(1));
}

function fillEllipseHelper(x, y, w, h) {
    global.activeContext.beginPath();
    global.activeContext.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, 2 * Math.PI);
    global.activeContext.closePath();
    global.activeContext.fill();
}

function fillEllipse() {
    assert(arguments.length == 2 || arguments.length == 5, 'fillEllipse must take 2 or 5 arguments');
    global.activeContext.fillStyle = arguments[0];
    fillEllipseHelper.apply(
        null,
        arguments.length == 2
            ? flattenRectangle(arguments[1])
            : Array.apply(null, arguments).slice(1));
}

function drawPoly(color, points) {
    global.activeContext.strokeStyle = color;
    global.activeContext.lineWidth = 1;
    global.activeContext.fillStyle = '';
    global.activeContext.beginPath();
    global.activeContext.moveTo(points[0][0], points[0][1]);
    for (var i = 1; i < points.length; i++) {
        global.activeContext.lineTo(points[i][0], points[i][1]);
    }
    global.activeContext.closePath();
    global.activeContext.stroke();
}

function fillPoly(color, points) {
    global.activeContext.strokeStyle = '';
    global.activeContext.fillStyle = color;
    global.activeContext.beginPath();
    global.activeContext.moveTo(points[0][0], points[0][1]);
    for (var i = 1; i < points.length; i++) {
        global.activeContext.lineTo(points[i][0], points[i][1]);
    }
    global.activeContext.closePath();
    global.activeContext.fill();
}

function drawLine() {
    assert(arguments.length == 3 || arguments.length == 5, 'drawLine must take 3/5 arguments');
    const src = arguments.length == 3 ? arguments[1] : Array.apply(null, arguments).slice(1, 3);
    const dst = arguments.length == 3 ? arguments[2] : Array.apply(null, arguments).slice(3, 5);
    global.activeContext.strokeStyle = arguments[0];
    global.activeContext.lineWidth = 1;
    global.activeContext.beginPath();
    global.activeContext.moveTo.apply(global.activeContext, src);
    global.activeContext.lineTo.apply(global.activeContext, dst);
    global.activeContext.stroke();
}

function makeRectangle(x, y, width, height) {
    return { x, y, width, height };
}

function flattenRectangle(rect) {
    if (rect instanceof Array) {
        if (rect.length == 4) return rect.concat([]);
        else throw new Error('Rect was array but not 4 elems');
    }
    return [rect.x, rect.y, rect.width, rect.height];
}

function checkOverlap(a, b) {
    return !(a.x + a.width < b.x || a.x > b.x + b.width ||
        a.y + a.height < b.y || a.y > b.y + b.height);
}

function pointInRectangle(point, rect) {
    return !(point[0] < rect.x || point[1] < rect.y || point[0] > rect.x + rect.width || point[1] > rect.y + rect.height);
}

function randomDouble(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(randomDouble(min, max));
}

function randomPoint() {
    return [Math.random() * 2 - 1, Math.random() * 2 - 1];
}

// Copy and pasted from https://github.com/substack/point-in-polygon/blob/master/index.js
// Commit: e1888ce59696a5713b5520cbc17fa268ee703229 File: index.js
// See License-substack.point-in-polygon (MIT)
function pointInPolygon(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

sum = (a) => a.reduce((acc, v) => acc + v, 0);
add = (a, b) => zip(a, b, (v1, v2) => v1 + v2);
sub = (a, b) => zip(a, b, (v1, v2) => v1 - v2);
mul = (a, s) => a.map(v => v * s);
cmul = (a, s) => zip(a, s, (v1, v2) => v1 * v2);
div = (a, s) => a.map(v => v / s);
dot = (a, b) => sum(zip(a, b, (v1, v2) => v1 * v2));
cross = (a, b) => a[0] * b[1] - a[1] * b[0];
sqnorm2d = (a) => dot(a, a);
norm2d = (a) => Math.sqrt(sqnorm2d(a));
comp = (v, basis) => dot(basis, v) / sqnorm2d(basis);
proj = (v, basis) => mul(basis, comp(v, basis));
lerpHelper = (va, vb, t) => va * (1 - t) + vb * t;
lerp = (a, b, t) => a instanceof Array ? zip(a, b, (va, vb) => lerpHelper(va, vb, t)) : lerpHelper(a, b, t);
rotate = (p, theta) => [Math.cos(theta) * p[0] - Math.sin(theta) * p[1], Math.sin(theta) * p[0] + Math.cos(theta) * p[1]];
sqdist = (a, b) => sqnorm2d(sub(a, b));
dist = (a, b) => Math.sqrt(sqdist(a, b));
atan2 = ([x, y]) => Math.atan2(y, x);
perp = ([x, y]) => [-y, x];
normalize = v => div(v, norm2d(v));
flip = ([x, y]) => [-x, -y];

within = (val, l, r) => l <= val && val <= r;


Clockness = {
    clockwise: -1,
    neither: 0,
    counterClockwise: 1
}

function clockness() {
    if (arguments.length === 3) {
        return clockness(sub(arguments[1], arguments[0]), sub(arguments[1], arguments[2]));
    } else if (arguments.length === 2) {
        return clockness(arguments[0][0], arguments[0][1], arguments[1][0], arguments[1][1]);
    } else if (arguments.length === 6) {
        return clockness(arguments[2] - arguments[0], arguments[3] - arguments[1], arguments[2] - arguments[4], arguments[3] - arguments[5]);
    } else if (arguments.length === 4) {
        return Math.sign(cross([arguments[0], arguments[1]], [arguments[2], arguments[3]]));
    }
    throw new Error('Clockness must take 2, 3, 4, or 6 arguments');
}

// Adapted from miyu/derp
// NOTE: Assumes segments are valid (two distinct endpoints) NOT line-OVERLAPPING
// that is, segments should not have more than 1 point of intersection.
// if segments DO have more than 1 point of intersection, this returns no intersection found.
function tryFindSegmentSegmentIntersectionT(s1, s2) {
    const ax = s1[0][0], ay = s1[0][1], bx = s1[1][0], by = s1[1][1];
    const cx = s2[0][0], cy = s2[0][1], dx = s2[1][0], dy = s2[1][1];

    // http://stackoverflow.com/questions/3838329/how-can-i-check-if-two-segments-intersect
    const tl = Math.sign((ax - cx) * (by - cy) - (ay - cy) * (bx - cx));
    const tr = Math.sign((ax - dx) * (by - dy) - (ay - dy) * (bx - dx));
    const bl = Math.sign((cx - ax) * (dy - ay) - (cy - ay) * (dx - ax));
    const br = Math.sign((cx - bx) * (dy - by) - (cy - by) * (dx - bx));

    return tl === -tr && bl === -br;
}

function tryFindSegmentSegmentIntersection(a, b) {
    var t = tryFindSegmentSegmentIntersectionT(a, b);
    if (!t) return null;
    return [a[0][0] * t + a[0][1] * (1 - t), a[1][0] * t + a[1][1] * (1 - t)]
}

function tryFindSegmentPolyIntersectionT(a, b) {
    var tIntersectMin = Infinity;
    for (var i = 0; i < b.length - 1; i++) {
        var t = tryFindSegmentSegmentIntersectionT(a, [b[i], b[i + 1]]);
        if (t) tIntersectMin = Math.min(tIntersectMin, t)
    }
    return tIntersectMin == Infinity ? null : tIntersectMin;
}

function findSegmentPolyIntersectionTs(a, b) {
    var tIntersects = [];
    for (var i = 0; i < b.length - 1; i++) {
        var t = tryFindSegmentSegmentIntersectionT(a, [b[i], b[i + 1]]);
        if (t) tIntersects.push(t);
    }
    return tIntersects;
}

function tryFindSegmentPolyIntersection(a, b) {
    var t = tryFindSegmentPolyIntersectionT(a, b);
    if (!t) return null;
    return lerp(a[0], a[1], t);
}

function findSegmentPolyIntersections(a, b) {
    var ts = findSegmentPolyIntersectionTs(a, b);
    return ts.map(t => lerp(a[0], a[1], t));
}

function findSegmentPolyIntersectionSegments(a, b) {
    var results = [];
    for (var i = 0; i < b.length - 1; i++) {
        var segment = [b[i], b[i + 1]];
        if (tryFindSegmentSegmentIntersectionT(a, segment)) {
            results.push(segment);
        }
    }
    return results;
}

function findNearestPointLineT(query, line) {
    var [p1, p2] = line;
    var p1p2 = sub(p2, p1);
    var p1Query = sub(query, p1);
    var p1QueryProjP1P2Component = comp(p1Query, p1p2);
    return p1QueryProjP1P2Component;
}

function findNearestPointSegmentT(query, segment) {
    var p1QueryProjP1P2Component = findNearestPointLineT(query, segment);
    return Math.max(0, Math.min(1, p1QueryProjP1P2Component));
}

function findNearestPointSegment(query, segment) {
    var t = findNearestPointSegmentT(query, segment);
    return lerp(segment[0], segment[1], t);
}

function findNearestPointPoly(p, poly) {
    var dNearestMin = Infinity;
    var pNearest = null;
    var segNearest = null;
    var segNearestIndex = -1;
    for (var i = 0; i < poly.length - 1; i++) {
        var seg = [poly[i], poly[i + 1]];
        var nearestPoint = findNearestPointSegment(p, seg);
        var d = dist(p, nearestPoint);
        if (d < dNearestMin) {
            dNearestMin = d;
            pNearest = nearestPoint;
            segNearest = seg;
            segNearestIndex = i;
        }
    }
    return [dNearestMin, pNearest, segNearest, segNearestIndex];
}

function findRectangleLineIntersections(rect, seg) {
    var s1 = [[rect.x, rect.y], [rect.x + rect.width, rect.y]];
    var s2 = [[rect.x, rect.y + rect.height], [rect.x + rect.width, rect.y + rect.height]];
    var s3 = [[rect.x, rect.y], [rect.x, rect.y + rect.height]];
    var s4 = [[rect.x + rect.width, rect.y], [rect.x + rect.width, rect.y + rect.height]];

    return [
        tryFindSegmentSegmentIntersection(s1, seg),
        tryFindSegmentSegmentIntersection(s2, seg),
        tryFindSegmentSegmentIntersection(s3, seg),
        tryFindSegmentSegmentIntersection(s4, seg)
    ].filter(val => val);
}

function findRectanglePolyIntersectionPoints(rect, poly) {
    var s1 = [[rect.x, rect.y], [rect.x + rect.width, rect.y]];
    var s2 = [[rect.x, rect.y + rect.height], [rect.x + rect.width, rect.y + rect.height]];
    var s3 = [[rect.x, rect.y], [rect.x, rect.y + rect.height]];
    var s4 = [[rect.x + rect.width, rect.y], [rect.x + rect.width, rect.y + rect.height]];
    return [].concat(
        findSegmentPolyIntersections(s1, poly),
        findSegmentPolyIntersections(s2, poly),
        findSegmentPolyIntersections(s3, poly),
        findSegmentPolyIntersections(s4, poly));
}

function findRectanglePolyIntersectionSegments(rect, poly) {
    var s1 = [[rect.x, rect.y], [rect.x + rect.width, rect.y]];
    var s2 = [[rect.x, rect.y + rect.height], [rect.x + rect.width, rect.y + rect.height]];
    var s3 = [[rect.x, rect.y], [rect.x, rect.y + rect.height]];
    var s4 = [[rect.x + rect.width, rect.y], [rect.x + rect.width, rect.y + rect.height]];

    var results = [];
    for (let i = 0; i < poly.length - 1; i++) {
        var segment = [poly[i], poly[i + 1]];
        if (tryFindSegmentSegmentIntersectionT(s1, segment) ||
            tryFindSegmentSegmentIntersectionT(s2, segment) ||
            tryFindSegmentSegmentIntersectionT(s3, segment) ||
            tryFindSegmentSegmentIntersectionT(s4, segment) ||
            pointInRectangle(segment[0], rect)
        ) {
            results.push(segment);
        }
    }
    return results;
}

//-------------------------------------------------------------------------------------------------
function triwave(x) {
    x *= 4 / (2 * Math.PI); // from 4-period to 2pi period
    x = ((x % 4.0) + 4.0) % 4.0;
    if (x < 1) return x;
    if (x > 3) return x - 4;
    return 2 - x;
}

function mapMany(arr, map) {
    return arr.reduce((acc, it) => acc.concat(map(it)), []);
}

function enumerate(arrOrN) {
    if (typeof (arrOrN) === 'number') {
        var arr = [];
        for (var i = 0; i < arrOrN; i++) {
            arr.push(i);
        }
        return arr;
    } else {
        return arrOrN.map((val, i) => [i, val]);
    }
}

function any(arr, pred) {
    for (let i = 0; i < arr.length; i++) {
        if (pred(arr[i])) return true;
    }
    return false;
}

function zip(a1, a2, zipper) {
    return enumerate(Math.min(a1.length, a2.length)).map(i => zipper(a1[i], a2[i]));
}

function zip3(a1, a2, a3, zipper) {
    return enumerate(Math.min(a1.length, Math.min(a2.length, a3.length))).map(i => zipper(a1[i], a2[i], a3[i]));
}

function arrayify(val) {
    return val instanceof Array ? val : [val];
}

function sum(arr) {
    return arr.aggregate((acc, val) => acc + val, 0);
}

function avg(arr) {
    return sum(arr) / arr.length;
}

function weightedAvg(arr) {
    const agg = arr.reduce(([c1, v1], [c2, v2]) => [c1 + c2, v1 + v2], [0, 0]);
    return agg[1] / agg[0];
}

function createLinearGradient(p1, p2, c1, c2) {
    const gradient = global.activeContext.createLinearGradient(p1[0], p1[1], p2[0], p2[1]);
    gradient.addColorStop(0, c1);
    gradient.addColorStop(1, c2);
    return gradient;
}

function setCompositeOperation(val) {
    if (global.lastCompositeOperation === val) return;
    global.activeContext.globalCompositeOperation = global.lastCompositeOperation = val || 'source-over';
}

function computeMeanTickExecutionTime() {
    if (global.measuredTickExecutionTimes.length < 3) {
        return -1;
    }
    return weightedAvg(global.measuredTickExecutionTimes);
}

function computeMeanRenderExecutionTime() {
    if (global.measuredRenderExecutionTimes.length < 3) {
        return -1;
    }
    return avg(global.measuredRenderExecutionTimes);
}

function computeMeanRenderInterval() {
    if (global.measuredRenderIntervals.length < 3) {
        return -1;
    }
    return avg(global.measuredRenderIntervals);
}

// positive dilates, negative erodes
function offsetSegment(s, offset) {
    const [a, b] = s;
    const diff = sub(b, a);
    const delta = mul(diff, (offset / 2) / norm2d(diff));
    return [sub(a, delta), add(b, delta)];
}