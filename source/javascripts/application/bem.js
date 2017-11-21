Application.Bem = class Bem extends Application {
  constructor() {
    super();
    this.parentname = null;
  }

  get basename() {
    if(!this._basename && this._block) {
      this._basename = this._block + (this._element ? '__' + this._element : '');
      this._selector = null;
    }
    return this._basename || this.parentName;
  }

  block(block) {
    if(block !== this._block) {
      this._block = block;
      this._basename = null
    }

    return this;
  }

  element(element) {
    if(element !== this.element) {
      this._element = element;
      this._basename = null
    }

    return this;
  }
}
