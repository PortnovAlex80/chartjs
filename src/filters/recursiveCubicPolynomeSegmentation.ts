import { CubicPolynomialApproximation } from '../classes/CubicPolynomialApproximation.js';
import { IPoint } from '../interfaces/IPoint';

const RMSE_THRESHOLD = 0.15;
const MAX_LOG_DEPTH = 10;


function recursiveSegmentation(points: IPoint[]): IPoint[] {
    let recursionDepth = 0;

    function isLogging(currentDepth: number): boolean {
        return currentDepth < MAX_LOG_DEPTH;
    }

    function split(points: IPoint[], start: number, end: number, depth: number): IPoint[] {
        isLogging(depth) && console.log(`Рекурсия: Глубина = ${depth}, Сегмент: [${start}, ${end}]`);
        // Логируем координаты X начальной и конечной точек сегмента
        const startX = points[start].x;
        const endX = points[end].x;
        isLogging(depth) && console.log(`Рекурсия: Глубина = ${depth}, Сегмент: [${startX}, ${endX}]`);

        const segmentPoints = points.slice(start, end + 1);
        const cubicApproximation = new CubicPolynomialApproximation();
        const approximatedPoints = cubicApproximation.approximate(segmentPoints);
        const rmse = cubicApproximation.calculateRMSE(segmentPoints, approximatedPoints);

        isLogging(depth) && console.log(`RMSE = ${rmse}`);
        if (rmse < RMSE_THRESHOLD) {
            isLogging(depth) &&  console.log("RMSE ниже порога, возвращение границ сегмента");
            return [points[start], points[end]];
        }

        const turnPoints = cubicApproximation.findMaxTurnPoint();
        isLogging(depth) && console.log(turnPoints);
        if (!turnPoints) {
            isLogging(depth) && console.log("Точка поворота не найдена, возвращение границ сегмента");
            return [points[start], points[end]];
        }

        // Находим первую точку поворота, которая лежит внутри диапазона точек
        const validTurnPoint = turnPoints.find(tp => tp.x >= points[start].x && tp.x <= points[end].x);
        
        if (!validTurnPoint) {
            return [points[start], points[end]];
        }
        
        // Находим ближайший индекс к точке поворота
        const splitIndex = points.reduce((closestIndex, point, index) => {
            return (Math.abs(point.x - validTurnPoint.x) < Math.abs(points[closestIndex].x - validTurnPoint.x)) ? index : closestIndex;
        }, start);

        isLogging(depth) && console.log(`Индекс разделения: ${splitIndex}`);
        let firstSegment = split(points, start, splitIndex, depth + 1);
        let secondSegment = split(points, splitIndex, end, depth + 1);
        
        return [...firstSegment, ...secondSegment.slice(1)];
    }

    // function split(points: IPoint[], start: number, end: number, depth: number): IPoint[] {
    //     isLogging(depth) && console.log(`Рекурсия: Глубина = ${depth}, Сегмент: [${points[start].x}, ${points[end].x}]`);

    //     const segmentPoints = points.slice(start, end + 1);
    //     const cubicApproximation = new CubicPolynomialApproximation();
    //     const approximatedPoints = cubicApproximation.approximate(segmentPoints);
    //     const rmse = cubicApproximation.calculateRMSE(segmentPoints, approximatedPoints);

    //     if (rmse < RMSE_THRESHOLD) {
    //         return [points[start], points[end]];
    //     }

    //     const extremes = cubicApproximation.calculateExtremes();
    //     isLogging(depth) && console.log(extremes);
        
    //     if (!extremes || extremes.length === 0) {
    //         return [points[start], points[end]];
    //     }

    //     let segments = [];
    //     let previousIndex = start;
    //     extremes.forEach(extreme => {
    //         const extremeIndex = points.findIndex(p => p.x === extreme.x);
    //         if (extremeIndex > previousIndex) {
    //             segments.push(...split(points, previousIndex, extremeIndex, depth + 1).slice(0, -1));
    //             previousIndex = extremeIndex;
    //         }
    //     });
    //     segments.push(...split(points, previousIndex, end, depth + 1).slice(0, -1));

    //     return segments;
    // }

    return split(points, 0, points.length - 1, recursionDepth);
}

export default recursiveSegmentation;
