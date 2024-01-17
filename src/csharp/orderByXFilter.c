using System;
using System.Collections.Generic;
using System.Linq;

public interface IPoint
{
    double X { get; }
    double Y { get; }
}

public delegate List<IPoint> IFilter(List<IPoint> points, params object[] args);

public static class OrderByXFilter
{
    public static List<IPoint> Apply(List<IPoint> points, params object[] args)
    {
        // Копируем массив, чтобы не изменять исходный
        List<IPoint> pointsCopy = points.ToList();

        // Сортируем точки по возрастанию координаты X
        pointsCopy.Sort((a, b) => a.X.CompareTo(b.X));

        return pointsCopy;
    }
}
