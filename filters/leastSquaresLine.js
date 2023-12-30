function leastSquaresLine(points) {
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    points.forEach(point => {
      sumX += point.x;
      sumY += point.y;
      sumXY += point.x * point.y;
      sumX2 += point.x ** 2;
    });

    const n = points.length;
    const denominator = (n * sumX2 - sumX ** 2);
    
    // Проверка на деление на ноль
    if (denominator === 0) {
      return { slope: 0, intercept: sumY / n }; // Или другая обработка ошибки
    }

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
}

  
  function calculateError(points, line) {
    return points.map(point => 
      Math.abs(line.slope * point.x + line.intercept - point.y)
    ).reduce((max, curr) => Math.max(max, curr), 0);
  }
  
  function findCornerPoints(points, epsilon) {
    let cornerPoints = [points[0]]; // Добавляем первую точку в угловые точки
    let lastCorner = points[0];
  
    for (let i = 1; i < points.length; i++) {
      // Получаем точки от последней угловой точки до текущей точки
      const segment = points.slice(points.indexOf(lastCorner), i + 1);
  
      // Вычисляем линию методом наименьших квадратов для этого сегмента
      const line = leastSquaresLine(segment);
  
      // Вычисляем ошибку для этого сегмента
      const error = calculateError(segment, line);
  
      // Если ошибка больше заданного допуска, текущая точка становится новой угловой точкой
      if (error > epsilon) {
        lastCorner = points[i - 1];
        cornerPoints.push(lastCorner);
      }
    }
  
    // Добавляем последнюю точку в угловые точки
    cornerPoints.push(points[points.length - 1]);
    return cornerPoints;
  }
  
  
  module.exports = findCornerPoints;