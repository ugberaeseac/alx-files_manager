import sha1 from 'sha1';
import { ObjectID } from 'mongodb';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;
    if (!email) {
      return response.status(400).send({ error: 'Missing email' });
    }
    if (!password) {
      return response.status(400).send({ error: 'Missing password' });
    }
    const emailExist = await dbClient.usersCollection.findOne({ email });
    if (emailExist) {
      return response.status(400).send({ error: 'Already exist' });
    }

    const hashedPwd = sha1(password);
    const insertData = await dbClient.usersCollection.insertOne({ email, password: hashedPwd });

    const user = { id: insertData.insertedId, email };
    return response.status(201).send(user);
  }

  static async getMe(request, response) {
    const { headers } = request;
    const token = headers['x-token'];
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    const userObjectId = new ObjectID(userId);
    const user = await dbClient.usersCollection.findOne({ _id: userObjectId });
    // If not found, return an error Unauthorized with a status code 401
    if (!user) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    return response.status(200).send({ id: userId, email: user.email });
  }
}
module.exports = UsersController;
