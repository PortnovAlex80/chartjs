import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';
import { matrix, lup, lusolve } from 'mathjs';


/**
 * Функция для аппроксимации заданного набора точек полиномом заданной степени
 * методом наименьших квадратов. Эта аппроксимация используется для вычисления
 * линии, которая наилучшим образом соответствует набору точек. Вынес в класс для удобства работы.
 *
 * @param points Массив точек для аппроксимации.
 * @param degree Степень полинома для аппроксимации. По умолчанию равна 3 (кубический полином).
 * @return Массив аппроксимированных точек.
 * @throws Error Если массив точек пустой.
 */
const leastSquaresPolynomialApproximation: IFilter = (points: IPoint[], degree: number = 3): IPoint[] => {
    if (points.length === 0) {
        throw new Error("Массив точек не должен быть пустым.");
    }

    let x = points.map(p => p.x);
    let y = points.map(p => p.y);

    // Разделение точек на два сегмента примерно пополам
    const midpointIndex = Math.floor(points.length / 2);
    const x_knot = points[midpointIndex].x; // узловая точка

    // Разделяем точки на два сегмента
    const segment1 = points.slice(0, midpointIndex + 1);
    const segment2 = points.slice(midpointIndex);

    // Создаем матрицы A_data и B_data для первого полинома. оздание матрицы и вектора правых частей
    let A_data = new Array(degree + 1).fill(0).map(() => new Array(degree + 1).fill(0));
    let B_data = new Array(degree + 1).fill(0);
    for (let i = 0; i <= degree; i++) {
        for (let j = 0; j <= degree; j++) {
            A_data[i][j] = segment1.map(p => p.x).reduce((sum, xi) => sum + Math.pow(xi, i + j), 0);
        }
        B_data[i] = segment1.map(p => p.x).reduce((sum, xi, index) => sum + Math.pow(xi, i) * segment1[index].y, 0);
    }

    // Создаем матрицы A_data2 и B_data2 для второго полинома
    let A_data2 = new Array(degree + 1).fill(0).map(() => new Array(degree + 1).fill(0));
    let B_data2 = new Array(degree + 1).fill(0);
    for (let i = 0; i <= degree; i++) {
        for (let j = 0; j <= degree; j++) {
            A_data2[i][j] = segment2.map(p => p.x).reduce((sum, xi) => sum + Math.pow(xi, i + j), 0);
        }
        B_data2[i] = segment2.map(p => p.x).reduce((sum, xi, index) => sum + Math.pow(xi, i) * segment2[index].y, 0);
    }

    // Расширяем матрицы для дополнительных условий
    // let A_data_enhanced = new Array(2 * (degree + 1) + 4).fill(0).map(() => new Array(2 * (degree + 1) + 4).fill(0));
    // let B_data_enhanced = new Array(2 * (degree + 1) + 4).fill(0);

    let A_data_enhanced = new Array(2 * (degree + 1)).fill(0).map(() => new Array(2 * (degree + 1)).fill(0));
    let B_data_enhanced = new Array(2 * (degree + 1)).fill(0);

        // Заполнение матрицы A_data_enhanced данными из A_data и A_data2
        for (let i = 0; i <= degree; i++) {
            for (let j = 0; j <= degree; j++) {
                A_data_enhanced[i][j] = A_data[i][j];
                A_data_enhanced[i + degree + 1][j + degree + 1] = A_data2[i][j];
            }
            B_data_enhanced[i] = B_data[i];
            B_data_enhanced[degree + 1 + i] = B_data2[i];
        }

    // Дополнительные условия для равенства значений полиномов в узловой точке
    // for (let i = 0; i <= degree; i++) {
    //     A_data_enhanced[2 * (degree + 1)][i] = Math.pow(x_knot, i); // для первого полинома
    //     A_data_enhanced[2 * (degree + 1)][degree + 1 + i] = -Math.pow(x_knot, i); // для второго полинома
    // }

    // for (let i = 1; i <= degree; i++) {
    //     A_data_enhanced[2 * (degree + 1) + 2][i] = i * Math.pow(x_knot, i - 1); // первая производная первого полинома
    //     A_data_enhanced[2 * (degree + 1) + 2][degree + 1 + i] = -i * Math.pow(x_knot, i - 1); // первая производная второго полинома (с отрицательным знаком для равенства)
    // }

    // // Дополнительные условия для равенства вторых производных в узловой точке
    // for (let i = 2; i <= degree; i++) {
    //     A_data_enhanced[2 * (degree + 1) + 1][i] = i * (i - 1) * Math.pow(x_knot, i - 2); // для первого полинома
    //     A_data_enhanced[2 * (degree + 1) + 1][degree + 1 + i] = -i * (i - 1) * Math.pow(x_knot, i - 2); // для второго полинома
    // }

    // Преобразование в матрицы Math.js и решение системы уравнений
    let A_enhanced = matrix(A_data_enhanced);
    let B_enhanced = matrix(B_data_enhanced);
    let coefficients = lusolve(A_enhanced, B_enhanced).toArray().flat().map(val => typeof val === 'number' ? val : parseFloat(val.toString()));
    console.log("Coefficients:", coefficients);


    // Объединение коэффициентов в массив массивов
    let allCoefficients = [
        coefficients.slice(0, degree + 1), // Коэффициенты первого полинома
        coefficients.slice(degree + 1, 2 * (degree + 1)) // Коэффициенты второго полинома
    ];

    // Расчёт координат для всех точек
    const approximatedPoints = points.map(point => {
        let segmentIndex = point.x <= x_knot ? 0 : 1; // Определение индекса сегмента (0 или 1)
        let yValue = allCoefficients[segmentIndex].reduce((sum, coeff, index) => sum + coeff * Math.pow(point.x, index), 0);
        return { x: point.x, y: yValue };
    });


    return approximatedPoints;
};

