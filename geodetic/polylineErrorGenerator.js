// polylineGenerator.js
const generateError = require('./errorGenerator');
const { formatPoint } = require('../utils/pointFormatter');

// Захардкоженный массив вершин
const vertices = [
  { x: 0, y: 0, angle: 0, length: 50 },
  { angle: 30, length: 20 },
  { angle: 0, length: 10 },
  { angle: -30, length: 20 },
  { angle: 0, length: 50 }
];

function generatePolylineWithVertices(vertices, errorFunction) {
  const points = [];
  let currentX = 0;
  let currentY = 0;
  
  vertices.forEach(vertex => {
    const angleRadians = vertex.angle * Math.PI / 180;
    for (let i = 0; i < vertex.length; i++) {
      currentX += Math.cos(angleRadians) + errorFunction();
      currentY += Math.sin(angleRadians) + errorFunction();
      points.push(formatPoint(currentX, currentY));
    }
  });
  
  return points;
}

function generatePolyline() {
  return generatePolylineWithVertices(vertices, generateError);
}

module.exports = generatePolyline;
