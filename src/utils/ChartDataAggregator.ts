// src/utils/ChartDataAggregator.ts
import { IDataSet } from '../interfaces/IDataSet';
import visualDatasetBuilder from './VisualDatasetBuilder.js';
import { IPoint } from '../interfaces/IPoint';
import orderByXFilter from '../filters/orderByXFilter.js';
import filterXRange from '../filters/filterXRange.js';
import weightedGroundLevelMedianFilter  from '../filters/weightedGroundLevelMedianFilter.js'
import { CubicPolynomialApproximation } from '../classes/CubicPolynomialApproximation.js';
import { bestCombinationFilter } from '../filters/VertexMinimazer.js';


// я хочу всю цепочку расчетов вынести в один модуль, или класс, попробуй провести анализ кода и скажи , можно ли оптимизировать кол-во строк кода без нарушения функционала.  Кода будем много, если в ответе будешь показывать код, то  приводи только названия и сигнатуры функций. Сейчас нужно оценить стратегию перехода и найти места оптимизации.

// цель модуля получить на входе точки из const orderByXPoints: IPoint[] = orderByXFilter(csvpoints);  и преобразовать в const resumePoints. Сейчас преобразование в разных модулях, классах и функциях. Хочу в одной функции или классе, или модуле.

// Путем рассуждений давай придем к стратегии.
/**
 * Агрегирует и обрабатывает данные для визуализации графиков.
 * 
 * @param {IPoint[]} csvpoints - Массив точек из CSV-файла.
 * @param {number} coordinateA - Начальная координата X для фильтрации данных.
 * @param {number} coordinateB - Конечная координата X для фильтрации данных.
 * @returns {Promise<IDataSet[]>} Обещание, возвращающее массив наборов данных для визуализации.
 */
export default async function aggregateChartData(csvpoints: IPoint[], coordinateA: number, coordinateB: number): Promise<IDataSet[]> {
    // Инициализация секций для агрегирования данных

    const sections = [];   
    
    // Фильтрация и сортировка точек по оси X
    const orderByXPoints: IPoint[] = orderByXFilter(csvpoints); 
    const rangedPoints: IPoint[] = filterXRange(orderByXPoints, coordinateA, coordinateB);

    // Применение взвешенного медианного фильтра по уровню земли
    const weightedGroundLevelMedianFilterPoints = weightedGroundLevelMedianFilter(rangedPoints);
       
    const fineCubePolynomialApproximationLine = new CubicPolynomialApproximation();
    let cubePolyPoints = fineCubePolynomialApproximationLine.findRandomQualitySegments(weightedGroundLevelMedianFilterPoints);    
    const resumePoints = bestCombinationFilter(weightedGroundLevelMedianFilterPoints, cubePolyPoints);

    sections.push({
        label: "Ranged Enhanced bestCombinationFilter 18 Portnov",
        points: resumePoints,
        showLine: true,
        tension: 0,
        fill: false,
        backgroundColor: 'blue',
        borderColor: 'blue',
        borderDash: [5, 5]
    });

    sections.push({ label: "ТЛО", points: rangedPoints, showLine: false, fill: false, backgroundColor: 'grey' });

    const labeledDataSets = sections.map(section => {
        return {
            data: section.points,
            ...section,
            label: `${section.label} - ${section.points.length}`
        };
    });

    return visualDatasetBuilder(...labeledDataSets);
}