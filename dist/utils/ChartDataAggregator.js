var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import visualDatasetBuilder from './VisualDatasetBuilder.js';
import enhancedSegmentApproximation from '../filters/enhancedSegmentApproximation.js';
import orderByXFilter from '../filters/orderByXFilter.js';
import filterXRange from '../filters/filterXRange.js';
import weightedGroundLevelMedianFilter from '../filters/weightedGroundLevelMedianFilter.js';
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
export default function ChartDataAggregator(csvpoints, coordinateA, coordinateB) {
    return __awaiter(this, void 0, void 0, function* () {
        // Инициализация секций для агрегирования данных
        const sections = [];
        // Фильтрация и сортировка точек по оси X
        const orderByXPoints = orderByXFilter(csvpoints);
        const rangedPoints = filterXRange(orderByXPoints, coordinateA, coordinateB);
        // Применение взвешенного медианного фильтра по уровню земли
        const weightedGroundLevelMedianFilterPoints = weightedGroundLevelMedianFilter(rangedPoints);
        sections.push({ label: "weighted", points: weightedGroundLevelMedianFilterPoints, showLine: false, fill: false, backgroundColor: 'red' });
        // Применение улучшенного сегментного аппроксиматора к отфильтрованным данным
        sections.push({ label: "enhanced weighted", points: enhancedSegmentApproximation(weightedGroundLevelMedianFilterPoints, 0.1), showLine: true, tension: 0, fill: false, borderColor: 'green', backgroundColor: 'green' });
        // Добавление исходных точек для сравнения
        sections.push({ label: "ТЛО", points: rangedPoints, showLine: false, fill: false, backgroundColor: 'grey' });
        // Формирование метки для каждого набора данных
        const labeledDataSets = sections.map(section => {
            return Object.assign(Object.assign({ data: section.points }, section), { label: `${section.label} - ${section.points.length}` });
        });
        // Сборка и возврат визуализированных наборов данных
        return visualDatasetBuilder(...labeledDataSets);
    });
}
