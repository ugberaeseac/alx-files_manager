import dbClient from './db';
import redisClient from './redis';

const userUtils = {
  async getIdAndKey(request) {
    const token = request.header('X-Token');
    key = `auth_${token}`;
  
  }

}
