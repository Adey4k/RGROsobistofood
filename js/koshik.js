const cartWrapper = document.querySelector('.cart-wrapper');
const CART_STORAGE_KEY = 'osobysto_cart';

function saveCartState() {
    const cartItems = [];
    $('.cart-wrapper .cart-item').each(function () {
        const $item = $(this);
        const counter = parseInt($item.find('[data-counter]').val() || $item.find('[data-counter]').text(), 10) || 1;
        cartItems.push({
            id: $item.data('id'),
            counter: counter
        });
    });
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

function clearCartState() {
    localStorage.removeItem(CART_STORAGE_KEY);
}

function buildCartItemHTML(productInfo) {
    return `
        <div class="cart-item" data-id="${productInfo.id}">
            <div class="cart-item__top">
                <div class="cart-item__img">
                    <img src="${productInfo.imgSrc}" alt="${productInfo.title}">
                </div>
                <div class="cart-item__desc">
                    <div class="cart-item__title">${productInfo.title}</div>
                    <div class="cart-item__weight">${productInfo.itemsInBox} / ${productInfo.weight}</div>
                    <div class="cart-item__details">
                        <div class="items items--small counter-wrapper">
                            <div class="items__control" data-action="minus">-</div>
                            <input type="text" inputmode="numeric" maxlength="3" class="items__current" data-counter value="${productInfo.counter}">
                            <div class="items__control" data-action="plus">+</div>
                        </div>
                        <div class="price">
                            <div class="price__currency">${productInfo.price}</div>
                        </div>
                        <button class="btn btn-danger btn-sm remove-item">×</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadCartState() {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!savedCart) return;

    let cartItems = [];
    try {
        cartItems = JSON.parse(savedCart);
    } catch (e) {
        console.warn('Не вдалося прочитати стан корзини:', e);
        return;
    }

    cartItems.forEach(item => {
        const card = document.querySelector(`.card[data-id="${item.id}"]`);
        if (!card) return;

        const productInfo = {
            id: item.id,
            imgSrc: card.querySelector('.product-img').getAttribute('src'),
            title: card.querySelector('.item-title').innerText,
            itemsInBox: card.querySelector('[data-items-in-box]').innerText,
            weight: card.querySelector('.price__weight').innerText,
            price: card.querySelector('.price__currency').innerText,
            counter: item.counter || 1
        };

        cartWrapper.insertAdjacentHTML('beforeend', buildCartItemHTML(productInfo));
        updateCardCounter(item.id, productInfo.counter);
    });

    ToogleCartStatus();
    calcCartPrice();
}

// Допоміжна функція для отримання значення лічильника (input або div)
function getCounterValue(el) {
    return parseInt(el.value || el.innerText) || 1;
}

function setCounterValue(el, val) {
    if (el.tagName === 'INPUT') {
        el.value = val;
    } else {
        el.innerText = val;
    }
}

// Обробка "Додати в корзину"
window.addEventListener('click', function (event) {
    if (event.target.hasAttribute('data-cart')) {
        const card = event.target.closest('.card');

        const productInfo = {
            id: card.dataset.id,
            imgSrc: card.querySelector('.product-img').getAttribute('src'),
            title: card.querySelector('.item-title').innerText,
            itemsInBox: card.querySelector('[data-items-in-box]').innerText,
            weight: card.querySelector('.price__weight').innerText,
            price: card.querySelector('.price__currency').innerText,
            counter: getCounterValue(card.querySelector('[data-counter]'))
        };

        const itemInCart = cartWrapper.querySelector(`[data-id="${productInfo.id}"]`);

        if (itemInCart) {
            const counterElement = itemInCart.querySelector('[data-counter]');
            const newCounterValue = getCounterValue(counterElement) + 1; // Додаємо +1

            setCounterValue(counterElement, newCounterValue);

            // Синхронізуємо з карткою товару
            updateCardCounter(productInfo.id, newCounterValue);
        } else {
            const cartItemHTML = `
                <div class="cart-item" data-id="${productInfo.id}">
                    <div class="cart-item__top">
                        <div class="cart-item__img">
                            <img src="${productInfo.imgSrc}" alt="${productInfo.title}">
                        </div>
                        <div class="cart-item__desc">
                            <div class="cart-item__title">${productInfo.title}</div>
                            <div class="cart-item__weight">${productInfo.itemsInBox} / ${productInfo.weight}</div>
                            <div class="cart-item__details">
                                <div class="items items--small counter-wrapper">
                                    <div class="items__control" data-action="minus">-</div>
                                    <input type="text" inputmode="numeric" maxlength="3" class="items__current" data-counter value="1">
                                    <div class="items__control" data-action="plus">+</div>
                                </div>
                                <div class="price">
                                    <div class="price__currency">${productInfo.price}</div>
                                </div>
                                <button class="btn btn-danger btn-sm remove-item">×</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            cartWrapper.insertAdjacentHTML('beforeend', cartItemHTML);

            // Синхронізуємо з карткою товару
            updateCardCounter(productInfo.id, 1); // Ставимо значення 1 для нових товарів
        }
        calcCartPrice()
        saveCartState();
    }
    ToogleCartStatus();
    saveCartState();
});

