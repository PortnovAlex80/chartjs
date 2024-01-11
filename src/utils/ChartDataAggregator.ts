// src/utils/ChartDataAggregator.ts
import { IDataSet } from '../interfaces/IDataSet';
import visualDatasetBuilder from './VisualDatasetBuilder.js';
import enhancedSegmentApproximation from '../filters/enhancedSegmentApproximation.js';
import { IPoint } from '../interfaces/IPoint';
import orderByXFilter from '../filters/orderByXFilter.js';
import filterXRange from '../filters/filterXRange.js';
import weightedGroundLevelMedianFilter from '../filters/weightedGroundLevelMedianFilter.js'

import leastSquaresFilter from '../filters/leastSquaresFilter.js';
import { CubicPolynomialApproximation } from '../classes/CubicPolynomialApproximation.js';
import LeastSquaresFilter from '../classes/LeastSquaresFilter.js';
import leastSquaresPolynomialApproximation from '../filters/leastSquaresPolynomialApproximation.js';
import savitzkyGolayFilter from '../filters/savitzkyGolayFilter.js';
import approximateWithPolynomials from '../filters/approximateWithPolynomials.js';

import { UnivariateCubicSmoothingSpline, DoubleArray } from '../filters/smoothingspline.js';
import { RobustPolynomialRegression } from 'ml-regression-robust-polynomial';
import leastSquareSolver from '../filters/LeastSquareSolver.js';



/**
 * Модуль ChartDataAggregator агрегирует и обрабатывает данные для визуализации графиков.
 * Он принимает необработанные точки из CSV-файла и координаты для фильтрации данных,
 * применяет ряд фильтров и алгоритмов для улучшения и анализа данных,
 * и готовит наборы данных для визуализации.
 * 
 * @param {IPoint[]} csvpoints - Массив точек из CSV-файла.
 * @param {number} coordinateA - Начальная координата X для фильтрации данных.
 * @param {number} coordinateB - Конечная координата X для фильтрации данных.
 * @returns {Promise<IDataSet[]>} Обещание, возвращающее массив наборов данных для визуализации.
 */
