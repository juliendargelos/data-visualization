Application.Mixin.Renderable = class Renderable extends Application.Mixin {
  get element() {
    if(!this._element) this.create();
    return this._element;
  }

  set element(v) {
    this._element = v;
  }

  get elements() {
    if(!this._elements) {
      this._elements = {};
      for(var element in this.constructor.elements) Application.Mixin.Renderable.defineElement(this, element);
    }

    return this._elements;
  }

  create() {

  }

  render() {

  }

  static defineElement(object, element) {
    var selector = object.constructor.elements[element];
    if(element[0] === '$' ) {
      if(selector[0] === '$') selector = selector.substring(1);
      Object.defineProperty(object.elements, element.substring(1), {
        get: () => object.element.querySelectorAll(selector)
      });
    }
    else {
      Object.defineProperty(object.elements, element, {
        get: () => object.element.querySelector(selector)
      });
    }
  }

  static mix(object, options) {
    options = super.mix(object, options);

    if(options.elements) {
      object.elements = {};
      if(Array.isArray(options.elements)) {
        options.elements.forEach(element => { object.elements[element] = element });
      }
      else {
        for(var element in options.elements) object.elements[element] = options.elements[element];
      }
    }

    return options;
  }
}