// Оновлення статусу корзини
function ToogleCartStatus() {
    const cartEmptyBadge = document.querySelector('[data-cart-empty]');
    const orderButton = document.querySelector('#order-form .btn-primary');

    if (cartWrapper.children.length > 0) {
        cartEmptyBadge.classList.add('none');
        orderButton.disabled = false;
    } else {
        cartEmptyBadge.classList.remove('none');
        orderButton.disabled = true;
    }
}


//Зміна лічільника для каруселі та корзини
window.addEventListener('click', function (event) {
    const counterWrapper = event.target.closest('.counter-wrapper');
    if (!counterWrapper) return;

    const counter = counterWrapper.querySelector('[data-counter]');
    const isInCart = !!event.target.closest('.cart-wrapper');

    if (event.target.dataset.action === 'minus') {
        if (getCounterValue(counter) > 1) {
            setCounterValue(counter, getCounterValue(counter) - 1);
        } else if (isInCart) {
            const cartItem = event.target.closest('.cart-item');
            const productId = cartItem.dataset.id;
            cartItem.remove();
            updateCardCounter(productId, 1);
            calcCartPrice();
            ToogleCartStatus();
            saveCartState();
            return;
        } else {
            // Мінус на картці товару при лічильнику 1 — видалити з кошика
            const productId = event.target.closest('[data-id]').dataset.id;
            const cartItem = cartWrapper.querySelector(`.cart-item[data-id="${productId}"]`);
            if (cartItem) {
                cartItem.remove();
                calcCartPrice();
                ToogleCartStatus();
            }
            return;
        }
    }


    if (event.target.dataset.action === 'plus') {
        if (getCounterValue(counter) < 999) {
            setCounterValue(counter, getCounterValue(counter) + 1);
        }
    }

    const productId = event.target.closest('[data-id]').dataset.id;

    //Синхронізація лічильників в каруселі і магазині
    if (isInCart) {
        updateCardCounter(productId, getCounterValue(counter));
    } else {
        updateCartCounter(productId, getCounterValue(counter));
    }
    calcCartPrice();
    ToogleCartStatus();
    saveCartState();
});

// Обробка ручного введення кількості
window.addEventListener('input', function (event) {
    if (!event.target.hasAttribute('data-counter')) return;

    const counter = event.target;
    const isInCart = !!counter.closest('.cart-wrapper');

    // Дозволяємо тільки цифри
    counter.value = counter.value.replace(/\D/g, '');

    let val = parseInt(counter.value);
    if (isNaN(val) || val < 1) return; // Не синхронізуємо поки значення некоректне
    if (val > 999) { counter.value = 999; val = 999; }

    const productId = counter.closest('[data-id]').dataset.id;

    if (isInCart) {
        updateCardCounter(productId, val);
    } else {
        updateCartCounter(productId, val);
    }
    calcCartPrice();
    ToogleCartStatus();
    saveCartState();
});

