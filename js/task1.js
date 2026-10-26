const CODE_LENGTH = 4;
const MAX_ATTEMPTS = 8;
const MIN_DIGIT = 0;
const MAX_DIGIT = 9;

const game = document.querySelector('#game');
const form = document.querySelector('#guess-form');
const input = document.querySelector('#guess');
const checkButton = document.querySelector('#check');
const restartButton = document.querySelector('#restart');
const rules = document.querySelector('#rules');
const message = document.querySelector('#message');
const statusLine = document.querySelector('#status');
const historyList = document.querySelector('#history');

let secret = [];
let attemptsLeft = MAX_ATTEMPTS;
let gameOver = false;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeSecret() {
  const code = [];
  while (code.length < CODE_LENGTH) {
    const digit = randomInt(MIN_DIGIT, MAX_DIGIT);
    if (!code.includes(digit)) {
      code.push(digit);
    }
  }
  return code;
}

function findError(text) {
  if (text.length !== CODE_LENGTH) {
    return `Enter exactly ${CODE_LENGTH} digits.`;
  }
  for (const char of text) {
    if (char < '0' || char > '9' || Number(char) < MIN_DIGIT || Number(char) > MAX_DIGIT) {
      return `Use only digits from ${MIN_DIGIT} to ${MAX_DIGIT}.`;
    }
  }
  if (new Set(text).size !== text.length) {
    return 'Each digit can be used only once.';
  }
  return '';
}

function compare(guess) {
  let rightPlace = 0;
  let wrongPlace = 0;
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guess[i] === secret[i]) {
      rightPlace++;
    } else if (secret.includes(guess[i])) {
      wrongPlace++;
    }
  }
  return { rightPlace, wrongPlace };
}

function showMessage(text, type) {
  message.textContent = text;
  message.classList.remove('is-error', 'is-win', 'is-loss');
  if (type !== '') {
    message.classList.add(`is-${type}`);
  }
}

function showStatus() {
  statusLine.textContent = `Attempts left: ${attemptsLeft} of ${MAX_ATTEMPTS}`;
}

function addToHistory(text, result) {
  const item = document.createElement('li');
  const code = document.createElement('span');
  const info = document.createElement('span');
  code.className = 'code';
  code.textContent = text;
  info.textContent = `${result.rightPlace} right place, ${result.wrongPlace} wrong place`;
  item.append(code, info);
  historyList.append(item);
}

function endGame(won) {
  gameOver = true;
  input.disabled = true;
  checkButton.disabled = true;
  game.classList.add(won ? 'is-win' : 'is-loss');
  restartButton.focus();
}

function startGame() {
  secret = makeSecret();
  attemptsLeft = MAX_ATTEMPTS;
  gameOver = false;
  historyList.replaceChildren();
  input.value = '';
  input.disabled = false;
  checkButton.disabled = false;
  game.classList.remove('is-win', 'is-loss');
  showMessage('', '');
  showStatus();
  input.focus();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (gameOver) {
    showMessage('The game is over. Press "New game" to play again.', 'error');
    return;
  }

  const text = input.value.trim();
  const error = findError(text);
  if (error !== '') {
    showMessage(error, 'error');
    input.focus();
    return;
  }

  const result = compare(Array.from(text, Number));
  attemptsLeft--;
  addToHistory(text, result);
  input.value = '';
  showStatus();

  if (result.rightPlace === CODE_LENGTH) {
    showMessage(`Airlock open! ${text} is the code. You needed ${MAX_ATTEMPTS - attemptsLeft} of ${MAX_ATTEMPTS} attempts.`, 'win');
    endGame(true);
  } else if (attemptsLeft === 0) {
    showMessage(`Out of attempts. The code was ${secret.join('')}.`, 'loss');
    endGame(false);
  } else if (result.rightPlace === CODE_LENGTH - 1 || result.rightPlace + result.wrongPlace === CODE_LENGTH) {
    showMessage(`So close! ${result.rightPlace} in the right place, ${result.wrongPlace} in the wrong place.`, '');
  } else if (result.rightPlace === 0 && result.wrongPlace === 0) {
    showMessage('None of these digits are in the code.', '');
  } else {
    showMessage(`${result.rightPlace} in the right place, ${result.wrongPlace} in the wrong place.`, '');
  }
});

restartButton.addEventListener('click', startGame);

rules.textContent = `Guess the ${CODE_LENGTH}-digit airlock code. It uses digits from ${MIN_DIGIT} to ${MAX_DIGIT}, and no digit repeats. You have ${MAX_ATTEMPTS} attempts. After each guess you see how many digits are in the right place and how many are in the wrong place.`;
input.maxLength = CODE_LENGTH;
input.placeholder = `${CODE_LENGTH} different digits`;
startGame();
