module.exports = {
  apps: [
    {
      name: "verdant-website",
      script: "npx",
      args: "serve -s . -l 3000",
      cwd: "/",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      log_file: "./logs/verdant-combined.log",
      out_file: "./logs/verdant-out.log",
      error_file: "./logs/verdant-error.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      merge_logs: true,
    },
  ],
};
