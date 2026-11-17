'use strict';

import { initCatalog } from './catalog.js';
import { initPopular } from './popular.js';
import { initProduct } from './product.js';
import { initOrderForm } from './validation.js';
import { initCartPage, updateCartCounter } from './cart.js';
import { initFavoritesPage, updateFavCounter } from './favorites.js';

// ==========================================================
// Модальное окно
// ==========================================================
const successModal = document.getElementById('successModal');

function closeModal() {
	if (successModal) successModal.classList.remove('modal--open');
}

if (successModal) {
	successModal.querySelectorAll('[data-modal-close]').forEach(el => {
		el.addEventListener('click', closeModal);
	});
}

// Закрытие по Esc (работает и для модалки, и для панели с котом)
document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		closeModal();
		const catPanel = document.getElementById('panel');
		if (catPanel) catPanel.classList.remove('cat-panel--open');
	}
});

// ==========================================================
// Горизонтальная прокрутка для отзывов
// ==========================================================
const reviewsTrack = document.getElementById('revTrack');
const reviewsPrev  = document.getElementById('revPrev');
const reviewsNext  = document.getElementById('revNext');
const REVIEW_STEP  = 330;

if (reviewsNext && reviewsTrack && reviewsPrev) {
	reviewsNext.addEventListener('click', () => {
		const max = reviewsTrack.scrollWidth - reviewsTrack.clientWidth;
		if (reviewsTrack.scrollLeft >= max - 1) {
			reviewsTrack.scrollTo({ left: 0, behavior: 'smooth' });
		} else {
			reviewsTrack.scrollBy({ left: REVIEW_STEP, behavior: 'smooth' });
		}
	});

	reviewsPrev.addEventListener('click', () => {
		if (reviewsTrack.scrollLeft <= 0) {
			reviewsTrack.scrollTo({ left: reviewsTrack.scrollWidth, behavior: 'smooth' });
		} else {
			reviewsTrack.scrollBy({ left: -REVIEW_STEP, behavior: 'smooth' });
		}
	});
}

// ==========================================================
// Слайдер шагов оформления товаров
// ==========================================================
const stepSlides = document.querySelectorAll('.step-card__slide');
const stepDots = document.querySelectorAll('.step-card__dot');
const stepCard = document.getElementById('stepCard');
const stepSection = document.querySelector('.how-to-order');

let stepIndex = 0;
let stepTimer = null;

function showStep(n) {
	stepIndex = n;
	stepSlides.forEach((s, k) => s.classList.toggle('step-card__slide--active', k === n));
	stepDots.forEach((d, k) => d.classList.toggle('step-card__dot--active', k === n));
}

const nextStep = () => showStep((stepIndex + 1) % stepSlides.length);
const startStep = () => { stepTimer ??= setInterval(nextStep, 3000); };
const stopStep = () => { clearInterval(stepTimer); stepTimer = null; };

if (stepCard && stepSection) {
	stepCard.addEventListener('click', () => {
		nextStep();
		stopStep();
		startStep();
	});

	stepDots.forEach(dot => dot.addEventListener('click', (e) => {
		e.stopPropagation();
		showStep(+dot.dataset.index);
		stopStep();
		startStep();
	}));

	stepCard.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			nextStep();
			stopStep();
			startStep();
		}
	});

	new IntersectionObserver(
		([entry]) => entry.isIntersecting ? startStep() : stopStep(),
		{ threshold: 0.5 }
	).observe(stepSection);
}

// ==========================================================
// Печатающиеся факты (обход CORS)
// ==========================================================
const factCard = document.querySelector('.fact-card');
const factText = document.querySelector('.fact-card__text');
const PROXY_URL = 'https://corsproxy.io/?key=529630cd&url=';

