import { v4 as uuidv4 } from 'uuid';
import { ObjectID } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  // eslint-disable-next-line consistent-return
  static async getConnect(request, response) {
    const { headers } = request;
    const { authorization } = headers;
    let data = null;
    if (authorization) {
      const [authType, encodeCredentials] = authorization.split(' ');
      if (authType === 'Basic') {
        const decodedCredential = Buffer.from(encodeCredentials, 'base64').toString('utf-8');
        const emailPassword = decodedCredential.split(':');
        const email = emailPassword[0];
        const user = await dbClient.usersCollection.findOne({ email });
        if (user) {
          const token = uuidv4();
          const key = `auth_${token}`;
          // console.log(user._id);
          const userId = user._id.toString();

          await redisClient.set(key, userId, 86400);
          // console.log(await redisClient.get(key));
          data = { token };
          return response.status(200).send(data);
        }
        return response.status(401).json({ error: 'Unauthorized' });
      }
      console.log(`unsupported type ${authType}`);
    } else {
      console.log('Authorization not found');
    }
  }

  static async getDisconnect(request, response) {
    const { headers } = request;
    const token = headers['x-token'];
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    const userObjectId = new ObjectID(userId);
    console.log(userObjectId);
    const user = await dbClient.usersCollection.findOne({ _id: userObjectId });
    console.log(user);
    // If not found, return an error Unauthorized with a status code 401
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    await redisClient.del(key);
    return response.status(201).json();
  }
}
module.exports = AuthController;
