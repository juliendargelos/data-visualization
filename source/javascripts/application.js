//= require_self
//= require_tree ./application

class Application {
  static get capitals() {
    if(!this._capitals) this._capitals = 'ABCDEFGHIJKLMNOPQRSTUVWXZ'.split('');
    return this._capitals;
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
  }
}
