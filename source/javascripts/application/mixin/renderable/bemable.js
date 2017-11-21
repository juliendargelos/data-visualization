Application.Mixin.Renderable.Bemable = class Bemable extends Application.Mixin.Renderable {
  get block() {
    return new Application.Bem.Selector(this.element).block(this.constructor.block);
  }

  get elements() {
    if(!this._elements) {
      this._elements = {};
      for(var element in this.constructor.elements) Application.Mixin.Renderable.Bemable.defineElement(this, element);
    }

    return this._elements;
  }

  get modifiers() {
    if(!this._modifiers) {
      this._modifiers = new Application.Bem.Modifiers(this.element)
        .block(this.constructor.block)
        .define(this.constructor.modifiers);
    }

    return this._modifiers;
  }

  create() {
    this.modifiers.node(this._element);
    return this._element;
  }

  static defineElement(object, element) {
    var name = object.constructor.elements[element];

    if(element[0] === '$' ) element = element.substring(1);
    Object.defineProperty(object.elements, element, {
      get: () => object.block.element(name)
    });
  }

  static mix(object, options) {
    if(typeof options === 'object' && object !== null && Array.isArray(options.elements) && options.transformElementNames !== false) {
      var elements = {};
      options.elements.forEach(element => {
        var name = element.replace(/([A-Z])/g, '-$1').replace(/^-/, '').toLowerCase()
        var key = name.split('-').map(k => k[0].toUpperCase() + k.substring(1)).join('');
        key = key[0].toLowerCase() + key.substring(1);

        elements[key] = name;
      });

      options.elements = elements;
    }

    options = super.mix(object, options);

    object.block = options.block ? options.block : object.parameterized;
    object.modifiers = options.modifiers ? options.modifiers : {};

    return options;
  }
}
