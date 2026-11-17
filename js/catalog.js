import { products } from './data.js';
import { isFavorite, toggleFavorite } from './favorites.js';
import { addToCart } from './cart.js';

export function initCatalog() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return; // Защита для других страниц

    const searchInput = document.getElementById('searchInput');
    const countEl = document.getElementById('productCount');
    const emptyState = document.getElementById('catalogEmpty');
    const filtersForm = document.getElementById('filtersForm');
    const sortSelect = document.getElementById('sortSelect');
    const resetBtn = document.getElementById('resetFiltersBtn');

    // Логика сворачивания фильтров
    const filtersAside = document.getElementById('filtersAside');
    const filtersHeader = document.getElementById('filtersHeader');
    const filtersToggle = document.getElementById('filtersToggle');

    if (filtersHeader && filtersAside) {
        const setFiltersState = (isCollapsed) => {
            if (isCollapsed) {
                filtersAside.classList.add('filters--collapsed');
                filtersToggle.textContent = '▼';
                filtersToggle.setAttribute('aria-expanded', 'false');
                filtersToggle.setAttribute('aria-label', 'Развернуть фильтры');
            } else {
                filtersAside.classList.remove('filters--collapsed');
                filtersToggle.textContent = '▲';
                filtersToggle.setAttribute('aria-expanded', 'true');
                filtersToggle.setAttribute('aria-label', 'Свернуть фильтры');
            }
        };

        // Если ширина меньше 1024px (планшеты и мобилки) — сворачиваем сразу
        if (window.innerWidth <= 1023) {
            setFiltersState(true);
        }

        filtersHeader.addEventListener('click', () => {
            const isCurrentlyCollapsed = filtersAside.classList.contains('filters--collapsed');
            setFiltersState(!isCurrentlyCollapsed);
        });
    }

    function renderProducts(list) {
        grid.replaceChildren(); // Очищаем

        if (list.length === 0) {
            emptyState.hidden = false;
            countEl.textContent = 'Найдено товаров: 0';
            return;
        }

        emptyState.hidden = true;
        countEl.textContent = `Найдено товаров: ${list.length}`;

        list.forEach(product => {
            const card = document.createElement('article');
            card.className = 'product-card catalog-product-card';
            card.style.backgroundImage = `url(${product.image_url})`;

            const badge = document.createElement('div');
            badge.className = 'product-card__badge';
            
            // Безопасное назначение классов для бейджа
            if (!product.isAvailable) {
                badge.textContent = 'Нет в наличии';
                badge.classList.add('product-card__badge--out-of-stock');
            } else {
                badge.textContent = product.badge || '';
            }
            if (badge.textContent !== '') card.append(badge);

            const spacer = document.createElement('div');
            spacer.className = 'product-card__spacer';
            card.append(spacer);

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
                favBtn.setAttribute('aria-label', added ? 'Удалить из избранного' : 'Добавить в избранное');
                favBtn.setAttribute('aria-pressed', added ? 'true' : 'false');
            });

            card.append(favBtn);

            // --- Контент карточки ---
            const content = document.createElement('div');
            content.className = 'product-card__content';

            const name = document.createElement('div');
            name.className = 'product-card__name catalog-product-card__name';
            name.textContent = product.title;
            content.append(name);

            const info = document.createElement('div');
            info.className = 'product-card__info catalog-product-card__info';

            const price = document.createElement('div');
            price.className = 'product-card__price catalog-product-card__price';
            
            // Сначала выводим старую цену (если есть), потом новую
            if (product.oldPrice) {
                const oldPriceSpan = document.createElement('span');
                oldPriceSpan.className = 'product-card__old-price';
                oldPriceSpan.textContent = `${product.oldPrice} ₽`;
                price.append(oldPriceSpan);
            }
            
            const currentPriceSpan = document.createElement('span');
            currentPriceSpan.textContent = `${product.price} ₽`;
            price.append(currentPriceSpan);
            
            info.append(price);

            const actions = document.createElement('div');
            actions.className = 'product-card__actions catalog-product-card__actions';

            const moreBtn = document.createElement('a');
            moreBtn.className = 'product-card__more catalog-product-card__more';
            moreBtn.href = `product.html?id=${product.id}`;
            moreBtn.textContent = 'Подробнее';

            const buyBtn = document.createElement('button');
            buyBtn.className = 'product-card__buy catalog-product-card__buy';
            buyBtn.type = 'button';
            
            if (!product.isAvailable) {
                buyBtn.textContent = 'Нет в наличии';
                buyBtn.disabled = true;
            } else {
                buyBtn.textContent = 'В корзину';
                buyBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation(); 
                    addToCart(product.id);
                    
                    buyBtn.textContent = 'Добавлено!';
                    buyBtn.classList.add('is-added');
                    
                    setTimeout(() => {
                        buyBtn.textContent = 'В корзину';
                        buyBtn.classList.remove('is-added');
                    }, 1500);
                });
            }

            actions.append(moreBtn, buyBtn);
            info.append(actions);
            content.append(info);
            card.append(content);
            grid.append(card);
        });
    }

    function applyFilters() {
        let filtered = [...products]; // Копия массива для сортировки

        // 1. Поиск
        const query = searchInput.value.trim().toLowerCase();
        if (query) {
            filtered = filtered.filter(p => p.title.toLowerCase().includes(query));
        }

        // 2. Категории
        const checkedCats = Array.from(filtersForm.querySelectorAll('input[name="category"]:checked')).map(cb => cb.value);
        if (checkedCats.length > 0) {
            filtered = filtered.filter(p => checkedCats.includes(p.category));
        }

        // 3. Особенности
        const checkedFeatures = Array.from(filtersForm.querySelectorAll('input[name="feature"]:checked')).map(cb => cb.value);
        if (checkedFeatures.includes('discount')) filtered = filtered.filter(p => p.oldPrice !== undefined);
        if (checkedFeatures.includes('new')) filtered = filtered.filter(p => p.badge === 'Новинка');
        if (checkedFeatures.includes('hit')) filtered = filtered.filter(p => p.badge === 'Хит');

        // 4. Наличие
        const isInStock = filtersForm.querySelector('input[name="availability"]').checked;
        if (isInStock) {
            filtered = filtered.filter(p => p.isAvailable === true);
        }

        // 5. Цена
        const minPrice = Number(filtersForm.querySelector('input[name="price-min"]').value) || 0;
        const maxPrice = Number(filtersForm.querySelector('input[name="price-max"]').value) || Infinity;
        filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);

        // 6. Сортировка
        const sortValue = sortSelect.value;
        if (sortValue === 'price-asc') filtered.sort((a, b) => a.price - b.price);
        else if (sortValue === 'price-desc') filtered.sort((a, b) => b.price - a.price);
        else if (sortValue === 'new') filtered.sort((a, b) => (b.badge === 'Новинка' ? 1 : 0) - (a.badge === 'Новинка' ? 1 : 0));
        else if (sortValue === 'popular') filtered.sort((a, b) => b.rating - a.rating);

        renderProducts(filtered);
    }

    // Слушатели событий
    searchInput.addEventListener('input', applyFilters);
    sortSelect.addEventListener('change', applyFilters);
    filtersForm.addEventListener('submit', (e) => { e.preventDefault(); applyFilters(); });
    filtersForm.addEventListener('reset', () => setTimeout(applyFilters, 0));
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            filtersForm.reset();
            searchInput.value = '';
            applyFilters();
        });
    }

    applyFilters(); // Первый рендер
}