"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateChartData = void 0;
function randomContrastColor() {
    const hue = Math.floor(Math.random() * 360); // Случайный оттенок от 0 до 359
    return `hsl(${hue}, 100%, 50%)`; // 100% насыщенность и 50% светлость
}
function generateChartData(...pointsArrays) {
    return pointsArrays.map(points => {
        return {
            label: 'Полилиния',
            data: points.map(point => ({ x: point.x, y: point.y })),
            borderColor: randomContrastColor(),
            borderWidth: 2,
            fill: false,
        };
    });
}
exports.generateChartData = generateChartData;
