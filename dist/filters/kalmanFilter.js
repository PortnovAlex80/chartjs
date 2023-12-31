class KalmanFilter {
    constructor(initialState, initialErrorCovariance, processNoise, measurementNoise) {
        this.stateEstimate = initialState;
        this.errorCovariance = initialErrorCovariance;
        this.processNoise = processNoise;
        this.measurementNoise = measurementNoise;
    }
    update(measurement) {
        // Коррекция
        const kalmanGain = this.errorCovariance / (this.errorCovariance + this.measurementNoise);
        this.stateEstimate = this.stateEstimate + kalmanGain * (measurement - this.stateEstimate);
        this.errorCovariance = (1 - kalmanGain) * this.errorCovariance + this.processNoise;
    }
}
const kalmanFilter = (points, epsilon) => {
    const filteredPoints = [];
    const filter = new KalmanFilter(0, 1, 0.001, epsilon);
    points.forEach(point => {
        filter.update(point.y);
        filteredPoints.push({ x: point.x, y: filter.stateEstimate });
    });
    return filteredPoints;
};
export default kalmanFilter;
