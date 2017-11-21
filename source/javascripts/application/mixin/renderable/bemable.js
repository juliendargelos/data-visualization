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
    var element = super.create();
    this.modifiers.node(element);
    return element;
  }

  static defineElement(object, element) {
    if(element[0] === '$' ) element = element.substring(1);
    Object.defineProperty(object.elements, element, {
      get: () => object.block.element(element)
    });
  }

  static mix(object, options) {
    options = super.mix(object, options);

    object.block = options.block ? options.block : object.parameterized;
    object.modifiers = options.modifiers ? options.modifiers : {};

    return options;
  }
}
