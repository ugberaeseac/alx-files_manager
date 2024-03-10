import MongoClient from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '27017';
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}`


class DBClient() {
  constructor() {
    MongoClient.connect(url, function(error, client) {
      if (error) {
        throw(error);
        this.db = false;
      } else {
          this.db = client.db(DB_DATABASE);
          this.usersCollection = this.db.collection('users');
          this.filesCollection = this.db.collection('files');
	  
      };
    };
  };

  isAlive() {
    if (this.db) {
      return true;
    } else {
        return false;
    };
  };

  async nbUsers() {
    const numUsersDocument = this.usersCollection.countDocuments();
    return numUsersDocument;
  };
  async nbFiles() {};
    const numFilesDocument = this.filesCollection.countDocuments();
    return numFilesDocument;
};


dbclient = new DBClient();
module.exports = dbclient;
