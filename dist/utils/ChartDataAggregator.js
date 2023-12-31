"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/utils/ChartDataAggregator.ts
const polylineGenerator_1 = require("../sectiongenerators/polylineGenerator");
const generateChartData_1 = require("../utils/generateChartData");
function ChartDataAggregator() {
    const originalPoints = (0, polylineGenerator_1.generatePolyline)();
    // Добавляйте дополнительные секции здесь
    // ...
    return (0, generateChartData_1.generateChartData)(originalPoints);
}
exports.default = ChartDataAggregator;
