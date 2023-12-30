//generateChartData.js

function randomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  function generateChartData(...pointsArrays) {
    return pointsArrays.map(points => {
      return {
        label: 'Полилиния',
        data: points.map(point => ({ x: point.x, y: point.y })),
        borderColor: randomColor(),
        borderWidth: 2,
        fill: false,
      };
    });
  }
  
  module.exports = generateChartData;
  
  
  
