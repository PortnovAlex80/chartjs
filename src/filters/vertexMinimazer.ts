import leastSquaresFilter from '../filters/leastSquaresFilter.js';
import { IPoint } from '../interfaces/IPoint';

export function bestCombinationFilter(surfacePoints: IPoint[], polylineSegment: IPoint[], threshold: number = 0.07): IPoint[] {

    if (polylineSegment.length < 3) {
        return polylineSegment; // Возвращаем исходный массив, если точек меньше трех
    }

    const totalLength = calculateTotalLengthOfPolyline(polylineSegment);
    const totalVertices = polylineSegment.length;

    let bestCombination = polylineSegment;
    let bestScore = -Infinity; // Инициализируем bestScore как -Infinity для начала сравнения

        let subset = [];
        let previousIndex = -1;
        let currentScore = 0;
        let totalRMSE = 0;
    
        let minSums = Array(polylineSegment.length).fill(Infinity);
        let previousIndices = Array(polylineSegment.length).fill(-1);
        minSums[0] = 0;
    
        for (let j = 1; j < polylineSegment.length; j++) {
            for (let i = 0; i < j; i++) {
                const segmentRMSE = calculateRMSE(polylineSegment.slice(i, j + 1), surfacePoints);
                const currentScore = optimaFunction(i, j, polylineSegment, totalVertices, totalLength);
                
                // Проверяем, удовлетворяет ли RMSE заданному порогу и обновляем, если текущая сумма меньше
                if (segmentRMSE <= threshold && minSums[i] + segmentRMSE < minSums[j]) {
                    minSums[j] = minSums[i] + segmentRMSE;
                    previousIndices[j] = i;
                }
            }
        }
    
        // Восстановление пути на основе минимальных сумм RMSE
        let path = reconstructPathUsingPreviousIndices(polylineSegment, previousIndices);
        return path;
    }

function reconstructPathUsingPreviousIndices(polylineSegment: IPoint[], previousIndices: number[]): IPoint[] {
    let path = [];
    let currentIndex = polylineSegment.length - 1;
    while (currentIndex >= 0) {
        path.unshift(polylineSegment[currentIndex]);
        currentIndex = previousIndices[currentIndex];
    }
    return path;
}


function optimaFunction(i: number, j: number, points: IPoint[], totalVertices: number, totalLength: number) {
    let deletedVerticesScore = (j - i - 1) / totalVertices;
    let lengthScore = lengthOfSegment(i, j, points) / totalLength;
    return calculateTotalScore(deletedVerticesScore, lengthScore);
}

function calculateTotalScore(deleteScore: number, lengthScore: number) {
    if (deleteScore === 0 || lengthScore === 0) {
        return 0; // Чтобы избежать деления на ноль
    }
    return 2 / (1/deleteScore + 1/lengthScore);
}


function lengthOfSegment(i: number, j: number, points: IPoint[]): number {
    if (i >= points.length || j >= points.length) {
        throw new Error('Index out of bounds.');
    }

    const point1 = points[i];
    const point2 = points[j];

    return Math.sqrt(
        Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
}

function calculateTotalLengthOfPolyline(points: IPoint[]): number {
    return points.reduce((totalLength, point, index) => {
        if (index === 0) {
            return totalLength;
        }
        const previousPoint = points[index - 1];
        const length = Math.sqrt(
            Math.pow(point.x - previousPoint.x, 2) + Math.pow(point.y - previousPoint.y, 2)
        );
        return totalLength + length;
    }, 0);
}

function calculateHeightFromLine(point: IPoint, lineStart: IPoint, lineEnd: IPoint) {
    const area = Math.abs(0.5 * (point.x * (lineStart.y - lineEnd.y) + lineStart.x * (lineEnd.y - point.y) + lineEnd.x * (point.y - lineStart.y)));
    const bottom = Math.hypot(lineStart.x - lineEnd.x, lineStart.y - lineEnd.y);
    const height = area / bottom;
    return height;
}

function findNearestPointsByX(subset: IPoint[], allSurfacePoints: IPoint[]): IPoint[] {
    const firstX = subset[0].x;
    const lastX = subset[subset.length - 1].x;
    const sortedSurfacePoints = allSurfacePoints.filter(point => point.x >= firstX && point.x <= lastX);
    return sortedSurfacePoints;
}

function calculateDistance(point1:IPoint, point2:IPoint) {
// Реализация вычисления расстояния между двумя точками
return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

function calculateRMSE(subset: IPoint[], allSurfacePoints: IPoint[]): number {
    // Используем leastSquaresFilter для аппроксимации
    
// Найти ближайшие точки по X в allSurfacePoints для subset
const surfacePoints = findNearestPointsByX(subset, allSurfacePoints);
if (surfacePoints.length < 2) {
    return 10; // Возвращаем исходный массив, если точек меньше трех
}

const approxPoints = leastSquaresFilter(surfacePoints);
    let sumOfSquares = 0;

    subset.forEach(point => {
        const height = calculateHeightFromLine(point, approxPoints[0], approxPoints[1]);
        sumOfSquares += height * height;
    });

    return Math.sqrt(sumOfSquares / subset.length);
};

