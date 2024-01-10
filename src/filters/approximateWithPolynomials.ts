// рабочий экземпляр который вписывает одиночные сплайны но они между
import { IPoint } from "../interfaces/IPoint";

export default function approximateWithPolynomials(inputData: IPoint[], windowSize: number = 50, degree: number = 6): IPoint[] {
    // Разбиение на сегменты
    let segments: IPoint[][] = [];
    for (let i = 0; i < inputData.length; i += windowSize) {
        segments.push(inputData.slice(i, Math.min(i + windowSize, inputData.length)));
    }

    let allCoefficients: number[] = [];

    segments.forEach(segment => {
        // Создание системы уравнений для текущего сегмента
        let A: number[][] = createPolynomialCoefficientsEquations(segment, degree);
        let B: number[] = generateBVector(segment, degree);

        // Решение системы уравнений для текущего сегмента
        let segmentCoefficients = solvePolynomialApproximation(A, B);
        console.log(`SegmentCoefficients: ${segmentCoefficients}`);

        // Добавление коэффициентов в общий массив
        allCoefficients.push(...segmentCoefficients);
    });

    // Генерация точек сплайна на основе всех коэффициентов
    return generateSplinePoints(allCoefficients, segments, 0.01);
}

// Реализация дополнительных функций...

function createPolynomialCoefficientsEquations(segment: IPoint[], degree: number): number[][] {
    let A = new Array(degree + 1).fill(0).map(() => new Array(degree + 1).fill(0));
    let x = segment.map(p => p.x);
    let y = segment.map(p => p.y);

    for (let i = 0; i <= degree; i++) {
        for (let j = 0; j <= degree; j++) {
            A[i][j] = x.reduce((sum, xi) => sum + Math.pow(xi, i + j), 0);
        }
    }

    return A;
}

function generateBVector(segment: IPoint[], degree: number): number[] {
    let B = new Array(degree + 1).fill(0);
    let x = segment.map(p => p.x);
    let y = segment.map(p => p.y);

    for (let i = 0; i <= degree; i++) {
        B[i] = x.reduce((sum, xi, index) => sum + Math.pow(xi, i) * y[index], 0);
    }

    return B;
}

function createSmoothnessEquations(segments: IPoint[][], degree: number): number[][] {
    let equations: number[][] = [];

    for (let i = 0; i < segments.length - 1; i++) {
        const x = segments[i][segments[i].length - 1].x; // Конец текущего сегмента
        let firstDerivativeEq: number[] = [];
        let secondDerivativeEq: number[] = [];

        for (let j = 0; j <= degree; j++) {
            // Добавляем коэффициенты первой производной для i-го сегмента
            firstDerivativeEq.push(j * Math.pow(x, j - 1));

            // Добавляем коэффициенты второй производной для i-го сегмента
            secondDerivativeEq.push(j * (j - 1) * Math.pow(x, j - 2));
        }

        for (let j = 0; j <= degree; j++) {
            // Добавляем коэффициенты первой производной для (i+1)-го сегмента с обратным знаком
            firstDerivativeEq.push(-j * Math.pow(x, j - 1));

            // Добавляем коэффициенты второй производной для (i+1)-го сегмента с обратным знаком
            secondDerivativeEq.push(-j * (j - 1) * Math.pow(x, j - 2));
        }

        equations.push(firstDerivativeEq);
        equations.push(secondDerivativeEq);
    }

    return equations;
}

// Функция для решения системы линейных уравнений методом Гаусса
function solvePolynomialApproximation(A: number[][], B: number[]): number[] {
    let n = B.length;

    for (let i = 0; i < n; i++) {
        // Поиск максимального элемента в текущем столбце
        let maxEl = Math.abs(A[i][i]);
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > maxEl) {
                maxEl = Math.abs(A[k][i]);
                maxRow = k;
            }
        }

        // Своп текущей строки с максимальной строкой в столбце
        for (let k = i; k < n; k++) {
            let tmp = A[maxRow][k];
            A[maxRow][k] = A[i][k];
            A[i][k] = tmp;
        }
        let tmp = B[maxRow];
        B[maxRow] = B[i];
        B[i] = tmp;

        // Преобразование всех строк ниже текущей
        for (let k = i + 1; k < n; k++) {
            let c = -A[k][i] / A[i][i];
            for (let j = i; j < n; j++) {
                if (i === j) {
                    A[k][j] = 0;
                } else {
                    A[k][j] += c * A[i][j];
                }
            }
            B[k] += c * B[i];
        }
    }

    // Решение Ax=B для верхней треугольной матрицы A
    let x = new Array(n).fill(0);
    for (let i = n - 1; i > -1; i--) {
        x[i] = B[i] / A[i][i];
        for (let k = i - 1; k > -1; k--) {
            B[k] -= A[k][i] * x[i];
        }
    }
    return x;
}

