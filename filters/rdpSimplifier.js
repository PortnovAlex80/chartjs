function rdpSimplifier(points, epsilon) {
    // Находит самую дальнюю точку от линии между первой и последней точками
    const findMaxDistance = (points, startPoint, endPoint) => {
      let maxDistance = 0;
      let index = 0;
      for (let i = 1; i < points.length - 1; i++) {
        let distance = pointToLineDistance(points[i], startPoint, endPoint);
        if (distance > maxDistance) {
          maxDistance = distance;
          index = i;
        }
      }
      return { maxDistance, index };
    };
  
    // Рассчитывает расстояние от точки до линии
    const pointToLineDistance = (point, lineStart, lineEnd) => {
      let x0 = point.x;
      let y0 = point.y;
      let x1 = lineStart.x;
      let y1 = lineStart.y;
      let x2 = lineEnd.x;
      let y2 = lineEnd.y;
      let num = Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1);
      let den = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
      return num / den;
    };
  
    const simplifySection = (points, epsilon) => {
      if (points.length < 3) return points;
  
      const { maxDistance, index } = findMaxDistance(points, points[0], points[points.length - 1]);
  
      if (maxDistance > epsilon) {
        let left = simplifySection(points.slice(0, index + 1), epsilon);
        let right = simplifySection(points.slice(index), epsilon);
        return left.slice(0, -1).concat(right);
      } else {
        return [points[0], points[points.length - 1]];
      }
    };
  
    return simplifySection(points, epsilon);
  }
  
  module.exports = rdpSimplifier;
  