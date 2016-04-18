export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
		.plugin('aurelia-tabs')
    .developmentLogging()
    .plugin('aurelia-configuration', config => {
      config.setEnvironments({
        development: ['localhost', '192.168.0.206'],
        test:        ['test.impulsedetroit.net'],
        production:  ['techtues.net', 'impulsedetroit.net']
      });
    });

  aurelia.start().then(() => aurelia.setRoot());
}
