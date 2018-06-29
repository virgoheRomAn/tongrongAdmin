module.exports = {
  apps : [
    {
      name      : 'node-boss-web',
      script    : 'app.js',
      env_native : {
        NODE_ENV: 'native'
      },
	  env_dev : {
        NODE_ENV: 'dev'
      },
	  env_test : {
        NODE_ENV: 'test'
      },
	  env_prod : {
        NODE_ENV: 'prod'
      }
    }
  ]
};
