import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};

  constructor(headersConfig = [], {
    data = [],
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    url = '',
    sortingSource = 'server',
    step = 30
  } = {}) {
    //npm test 07-async-code-fetch-api-part-1/2-sortable-table-v3/index.spec.js
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.url = new URL(url, BACKEND_URL);;
    this.step = step;
    this.start = 0;
    this.end = this.start + this.step;
    this.sortingSource = sortingSource;

    this.render();
  }

  onSortClick = async event => {
    const column = event.target.closest('[data-sortable="true"]');

    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc'
      };

      return orders[order];
    };

    if (column) {
      const { id, order } = column.dataset;
      this.sorted.id = column.dataset.id;
      this.sorted.order = toggleOrder(order);

      const sortedData = this.sortingSource === 'server' ? 
        await this.sortOnServer(id,toggleOrder(order)): 
        await this.sortData(id, toggleOrder(order));
      const arrow = column.querySelector('.sortable-table__sort-arrow');

      column.dataset.order = toggleOrder(order);

      if (!arrow) {
        column.append(this.subElements.arrow);
      }

      this.subElements.body.innerHTML = this.getTableRows(sortedData);
    }
  };

  onScroll = async event => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;
    if(bottom < document.documentElement.clientHeight && !this.loading && this.sortingSource === 'server'){
      this.start = this.end;
      this.end = this.start + this.step;
      this.loading = true;
      const res = await this.sortOnServer(id, order, this.start, this.end, 'append');
      this.data = this.data.concat(res);
      this.subElements.body.innerHTML = this.getTableRows(this.data);
      this.loading = false;
    }
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headersConfig.map(item => this.getHeaderRow(item)).join('')}
    </div>`;
  }

  getHeaderRow ({id, title, sortable}) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </div>
    `;
  }

  getHeaderSortingArrow (id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  getTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
      </div>
    `;
  }

  getTableRows (data) {
    return data.map(item => `
      <div class="sortable-table__row">
        ${this.getTableRow(item, data)}
      </div>`
    ).join('');
  }

  getTableRow (item) {
    const cells = this.headersConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    });

    return cells.map(({id, template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  getTable() {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody()}
        ${this.getLoading()}
        ${this.getEmpty()}
      </div>`;
  }

  getLoading(show = 'block') {
    return `
      <div data-element="loading" 
        class="loading-line sortable-table__loading-line" style="display:${show}">
      </div>
    `;
  }

  getEmpty(show = 'none') {
    return `
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder" style="display:${show}">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>
    `;
  }

  async render() {
    const {id, order} = this.sorted;
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    this.initEventListeners();

    const data = await this.loadData(id, order, this.start, this.end);
    this.subElements.body.innerHTML = this.getTableRows(data);
    this.data = [...data];

  }

  //если Загружены данные
  isLoaded() {
    this.subElements.loading.style.display = 'none';

  }

  //если данные загружаются
  isLoading() {
    this.subElements.loading.style.display = 'block';
  }

  //если данные пришли с сервера
  setDataEmpty() {
    this.subElements.emptyPlaceholder.style.display = 'block';

  }

  //если данные не пришли с сервера
  setDataExists() {
    this.subElements.emptyPlaceholder.style.display = 'none';
  }
  
  async loadData(id, order, start, end) {
    this.isLoading();
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    const data = await fetchJson(this.url.href); 
    if (!data.length) {
      this.setDataEmpty();
    } else {
      this.setDataExists();
    }
    this.isLoaded();
    return data;
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
    document.addEventListener('scroll', this.onScroll );
  }

  async sortOnServer(id, order, method = 'insert') {
    if (method === 'insert') {
      this.start = 0;
      this.end = this.step;
      this.data = await this.loadData(id, order, this.start, this.end);
    } else {
      return await this.loadData(id, order, this.start, this.end);
    }
    return this.data;
}

  async sortData(id, order) {

    const arr = [...this.data];
    const column = this.headersConfig.find(item => item.id === id);
    const {sortType, customSorting} = column;
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[id] - b[id]);
      case 'string':
        return direction * a[id].localeCompare(b[id], 'ru');
      case 'custom':
        return direction * customSorting(a, b);
      default:
        return direction * (a[id] - b[id]);
      }
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.subElements?.header?.removeEventListener('pointerdown', this.onSortClick);
    document.addEventListener('scroll', this.onScroll );
    this.remove();
    this.subElements = {};
  }
}

