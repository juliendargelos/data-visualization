Application.Bem.Selector = class Selector extends Application.Bem {
  constructor(...parents) {
    super();

    this.parents = parents.reduce((parents, parent) => {
      return parents.concat(Array.isArray(parent) ? parent : [parent])
    }, []);
    this._modifiers = {};
  }

  get selector() {
    if(!this._selector && this.basename) {
      var className = [this.basename];
      var value;

      for(var modifier in this._modifiers) {
        value = this._modifiers[modifier];
        className.push(this.basename + '--' + modifier + (value === true ? '' : '--' + value))
      }

      this._selector = '.' + className.join('.');
    }

    return this._selector;
  }

  get all() {
    var all = new this.constructor(this.nodes);
    all.parentname = this.basename;

    return all;
  }

  get first() {
    var first = new this.constructor([this.node]);
    first.parentname = this.basename;

    return first;
  }

  get nodes() {
    if(!this.selector) return this.parents;
    else {
      return this.parents.reduce((elements, parent) => {
        return Array.prototype.slice.call(parent.querySelectorAll(this.selector)).concat(elements);
      }, []).filter((element, index, self) => {
        return self.indexOf(element) === index;
      });
    }
  }

  get node() {
    if(!this.selector) return this.parents.length === 0 ? null : this.parents[0];
    else {
      var node = null;

      this.parents.some(parent => {
        node = parent.querySelector(this.selector);
        return !!node;
      });

      return node;
    }
  }

  get modifiers() {
    return new Application.Bem.Modifiers(this.nodes).block(this.block).element(this.element);
  }

  with(modifier, value) {
    if(typeof modifier === 'object' && modifier !== null) {
      for(var m in modifier) this.modifier(m, modifier[m]);
    }
    else {
      value = value ? (typeof value === 'string' ? value : true) : undefined;

      if(value !== this._modifiers[modifier]) {
        if(value) this._modifiers[modifier] = value
        else delete this._modifiers[modifier];
        this._selector = null;
      }
    }

    return this;
  }

  static block(block) {
    return (new this(document)).block(block);
  }

  static element(element) {
    return (new this(document)).element(element);
  }

  static with(modifier, value) {
    return (new this(document)).modifer(modifier, value);
  }
}
