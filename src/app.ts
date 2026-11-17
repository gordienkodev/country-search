import { createSearchController } from './core/createSearchController.js';
import type { Country, SearchState } from './types';

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
}

const numberFormat = new Intl.NumberFormat('ru-RU');
const main = element('main');
const title = element('h1', 'Поиск стран');
const label = element('label', 'Название страны');
const input = element('input');
input.id = 'country-query';
input.type = 'search';
input.placeholder = 'Например, Germany';
input.autocomplete = 'off';
label.htmlFor = input.id;
const hint = element('p', 'Введите название страны на английском.');
hint.id = 'search-hint';
hint.className = 'hint';
input.setAttribute('aria-describedby', hint.id);
const status = element('p', 'Введите название, чтобы начать поиск.');
status.setAttribute('role', 'status');
status.setAttribute('aria-live', 'polite');
const retry = element('button', 'Повторить');
retry.type = 'button';
retry.hidden = true;
const results = element('ul');
results.className = 'results';
results.setAttribute('aria-label', 'Результаты поиска');

const dialog = element('dialog');
const detailTitle = element('h2');
detailTitle.id = 'country-detail-title';
dialog.setAttribute('aria-labelledby', detailTitle.id);
const details = element('dl');
const close = element('button', 'Закрыть');
close.type = 'button';
close.addEventListener('click', () => dialog.close());
dialog.append(detailTitle, details, close);

function openDetails(country: Country): void {
  detailTitle.textContent = country.name;
  details.replaceChildren();
  const fields = [
    ['Столица', country.capital || 'Нет данных'],
    ['Регион', country.region || 'Нет данных'],
    ['Население', numberFormat.format(country.population)],
    [
      'Площадь',
      country.area === undefined ? 'Нет данных' : `${numberFormat.format(country.area)} км²`,
    ],
    ['Границы (коды стран)', country.borders?.join(', ') || 'Нет данных'],
    ['Языки', country.languages.join(', ') || 'Нет данных'],
    ['Валюта', country.currencies?.join(', ') || 'Нет данных'],
  ];
  for (const [name, value] of fields) {
    details.append(element('dt', name), element('dd', value));
  }
  dialog.showModal();
}

function createCard(country: Country): HTMLLIElement {
  const item = element('li');
  const card = element('button');
  card.type = 'button';
  card.className = 'card';
  card.setAttribute('aria-label', `Подробнее: ${country.name}`);
  if (country.flag) {
    const flag = element('img');
    flag.src = country.flag;
    flag.alt = `Флаг: ${country.name}`;
    flag.loading = 'lazy';
    card.append(flag);
  }
  card.append(
    element('strong', country.name),
    element('span', `Столица: ${country.capital || 'Нет данных'}`),
    element('span', `Регион: ${country.region || 'Нет данных'}`),
    element('span', `Население: ${numberFormat.format(country.population)}`),
    element('span', 'Подробнее →'),
  );
  card.addEventListener('click', () => openDetails(country));
  item.append(card);
  return item;
}

function render(state: SearchState): void {
  results.replaceChildren();
  retry.hidden = state.status !== 'error';
  status.className = state.status === 'error' ? 'error' : '';
  results.setAttribute('aria-busy', String(state.status === 'loading'));

  switch (state.status) {
    case 'loading':
      status.textContent = 'Загрузка…';
      break;
    case 'empty':
      status.textContent = input.value.trim()
        ? 'Ничего не найдено. Попробуйте другое название.'
        : 'Введите название, чтобы начать поиск.';
      break;
    case 'error':
      status.textContent =
        state.error.kind === 'timeout'
          ? 'Время ожидания истекло. Попробуйте ещё раз.'
          : state.error.kind === 'http'
            ? `Ошибка сервера (${state.error.status}). Попробуйте ещё раз.`
            : 'Не удалось загрузить страны. Проверьте соединение и повторите поиск.';
      break;
    case 'success':
      status.textContent = `Найдено стран: ${state.countries.length}. Нажмите на карточку для подробностей.`;
      results.append(...state.countries.map(createCard));
      break;
  }
}

const controller = createSearchController(render);
input.addEventListener('input', () => {
  if (dialog.open) dialog.close();
  results.replaceChildren();
  retry.hidden = true;
  status.className = '';
  status.textContent = 'Ожидание ввода…';
  controller.setQuery(input.value);
});
retry.addEventListener('click', () => {
  void controller.retry();
});

main.append(title, label, input, hint, status, retry, results);
document.body.append(main, dialog);
