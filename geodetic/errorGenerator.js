// Функция для генерации случайной погрешности
function generateError() {
    return (Math.random() - 0.5) * 0.2; // Генерируем от -0.1 до 0.1
  }
  
  module.exports = generateError;
  