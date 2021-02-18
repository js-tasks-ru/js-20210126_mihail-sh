const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  subElements = {};
  element = {};
  chartHeight = 50;

  constructor({
    url = '',
    label = '',
    link = '',
    formatHeading = value => '$' + value,
    range = {
      from: new Date(),
      to: new Date()
    },
  } = {}) {
    //npm test 07-async-code-fetch-api-part-1/1-column-chart/index.spec.js
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
  }

  getColumnBody(data) {
    const maxValue = Math.max(...Object.values(data));
    const scale = this.chartHeight / maxValue;

    return Object.values(data)
      .map(item => {
        const percent = (item / maxValue * 100).toFixed(0);

        return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
      })
      .join('');
  }

  getHeader(data) {
    const accum = Object.values(data)
      .reduce((accum, current) => accum += current, 0);
    
    return this.formatHeading(accum);
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.update(this.range.from, this.range.to);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  async update(from, to) {
    this.range.from = from;
    this.range.to = to;
    this.isLoading();
    const data = await this.loadData();
    this.subElements.header.innerHTML = this.getHeader(data);
    this.subElements.body.innerHTML = this.getColumnBody(data);
    
    this.isLoaded();
  }

  //если Загружены данные
  isLoaded() {
    this.element.classList.remove('column-chart_loading');
  }

  //если данные загружаются
  isLoading() {
    this.element.classList.add('column-chart_loading');
  }
  
  loadData() {
      const url = new URL(this.url, BACKEND_URL);
      url.searchParams.set('from', this.range.from.toISOString());
      url.searchParams.set('to', this.range.to.toISOString());
      return this.getData(url.href);
  }

  async getData(url) {
    const response = await fetch(url);
    return await response.json();
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
