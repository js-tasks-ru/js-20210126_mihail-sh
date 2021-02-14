class Tooltip {
  static #onlyInstance = null;

  shiftX = 10;//смещение X tooltip относительно указателя
  shiftY = 15;//смещение Y tooltip относительно указателя

  constructor() {
    //npm test 06-events-practice/2-tooltip/index.spec.js
    if(!Tooltip.#onlyInstance) {
      Tooltip.#onlyInstance = this;
    } else {
        return Tooltip.#onlyInstance;
    }
  }

  initialize() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    document.addEventListener("pointerover", this.startTracking);
    document.addEventListener("pointerout", this.stopTracking);
  }

  //стрелочная, чтобы this смотрел на объект класса Tooltip
  startTracking = event => {
    const target = event.target;
    if (!target.dataset.tooltip) return;
    this.render(event.target.dataset.tooltip);
    this.moveAt(event);
    document.addEventListener("pointermove", this.moveAt);

  }

  stopTracking = event => {
    this.element.remove();
    document.removeEventListener("pointermove", this.moveAt);
  }

  moveAt = event => {
    this.element.style.left = event.pageX + this.shiftX + 'px';
    this.element.style.top = event.pageY + this.shiftY + 'px';
  }

  get template() {
    return `<div class="tooltip"></div>`;
  }

  render(tooltipText) {
    this.element.textContent = tooltipText;
    document.body.append(this.element);
  }

  destroy = () => {
    this.element.remove();
    document.removeEventListener("pointerover", this.startTracking);
    document.removeEventListener("pointerout", this.stopTracking);
    document.removeEventListener('pointermove', this.moveAt);
  }

}

const tooltip = new Tooltip();

export default tooltip;
