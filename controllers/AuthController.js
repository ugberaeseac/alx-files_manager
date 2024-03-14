import { v4 as uuidv4 } from 'uuid';
import { ObjectID } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(request, response) {
    const { headers } = request;
    const { authorization } = headers;

    if (!authorization) {
      // console.log('Authorization not found');
      return response.status(401).send({ error: 'Unauthorized' });
    }

    const [authType, encodeCredentials] = authorization.split(' ');

    if (authType !== 'Basic') {
      console.log(`unsupported type ${authType}`);
    }

    const decodedCredential = Buffer.from(encodeCredentials, 'base64').toString('utf-8');
    const emailPassword = decodedCredential.split(':');
    const email = emailPassword[0];
    const password = emailPassword[1];

    const user = await dbClient.usersCollection.findOne({ email });
    if (!user) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    if (user && user.password !== password) {
      return response.status(401).send({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    const key = `auth_${token}`;
    const userId = user._id.toString();

    await redisClient.set(key, userId, 86400);
    const data = { token };
    return response.status(200).send(data);
  }

  static async getDisconnect(request, response) {
    const { headers } = request;
    const token = headers['x-token'];
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    const userObjectId = new ObjectID(userId);
    const user = await dbClient.usersCollection.findOne({ _id: userObjectId });

    if (!user) {
      return response.status(401).send({ error: 'Unauthorized' });
    }

    await redisClient.del(key);
    return response.status(204).send();
  }
}

module.exports = AuthController;
