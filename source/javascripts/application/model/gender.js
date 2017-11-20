Application.Model.Gender = class Gender extends Application.Model {
  static get attributes() {
    return Object.assign({}, super.attributes, {
      name: ''
    });
  }

  static initialize() {
    super.initialize();

    this.create(
      {id: 'male',   name: 'Homme'},
      {id: 'female', name: 'Femme'}
    );
  }
}
