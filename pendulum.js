// Physical Constants
const g = 9.8;

// Simulation constants
const timePerFrame = 0.05;
const X0 = 350;
const Y0 = 60;
const length1 = 150;
const length2 = 150;

// variables
var angularVelocity1 = 0;
var angularVelocity2 = 0;
var mass1 = 10;
var mass2 = 10;
var phi1 = 50 * (Math.PI) / 180;
var phi2 = 65 * (Math.PI) / 180;


const mass1El = /** @type {HTMLInputElement} */ (document.getElementById('mass1'));
const mass2El = /** @type {HTMLInputElement} */ (document.getElementById('mass2'));
const phi1El  = /** @type {HTMLInputElement} */ (document.getElementById('phi1'));
const phi2El  = /** @type {HTMLInputElement} */ (document.getElementById('phi2'));

document.getElementById('set_variables_form').addEventListener('submit', function (e) {
    e.preventDefault();
    angularVelocity1 = 0;
    angularVelocity2 = 0;
    mass1 = parseInt(mass1El.value);
    mass2 = parseInt(mass2El.value);
    phi1  = parseInt(phi1El.value) / 180 * (Math.PI);
    phi2  = parseInt(phi2El.value) / 180 * (Math.PI);
    run();
});

mass1El.addEventListener('input', function(e) {
    document.getElementById('mass1Display').innerText = mass1El.value;
    mass1 = parseInt(mass1El.value);
    updateCanvas();
});

mass2El.addEventListener('input', function(e) {
    document.getElementById('mass2Display').innerText = mass2El.value;
    mass2 = parseInt(mass2El.value);
    updateCanvas();
});

phi1El.addEventListener('input', function(e) {
    document.getElementById('phi1Display').innerText = phi1El.value;
    phi1 = parseInt(phi1El.value) / 180 * (Math.PI);
    updateCanvas();
});

phi2El.addEventListener('input', function(e) {
    document.getElementById('phi2Display').innerText = phi2El.value;
    phi2 = parseInt(phi2El.value) / 180 * (Math.PI);
    updateCanvas();
});

/** 
 * @typedef {Object} Line A line to be drawn on the canvas
 * @property {number} x0 x-coordinate of origin
 * @property {number} y0 y-coordinate of origin
 * @property {number} x x-coordinate of endpoint
 * @property {number} y y-coordinate of endpoint
 */

/** 
 * @typedef {Object} Circle The circle representing the object attached to the pendulum
 * @property {number} x The x-coordinate of the circle's center point
 * @property {number} y The y-coordinate of the circle's center point
 * @property {number} mass The mass of the circle
 */

/**
 * @typedef {Object} Pendulum The current state of the double pendulum
 * @property {Line} line1
 * @property {Line} line2
 * @property {Circle} circle1
 * @property {Circle} circle2
 */

/**
 * Draws the given circle on the given canvas context
 * @param {Circle} myCircle 
 * @param {CanvasRenderingContext2D} context
 */
function drawCircle(myCircle, context) {
    context.beginPath();
    context.arc(myCircle.x, myCircle.y, myCircle.mass, 0, 2 * Math.PI, false);
    context.fillStyle = 'rgba(0,0,0,1)';
    context.fill();
}

/**
 * Draws the given line segment on the given canvas context
 * @param {Line} myLine 
 * @param {CanvasRenderingContext2D} context 
 */
function drawLine(myLine, context) {
    context.beginPath();
    context.moveTo(myLine.x0, myLine.y0);
    context.lineTo(myLine.x, myLine.y);
    context.strokeStyle = 'red';
    context.lineWidth = 5;
    context.stroke();
}

/**
 * Update the canvas with the given initial position
 * @param {Pendulum} pendulum
 * @param {HTMLCanvasElement} canvas 
 * @param {CanvasRenderingContext2D} context 
 */
