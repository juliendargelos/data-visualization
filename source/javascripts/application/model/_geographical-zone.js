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
