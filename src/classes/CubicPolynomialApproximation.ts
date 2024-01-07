import leastSquaresFilter from '../filters/leastSquaresFilter.js';
import { IPoint } from '../interfaces/IPoint';

export class CubicPolynomialApproximation {
    private coefficients: number[];
    private points: IPoint[];
    private approximatedPoints: IPoint[];
    private errorThreshold = 0.40; // Threshold for rude error 
    private approximaredLeastSWPoints: IPoint[];

    constructor() {
        this.coefficients = []; // коэф полинома
        this.points = []; // входной набор данных
        this.approximatedPoints = []; // набор упорядоченных точек полинома
        this.approximaredLeastSWPoints = [];
    }

    approximate(points: IPoint[]): IPoint[] {
               
        this.points = points;
        this.removeDuplicatesAndSort()
        
        if (points.length === 0) {
            throw new Error("Массив точек не должен быть пустым.");
        }

        this.performApproximation();       

    return this.approximatedPoints;
    }

    findQualitySegments(inputPoints: IPoint[]): IPoint[] {
        console.log(`findQualitySegments вызвана с ${inputPoints.length} точками`);
        let pointsCopy = [...inputPoints];// Создаем копию массива точек
        this.points = inputPoints;
        this.removeDuplicatesAndSort();
    
        let bestSegments: IPoint[][] = [];
        const minSegmentLength = 0.20; // Минимальная длина сегмента
    
        const calculateSegmentLength = (segment: IPoint[]): number => {
            if (segment.length < 2) return 0;
            const dx = segment[segment.length - 1].x - segment[0].x;
            const dy = segment[segment.length - 1].y - segment[0].y;
            return Math.sqrt(dx * dx + dy * dy);
        };
    
        let start = 0;
        while (start < pointsCopy.length - 1) {
            let end = start + 1;
            let lastValidSegment = null;
            // console.log(`Цикл первый`);
    
            // Наращиваем длину сегмента до минимально допустимой
            while (end < pointsCopy.length && calculateSegmentLength(pointsCopy.slice(start, end + 1)) < minSegmentLength) {
                end++;
            }
    
            // Проверяем удовлетворяют ли условиям более длинные сегменты
            while (end < pointsCopy.length) {
                let segment = pointsCopy.slice(start, end + 1);
                // console.log(`Рассмотрение сегмента от ${segment[0].x} до ${segment[segment.length - 1].x}`);
    
                this.approximate(segment);
                // console.log(`Points for Least in segment: ${this.points}`)
                this.approximaredLeastSWPoints = this.generatePointsOnLeastSquaresLine();
                const polynomialRMSE = this.calculateRMSE();
                const lineRMSE = this.calculateRMSELeastSquaresWeighted();
                const diffRMSE = this.calculateAbsDiffRmse();

        //         // Расчет производной в последней точке сегмента
        // const derivativeAtEnd = this.calculateApproximateDerivative();
        // console.log(`Расчет производной в последней точке сегмента - ${derivativeAtEnd}`)
        // && Math.abs(derivativeAtEnd) < threshold_rmse

                const threshold_rmse = 0.055
                if (polynomialRMSE < threshold_rmse && lineRMSE < threshold_rmse && diffRMSE < 0.005 )  {
                    lastValidSegment = segment;
                    this.points = lastValidSegment;
                    end++; // Продолжаем увеличивать сегмент
                } else {
       
                    break; // Прерываем, если сегмент не удовлетворяет условиям
                }
            }
    
            if (lastValidSegment) {
                bestSegments.push(lastValidSegment);
                // console.log(`Найден подходящий сегмент от ${lastValidSegment[0].x} до ${lastValidSegment[lastValidSegment.length - 1].x}`);
                start = lastValidSegment.length + start - 1; // Обновляем start для следующего цикла
            } else {
                start++; // Если подходящий сегмент не найден, переходим к следующей точке
            }
        }
    
        let combinedSegments: IPoint[] = [];
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
        
        
        console.log(`Найдено подходящих сегментов: ${bestSegments.length}`);
        return combinedSegments;
    
    }
    

    // Метод для расчета приближенной производной
    calculateApproximateDerivative(): number {
        const segment = this.fineCubePolynomialApproximation(0.1);

    console.log(`segmetn der - ${segment.length}`)
        if (segment.length < 2) {

            return 1;
            throw new Error("Для расчета производной нужно как минимум две точки.");
        }
        const lastPoint = segment[segment.length - 1];
        const secondLastPoint = segment[segment.length - 2];
        const dy = lastPoint.y - secondLastPoint.y;
        const dx = lastPoint.x - secondLastPoint.x;

        if (dx === 0) {
            throw new Error("Горизонтальное расстояние между точками равно нулю.");
        }

        return dy / dx;
    }