export default leastSquaresPolynomialApproximation;

// const leastSquaresPolynomialApproximation: IFilter = (points: IPoint[], degree: number = 3): IPoint[] => {
//     if (points.length === 0) {
//         throw new Error("Массив точек не должен быть пустым.");
//     }

//     let x = points.map(p => p.x);
//     let y = points.map(p => p.y);

//     // Создание и заполнение матрицы и вектора правых частей
//     let A = new Array(degree + 1).fill(0).map(() => new Array(degree + 1).fill(0));
//     let B = new Array(degree + 1).fill(0);

//     for (let i = 0; i <= degree; i++) {
//         for (let j = 0; j <= degree; j++) {
//             A[i][j] = x.reduce((sum, xi) => sum + Math.pow(xi, i + j), 0);
//         }
//         B[i] = x.reduce((sum, xi, index) => sum + Math.pow(xi, i) * y[index], 0);
//     }

//     // Решение системы уравнений
//     let coefficients = solveLinearSystem(A, B);

//     // Создание аппроксимированных точек на основе коэффициентов
//     const approximatedPoints: IPoint[] = x.map(xi => ({
//         x: xi,
//         y: coefficients.reduce((sum, coeff, index) => sum + coeff * Math.pow(xi, index), 0)
//     }));

//     // console.log(`RMSE Polynomial- ${calculateRMSE (points, approximatedPoints)}`);
//     return approximatedPoints;
// };



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

function findMaxTurnPointOfCubicPolynomial(coefficients: number[]): IPoint | null {
    if (coefficients.length !== 4) {
        throw new Error("Должно быть ровно 4 коэффициента для кубического полинома.");
    }

    const [a0, a1, a2, a3] = coefficients;

    // Первая производная: 3a3*x^2 + 2a2*x + a1 = 0
    const a = 3 * a3;
    const b = 2 * a2;
    const c = a1;

    // Дискриминант
    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
        return null;
    } else {
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);

        let maxTurnAngle = 0;
        let maxTurnPoint: IPoint | null = null;

        [x1, x2].forEach(x => {
            if (!isNaN(x)) {
                // Вычисляем угол наклона в этой точке
                const slope = 3 * a3 * x * x + 2 * a2 * x + a1;
                const angle = Math.atan(Math.abs(slope));

                if (angle > maxTurnAngle) {
                    maxTurnAngle = angle;
                    maxTurnPoint = { x, y: a3 * x * x * x + a2 * x * x + a1 * x + a0 };
                }
            }
        });

        return maxTurnPoint;
    }
}


function calculateRMSE(originalPoints: IPoint[], approximatedPoints: IPoint[]): number {
    let sumOfSquares = originalPoints.reduce((sum, point, index) => {
        let approxPoint = approximatedPoints[index];
        let diff = point.y - approxPoint.y;
        return sum + diff * diff;
    }, 0);
    return Math.sqrt(sumOfSquares / originalPoints.length);
}


function calculatePolynomialSlopeAngle(coefficients: number[]): number {
    // Для простоты берём производную в точке x = 0 (коэффициент при x)
    let slope = coefficients.length > 1 ? coefficients[1] : 0;
    return Math.atan(slope) * (180 / Math.PI); // Угол в градусах
}


