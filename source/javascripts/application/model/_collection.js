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

  order(options) {
    var attribute, order;

    if(typeof options === 'string') attribute = options
    else {
      attribute = Object.keys(options)[0];
      order = ('' + Object.values(options)[0]).toLowerCase();
    }

    if(!attribute) attribute = 'id';

    var asc = order === 'desc' ? -1 : 1;
    var desc = -1*asc;

    return this.sort((m1, m2) => m1[attribute] > m2[attribute] ? asc : desc);
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
