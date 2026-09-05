"use strict";
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
document.addEventListener("click", (event) => {
    startTracking();
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
let lastPoint = { x: 0, y: 0 };
function addPoint(x, y) {
    Points.push({ x, y });
    new circle({ x, y }, 8, "#ff0000");
    if (x > sineWave1.endX - 5) {
        stopTracking();
    }
    ;
}
function handleMouseMove(event) {
    const x = event.clientX;
    const y = event.clientY;
    const distance = Math.sqrt(Math.pow((x - lastPoint.x), 2) +
        Math.pow((y - lastPoint.y), 2));
    if (distance >= 3) {
        addPoint(x, y);
        lastPoint = { x, y };
    }
}
function distanceToSinus(sineWave, point) {
    console.log("Calculating distance to sinus...");
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
    let ad = calculateAverageDistance(Points, sineWave1);
    console.log(`Average Distance: ${ad}`);
    console.log(`Score: ${calculateScore(ad)}`);
}
function calculateScore(averageDistance) {
    const maxDistance = 50;
    const score = Math.max(0, 100 - (averageDistance / maxDistance) * 100);
    return score;
}
const sineWave1 = new sineWave(250, 1, { x: canvas.width / 2, y: canvas.height / 2 }, canvas.width / 3, 15);
//# sourceMappingURL=draw-symbols.js.map