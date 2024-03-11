import { v4 as uuidv4 } from 'uuid';
import dbclient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(request, response) {
    const { headers } = response;
    const authorization = headers.get('Authorization');
    let data = null;
    if (authorization) {
      const [authType, encodeCredentials] = authorization.split('');
      if (authType === 'Basic') {
        const decodedCredential = Buffer.from(encodeCredentials, 'base64').toString('utf-8');
        const [email] = decodedCredential.split(':')[0];
        const user = await dbclient.usersCollection.find({ email });
        if (user) {
          const token = uuidv4();
          const key = `auth_${token}`;
          await redisClient.set(key, token, 86400);
          data = { token: user._id };
        }
        return response.status(401).json({ error: 'Unauthorized' });
      }
      console.log(`unsupported type ${authType}`);
    } else {
      console.log('Authorization not found');
    }
    return response.status(200).json(data);
  }

  static async getDisconnect(request, response) {
    const { headers } = response;
    const token = headers.get('X-Token');
    const key = `auth_'${token}`;
    const userId = await redisClient.get(key);
    const user = await dbclient.usersCollection.find({ _id: userId });
    // If not found, return an error Unauthorized with a status code 401
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    await redisClient.del(key);
    return response.status(201).json();
  }
}
module.exports = AuthController;