export default async function ChartDataAggregator(csvpoints: IPoint[], coordinateA: number, coordinateB: number): Promise<IDataSet[]> {
    // Инициализация секций для агрегирования данных

    const sections = [];   
    
    // Фильтрация и сортировка точек по оси X
    const orderByXPoints: IPoint[] = orderByXFilter(csvpoints); 
    const rangedPoints: IPoint[] = filterXRange(orderByXPoints, coordinateA, coordinateB);

    // Работающий набор
    // Применение взвешенного медианного фильтра по уровню земли
    const weightedGroundLevelMedianFilterPoints = weightedGroundLevelMedianFilter(rangedPoints);
    sections.push({ label: "Весовой фильтр по уровню земли", points: weightedGroundLevelMedianFilterPoints, showLine: false, fill: false, backgroundColor: 'red' });

    // Применение улучшенного сегментного аппроксиматора к отфильтрованным данным
    // sections.push({ label: "Алгоритм Enhanced-18", points: enhancedSegmentApproximation(weightedGroundLevelMedianFilterPoints, 0.20), showLine: true, tension: 0, fill: false, borderColor: 'green', backgroundColor: 'green' });



    // Дополнительные наборы
    

    // const segmentsBoundaries = new CubicPolynomialApproximation().findQualitySegments(rangedPoints);
    // sections.push({ label: "findQualitySegments", points: segmentsBoundaries, showLine: true, fill: false, backgroundColor: 'blue' , borderColor: 'blue'});

    // Создание экземпляра LeastSquaresFilter и аппроксимация точек
    // const leastSquares = new LeastSquaresFilter(weightedGroundLevelMedianFilterPoints);
    // const leastPoints = leastSquares.approximatePoints();
    // console.log(`Least rmse ${leastSquares.rmse}`)

    // sections.push({
    //     label: "leastPoints",
    //     points: leastPoints,
    //     showLine: true,
    //     fill: false,
    //     backgroundColor: 'blue',
    //     borderColor: 'blue', // Цвет линии
    //     borderDash: [5, 5] // Стиль пунктирной линии: чередование 5 пикселей линии и 5 пикселей пропуска
    // });
    
    const fineCubePolynomialApproximationLine = new CubicPolynomialApproximation();
    // const cubePolyPoints = fineCubePolynomialApproximationLine.findRandomQualitySegments(weightedGroundLevelMedianFilterPoints);
    const app_cubePolyPoints = fineCubePolynomialApproximationLine.approximate(weightedGroundLevelMedianFilterPoints);
    const finePointsSplite = fineCubePolynomialApproximationLine.fineCubePolynomialApproximation(0.1);
    // sections.push({ label: "Линии Чистой апроксимации", points: finePointsSplite, showLine: true, tension: 0, fill: false, borderColor: 'purple', backgroundColor: 'purple' });
    console.log(`Fine rmse ${fineCubePolynomialApproximationLine.rmse}`)

    // Добавление исходных точек для сравнения
    sections.push({ label: "ТЛО", points: rangedPoints, showLine: false, fill: false, backgroundColor: 'grey' });

    // const golaypoints = savitzkyGolayFilter(weightedGroundLevelMedianFilterPoints, 35 , 3);

    // console.log(JSON.stringify(golaypoints));
    // sections.push({
    //     label: "Савицкий-Голай",
    //     points: golaypoints,
    //     showLine: true,
    //     fill: false,
    //     backgroundColor: 'blue',
    //     borderColor: 'blue', // Цвет линии
    //     borderDash: [5, 5] // Стиль пунктирной линии: чередование 5 пикселей линии и 5 пикселей пропуска
    // });

    // const new_appr = approximateWithPolynomials(weightedGroundLevelMedianFilterPoints);
    // console.log(new_appr);
    //     sections.push({
    //     label: "...bizon",
    //     points: new_appr,
    //     showLine: true,
    //     fill: false,
    //     backgroundColor: 'blue',
    //     borderColor: 'blue', // Цвет линии
    //     borderDash: [5, 5] // Стиль пунктирной линии: чередование 5 пикселей линии и 5 пикселей пропуска
    // });


    const ydata: DoubleArray = weightedGroundLevelMedianFilterPoints.map((point) => point.y);
    const xdata: DoubleArray = weightedGroundLevelMedianFilterPoints.map((point) => point.x);    
    // const spline = new UnivariateCubicSmoothingSpline(xdata, ydata);
    // const yidata = spline.evaluate(xdata);
    // const xidata = xdata;
    // const splineCoords: IPoint[] = xdata.map((x, index) => ({ x, y: yidata[index] }));

        // Применение робастной полиномиальной регрессии
        const degree = 2; // Например, степень полинома 3
        const robustRegression = new RobustPolynomialRegression(xdata, ydata, degree);
        
        // Вычисление предсказанных значений регрессии для каждой точки x
        const regressionPoints: IPoint[] = xdata.map((x) => ({
            x,
            y: robustRegression.predict(x)
        }));
    
        // Добавление предсказаний регрессии в наборы данных для визуализации
        sections.push({
            label: "Робастная полиномиальная регрессия",
            points: regressionPoints,
            showLine: true,
            fill: false,
            backgroundColor: 'orange',
            borderColor: 'orange'
        });

        // Применение робастной полиномиальной регрессии для полинома 3-й степени
        const degree3 = 4; // Степень полинома 3
        const robustRegression3 = new RobustPolynomialRegression(xdata, ydata, degree3);

        // Вычисление предсказанных значений регрессии для каждой точки x
        const regressionPoints3: IPoint[] = xdata.map((x) => ({
            x,
            y: robustRegression3.predict(x)
        }));

        // Добавление предсказаний регрессии в наборы данных для визуализации
        sections.push({
            label: "Робастная полиномиальная регрессия степени 3",
            points: regressionPoints3,
            showLine: true,
            fill: false,
            backgroundColor: 'purple', // Изменен цвет
            borderColor: 'purple' // Изменен цвет
        });

        // Применение аппроксимации методом наименьших квадратов
        // const approximatedPoints = leastSquaresPolynomialApproximation(weightedGroundLevelMedianFilterPoints, 3);
        const approximatedPoints = leastSquaresPolynomialApproximation(weightedGroundLevelMedianFilterPoints, 3);

        // Вывод точек аппроксимации на график
        sections.push({
            label: "Аппроксимация наименьшими квадратами",
            points: approximatedPoints,
            showLine: true,
            fill: false,
            backgroundColor: 'blue',
            borderColor: 'blue', // Цвет линии
            borderDash: [5, 5] // Стиль пунктирной линии: чередование 5 пикселей линии и 5 пикселей пропуска
        });

    // Формирование метки для каждого набора данных
    const labeledDataSets = sections.map(section => {
        return {
            data: section.points,
            ...section,
            label: `${section.label} - ${section.points.length}`
        };
    });

    // Сборка и возврат визуализированных наборов данных
    return visualDatasetBuilder(...labeledDataSets);
}
