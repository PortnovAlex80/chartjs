"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPoint = void 0;
const precision = 3; // Это значение можно изменить, чтобы настроить точность во всём проекте
function formatPoint(point) {
    return {
        x: point.x.toFixed(precision),
        y: point.y.toFixed(precision)
    };
}
exports.formatPoint = formatPoint;
