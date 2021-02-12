export default class SortableTable {
  subElements = {};

  //html шаблон компонента
  get compTemplate() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeader()}
          </div>
          <div data-element="body" class="sortable-table__body">
          ${this.getBody()}
          <div>
        </div>
      </div>
   `;
  }

  //шаблон хедера
  getHeader() {
    return Object.entries(this.head).reduce((headerTemplate, [key, value]) => {
      headerTemplate += `
      <div class="sortable-table__cell" 
                  data-id="${key}" 
                  data-sortable="${value.sortable}" 
                  data-order="${this.sortOrder}">
          <span>${value.title}</span>
          <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>
        </div>
      `;
      return headerTemplate;
    }
    ,''
    );
  }

  //шаблон блока с данными
  getBody() {
    let templateBody = '';
    templateBody = Array.from(this.data).reduce((templateBody,item) => {
          templateBody += 
              '<a href="/products/'+item.id+'" class="sortable-table__row">'+
              Object.entries(this.head).reduce((templateBody,[key,value]) =>
                templateBody + this.head[key].template(item[key])
              ,'') + 
              '</a>';
          return templateBody;
        }
        ,'');
    return templateBody;
  }

  //дефолтный шаблон ячейки с данными
  getDefaultCellTemplate(value) {
    return `
        <div class="sortable-table__cell">${value}</div>
      `;
  }

  constructor(head = [], {data = []} = {}) {
    //npm test 05-dom-document-loading/2-sortable-table-v1/index.spec.js
    this.head = this.transformHead(head);
    this.data = data;
    this.sortOrder = '';
    this.sortColumn = '';
    this.render();
  }

  //рендер
  render() {
    const element = document.createElement('div');
    element.innerHTML = this.compTemplate;
    this.element = element.firstElementChild;
    this.sortElements = this.getSortElements(this.element);
    this.subElements = this.getSubElements(this.element);
  }

  //сортировка по колонке
  sort(sortColumn, sortOrder) {
    //если колонка и порядок сортировки не поменялись или по колонке сортировать нельзя
    //то прерываем
    if ((this.sortOrder === sortOrder && this.sortColumn === sortColumn) ||
    !this.sortElements[sortColumn]) {
      return;
    }

    //выставляем сортировку колонке в хедере
    Object.entries(this.sortElements).map(([key, item]) => {
      item.dataset.order = (key === sortColumn) ? sortOrder: '';
    });

    //сортируем данные и получаем шаблон Body
    const sortedData = this.data.sort(this.compareFunc(sortColumn, sortOrder));
    this.subElements.body.innerHTML = this.getBody(sortedData);

    this.sortColumn = sortColumn;
    this.sortOrder = sortOrder;  
  }


  compareFunc(sortColumn, sortOrder = 'asc') {
    return (a, b) => {
      const ruCompareRule = 'ru-RU-u-kf-upper';
      const enCompareRule = 'en-EN-u-kf-upper';

      let cmpRes;

      switch (this.head[sortColumn].sortType) {
        case 'string':
          cmpRes = a[sortColumn].localeCompare(b[sortColumn], [ruCompareRule, enCompareRule]);
          break;
        case 'number':
          cmpRes = a[sortColumn] - b[sortColumn];
          break;
      }

      switch (sortOrder) {
        case 'asc':
          return cmpRes;
        case 'desc':
          return -cmpRes;
      }

    }
  }

  transformHead(head) {
    return head.reduce(
      (headArr, headItem) => {
          const {
            title = '',
            sortable = false,
            sortType,
            template = this.getDefaultCellTemplate 
          } = headItem;
          headArr[headItem.id] = { 
            title,
            sortable,
            sortType,
            template
          }
          return headArr;
        }
      ,{}
    )
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  //получаем колонки, по которым разрешено сортировать
  getSortElements(element) {
    const elements = element.querySelectorAll('[data-sortable=true]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.id] = subElement;

      return accum;
    }, {});
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

