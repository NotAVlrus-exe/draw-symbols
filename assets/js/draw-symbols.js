"use strict";
const canvas = document.getElementById("canvas");
const scoreElement = document.getElementById("score");
let isMouseDown = false;
document.addEventListener("mousedown", () => {
    if (!isMouseDown) {
        startTracking();
    }
    isMouseDown = true;
});
document.addEventListener("mouseup", () => {
    isMouseDown = false;
    stopTracking();
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
        ctx.strokeStyle = "#4545455a";
        ctx.setLineDash([this.dash, this.dash]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}
let lastPoint = { x: Infinity, y: Infinity };
let slowCount = 0;
function addPoint(x, y) {
    Points.push({ x, y });
    new circle({ x, y }, 8, "#ff0000");
    if (x > sineWave1.endX - 5) {
        stopTracking();
    }
    ;
}
function handleMouseMove(event) {
    const timeNow = performance.now();
    if ((timeNow - lastTime > 50) && (slowCount > 2)) {
        if (scoreElement) {
            scoreElement.textContent = `too slow`;
        }
        stopTracking();
        return;
    }
    else if (timeNow - lastTime > 50) {
        slowCount++;
        console.log(`slowCount: ${slowCount}`);
    }
    lastTime = performance.now();
    const bounds = canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * (canvas.width / bounds.width);
    const y = (event.clientY - bounds.top) * (canvas.height / bounds.height);
    const distance = Math.sqrt(Math.pow((x - lastPoint.x), 2) +
        Math.pow((y - lastPoint.y), 2));
    if (distance >= 3) {
        addPoint(x, y);
        lastPoint = { x, y };
    }
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
    document.addEventListener("mousemove", handleMouseMove);
}
function stopTracking() {
    document.removeEventListener("mousemove", handleMouseMove);
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