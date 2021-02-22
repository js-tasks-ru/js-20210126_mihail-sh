import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';
import ImageUploader from './utils/imageuploader.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};
  product = {
    id: '',
    title: '',
    description: '',
    brand: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    characteristics: [],
    images: [],
    price: 100,
    rating: 0,
    discount: 0
  };
  PRODUCT_PATHNAME = '/api/rest/products';
  CAT_PATHNAME = '/api/rest/categories/';

  constructor (productId = '') {
    //npm test 08-forms-fetch-api-part-2/1-product-form-v1/index.spec.js
    this.productId = productId;
    this.urlCategory = new URL(this.CAT_PATHNAME, BACKEND_URL);
    this.urlProductId = new URL(this.PRODUCT_PATHNAME, BACKEND_URL);
  }

  get template() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          ${this.getTitle()}
          ${this.getDescription()}
          ${this.getImageContainer()}
          ${this.getSubcategory()}
          ${this.getPriceDiscount()}
          ${this.getQuantity()}
          ${this.getStatus()}
          ${this.getButtons()}
        </form>
      </div>
    `;
  }

  getTitle() {
    return `
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
    `;
  }

  getDescription() {
    return `
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
    `;
  }

  getImageContainer() {
    return `
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
        </div>
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
    `;
  }

  getImageList() {
    const img = this.product.images.map(item => this.getImage(item)).join(``);
    
    return `
        <ul class="sortable-list">${img}</ul>
    `;  
  }

  getImage(item) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${item.url}">
        <input type="hidden" name="source" value="${item.source}">
        <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${item.url}">
        <span>${item.source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;
  }

  getSubcategory() {
    return `
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory" id="subcategory">
          ${this.getSubcategoryOption()}
        </select>
      </div>
    `;
  }

  getSubcategoryOption() {
    return this.subcategories.map((subcategory) => 
    `<option value="${subcategory.id}">${subcategory.categorytitle} > ${subcategory.subcategorytitle}</option>`
    ).join('');
  }

  getPriceDiscount() {
    return `
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" id="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
    `;
  }

  getQuantity() {
    return `
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
      </div>
    `;
  }

  getStatus() {
    return `
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status" id="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
    `;
  }

  getSaveButton() {
    return this.productId ? 
      `<button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
      </button>` :
      ``;
  }

  getAddButton() {
    return this.productId === '' ? 
      `<button type="submit" name="save" class="button-primary-outline">
        Добавить товар
      </button>` :
      ``;
  }

  getButtons() {
    return `
      <div class="form-buttons">
        ${this.getSaveButton()}
        ${this.getAddButton()}
      </div>
    `;
  }

  getHiddenFile() {
    return `
      <input type="file" accept="image/*" hidden=""></input>
    `;
  }

  async render () {

    await this.loadCategories();
    if (this.productId) {
      await this.loadProduct();
    }

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;    
    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    this.bindData();
    this.bindEvents();

    return this.element;

  }

  //байндим пришедшие данные продукта в форму
  bindData() {

    const form = this.subElements.productForm;
    form.querySelector("[name='title']").value = this.unescape(this.product.title);
    form.querySelector("[name='description']").value = this.unescape(this.product.description);
    form.querySelector("[name='quantity']").value = this.product.quantity;
    form.querySelector("[name='subcategory']").value = this.product.subcategory? this.product.subcategory: this.subcategories[0].id;
    form.querySelector("[name='status']").value = this.product.status;    
    form.querySelector("[name='price']").value = this.product.price;
    form.querySelector("[name='discount']").value = this.product.discount;
    this.subElements.imageListContainer.innerHTML = this.getImageList();

  }

  //байндим обработчики событий
  bindEvents() {

    this.subElements.imageListContainer.addEventListener('click', this.onImageDelete);
    this.subElements.productForm.querySelector("[name='uploadImage']").addEventListener('click', this.onAddImage);
    this.subElements.productForm.addEventListener('submit', this.onSubmit);

  }

  onImageDelete = event => {
    const btn = event.target.closest('button'); 
    
    if (!btn) return; 

    const item = event.target.closest('li');
    const url = item.querySelector("[name='url']").value ;
    const source = item.querySelector("[name='source']").value ;
    //удаляем из this.product.images картинку
    this.product.images = this.product.images.filter(item => item.url !== url &&
      item.source !== source);
    item.remove();  
 
  }

  onAddImage = event => {
    const wrapper = document.createElement('div');
    //создаем скрытый input для file и кликаем его
    wrapper.innerHTML = this.getHiddenFile();
    const element = wrapper.firstElementChild;
    document.body.append(element);
    element.onchange = this.uploadFile;
    element.click();
  }

  onSubmit = async event => {
    event.preventDefault();
    //сохраняем в this.product все поля формы
    this.save();
  }

  //сохраняем данные формы в объект, приводим типы
  async save() {
    const form = this.subElements.productForm;
    
    this.product.title = escapeHtml(form.querySelector("[name='title']").value);
    this.product.description = escapeHtml(form.querySelector("[name='description']").value);
    this.product.quantity = +form.querySelector("[name='quantity']").value;
    this.product.subcategory = form.querySelector("[name='subcategory']").value;
    this.product.status = +form.querySelector("[name='status']").value;
    this.product.price = +form.querySelector("[name='price']").value;
    this.product.discount = +form.querySelector("[name='discount']").value;

    if (this.productId) {
      await this.sendData(this.urlProductId+"/id=${this.product.id}", this.product, 'PATCH');
      this.element.dispatchEvent(new CustomEvent('product-updated',{
              detail: { id: this.productId }
              })
      );
    }
    else {
      await this.sendData(this.urlProductId, this.product, 'PUT');
      this.element.dispatchEvent(new CustomEvent('product-saved'));
    }

  }

  //универсальный метод отправки
  async sendData(url = '', data = {}, method = 'POST') {
    const response = await fetch(url, {
      method: method, // GET, *POST, PATCH, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *client
      body: JSON.stringify(data) // body data (того же типа, что и "Content-Type" header)
    });
    return await response.json();
  }

  uploadFile = async event => {
    const uploader = new ImageUploader();

    //ставим крутилку на время загрузки
    this.subElements.productForm.querySelector("[name='uploadImage']").classList.add('is-loading');
    this.subElements.productForm.querySelector("[name='uploadImage']").setAttribute('disabled', '');

    try {
      const [file] = event.currentTarget.files;
      const result = await uploader.upload(file);
      this.appendImage(result);

    } catch(err) {
      alert('Ошибка загрузки изображения');
      console.error(err);
    } finally {
      //убираем крутилку
      this.subElements.productForm.querySelector("[name='uploadImage']").classList.remove('is-loading');
      this.subElements.productForm.querySelector("[name='uploadImage']").removeAttribute('disabled');
    }
    
  }

  //если пришел ответ с escape html
  unescape(string = '') {
    return string
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  }

  appendImage(img) {
    const imgObj = {url: img.data.link, source: img.data.name};
    this.product.images.push(imgObj);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getImage(imgObj);
    this.subElements.imageListContainer.firstElementChild.append(wrapper.firstElementChild);
  }

  //сохраняем категории
  async loadCategories() {
    const categories = await this.loadData(this.urlCategory, {_sort:"weight",_refs: "subcategory"});
    this.subcategories = [];

    categories.forEach((category) => {
      this.subcategories = [
          ...this.subcategories, 
          ...category.subcategories.map(
            (subcategory) => 
            ({id:subcategory.id, categorytitle: category.title, subcategorytitle: subcategory.title})
          )
        ]
    })
  }

  //сохраняем продукты
  async loadProduct() {
    const product = await this.loadData(this.urlProductId, {id: 
      this.productId
    });
    [this.product] = product;
  }

  //общий метод формарирования URL и отправки
  async loadData(url, params = {}) {
    for (const key in params) {
      url.searchParams.set(key, params[key]);
    }
    const data = await fetchJson(url);
    return data;
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
    this.remove();
    this.subElements = {};
  }

}
