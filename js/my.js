document.addEventListener('DOMContentLoaded', function () {
    ToogleCartStatus();
    calcCartPrice();
    const modal = document.getElementById('order-modal');
    const orderButton = document.querySelector('#order-form .btn-primary'); // Кнопка "Замовити"
    const closeModal = modal.querySelector('.close');
    const orderDetails = document.getElementById('order-details');

    // Функція для заповнення модального вікна
    function updateOrderDetails() {
        const cartItems = document.querySelectorAll('.cart-item');
        const totalPrice = document.querySelector('.total-price').innerText;
        const deliveryCost = document.querySelector('.delivery-cost').innerText;

        let orderHTML = `<h4>Ваше замовлення:</h4><ul class="list-group mb-3">`;

        cartItems.forEach(item => {
            const title = item.querySelector('.cart-item__title').innerText;
            const counter = parseInt(item.querySelector('[data-counter]').value || item.querySelector('[data-counter]').innerText);
            const pricePerItem = parseInt(item.querySelector('.price__currency').innerText.replace(/\D/g, ''));
            const totalItemPrice = pricePerItem * counter; // Розраховуємо підсумкову ціну для позиції

            orderHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${title} (${counter} шт.) 
                    <span>${pricePerItem} грн. (${totalItemPrice} грн.)</span>
                </li>`;
        });

        orderHTML += `</ul>
            <p><strong>Доставка:</strong> ${deliveryCost}</p>
            <p><strong>Загальна сума:</strong> ${totalPrice} грн.</p>`;

        orderDetails.innerHTML = orderHTML;
    }

    // Відкриття модального вікна
    orderButton.addEventListener('click', function (event) {
        event.preventDefault();
        updateOrderDetails();
        modal.style.display = 'block';
    });

    // Закриття модального вікна
    closeModal.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Закриття форми при натисканні на пустий простір
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // ===== Валідація імені (макс 40 символів) =====
    const nameInput = document.getElementById('customer-name');
    nameInput.addEventListener('input', function () {
        if (this.value.length > 40) {
            this.value = this.value.slice(0, 40);
        }
    });

    // ===== Валідація телефону =====
    const phoneInput = document.getElementById('customer-phone');
    const PREFIX = '+38';

    // При фокусі — переконатися що є префікс
    phoneInput.addEventListener('focus', function () {
        if (!this.value.startsWith(PREFIX)) {
            this.value = PREFIX;
        }
    });

    // Обробка введення — тільки цифри після +38, макс 10 цифр
    phoneInput.addEventListener('input', function () {
        if (!this.value.startsWith(PREFIX)) {
            this.value = PREFIX;
        }
        let afterPrefix = this.value.slice(PREFIX.length);
        afterPrefix = afterPrefix.replace(/\D/g, '');
        if (afterPrefix.length > 10) {
            afterPrefix = afterPrefix.slice(0, 10);
        }
        this.value = PREFIX + afterPrefix;
    });

    // Заборонити видалення +38 клавішами Backspace/Delete
    phoneInput.addEventListener('keydown', function (e) {
        const cursorPos = this.selectionStart;
        if (e.key === 'Backspace' && cursorPos <= PREFIX.length) {
            e.preventDefault();
        }
        if (e.key === 'Delete' && cursorPos < PREFIX.length) {
            e.preventDefault();
        }
    });

    // Відправка форми
    modal.querySelector('form').addEventListener('submit', function (event) {
        event.preventDefault();
        alert('Замовлення прийнято! Дякуємо!');
        const orderForm = modal.querySelector('form');
        orderForm.reset();
        modal.style.display = 'none';
        cartWrapper.innerHTML = '';
        localStorage.removeItem('osobysto_cart');
        ToogleCartStatus();
        calcCartPrice();
    });
});
