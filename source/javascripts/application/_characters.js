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
