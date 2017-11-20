Application.Mixin = class Mixin extends Application {
  static get descriptors() {
    if(!this._descriptors) {
      this._descriptors = Object.getOwnPropertyDescriptors(this.prototype);
      delete this._descriptors.constructor;
    }

    return this._descriptors;
  }

  static mix(object, options) {
    if(typeof options !== 'object' || options === null) options = {};

    for(var property in this.descriptors) {
      if(!Object.getOwnPropertyDescriptor(object.prototype, property)) Object.defineProperty(object.prototype, property, this.descriptors[property]);
    }

    return options;
  }

  static with(options) {
    return new Application.Mixin.Include(this, options);
  }

  static mixable(mixin) {
    return mixin.prototype instanceof this || mixin instanceof Application.Mixin.Include;
  }
}
