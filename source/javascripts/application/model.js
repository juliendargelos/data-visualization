Application.Model = class Model extends Application {
  constructor(attributes) {
    super();

    this.constructor.all.push(this);
    this.reset();
    this.update(attributes);
  }

  update(attributes) {
    if(typeof attributes === 'object' && attributes !== null) {
      for(var attribute in attributes) {
        if(this.hasOwnProperty(attribute) || this.constructor.keys.includes(attribute)) this[attribute] = attributes[attribute];
      }
    }
  }

  reset() {
    this.update(this.constructor.attributes);
  }

  equal(model) {
    if(typeof model !== 'object' || model === null) model = {id: model};

    var v1, v2;

    for(var attribute in model) {
      v1 = this[attribute];
      v2 = model[attribute];

      if(typeof v1 !== 'function') {
        if(typeof v2 === 'function') {
          if(v2.call(this, v1) === false) return false;
        }
        else if(v1 instanceof Application.Model) {
          if(!v1.equal(v2)) return false;
        }
        else if(v1 != v2) return false;
      }
    }

    return true;
  }

  static get all() {
    if(!this._all) this._all = new Application.Model.Collection();
    return this._all;
  }

  static find(...args) {
    return this.all.find(...args);
  }

  static where(...args) {
    return this.all.where(...args);
  }

  static whereNot(...args) {
    return this.all.whereNot(...args);
  }

  static order(...args) {
    return this.all.order(...args);
  }

  static average(...args) {
    return this.all.average(...args);
  }

  static sum(...args) {
    return this.all.sum(...args);
  }

  static get length() {
    return this.all.length;
  }

  static get count() {
    return this.all.count;
  }

  static get first() {
    return this.all.first;
  }

  static get last() {
    return this.all.last;
  }

  static get uniqueID() {
    return Date.now() + '-' + Math.floor(Math.random()*1000000);
  }

  static get attributes() {
    return {
      id: this.uniqueID
    }
  }

  static get keys() {
    if(!this._keys) this._keys = Object.keys(this.attributes);
    return this._keys;
  }

  static create(...attributes) {
    attributes.forEach(attrs => Array.isArray(attrs) ? this.create(...attrs) : new this(attrs));
  }
}
