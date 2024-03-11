import MongoClient from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;

class DBClient {
  constructor() {
    MongoClient.connect(url, { useUnifiedTopology: true }, (error, client) => {
      if (error) {
        console.log(error);
        this.db = false;
      }
      this.db = client.db(DB_DATABASE);
      this.usersCollection = this.db.collection('users');
      this.filesCollection = this.db.collection('files');
    });
  }

  isAlive() {
    return Boolean(this.db);
  }

  async nbUsers() {
    const numUsersDocument = this.usersCollection.countDocuments();
    return numUsersDocument;
  }

  async nbFiles() {
    const numFilesDocument = this.filesCollection.countDocuments();
    return numFilesDocument;
  }
}

const dbclient = new DBClient();
module.exports = dbclient;
