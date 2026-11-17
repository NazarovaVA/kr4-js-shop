import { products } from './data.js';
import { clearCart } from './cart.js';

export function initOrderForm() {
    const form = document.getElementById('orderForm');
    if (!form) return; // Защита для других страниц

    // --- 1. ЛОГИКА АВТОЗАПОЛНЕНИЯ ---
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    
    const cartData = localStorage.getItem('meow_cart');
    const cartItems = cartData ? JSON.parse(cartData) : [];

    const productInput = document.getElementById('orderProduct');
    const articleInput = document.getElementById('orderArticle');

    if (productId) {
        // Если пришли со страницы товара
        const product = products.find(p => p.id === Number(productId));
        if (product) {
            if (productInput) productInput.value = product.title;
            if (articleInput) articleInput.value = product.article || product.id;
        }
    } else if (cartItems.length > 0) {
        // Если пришли из корзины
        const titles = cartItems.map(item => item.title).join(', ');
        if (productInput) productInput.value = titles;
        if (articleInput) articleInput.value = 'Заказ из корзины';
    }

    // --- 2. ЛОГИКА ВАЛИДАЦИИ ---
    const nameInput = document.getElementById('orderName');
    const emailInput = document.getElementById('orderEmail');
    const phoneInput = document.getElementById('orderPhone');
    const agreeInput = document.getElementById('orderAgree');

    // Защита: если полей нет на странице, прекращаем выполнение
    if (!nameInput || !emailInput || !phoneInput || !agreeInput) return;

    // Функция для вывода ошибки
    function showError(fieldName, message) {
        const errorEl = document.querySelector(`[data-error-for="${fieldName}"]`);
        if (errorEl) errorEl.textContent = message;
    }

    // Функция для очистки ошибки конкретного поля
    function clearError(fieldName) {
        const errorEl = document.querySelector(`[data-error-for="${fieldName}"]`);
        if (errorEl) errorEl.textContent = '';
    }

    // Функция для очистки всех ошибок
    function clearAllErrors() {
        document.querySelectorAll('.order-form__error').forEach(el => el.textContent = '');
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Отменяем перезагрузку страницы
        clearAllErrors();
        let isValid = true;

        // Валидация Имени
        if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
            showError('name', 'Пожалуйста, введите имя (минимум 2 буквы)');
            isValid = false;
        }

        // Валидация Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            showError('email', 'Введите корректный e-mail (например, test@mail.ru)');
            isValid = false;
        }

        // Валидация Телефона
        const phoneRegex = /^\+?[0-9\s\-\(\)]{10,18}$/;
        if (!phoneRegex.test(phoneInput.value.trim())) {
            showError('phone', 'Введите корректный номер телефона');
            isValid = false;
        }

        // Валидация Чекбокса
        if (!agreeInput.checked) {
            showError('agree', 'Необходимо согласие на обработку данных');
            isValid = false;
        }

        // Если форма заполнена правильно
        if (isValid) {
            const successModal = document.getElementById('successModal');
            if (successModal) {
                successModal.classList.add('modal--open');
            }

            clearCart(); // Очищаем корзину
            form.reset(); // Очищаем форму
        }
    });

    // Очищаем ошибку только того поля, в которое начали вводить текст
    nameInput.addEventListener('input', () => clearError('name'));
    emailInput.addEventListener('input', () => clearError('email'));
    phoneInput.addEventListener('input', () => clearError('phone'));
    
    // Очищаем ошибку чекбокса при его изменении
    agreeInput.addEventListener('change', () => {
        if (agreeInput.checked) clearError('agree');
    });
}