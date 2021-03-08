//Document preparation
document.getElementById('name').focus();
const userName = document.getElementById('name');
const userEmail = document.getElementById('email');
const otherJobRole = document.getElementById('other-job-role');
otherJobRole.style.display = 'none';

const payment = document.getElementById('payment');
const creditCard = document.getElementById('credit-card');
const paypal = document.getElementById('paypal');
const bitcoin = document.getElementById('bitcoin');

payment.querySelector('option[value="credit-card"]').selected = true;
let selectedPayment = payment.value;

paypal.style.display = 'none';
bitcoin.style.display = 'none';
let totalActivities = [];
//end of document preparation

function toggleHideShow(selected, ...element) {
    for (let i = 0; i < element.length; i++) {
        if (element[i].style.display === 'none' && element[i].getAttribute('id') === selected) {
            element[i].style.display = '';
        } else {
            element[i].style.display = 'none';
        }
    }
}

//General Email Regex (RFC 5322 Official Standard)
const EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

/**
* Credit Card numbers are validated to be valid numbers by the Luhn Algorithm https://en.wikipedia.org/wiki/Luhn_algorithm
* Source: https://youtu.be/mHMda7RQFr8?t=801
*/
function luhnCheck(n) {
    n = n.toString().split('').map(Number).reverse();
    return n.reduce(function (sum, digit, index) {
        if (index & 1) digit <<= 1;
        if (digit > 9) digit -= 9;
        return sum + digit;
    }, 0) % 10 == 0;
}

function formValidation() {
    return {
        name: function (userName) {
            this.errors.push( { field: 'name', state: (userName) ? true : false, msg: 'Name field cannot be blank' } );
        },
        email: function (userEmail) {
            if (userEmail === '') {
                this.errors.push( { field: 'email', state: false, msg: 'The email field can not be empty' } );
            } else if (!userEmail.includes('@')) {
                this.errors.push( { field: 'email', state: userEmail.includes('@'), msg: 'Email address must include at least one @ symbol' } );
            } else if (!/^.+@/.test(userEmail)) {
                this.errors.push( { field: 'email', state: /^.+@/.test(userEmail), msg: 'The email address should have characters preceding the @ symbol' } );
            } else if (!/.+\..+/.test(userEmail)) {
                this.errors.push( { field: 'email', state: /.+\..+/.test(userEmail), msg: 'The email address should have a domain name following the @ symbol [example.com]' } );
            } else if (!EMAIL_REGEX.test(userEmail)) {
                this.errors.push( { field: 'email', state: EMAIL_REGEX.test(userEmail), msg: 'Email address must be formatted correctly' } );
            }
        },
        activities: function (totalActivities) {
            this.errors.push( { field: 'activities', state: (totalActivities.length > 0) ? true : false, msg: 'Choose at least one activity' } );
        },
        creditCard: function (cardNumber, zip = false, cvv = false) {
            if (!/^\d{13,16}$/.test(parseInt(cardNumber))) {
                this.errors.push( { field: 'cc-num', state : /^\d{13,16}$/.test(parseInt(cardNumber)), msg: 'Credit card number must be between 13 - 16 digits' } );
            } else if (!luhnCheck(parseInt(creditCard[0]))) {
                this.errors.push( { field: 'cc-num', state : luhnCheck(parseInt(creditCard[0])), msg: 'Credit card number provided is not a valid number' } );
            }
            if (zip !== false) {
                this.errors.push( { field: 'zip', state: /^\d{1,5}$/.test(parseInt(zip)), msg: 'Zip Code must be 5 digits' } );
            }
            if (cvv !== false) {
                this.errors.push( { field: 'cvv', state: /^\d{1,3}$/.test(parseInt(cvv)), msg: 'CVV must be 3 digits' } );
            }
        },
        errors: []
    }
}

//Payment info updates dynamically to the payment method selected by the user
payment.addEventListener('change', e => {
    toggleHideShow(e.target.value, creditCard, paypal, bitcoin);
});

//When 'other' is selected in the Job Role section, the 'other' input becomes available
const title = document.getElementById('title');
title.addEventListener('change', e => {
    if (e.target.value !== 'other') {
        otherJobRole.style.display = 'none';
    } else if (e.target.value === 'other') {
        otherJobRole.style.display = '';
    }
});

