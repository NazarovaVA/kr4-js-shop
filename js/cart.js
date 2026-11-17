import { getProductById } from './data.js';

const STORAGE_KEY = 'meow_cart';
const PROMO_KEY = 'meow_promo';

const VALID_PROMOS = {
    'MEOW10': 0.10,   // Скидка 10%
    'PUSHEEN': 0.15,  // Скидка 15%
    'SUPERCAT': 0.20  // Скидка 20%
};

// Получить массив товаров в корзине
export function getCart() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Сохранить корзину
function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartCounter(); // Обновляем счетчик в шапке
}

// Добавить товар в корзину
export function addToCart(id) {
    const product = getProductById(id);
    if (!product || !product.isAvailable) return false;

    let cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image_url: product.image_url,
            quantity: 1
        });
    }
    saveCart(cart);
    return true;
}

// Удалить товар из корзины полностью
export function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== Number(id));
    saveCart(cart);
}

// Изменить количество (например, -1 или +1)
export function updateQuantity(id, delta) {
    let cart = getCart();
    const item = cart.find(item => item.id === Number(id));
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(id);
            return;
        }
        saveCart(cart);
    }
}

// Очистить корзину
export function clearCart() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROMO_KEY);
    updateCartCounter();
}

// Считаем сумму без скидки (reduce)
export function getCartSubtotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Считаем размер скидки
export function getCartDiscount() {
    const subtotal = getCartSubtotal();
    const currentPromo = localStorage.getItem(PROMO_KEY);
    
    if (currentPromo && VALID_PROMOS[currentPromo]) {
        return subtotal * VALID_PROMOS[currentPromo];
    }
    return 0;
}

// Итоговая сумма со скидкой
export function getCartTotal() {
    return getCartSubtotal() - getCartDiscount();
}

// Обновить цифру на иконке корзины в шапке сайта
export function updateCartCounter() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counterEls = document.querySelectorAll('.cart-counter');
    
    counterEls.forEach(el => {
        el.textContent = totalItems;
        el.hidden = totalItems === 0; // Используем стандартный атрибут hidden
    });
}

// Отрисовка страницы cart.html
export function initCartPage() {
    const container = document.getElementById('cartContainer');
    if (!container) return; // Если мы не на странице корзины, выходим

    const totalEl = document.getElementById('cartTotalPrice');
    const discountEl = document.getElementById('cartDiscount');
    const promoInput = document.getElementById('promoInput');
    const applyPromoBtn = document.getElementById('applyPromoBtn');
    const promoMessage = document.getElementById('promoMessage');
    const summaryEl = document.getElementById('cartSummary');
    const clearBtn = document.getElementById('clearCartBtn');

    function renderCart() {
        const cart = getCart();
        container.replaceChildren(); // Очищаем контейнер

        // Если корзина пуста
        if (cart.length === 0) {
            const emptyBlock = document.createElement('div');
            emptyBlock.className = 'cart-empty';

            const emptyMsg = document.createElement('p');
            emptyMsg.className = 'cart-empty__text';
            emptyMsg.textContent = 'Ваша корзина пока пуста 😿';

            const emptyGif = document.createElement('div');
            emptyGif.className = 'cart-empty__gif';

            emptyBlock.append(emptyMsg, emptyGif);
            container.append(emptyBlock);
            return;
        }

        // Рендер товаров
        cart.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';

            const img = document.createElement('div');
            img.className = 'cart-item__image';
            img.style.backgroundImage = `url(${item.image_url})`;

            const info = document.createElement('div');
            info.className = 'cart-item__info';
            
            const title = document.createElement('h3');
            title.textContent = item.title;
            
            const price = document.createElement('div');
            price.className = 'cart-item__price';
            price.textContent = `${Math.round(item.price)} ₽`;

            const qtyBox = document.createElement('div');
            qtyBox.className = 'cart-item__qty';
            
            const minusBtn = document.createElement('button');
            minusBtn.type = 'button';
            minusBtn.textContent = '-';
            minusBtn.className = 'cart-btn-qty';
            minusBtn.addEventListener('click', () => { updateQuantity(item.id, -1); renderCart(); });

            const qtyText = document.createElement('span');
            qtyText.className = 'cart-item__qty-value';
            qtyText.textContent = item.quantity;

            const plusBtn = document.createElement('button');
            plusBtn.type = 'button';
            plusBtn.textContent = '+';
            plusBtn.className = 'cart-btn-qty';
            plusBtn.addEventListener('click', () => { updateQuantity(item.id, 1); renderCart(); });

            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.textContent = 'Удалить';
            delBtn.className = 'cart-item__delete';
            delBtn.addEventListener('click', () => { removeFromCart(item.id); renderCart(); });

            qtyBox.append(minusBtn, qtyText, plusBtn, delBtn);
            info.append(title, price, qtyBox);
            itemEl.append(img, info);
            container.append(itemEl);
        });

        // Обновляем суммы
        if (totalEl) totalEl.textContent = Math.round(getCartTotal());
        if (discountEl) discountEl.textContent = Math.round(getCartDiscount());
        
        // Показываем активный промокод при загрузке
        const currentPromo = localStorage.getItem(PROMO_KEY);
        if (currentPromo && promoInput && promoMessage) {
            promoInput.value = currentPromo;
            promoMessage.textContent = 'Промокод применен!';
            promoMessage.className = 'is-success'; // Используем CSS-класс
        }
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            clearCart();
            renderCart();
        });
    }

    if (applyPromoBtn && promoInput && promoMessage) {
        applyPromoBtn.addEventListener('click', () => {
            const code = promoInput.value.trim().toUpperCase();
            
            if (VALID_PROMOS[code]) {
                localStorage.setItem(PROMO_KEY, code);
                promoMessage.textContent = `Успех! Скидка ${VALID_PROMOS[code] * 100}%`;
                promoMessage.className = 'is-success'; // Зеленый цвет через CSS
                renderCart();
            } else {
                promoMessage.textContent = 'Неверный или просроченный промокод';
                promoMessage.className = 'is-error'; // Красный цвет через CSS
                localStorage.removeItem(PROMO_KEY);
                renderCart();
            }
        });
    }

    renderCart(); // Первый запуск
}