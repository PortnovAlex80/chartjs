// pointFormatter.js

const precision = 3; // This can be changed to adjust the precision throughout your project

function formatPoint(x, y) {
  return {
    x: x.toFixed(precision),
    y: y.toFixed(precision)
  };
}

module.exports = {
  formatPoint,
  precision
};
