import sha1 from 'sha1';
import dbclient from '../utils/db';

class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;
    if (!email) {
      return response.status(400).send({ error: 'Missing email' });
    }
    if (!password) {
      return response.status(400).send({ error: 'Missing password' });
    }
    const emailExist = await dbclient.usersCollection.find({ email });
    if (emailExist) {
      return response.status(400).send({ error: 'Already exist' });
    }

    const hashedPwd = sha1(password);
    const insertData = await dbclient.usersCollection.insert({ email, password: hashedPwd });

    const user = { id: insertData.insertedId, email };
    return response.status(201).send(user);
  }
}
module.exports = UsersController;