Application.Mixin = class Mixin extends Application {
  static get descriptors() {
    var descriptors = Object.assign({}, Object.getOwnPropertyDescriptors(this.prototype));
    delete descriptors.constructor;

    return descriptors;
  }

  static mix(object, options) {
    if(typeof options !== 'object' || options === null) options = {};
    if(this.parent && !this.parent.mixed(object)) this.parent.mix(object, options);

    for(var property in this.descriptors) {
      Object.defineProperty(object.prototype, property, this.descriptors[property]);
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
