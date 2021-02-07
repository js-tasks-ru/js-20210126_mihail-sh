export default class ColumnChart {
  _chartHeight = 50;//высота колонок гистограммы

  get chartHeight() {
    return this._chartHeight;
  }

  //html шаблон компонента
  get _compTemplate() {
    return ` 
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this._getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.value}</div>
          <div data-element="body" class="column-chart__chart">
            ${this._getChartColumn(this.data)}
          </div>
        </div>
      </div>
    `;
  }

  constructor({data = [], label = '', value = '', link = ''} = {}) {
    //npm test 04-oop-basic-intro-to-dom/1-column-chart/index.spec.js
    this.data = [...data];
    this.label = label;
    this.value = value;
    this.link = link;
    this.render();
    //this.initEventListeners();
  }
 
  render() {
    const element = document.createElement('div');
    
    element.innerHTML = this._compTemplate;
    this.element = element.firstElementChild;

    if (this.data.length) {
      this._isLoaded();
    }
    
  }

  //обновление данных и перерисовка
  update(data) {
    this._isLoading();
    this.data = [...data];    
    this.render();
  }

  //ссылки
  _getLink() {
    return this.link ? '<a href="' + this.link + '" class="column-chart__link">View all</a>': '';
  }

  //если Загружены данные
  _isLoaded() {
    this.element.classList.remove('column-chart_loading');
  }

  //если данные загружаются
  _isLoading() {
    this.element.classList.add('column-chart_loading');
  }

  //собранная html строка со столбцами гистограммы
  _getChartColumn(data) {
    return this._getColumnProps(data).reduce((prev,current) => 
      prev += '<div style="--value: ' + current.value + '" data-tooltip="' + current.percent + '"></div>'
      ,''
      );
  }

  //возвращаем пропорциональные величины данных и их процентное значение
  _getColumnProps(data) {
    if (!data.length) return []; 
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;
  
    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }
    
  // initEventListeners () {
  //   // NOTE: в данном методе добавляем обработчики событий, если они есть
  // }

  remove () {
    this.element.remove();
  }
    
  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }
}
