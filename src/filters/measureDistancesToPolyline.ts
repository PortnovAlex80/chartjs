import { IPoint } from '../interfaces/IPoint';

interface IDistanceMeasurement {
    distance: number;
    xCoordinate: number; // Координата X точки измерения
}

function distancePointToSegment(point: IPoint, segmentStart: IPoint, segmentEnd: IPoint): number {
    const px = segmentEnd.x - segmentStart.x;
    const py = segmentEnd.y - segmentStart.y;
    const norm = px * px + py * py;
    const u = ((point.x - segmentStart.x) * px + (point.y - segmentStart.y) * py) / norm;

    const closestPoint = u < 0 ? segmentStart : u > 1 ? segmentEnd : { x: segmentStart.x + u * px, y: segmentStart.y + u * py };
    const dx = point.x - closestPoint.x;
    const dy = point.y - closestPoint.y;

    return Math.sqrt(dx * dx + dy * dy);
}

function measureDistancesToPolyline(polylinePoints: IPoint[], targetPoints: IPoint[]): IDistanceMeasurement[] {
    return targetPoints.map(targetPoint => {
        let minDistance = Number.MAX_VALUE;

        for (let i = 0; i < polylinePoints.length - 1; i++) {
            const distance = distancePointToSegment(targetPoint, polylinePoints[i], polylinePoints[i + 1]);
            minDistance = Math.min(minDistance, distance);
        }

        return {
            xCoordinate: targetPoint.x,       // Сохраняем координату X точки измерения
            distance: minDistance
        };
    });
}

export { measureDistancesToPolyline };
