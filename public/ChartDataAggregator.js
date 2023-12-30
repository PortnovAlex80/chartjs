// /public/ChartDataAggregator.js
const generatePolyline = require('../geodetic/polylineErrorGenerator');
const rdpSimplifier = require('../filters/rdpSimplifier');
const findCornerPoints = require('../filters/leastSquaresLine')
const generateChartData = require('../utils/generateChartData');

function ChartDataAggregator() {
    const originalPoints = generatePolyline();
    const simplifiedPoints = rdpSimplifier(originalPoints, 0.25);
    const cornerPoints = findCornerPoints(originalPoints, 0.50);
  
    // Добавляйте дополнительные секции здесь
    // ...
  
    return generateChartData(originalPoints, simplifiedPoints, cornerPoints);
  }

  module.exports = ChartDataAggregator;
  
  