async function fetchWithTimeout(url, ms = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function translateText(text, targetLang = 'ru') {
	const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const data = await res.json();
	return data[0].map(sentence => sentence[0]).join(' ');
}

async function getFact() {
	if (!factText) return;
	factText.textContent = ''; // Безопасная очистка
	
	try {
		const targetUrl = 'https://catfact.ninja/fact';
		const finalUrl = `${PROXY_URL}${encodeURIComponent(targetUrl)}`;
		const res = await fetchWithTimeout(finalUrl);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();
		const factTextRu = await translateText(data.fact, 'ru');
		typeLetter(factTextRu, factText, 0, 40);
	} catch (err) {
		factText.textContent = 'Самый богатый кот в мире стоит 13 миллионов долларов...'; // Безопасно
		console.error('Ошибка:', err);
	}
}

if (factCard) {
	factCard.addEventListener('click', () => getFact());
}

// ==========================================================
// Выезжающая панель с котом
// ==========================================================
const catPanel = document.getElementById('panel');
const catImageWrap = document.querySelector('.cat-panel__content');
const openCatBtn = document.getElementById('openCatBtn');
const closeCatBtn = document.getElementById('closeCatBtn');

async function getCat() {
	if (!catImageWrap) return;
	try {
		catImageWrap.textContent = 'Загрузка...';
		const targetUrl = 'https://aleatori.cat/random.json';
		const finalUrl = `${PROXY_URL}${encodeURIComponent(targetUrl)}`;
		const res = await fetchWithTimeout(finalUrl);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();
		
		// Безопасное создание картинки
		const img = document.createElement('img');
		img.src = data.url;
		img.alt = 'Фото кота';
		catImageWrap.replaceChildren(img);
	} catch (err) {
		const img = document.createElement('img');
		img.src = '../images/best-cat.jpg';
		img.alt = 'Фото кота';
		catImageWrap.replaceChildren(img);
		console.error('Ошибка:', err);
	}
}

if (openCatBtn && catPanel) {
	openCatBtn.addEventListener('click', () => {
		catPanel.classList.add('cat-panel--open');
		getCat();
	});
}

if (closeCatBtn && catPanel) {
	closeCatBtn.addEventListener('click', () => catPanel.classList.remove('cat-panel--open'));
}

// ==========================================================
// Печатающийся заголовок
// ==========================================================
const heroTitle = document.querySelector('.hero__title');
const fullTextHeader = 'Добро пожаловать в Meow Market — магазин, где живёт любовь к котам ♥';

function typeLetter(fullText, element, i, speed) {
	if (i < fullText.length) {
		element.textContent += fullText[i];
		i++;
		setTimeout(() => typeLetter(fullText, element, i, speed), speed);
	}
}

// ==========================================================
// Кнопка наверх
// ==========================================================
const scrollTopBtn = document.getElementById('scrollTop');

if (scrollTopBtn) {
	window.addEventListener('scroll', () => {
		if (window.scrollY > 400) {
			scrollTopBtn.classList.add('scroll-top--visible');
		} else {
			scrollTopBtn.classList.remove('scroll-top--visible');
		}
	});

	scrollTopBtn.addEventListener('click', () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	});
}

// ==========================================================
// Карточки преимуществ (тач-устройства)
// ==========================================================
const isTouch = window.matchMedia('(hover: none)').matches;

if (isTouch) {
	document.querySelectorAll('.advantage-card').forEach(card => {
		card.setAttribute('role', 'button');
		card.setAttribute('tabindex', '0');
		card.setAttribute('aria-expanded', 'false');

		const toggle = () => {
			const flipped = card.classList.toggle('advantage-card--flipped');
			card.setAttribute('aria-expanded', flipped);
		};

		card.addEventListener('click', toggle);
		card.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				toggle();
			}
		});
	});
}

// ==========================================================
// Карточки товаров: показать контент по клику (тач-устройства)
// ==========================================================
if (isTouch) {
	document.addEventListener('click', (e) => {
		if (e.target.closest('a') || e.target.closest('button')) return; // Игнорируем клики по ссылкам и кнопкам

		const card = e.target.closest('.product-card');
		if (!card) return;

		document.querySelectorAll('.product-card--open').forEach(c => {
			if (c !== card) c.classList.remove('product-card--open');
		});

		card.classList.toggle('product-card--open');
	});
}

// ==========================================================
// Бургер-меню
// ==========================================================
const burgerBtn = document.getElementById('burgerBtn');
const navWrapper = document.getElementById('navWrapper');

if (burgerBtn && navWrapper) {
    burgerBtn.addEventListener('click', () => {
        const isActive = navWrapper.classList.toggle('active');
        burgerBtn.classList.toggle('active');
        burgerBtn.setAttribute('aria-expanded', isActive);
    });

    navWrapper.querySelectorAll('.site-nav__link').forEach(link => {
        link.addEventListener('click', () => {
            navWrapper.classList.remove('active');
            burgerBtn.classList.remove('active');
            burgerBtn.setAttribute('aria-expanded', 'false');
        });
    });
}

// ==========================================================
// ИНИЦИАЛИЗАЦИЯ ПРОЕКТА (Запуск модулей)
// ==========================================================
(() => {
	if (heroTitle) {
		typeLetter(fullTextHeader, heroTitle, 0, 30);
		getFact();
	}
	
	// Модули для страниц
	initPopular();       // Главная страница
	initCatalog();       // Каталог
	initProduct();       // Страница товара
	initOrderForm();     // Форма заказа
	initCartPage();      // Корзина
	initFavoritesPage(); // Избранное

	// Обновление счетчиков в шапке
	updateCartCounter(); 
	updateFavCounter(); 
})();