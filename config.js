
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/studentsdb'
exports.TOKEN = process.env.API_TOKEN || 'password12345'
exports.PORT = process.env.PORT || '8080';


//heroku ps:scale web=1