Application.Model.GeographicalZone = class GeographicalZone extends Application.Model {
  static get attributes() {
    return Object.assign({}, super.attributes, {
      name: ''
    });
  }

  static initialize() {
    super.initialize();

    this.create(
      {id: 'south', name: 'Sud'  },
      {id: 'east',  name: 'Est'  },
      {id: 'north', name: 'Nord' },
      {id: 'west',  name: 'Ouest'},
      {id: 'other', name: 'Autre'},
    );
  }
}
