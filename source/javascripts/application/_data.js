Application.Data = class Data extends Application {
  static fetch() {
    var scripts = document.querySelectorAll('script[type="text/json"]');
    var script;

    for(var i = 0; i < scripts.length; i++) {
      script = scripts[i];
      this[script.getAttribute('name')] = JSON.parse(script.textContent);
    }
  }

  static initialize() {
    super.initialize();
    this.fetch();
  }
}
