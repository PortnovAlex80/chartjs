"use strict";
/**
 * Модуль для генерации полилиний. Создаёт последовательность точек на основе
 * массива вершин, где каждая вершина задаётся углом и длиной относительно
 * предыдущей. Может применять функцию погрешности для симуляции ошибок измерения.
 *
 * @module polylineGenerator
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePolyline = exports.generatePolylineWithVertices = void 0;
// src/utils/polylineGenerator.ts
const errorGenerator_1 = require("./errorGenerator");
/**
 * Захардкоженный массив вершин полилинии. Каждая вершина задаёт угол в градусах
 * и длину от предыдущей точки.
 * @type {Array.<{x: number, y: number, angle: number, length: number}>}
 */
const vertices = [
    { x: 0, y: 0, angle: 0, length: 50 },
    { angle: 30, length: 20 },
    { angle: 0, length: 10 },
    { angle: -30, length: 20 },
    { angle: 0, length: 50 }
];
/**
 * Генерирует полилинию на основе заданных вершин и функции погрешности.
 *
 * @param {IVertex[]} vertices - Массив вершин полилинии.
 * @param {Function} errorFunction - Функция, генерирующая случайную погрешность.
 * @returns {IPoint[]} Массив сгенерированных точек полилинии.
 */
function generatePolylineWithVertices(vertices, errorFunction) {
    const points = [];
    let currentX = 0;
    let currentY = 0;
    vertices.forEach(vertex => {
        const angleRadians = vertex.angle * Math.PI / 180;
        for (let i = 0; i < vertex.length; i++) {
            currentX += Math.cos(angleRadians) + errorFunction();
            currentY += Math.sin(angleRadians) + errorFunction();
            points.push({ x: currentX, y: currentY });
        }
    });
    return points;
}
exports.generatePolylineWithVertices = generatePolylineWithVertices;
/**
* Генерирует полилинию, используя предопределённые вершины и функцию погрешности.
*
* @returns {IPoint[]} Массив сгенерированных точек полилинии.
*/
function generatePolyline() {
    return generatePolylineWithVertices(vertices, errorGenerator_1.generateError);
}
exports.generatePolyline = generatePolyline;
