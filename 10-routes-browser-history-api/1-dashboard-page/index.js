import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  //npm test 10-routes-browser-history-api/1-dashboard-page/index.spec.js
  bestsellersUrl = '/api/dashboard/bestsellers';
  
  async render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();

    this.range = {
      from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      to: new Date(),
    }

    this.loadComponents();
    this.appendComponents();
    this.initEventListeners();

    return this.element;
  }

  loadComponents() {
    const rangePicker = new RangePicker({
      from: this.range.from,
      to: this.range.to,
    });
    const ordersChart = new ColumnChart({
      label: 'orders',
      link: '/sales',
      url: '/api/dashboard/orders',
      range: {
        from: this.range.from, 
        to: this.range.to
      }
    });
    const salesChart = new ColumnChart({
      label: 'sales',
      url: '/api/dashboard/sales',
      range: {
        from: this.range.from, 
        to: this.range.to
      },
      formatHeading: (data) => {return '$' + new Intl.NumberFormat('ru').format(data)}
    });
    const customersChart = new ColumnChart({
      label: 'customers',
      url: '/api/dashboard/customers',
      range: {
        from: this.range.from, 
        to: this.range.to
      }
    });

    const sortableTable = new SortableTable(header, {
      url:this.bestsellersUrl, isSortLocally: false
    });

    this.components = {
      rangePicker, ordersChart, salesChart, customersChart, sortableTable
    }
  }

  appendComponents() {
    Object.entries(this.components).map(([name, component]) => {
      this.subElements[ name ].append(component.element);
    });
  }

  async updateComponents(from = this.range.from, to = this.range.to) {

    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);

    const tableUrl = new URL(this.bestsellersUrl, BACKEND_URL);
    tableUrl.searchParams.set('from', new Date(from.getTime() - (new Date()).getTimezoneOffset() * 60000).toISOString());
    tableUrl.searchParams.set('to', new Date(to.getTime() - (new Date()).getTimezoneOffset() * 60000).toISOString());

    this.components.sortableTable.addRows(fetchJson(tableUrl));

  }

  get template() {
    return `
      <div class="dashboard full-height flex-column">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div class="dashboard__charts">
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>
        <h3 class="block-title">Best sellers</h3>
        <div data-element="sortableTable"></div>
      </div>
    `;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
