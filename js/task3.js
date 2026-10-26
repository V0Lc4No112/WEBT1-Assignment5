const SHOWS = [
  { id: 'apollo', name: 'Apollo 11: The Landing', soldOut: ['2026-11-07', '2026-11-14'] },
  { id: 'mars', name: 'Journey to Mars', soldOut: ['2026-11-08', '2026-11-21'] },
  { id: 'sky', name: 'Night Sky Live', soldOut: [] },
];

const TICKET_TYPES = [
  { id: 'standard', name: 'Standard', price: 3000, seatsLeft: 40 },
  { id: 'student', name: 'Student', price: 1500, seatsLeft: 5 },
  { id: 'vip', name: 'VIP', price: 8000, seatsLeft: 2 },
];

const PROMO_CODES = [
  { code: 'MOON10', discount: 10 },
  { code: 'APOLLO20', discount: 20 },
];

const STUDENT_DOMAIN = '@astanait.edu.kz';
const CODE_LENGTH = 6;
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const DEPENDENT_FIELDS = { show: ['date'], ticketType: ['quantity', 'email'] };

const form = document.querySelector('#ticket-form');
const summary = document.querySelector('#form-summary');
const showSelect = document.querySelector('#show');
const dateInput = document.querySelector('#date');
const typeChoices = document.querySelector('#type-choices');
const quantityInput = document.querySelector('#quantity');
const quantityHint = document.querySelector('#quantity-hint');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const emailHint = document.querySelector('#email-hint');
const promoInput = document.querySelector('#promo');
const clearButton = document.querySelector('#clear');
const preview = document.querySelector('#preview');
const result = document.querySelector('#result');

