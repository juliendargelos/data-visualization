Application.Model.Collection = class Collection extends Array {
  get first() {
    return this.length === 0 ? null : this[0];
  }

  get last() {
    return this.length === 0 ? null : this[this.length - 1];
  }

  get count() {
    return this.length;
  }

  whereNot(attributes) {
    return this.filter(model => !model.equal(attributes));
  }

  where(attributes) {
    return this.filter(model => model.equal(attributes));
  }

  find(attributes) {
    if(typeof attributes !== 'object' || attributes === null) attributes = {id: attributes};
    return super.find(model => model.equal(attributes)) || null;
  }

  average(attribute) {
    return this.sum(attribute)/this.count;
  }

  sum(attribute) {
    return this.reduce((average, model) => average + model[attribute], 0);
  }
}
