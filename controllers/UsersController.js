import dbclient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async getMe(request, response) {
    const { headers } = response;
    const token = headers.get('X-Token');
    const key = `auth_'${token}`;
    const userId = await redisClient.get(key);
    const user = await dbclient.usersCollection.find({ _id: userId });
    // If not found, return an error Unauthorized with a status code 401
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    return response.status(200).json({ id: user._id, email: user.email});
  }
}
module.exports = UsersController;
