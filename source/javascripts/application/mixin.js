Application.Mixin = class Mixin extends Application {
  static get descriptors() {
    var descriptors = Object.assign({}, Object.getOwnPropertyDescriptors(this.prototype));
    delete descriptors.constructor;

    return descriptors;
  }

  static mix(object, options) {
    if(typeof options !== 'object' || options === null) options = {};
    if(this.parent && !this.parent.mixed(object)) this.parent.mix(object, options);

    var descriptors = this.descriptors;

    for(var property in descriptors) {
      if(typeof descriptors[property].value === 'function' && object.prototype.hasOwnProperty(property)) {
        var method = object.prototype[property];
        var override = descriptors[property].value;

        // console.log(property, object.prototype[property], descriptors[property].value)

        descriptors[property].value = function(...args) {
          method.call(this, ...args);
          return override.call(this, ...args);
        };
      }

      Object.defineProperty(object.prototype, property, descriptors[property]);
    }

    object.mixed.push(this);

    return options;
  }

  static mixed(object) {
    return object.mixed.indexOf(this) !== -1;
  }

  static with(options) {
    return new Application.Mixin.Include(this, options);
  }

  static mixable(mixin) {
    return mixin.prototype instanceof this || mixin instanceof Application.Mixin.Include;
  }

  static initialize() {
    super.initialize();
    this.components.forEach(component => { component.parent = this });
  }
}
