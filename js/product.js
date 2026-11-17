// js/product.js
import { getProductById } from './data.js';
import { isFavorite, toggleFavorite } from './favorites.js';
import { addToCart } from './cart.js';

export function initProduct() {
    const productSection = document.querySelector('.product');
    if (!productSection) return; // Защита для других страниц

    // Получаем id из URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    const titleEl = document.querySelector('.product__title');
    const priceEl = document.querySelector('.product__price');
    const descEl = document.querySelector('.product__description');
    const badgeEl = document.querySelector('.product__badge');
    const imgEl = document.querySelector('.product__image');
    const tableBody = document.querySelector('.product__table-body');
    const cartBtn = document.getElementById('productAddToCartBtn');
    const favBtn = document.getElementById('productFavBtn');

    if (!id) {
        if (titleEl) titleEl.textContent = 'Товар не выбран';
        if (priceEl) priceEl.textContent = '';
        if (descEl) descEl.textContent = 'Пожалуйста, вернитесь в каталог и выберите товар.';
        return;
    }

    const product = getProductById(id);

    if (!product) {
        if (titleEl) titleEl.textContent = 'Товар не найден 😿';
        if (priceEl) priceEl.textContent = '';
        if (descEl) descEl.textContent = 'Возможно, он был удален или ссылка неверна.';
        return;
    }

    // 1. Заполняем текстовые данные
    document.title = `Meow Market - ${product.title}`;
    
    if (titleEl) titleEl.textContent = product.title;
    if (descEl) descEl.textContent = product.description;
    
    if (priceEl) {
        priceEl.replaceChildren(); // Очищаем перед вставкой (защита от дублирования)
        
        if (product.oldPrice) {
            const oldSpan = document.createElement('span');
            oldSpan.className = 'product__old-price'; // Используем CSS-класс
            oldSpan.textContent = `${product.oldPrice} ₽`;
            priceEl.append(oldSpan);
        }
        
        const currentPriceSpan = document.createElement('span');
        currentPriceSpan.textContent = `${product.price} ₽`;
        priceEl.append(currentPriceSpan);
    }

    if (badgeEl) {
        if (product.badge) {
            badgeEl.textContent = product.badge;
            badgeEl.classList.remove('product__badge--hidden');
        } else {
            badgeEl.classList.add('product__badge--hidden');
        }
    }

    // 2. Ставим картинку
    if (imgEl) {
        imgEl.style.backgroundImage = `url(${product.image_url})`;
    }

    // 3. Генерируем таблицу характеристик
    if (tableBody && product.characteristics) {
        tableBody.replaceChildren(); // Очищаем таблицу
        Object.entries(product.characteristics).forEach(([key, value]) => {
            const tr = document.createElement('tr');
            
            const th = document.createElement('th');
            th.scope = 'row';
            th.textContent = key;
            
            const td = document.createElement('td');
            td.textContent = value;
            
            tr.append(th, td);
            tableBody.append(tr);
        });
    }

    // 4. Настраиваем кнопку "Добавить в корзину"
    if (cartBtn) {
        if (!product.isAvailable) {
            cartBtn.textContent = 'Нет в наличии';
            cartBtn.disabled = true; // Браузер сам применит стили для :disabled
        } else {
            cartBtn.addEventListener('click', () => {
                addToCart(product.id);
                
                // Визуальный отклик через CSS-класс
                const originalText = cartBtn.textContent;
                cartBtn.textContent = 'Добавлено! ✓';
                cartBtn.classList.add('button--success');
                
                setTimeout(() => {
                    cartBtn.textContent = originalText;
                    cartBtn.classList.remove('button--success');
                }, 1500);
            });
        }
    }

    // 5. Настраиваем кнопку "В избранное"
    if (favBtn) {
        const updateFavState = () => {
            const isFav = isFavorite(product.id);
            favBtn.textContent = isFav ? '♥ В избранном' : '♡ В избранное';
            
            // Управляем цветом через класс
            if (isFav) {
                favBtn.classList.add('is-active');
            } else {
                favBtn.classList.remove('is-active');
            }
        };

        updateFavState(); // Проверяем при загрузке

        favBtn.addEventListener('click', () => {
            toggleFavorite(product.id);
            updateFavState(); // Обновляем кнопку после клика
        });
    }
}