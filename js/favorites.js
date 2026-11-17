import { products } from './data.js';
const STORAGE_KEY = 'meow_favorites';

// Получить массив id избранных товаров
export function getFavorites() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Проверить, находится ли товар в избранном
export function isFavorite(id) {
    return getFavorites().includes(Number(id));
}

// Добавить/удалить товар из избранного. Возвращает true, если товар добавлен.
export function toggleFavorite(id) {
    let favorites = getFavorites();
    const numericId = Number(id);
    
    if (favorites.includes(numericId)) {
        favorites = favorites.filter(favId => favId !== numericId);
    } else {
        favorites.push(numericId);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    updateFavCounter(); // Обновляем счетчик
    return favorites.includes(numericId); 
}

// Отрисовка страницы favorites.html
export function initFavoritesPage() {
    const grid = document.getElementById('favoritesGrid');
    if (!grid) return; // Если мы не на странице избранного, выходим

    const emptyBlock = document.getElementById('favoritesEmpty');
    const favIds = getFavorites(); // Берем массив ID из localStorage

    // Если избранное пустое
    if (favIds.length === 0) {
        grid.style.display = 'none';
        if (emptyBlock) emptyBlock.style.display = 'flex';
        return;
    }

    // Если есть товары — рендерим их
    grid.style.display = 'grid';
    if (emptyBlock) emptyBlock.style.display = 'none';
    
    grid.replaceChildren(); // Очищаем перед рендером

    // Находим полные данные товаров по их ID
    const favProducts = products.filter(p => favIds.includes(p.id));

    favProducts.forEach(product => {
        const card = document.createElement('article');
        card.className = 'product-card catalog-product-card';
        card.style.backgroundImage = `url(${product.image_url})`;

        const spacer = document.createElement('div');
        spacer.className = 'product-card__spacer';
        card.append(spacer);

        const content = document.createElement('div');
        content.className = 'product-card__content is-visible'; // Добавляем класс для видимости

        const name = document.createElement('div');
        name.className = 'product-card__name';
        name.textContent = product.title;

        const info = document.createElement('div');
        info.className = 'product-card__info';
        
        const price = document.createElement('div');
        price.className = 'product-card__price';
        price.textContent = `${product.price} ₽`;

        const actions = document.createElement('div');
        actions.className = 'product-card__actions';

        const moreBtn = document.createElement('a');
        moreBtn.className = 'product-card__more';
        moreBtn.href = `product.html?id=${product.id}`;
        moreBtn.textContent = 'Подробнее';

        // Кнопка удаления из избранного
        const removeBtn = document.createElement('button');
        removeBtn.className = 'product-card__buy';
        removeBtn.type = 'button'; // Важно для кнопок
        removeBtn.textContent = 'Удалить';
        
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleFavorite(product.id); // Удаляем из памяти
            initFavoritesPage(); // Перерисовываем страницу
        });

        actions.append(moreBtn, removeBtn);
        info.append(price, actions);
        content.append(name, info);
        card.append(content);
        grid.append(card);
    });
}

// Функция для обновления счетчика в шапке сайта
export function updateFavCounter() {
    const favs = getFavorites();
    const counterEls = document.querySelectorAll('.fav-counter');
    
    counterEls.forEach(el => {
        el.textContent = favs.length;
        el.hidden = favs.length === 0; // Если 0, ставим hidden = true
    });
}