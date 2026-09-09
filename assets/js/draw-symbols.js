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
let isMouseDown = false;
document.addEventListener("mousedown", () => {
    if (!isMouseDown) {
        startTracking();
    }
    console.log("mousedown");
    isMouseDown = true;
});
document.addEventListener("mouseup", () => {
    if (isMouseDown) {
        stopTracking(false, "Mouse released");
    }
    isMouseDown = false;
});
const ctx = canvas.getContext("2d");
const width = document.documentElement.clientWidth;
const height = document.documentElement.clientHeight;
canvas.width = width;
canvas.height = height;
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
class sineWave {
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
function addPoint(x, y) {
    Points.push({ x, y });
    new circle({ x, y }, 8, colorPrimary);
    if (x > sineWave1.endX - 5) {
        stopTracking();
    }
    ;
}
function handleMouseMove(event) {
    const timeNow = performance.now();
    if ((timeNow - lastTime > 20) && (slowCount > 2)) {
        stopTracking();
        return;
    }
    else if (timeNow - lastTime > 20) {
        slowCount++;
        console.log(`slowCount: ${slowCount}`);
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
function distanceToSinus(sineWave, point) {
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
        totalDistance += distanceToSinus(sineWave, point);
    }
    return totalDistance / points.length;
}
function startTracking() {
    if (isTracking)
        return;
    document.addEventListener("mousemove", handleMouseMove);
    isTracking = true;
}
function stopTracking(success = true, reason = "") {
    if (!isTracking)
        return;
    document.removeEventListener("mousemove", handleMouseMove);
    isTracking = false;
    slowCount = 0;
    scoreElement.classList.add("finished");
    resetButton.classList.add("finished");
    if (!success) {
        scoreElement.textContent = reason;
        scoreElement.style.color = colorFailed;
    }
    else {
        const ad = calculateAverageDistance(Points, sineWave1);
        const score = calculateScore(ad);
        displayScore(score);
    }
}
function resetGame() {
    Points.length = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    new sineWave(250, 1, { x: canvas.width / 2, y: canvas.height / 2 }, canvas.width / 3, 15);
    scoreElement.textContent = "Score: 0";
    scoreElement.classList.remove("finished");
    resetButton.classList.remove("finished");
}
function calculateScore(averageDistance) {
    const maxDistance = 50;
    const score = Math.max(0, 100 - (averageDistance / maxDistance) * 100);
    return score;
}
function displayScore(score) {
    if (scoreElement) {
        scoreElement.textContent = `Score: ${Math.round(score)}`;
    }
}
const sineWave1 = new sineWave(250, 1, { x: canvas.width / 2, y: canvas.height / 2 }, canvas.width / 3, 15);
//# sourceMappingURL=draw-symbols.js.map