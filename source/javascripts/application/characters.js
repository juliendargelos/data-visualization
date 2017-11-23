Application.Characters = class Characters extends Application {
  static get includes() {
    return [
      Application.Mixin.Renderable.Bemable
    ];
  }

  constructor(element) {
    super();

    if(element) this.element = element;

    window.addEventListener('mousewheel', event => {
      this.element.scrollTop += event.deltaY;
      console.log(this.element.scrollTop);
    });
  }

  static initialize() {
    super.initialize();

    window.addEventListener('load', () => {
      this.current = new this(Application.Bem.Selector.block(this.block).node);
    });
  }
}
