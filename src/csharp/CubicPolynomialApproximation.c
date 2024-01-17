using System;
using System.Collections.Generic;
using System.Linq;

public interface IPoint
{
    double X { get; }
    double Y { get; }
}

public class CubicPolynomialApproximation
{
    private double[] coefficients;
    private List<IPoint> points;
    private List<IPoint> approximatedPolynomialPoints;
    private List<IPoint> approximatedLeastSWPoints;
    public double Rmse { get; private set; }
    private int attempts = 3;

    public CubicPolynomialApproximation()
    {
        coefficients = new double[4]; // коэф полинома
        points = new List<IPoint>(); // входной набор данных
        approximatedPolynomialPoints = new List<IPoint>(); // набор упорядоченных точек полинома
        approximatedLeastSWPoints = new List<IPoint>();
        Rmse = 1000;
    }

    public List<IPoint> Approximate(List<IPoint> inputPoints)
    {
        points = inputPoints;
        RemoveDuplicatesAndSort();

        if (points.Count == 0)
        {
            throw new Exception("Массив точек не должен быть пустым.");
        }

        PerformApproximation();

        return approximatedPolynomialPoints;
    }

    public double CalculateRmse()
    {
        double sumOfSquares = points.Select((point, index) =>
        {
            double approxY = approximatedPolynomialPoints[index].Y;
            double diff = point.Y - approxY;
            return diff * diff;
        }).Sum();

        return Math.Sqrt(sumOfSquares / points.Count);
    }

    public double CalculateAbsDiffRmse()
    {
        if (approximatedPolynomialPoints == null || approximatedLeastSWPoints == null)
        {
            throw new Exception("Необходимо сначала сгенерировать оба набора точек.");
        }

        double sumOfSquares = approximatedPolynomialPoints.Select((point, index) =>
        {
            double diff = point.Y - approximatedLeastSWPoints[index].Y;
            return diff * diff;
        }).Sum();

        return Math.Sqrt(sumOfSquares / approximatedPolynomialPoints.Count);
    }

    public double CalculateRmseLeastSquaresWeighted()
    {
        List<IPoint> approximatedPoints = approximatedLeastSWPoints;

        double sumOfSquares = points.Select((point, index) =>
        {
            double approxY = approximatedPoints[index].Y;
            double diff = point.Y - approxY;
            return diff * diff;
        }).Sum();

        return Math.Sqrt(sumOfSquares / points.Count);
    }

    private List<IPoint> GeneratePointsOnLeastSquaresLine()
    {
        approximatedLeastSWPoints = LeastSquaresFilter.Apply(points);

        if (approximatedLeastSWPoints.Count < 2)
        {
            throw new Exception("leastSquaresWeightedFilter did not return enough points.");
        }

        IPoint startPoint = approximatedLeastSWPoints[0];
        IPoint endPoint = approximatedLeastSWPoints[1];

        double slope = (endPoint.Y - startPoint.Y) / (endPoint.X - startPoint.X);

        List<IPoint> linePoints = approximatedPolynomialPoints.Select(point =>
        {
            double x = point.X;
            double y = startPoint.Y + slope * (x - startPoint.X);
            return new Point(x, y);
        }).ToList();

        return linePoints;
    }

