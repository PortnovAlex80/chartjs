// geodetic.js
const generateError = require('./errorGenerator'); // Импортируем функцию generateError
const { formatPoint } = require('../utils/pointFormatter');

  function generatePoints() {
    const points = [];
    let x = 0;
    const step = 1;
    const length = 100;
    const precision = 3;
  
    for (let i = 0; i <= length; i++) {
      const errorX = generateError();
      const errorY = generateError();
  
      const point = formatPoint(x + errorX, errorY);
  
      points.push(point);
      x += step;
    }
  
    return points;
  }
  
  module.exports = generatePoints;
  