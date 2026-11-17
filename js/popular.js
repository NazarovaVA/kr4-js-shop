import { products } from './data.js';
import { isFavorite, toggleFavorite } from './favorites.js';
import { addToCart } from './cart.js';

export function initPopular() {
    const grid = document.getElementById('popularGrid');
    if (!grid) return; // Защита для других страниц

    // Берем товары с бейджем "Хит", максимум 6 штук
    const popularItems = products.filter(p => p.badge === 'Хит').slice(0, 6);
    
    // Если хитов нет, берем первые 5 товаров
    const itemsToRender = popularItems.length > 0 ? popularItems : products.slice(0, 5);

    itemsToRender.forEach(product => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.style.backgroundImage = `url(${product.image_url})`;

        const badge = document.createElement('div');
        badge.className = 'product-card__badge';
        badge.textContent = product.badge || '';
        if (badge.textContent !== '') card.append(badge);

        const spacer = document.createElement('div');
        spacer.className = 'product-card__spacer';
        card.append(spacer);

        const content = document.createElement('div');
        content.className = 'product-card__content';

        const name = document.createElement('div');
        name.className = 'product-card__name';
        name.textContent = product.title;
        content.append(name);

        const info = document.createElement('div');
        info.className = 'product-card__info';

        const price = document.createElement('div');
        price.className = 'product-card__price';
        price.textContent = `${product.price} ₽`;
        info.append(price);

        const actions = document.createElement('div');
        actions.className = 'product-card__actions';

        const moreBtn = document.createElement('a');
        moreBtn.className = 'product-card__more';
        moreBtn.href = `product.html?id=${product.id}`;
        moreBtn.textContent = 'Подробнее';

        // --- Кнопка В корзину ---
        const buyBtn = document.createElement('button');
        buyBtn.className = 'product-card__buy'; // Убрали класс из каталога
        buyBtn.type = 'button';
        
        if (!product.isAvailable) {
            buyBtn.textContent = 'Нет в наличии';
            buyBtn.disabled = true; // Браузер сам сделает кнопку неактивной (стили в CSS)
        } else {
            buyBtn.textContent = 'В корзину';
            buyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); 
                addToCart(product.id);
                
                buyBtn.textContent = 'Добавлено!';
                buyBtn.classList.add('is-added'); // Меняем цвет через CSS
                
                setTimeout(() => {
                    buyBtn.textContent = 'В корзину';
                    buyBtn.classList.remove('is-added');
                }, 1500);
            });
        }

        // --- Кнопка Избранное ---
        const favBtn = document.createElement('button');
        favBtn.className = 'product-card__favorite';
        favBtn.type = 'button';
        
        const isFav = isFavorite(product.id);
        favBtn.textContent = isFav ? '♥' : '♡';
        favBtn.setAttribute('aria-label', isFav ? 'Удалить из избранного' : 'Добавить в избранное');
        favBtn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
        if (isFav) favBtn.classList.add('is-active');

        favBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            e.stopPropagation();
            
            const added = toggleFavorite(product.id);
            favBtn.textContent = added ? '♥' : '♡';
            favBtn.classList.toggle('is-active', added);
            
            // Обновляем доступность
            favBtn.setAttribute('aria-label', added ? 'Удалить из избранного' : 'Добавить в избранное');
            favBtn.setAttribute('aria-pressed', added ? 'true' : 'false');
        });

        card.append(favBtn);
        actions.append(moreBtn, buyBtn);
        info.append(actions);
        content.append(info);
        card.append(content);
        grid.append(card);
    });

    // --- Логика стрелочек ---
    const prevBtn = document.getElementById('popPrev');
    const nextBtn = document.getElementById('popNext');
    const SCROLL_STEP = 350; // Ширина карточки + отступ

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => {
            grid.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            grid.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' });
        });
    }
}