var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// src/script.ts
import { createLineChartData } from './chartDataGenerators/createLineChartData.js';
import { createScatterChartData } from './chartDataGenerators/createScatterChartData.js';
// Функция для отправки POST запроса на сервер
function updateCoordinates(coordinateA, coordinateB) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('/update-coordinates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ coordinateA, coordinateB })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = yield response.json();
            console.log(data.message);
            // Здесь вызовите функцию для обновления графика
            yield loadData(); // просто вызываем лоад дата и эта функция все сделает.
        }
        catch (error) {
            console.error('Ошибка при обновлении координат:', error);
        }
    });
}
function loadData() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("START SCRIpt");
        try {
            const response = yield fetch('/data');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = yield response.json();
            console.log(`Длина данных ${data.length}`);
            const chartType = "scatter"; // 'line'-'scatter'
            let chartData;
            switch (chartType) {
                case "line":
                    chartData = createLineChartData(data);
                    break;
                case "scatter":
                    chartData = createScatterChartData(data);
                    break;
                default:
                    throw new Error('Неизвестный тип графика');
            }
            const canvas = document.getElementById('myChart');
            if (!canvas) {
                throw new Error('Элемент canvas не найден');
            }
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Не удалось получить контекст для canvas');
            }
            new Chart(ctx, {
                type: chartType,
                data: chartData
            });
        }
        catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    });
}
// Функция для инициализации обработчиков событий
function initializeEventHandlers() {
    const coordAInput = document.getElementById('coordinateA');
    const coordBInput = document.getElementById('coordinateB');
    const increaseAButton = document.getElementById('increaseA');
    const decreaseAButton = document.getElementById('decreaseA');
    const increaseBButton = document.getElementById('increaseB');
    const decreaseBButton = document.getElementById('decreaseB');
    const moveLeftButton = document.getElementById('moveLeft');
    ;
    const moveRightButton = document.getElementById('moveRight');
    ;
    if (coordAInput && coordBInput && increaseAButton && decreaseAButton && increaseBButton && decreaseBButton) {
        increaseAButton.addEventListener('click', () => {
            coordAInput.value = (parseFloat(coordAInput.value) + 1).toString();
            updateCoordinates(parseFloat(coordAInput.value), parseFloat(coordBInput.value));
        });
        decreaseAButton.addEventListener('click', () => {
            coordAInput.value = (parseFloat(coordAInput.value) - 1).toString();
            updateCoordinates(parseFloat(coordAInput.value), parseFloat(coordBInput.value));
        });
        increaseBButton.addEventListener('click', () => {
            coordBInput.value = (parseFloat(coordBInput.value) + 1).toString();
            updateCoordinates(parseFloat(coordAInput.value), parseFloat(coordBInput.value));
        });
        decreaseBButton.addEventListener('click', () => {
            coordBInput.value = (parseFloat(coordBInput.value) - 1).toString();
            updateCoordinates(parseFloat(coordAInput.value), parseFloat(coordBInput.value));
        });
    }
    if (coordAInput && coordBInput && moveLeftButton && moveRightButton) {
        moveLeftButton.addEventListener('click', () => {
            coordAInput.value = (parseFloat(coordAInput.value) - 1).toString();
            coordBInput.value = (parseFloat(coordBInput.value) - 1).toString();
            updateCoordinates(parseFloat(coordAInput.value), parseFloat(coordBInput.value));
        });
        moveRightButton.addEventListener('click', () => {
            coordAInput.value = (parseFloat(coordAInput.value) + 1).toString();
            coordBInput.value = (parseFloat(coordBInput.value) + 1).toString();
            updateCoordinates(parseFloat(coordAInput.value), parseFloat(coordBInput.value));
        });
    }
}
// Инициализация обработчиков событий при загрузке страницы
window.addEventListener('load', () => {
    initializeEventHandlers();
    loadData();
});
