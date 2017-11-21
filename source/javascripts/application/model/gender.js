Application.Model.Gender = class Gender extends Application.Model {
  static get attributes() {
    return Object.assign({}, super.attributes, {
      name: ''
    });
  }

  static initialize() {
    super.initialize();
    this.create(Application.Data.genders);
  }
}
