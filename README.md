# Assignment 5 - JavaScript Basics

Mereikhan Sholanbayev, IT-2511

Three small JavaScript pages on the Space Notes theme. Plain JavaScript, no libraries.
Open `index.html` in a browser. No installation is needed; the font loads from Google Fonts.

## Files

- `index.html`: links to the three tasks.
- `task1.html` and `js/task1.js`: Task 1, option C, Code breaker ("Airlock code breaker").
- `task2.html` and `js/task2.js`: Task 2, option A, Kanban board ("Mission prep board").
- `task3.html` and `js/task3.js`: Task 3, option A, Ticket builder ("Planetarium tickets").
- `css/style.css`: one stylesheet for all pages.

## Task 1 - Airlock code breaker

Guess a 4-digit code with no repeated digits in 8 attempts. After each guess the game shows
how many digits are in the right place and how many are in the wrong place.
All numbers are constants at the top of `js/task1.js` (`CODE_LENGTH`, `MAX_ATTEMPTS`, `MIN_DIGIT`, `MAX_DIGIT`).
`CODE_LENGTH` must not be larger than the number of possible digits.

## Task 2 - Mission prep board

12 task objects are stored in an array and the board is built by one `render()` function.
Cards move between To do, In progress and Done; In progress holds at most `MAX_IN_PROGRESS` (3) cards.
Search by title, filter by tag, sort by priority, and a progress bar of finished cards.
One click listener on the board handles every card button (event delegation).

## Task 3 - Planetarium tickets

Seven fields with a live ticket preview. Four rules that HTML attributes cannot express:

- the date must not be sold out for the chosen show;
- the number of tickets cannot be larger than the seats left for the chosen type;
- a promo code, if entered, must be in the list;
- Student tickets need an email that ends with `@astanait.edu.kz`.

Fields are checked on blur and then on every input. On submit the number of errors is shown
and the first wrong field gets the focus; a correct form creates a ticket with a random booking code.
