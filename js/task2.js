const MAX_IN_PROGRESS = 3;

const COLUMNS = [
  { status: 'todo', title: 'To do' },
  { status: 'progress', title: 'In progress' },
  { status: 'done', title: 'Done' },
];

const tasks = [
  { id: 1, title: 'Fuel the first stage', tag: 'rocket', priority: 3, hours: 6, critical: true, people: ['Launch team'], status: 'todo' },
  { id: 2, title: 'Check the spacesuits', tag: 'crew', priority: 2, hours: 3, critical: false, people: ['Armstrong', 'Aldrin'], status: 'progress' },
  { id: 3, title: 'Test the radio link with Houston', tag: 'ground', priority: 2, hours: 2, critical: true, people: ['CAPCOM'], status: 'done' },
  { id: 4, title: 'Pack the sample boxes', tag: 'science', priority: 1, hours: 1, critical: false, people: ['Aldrin'], status: 'todo' },
  { id: 5, title: 'Pack food for eight days', tag: 'crew', priority: 1, hours: 2, critical: false, people: ['Collins'], status: 'done' },
  { id: 6, title: 'Calibrate the guidance computer', tag: 'rocket', priority: 3, hours: 5, critical: true, people: ['Aldrin'], status: 'progress' },
  { id: 7, title: 'Rehearse the landing', tag: 'crew', priority: 3, hours: 8, critical: true, people: ['Armstrong', 'Aldrin'], status: 'todo' },
  { id: 8, title: 'Prepare the seismometer', tag: 'science', priority: 2, hours: 3, critical: false, people: ['Aldrin'], status: 'todo' },
  { id: 9, title: 'Check the weather at the Cape', tag: 'ground', priority: 2, hours: 1, critical: false, people: ['Launch team'], status: 'todo' },
  { id: 10, title: 'Inspect the heat shield', tag: 'rocket', priority: 3, hours: 4, critical: true, people: ['Launch team'], status: 'todo' },
  { id: 11, title: 'Print the flight plan', tag: 'ground', priority: 1, hours: 1, critical: false, people: ['Flight director'], status: 'done' },
  { id: 12, title: 'Pack the flag and the plaque', tag: 'crew', priority: 1, hours: 1, critical: false, people: ['Collins'], status: 'todo' },
];

const board = document.querySelector('#board');
const searchInput = document.querySelector('#search');
const tagSelect = document.querySelector('#tag');
const sortSelect = document.querySelector('#sort');
const notice = document.querySelector('#notice');
const searchMessage = document.querySelector('#search-message');
const progressBar = document.querySelector('#progress');
const progressText = document.querySelector('#progress-text');

function countByStatus(status) {
  let count = 0;
  for (const task of tasks) {
    if (task.status === status) {
      count++;
    }
  }
  return count;
}

function getVisibleTasks() {
  const text = searchInput.value.trim().toLowerCase();
  const tag = tagSelect.value;
  const visible = tasks.filter((task) => task.title.toLowerCase().includes(text) && (tag === 'all' || task.tag === tag));
  if (sortSelect.value === 'high') {
    visible.sort((a, b) => b.priority - a.priority);
  } else if (sortSelect.value === 'low') {
    visible.sort((a, b) => a.priority - b.priority);
  }
  return visible;
}

function createButton(task, action, text) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-small';
  button.textContent = text;
  button.dataset.id = task.id;
  button.dataset.action = action;
  return button;
}

function createCard(task) {
  const card = document.createElement('li');
  card.className = 'task-card';
  card.classList.toggle('is-critical', task.critical && task.status !== 'done');
  card.classList.toggle('is-done', task.status === 'done');

  const title = document.createElement('h3');
  title.textContent = task.title;

  const meta = document.createElement('p');
  meta.className = 'task-meta';
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.textContent = task.tag;
  const priority = document.createElement('span');
  priority.textContent = `Priority ${task.priority}`;
  const hours = document.createElement('span');
  hours.textContent = `${task.hours} h`;
  meta.append(tag, priority, hours);
  if (task.critical) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = 'Critical';
    meta.append(badge);
  }

  const people = document.createElement('p');
  people.className = 'task-meta';
  people.textContent = task.people.join(', ');

  const actions = document.createElement('div');
  actions.className = 'card-actions';
  if (task.status !== 'todo') {
    actions.append(createButton(task, 'back', 'Back'));
  }
  if (task.status !== 'done') {
    actions.append(createButton(task, 'next', 'Next'));
  }

  card.append(title, meta, people, actions);
  return card;
}

function updateProgress() {
  let done = 0;
  let hoursLeft = 0;
  for (const task of tasks) {
    if (task.status === 'done') {
      done++;
    } else {
      hoursLeft += task.hours;
    }
  }
  const percent = Math.round((done / tasks.length) * 100);
  progressBar.max = tasks.length;
  progressBar.value = done;
  progressText.textContent = `${done} of ${tasks.length} cards done (${percent}%). ${hoursLeft} hours of work left.`;
}

function render() {
  const visible = getVisibleTasks();
  board.replaceChildren();

  for (const column of COLUMNS) {
    const section = document.createElement('section');
    section.className = 'column';
    const heading = document.createElement('h2');
    const total = countByStatus(column.status);
    if (column.status === 'progress') {
      heading.textContent = `${column.title} (${total} of ${MAX_IN_PROGRESS})`;
      section.classList.toggle('is-full', total >= MAX_IN_PROGRESS);
    } else {
      heading.textContent = `${column.title} (${total})`;
    }

    const list = document.createElement('ul');
    list.className = 'cards';
    const columnTasks = visible.filter((task) => task.status === column.status);
    if (columnTasks.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = 'No cards here.';
      list.append(empty);
    }
    for (const task of columnTasks) {
      list.append(createCard(task));
    }

    section.append(heading, list);
    board.append(section);
  }

  searchMessage.textContent = visible.length === 0 ? 'Nothing found. Try another title or tag.' : '';
  updateProgress();
}

function showNotice(text, type) {
  notice.textContent = text;
  notice.classList.toggle('is-error', type === 'error');
  notice.classList.toggle('is-success', type === 'success');
}

board.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (button === null) {
    return;
  }

  const task = tasks.find((item) => item.id === Number(button.dataset.id));
  const index = COLUMNS.findIndex((column) => column.status === task.status);
  const target = button.dataset.action === 'next' ? COLUMNS[index + 1] : COLUMNS[index - 1];

  if (target.status === 'progress' && countByStatus('progress') >= MAX_IN_PROGRESS) {
    showNotice(`"In progress" can hold only ${MAX_IN_PROGRESS} cards. Finish a card or move one back first.`, 'error');
    return;
  }

  task.status = target.status;
  showNotice(`"${task.title}" moved to ${target.title}.`, 'success');
  render();

  const sameCardButton = board.querySelector(`button[data-id="${task.id}"]`);
  if (sameCardButton !== null) {
    sameCardButton.focus();
  }
});

function fillTags() {
  const tags = [];
  for (const task of tasks) {
    if (!tags.includes(task.tag)) {
      tags.push(task.tag);
    }
  }
  for (const tag of tags) {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    tagSelect.append(option);
  }
}

searchInput.addEventListener('input', render);
tagSelect.addEventListener('change', render);
sortSelect.addEventListener('change', render);

fillTags();
render();
