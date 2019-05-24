module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : 'seo-test',
      script    : 'bin/www',
      instances: 0,
      env_prd: {
        NODE_ENV: 'prd',
        PORT: 3002
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   *
   * Step1 (initiate, one time step): pm2 deploy ecosystem.config.js  production setup
   * Step2:  pm2 deploy ecosystem.config.js  production
   */
  deploy : {
    production : {
      user : 'joe',
      host : '182.254.242.31',
      ref  : 'origin/master',
      repo : 'git@github.com:choelea/seo-test.git',
      path : '/home/joe/nodejsapp/seo-test',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    },
    prd : { // quick deploy with out npm install
      user : 'joe',
      host : '182.254.242.31',
      ref  : 'origin/master',
      repo : 'git@github.com:choelea/seo-test.git',
      path : '/home/joe/nodejsapp/seo-test',
      'post-deploy' : 'pm2 reload ecosystem.config.js --env prd'
    }
  }
};
