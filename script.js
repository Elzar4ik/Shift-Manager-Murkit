let isLogHeaderAdded = false; // Прапорець для відстеження, чи додано заголовок зміни
let productsLog = {
    "паннакотики": [],
    "трайфли": [],
    "сендвічі": [],
    "чізкейки": [],
    "котики": []
};

// Функція для капіталізації першої літери
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Функція для форматування дати
function formatDate(date) {
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
}

// Функція для обчислення робочих годин
function calculateWorkHours(startShift, endShift, breakTime) {
    const [startHours, startMinutes] = startShift.split(":").map(Number);
    const [endHours, endMinutes] = endShift.split(":").map(Number);

    const start = startHours + startMinutes / 60;
    const end = endHours + endMinutes / 60;
    const totalHours = end - start - breakTime / 60;

    return totalHours.toFixed(2);
}

// Функція для оновлення опцій типу продукту
function updateTypeOptions(product, select) {
    const options = {
        "паннакотики": ["Розмальовано", "Залито"],
        "трайфли": ["Вишня", "Маракуя", "Карамель", "Вишня шоколад"],
        "сендвічі": ["Балик", "Бринза", "Лосось", "Сир базилік", "Червоний сир"],
        "чізкейки": ["Класичний", "Малиновий", "Шоколадний"],
        "котики": ["Білий", "Чорний", "Рудий"]
    };

    select.innerHTML = ""; // Очищаємо попередні опції

    // Якщо продукт має опції типу
    if (options[product]) {
        options[product].forEach(option => {
            const opt = document.createElement("option");
            opt.value = option.toLowerCase();
            opt.textContent = option;
            select.appendChild(opt);
        });
        select.style.display = "block";
    } else {
        select.style.display = "none"; // Якщо немає типів для цього продукту
    }
}

// Функція для оновлення історії продуктів
function updateProductLog() {
    const logList = document.getElementById("logList");
    logList.innerHTML = ""; // Очищаємо лог

    // Додаємо інформацію про зміну, якщо вона вже є
    if (isLogHeaderAdded) {
        const shiftInfo = document.createElement("li");
        
        // Додаємо інформацію про зміну
        const shiftDetails = `
            Дата: ${formatDate(new Date())}
            Час зміни: ${document.getElementById("shiftStart").value} - ${document.getElementById("shiftEnd").value}
            Перерва: ${document.getElementById("breakTime").value} хв
            Робочі години: ${calculateWorkHours(document.getElementById("shiftStart").value, document.getElementById("shiftEnd").value, document.getElementById("breakTime").value)} год.
        `;
        shiftInfo.textContent = shiftDetails;
        logList.appendChild(shiftInfo);
    }

    // Об'єднуємо лог для продуктів з однаковими типами
    const combinedProductsLog = {};

    for (const product in productsLog) {
        productsLog[product].forEach((logItem) => {
            const key = `${product}-${logItem.type}`; // Унікальний ключ для продукту та типу
            if (!combinedProductsLog[key]) {
                combinedProductsLog[key] = { type: logItem.type, quantity: 0 }; // Ініціалізація якщо ще не існує
            }
            combinedProductsLog[key].quantity += Number(logItem.quantity); // Сумуємо кількість
        });
    }

    // Додаємо зведену інформацію в лог
    for (const key in combinedProductsLog) {
        const [product, type] = key.split('-'); // Витягуємо продукт та тип з ключа
        const logEntry = document.createElement("li");

        const productText = document.createElement("span");
        productText.textContent = `${capitalizeFirstLetter(product)}: ${combinedProductsLog[key].type} - ${combinedProductsLog[key].quantity}`;
        
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Видалити";
        deleteButton.classList.add("delete-button");
        deleteButton.addEventListener("click", function () {
            // Логіка для видалення цього запису
            productsLog[product] = productsLog[product].filter(item => item.type !== combinedProductsLog[key].type);
            updateProductLog(); // Оновлюємо лог після видалення
        });

        logEntry.appendChild(productText);
        logEntry.appendChild(deleteButton);
        logList.appendChild(logEntry);
    }
}

// Додаємо слухача подій для кнопки "Додати продукт"
document.getElementById("addProduct").addEventListener("click", function () {
    const productSelect = document.getElementById("product");
    const quantityInput = document.getElementById("quantity");
    const typeSelect = document.getElementById("type");
    const product = productSelect.value;
    const quantity = quantityInput.value;
    const type = typeSelect.value ? capitalizeFirstLetter(typeSelect.value) : ''; // Оновлено для правильного вибору типу

    if (quantity && product && typeSelect.value) {  // Перевірка для заповнення типу продукту
        if (!isLogHeaderAdded) {
            isLogHeaderAdded = true; // Встановлюємо прапорець на true
        }

        // Додаємо продукт до логів
        productsLog[product].push({ type, quantity });
        updateProductLog();

        // Очищуємо поля
        productSelect.value = "паннакотики";
        quantityInput.value = "";
        updateTypeOptions("паннакотики", typeSelect);
    } else {
        alert("Будь ласка, заповніть всі поля та оберіть тип продукту.");
    }
});

// Додаємо слухача подій для кнопки "Скопіювати Зміну"
document.getElementById("copyShiftButton").addEventListener("click", function () {
    // Отримуємо значення з полів введення
    const shiftStart = document.getElementById("shiftStart").value;
    const shiftEnd = document.getElementById("shiftEnd").value;
    const breakTime = document.getElementById("breakTime").value;
    const workHours = calculateWorkHours(shiftStart, shiftEnd, breakTime);
    const logEntries = [];

    // Формуємо рядки для продуктів
    for (const product in productsLog) {
        const combinedProductsLog = {};
        productsLog[product].forEach(logItem => {
            if (!combinedProductsLog[logItem.type]) {
                combinedProductsLog[logItem.type] = 0; // Ініціалізуємо, якщо ще немає
            }
            combinedProductsLog[logItem.type] += Number(logItem.quantity); // Сумуємо кількість
        });

        // Формуємо рядок для кожного типу продукту
        let productLine = `${capitalizeFirstLetter(product)}: `;
        const productDetails = Object.keys(combinedProductsLog).map(type => {
            return `${type} - ${combinedProductsLog[type]}`; // Форматування типу і кількості
        }).join(", ");

        if (productDetails) {
            productLine += productDetails + ";"; // Додаємо деталі
            logEntries.push(productLine);
        }
    }

    // Формування фінального рядка для копіювання
    let copyText = `Дата: ${formatDate(new Date())}\n`;
    copyText += `Час зміни: ${shiftStart} - ${shiftEnd}\n`;
    copyText += `Перерва: ${breakTime} хв\n`;
    copyText += `Робочі години: ${workHours} год.\n\n`; // Додаємо пробіл
    copyText += logEntries.join("\n"); // Додаємо всі продукти

    // Копіюємо текст в буфер обміну
    navigator.clipboard.writeText(copyText).then(() => {
        alert("Зміну успішно скопійовано!");
    }).catch(err => {
        console.error("Не вдалося скопіювати: ", err);
    });
});


// Ініціалізація: показуємо тип продукту для "паннакотики" за замовчуванням
document.addEventListener("DOMContentLoaded", function () {
    const productSelect = document.getElementById("product");
    const typeSelect = document.getElementById("type");

    // Оновлюємо типи для вибраного продукту при завантаженні сторінки
    updateTypeOptions(productSelect.value, typeSelect);

    // Оновлюємо типи кожного разу, коли змінюється вибраний продукт
    productSelect.addEventListener("change", function () {
        updateTypeOptions(productSelect.value, typeSelect);
    });
});
