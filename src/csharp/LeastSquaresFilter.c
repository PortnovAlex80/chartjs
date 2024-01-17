using System;
using System.Collections.Generic;
using System.Linq;

public interface IPoint
{
    double X { get; }
    double Y { get; }
}

public delegate List<IPoint> IFilter(List<IPoint> points);

public static class LeastSquaresFilter
{
    public static List<IPoint> Apply(List<IPoint> points)
    {
        if (points.Count < 2)
        {
            return points; // Возвращаем исходные точки, если их менее двух
        }

        (double slope, double intercept) = LeastSquaresLine(points);

        // Возвращаем начальную и конечную точки, соответствующие линии наименьших квадратов
        IPoint firstPoint = points[0];
        IPoint lastPoint = points[points.Count - 1];
        IPoint approximatedFirstPoint = new Point { X = firstPoint.X, Y = firstPoint.X * slope + intercept };
        IPoint approximatedLastPoint = new Point { X = lastPoint.X, Y = lastPoint.X * slope + intercept };

        // Расчет RMSE
        double rmse = CalculateRMSE(points, slope, intercept);
        // Console.WriteLine($"RMSE: {rmse}");

        return new List<IPoint> { approximatedFirstPoint, approximatedLastPoint };
    }

    private static (double slope, double intercept) LeastSquaresLine(List<IPoint> points)
    {
        double sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        int n = points.Count;

        foreach (IPoint point in points)
        {
            sumX += point.X;
            sumY += point.Y;
            sumXY += point.X * point.Y;
            sumXX += point.X * point.X;
        }

        double slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        double intercept = (sumY - slope * sumX) / n;

        return (slope, intercept);
    }

    private static double CalculateRMSE(List<IPoint> points, double slope, double intercept)
    {
        double sumOfSquares = 0;
        foreach (IPoint point in points)
        {
            double yPredicted = slope * point.X + intercept;
            sumOfSquares += Math.Pow(point.Y - yPredicted, 2);
        }
        return Math.Sqrt(sumOfSquares / points.Count);
    }
}
