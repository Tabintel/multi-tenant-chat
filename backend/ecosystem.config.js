module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'main.go',
      exec_interpreter: 'go',
      env: {
        STREAM_API_KEY: '',
        STREAM_API_SECRET: '',
        DATABASE_URL: '',
        JWT_SECRET: '',
        PORT: 8080
      }
    }
  ]
}
