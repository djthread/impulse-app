export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
		.plugin("aurelia-tabs")
    .developmentLogging()
    .plugin('aurelia-configuration', config => {
      config.setEnvironments({
        development: ['localhost'],
        production:  ['techtues.net']
      });
    });

  aurelia.start().then(() => aurelia.setRoot());
}
