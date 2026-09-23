"use strict";
const main = document.getElementsByTagName("main")[0];
const canvas = document.getElementById("canvas");
const scoreElement = document.getElementById("score");
const resetButton = document.getElementById("reset-button");
const colorBackgroundPrimary = getComputedStyle(document.documentElement).getPropertyValue("--color-background-primary").trim();
const colorBackgroundSecondary = getComputedStyle(document.documentElement).getPropertyValue("--color-background-secondary").trim();
const colorBackgroundTertiary = getComputedStyle(document.documentElement).getPropertyValue("--color-background-tertiary").trim();
const colorPrimary = getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim();
const colorSecondary = getComputedStyle(document.documentElement).getPropertyValue("--color-secondary").trim();
const colorTextPrimary = getComputedStyle(document.documentElement).getPropertyValue("--color-text-primary").trim();
const colorAccent = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim();
const colorFailed = "#ff0000";
const colorSucceeded = "#28b800";
let ispointerDown = false;
canvas.addEventListener("pointerdown", (event) => {
    ispointerDown = true;
    if (canvas.setPointerCapture) {
        canvas.setPointerCapture(event.pointerId);
    }
    if (!isTracking && !finished) {
        startTracking(event);
    }
});
canvas.addEventListener("pointerup", (event) => {
    if (isTracking && !finished) {
        stopTracking(false, "pointer released");
    }
    if (canvas.hasPointerCapture?.(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
    }
    ispointerDown = false;
});
canvas.addEventListener("pointercancel", () => {
    if (isTracking && !finished) {
        stopTracking(false, "pointer cancelled");
    }
    ispointerDown = false;
});
canvas.addEventListener("pointermove", handlepointerMove);
window.addEventListener("resize", resizeGame);
window.addEventListener("orientationchange", resizeGame);
const ctx = canvas.getContext("2d");
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;
// Time tracking
let lastTime = performance.now();
const Points = [];
class circle {
    constructor(center, radius = 5, color) {
        this.center = center;
        this.radius = radius;
        this.color = color;
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}
class SineWave {
    constructor(amplitude, periodes, center, length, dash = 0) {
        this.amplitude = amplitude;
        this.periodes = periodes;
        this.center = center;
        this.length = length;
        this.dash = dash;
        this.startX = this.center.x - length / 2;
        this.endX = this.center.x + length / 2;
        ctx.beginPath();
        let isFirstPoint = true;
        for (let x = this.startX; x < this.endX; x += 10) {
            const angle = (((x - this.startX) / (this.endX - this.startX)) * Math.PI * 2) * this.periodes;
            const y = -Math.sin(angle) * this.amplitude + this.center.y;
            if (isFirstPoint) {
                ctx.moveTo(x, y);
                isFirstPoint = false;
            }
            else {
                ctx.lineTo(x, y);
            }
        }
        ctx.lineWidth = 20;
        ctx.strokeStyle = colorAccent;
        ctx.setLineDash([this.dash, this.dash]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}
let lastPoint = { x: Infinity, y: Infinity };
let slowCount = 0;
let isTracking = false;
let finished = false;
function addPoint(x, y) {
    Points.push({ x, y });
    new circle({ x, y }, 8, colorPrimary);
    if (x > sineWave1.endX - 5) {
        stopTracking();
    }
    ;
}
function handlepointerMove(event) {
    if (finished || !ispointerDown || !isTracking)
        return;
    const timeNow = performance.now();
    if ((timeNow - lastTime > 20) && (slowCount > 2)) {
        stopTracking(false, "too slow");
        return;
    }
    else if (timeNow - lastTime > 20) {
        slowCount++;
    }
    else {
        slowCount = 0;
    }
    lastTime = performance.now();
    const bounds = canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * (canvas.width / bounds.width);
    const y = (event.clientY - bounds.top) * (canvas.height / bounds.height);
    addPoint(x, y);
    lastPoint = { x, y };
    const ad = calculateAverageDistance(Points, sineWave1);
    const score = calculateScore(ad);
    displayScore(score);
}
function distanceToSine(sineWave, point) {
    let minDistance = Infinity;
    for (let i = sineWave.startX; i <= sineWave.endX; i++) {
        const angle = (((i - sineWave.startX) / (sineWave.endX - sineWave.startX)) * Math.PI * 2) * sineWave.periodes;
        const y = -Math.sin(angle) * sineWave.amplitude + sineWave.center.y;
        const distance = Math.sqrt(Math.pow((point.x - i), 2) + Math.pow((point.y - y), 2));
        if (distance < minDistance) {
            minDistance = distance;
        }
    }
    return minDistance;
}
function calculateAverageDistance(points, sineWave) {
    let totalDistance = 0;
    for (const point of points) {
        totalDistance += distanceToSine(sineWave, point);
    }
    return totalDistance / points.length;
}
function startTracking(event) {
    if (isTracking)
        return;
    isTracking = true;
    const bounds = canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * (canvas.width / bounds.width);
    if (x > sineWave1.center.x - sineWave1.length / 2 + 25) {
        stopTracking(false, "start more left");
    }
}
function stopTracking(success = true, reason = "") {
    if (!isTracking)
        return;
    finished = true;
    isTracking = false;
    slowCount = 0;
    scoreElement.classList.add("finished");
    resetButton.classList.add("finished");
    if (!success) {
        scoreElement.textContent = reason;
        scoreElement.style.color = colorFailed;
    }
    else {
        scoreElement.style.color = colorSucceeded;
        const ad = calculateAverageDistance(Points, sineWave1);
        const score = calculateScore(ad);
        displayScore(score);
    }
}
function resetGame() {
    Points.length = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sineWave1 = createSineWave();
    scoreElement.textContent = "Score: 0";
    scoreElement.style.color = colorTextPrimary;
    scoreElement.classList.remove("finished");
    resetButton.classList.remove("finished");
    finished = false;
}
function createSineWave() {
    const amplitude = Math.min(250, Math.max(40, canvas.height * 0.25));
    const length = Math.min(canvas.width * 0.5, 1000);
    return new SineWave(amplitude, 1, { x: canvas.width / 2, y: canvas.height / 3 }, length, 13);
}
function resizeGame() {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
    resetGame();
}
function calculateScore(averageDistance) {
    const maxDistance = 50;
    const score = Math.max(0, 100 - (averageDistance / maxDistance) * 100);
    return score;
}
function displayScore(score) {
    if (scoreElement) {
        if (Math.round(score) == (66 + 1)) {
            scoreElement.textContent = "Score: bad number";
            if (finished) {
                scoreElement.style.color = colorFailed;
            }
        }
        else {
            scoreElement.textContent = `Score: ${Math.round(score)}`;
        }
    }
}
let sineWave1 = createSineWave();
//# sourceMappingURL=draw-symbols.js.map