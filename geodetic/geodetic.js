// geodetic.js
function generateError() {
    return (Math.random() - 0.5) * 0.2; // Генерируем от -0.1 до 0.1
  }
  
  function generatePoints() {
    const points = [];
    let x = 0;
    const step = 1;
    const length = 100;
    const precision = 3;
  
    for (let i = 0; i <= length; i++) {
      const errorX = generateError();
      const errorY = generateError();
  
      const point = {
        x: (x + errorX).toFixed(precision),
        y: (errorY).toFixed(precision),
        // Добавьте другие данные о съемке, если необходимо
      };
  
      points.push(point);
      x += step;
    }
  
    return points;
  }
  
  module.exports = generatePoints;
  