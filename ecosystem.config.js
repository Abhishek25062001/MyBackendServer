module.exports = {
    apps : [{
      name   : "backendfile",
      script : "app.js", // complete path  of index.js or server.js
      env_production: {
         NODE_ENV: "production"
      },
      env_development: {
         NODE_ENV: "development"
      }
    }]
  }