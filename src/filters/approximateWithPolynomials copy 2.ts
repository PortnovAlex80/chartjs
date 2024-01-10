import { IPoint } from "../interfaces/IPoint";
// работает но для одного сегмента в рамках одного окна
export default function approximateWithPolynomials(inputData: IPoint[], windowSize: number = 11, degree: number = 7): IPoint[] {
    // Разбиение на сегменты с перекрывающимися точками
    let segments: IPoint[][] = [];
    for (let i = 0; i < inputData.length; i += windowSize) {
        // Убедимся, что последняя точка текущего сегмента является первой точкой следующего сегмента
        let end = Math.min(i + windowSize, inputData.length);
        if (end < inputData.length) {
            end++;
        }
        segments.push(inputData.slice(i, end));
    }

    // Общие матрицы для системы уравнений
    let A: number[][] = [];
    let B: number[] = [];

    // Добавление уравнений каждого сегмента в общую систему
    segments.forEach((segment, index) => {
        let segmentA = createPolynomialCoefficientsEquations(segment, degree);
        let segmentB = generateBVector(segment, degree);

        A.push(...segmentA);
        B.push(...segmentB);

    //     // Для всех сегментов, кроме последнего, добавляем уравнения для гладкости

    // if (index < segments.length - 1) {
    //     let smoothnessEquations = createSmoothnessEquations(segments[index], segments[index + 1], degree);
    //     A.push(...smoothnessEquations);
    //     B.push(...new Array(smoothnessEquations.length).fill(0));
    // }

    });

    // Решение общей системы уравнений
    let coefficients = solvePolynomialApproximation(A, B);
    console.log(`Coefficients: ${coefficients}`);

    // Генерация точек сплайна на основе всех коэффициентов
    return generateSplinePoints(coefficients, segments, 0.1);
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

function createSmoothnessEquations(segment1: IPoint[], segment2: IPoint[], degree: number): number[][] {
    let equations: number[][] = [];
    const x = segment1[segment1.length - 1].x; // Конец первого сегмента и начало второго

    let firstDerivativeEq1: number[] = [];
    let firstDerivativeEq2: number[] = [];

    // Коэффициенты первой производной для последней точки первого сегмента
    for (let j = 1; j <= degree; j++) {
        firstDerivativeEq1.push(j * Math.pow(x, j - 1));
    }
    // Дополняем нулями, так как эти коэффициенты относятся только к первому сегменту
    firstDerivativeEq1.push(...new Array(degree).fill(0));

    // Коэффициенты первой производной для первой точки второго сегмента
    for (let j = 1; j <= degree; j++) {
        firstDerivativeEq2.push(-j * Math.pow(x, j - 1));
    }
    // Дополняем нулями, так как эти коэффициенты относятся только ко второму сегменту
    firstDerivativeEq2.unshift(...new Array(degree).fill(0));

    // Объединяем оба уравнения в одно
    let smoothnessEquation = firstDerivativeEq1.concat(firstDerivativeEq2);
    equations.push(smoothnessEquation);

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

