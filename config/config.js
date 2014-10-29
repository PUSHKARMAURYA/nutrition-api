module.exports = {
  app: {
    port: process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip: process.env.OPENSHIFT_NODEJS_IP || 'localhost'
  },
  db: {
    port: process.env.OPENSHIFT_MONGODB_DB_PORT || 27017,
    host: process.env.OPENSHIFT_MONGODB_DB_HOST || 'localhost',
    name: 'nutrition'
  }
};