function generateSplinePoints(coefficients: number[], segments: IPoint[][], dx: number): IPoint[] {
    let splinePoints: IPoint[] = [];
    let degree = coefficients.length / segments.length - 1;

    let coeffIndex = 0; // Индекс для отслеживания текущего набора коэффициентов

    for (let i = 0; i < segments.length; i++) {
        // Извлечение коэффициентов для текущего сегмента
        let segmentCoeffs = coefficients.slice(coeffIndex, coeffIndex + degree + 1);
        coeffIndex += degree + 1;

        // Определение диапазона x для текущего сегмента
        let startX = segments[i][0].x;
        let endX = segments[i][segments[i].length - 1].x;

        // Генерация точек для текущего сегмента
        for (let x = startX; x <= endX; x += dx) {
            let y = 0;
            for (let j = 0; j <= degree; j++) {
                y += segmentCoeffs[j] * Math.pow(x, j);
            }
            splinePoints.push({ x, y });
        }
    }

    return splinePoints;
}




// import { IPoint } from "../interfaces/IPoint";

// export default function approximateWithPolynomials(inputData: IPoint[], windowSize: number = 19, degree: number = 3): IPoint[] {
//     let segments: IPoint[][] = [];
//     for (let i = 0; i < inputData.length; i += windowSize) {
//         let end = Math.min(i + windowSize, inputData.length);
//         segments.push(inputData.slice(i, end));
//     }

//     let allCoefficients: number[][] = [];

//     segments.forEach(segment => {
//         let segmentA = createPolynomialCoefficientsEquations(segment, degree);
//         let segmentB = generateBVector(segment, degree);
//         let segmentCoefficients = solvePolynomialApproximation(segmentA, segmentB);
//         allCoefficients.push(segmentCoefficients);
//     });

//     // Согласование коэффициентов на границах сегментов
//     adjustCoefficientsForSmoothness(allCoefficients, segments, degree);

//     // Генерация точек сплайна на основе скорректированных коэффициентов
//     return generateSplinePoints(allCoefficients, segments, 0.1);
// }

// // Реализация дополнительных функций...
// function adjustCoefficientsForSmoothness(allCoefficients: number[][], segments: IPoint[][], degree: number): void {
//     for (let i = 0; i < segments.length - 1; i++) {
//         let endX = segments[i][segments[i].length - 1].x;
//         let startY = evaluatePolynomial(allCoefficients[i], endX);
//         let startDerivative = evaluatePolynomialDerivative(allCoefficients[i], endX, degree);

//         // Корректировка коэффициентов следующего сегмента
//         // Например, можно корректировать свободный член и коэффициент при x
//         // Это лишь пример, реальная корректировка может быть сложнее и зависеть от специфики задачи
//         allCoefficients[i + 1][0] = startY - evaluatePolynomial(allCoefficients[i + 1], segments[i + 1][0].x);
//         allCoefficients[i + 1][1] = startDerivative - evaluatePolynomialDerivative(allCoefficients[i + 1], segments[i + 1][0].x, degree);
//     }
// }

// function evaluatePolynomial(coefficients: number[], x: number): number {
//     return coefficients.reduce((acc, coeff, index) => acc + coeff * Math.pow(x, index), 0);
// }

// function evaluatePolynomialDerivative(coefficients: number[], x: number, degree: number): number {
//     let derivative = 0;
//     for (let i = 1; i <= degree; i++) {
//         derivative += i * coefficients[i] * Math.pow(x, i - 1);
//     }
//     return derivative;
// }


// function createPolynomialCoefficientsEquations(segment: IPoint[], degree: number): number[][] {
//     let A = new Array(degree + 1).fill(0).map(() => new Array(degree + 1).fill(0));
//     let x = segment.map(p => p.x);
//     let y = segment.map(p => p.y);