//The T-shirt Info section dynamically updates content related to the design type
const color = document.getElementById('color');
color.setAttribute('disabled', true);
const design = document.getElementById('design');
design.addEventListener('change', e => {
    selectedPayment = e.target.value;
    color.removeAttribute('disabled');
    const options = color.querySelectorAll('[data-theme]');
    for (let i = 0; i < options.length; i++) {
        if (options[i].getAttribute('data-theme') === e.target.value) {
            options[i].style.display = '';
        } else {
            options[i].style.display = 'none';
        }
    }
    const firstOption = color.querySelector(`[data-theme="${e.target.value}"]`);
    firstOption.selected = true;
});

const activities = document.getElementById('activities');

activities.addEventListener('click', e => {
    const activitiesCost = document.getElementById('activities-cost');
    totalActivities = [];

    if (e.target.type === 'checkbox') {
        activities.classList.remove('not-valid');
        activities.lastElementChild.removeAttribute('style');

        //Loop over all activities and filter out duplicates
        const labels = activities.getElementsByTagName('input');

        function removeDuplicates(state) {
            for (i = 0; i < labels.length; i++) {
                if (e.target.dataset.dayAndTime === labels[i].dataset.dayAndTime && labels[i].name !== e.target.name) {
                    labels[i].disabled = state;
                    if (state) {
                        labels[i].parentElement.className = 'disabled';
                    } else {
                        labels[i].parentElement.classList.remove('disabled');
                    }
                }
            }
        }
    
        e.target.checked ? removeDuplicates(true) : removeDuplicates(false);
        //End loop

        //Display the total of selected item(s) prices to the 'Register for Activities' fieldset
        const checked = activities.querySelectorAll('[data-cost]:checked');
    
        for (let i = 0; i < checked.length; i++) {
            totalActivities.push( + checked[i].getAttribute('data-cost') );
        }

        //From W3Schools (sum of array values): array.reduce(function(totalActivities, currentValue), initialValue)
        activitiesCost.innerText = `Total: $${totalActivities.reduce((totalActivities, currentValue) => totalActivities + currentValue, 0)}`;
    }
});

//Form submission on button click
const form = document.querySelector('form');

form.addEventListener('submit', e => {
    var validation = new formValidation();

    validation.name(userName.value);
    validation.email(userEmail.value);
    validation.activities(totalActivities);
    validation.creditCard(document.getElementById('cc-num').value, document.getElementById('zip').value, document.getElementById('cvv').value);

    const removeNotValid = document.querySelectorAll('.not-valid');
    for (let i = 0; i < removeNotValid.length; i++) {
        removeNotValid[i].classList.remove('not-valid');
        removeNotValid[i].lastElementChild.removeAttribute('style');
    }
    
    if (validation.errors.some(error => error.state === false)) { //If field form has errors, prevent submission, log errors to user
        e.preventDefault();

        for (let i = 0; i < validation.errors.length; i++) {
            if (validation.errors[i].field === 'activities' && !validation.errors[i].state) {
                activities.classList.add('not-valid');
                activities.lastElementChild.style.display = 'block';
                activities.lastElementChild.innerText = validation.errors[i].msg;
            } else if (!validation.errors[i].state) {
                const selector = document.querySelector(`[for="${validation.errors[i].field}"]`);
                selector.classList.add('not-valid');
                selector.lastElementChild.style.display = 'block';
                selector.lastElementChild.innerText = validation.errors[i].msg;
            }
        }
    }
});

//Form submission on key up
form.addEventListener('keyup', e => {
    var validation;
    const selector = document.querySelector(`[for="${e.target.getAttribute('id')}"]`);

    if (!validation) {
        validation = new formValidation();
    }

    if (e.target.getAttribute('id') === 'email') {
        validation.email(userEmail.value);

        if (validation.errors.some(error => error.state === false)) {
            selector.classList.add('not-valid');
            selector.lastElementChild.style.display = 'block';
            selector.lastElementChild.innerText = validation.errors[0].msg;
        } else {
            selector.classList.remove('not-valid');
            selector.lastElementChild.removeAttribute('style');
        }
    }

    if (e.target.getAttribute('id') === 'cc-num') {
        validation.creditCard(document.getElementById('cc-num').value);

        if (validation.errors.some(error => error.state === false)) {
            selector.classList.add('not-valid');
            selector.lastElementChild.style.display = 'block';
            selector.lastElementChild.innerText = validation.errors[0].msg;
        } else {
            selector.classList.remove('not-valid');
            selector.lastElementChild.removeAttribute('style');
        }
    }
});

//Better focus states for the register of activities field
const labelInputs = activities.querySelectorAll('input');

for (let i = 0; i < labelInputs.length; i++) {
    labelInputs[i].addEventListener('focus', e => {
        e.target.parentNode.className = 'focus';
    });

    labelInputs[i].addEventListener('blur', e => {
        e.target.parentNode.className = '';
    });
}