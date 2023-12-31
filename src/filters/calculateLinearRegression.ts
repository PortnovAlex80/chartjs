import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';

function calculateLinearRegression(points: IPoint[]): { slope: number; intercept: number } {
    if (points.length === 0) {
        throw new Error('Пустой массив точек для линейной регрессии');
    }
    const n = points.length;
    const sumX = points.reduce((acc, p) => acc + p.x, 0);
    const sumY = points.reduce((acc, p) => acc + p.y, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;

    let num = 0;
    let den = 0;

    for (let p of points) {
        num += (p.x - meanX) * (p.y - meanY);
        den += (p.x - meanX) ** 2;
    }

    const slope = num / den;
    const intercept = meanY - slope * meanX;

    return { slope, intercept };
}

const lineSegmentFilter: IFilter = (points: IPoint[], epsilon: number): IPoint[] => {
    const segments: IPoint[] = [];
    let currentSegment: IPoint[] = [];

    for (let point of points) {
        currentSegment.push(point);
        const { slope, intercept } = calculateLinearRegression(currentSegment);
        
        // Проверка, удовлетворяют ли точки допуску
        if (currentSegment.every(p => Math.abs(p.y - (slope * p.x + intercept)) <= epsilon)) {
            continue;
        } else {
            // Сохраняем последнюю точку сегмента, удовлетворяющую допуску
            segments.push(currentSegment[currentSegment.length - 2]);
            currentSegment = [currentSegment[currentSegment.length - 1]];
        }
    }

    // Добавляем последний сегмент
    if (currentSegment.length > 0) {
        segments.push(currentSegment[currentSegment.length - 1]);
    }

    return segments;
};

export default lineSegmentFilter;
