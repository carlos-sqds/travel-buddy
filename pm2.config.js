module.exports = {
  apps: [
    {
      name: 'flight-tracker',
      script: 'npm',
      args: 'run dev',
      cwd: __dirname,
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 1000,
    },
  ],
};
