export default class SortableList {
  element;
  dragElem;
  placeholderElem;


  constructor({ items = [] } = {}) {
    //npm test 09-tests-for-frontend-apps/2-sortable-list/index.spec.js
    this.items = items;
    this.render();

  }

  getPlaceholder(size) {
    const elem = document.createElement('div');
    elem.classList.add('sortable-list__placeholder');
    elem.style.width = `${size.width}px`;
    elem.style.height = `${size.height}px`;
    return elem;
  }

  render() {

    this.element = this.prepareElement();
    this.initListeners();
  
  }

  prepareElement() {
    const element = document.createElement('ul');
    element.className = 'sortable-list';
    this.items.forEach(item => 
      item.classList.add('sortable-list__item')
    );
    element.append(...this.items);
    return element;
  }

  prepareDragElement(elem, event) {
    this.dragElem = elem;
    const size = this.dragElem.getBoundingClientRect();
    this.offset = {
      x: event.clientX - size.left,
      y: event.clientY - size.top };
    this.placeholderElem = this.getPlaceholder(size);

    this.dragElem.classList.add('sortable-list__item_dragging');
    this.dragElem.style.width = size.width + 'px';
    this.dragElem.style.height = size.height + 'px';
    this.dragElem.replaceWith(this.placeholderElem);
    this.element.append(this.dragElem);

    this.moveAt(event);

    document.addEventListener('pointermove', this.onDragging);
    document.addEventListener('pointerup', this.onDragStop);

  }

  moveAt(event) {
    this.dragElem.style.left = event.clientX - this.offset.x + 'px';
    this.dragElem.style.top = event.clientY - this.offset.y + 'px';
  }

  onDragging = event => {
    this.moveAt(event);

    const prevElem = this.placeholderElem.previousElementSibling;
    const nextElem = this.placeholderElem.nextElementSibling;

    if (prevElem) {
      const prevElemMiddle = prevElem.getBoundingClientRect().top + prevElem.getBoundingClientRect().height / 2;

      if (event.clientY < prevElemMiddle) {
        prevElem.before(this.placeholderElem);
        return;
      }
    }

    if (nextElem) {
      const nextElemMiddle = nextElem.getBoundingClientRect().top + nextElem.getBoundingClientRect().height / 2;

      if (event.clientY > nextElemMiddle) {
        nextElem.after(this.placeholderElem);
        return;
      }
    }
  }

  onDragStop = event => {
    this.dragElem.style.cssText = '';
    this.dragElem.classList.remove('sortable-list__item_dragging');
    this.placeholderElem.replaceWith(this.dragElem);

    this.removeEventListeners();
  }

  initListeners() {
    this.element.addEventListener('pointerdown', this.onDragStart);
    this.element.addEventListener('pointerdown', this.onDelete);
  }

  removeEventListeners() {
    document.removeEventListener('pointermove', this.onDragging);
    document.removeEventListener('pointerup', this.onDragStop);
  }

  onDragStart = event => {
    event.preventDefault();
    if (event.which !== 1) return;

    const elem = event.target.closest('.sortable-list__item');

    if (elem && event.target.dataset.grabHandle !== undefined) {
      this.prepareDragElement(elem, event);
    }
    else 
      return;

  }

  onDelete(event) {
    event.preventDefault();
    if (event.which !== 1) return;

    const elem = event.target.closest('.sortable-list__item');

    if (elem && event.target.dataset.deleteHandle !== undefined) { 
      elem.remove();
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
  }

}
