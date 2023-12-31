const precision = 3; // Это значение можно изменить, чтобы настроить точность во всём проекте
export function formatPoint(point) {
    return {
        x: point.x.toFixed(precision),
        y: point.y.toFixed(precision)
    };
}
