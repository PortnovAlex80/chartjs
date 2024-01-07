// src/script.ts
import { createLineChartData } from './chartDataGenerators/createLineChartData.js';
import { createScatterChartData } from './chartDataGenerators/createScatterChartData.js';
// import { Chart } from 'chart.js';
declare var Chart: any;


// Функция для отправки POST запроса на сервер
async function updateCoordinates(coordinateA: number, coordinateB: number) {
  try {
    const response = await fetch('/update-coordinates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ coordinateA, coordinateB })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data.message);

    // Здесь вызовите функцию для обновления графика
    await loadData(); // просто вызываем лоад дата и эта функция все сделает.

  } catch (error) {
    console.error('Ошибка при обновлении координат:', error);
  }
}

async function loadData() {

  console.log("START SCRIpt")
  try {
    const response = await fetch('/data');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Длина данных ${data.length}`)

    const chartType: string = "scatter"; // 'line'-'scatter'

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
    
    
    const canvas = document.getElementById('myChart') as HTMLCanvasElement | null;
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
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  }
}

// Функция для инициализации обработчиков событий
function initializeEventHandlers() {
  const coordAInput = document.getElementById('coordinateA') as HTMLInputElement | null;
  const coordBInput = document.getElementById('coordinateB') as HTMLInputElement | null;
  const increaseAButton = document.getElementById('increaseA') as HTMLButtonElement | null;
  const decreaseAButton = document.getElementById('decreaseA') as HTMLButtonElement | null;
  const increaseBButton = document.getElementById('increaseB') as HTMLButtonElement | null;
  const decreaseBButton = document.getElementById('decreaseB') as HTMLButtonElement | null;
  const moveLeftButton = document.getElementById('moveLeft') as HTMLButtonElement | null;;
  const moveRightButton = document.getElementById('moveRight') as HTMLButtonElement | null;;

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


