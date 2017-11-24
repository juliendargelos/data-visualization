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
