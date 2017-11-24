Application.Mixin.Renderable.Templatable = class Templatable extends Application.Mixin.Renderable {
  create() {
    this.element = this.constructor.template(this).cloneNode(true);
    return this.element;
  }

  static mix(object, options) {
    options = super.mix(object, options);

    var name = options.template ? options.template : object.parameterized;


    var template = function(name) {
      var template = document.createElement('div');
      try {
        template.innerHTML = document.querySelector('script[type="text/template"][name="' + name + '"]').innerHTML;
        return template.children[0];
      }
      catch(e) {
        throw 'Unable to load template with name "' + name + '"';
      }
    };

    if(typeof name === 'function') {
      object.template = function(instance) {
        return template(name(instance));
      };
    }
    else {
      template = template(name);

      object.template = function() {
        return template;
      };
    }

    return options;
  }
}