const touched = new Set();
const previewValues = {};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDate(value) {
  return new Date(`${value}T00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatMoney(amount) {
  return `${amount.toLocaleString('en-US')} ₸`;
}

function findShow() {
  return SHOWS.find((show) => show.id === showSelect.value);
}

function findType() {
  return TICKET_TYPES.find((type) => type.id === form.elements.ticketType.value);
}

function findPromo() {
  const code = promoInput.value.trim().toUpperCase();
  return PROMO_CODES.find((promo) => promo.code === code);
}

function getPrice() {
  const type = findType();
  const quantity = Number(quantityInput.value);
  if (type === undefined || !Number.isInteger(quantity) || quantity < 1) {
    return null;
  }
  const promo = findPromo();
  const full = type.price * quantity;
  const discount = promo === undefined ? 0 : Math.round((full * promo.discount) / 100);
  return { total: full - discount, promo };
}

function priceText(price) {
  if (price === null) {
    return '—';
  }
  if (price.promo === undefined) {
    return formatMoney(price.total);
  }
  return `${formatMoney(price.total)} (${price.promo.discount}% off with ${price.promo.code})`;
}

const checks = {
  show() {
    if (showSelect.validity.valueMissing) {
      return 'Choose a show.';
    }
    return '';
  },
  date() {
    if (dateInput.validity.badInput) {
      return 'Enter the full date.';
    }
    if (dateInput.validity.valueMissing) {
      return 'Choose a date.';
    }
    if (dateInput.validity.rangeUnderflow || dateInput.validity.rangeOverflow) {
      return `Shows run from ${formatDate(dateInput.min)} to ${formatDate(dateInput.max)}.`;
    }
    const show = findShow();
    if (show !== undefined && show.soldOut.includes(dateInput.value)) {
      return `${show.name} is sold out on ${formatDate(dateInput.value)}. Choose another date.`;
    }
    return '';
  },
  ticketType() {
    if (findType() === undefined) {
      return 'Choose a ticket type.';
    }
    return '';
  },
  quantity() {
    if (quantityInput.validity.valueMissing) {
      return 'Enter the number of tickets.';
    }
    if (!quantityInput.validity.valid) {
      return `Enter a whole number from ${quantityInput.min} to ${quantityInput.max}.`;
    }
    const type = findType();
    if (type !== undefined && Number(quantityInput.value) > type.seatsLeft) {
      return `Only ${type.seatsLeft} ${type.name} seats are left.`;
    }
    return '';
  },
  name() {
    if (nameInput.value.trim() === '') {
      return 'Enter your name.';
    }
    if (nameInput.value.trim().length < nameInput.minLength) {
      return `Enter at least ${nameInput.minLength} characters.`;
    }
    return '';
  },
  email() {
    if (emailInput.validity.valueMissing) {
      return 'Enter your email.';
    }
    if (emailInput.validity.typeMismatch) {
      return 'Enter an email like name@example.com.';
    }
    const type = findType();
    if (type !== undefined && type.id === 'student' && !emailInput.value.toLowerCase().endsWith(STUDENT_DOMAIN)) {
      return `This is not a ${STUDENT_DOMAIN} email, so it cannot be used for a Student ticket.`;
    }
    return '';
  },
  promo() {
    if (promoInput.value.trim() !== '' && findPromo() === undefined) {
      return 'This promo code does not exist.';
    }
    return '';
  },
};

function getField(name) {
  return form.querySelector(`[data-field="${name}"]`);
}

function checkField(name) {
  const error = checks[name]();
  const field = getField(name);
  field.querySelector('.field-error').textContent = error;
  field.classList.toggle('is-invalid', error !== '');
  field.classList.toggle('is-valid', error === '');
  for (const control of field.querySelectorAll('input, select')) {
    control.setAttribute('aria-invalid', String(error !== ''));
  }
  return error === '';
}

function watch(control) {
  control.addEventListener('blur', () => {
    const name = control.closest('[data-field]').dataset.field;
    touched.add(name);
    checkField(name);
  });
}

function renderTypes() {
  typeChoices.replaceChildren();
  for (const type of TICKET_TYPES) {
    const label = document.createElement('label');
    label.className = 'choice';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'ticketType';
    radio.value = type.id;
    radio.required = true;
    radio.setAttribute('aria-describedby', 'ticketType-error');
    const text = document.createElement('span');
    if (type.seatsLeft === 0) {
      radio.disabled = true;
      label.classList.add('is-sold-out');
      text.textContent = `${type.name}, ${formatMoney(type.price)}, sold out`;
    } else {
      text.textContent = `${type.name}, ${formatMoney(type.price)}, ${type.seatsLeft} seats left`;
    }
    label.append(radio, text);
    typeChoices.append(label);
    watch(radio);
  }
}

function createDetails(rows) {
  const list = document.createElement('dl');
  for (const [title, value] of rows) {
    const term = document.createElement('dt');
    const detail = document.createElement('dd');
    term.textContent = title;
    detail.textContent = value;
    list.append(term, detail);
  }
  return list;
}

function buildPreview() {
  const list = createDetails([['Show', ''], ['Date', ''], ['Tickets', ''], ['Name', ''], ['Total', '']]);
  const details = list.querySelectorAll('dd');
  previewValues.show = details[0];
  previewValues.date = details[1];
  previewValues.tickets = details[2];
  previewValues.name = details[3];
  previewValues.total = details[4];
  preview.append(list);
}

function updatePreview() {
  const show = findShow();
  const type = findType();
  const quantity = Number(quantityInput.value);
  previewValues.show.textContent = show === undefined ? '—' : show.name;
  previewValues.date.textContent = dateInput.value === '' ? '—' : formatDate(dateInput.value);
  previewValues.tickets.textContent = type === undefined || quantity < 1 ? '—' : `${quantity} × ${type.name}`;
  previewValues.name.textContent = nameInput.value.trim() === '' ? '—' : nameInput.value.trim();
  previewValues.total.textContent = priceText(getPrice());
}

function makeBookingCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[randomInt(0, CODE_CHARS.length - 1)];
  }
  return code;
}

function showTicket(code) {
  const type = findType();
  const ticket = document.createElement('article');
  ticket.className = 'ticket ticket-final';
  ticket.tabIndex = -1;
  const heading = document.createElement('h3');
  heading.textContent = 'Booking confirmed';
  const codeText = document.createElement('p');
  codeText.className = 'booking-code';
  codeText.textContent = code;
  const details = createDetails([
    ['Show', findShow().name],
    ['Date', formatDate(dateInput.value)],
    ['Tickets', `${quantityInput.value} × ${type.name}`],
    ['Name', nameInput.value.trim()],
    ['Email', emailInput.value.trim()],
    ['Paid', priceText(getPrice())],
  ]);
  ticket.append(heading, codeText, details);
  result.replaceChildren(ticket);
  return ticket;
}

function clearForm() {
  form.reset();
  touched.clear();
  for (const name of Object.keys(checks)) {
    const field = getField(name);
    field.classList.remove('is-invalid', 'is-valid');
    field.querySelector('.field-error').textContent = '';
    for (const control of field.querySelectorAll('input, select')) {
      control.removeAttribute('aria-invalid');
    }
  }
  updatePreview();
}

function showSummary(text, type) {
  summary.textContent = text;
  summary.classList.toggle('is-error', type === 'error');
  summary.classList.toggle('is-success', type === 'success');
}

form.addEventListener('input', (event) => {
  const name = event.target.closest('[data-field]').dataset.field;
  if (touched.has(name)) {
    checkField(name);
  }
  for (const other of DEPENDENT_FIELDS[name] || []) {
    if (touched.has(other)) {
      checkField(other);
    }
  }
  updatePreview();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const invalid = [];
  for (const name of Object.keys(checks)) {
    touched.add(name);
    if (!checkField(name)) {
      invalid.push(name);
    }
  }

  if (invalid.length > 0) {
    showSummary(invalid.length === 1 ? 'Please fix 1 error before booking.' : `Please fix ${invalid.length} errors before booking.`, 'error');
    getField(invalid[0]).querySelector('input:not(:disabled), select').focus();
    return;
  }

  const code = makeBookingCode();
  const type = findType();
  const ticket = showTicket(code);
  type.seatsLeft -= Number(quantityInput.value);
  clearForm();
  renderTypes();
  showSummary(`Booked! Your booking code is ${code}.`, 'success');
  ticket.focus();
});

clearButton.addEventListener('click', () => {
  clearForm();
  showSummary('', '');
});

for (const show of SHOWS) {
  const option = document.createElement('option');
  option.value = show.id;
  option.textContent = show.name;
  showSelect.append(option);
}

form.noValidate = true;
quantityHint.textContent = `From ${quantityInput.min} to ${quantityInput.max} tickets per order.`;
emailHint.textContent = `Student tickets need an email that ends with ${STUDENT_DOMAIN}.`;
renderTypes();
for (const control of form.querySelectorAll('select, input:not([type="radio"])')) {
  watch(control);
}
buildPreview();
updatePreview();
