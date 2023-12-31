import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';

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

    // Создание и заполнение матрицы и вектора правых частей
    let A = new Array(degree + 1).fill(0).map(() => new Array(degree + 1).fill(0));
    let B = new Array(degree + 1).fill(0);

    for (let i = 0; i <= degree; i++) {
        for (let j = 0; j <= degree; j++) {
            A[i][j] = x.reduce((sum, xi) => sum + Math.pow(xi, i + j), 0);
        }
        B[i] = x.reduce((sum, xi, index) => sum + Math.pow(xi, i) * y[index], 0);
    }

    // Решение системы уравнений
    let coefficients = solveLinearSystem(A, B);

    // Создание аппроксимированных точек на основе коэффициентов
    const approximatedPoints: IPoint[] = x.map(xi => ({
        x: xi,
        y: coefficients.reduce((sum, coeff, index) => sum + coeff * Math.pow(xi, index), 0)
    }));

    // console.log(`RMSE Polynomial- ${calculateRMSE (points, approximatedPoints)}`);
    return approximatedPoints;
};
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


export default leastSquaresPolynomialApproximation;