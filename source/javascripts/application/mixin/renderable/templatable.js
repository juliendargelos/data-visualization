Application.Mixin.Renderable.Templatable = class Templatable extends Application.Mixin.Renderable {
  create() {
    this._element = this.constructor.template.cloneNode(true);
    return this._element;
  }

  static mix(object, options) {
    options = super.mix(object, options);

    var name = options.template ? options.template : object.parameterized;

    try {
      var template = document.createElement('div');
      template.innerHTML = document.querySelector('script[type="text/template"][name="' + name + '"]').innerHTML;
      object.template = template.children[0];
      object.template.tagName; // Will throw the error below if there isn't any template
    }
    catch(e) {
      throw 'Unable to load template with name "' + name + '"';
    }

    return options;
  }
}
