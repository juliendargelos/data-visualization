


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

  static initialize(callback) {
    this.components.forEach(component => {
      if(component.prototype instanceof this) component.initialize();
    });

    this.includes.forEach(mixin => {
      if(Application.Mixin.mixable(mixin)) mixin.mix(this);
      else throw "Include is not mixable:\n" + mixin;
    });

    if(typeof callback === 'function') callback.call(this);
  }
}
;
Application.Bem = class Bem extends Application {
  constructor() {
    super();
    this.parentname = null;
  }

  get basename() {
    if(!this._basename && this._block) {
      this._basename = this._block + (this._element ? '__' + this._element : '');
      this._selector = null;
    }
    return this._basename || this.parentName;
  }

  block(block) {
    if(block !== this._block) {
      this._block = block;
      this._basename = null;
    }

    return this;
  }

  element(element) {
    if(element !== this._element) {
      this._element = element;
      this._basename = null;
    }

    return this;
  }
}
;
Application.Characters = class Characters extends Application {
  static get includes() {
    return [
      Application.Mixin.Renderable.Bemable.with({
        elements: ['box']
      })
    ];
  }

  constructor(element) {
    super();

    if(element) this.element = element;

    window.addEventListener('mousewheel', event => {
      this.element.scrollTop += event.deltaY;
    });
  }

  add(...characters) {
    characters.forEach(character => {
      var box = document.createElement('box');
      box.className = 'characters__box';
      box.appendChild(character.element);

      this.element.appendChild(box);
    })
  }

  static initialize() {
    super.initialize(() => {
      this.current = new this(Application.Bem.Selector.block(this.block).node);
    });
  }
}
;
Application.Data = class Data extends Application {
  static fetch() {
    var scripts = document.querySelectorAll('script[type="text/json"]');
    var script;

    for(var i = 0; i < scripts.length; i++) {
      script = scripts[i];
      this[script.getAttribute('name')] = JSON.parse(script.textContent);
    }
  }

  static initialize() {
    super.initialize();
    this.fetch();
  }
}
;
Application.Disaster = class Disaster extends Application {
  static get includes() {
    return [
      Application.Mixin.Renderable.Bemable
    ];
  }

  constructor(element) {
    super();
    this.element = element;
  }

  static activate(disaster) {
    var current;

    this.all.forEach(d => {
      if(d.modifiers.get(disaster)) {
        current = d;
        d.modifiers.set('enabled')
      }
      else d.modifiers.set('enabled', false)
    });

    setTimeout(() => {
      current.modifiers.set('enabled', false);
      Application.Model.Character.all.forEach(character => {
        character.dead = false;
        character.render();
      });
    }, 10000);

    switch(disaster) {
      case 'water':
        if(!Application.Model.Character.rendering.includes('swimming')) {
          setTimeout(() => {
            Application.Model.Character.all.forEach(character => { character.dead = true });
          }, 1000);
        }
        break;
      case 'smog':
        if(!Application.Model.Character.rendering.includes('apnea')) {
          setTimeout(() => {
            Application.Model.Character.all.forEach(character => { character.dead = true });
          }, 1000);
        }
        break;
    }
  }

  static initialize() {
    super.initialize();

    this.all = [];

    Application.Bem.Selector.block(this.block).nodes.forEach(disaster => {
      this.all.push(new this(disaster));
    });
  }
}
;
Application.Machine = class Machine extends Application {
  static get includes() {
    return [
      Application.Mixin.Renderable.Bemable.with({
        elements: ['skill', 'run', 'disaster']
      })
    ];
  }

  constructor(element) {
    super();

    this.element = element;

    this.elements.run.node.addEventListener('click', () => {
      Application.Model.Character.render(...this.elements.skill.nodes.map(skill => skill.selector.value));
      Application.Disaster.activate(this.elements.disaster.node.selector.value);
    });
  }

  static initialize() {
    super.initialize();
    this.current = new this(Application.Bem.Selector.block('machine').node);
  }
}
;
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

        descriptors[property].value = function(...args) {
          method.call(this, ...args);
          return override.call(this, ...args);
        };
      }

      var descriptor = Object.assign(Object.getOwnPropertyDescriptor(object.prototype, property) || {}, descriptors[property]);

      // if(descriptor.get || descriptor.set) delete descriptor.value;

      Object.defineProperty(object.prototype, property, descriptor);
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
;
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
;
Application.Selector = class Selector extends Application {
  static get includes() {
    return [
      Application.Mixin.Renderable.Bemable.with({
        elements: ['item', 'wrapper']
      })
    ];
  }

  constructor(element) {
    super();

    this.element = element;

    this.element.addEventListener('mousewheel', event => {
      if(!this.scrolling) {
        var delta = Math.abs(event.deltaY);
        if(delta > 50) {
          this.scrolling = true;
          this.index += event.deltaY/delta;

          setTimeout(() => { this.scrolling = false }, 400);
        }
      }
    });

    this.scrolling = false;
    this.selected = this.selected.node;
    this.element.selector = this;
  }

  get top() {
    return this._top;
  }

  set top(v) {
    this._top = v;
    this.elements.wrapper.css('transform', 'translateY( ' + v + 'px)');
  }

  get selected() {
    return this.elements.item.with('selected');
  }

  set selected(v) {
    this.selected.modifiers.set('selected', false);

    new Application.Bem.Modifiers(v)
      .block(this.constructor.block)
      .element('item')
      .set('selected');

    this.top = -this.index*this.selected.node.offsetHeight;
  }

  get value() {
    return this.selected.attr('data-value');
  }

  get index() {
    return this.selected.index;
  }

  set index(v) {
    var length = this.elements.item.length;
    v = v < 0 ? 0 : (v >= length ? length - 1 : v);
    var items = this.elements.item.nodes;
    this.selected = items[v];
  }

  static initialize() {
    super.initialize();

    Application.Bem.Selector.block('selector').nodes.forEach(selector => new this(selector));
  }
}
;
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
      if(typeof value === 'number') value = '' + value;
      if(arguments.length === 1) value = true;

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
    return new RegExp('\\b' + name + '--' + modifier + '(?:--([^\\s]+))?\\b', 'g');
  }

  static className(name, modifier, value) {
    return name + '--' + modifier + (value && ['string', 'number'].includes(typeof value) ? '--' + value : '');
  }
}
;
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

  get index() {
    var node = this.node;

    if(node) {
      return Array.prototype.indexOf.call(node.parentNode.children, node);
    }
    else return -1;
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
;
Application.Mixin.Include = class Include extends Application {
  constructor(mixin, options) {
    super();

    this.mixin = mixin;
    this.options = options;
  }

  get options() {
    return this._options;
  }

  set options(v) {
    this._options = typeof v === 'object' && v !== null ? v : {};
  }

  mix(object) {
    return this.mixin.mix(object, this.options);
  }

  with(options) {
    Object.assign(this.options, options);

    return this;
  }
}
;
Application.Mixin.Renderable = class Renderable extends Application.Mixin {
  get element() {
    if(!this._element) this.create();
    return this._element;
  }

  set element(v) {
    this._element = v;
  }

  get elements() {
    if(!this._elements) {
      this._elements = {};
      for(var element in this.constructor.elements) Application.Mixin.Renderable.defineElement(this, element);
    }

    return this._elements;
  }

  create() {

  }

  render() {

  }

  static defineElement(object, element) {
    var selector = object.constructor.elements[element];
    if(element[0] === '$' ) {
      if(selector[0] === '$') selector = selector.substring(1);
      Object.defineProperty(object.elements, element.substring(1), {
        get: () => object.element.querySelectorAll(selector)
      });
    }
    else {
      Object.defineProperty(object.elements, element, {
        get: () => object.element.querySelector(selector)
      });
    }
  }

  static mix(object, options) {
    options = super.mix(object, options);

    if(options.elements) {
      object.elements = {};
      if(Array.isArray(options.elements)) {
        options.elements.forEach(element => { object.elements[element] = element });
      }
      else {
        for(var element in options.elements) object.elements[element] = options.elements[element];
      }
    }

    return options;
  }
}
;
Application.Mixin.Renderable.Bemable = class Bemable extends Application.Mixin.Renderable {
  get block() {
    return new Application.Bem.Selector(this.element).block(this.constructor.block);
  }

  get element() {
    return super.element;
  }

  set element(v) {
    this._element = v;
    this.modifiers.node(this._element);
  }

  get elements() {
    if(!this._elements) {
      this._elements = {};
      for(var element in this.constructor.elements) Application.Mixin.Renderable.Bemable.defineElement(this, element);
    }

    return this._elements;
  }

  get modifiers() {
    if(!this._modifiers) {
      this._modifiers = new Application.Bem.Modifiers(this.element)
        .block(this.constructor.block)
        .define(this.constructor.modifiers);
    }

    return this._modifiers;
  }

  static defineElement(object, element) {
    var name = object.constructor.elements[element];

    if(element[0] === '$' ) element = element.substring(1);
    Object.defineProperty(object.elements, element, {
      get: () => object.block.element(name)
    });
  }

  static mix(object, options) {
    if(typeof options === 'object' && object !== null && Array.isArray(options.elements) && options.transformElementNames !== false) {
      var elements = {};
      options.elements.forEach(element => {
        var name = element.replace(/([A-Z])/g, '-$1').replace(/^-/, '').toLowerCase()
        var key = name.split('-').map(k => k[0].toUpperCase() + k.substring(1)).join('');
        key = key[0].toLowerCase() + key.substring(1);

        elements[key] = name;
      });

      options.elements = elements;
    }

    options = super.mix(object, options);

    object.block = options.block ? options.block : object.parameterized;
    object.modifiers = options.modifiers ? options.modifiers : {};

    return options;
  }
}
;
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
;
Application.Model.Character = class Character extends Application.Model {
  static get includes() {
    return [
      Application.Mixin.Renderable.Bemable.with({
        elements: [
          'head',
          'body',
          'arm', 'hand',
          'leg', 'foot',
          'name',
          'dead',
          'apnea'
        ]
      }),
      Application.Mixin.Renderable.Templatable.with({
        template: character => 'character-' + character.gender.id
      })
    ];
  }

  static get attributes() {
    return Object.assign({}, super.attributes, {
      first_name: '',
      last_name: '',

      gender: null,
      speciality: null,
      geographical_zone: null,
      zone_type: null,

      swimming: 0,       // Temps de nage avant épuisement  (temps en minutes)
      nomadism: 0,       // Propension au nomadisme         (note entre 0 et 9)
      mosquitos: false,  // Chasse au moustique             (oui / non)
      nostrils: false,   // Faire bouger ses narines        (oui / non)
      apnea: 0,          // Retenir sa respiration          (temps en secondes)
      survival: 0,       // Survie dans la nature           (note entre 0 et 9)
      flexibility: 0,    // Souplesse                       (note entre 0 et 9)
      surf: false,       // Faire du surf                   (oui / non)
      size: 1.6,         // Taille                          (distance en mètres)
      nose: true,        // Toucher son nez avec sa langue  (oui / non)
      moles: 0,          // Nombre de grain de beauté       (0: aucun, 1: peu, 2: normalement, 3: beaucoup)
      fight: false,      // Sport de combat                 (oui / non)
      agility: 0,        // Agilité / Vitesse               (note entre 0 et 9)
      glasses: false,    // Lunettes                        (oui / non)
      chilling: 0,       // Sensibilité au froid            (note entre 0 et 9)
      screaming: 0,      // Capacité vocale                 (note entre 0 et 9)
      hairiness: 0,      // Pilosité                        (note entre 0 et 9)
      dead: false
    });
  }

  static get renderers() {
    if(!this._renderers) {
      this._renderers = {
        flexibility: {
          render: character => {
            character.elements.leg.with('flexibility').modifiers.set({flexibility: character.flexibility});
          },

          clear: character => {
            character.elements.leg.with('flexibility').modifiers.set('flexibility');
          }
        },
        swimming: {
          render: character => {
            ['arm', 'hand', 'leg', 'foot'].forEach(part => {
              character.elements[part].with('swimming').modifiers.set({swimming: 'enabled'});
            });

            setTimeout(() => {
              ['arm', 'hand', 'leg', 'foot'].forEach(part => {
                character.elements[part].with('swimming').modifiers.set('swimming');
              });
              character.dead = true;
            }, Math.min(character.swimming*1000 + 2000 - 1, 10000));
          },

          clear: character => {
            ['arm', 'hand', 'leg', 'foot'].forEach(part => {
              character.elements[part].with('swimming').modifiers.set('swimming');
            });
          }
        },
        apnea: {
          render: character => {
            character.elements.apnea.modifiers.set('enabled');

            setTimeout(() => {
              character.elements.apnea.modifiers.set('enabled', false);
              character.dead = true;
            }, Math.min(character.apnea*100 + 2000 - 1, 10000));
          },

          clear: character => {
            character.elements.apnea.modifiers.set('enabled', false);
          }
        },
        chilling: {
          render: character => {
            ['head', 'arm', 'hand', 'leg', 'foot'].forEach(part => {
              character.elements[part].with('chilling').modifiers.set({chilling: 'enabled'});
            });
          },

          clear: character => {
            ['head', 'arm', 'hand', 'leg', 'foot'].forEach(part => {
              character.elements[part].with('chilling').modifiers.set('chilling');
            });
          }
        }
      };
    }

    return this._renderers;
  }

  get slug() {
    return this.full_name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z\-]/g, '-')
      .replace(/--+/, '-')
      .replace(/^-/, '')
      .replace(/-$/, '')
  }

  get full_name() {
    return this.first_name + ' ' + this.last_name;
  }

  get gender() {
    return Application.Model.Gender.find(this._gender);
  }

  set gender(v) {
    this._gender = v;
  }

  get speciality() {
    return Application.Model.Speciality.find(this._speciality);
  }

  set speciality(v) {
    this._speciality = v;
  }

  get geographical_zone() {
    return Application.Model.GeographicalZone.find(this._geographicalZone);
  }

  set geographical_zone(v) {
    this._geographicalZone = v;
  }

  get zone_type() {
    return Application.Model.ZoneType.find(this._zoneType);
  }

  set zone_type(v) {
    this._zoneType = v;
  }

  get dead() {
    return !!this._dead;
  }

  set dead(v) {
    v = !!v;
    if(this._dead === undefined && !v) {
      this._dead = v;
    }
    else {
      this._dead = v;
      if(this.dead) this.render();
      this.elements.dead.modifiers.set('enabled', this.dead);
    }
  }

  render(...attributes) {
    var parent = this.element.parentNode;

    if(parent) parent.removeChild(this.element);

    this.elements.name.text = this.first_name;

    for(var renderer in this.constructor.renderers) {
      if(attributes.includes(renderer)) this.constructor.renderers[renderer].render(this);
      else this.constructor.renderers[renderer].clear(this);
    }

    if(parent) parent.appendChild(this.element);
  }

  static get all() {
    if(!this._all) this._all = new Application.Model.Collection.Character();
    return this._all;
  }

  static render(...attributes) {
    this.rendering = attributes;
    this.all.render(...attributes);
  }

  static initialize() {
    super.initialize();
    this.create(Application.Data.characters);
    this.rendering = [];
  }
}
;
Application.Model.Collection = class Collection extends Array {
  get first() {
    return this.length === 0 ? null : this[0];
  }

  get last() {
    return this.length === 0 ? null : this[this.length - 1];
  }

  get count() {
    return this.length;
  }

  whereNot(attributes) {
    return this.filter(model => !model.equal(attributes));
  }

  where(attributes) {
    return this.filter(model => model.equal(attributes));
  }

  order(options) {
    var attribute, order;

    if(typeof options === 'string') attribute = options
    else {
      attribute = Object.keys(options)[0];
      order = ('' + Object.values(options)[0]).toLowerCase();
    }

    if(!attribute) attribute = 'id';

    var asc = order === 'desc' ? -1 : 1;
    var desc = -1*asc;

    return this.sort((m1, m2) => m1[attribute] > m2[attribute] ? asc : desc);
  }

  find(attributes) {
    if(typeof attributes !== 'object' || attributes === null) attributes = {id: attributes};
    return super.find(model => model.equal(attributes)) || null;
  }

  average(attribute) {
    return this.sum(attribute)/this.count;
  }

  sum(attribute) {
    return this.reduce((average, model) => average + model[attribute], 0);
  }
}
;
Application.Model.Gender = class Gender extends Application.Model {
  static get attributes() {
    return Object.assign({}, super.attributes, {
      name: ''
    });
  }

  static initialize() {
    super.initialize();
    this.create(Application.Data.genders);
  }
}
;
Application.Model.GeographicalZone = class GeographicalZone extends Application.Model {
  static get attributes() {
    return Object.assign({}, super.attributes, {
      name: ''
    });
  }

  static initialize() {
    super.initialize();
    this.create(Application.Data.geographical_zones);
  }
}
;
Application.Model.Speciality = class Speciality extends Application.Model {
  static get attributes() {
    return Object.assign({}, super.attributes, {
      name: ''
    });
  }

  static initialize() {
    super.initialize();
    this.create(Application.Data.specialities);
  }
}
;
Application.Model.ZoneType = class ZoneType extends Application.Model {
  static get attributes() {
    return Object.assign({}, super.attributes, {
      name: ''
    });
  }

  static initialize() {
    super.initialize();
    this.create(Application.Data.zone_types);
  }
}
;
Application.Model.Collection.Character = class Collection extends Application.Model.Collection {
  render(...attributes) {
    this.forEach(model => model.render(...attributes))
  }
}
;