//     for (let i = 0; i <= degree; i++) {
//         for (let j = 0; j <= degree; j++) {
//             A[i][j] = x.reduce((sum, xi) => sum + Math.pow(xi, i + j), 0);
//         }
//     }

//     return A;
// }

// function generateBVector(segment: IPoint[], degree: number): number[] {
//     let B = new Array(degree + 1).fill(0);
//     let x = segment.map(p => p.x);
//     let y = segment.map(p => p.y);

//     for (let i = 0; i <= degree; i++) {
//         B[i] = x.reduce((sum, xi, index) => sum + Math.pow(xi, i) * y[index], 0);
//     }

//     return B;
// }

// function createSmoothnessEquations(segment1: IPoint[], segment2: IPoint[], degree: number): number[][] {
//     let equations: number[][] = [];
//     const x = segment1[segment1.length - 1].x; // Конец первого сегмента и начало второго

//     let firstDerivativeEq1: number[] = [];
//     let firstDerivativeEq2: number[] = [];

//     // Коэффициенты первой производной для последней точки первого сегмента
//     for (let j = 1; j <= degree; j++) {
//         firstDerivativeEq1.push(j * Math.pow(x, j - 1));
//     }
//     // Дополняем нулями, так как эти коэффициенты относятся только к первому сегменту
//     firstDerivativeEq1.push(...new Array(degree).fill(0));

//     // Коэффициенты первой производной для первой точки второго сегмента
//     for (let j = 1; j <= degree; j++) {
//         firstDerivativeEq2.push(-j * Math.pow(x, j - 1));
//     }
//     // Дополняем нулями, так как эти коэффициенты относятся только ко второму сегменту
//     firstDerivativeEq2.unshift(...new Array(degree).fill(0));

//     // Объединяем оба уравнения в одно
//     let smoothnessEquation = firstDerivativeEq1.concat(firstDerivativeEq2);
//     equations.push(smoothnessEquation);

//     return equations;
// }


// // Функция для решения системы линейных уравнений методом Гаусса
// function solvePolynomialApproximation(A: number[][], B: number[]): number[] {
//     let n = B.length;

//     for (let i = 0; i < n; i++) {
//         // Поиск максимального элемента в текущем столбце
//         let maxEl = Math.abs(A[i][i]);
//         let maxRow = i;
//         for (let k = i + 1; k < n; k++) {
//             if (Math.abs(A[k][i]) > maxEl) {
//                 maxEl = Math.abs(A[k][i]);
//                 maxRow = k;
//             }
//         }

//         // Своп текущей строки с максимальной строкой в столбце
//         for (let k = i; k < n; k++) {
//             let tmp = A[maxRow][k];
//             A[maxRow][k] = A[i][k];
//             A[i][k] = tmp;
//         }
//         let tmp = B[maxRow];
//         B[maxRow] = B[i];
//         B[i] = tmp;

//         // Преобразование всех строк ниже текущей
//         for (let k = i + 1; k < n; k++) {
//             let c = -A[k][i] / A[i][i];
//             for (let j = i; j < n; j++) {
//                 if (i === j) {
//                     A[k][j] = 0;
//                 } else {
//                     A[k][j] += c * A[i][j];
//                 }
//             }
//             B[k] += c * B[i];
//         }
//     }

//     // Решение Ax=B для верхней треугольной матрицы A
//     let x = new Array(n).fill(0);
//     for (let i = n - 1; i > -1; i--) {
//         x[i] = B[i] / A[i][i];
//         for (let k = i - 1; k > -1; k--) {
//             B[k] -= A[k][i] * x[i];
//         }
//     }
//     return x;
// }

// function generateSplinePoints(allCoefficients: number[][], segments: IPoint[][], dx: number): IPoint[] {
//     let splinePoints: IPoint[] = [];

//     for (let i = 0; i < segments.length; i++) {
//         let segmentCoeffs = allCoefficients[i];
//         let startX = segments[i][0].x;
//         let endX = segments[i][segments[i].length - 1].x;

//         for (let x = startX; x <= endX; x += dx) {
//             let y = 0;
//             for (let j = 0; j < segmentCoeffs.length; j++) {
//                 y += segmentCoeffs[j] * Math.pow(x, j);
//             }
//             splinePoints.push({ x, y });
//         }
//     }

//     return splinePoints;
// }


