export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging()
    .plugin('aurelia-configuration', config => {
      config.setEnvironments({
        development: ['localhost', '192.168.0.206'],
        production:  ['impulsedetroit.net'],
        test:        ['test.impulsedetroit.net']
      });
    });

  aurelia.start().then(() => aurelia.setRoot());
}
