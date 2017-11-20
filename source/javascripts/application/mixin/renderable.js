Application.Mixin.Renderable = class Renderable extends Application.Mixin {
  get element() {
    if(!this._element) this.create();
    return this._element;
  }

  get elements() {
    if(!this._elements) {
      this._elements = {};
      for(var element in this.constructor.elements) Application.Mixin.Renderable.defineInstanceElement(this, element);
    }

    return this._elements;
  }

  get template() {
    if(!this.constructor._template) {
      var template = document.createElement('div');
      template.innerHTML = document.querySelector('#character').innerHTML;
      this.constructor._template = template.children[0];
    }

    return this.constructor._template;
  }

  create() {
    this._element = this.template.cloneNode(true);
  }

  static defineObjectElement(object, name, selector) {
    if(name[0] === '$' ) object.elements[name.substring(1)] = instance => instance.element.querySelectorAll(selector);
    else object.elements[name] = instance => instance.element.querySelector(selector);
  }

  static defineInstanceElement(object, name) {
    Object.defineProperty(name, object._elements, {
      get: function() {
        return object.constructor.elements[name](this);
      }
    });
  }

  static mix(object, options) {
    options = super.mix(object, options);

    if(options.elements) {
      object.elements = {};
      for(var element in options.elements) this.defineObjectElement(object, element, options.elements[element]);
    }

    return options;
  }
}
