import { IPoint } from '../interfaces/IPoint';

// Определите интерфейс или тип для фильтра Савицкого-Голея
interface ISavitzkyGolayFilter {
    (points: IPoint[], windowSize: number, polynomialDegree: number): IPoint[];
}

// Реализация фильтра Савицкого-Голея
const savitzkyGolayFilter: ISavitzkyGolayFilter = (points, windowSize, polynomialDegree) => {
    // Проверьте, достаточно ли точек
    if (points.length < windowSize) {
        throw new Error("Недостаточно точек для применения фильтра.");
    }

    // Инициализируйте массив для хранения сглаженных точек
    let smoothedPoints: IPoint[] = [];

    // Пройдите по каждой точке с учетом скользящего окна
    for (let i = 0; i < points.length; i++) {
        // Определите границы окна
        let start = Math.max(i - Math.floor(windowSize / 2), 0);
        let end = Math.min(i + Math.floor(windowSize / 2), points.length - 1);

        // Выделите точки в текущем окне
        let windowPoints = points.slice(start, end + 1);

        // Вычислите веса для фильтра Савицкого-Голея
        let weights = calculateSavitzkyGolayWeights(windowSize, polynomialDegree);

        // Примените веса к точкам в окне
        let smoothedPoint = applyWeightsToWindow(windowPoints, weights);

        console.log(`Сглаженная точка для индекса ${i}:`, smoothedPoint);
        // Добавьте сглаженную точку в результат
        smoothedPoints.push(smoothedPoint);
    }

    return smoothedPoints;
};

// Функция для применения весов к точкам в окне
function applyWeightsToWindow(windowPoints: IPoint[], weights: number[]): IPoint {
    let sumX = 0;
    let sumY = 0;
    let weightSum = 0;

    // Применяем веса к каждой точке в окне
    for (let i = 0; i < windowPoints.length; i++) {
        const weight = i < weights.length ? weights[i] : 0; // Используем 0, если веса закончились
        sumX += windowPoints[i].x * weight;
        sumY += windowPoints[i].y * weight;
        weightSum += weight;
    }

    console.log("Точки окна:", windowPoints);
    console.log("Веса:", weights);

    if (weightSum === 0) {
        throw new Error("Сумма весов равна нулю");
    }

    // Нормализуем результат, чтобы избежать искажения из-за весов
    return { x: sumX / weightSum, y: sumY / weightSum };
}



function createSavitzkyGolayMatrix(windowSize: number, polynomialDegree: number): { A: number[][], B: number[] } {
    let A = new Array(polynomialDegree + 1);
    let B = new Array(polynomialDegree + 1).fill(0);

    for (let i = 0; i <= polynomialDegree; i++) {
        A[i] = new Array(polynomialDegree + 1).fill(0);
        for (let j = 0; j <= polynomialDegree; j++) {
            for (let k = 0; k < windowSize; k++) {
                A[i][j] += Math.pow(k - (windowSize - 1) / 2, i + j);
            }
        }
    }

    // Вектор B для сглаживания (0-я производная)
    B[0] = windowSize;
    for (let i = 1; i <= polynomialDegree; i++) {
        B[i] = 0;
    }

    return { A, B };
}

// Функция для вычисления весов фильтра Савицкого-Голея
// function calculateSavitzkyGolayWeights(windowSize: number, polynomialDegree: number): number[] {
//     // Создаем матрицу A и вектор B
//     const { A, B } = createSavitzkyGolayMatrix(windowSize, polynomialDegree);

//     console.log("Матрица A:", A);
//     console.log("Вектор B:", B);

//     // Решаем систему линейных уравнений Ax=B для получения коэффициентов
//     const coefficients = solveLinearSystemModified(A, B);
//     console.log("Коэффициенты (веса):", coefficients);
//     // Возвращаем коэффициенты в качестве весов
//     return coefficients;
// }

// Функция для вычисления весов фильтра Савицкого-Голея
function calculateSavitzkyGolayWeights(windowSize: number, polynomialDegree: number): number[] {
    // Проверяем, соответствуют ли параметры заданным значениям
    if (windowSize !== 15 || polynomialDegree !== 3) {
        throw new Error("Неподдерживаемые параметры фильтра.");
    }

    // Возвращаем заранее определенные веса для окна в 15 точек и полинома 3 степени
    return [-78, -13, 42, 87, 122, 147, 162, 167, 162, 147, 122, 87, 42, -13, -78];
}



// Функция для решения системы линейных уравнений методом Гаусса
function solveLinearSystemModified(A: number[][], B: number[]): number[] {
    let n = B.length;
    let A_copy = A.map(row => [...row]);
    let B_copy = [...B];

    for (let i = 0; i < n; i++) {
        // Поиск максимального элемента в текущем столбце для избежания деления на малое число
        let max = Math.abs(A_copy[i][i]);
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(A_copy[k][i]) > max) {
                max = Math.abs(A_copy[k][i]);
                maxRow = k;
            }
        }

        // Меняем строки местами, если нашли более подходящую
        if (maxRow !== i) {
            [A_copy[maxRow], A_copy[i]] = [A_copy[i], A_copy[maxRow]];
            [B_copy[maxRow], B_copy[i]] = [B_copy[i], B_copy[maxRow]];
        }

        // Обработка случая, когда элемент на диагонали слишком мал
        if (Math.abs(A_copy[i][i]) <= 1e-10) {
            throw new Error("Система уравнений не имеет уникального решения");
        }

        // Преобразование всех строк ниже текущей
        for (let k = i + 1; k < n; k++) {
            let c = -A_copy[k][i] / A_copy[i][i];
            for (let j = i; j < n; j++) {
                if (i === j) {
                    A_copy[k][j] = 0;
                } else {
                    A_copy[k][j] += c * A_copy[i][j];
                }
            }
            B_copy[k] += c * B_copy[i];
        }
    }

    // Решение Ax=B для верхней треугольной матрицы A
    let x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = B_copy[i] / A_copy[i][i];
        for (let k = i - 1; k >= 0; k--) {
            B_copy[k] -= A_copy[k][i] * x[i];
        }
    }

    return x;
}

// Функция для решения системы линейных уравнений методом Гаусса
function solveLinearSystem(A: number[][], B: number[]): number[] {
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
export default savitzkyGolayFilter;
