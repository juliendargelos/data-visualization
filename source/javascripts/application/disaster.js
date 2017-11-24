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
