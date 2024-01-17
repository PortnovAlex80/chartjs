using System;
using System.Collections.Generic;
using System.Linq;

public interface IPoint
{
    double X { get; }
    double Y { get; }
}

public static class BestCombinationFilter
{
    public static List<IPoint> Apply(List<IPoint> surfacePoints, List<IPoint> polylineSegment, double threshold = 0.020)
    {
        if (polylineSegment.Count < 3)
        {
            return polylineSegment; // Возвращаем исходный массив, если точек меньше трех
        }

        double totalLength = CalculateTotalLengthOfPolyline(polylineSegment);
        int totalVertices = polylineSegment.Count;

        double[] minSums = Enumerable.Repeat(double.PositiveInfinity, polylineSegment.Count).ToArray();
        int[] previousIndices = Enumerable.Repeat(-1, polylineSegment.Count).ToArray();
        minSums[0] = 0;

        double[] bestScores = Enumerable.Repeat(double.NegativeInfinity, polylineSegment.Count).ToArray();
        bestScores[0] = 0;

        for (int j = 1; j < polylineSegment.Count; j++)
        {
            for (int i = 0; i < j; i++)
            {
                double segmentRMSE = CalculateRMSE(polylineSegment.GetRange(i, j - i + 1), surfacePoints);
                double currentScore = OptimaFunction(i, j, polylineSegment, totalVertices, totalLength);

                if (segmentRMSE <= threshold && minSums[i] + segmentRMSE < minSums[j] && currentScore > bestScores[j])
                {
                    minSums[j] = minSums[i] + segmentRMSE;
                    bestScores[j] = currentScore;
                    previousIndices[j] = i;
                }
            }
        }

        List<IPoint> path = ReconstructPathUsingPreviousIndices(polylineSegment, previousIndices);
        return path;
    }

    private static List<IPoint> ReconstructPathUsingPreviousIndices(List<IPoint> polylineSegment, int[] previousIndices)
    {
        List<IPoint> path = new List<IPoint>();
        int currentIndex = polylineSegment.Count - 1;
        while (currentIndex >= 0)
        {
            path.Insert(0, polylineSegment[currentIndex]);
            currentIndex = previousIndices[currentIndex];
        }
        return path;
    }

    private static double OptimaFunction(int i, int j, List<IPoint> points, int totalVertices, double totalLength)
    {
        double deletedVerticesScore = (j - i - 1) / (double)totalVertices;
        double lengthScore = LengthOfSegment(i, j, points) / totalLength;

        if (deletedVerticesScore == 0 || lengthScore == 0)
        {
            return 0; // Чтобы избежать деления на ноль
        }

        return 1 / (2 * (1 / deletedVerticesScore + 1 / lengthScore));
    }

    private static double LengthOfSegment(int i, int j, List<IPoint> points)
    {
        if (i >= points.Count || j >= points.Count)
        {
            throw new IndexOutOfRangeException("Index out of bounds.");
        }

        IPoint point1 = points[i];
        IPoint point2 = points[j];

        return Math.Sqrt(Math.Pow(point2.X - point1.X, 2) + Math.Pow(point2.Y - point1.Y, 2));
    }

    private static double CalculateTotalLengthOfPolyline(List<IPoint> points)
    {
        double totalLength = 0;
        for (int index = 1; index < points.Count; index++)
        {
            IPoint point = points[index];
            IPoint previousPoint = points[index - 1];
            double length = Math.Sqrt(Math.Pow(point.X - previousPoint.X, 2) + Math.Pow(point.Y - previousPoint.Y, 2));
            totalLength += length;
        }
        return totalLength;
    }

    private static double CalculateHeightFromLine(IPoint point, IPoint lineStart, IPoint lineEnd)
    {
        double area = Math.Abs(0.5 * (point.X * (lineStart.Y - lineEnd.Y) + lineStart.X * (lineEnd.Y - point.Y) + lineEnd.X * (point.Y - lineStart.Y)));
        double bottom = Math.Sqrt(Math.Pow(lineStart.X - lineEnd.X, 2) + Math.Pow(lineStart.Y - lineEnd.Y, 2));
        double height = area / bottom;
        return height;
    }

    private static List<IPoint> FindNearestPointsByX(List<IPoint> subset, List<IPoint> allSurfacePoints)
    {
        double firstX = subset[0].X;
        double lastX = subset[subset.Count - 1].X;
        List<IPoint> sortedSurfacePoints = allSurfacePoints.Where(point => point.X >= firstX && point.X <= lastX).ToList();
        return sortedSurfacePoints;
    }

    private static double CalculateRMSE(List<IPoint> subset, List<IPoint> allSurfacePoints)
    {
        List<IPoint> surfacePoints = FindNearestPointsByX(subset, allSurfacePoints);
        if (surfacePoints.Count < 2)
        {
            return 0; // Возвращаем исходный массив, если точек меньше двух
        }

        List<IPoint> approxPoints = LeastSquaresFilter.Apply(surfacePoints);
        double sumOfSquares = 0;

        foreach (IPoint point in subset)
        {
            double height = CalculateHeightFromLine(point, approxPoints[0], approxPoints[1]);
            sumOfSquares += height * height;
        }

        return Math.Sqrt(sumOfSquares / subset.Count);
    }
}
