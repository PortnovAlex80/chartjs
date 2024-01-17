using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// Импорт интерфейсов и классов из других файлов
using Interfaces; // Импорт интерфейсов
using Filters; // Импорт фильтров
using Approximation; // Импорт класса для аппроксимации
using DataAggregation; // Импорт класса для агрегации данных

public class DataAggregator
{
    // Метод для агрегации данных
    public async Task<List<IPoint>> AggregateChartData(List<IPoint> csvpoints)
    {
        // Инициализация списка для хранения агрегированных данных
        List<DataSet> sections = new List<DataSet>();

        // Создание объекта фильтров для обработки данных
        Filters filters = new Filters();

        // Фильтрация и сортировка точек по оси X
        List<IPoint> orderByXPoints = filters.OrderByXFilter(csvpoints);

        // Применение взвешенного медианного фильтра по уровню земли
        List<IPoint> weightedGroundLevelMedianFilterPoints = filters.WeightedGroundLevelMedianFilter(orderByXPoints);

        // Создание объекта для аппроксимации кубическим полиномом и выполнение поиска качественных сегментов
        CubicPolynomialApproximation cubicPolynomialApproximation = new CubicPolynomialApproximation();
        List<IPoint> cubePolyPoints = cubicPolynomialApproximation.FindRandomQualitySegments(weightedGroundLevelMedianFilterPoints);

        // Применение фильтрации лучших комбинаций
        List<IPoint> resumePoints = filters.BestCombinationFilter(weightedGroundLevelMedianFilterPoints, cubePolyPoints);

        return resumePoints;
    }
}
