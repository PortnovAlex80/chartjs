import leastSquaresFilter from '../filters/leastSquaresFilter.js';
export class CubicPolynomialApproximation {
    constructor() {
        this.errorThreshold = 0.40; // Threshold for rude error 
        this.coefficients = []; // коэф полинома
        this.points = []; // входной набор данных
        this.approximatedPoints = []; // набор упорядоченных точек полинома
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
        return this.approximatedPoints;
    }
    findQualitySegments(inputPoints) {
        console.log(`findQualitySegments вызвана с ${inputPoints.length} точками`);
        let pointsCopy = [...inputPoints]; // Создаем копию массива точек
        this.points = inputPoints;
        this.removeDuplicatesAndSort();
        const threshold_rmse = 0.2;
        const threshold_diffRMSE = 0.015;
        let bestSegments = [];
        const minSegmentLength = 1.0; // Минимальная длина сегмента
        const calculateSegmentLength = (segment) => {
            if (segment.length < 2)
                return 0;
            const dx = segment[segment.length - 1].x - segment[0].x;
            const dy = segment[segment.length - 1].y - segment[0].y;
            return Math.sqrt(dx * dx + dy * dy);
        };
        let start = 0;
        while (start < pointsCopy.length - 1) {
            let end = start + 1;
            let lastValidSegment = null;
            // console.log(`Цикл первый`);
            // Наращиваем длину сегмента до минимально допустимой - пока отказался от этой стратегии
            // while (end < pointsCopy.length && calculateSegmentLength(pointsCopy.slice(start, end + 1)) < minSegmentLength) {
            //     end++;
            // }
            // Проверяем удовлетворяют ли условиям более длинные сегменты
            let cnt = 0;
            while (end < pointsCopy.length) {
                let segment = pointsCopy.slice(start, end + 1);
                // console.log(`Рассмотрение сегмента от ${segment[0].x} до ${segment[segment.length - 1].x}`);
                this.approximate(segment);
                // console.log(`Points for Least in segment: ${this.points}`)
                this.approximaredLeastSWPoints = this.generatePointsOnLeastSquaresLine();
                const polynomialRMSE = this.rmse;
                const lineRMSE = this.calculateRMSELeastSquaresWeighted();
                const diffRMSE = this.calculateAbsDiffRmse();
                // console.log(`Микросегмент`)
                // console.log(`Polynomial RMSE: ${polynomialRMSE}`);
                // console.log(`Line RMSE: ${lineRMSE}`);
                // console.log(`Difference RMSE: ${diffRMSE}`);
                // console.log(`cnt - ${cnt}`);
                let threshold_diffRMSE_current = threshold_diffRMSE;
                if (lineRMSE < (threshold_rmse / 2)) {
                    // Если lineRMSE меньше половины порога, удваиваем порог для diffRMSE
                    threshold_diffRMSE_current = (threshold_diffRMSE * 1.0);
                }
                // console.log(`в допуске? - ${(polynomialRMSE < threshold_rmse && lineRMSE < threshold_rmse && diffRMSE < threshold_diffRMSE )} `)
                if (polynomialRMSE < threshold_rmse && lineRMSE < threshold_rmse && diffRMSE < threshold_diffRMSE_current) {
                    lastValidSegment = segment;
                    this.points = lastValidSegment;
                    // console.log(`add ++ segment`)
                    // console.log(`valid segment - ${JSON.stringify(lastValidSegment)}`)
                    end++; // Продолжаем увеличивать сегмент
                }
                else {
                    // console.log(`Сегмент уже не в допуске - ${cnt}`);
                    // console.log(`Polynomial RMSE: ${polynomialRMSE}`);
                    // console.log(`Line RMSE: ${lineRMSE}`);
                    console.log(`Difference RMSE: ${diffRMSE}`);
                    // console.log(`cnt - ${cnt}`);
                    break; // Прерываем, если сегмент не удовлетворяет условиям
                }
                ++cnt;
            }
            if (lastValidSegment) {
                bestSegments.push(lastValidSegment);
                // console.log(`Найден подходящий сегмент от ${lastValidSegment[0].x} до ${lastValidSegment[lastValidSegment.length - 1].x}`);
                start = lastValidSegment.length + start - 1; // Обновляем start для следующего цикла
            }
            else {
                start++; // Если подходящий сегмент не найден, переходим к следующей точке
            }
            // console.log(`Spline rmse ${this.rmse}`)
        }
        let combinedSegments = [];
        bestSegments.forEach((segment, index) => {
            if (segment.length > 0) {
                // Добавляем первую точку сегмента, если она не совпадает с последней точкой предыдущего сегмента
                if (index === 0 || (combinedSegments[combinedSegments.length - 1].x !== segment[0].x || combinedSegments[combinedSegments.length - 1].y !== segment[0].y)) {
                    combinedSegments.push(segment[0]);
                }
                // Добавляем последнюю точку сегмента, если она отличается от первой
                if (segment.length > 1) {
                    combinedSegments.push(segment[segment.length - 1]);
                }
            }
        });
        // console.log(`Найдено подходящих сегментов: ${bestSegments.length}`);
        // Перебираем combinedSegments, пытаясь объединить сегменты
        // console.log(`Итоговый бест: ${JSON.stringify(bestSegments)}`);
        // console.log(`Итоговый сегмент: ${JSON.stringify(combinedSegments)}`);
        return combinedSegments;
    }
    logger() {
        this.approximaredLeastSWPoints = this.generatePointsOnLeastSquaresLine();
        const polynomialRMSE = this.calculateRMSE();
        const lineRMSE = this.calculateRMSELeastSquaresWeighted();
        const diffRMSE = this.calculateAbsDiffRmse();
        console.log(`Коэффициенты эффективности вписывания`);
        console.log(`Качество полинома RMSE - ${polynomialRMSE} ${polynomialRMSE < 0.075 ? "(высокое качество)" : "(ошибка вписывания)"}`);
        console.log(`Качество прямой RMSE - ${lineRMSE} ${lineRMSE < 0.075 ? "(высокое качество)" : "(ошибка вписывания)"}`);
        console.log(`Взаимное отклонение прямой и полинома RMSE - ${diffRMSE} ${diffRMSE < 0.075 ? "(высокое качество)" : "(ошибка вписывания)"}`);
    }
    calculateRMSE() {
        let sumOfSquares = this.points.reduce((sum, point, index) => {
            let approxPoint = this.approximatedPoints[index];
            let diff = point.y - approxPoint.y;
            return sum + diff * diff;
        }, 0);
        return Math.sqrt(sumOfSquares / this.points.length);
    }
    calculateAbsDiffRmse() {
        // Ensure that both sets of points are available
        if (!this.approximatedPoints || !this.approximaredLeastSWPoints) {
            throw new Error("Необходимо сначала сгенерировать оба набора точек.");
        }
        // Calculate the square of the differences
        const sumOfSquares = this.approximatedPoints.reduce((sum, point, index) => {
            const diff = point.y - this.approximaredLeastSWPoints[index].y;
            return sum + diff * diff;
        }, 0);
        // Calculate the RMSE
        return Math.sqrt(sumOfSquares / this.approximatedPoints.length);
    }
    calculateAbsDiff() {
        // First, calculate the least squares line
        const leastSquaresLine = this.approximaredLeastSWPoints;
        // Then, calculate the Y values on the cubic polynomial for each X value
        const polynomialYs = this.approximatedPoints.map(point => this.coefficients.reduce((sum, coeff, index) => sum + coeff * Math.pow(point.x, index), 0));
        // Finally, calculate the absolute differences
        const absDiffs = polynomialYs.map((polyY, index) => Math.abs(polyY - leastSquaresLine[index].y));
        return absDiffs;
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
        const linePoints = this.approximatedPoints.map(point => ({
            x: point.x,
            y: calculateY(point.x)
        }));
        return linePoints;
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
        this.approximatedPoints = x.map(xi => ({
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
    getY(x) {
        return this.coefficients.reduce((sum, coeff, index) => sum + coeff * Math.pow(x, index), 0);
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
    calculateExtremes(step) {
        const finePoints = this.fineCubePolynomialApproximation(step);
        let firstDerivatives = [];
        let secondDerivatives = [];
        // Вычисление первой производной
        for (let i = 1; i < finePoints.length; i++) {
            const dy = finePoints[i].y - finePoints[i - 1].y;
            const dx = finePoints[i].x - finePoints[i - 1].x;
            firstDerivatives.push(dy / dx);
        }
        // Вычисление второй производной
        for (let i = 1; i < firstDerivatives.length; i++) {
            const d2y = firstDerivatives[i] - firstDerivatives[i - 1];
            const dx = finePoints[i].x - finePoints[i - 1].x;
            secondDerivatives.push(d2y / dx);
        }
        // Находим экстремумы второй производной
        let extremes = [];
        for (let i = 1; i < secondDerivatives.length - 1; i++) {
            if (secondDerivatives[i] * secondDerivatives[i + 1] < 0) {
                // Экстремум найден при смене знака второй производной
                console.log(`Экстремум: x = ${finePoints[i].x}, y = ${finePoints[i].y}`);
                extremes.push(finePoints[i]);
            }
        }
        return extremes;
    }
    calculateFirstDerivativeExtremes(step) {
        const finePoints = this.fineCubePolynomialApproximation(step);
        if (finePoints.length < 2) {
            return []; // Недостаточно точек для вычисления производной
        }
        let firstDerivatives = [];
        // Вычисление первой производной
        for (let i = 1; i < finePoints.length; i++) {
            const dy = finePoints[i].y - finePoints[i - 1].y;
            const dx = finePoints[i].x - finePoints[i - 1].x;
            firstDerivatives.push(dy / dx);
        }
        // Находим точки, где первая производная меняет знак
        let extremes = [];
        for (let i = 1; i < firstDerivatives.length - 1; i++) {
            if (firstDerivatives[i] * firstDerivatives[i - 1] < 0) {
                extremes.push(finePoints[i]);
            }
        }
        return extremes;
    }
    calculateFirstDerivativeGraph(step) {
        const finePoints = this.fineCubePolynomialApproximation(step);
        if (finePoints.length < 2) {
            return []; // Недостаточно точек для вычисления производной
        }
        let firstDerivatives = [];
        // Вычисление первой производной
        for (let i = 1; i < finePoints.length; i++) {
            const dy = finePoints[i].y - finePoints[i - 1].y;
            const dx = finePoints[i].x - finePoints[i - 1].x;
            const derivativeValue = (dy / dx); //* 5 + 757;
            // Добавляем координату X и значение производной как Y
            firstDerivatives.push({ x: finePoints[i].x, y: derivativeValue });
        }
        return firstDerivatives;
    }
    calculateSecondDerivativeGraph(step) {
        const finePoints = this.fineCubePolynomialApproximation(step);
        if (finePoints.length < 3) {
            return []; // Недостаточно точек для вычисления второй производной
        }
        let firstDerivatives = [];
        let secondDerivatives = [];
        // Вычисление первой производной
        for (let i = 1; i < finePoints.length; i++) {
            const dy = finePoints[i].y - finePoints[i - 1].y;
            const dx = finePoints[i].x - finePoints[i - 1].x;
            firstDerivatives.push(dy / dx);
        }
        // Вычисление второй производной
        for (let i = 1; i < firstDerivatives.length; i++) {
            const d2y = firstDerivatives[i] - firstDerivatives[i - 1];
            const dx = finePoints[i].x - finePoints[i - 1].x;
            const secondDerivativeValue = (d2y / dx); //* 10 + 755;
            secondDerivatives.push({ x: finePoints[i].x, y: secondDerivativeValue });
        }
        return secondDerivatives;
    }
    removeDuplicatesAndSort() {
        this.points = this.points
            .filter((point, index, self) => index === self.findIndex(p => p.x === point.x && p.y === point.y))
            .sort((a, b) => a.x - b.x);
    }
    findRandomQualitySegments(inputPoints) {
        if (inputPoints.length === 0) {
            throw new Error("Массив точек не должен быть пустым.");
        }
        let pointsCopy = [...inputPoints];
        this.removeDuplicatesAndSort();
        const threshold_rmse = 0.2;
        const threshold_diffRMSE = 0.015;
        let remainingPoints = new Set(pointsCopy); // Используем Set для легкого исключения уже обработанных точек
        let bestSegments = [];
        console.log("START...");
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
            console.log(`Start random point  ${JSON.stringify(startPoint)}`);
            // Определяем индексы для исходного массива
            let start = pointsCopy.indexOf(startPoint);
            let end = start;
            let lastValidSegment = null;
            let isGrowingLeft = true;
            let isGrowingRight = true;
            // Расширяем сегмент влево и вправо, пока это возможно
            let innerwhilecnt = 100;
            while (isGrowingLeft || isGrowingRight) {
                if (innerwhilecnt < 0) {
                    console.log(`выход из внутреннего цикла`);
                    break;
                }
                ;
                innerwhilecnt--;
                if (isGrowingLeft && start > 0) {
                    start--;
                }
                else {
                    isGrowingLeft = false;
                }
                if (isGrowingRight && end < pointsCopy.length - 1) {
                    end++;
                }
                else {
                    isGrowingRight = false;
                }
                let segment = pointsCopy.slice(start, end + 1);
                this.approximate(segment);
                this.approximaredLeastSWPoints = this.generatePointsOnLeastSquaresLine();
                const polynomialRMSE = this.rmse;
                const lineRMSE = this.calculateRMSELeastSquaresWeighted();
                const diffRMSE = this.calculateAbsDiffRmse();
                let threshold_diffRMSE_current = lineRMSE < (threshold_rmse / 2) ? threshold_diffRMSE * 1.5 : threshold_diffRMSE;
                if (polynomialRMSE < threshold_rmse && lineRMSE < threshold_rmse && diffRMSE < threshold_diffRMSE_current) {
                    console.log(`Segment добавлен`);
                    lastValidSegment = segment;
                    isGrowingLeft = true;
                    isGrowingRight = true;
                }
                else {
                    // Уменьшаем сегмент обратно, так как последнее расширение было неудачным
                    if (isGrowingLeft)
                        start++;
                    if (isGrowingRight)
                        end--;
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
                // Добавляем первую точку сегмента
                combinedSegments.push(segment[0]);
                // Если это последний сегмент, добавляем также и последнюю точку
                if (index === bestSegments.length - 1) {
                    combinedSegments.push(segment[segment.length - 1]);
                }
            }
        });
        // Сортируем итоговые точки по координате X
        combinedSegments.sort((a, b) => a.x - b.x);
        return combinedSegments;
    }
}
