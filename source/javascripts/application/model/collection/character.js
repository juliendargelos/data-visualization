Application.Model.Collection.Character = class Collection extends Application.Model.Collection {
  render(...attributes) {
    this.forEach(model => model.render(...attributes))
  }
}
