import leastSquaresFilter from '../filters/LeastSquaresFilter.js';
export class CubicPolynomialApproximation {
    constructor() {
        this.attempts = 3;
        this.coefficients = []; // коэф полинома
        this.points = []; // входной набор данных
        this.approximatedPolynomialPoints = []; // набор упорядоченных точек полинома
        this.approximaredLeastSWPoints = [];
        this.rmse = 1000;
    }
    approximate(points) {
        this.points = points;
        this.removeDuplicatesAndSort();
        if (points.length === 0) {
            throw new Error("Массив точек не должен быть пустым.");
        }
        this.performApproximation();
        return this.approximatedPolynomialPoints;
    }
    calculateRMSE() {
        let sumOfSquares = this.points.reduce((sum, point, index) => {
            let approxPoint = this.approximatedPolynomialPoints[index];
            let diff = point.y - approxPoint.y;
            return sum + diff * diff;
        }, 0);
        return Math.sqrt(sumOfSquares / this.points.length);
    }
    calculateAbsDiffRmse() {
        // Ensure that both sets of points are available
        if (!this.approximatedPolynomialPoints || !this.approximaredLeastSWPoints) {
            throw new Error("Необходимо сначала сгенерировать оба набора точек.");
        }
        // Calculate the square of the differences
        const sumOfSquares = this.approximatedPolynomialPoints.reduce((sum, point, index) => {
            const diff = point.y - this.approximaredLeastSWPoints[index].y;
            return sum + diff * diff;
        }, 0);
        // Calculate the RMSE
        return Math.sqrt(sumOfSquares / this.approximatedPolynomialPoints.length);
    }
    calculateRMSELeastSquaresWeighted() {
        const approximatedPoints = this.approximaredLeastSWPoints;
        let sumOfSquares = this.points.reduce((sum, point, index) => {
            let approxPoint = approximatedPoints[index];
            let diff = point.y - approxPoint.y;
            return sum + diff * diff;
        }, 0);
        return Math.sqrt(sumOfSquares / this.points.length);
    }
    generatePointsOnLeastSquaresLine() {
        // Get the start and end points of the least squares line
        // console.log(`Least filter got ${this.points.length}`)
        this.approximaredLeastSWPoints = leastSquaresFilter(this.points);
        if (this.approximaredLeastSWPoints.length < 2) {
            throw new Error("leastSquaresWeightedFilter did not return enough points.");
        }
        const startPoint = this.approximaredLeastSWPoints[0];
        const endPoint = this.approximaredLeastSWPoints[1];
        // Calculate the slope of the line
        const slope = (endPoint.y - startPoint.y) / (endPoint.x - startPoint.x);
        // Function to calculate y for a given x on the line
        const calculateY = (x) => startPoint.y + slope * (x - startPoint.x);
        // Generate points on the line using the x values from approximatedPoints
        const linePoints = this.approximatedPolynomialPoints.map(point => ({
            x: point.x,
            y: calculateY(point.x)
        }));
        return linePoints;
    }
    findRandomQualitySegments(inputPoints) {
        if (inputPoints.length === 0) {
            throw new Error("Массив точек не должен быть пустым.");
        }
        let pointsCopy = [...inputPoints];
        this.removeDuplicatesAndSort();
        const threshold_rmse = 0.08; // 0.2
        const threshold_diffRMSE = 0.015; // 0.015
        let remainingPoints = new Set(pointsCopy); // Используем Set для легкого исключения уже обработанных точек
        let bestSegments = [];
        let whilecnt = 100;
        while (remainingPoints.size > 0) {
            if (whilecnt < 0) {
                console.log(`выход из внешнего цикла`);
                break;
            }
            whilecnt--;
            // Выбираем случайную начальную точку из оставшихся
            let startIdx = Math.floor(Math.random() * remainingPoints.size);
            let startPoint = Array.from(remainingPoints)[startIdx];
            // Определяем индексы для исходного массива
            let start = pointsCopy.indexOf(startPoint);
            let end = start;
            let lastValidSegment = null;
            let isGrowingLeft = true;
            let isGrowingRight = true;
            // Расширяем сегмент влево и вправо, пока это возможно
            let innerwhilecnt = 100;
            let expandDirection = true; // true для расширения влево, false для расширения вправо
            while (isGrowingLeft || isGrowingRight) {
                if (innerwhilecnt < 0) {
                    break;
                }
                ;
                innerwhilecnt--;
                if (expandDirection && isGrowingLeft) {
                    if (start > 0) {
                        start--;
                    }
                    else {
                        // Если достигли левого края, переключаем направление
                        isGrowingLeft = false;
                        expandDirection = false;
                    }
                }
                if (!expandDirection && isGrowingRight) {
                    if (end < pointsCopy.length - 1) {
                        end++;
                    }
                    else {
                        // Если достигли правого края, переключаем направление
                        isGrowingRight = false;
                        expandDirection = true;
                    }
                }
                // Переключаем направление расширения на следующем шаге, если оба направления еще возможны
                if (isGrowingLeft || isGrowingRight) {
                    expandDirection = !expandDirection;
                }
                let segment = pointsCopy.slice(start, end + 1);
                this.approximate(segment);
                this.approximaredLeastSWPoints = this.generatePointsOnLeastSquaresLine();
                const polynomialRMSE = this.rmse;
                const lineRMSE = this.calculateRMSELeastSquaresWeighted();
                const diffRMSE = this.calculateAbsDiffRmse();
                // Применение робастной полиномиальной регрессии - попробовал, сработало хуже, поэтому удалил этот код.     
                // попробую дистанцию добавить
                let thresholdDistance = false;
                if (Math.abs(this.approximaredLeastSWPoints[this.approximaredLeastSWPoints.length - 1].y - segment[segment.length - 1].y) < 0.05) {
                    thresholdDistance = true;
                }
                ;
                ;
                let threshold_diffRMSE_current = lineRMSE < (threshold_rmse / 2) ? threshold_diffRMSE * 1.5 : threshold_diffRMSE;
                if (polynomialRMSE < threshold_rmse && lineRMSE < threshold_rmse && diffRMSE < threshold_diffRMSE_current && thresholdDistance) {
                    lastValidSegment = segment;
                    isGrowingLeft = expandDirection;
                    isGrowingRight = !expandDirection;
                }
                else {
                    // Уменьшаем сегмент обратно, так как последнее расширение было неудачным
                    if (expandDirection)
                        start++;
                    if (!expandDirection)
                        end--;
                    isGrowingLeft = false;
                    isGrowingRight = false;
                    break;
                }
            }
            if (lastValidSegment) {
                bestSegments.push(lastValidSegment);
                // Исключаем точки этого сегмента из дальнейшего рассмотрения
                lastValidSegment.forEach(point => remainingPoints.delete(point));
            }
            if (remainingPoints.size === pointsCopy.length) {
                // Если мы не смогли найти ни одного допустимого сегмента, прекращаем выполнение, чтобы избежать бесконечного цикла
                break;
            }
        }
        // Обработка полученных сегментов для получения итоговых точек
        let combinedSegments = [];
        bestSegments.forEach((segment, index) => {
            if (segment.length > 0) {
                combinedSegments.push(segment[0]);
                combinedSegments.push(segment[segment.length - 1]);
            }
        });
        // Сортируем итоговые точки по координате X
        combinedSegments.sort((a, b) => a.x - b.x); /// надо ли ?
        // Проверяем, достигнут ли желаемый результат
        if (combinedSegments.length === 0 && this.attempts > 0) {
            // Если результат пуст и есть еще попытки, вызываем функцию снова
            this.attempts--;
            return this.findRandomQualitySegments(inputPoints);
        }
        else {
            // Возвращаем результат, если он не пуст или закончились попытки
            return combinedSegments;
        }
    }
    performApproximation() {
        let x = this.points.map(p => p.x);
        let y = this.points.map(p => p.y);
        let A = new Array(4).fill(0).map(() => new Array(4).fill(0));
        let B = new Array(4).fill(0);
        for (let i = 0; i <= 3; i++) {
            for (let j = 0; j <= 3; j++) {
                A[i][j] = x.reduce((sum, xi) => sum + Math.pow(xi, i + j), 0);
            }
            B[i] = x.reduce((sum, xi, index) => sum + Math.pow(xi, i) * y[index], 0);
        }
        this.coefficients = this.solveLinearSystem(A, B);
        this.approximatedPolynomialPoints = x.map(xi => ({
            x: xi,
            y: this.coefficients.reduce((sum, coeff, index) => sum + coeff * Math.pow(xi, index), 0)
        }));
        this.rmse = this.calculateRMSE();
    }
    solveLinearSystem(A, B) {
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
                    }
                    else {
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
    removeDuplicatesAndSort() {
        this.points = this.points
            .filter((point, index, self) => index === self.findIndex(p => p.x === point.x && p.y === point.y))
            .sort((a, b) => a.x - b.x);
    }
    fineCubePolynomialApproximation(step) {
        if (this.coefficients.length === 0 || this.points.length === 0) {
            throw new Error("Коэффициенты полинома или набор точек не определены.");
        }
        const xMin = this.points[0].x; // Начальное значение X берется из первой точки исходных данных
        const xMax = this.points[this.points.length - 1].x; // Конечное значение X берется из последней точки исходных данных
        let finePoints = [];
        for (let x = xMin; x <= xMax; x += step) {
            const y = this.coefficients.reduce((sum, coeff, index) => sum + coeff * Math.pow(x, index), 0);
            finePoints.push({ x, y });
        }
        return finePoints;
    }
}
