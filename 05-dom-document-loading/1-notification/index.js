export default class NotificationMessage {

  static isPresentElement = null; //ссылка на экземпляр NotificationMessage, если он уже есть на странице

  //html шаблон компонента
  get compTemplate() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration/1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.header}</div>
          <div class="notification-body">
            ${this.body}
          </div>
        </div>
      </div>
   `;
  }

  constructor(body = '',{duration = 1000, type = 'success'} = {}) {
    //npm test 05-dom-document-loading/1-notification/index.spec.js
    this.body = body;
    this.options = {};
    this.duration = duration;
    this.type = type;
    this.header = type;
    this.render();
  }

  show(tgElement = document.body) {
    //удаляем экземпляр компонента, если он уже есть
    if (NotificationMessage.isPresentElement) {  
      NotificationMessage.isPresentElement.remove(); 
    }

    tgElement.append(this.element);
    NotificationMessage.isPresentElement = this.element;

    setTimeout(() => {
        this.destroy(); 
      }, this.duration);
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.compTemplate;
    this.element = element.firstElementChild;
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
