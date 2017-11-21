//= require_self
//= require_tree ./application

class Application {
  static get mixed() {
    if(!this._mixed) this._mixed = [];
    return this._mixed;
  }
  static get includes() { return [] }

  static get capitals() {
    if(!this._capitals) this._capitals = 'ABCDEFGHIJKLMNOPQRSTUVWXZ'.split('');
    return this._capitals;
  }

  static get parameterized() {
    return this.name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  }

  static isValidComponent(component) {
    return this.capitals.includes(component[0]);
  }

  static get components() {
    var components = [];

    for(var component in this) {
      if(this.hasOwnProperty(component) && this.isValidComponent(component)) components.push(this[component]);
    }

    return components;
  }

  static initialize() {
    this.components.forEach(component => {
      if(component.prototype instanceof this) component.initialize();
    });

    this.includes.forEach(mixin => {
      if(Application.Mixin.mixable(mixin)) mixin.mix(this);
      else throw "Include is not mixable:\n" + mixin;
    });
  }
}
