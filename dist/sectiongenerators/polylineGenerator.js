/**
 * Модуль для генерации полилиний. Создаёт последовательность точек на основе
 * массива вершин, где каждая вершина задаётся углом и длиной относительно
 * предыдущей. Может применять функцию погрешности для симуляции ошибок измерения.
 *
 * @module polylineGenerator
 */
// src/utils/polylineGenerator.ts
import { generateError } from './errorGenerator.js';
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
export function generatePolylineWithVertices(vertices, errorFunction) {
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
/**
* Генерирует полилинию, используя предопределённые вершины и функцию погрешности.
*
* @returns {IPoint[]} Массив сгенерированных точек полилинии.
*/
export function generatePolyline() {
    return generatePolylineWithVertices(vertices, generateError);
}
