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
      var selector = ['.' + this.basename];
      var value;

      for(var modifier in this._modifiers) {
        value = this._modifiers[modifier];
        if(value === Infinity) {
          selector.push('[class*="' + this.basename + '--' + modifier + '"]');
        }
        else {
          selector.push('.' + this.basename + '--' + modifier + (value === true ? '' : '--' + value));
        }
      }

      this._selector = selector.join('');
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

  get length() {
    return this.nodes.length;
  }

  get modifiers() {
    return new Application.Bem.Modifiers(this.nodes)
      .block(this._block)
      .element(this._element);
  }

  get className() {
    return this.attr('class');
  }

  set className(v) {
    this.attr('class', v);
  }

  get self() {
    this._block = null;
    this._element = null;

    return this;
  }

  get text() {
    var node = this.node;
    return node ? node.textContent : null;
  }

  set text(v) {
    var node = this.node;
    if(node) node.textContent = v;
  }

  with(modifier, value) {
    if(typeof modifier === 'object' && modifier !== null) {
      for(var m in modifier) this.with(m, modifier[m]);
    }
    else {
      if(arguments.length == 1) value = Infinity;
      else value = value ? (typeof value === 'string' ? value : true) : undefined;

      if(value !== this._modifiers[modifier]) {
        if(value) this._modifiers[modifier] = value;
        else delete this._modifiers[modifier];
        this._selector = null;
      }
    }

    return this;
  }

  attr(attribute, value) {
    if(arguments.length >= 2) {
      this.nodes.forEach(node => node.setAttribute(attribute, value));
      return this;
    }
    else if(typeof attribute === 'object' && attribute !== null) {
      for(var attr in attribute) this.attr(attr, attribute[attr]);
      return this;
    }
    else {
      var node = this.node;
      return node ? node.getAttribute(attribute) : null;
    }
  }

  removeAttr(...attributes) {
    this.nodes.forEach(node => {
      attributes.forEach(attribute => node.removeAttribute(attribute));
    });
    return this;
  }

  remove() {
    this.nodes.forEach(node => node.parentNode.removeChild(node));
    return this;
  }

  css(property, value) {
    if(arguments.length >= 2) {
      this.nodes.forEach(node => {
        node.style[property] = value;
        node.setAttribute('style', node.style.cssText);
      });
      return this;
    }
    else if(typeof property === 'object' && property !== null) {
      for(var p in property) this.css(p, property[p]);
      return this;
    }
    else {
      var node = this.node;

      if(node) {
        value = node.style[property];
        return value ? value : window.getComputedStyle(node)[property];
      }
      else return null;
    }
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
