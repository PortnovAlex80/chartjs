import { IPoint } from '../interfaces/IPoint';

function signOfPointRelativeToSegment(point: IPoint, segmentStart: IPoint, segmentEnd: IPoint): number {
    const segmentVector = { x: segmentEnd.x - segmentStart.x, y: segmentEnd.y - segmentStart.y };
    const pointVector = { x: point.x - segmentStart.x, y: point.y - segmentStart.y };
    const crossProduct = segmentVector.x * pointVector.y - segmentVector.y * pointVector.x;
    return Math.sign(crossProduct);
}

function distancePointToSegment(point: IPoint, segmentStart: IPoint, segmentEnd: IPoint): number {
    const px = segmentEnd.x - segmentStart.x;
    const py = segmentEnd.y - segmentStart.y;
    const norm = px * px + py * py;
    const u = ((point.x - segmentStart.x) * px + (point.y - segmentStart.y) * py) / norm;

    const closestPoint = u < 0 ? segmentStart : u > 1 ? segmentEnd : { x: segmentStart.x + u * px, y: segmentStart.y + u * py };
    const dx = point.x - closestPoint.x;
    const dy = point.y - closestPoint.y;

    return Math.sqrt(dx * dx + dy * dy) * signOfPointRelativeToSegment(point, segmentStart, segmentEnd);
}

function measureDistancesToPolyline(polylinePoints: IPoint[], targetPoints: IPoint[]): IPoint[] {
    return targetPoints.map(targetPoint => {
        let minDistance = Number.MAX_VALUE;
        let signedDistance = 0;

        for (let i = 0; i < polylinePoints.length - 1; i++) {
            const distance = distancePointToSegment(targetPoint, polylinePoints[i], polylinePoints[i + 1]);
            if (Math.abs(distance) < Math.abs(minDistance)) {
                minDistance = distance;
                signedDistance = distance;
            }
        }

        return {
            x: targetPoint.x, // Сохраняем координату X точки измерения
            y: signedDistance  // Знаковое расстояние до полилинии как координата Y
        };
    });
}

export { measureDistancesToPolyline };