function animate(pendulum, canvas, context) {
    const { circle1, circle2, line1, line2 } = pendulum;
    const mu = 1 + mass1 / mass2;
    const angularAcceleration1 = (g * (Math.sin(phi2) * Math.cos(phi1 - phi2) - mu * Math.sin(phi1))
                                - (length2 * angularVelocity2 * angularVelocity2 + length1 * angularVelocity1 * angularVelocity1 * Math.cos(phi1 - phi2))
                                * Math.sin(phi1 - phi2)
                            ) / (length1 * (mu - Math.cos(phi1 - phi2) * Math.cos(phi1 - phi2)));
    const angularAcceleration2 = (mu * g * (Math.sin(phi1) * Math.cos(phi1 - phi2) - Math.sin(phi2)) + (mu * length1 * angularVelocity1 * angularVelocity1 + length2 * angularVelocity2 * angularVelocity2 * Math.cos(phi1 - phi2)) * Math.sin(phi1 - phi2)) / (length2 * (mu - Math.cos(phi1 - phi2) * Math.cos(phi1 - phi2)));
    angularVelocity1 += angularAcceleration1 * timePerFrame;
    angularVelocity2 += angularAcceleration2 * timePerFrame;
    phi1 += angularVelocity1 * timePerFrame;
    phi2 += angularVelocity2 * timePerFrame;

    circle1.x = X0 + length1 * Math.sin(phi1);
    circle1.y = Y0 + length1 * Math.cos(phi1);
    circle2.x = X0 + length1 * Math.sin(phi1) + length2 * Math.sin(phi2);
    circle2.y = Y0 + length1 * Math.cos(phi1) + length2 * Math.cos(phi2);

    line1.x = circle1.x;
    line1.y = circle1.y;
    line2.x0 = circle1.x;
    line2.y0 = circle1.y;
    line2.x = circle2.x;
    line2.y = circle2.y;

    context.clearRect(0, 0, canvas.width, canvas.height);

    drawLine(line1, context);
    drawLine(line2, context);
    drawCircle(circle1, context);
    drawCircle(circle2, context);
}


const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('myCanvas'));
const context = canvas.getContext('2d');
const graph  = /** @type {HTMLCanvasElement} */ (document.getElementById('graph'));
const graphContext = graph.getContext('2d');
/** @type {number} */
var init = null;

/**
 * Resets the canvas back to initial positions and returns the pendulum state
 * @returns {Pendulum}
 */
function resetCanvas() {
    /** @type {Line} */
    var line1 = { x0: X0, y0: Y0, x: 0, y: 0 };
    /** @type {Line} */
    var line2 = { x0: 0, y0: 0, x: 0, y: 0 };
    /** @type {Circle} */
    var circle1 = {
        x: X0 + length1 * Math.sin(phi1),
        y: Y0 + length1 * Math.cos(phi1),
        mass: mass1,
    };
    /** @type {Circle} */
    var circle2 = {
        x: circle1.x + length2 * Math.sin(phi2),
        y: circle1.y + length2 * Math.cos(phi2),
        mass: mass2,
    };

    angularVelocity1 = 0;
    angularVelocity2 = 0;

    clearInterval(init);
    context.clearRect(0, 0, canvas.width, canvas.height);
    return {
        line1,
        line2,
        circle1,
        circle2,
    };
}

function updateCanvas() {
    const pendulum = resetCanvas();
    animate(pendulum, canvas, context);
}

/**
 * 
 * @param {number} phi the angle
 * @param {number} length the axis length
 * @returns {number} The scaled value to use with the canvas
 */
function scalePhi(phi, length) {
    const scalingFactor = 0.8;
    const MIN_PHI = -Math.PI * scalingFactor;
    const MAX_PHI = Math.PI * scalingFactor;
    return length * (phi - MIN_PHI) / (MAX_PHI*2);
}

function run() {
    const pendulum = resetCanvas();
    graphContext.clearRect(0, 0, graph.width, graph.height);
    graphContext.font = '48px serif';
    graphContext.fillText('\u03C6\u2081', graph.width / 2, graph.height - 20);
    graphContext.fillText('\u03C6\u2082', 20, graph.height / 2);
    graphContext.beginPath();
    graphContext.strokeStyle = 'green';
    graphContext.moveTo(scalePhi(phi1, graph.width), scalePhi(phi2, graph.height));
    init = setInterval(function () {
        animate(pendulum, canvas, context);
        graphContext.lineTo(scalePhi(phi1, graph.width), scalePhi(phi2, graph.height));
        graphContext.stroke();
    }, timePerFrame * 100);
}