// При втраті фокуса — валідуємо мінімум 1
window.addEventListener('focusout', function (event) {
    if (!event.target.hasAttribute('data-counter')) return;

    const counter = event.target;
    let val = parseInt(counter.value);
    if (isNaN(val) || val < 1) {
        counter.value = 1;
        const productId = counter.closest('[data-id]').dataset.id;
        const isInCart = !!counter.closest('.cart-wrapper');
        if (isInCart) {
            updateCardCounter(productId, 1);
        } else {
            updateCartCounter(productId, 1);
        }
        calcCartPrice();
        ToogleCartStatus();
    }
});

function updateCardCounter(productId, newCounterValue) {
    const card = document.querySelector(`.card[data-id="${productId}"]`);
    if (card) {
        const cardCounter = card.querySelector('[data-counter]');
        setCounterValue(cardCounter, newCounterValue);
    }
}

function updateCartCounter(productId, newCounterValue) {
    const cartItem = cartWrapper.querySelector(`.cart-item[data-id="${productId}"]`);
    if (cartItem) {
        const cartCounter = cartItem.querySelector('[data-counter]');
        setCounterValue(cartCounter, newCounterValue);
        saveCartState();
    } else if (newCounterValue > 0) {
        const card = document.querySelector(`.card[data-id="${productId}"]`);
        if (card) {
            const productInfo = {
                id: card.dataset.id,
                imgSrc: card.querySelector('.product-img').getAttribute('src'),
                title: card.querySelector('.item-title').innerText,
                itemsInBox: card.querySelector('[data-items-in-box]').innerText,
                weight: card.querySelector('.price__weight').innerText,
                price: card.querySelector('.price__currency').innerText,
                counter: newCounterValue
            };

            const cartItemHTML = `
                <div class="cart-item" data-id="${productInfo.id}">
                    <div class="cart-item__top">
                        <div class="cart-item__img">
                            <img src="${productInfo.imgSrc}" alt="${productInfo.title}">
                        </div>
                        <div class="cart-item__desc">
                            <div class="cart-item__title">${productInfo.title}</div>
                            <div class="cart-item__weight">${productInfo.itemsInBox} / ${productInfo.weight}</div>
                            <div class="cart-item__details">
                                <div class="items items--small counter-wrapper">
                                    <div class="items__control" data-action="minus">-</div>
                                    <input type="text" inputmode="numeric" maxlength="3" class="items__current" data-counter value="${productInfo.counter}">
                                    <div class="items__control" data-action="plus">+</div>
                                </div>
                                <div class="price">
                                    <div class="price__currency">${productInfo.price}</div>
                                </div>
                                <button class="btn btn-danger btn-sm remove-item">×</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            cartWrapper.insertAdjacentHTML('beforeend', cartItemHTML);
            saveCartState();
        }
    }
    ToogleCartStatus();
}

function calcCartPrice() {
    const cartItems = cartWrapper.querySelectorAll('.cart-item');
    const totalPriceEl = document.querySelector('.total-price');
    const deliveryCostEl = document.querySelector('.delivery-cost');
    let totalPrice = 0;

    cartItems.forEach(item => {
        const priceElement = item.querySelector('.price__currency');
        const amountElement = item.querySelector('[data-counter]');

        const price = parseInt(priceElement.innerText.replace(/\D/g, ''));
        const amount = getCounterValue(amountElement);

        totalPrice += price * amount;
    });

    if (totalPrice > 0) {
        if (totalPrice >= 1000) {
            deliveryCostEl.innerText = 'безкоштовна';
            deliveryCostEl.classList.add('free');
            totalPriceEl.innerText = `${totalPrice}`;
        } else {
            const deliveryCost = 100; // 100 UAH delivery fee
            deliveryCostEl.innerText = `${deliveryCost} грн.`;
            deliveryCostEl.classList.remove('free');
            totalPriceEl.innerText = `${totalPrice + deliveryCost}`;
        }
    } else {
        deliveryCostEl.innerText = '0 грн.';
        deliveryCostEl.classList.remove('free');
        totalPriceEl.innerText = '0';
    }
}


cartWrapper.addEventListener('click', function (event) {
    if (event.target.classList.contains('remove-item')) {
        const cartItem = event.target.closest('.cart-item');
        const productId = cartItem.dataset.id;
        cartItem.remove();
        updateCardCounter(productId, 1);
        ToogleCartStatus();
        calcCartPrice();
        saveCartState();
    }
});

loadCartState();