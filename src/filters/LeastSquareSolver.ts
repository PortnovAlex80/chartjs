import { matrix, multiply, transpose, inv , pinv} from 'mathjs';
import { IPoint } from '../interfaces/IPoint';
import { IFilter } from '../interfaces/IFilter';


/**
 * Функция для аппроксимации заданного набора точек полиномом заданной степени
 * методом наименьших квадратов.
 *
 * @param points Массив точек для аппроксимации.
 * @param degree Степень полинома для аппроксимации.
 * @return Массив аппроксимированных точек.
 */
const leastSquareSolver: IFilter = (points: IPoint[], degree: number = 3): IPoint[] => {
    if (points.length === 0) {
        throw new Error("Массив точек не должен быть пустым.");
    }

    // Определение узловой точки
    const midpointIndex = Math.floor(points.length / 2);
    const x_knot = points[midpointIndex].x;

    // Разделение точек на два сегмента
    const segment1 = points.slice(0, midpointIndex + 1);
    const segment2 = points.slice(midpointIndex);

    // Создание матрицы A_data и вектора B_data для первого полинома
    let A_data = new Array(degree + 1).fill(0).map(() => new Array(degree + 1).fill(0));
    let B_data = new Array(degree + 1).fill(0);
    for (let i = 0; i <= degree; i++) {
        for (let j = 0; j <= degree; j++) {
            A_data[i][j] = segment1.map(p => p.x).reduce((sum, xi) => sum + Math.pow(xi, i + j), 0);
        }
        B_data[i] = segment1.map(p => p.x).reduce((sum, xi, index) => sum + Math.pow(xi, i) * segment1[index].y, 0);
    }

    // Создание матрицы A_data2 и вектора B_data2 для второго полинома
    let A_data2 = new Array(degree + 1).fill(0).map(() => new Array(degree + 1).fill(0));
    let B_data2 = new Array(degree + 1).fill(0);
    for (let i = 0; i <= degree; i++) {
        for (let j = 0; j <= degree; j++) {
            A_data2[i][j] = segment2.map(p => p.x).reduce((sum, xi) => sum + Math.pow(xi, i + j), 0);
        }
        B_data2[i] = segment2.map(p => p.x).reduce((sum, xi, index) => sum + Math.pow(xi, i) * segment2[index].y, 0);
    }

    // Расширение матриц для дополнительных условий
    const extendedDegree = 2 * (degree + 1) + 4;
    let A_data_enhanced = new Array(extendedDegree).fill(0).map(() => new Array(extendedDegree).fill(0));
    let B_data_enhanced = new Array(extendedDegree).fill(0);

    // Заполнение матриц A_data_enhanced данными из A_data и A_data2
    for (let i = 0; i <= degree; i++) {
        for (let j = 0; j <= degree; j++) {
            A_data_enhanced[i][j] = A_data[i][j];
            A_data_enhanced[i + degree + 1][j + degree + 1] = A_data2[i][j];
        }
        B_data_enhanced[i] = B_data[i];
        B_data_enhanced[degree + 1 + i] = B_data2[i];
    }

    // Дополнительные условия для равенства значений полиномов в узловой точке
    for (let i = 0; i <= degree; i++) {
        A_data_enhanced[extendedDegree - 2][i] = Math.pow(x_knot, i); // для первого полинома
        A_data_enhanced[extendedDegree - 2][degree + 1 + i] = -Math.pow(x_knot, i); // для второго полинома
    }
    // Дополнение вектора B для дополнительных условий
    for (let i = 2 * (degree + 1); i < extendedDegree; i++) {
        B_data_enhanced[i] = 0; // Установка нулевых значений для дополнительных условий
    }


    // Преобразование в матрицы Math.js и решение системы уравнений
    const A_enhanced = matrix(A_data_enhanced);
    const B_enhanced = matrix(B_data_enhanced);

    // Транспонирование матрицы A
    const At = transpose(A_enhanced);

    // Вычисление At * A
    const AtA = multiply(At, A_enhanced);

    // // Вычисление обратной матрицы (At * A)^(-1)
    // const AtA_inv = inv(AtA);

    // Вычисление псевдообратной матрицы (At * A)^(-1)
    const AtA_inv = pinv(AtA);

    // Вычисление (At * A)^(-1) * At
    const pseudoInverse = multiply(AtA_inv, At);
    

    // Вычисление итогового результата: (At * A)^(-1) * At * B
    const result = multiply(pseudoInverse, B_enhanced);

    // Вычисление коэффициентов полинома
    const coefficients = result.toArray() as number[];


    const approximatedPoints: IPoint[] = points.map((point, index) => ({
        x: point.x,
        y: coefficients.reduce((sum, coeff, power) => sum + coeff * Math.pow(point.x, power), 0)
    }));
    
    return approximatedPoints;

};

export default leastSquareSolver;