    cleanPointsFromOutliers(originalPoints: IPoint[]): IPoint[] {
        let cleanedPoints: IPoint[] = [];
        let start = 0;
        const segmentLength: number = 2;

        while (start < originalPoints.length) {
            // Определяем конец текущего сегмента
            let end = start;
            while (end < originalPoints.length && this.calculateSegmentLength(originalPoints.slice(start, end + 1)) < segmentLength) {
                end++;
            }

            // Выбираем сегмент для аппроксимации
            let segment = originalPoints.slice(start, end + 1);
            this.approximate(segment);

            // Идентификация и удаление выбросов
            let highErrorPoints = this.identifyHighErrorPoints();
            cleanedPoints.push(...segment.filter(p => !highErrorPoints.includes(p)));

            start = end + 1;
        }

        return cleanedPoints;
    }

    calculateR2(): number {
        const yActual = this.points.map(p => p.y);
        const yMean = yActual.reduce((a, b) => a + b, 0) / yActual.length;
        const yPredicted = this.approximatedPoints.map(p => p.y);

        const totalSumOfSquares = yActual.reduce((sum, yi) => sum + Math.pow((yi - yMean), 2), 0);
        const residualSumOfSquares = yActual.reduce((sum, yi, index) => sum + Math.pow((yi - yPredicted[index]), 2), 0);

        const rSquared = 1 - (residualSumOfSquares / totalSumOfSquares);

        return rSquared;
    }
    
    private calculateSegmentLength(segment: IPoint[]): number {
        const calculateSegmentLength = (segment: IPoint[]): number => {
            if (segment.length < 2) return 0;
            const dx = segment[segment.length - 1].x - segment[0].x;
            const dy = segment[segment.length - 1].y - segment[0].y;
            return Math.sqrt(dx * dx + dy * dy);
        };
        return calculateSegmentLength(segment);
    }
    
    logger(): void {
        this.approximaredLeastSWPoints = this.generatePointsOnLeastSquaresLine();
    
        const polynomialRMSE = this.calculateRMSE();
        const lineRMSE = this.calculateRMSELeastSquaresWeighted();
        const diffRMSE = this.calculateAbsDiffRmse();
    
        console.log(`Коэффициенты эффективности вписывания`);
    
        console.log(`Качество полинома RMSE - ${polynomialRMSE} ${polynomialRMSE < 0.075 ? "(высокое качество)" : "(ошибка вписывания)"}`);
        console.log(`Качество прямой RMSE - ${lineRMSE} ${lineRMSE < 0.075 ? "(высокое качество)" : "(ошибка вписывания)"}`);
        console.log(`Взаимное отклонение прямой и полинома RMSE - ${diffRMSE} ${diffRMSE < 0.075 ? "(высокое качество)" : "(ошибка вписывания)"}`);
    }
    
    calculateRMSE(): number {
        let sumOfSquares = this.points.reduce((sum, point, index) => {
            let approxPoint = this.approximatedPoints[index];
            let diff = point.y - approxPoint.y;
            return sum + diff * diff;
        }, 0);
        return Math.sqrt(sumOfSquares / this.points.length);
    }

