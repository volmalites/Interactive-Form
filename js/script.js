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
const activities = document.getElementById('activities-box');
const form = document.querySelector('form');
const labelInputs = activities.querySelectorAll('input');
const color = document.getElementById('color');
color.setAttribute('disabled', true);
const design = document.getElementById('design');
const title = document.getElementById('title');

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
* Source: https://youtu.be/mHMda7RQFr8
*/
function luhnCheck(n) {
    const digits = n.toString().split('').map(Number);

    const sum = digits
        .map((digit, idx) => idx % 2 === digits.length % 2 ? fixDouble(digit * 2) : digit)
        .reduce((acc, digit) => acc += digit, 0);

    return sum % 10 === 0;
}

function fixDouble(number) {
    return number > 9 ? number - 9 : number;
}

function updateErrors(selector, index, validation, state) {
    if (!state) {
        selector.classList.add('not-valid');
        selector.classList.remove('valid');
        selector.lastElementChild.style.display = 'block';
        selector.lastElementChild.innerText = validation.errors[index].msg;
    } else {
        selector.classList.remove('not-valid');
        selector.classList.add('valid');
        selector.lastElementChild.removeAttribute('style');
    }
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
            } else {
                this.errors.push( { field: 'email', state: EMAIL_REGEX.test(userEmail), msg: 'Email address must be formatted correctly' } );
            }
        },
        'activities-box': function (totalActivities) {
            this.errors.push( { field: 'activities-box', state: (totalActivities.length > 0) ? true : false, msg: 'Choose at least one activity' } );
        },
        'cc-num': function (cardNumber) {
            if (document.getElementById('payment').value === 'credit-card') {
                if (!/^[0-9]*$/.test(cardNumber.replace(/\s/g, ''))) {
                    this.errors.push( { field: 'cc-num', state : /^[0-9]*$/.test(cardNumber.replace(/\s/g, '')), msg: 'Credit card number can only contain numbers' } );
                } else {
                    this.errors.push( { field: 'cc-num', state : /^\d{13,16}$/.test(parseInt(cardNumber.replace(/\s/g, ''))), msg: 'Credit card number must be between 13 - 16 digits' } );
                }
                // } else { Removing Luhn Algorithm for this project
                //     this.errors.push( { field: 'cc-num', state : luhnCheck(parseInt(cardNumber.replace(/\s/g, ''))), msg: 'Credit card number provided is not a valid number' } );
                // }
            }
        },
        zip: function (zip) {
            this.errors.push( { field: 'zip', state: /^\d{5}$/.test(parseInt(zip)), msg: 'Zip Code must be 5 digits' } );
        },
        cvv: function (cvv) {
            this.errors.push( { field: 'cvv', state: /^\d{3}$/.test(parseInt(cvv)), msg: 'CVV must be 3 digits' } );
        },
        errors: []
    }
}

function onKeyUp (selector, field) {
    var validation = new formValidation();
    validation[field](document.getElementById(field).value);
    updateErrors(selector.parentElement, 0, validation, validation.errors[0].state);
}

//Payment info updates dynamically to the payment method selected by the user
payment.addEventListener('change', e => {
    toggleHideShow(e.target.value, creditCard, paypal, bitcoin);
});

//When 'other' is selected in the Job Role section, the 'other' input becomes available
title.addEventListener('change', e => {
    if (e.target.value !== 'other') {
        otherJobRole.style.display = 'none';
    } else if (e.target.value === 'other') {
        otherJobRole.style.display = '';
    }
});

//The T-shirt Info section dynamically updates content related to the design type
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

//Dynamic activities field functionality follows here
activities.addEventListener('click', e => {
    const activitiesCost = document.getElementById('activities-cost');
    totalActivities = [];

    if (e.target.type === 'checkbox') {
        //Loop over all activities and filter out duplicates
        const labels = activities.getElementsByTagName('input');
        let hasChecked = false;

        function removeDuplicates(state) {

            for (i = 0; i < labels.length; i++) {
                //after error is displayed, remove error if a selection is made
                if (labels[i].checked) {
                    hasChecked = true;
                }

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
        
        if (hasChecked) {
            activities.parentElement.classList.remove('not-valid');
            activities.parentElement.classList.add('valid');
            activities.parentElement.lastElementChild.removeAttribute('style');
        } else {
            activities.parentElement.classList.add('not-valid');
            activities.parentElement.classList.remove('valid');
            activities.parentElement.lastElementChild.style.display = 'block';
        }

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
form.addEventListener('submit', e => {
    e.preventDefault();
    var validation = new formValidation();

    for (let field in validation) {
        if (field !== 'errors') {
            if (field === 'activities-box') {
                validation[field](totalActivities);
            } else {
                validation[field](document.getElementById(field).value);
            }
        }
    }
    
    for (let i = 0; i < validation.errors.length; i++) {
        updateErrors(document.getElementById(validation.errors[i].field).parentElement, i, validation, validation.errors[i].state);
    }
});

//Form submission on key up
form.addEventListener('keyup', e => {
    const selector = document.getElementById(e.target.getAttribute('id'));
    onKeyUp (selector, e.target.getAttribute('id'));
});

//Better focus states for the register of activities field
for (let i = 0; i < labelInputs.length; i++) {
    labelInputs[i].addEventListener('focus', e => {
        e.target.parentNode.className = 'focus';
    });

    labelInputs[i].addEventListener('blur', e => {
        e.target.parentNode.className = '';
    });
}