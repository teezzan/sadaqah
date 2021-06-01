module.exports = {
  apps: [{
    name: "sadaqah",
    script: 'src/index.js',
    instances: 3,
    exec_mode: "cluster",
    node_args: '-r dotenv/config',
    watch: '.',
    env: {
      NODE_ENV: "development",
    },
  }],

  // deploy: {
  //   production: {
  //     user: 'SSH_USERNAME',
  //     host: 'SSH_HOSTMACHINE',
  //     ref: 'origin/master',
  //     repo: 'GIT_REPOSITORY',
  //     path: 'DESTINATION_PATH',
  //     'pre-deploy-local': '',
  //     'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
  //     'pre-setup': ''
  //   }
  // }
};