        calculateAbsDiffRmse(): number {
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

    calculateAbsDiff(): number[] {
        // First, calculate the least squares line
        const leastSquaresLine = this.approximaredLeastSWPoints;

        // Then, calculate the Y values on the cubic polynomial for each X value
        const polynomialYs = this.approximatedPoints.map(point => 
            this.coefficients.reduce((sum, coeff, index) => sum + coeff * Math.pow(point.x, index), 0)
        );

        // Finally, calculate the absolute differences
        const absDiffs = polynomialYs.map((polyY, index) => 
            Math.abs(polyY - leastSquaresLine[index].y)
        );

        return absDiffs;
    }

    calculateRMSELeastSquaresWeighted(): number {
        
        const approximatedPoints = this.approximaredLeastSWPoints;

        let sumOfSquares = this.points.reduce((sum, point, index) => {
            let approxPoint = approximatedPoints[index];
            let diff = point.y - approxPoint.y;
            return sum + diff * diff;
        }, 0);
        return Math.sqrt(sumOfSquares / this.points.length);
    }

    private generatePointsOnLeastSquaresLine(): IPoint[] {
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
        const calculateY = (x: number) => startPoint.y + slope * (x - startPoint.x);

        // Generate points on the line using the x values from approximatedPoints
        const linePoints = this.approximatedPoints.map(point => ({
            x: point.x,
            y: calculateY(point.x)
        }));

        return linePoints;
    }

    private removeDuplicatesAndSort() {
        this.points = this.points
            .filter((point, index, self) =>
                index === self.findIndex(p => p.x === point.x && p.y === point.y))
            .sort((a, b) => a.x - b.x);
    }

    private identifyHighErrorPoints(): IPoint[] {
        return this.points.filter((point, index) => {
            let approxPoint = this.approximatedPoints[index];
            let diff = Math.abs(point.y - approxPoint.y);
            return diff > this.errorThreshold;
        });
    }
   
    private performApproximation(): void {
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
        }))
    }

    private solveLinearSystem(A: number[][], B: number[]): number[] {
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

    fineCubePolynomialApproximation(step: number): IPoint[] {
        if (this.coefficients.length === 0 || this.points.length === 0) {
            throw new Error("Коэффициенты полинома или набор точек не определены.");
        }

        const xMin = this.points[0].x;  // Начальное значение X берется из первой точки исходных данных
        const xMax = this.points[this.points.length - 1].x;  // Конечное значение X берется из последней точки исходных данных

        let finePoints = [];
        for (let x = xMin; x <= xMax; x += step) {
            const y = this.coefficients.reduce((sum, coeff, index) => sum + coeff * Math.pow(x, index), 0);
            finePoints.push({ x, y });
        }

        return finePoints;
    }

    getY(x: number): number {
        return this.coefficients.reduce((sum, coeff, index) => sum + coeff * Math.pow(x, index), 0);
      }
      

    calculateExtremes(step: number): IPoint[] {
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

    calculateFirstDerivativeExtremes(step: number): IPoint[] {
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
    
    calculateFirstDerivativeGraph(step: number): IPoint[] {
        const finePoints = this.fineCubePolynomialApproximation(step);
        if (finePoints.length < 2) {
            return []; // Недостаточно точек для вычисления производной
        }
    
        let firstDerivatives: IPoint[] = [];
    
        // Вычисление первой производной
        for (let i = 1; i < finePoints.length; i++) {
            const dy = finePoints[i].y - finePoints[i - 1].y;
            const dx = finePoints[i].x - finePoints[i - 1].x;
            const derivativeValue =( dy / dx )  //* 5 + 757;
    
            // Добавляем координату X и значение производной как Y
            firstDerivatives.push({ x: finePoints[i].x, y: derivativeValue });
        }
    
        return firstDerivatives;
    }

    calculateSecondDerivativeGraph(step: number): IPoint[] {
        const finePoints = this.fineCubePolynomialApproximation(step);
        if (finePoints.length < 3) {
            return []; // Недостаточно точек для вычисления второй производной
        }
    
        let firstDerivatives: number[] = [];
        let secondDerivatives: IPoint[] = [];
    
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
            const secondDerivativeValue = (d2y / dx)  //* 10 + 755;
    
            secondDerivatives.push({ x: finePoints[i].x, y: secondDerivativeValue });
        }
    
        return secondDerivatives;
    }
    
    findMaxTurnPoint(): IPoint[] | null {
        return this.findMaxTurnPointOfCubicPolynomial(this.coefficients);
    }

    findMaxTurnPointOfCubicPolynomial(coefficients: number[]): IPoint[] | null {
        console.log("Коэффициенты полинома:", coefficients);
    
        if (coefficients.length !== 4) {
            console.error("Должно быть ровно 4 коэффициента для кубического полинома.");
            return null;
        }
    
        const [a0, a1, a2, a3] = coefficients;
    
        console.log(`Коэффициенты полинома: a0=${a0}, a1=${a1}, a2=${a2}, a3=${a3}`);
    
        // Первая производная и дискриминант
        const a = 3 * a3;
        const b = 2 * a2;
        const c = a1;
        const discriminant = b * b - 4 * a * c;
    
        console.log(`Дискриминант: ${discriminant}`);

        const turnPoints: IPoint[] = [];
   
       if (discriminant >= 0) {
           const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
           const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
   
           // Добавляем корни, если они не NaN
           [x1, x2].forEach(x => {
            console.log(`Корни есть, вот х: ${x}`);
               if (!isNaN(x)) {
                   turnPoints.push({ x, y: a3 * x * x * x + a2 * x * x + a1 * x + a0 });
               }
           });
       }
   
       return turnPoints;

        // if (discriminant < 0) {
        //     console.log("Нет действительных корней.");
        //     return null;
        // } else {
        //     const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        //     const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    
        //     console.log(`Корни уравнения: x1=${x1}, x2=${x2}`);
    
            // let maxTurnAngle = 0;
            // let maxTurnPoint: IPoint | null = null;
    
            // [x1, x2].forEach(x => {
            //     if (!isNaN(x)) {
            //         const slope = 3 * a3 * x * x + 2 * a2 * x + a1;
            //         const angle = Math.atan(Math.abs(slope));
    
            //         console.log(`x=${x}, slope=${slope}, angle=${angle}`);
    
            //         if (angle > maxTurnAngle) {
            //             maxTurnAngle = angle;
            //             maxTurnPoint = { x, y: a3 * x * x * x + a2 * x * x + a1 * x + a0 };
            //         }
            //     }
            // });
    
            // if (maxTurnPoint) {
            //     console.log("Максимальная точка поворота:", maxTurnPoint);
            // } else {
            //     console.log("Точка поворота не найдена.");
            // }
    
            // return maxTurnPoint;
        }


}
