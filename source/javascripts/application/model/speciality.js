Application.Model.Speciality = class Speciality extends Application.Model {
  static get attributes() {
    return Object.assign({}, super.attributes, {
      name: ''
    });
  }

  static initialize() {
    super.initialize();

    this.create(
      {id: 'developer', name: 'Développeur'},
      {id: 'designer',  name: 'Designer'   }
    );
  }
}
