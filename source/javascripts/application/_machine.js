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
