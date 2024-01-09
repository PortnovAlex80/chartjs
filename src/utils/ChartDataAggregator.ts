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
    const orderByXPoints = orderByXFilter(csvpoints); 
    const rangedPoints = filterXRange(orderByXPoints, coordinateA, coordinateB);

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
    sections.push({ label: "Линии Чистой апроксимации", points: finePointsSplite, showLine: true, tension: 0, fill: false, borderColor: 'purple', backgroundColor: 'purple' });
    console.log(`Fine rmse ${fineCubePolynomialApproximationLine.rmse}`)

    // Добавление исходных точек для сравнения
    sections.push({ label: "ТЛО", points: rangedPoints, showLine: false, fill: false, backgroundColor: 'grey' });

    const golaypoints = savitzkyGolayFilter(weightedGroundLevelMedianFilterPoints, 51 , 5);

    console.log(JSON.stringify(golaypoints));
    sections.push({
        label: "Савицкий-Голай",
        points: golaypoints,
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
