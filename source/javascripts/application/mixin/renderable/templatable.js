Application.Mixin.Renderable.Templatable = class Templatable extends Application.Mixin.Renderable {
  create() {
    this._element = this.template.cloneNode(true);
  }

  static mix(object, options) {
    options = super.mix(object, options);

    if(typeof options.template !== 'string') throw "You must provide a template as a css selector string";

    try {
      var template = document.createElement('div');
      template.innerHTML = document.querySelector(options.template).innerHTML;
      object.template = template.children[0];
      object.template.tagName; // Will throw the error below if there isn't any template
    }
    catch(e) {
      throw 'Unable to load template with selector "' + options.template + '"';
    }

    return options;
  }
}