    public List<IPoint> FindRandomQualitySegments(List<IPoint> inputPoints)
    {
        if (inputPoints.Count == 0)
        {
            throw new Exception("Массив точек не должен быть пустым.");
        }

        List<IPoint> pointsCopy = inputPoints.ToList();
        RemoveDuplicatesAndSort();

        double thresholdRmse = 0.08;
        double thresholdDiffRmse = 0.015;
        HashSet<IPoint> remainingPoints = new HashSet<IPoint>(pointsCopy);

        List<List<IPoint>> bestSegments = new List<List<IPoint>>();

        int whileCnt = 100;
        while (remainingPoints.Count > 0)
        {
            if (whileCnt < 0)
            {
                Console.WriteLine("выход из внешнего цикла");
                break;
            }
            whileCnt--;

            int startIdx = new Random().Next(remainingPoints.Count);
            IPoint startPoint = remainingPoints.ElementAt(startIdx);

            int start = pointsCopy.IndexOf(startPoint);
            int end = start;

            List<IPoint> lastValidSegment = null;
            bool isGrowingLeft = true;
            bool isGrowingRight = true;

            int innerWhileCnt = 100;
            bool expandDirection = true;

            while (isGrowingLeft || isGrowingRight)
            {
                if (innerWhileCnt < 0)
                {
                    break;
                }
                innerWhileCnt--;

                if (expandDirection && isGrowingLeft)
                {
                    if (start > 0)
                    {
                        start--;
                    }
                    else
                    {
                        isGrowingLeft = false;
                        expandDirection = false;
                    }
                }

                if (!expandDirection && isGrowingRight)
                {
                    if (end < pointsCopy.Count - 1)
                    {
                        end++;
                    }
                    else
                    {
                        isGrowingRight = false;
                        expandDirection = true;
                    }
                }

                if (isGrowingLeft || isGrowingRight)
                {
                    expandDirection = !expandDirection;
                }

                List<IPoint> segment = pointsCopy.GetRange(start, end - start + 1);
                Approximate(segment);
                approximatedLeastSWPoints = GeneratePointsOnLeastSquaresLine();

                double polynomialRmse = Rmse;
                double lineRmse = CalculateRmseLeastSquaresWeighted();
                double diffRmse = CalculateAbsDiffRmse();

                bool thresholdDistance = Math.Abs(approximatedLeastSWPoints.Last().Y - segment.Last().Y) < 0.05;
                double thresholdDiffRmseCurrent = lineRmse < (thresholdRmse / 2) ? thresholdDiffRmse * 1.5 : thresholdDiffRmse;

                if (polynomialRmse < thresholdRmse && lineRmse < thresholdRmse && diffRmse < thresholdDiffRmseCurrent && thresholdDistance)
                {
                    lastValidSegment = segment;
                    isGrowingLeft = expandDirection;
                    isGrowingRight = !expandDirection;
                }
                else
                {
                    if (expandDirection) start++;
                    if (!expandDirection) end--;
                    isGrowingLeft = false;
                    isGrowingRight = false;
                    break;
                }
            }

            if (lastValidSegment != null)
            {
                bestSegments.Add(lastValidSegment);
                lastValidSegment.ForEach(point => remainingPoints.Remove(point));
            }

            if (remainingPoints.Count == pointsCopy.Count)
            {
                break;
            }
        }

        List<IPoint> combinedSegments = new List<IPoint>();
        bestSegments.ForEach(segment =>
        {
            if (segment.Count > 0)
            {
                combinedSegments.Add(segment[0]);
                combinedSegments.Add(segment[segment.Count - 1]);
            }
        });

        combinedSegments.Sort((a, b) => a.X.CompareTo(b.X));

        if (combinedSegments.Count == 0 && attempts > 0)
        {
            attempts--;
            return FindRandomQualitySegments(inputPoints);
        }
        else
        {
            return combinedSegments;
        }
    }

    private void PerformApproximation()
    {
        List<double> x = points.Select(p => p.X).ToList();
        List<double> y = points.Select(p => p.Y).ToList();
        double[][] A = new double[4][];
        for (int i = 0; i <= 3; i++)
        {
            A[i] = new double[4];
            for (int j = 0; j <= 3; j++)
            {
                A[i][j] = x.Sum(xi => Math.Pow(xi, i + j));
            }
        }

        double[] B = new double[4];
        for (int i = 0; i <= 3; i++)
        {
            B[i] = x.Zip(y, (xi, yi) => Math.Pow(xi, i) * yi).Sum();
        }

        coefficients = SolveLinearSystem(A, B);

        approximatedPolynomialPoints = x.Select(xi =>
        {
            double newY = coefficients.Select((coeff, index) => coeff * Math.Pow(xi, index)).Sum();
            return new Point(xi, newY);
        }).ToList();

        Rmse = CalculateRmse();
    }

    private double[] SolveLinearSystem(double[][] A, double[] B)
    {
        int n = B.Length;
        double[] x = new double[n];

        for (int i = 0; i < n; i++)
        {
            int maxRow = i;
            double maxEl = Math.Abs(A[i][i]);

            for (int k = i + 1; k < n; k++)
            {
                if (Math.Abs(A[k][i]) > maxEl)
                {
                    maxEl = Math.Abs(A[k][i]);
                    maxRow = k;
                }
            }

            for (int k = i; k < n; k++)
            {
                double temp = A[maxRow][k];
                A[maxRow][k] = A[i][k];
                A[i][k] = temp;
            }

            double tempB = B[maxRow];
            B[maxRow] = B[i];
            B[i] = tempB;

            for (int k = i + 1; k < n; k++)
            {
                double factor = -A[k][i] / A[i][i];
                for (int j = i; j < n; j++)
                {
                    if (i == j)
                    {
                        A[k][j] = 0;
                    }
                    else
                    {
                        A[k][j] += factor * A[i][j];
                    }
                }
                B[k] += factor * B[i];
            }
        }

        for (int i = n - 1; i >= 0; i--)
        {
            x[i] = B[i] / A[i][i];
            for (int k = i - 1; k >= 0; k--)
            {
                B[k] -= A[k][i] * x[i];
            }
        }

        return x;
    }

    private void RemoveDuplicatesAndSort()
    {
        points = points.Distinct().OrderBy(p => p.X).ToList();
    }

    public List<IPoint> FineCubePolynomialApproximation(double step)
    {
        if (coefficients.Length == 0 || points.Count == 0)
        {
            throw new Exception("Коэффициенты полинома или набор точек не определены.");
        }

        double xMin = points[0].X;
        double xMax = points[points.Count - 1].X;

        List<IPoint> finePoints = new List<IPoint>();
        for (double x = xMin; x <= xMax; x += step)
        {
            double y = coefficients.Select((coeff, index) => coeff * Math.Pow(x, index)).Sum();
            finePoints.Add(new Point(x, y));
        }

        return finePoints;
    }
}
