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
    window.t = this;
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
