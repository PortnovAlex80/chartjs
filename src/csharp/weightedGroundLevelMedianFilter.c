using System;
using System.Collections.Generic;
using System.Linq;

public interface IPoint
{
    double X { get; }
    double Y { get; }
}

public delegate List<IPoint> IFilter(List<IPoint> points, params object[] args);

public static class GroundLevelMedianFilter
{
    public static List<IPoint> WeightedGroundLevelMedianFilter(List<IPoint> points, double maxWindowSize = 10, double maxLength = 0.2)
    {
        List<IPoint> filteredPoints = new List<IPoint>();
        double threshold = 0.20; // Не совсем ясно, как это работает, так как отсечения точек визуально не видно.
        int i = 0;

        while (i < points.Count)
        {
            int windowSize = 1; // Сделать адаптивным в зависимости от плотности точек на 1 м?
            while (windowSize < Math.Min(maxWindowSize, points.Count - i) &&
                Math.Abs(points[i + windowSize].X - points[i].X) <= maxLength)
            {
                windowSize++;
            }

            List<IPoint> windowPoints = points.GetRange(i, windowSize);
            IPoint basePoint = windowPoints.Aggregate((lowest, point) => point.Y < lowest.Y ? point : lowest);
            List<IPoint> weightedPoints = windowPoints.Where(point => Math.Abs(point.Y - basePoint.Y) <= threshold).ToList();

            double weightedMedianX = GetWeightedMedian(weightedPoints.Select(p => p.X).ToList(), basePoint, weightedPoints);
            double weightedMedianY = GetWeightedMedian(weightedPoints.Select(p => p.Y).ToList(), basePoint, weightedPoints);

            filteredPoints.Add(new Point { X = weightedMedianX, Y = weightedMedianY });

            i += windowSize;
        }

        return TriangleBaseDistanceFilter(filteredPoints);
    }

    private static double GetWeightedMedian(List<double> values, IPoint basePoint, List<IPoint> weightedPoints)
    {
        List<ValueWeightPair> weightedValues = values.Select((value, index) => new ValueWeightPair { Value = value, Weight = 1 - Math.Abs(weightedPoints[index].Y - basePoint.Y) / 0.2 }).ToList();
        weightedValues.Sort((a, b) => a.Value.CompareTo(b.Value));

        double totalWeight = weightedValues.Sum(pair => pair.Weight);
        double accumulatedWeight = 0;

        foreach (ValueWeightPair pair in weightedValues)
        {
            accumulatedWeight += pair.Weight;
            if (accumulatedWeight >= totalWeight / 2)
            {
                return pair.Value;
            }
        }

        return weightedValues[weightedValues.Count / 2].Value;
    }

    private static List<IPoint> TriangleBaseDistanceFilter(List<IPoint> points, double epsilon = 0.15)
    {
        List<IPoint> filteredPoints = new List<IPoint>();

        if (points.Count < 3)
        {
            return points; // Недостаточно точек для формирования треугольника
        }

        filteredPoints.Add(points[0]); // Первая точка всегда добавляется

        for (int i = 1; i < points.Count - 1; i++)
        {
            IPoint p1 = points[i - 1];
            IPoint p2 = points[i];
            IPoint p3 = points[i + 1];

            double baseLength = Math.Sqrt(Math.Pow(p3.X - p1.X, 2) + Math.Pow(p3.Y - p1.Y, 2));
            double height = Math.Abs(p2.Y - ((p1.Y + p3.Y) / 2));

            if (height <= epsilon)
            {
                filteredPoints.Add(p2);
            }
        }

        filteredPoints.Add(points[points.Count - 1]); // Последняя точка всегда добавляется

        return filteredPoints;
    }

    private class ValueWeightPair
    {
        public double Value { get; set; }
        public double Weight { get; set; }
    }
}
