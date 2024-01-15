// /src/filters/VertexOptimazer.ts
import { IPoint } from '../interfaces/IPoint.js';
import { IFilter } from '../interfaces/IFilter.js';
import leastSquaresFilter from './leastSquaresFilter.js';
import { CubicPolynomialApproximation } from '../classes/CubicPolynomialApproximation.js';
import { convertCompilerOptionsFromJson } from 'typescript';

interface Line {
    pointA: IPoint,
    pointB: IPoint
};

export const vertexOptimizer: IFilter = (fullAreaPoints: IPoint[]): IPoint[] => {

    fullAreaPoints = fullAreaPoints
    .filter((point, index, self) =>
        index === self.findIndex(p => p.x === point.x && p.y === point.y))
    .sort((a, b) => a.x - b.x);


    // получить предварительные границы сегментов
    const segmentBoundaries = new CubicPolynomialApproximation().findRandomQualitySegments(fullAreaPoints); 
    segmentBoundaries.forEach(point => { console.log(`Вертекс Оптимомайзер получил сегменты ${JSON.stringify(point)}`)})

    // перебираем в цикле смежные вершины. Задача цикла передать в функцию только те координаты вершин, которые имеют смежные сегменты, те, кроме первой и последней
    const optimizedVertexies: IPoint[] = [];
    optimizedVertexies.push(fullAreaPoints[0]);
    for (let i = 1; i < segmentBoundaries.length - 1; i++) {
        const prevVertex = segmentBoundaries[i - 1];
        const currentVertex = segmentBoundaries[i];
        const nextVertex = segmentBoundaries[i + 1];
        if (fullAreaPoints.slice(fullAreaPoints.indexOf(prevVertex), fullAreaPoints.indexOf(currentVertex) + 1).length < 2 || fullAreaPoints.slice(fullAreaPoints.indexOf(currentVertex), fullAreaPoints.indexOf(nextVertex) +1).length < 2 ) {
            continue;
        }
        console.log(`Отправляем в оптимазерй - Left - ${fullAreaPoints.slice(fullAreaPoints.indexOf(prevVertex), fullAreaPoints.indexOf(currentVertex)).length}`);
        console.log(`Отправляем в оптимазерй - Right - ${fullAreaPoints.slice(fullAreaPoints.indexOf(currentVertex), fullAreaPoints.indexOf(nextVertex)).length}`);
        const optimizedVertex = optimizer(fullAreaPoints, prevVertex, currentVertex, nextVertex);
        const optVertex = optimizedVertex.x === 0 && optimizedVertex.y === 0 ? currentVertex : optimizedVertex;
        optimizedVertexies.push(optVertex);
            
    };
    optimizedVertexies.push(fullAreaPoints[fullAreaPoints.length - 1]);
    return optimizedVertexies;
};

function optimizer1(fullAreaPoints: IPoint[], prevVertex: IPoint, currentVertex: IPoint, nextVertex: IPoint): IPoint {
    
    return currentVertex; 

};

