// /public/ChartDataAggregator.js
const generatePolyline = require('../geodetic/polylineErrorGenerator');
const rdpSimplifier = require('../filtres/rdpSimplifier');

const generateChartData = require('../utils/generateChartData');

function ChartDataAggregator() {
    const originalPoints = generatePolyline();
    const simplifiedPoints = rdpSimplifier(originalPoints, 0.25);
  
    // Добавляйте дополнительные секции здесь
    // ...
  
    return generateChartData(originalPoints, simplifiedPoints);
  }
  
  module.exports = ChartDataAggregator;
  
  
  module.exports = ChartDataAggregator;
  
