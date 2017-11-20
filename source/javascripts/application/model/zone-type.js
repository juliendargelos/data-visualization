Application.Model.ZoneType = class ZoneType extends Application.Model {
  static get attributes() {
    return Object.assign({}, super.attributes, {
      name: ''
    });
  }

  static initialize() {
    super.initialize();

    this.create(
      {id: 'urban', name: 'urbain'},
      {id: 'rural', name: 'Rural' }
    );
  }
}
