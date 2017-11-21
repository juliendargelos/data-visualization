Application.Bem.Modifiers = class Modifiers extends Application.Bem {
  constructor(...elements) {
    super();

    this.node(...elements);
  }

  get(modifier) {
    var value = false;

    this.elements.some(element => {
      var match = (element.getAttribute('class') || '').match(this.constructor.pattern(this.basename, modifier));
      if(match !== null) value = match.length > 1 ? match[1] : true;

      return !!value;
    });

    return value;
  }

  set(modifier, value) {
    if(typeof modifier === 'object' && modifier !== null) {
      for(var m in modifier) this.set(m, modifier[m]);
    }
    else {
      this.elements.forEach(element => {
        var className = element.getAttribute('class');
        className = className ? className.replace(this.constructor.pattern(this.basename, modifier), '') : '';
        element.setAttribute('class', className);
        if(value) element.setAttribute('class', className + ' ' + this.constructor.className(this.basename, modifier, value));
      });
    }
  }

  define(modifier, value) {
    if(typeof modifier === 'object' && modifier !== null) {
      for(var m in modifier) this.define(m, modifier[m]);
    }
    else if(Array.isArray(modifier)) modifier.forEach(m => this.define(m))
    else {
      Object.defineProperty(this, modifier, {
        get: () => this.get(modifier),
        set: v => this.set(modifier, v)
      });

      if(arguments.length >= 2) this.set(modifier, value);
    }

    return this;
  }

  node(...elements) {
    this.elements = elements.reduce((elements, element) => {
      return elements.concat(Array.isArray(element) ? element : [element])
    }, []);

    return this;
  }

  static pattern(name, modifier) {
    return new RegExp('\\b' + name + '--' + modifier + '(?:--([^\\s]))?\\b', 'g');
  }

  static className(name, modifier, value) {
    return name + '--' + modifier + (value && ['string', 'number'].includes(typeof value) ? '--' + value : '');
  }
}
