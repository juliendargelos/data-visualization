Application.Model.Character = class Character extends Application.Model {
  static get includes() {
    return [
      Application.Mixin.Renderable.Bemable.with({elements: ['arm', 'full-leg', 'head']}),
      Application.Mixin.Renderable.Templatable
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
      mosquitos: false,  // Chasse au mosutique             (oui / non)
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
      hairiness: 0       // Pilosité                        (note entre 0 et 9)
    });
  }

  static get renderers() {
    if(!this._renderers) {
      this._renderers = {
        flexibility: character => {
          character.elements.fullLeg.modifiers.set({rendered: character.flexibility});
        }
      };
    }

    return this._renderers;
  }

  get gender() {
    return this._gender;
  }

  set gender(v) {
    this._gender = Application.Model.Gender.find(v);
  }

  get speciality() {
    return this._speciality;
  }

  set speciality(v) {
    this._speciality = Application.Model.Speciality.find(v);
  }

  get geographical_zone() {
    return this._geographicalZone;
  }

  set geographical_zone(v) {
    this._geographicalZone = Application.Model.GeographicalZone.find(v);
  }

  get zone_type() {
    return this._zoneType;
  }

  set zone_type(v) {
    this._zoneType = Application.Model.ZoneType.find(v);
  }

  render() {
    this.constructor.renderers.flexibility(this);
  }

  static initialize() {
    super.initialize();
    this.create(Application.Data.characters);
  }
}
