Application.Mixin.Include = class Include extends Application {
  constructor(mixin, options) {
    super();

    this.mixin = mixin;
    this.options = options;
  }

  get options() {
    return this._options;
  }

  set options(v) {
    this._options = typeof v === 'object' && v !== null ? v : {};
  }

  mix(object) {
    return this.mixin.mix(object, this.options);
  }

  with(options) {
    Object.assign(this.options, options);

    return this;
  }
}