function optimizer(fullAreaPoints: IPoint[], prevVertex: IPoint, currentVertex: IPoint, nextVertex: IPoint): IPoint {
    let commonVertexIndex = fullAreaPoints.indexOf(currentVertex);
    const pointWindow = 2;

    // Рассчитываем максимально возможное смещение для левой и правой частей

    const leftSegmentInputPoints = fullAreaPoints.slice(fullAreaPoints.indexOf(prevVertex), fullAreaPoints.indexOf(currentVertex) + 1);   
    const rightSegmentInputPoints = fullAreaPoints.slice(fullAreaPoints.indexOf(currentVertex), fullAreaPoints.indexOf(nextVertex) + 1);

    const maxLeftShift = Math.min(pointWindow / 2, leftSegmentInputPoints.length - 2);
    const maxRightShift = Math.min(pointWindow / 2, rightSegmentInputPoints.length - 2);

      // Исходные сегменты для вычисления RMSE исходного положения
      const initialLeftSegmentInputPoints = fullAreaPoints.slice(fullAreaPoints.indexOf(prevVertex), commonVertexIndex + 1);
      const initialRightSegmentInputPoints = fullAreaPoints.slice(commonVertexIndex, fullAreaPoints.indexOf(nextVertex) + 1);
  
        // Вычисляем исходный RMSE
                // Применяем фильтр метода наименьших квадратов и создаем объекты Line
                const leftSegmentLeastSquaresPointsInit = leastSquaresFilter(leftSegmentInputPoints);
                const leftSegmentLeastSquaresLineInit: Line = {
                    pointA: leftSegmentLeastSquaresPointsInit[0],
                    pointB: leftSegmentLeastSquaresPointsInit[1]
                };
                const rightSegmentLeastSquaresPointsInit = leastSquaresFilter(rightSegmentInputPoints);
                const rightSegmentLeastSquaresLineInit: Line = {
                    pointA: rightSegmentLeastSquaresPointsInit[0],
                    pointB: rightSegmentLeastSquaresPointsInit[1]
                };

        const initialLeftRmse = calculateRmseByLineAndInputPoints(initialLeftSegmentInputPoints, leftSegmentLeastSquaresLineInit);
        const initialRightRmse = calculateRmseByLineAndInputPoints(initialRightSegmentInputPoints, rightSegmentLeastSquaresLineInit);
        const initialRmse = initialLeftRmse + initialRightRmse;
    
        let bestRmse = initialRmse; // Инициализация лучшего RMSE исходным значением
        let bestIndex = commonVertexIndex; // Инициализация лучшего индекса исходным положением

    for (let i = -maxLeftShift; i <= maxRightShift; i++) {
        const windowIndex = commonVertexIndex + i;

        const leftSegmentInputPoints = fullAreaPoints.slice(fullAreaPoints.indexOf(prevVertex), windowIndex + 1);   
        const rightSegmentInputPoints = fullAreaPoints.slice(windowIndex, fullAreaPoints.indexOf(nextVertex) + 1);

        const maxLeftShift = leftSegmentInputPoints.length;
        const maxRightShift =rightSegmentInputPoints.length;

        // Применяем фильтр метода наименьших квадратов и создаем объекты Line
        const leftSegmentLeastSquaresPoints = leastSquaresFilter(leftSegmentInputPoints);
        const leftSegmentLeastSquaresLine: Line = {
            pointA: leftSegmentLeastSquaresPoints[0],
            pointB: leftSegmentLeastSquaresPoints[1]
        };
        const rightSegmentLeastSquaresPoints = leastSquaresFilter(rightSegmentInputPoints);
        const rightSegmentLeastSquaresLine: Line = {
            pointA: rightSegmentLeastSquaresPoints[0],
            pointB: rightSegmentLeastSquaresPoints[1]
        };

        // Расчитываем RMSE для обоих сегментов
        const leftRmse = calculateRmseByLineAndInputPoints(leftSegmentInputPoints, leftSegmentLeastSquaresLine);
        const rightRmse = calculateRmseByLineAndInputPoints(rightSegmentInputPoints, rightSegmentLeastSquaresLine);

        // Сравниваем с лучшим RMSE
        const currentRmse = leftRmse + rightRmse;
        console.log(`*** BEST RMSE - ${bestRmse} ***`)
        if (currentRmse < bestRmse) {
            bestRmse = currentRmse;
            bestIndex = windowIndex;
        }
    }

    return currentVertex;

        // Проверяем, не превышает ли лучший RMSE порог 0.085
        if (bestRmse > 0.085) {
            // Возвращаем вершину с нулевыми координатами, указывая на необходимость удаления
            return { x: 0, y: 0 };
        }

    // Возвращаем исходную вершину, если лучший RMSE не лучше исходного
    if (bestRmse >= initialRmse) {
        return currentVertex;
    } else {
        // Обновление положения общей вершины
        fullAreaPoints[commonVertexIndex].x = fullAreaPoints[bestIndex].x;
        return fullAreaPoints[bestIndex];
    }
}



function calculateRmseByLineAndInputPoints(inputPoints: IPoint[], line: Line): number {
    // Проверка, что есть хотя бы две точки для расчета RMSE
    if (inputPoints.length < 2) {
        throw new Error("Для расчета RMSE необходимо как минимум две точки.");
    }

    // Начальная и конечная точки линии
    const startPoint = line.pointA;
    const endPoint = line.pointB;

    // Рассчитываем наклон (slope) линии
    const slope = (endPoint.y - startPoint.y) / (endPoint.x - startPoint.x);

    // Функция для расчета значения y для заданного x на линии
    const calculateY = (x: number) => startPoint.y + slope * (x - startPoint.x);

    // Инициализация суммы квадратов разницы
    let sumOfSquares = 0;

    // Проходим по всем входным точкам и вычисляем RMSE
    inputPoints.forEach(point => {
        const yOnLine = calculateY(point.x); // Значение y на линии для данного x
        sumOfSquares += Math.pow(point.y - yOnLine, 2); // Квадрат разницы между фактическим и предсказанным значением y
    });

    // Вычисляем среднеквадратическую ошибку (MSE)
    const meanSquareError = sumOfSquares / inputPoints.length;

    // Возвращаем квадратный корень из MSE (RMSE)
    return Math.sqrt(meanSquareError);
}


