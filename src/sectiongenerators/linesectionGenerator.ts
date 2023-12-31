// src/utils/geodetic.ts
import { generateError } from './errorGenerator.js';
import { IPoint } from '../interfaces/IPoint';

/**
 * Генерирует последовательность точек с заданным шагом и применяет функцию погрешности.
 *
 * @param {number} step - Шаг между точками.
 * @param {number} length - Количество точек в последовательности.
 * @returns {IPoint[]} Массив сгенерированных точек.
 */
export function generatePoints(step: number, length: number): IPoint[] {
    const points: IPoint[] = [];
    let x = 0;

    for (let i = 0; i <= length; i++) {
        const errorX = generateError();
        const errorY = generateError();

        const point: IPoint = { x: x + errorX, y: errorY };
        points.push(point);

        x += step;
    }

    return points;
}

/**
 * Пример использования функции generatePoints.
 *
 * @returns {IPoint[]} Массив сгенерированных точек.
 */
export function generateSamplePoints(): IPoint[] {
    const step = 1; // Шаг между точками
    const length = 100; // Количество точек
    return generatePoints(step, length);
}
