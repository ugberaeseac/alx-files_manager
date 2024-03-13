import { ObjectID } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(request, response) {
    // Retrieve the user based on the token
    const { headers, body } = request;
    const key = `auth_${headers['x-token']}`;
    const userId = await redisClient.get(key);
    const user = await dbClient.usersCollection.findOne({ _id: new ObjectID(userId) });
    if (!userId || !user) {
      return response.status(401).send({ error: 'Unauthorized' });
    }

    // Check if request body exists and has the expected structure
    if (!body || typeof body !== 'object') {
      return response.status(400).send({ error: 'Invalid request body' });
    }

    // to create file
    const {
      name, type, parentId = 0, isPublic = false, data,
    } = body;
    if (!name) {
      return response.status(400).send({ error: 'Missing name' });
    }
    // Validate type
    if (!type && !['folder', 'file', 'image'].includes(type)) {
      return response.status(400).send({ error: 'Missing type' });
    }

    if (!data || type !== 'folder') {
      return response.status(400).send({ error: 'Missing data' });
    }
    if (parentId !== 0) {
      // check if no file is present in DB
      const file = await dbClient.filesCollection.findOne({ parentId });
      if (!file) {
        return response.status(400).send({ error: 'Parent not found' });
      }
      if (file && file.type !== 'folder') {
        return response.status(400).send({ error: 'Parent is not a folder' });
      }
    }
    if (type === 'folder') {
      const result = await dbClient.filesCollection.insertOne({
        userId, name, type, isPublic, parentId,
      });
      const id = result.insertedId.toString(); // file id
      const newFile = {
        id, userId, name, type, isPublic, parentId,
      };
      return response.status(201).send(newFile);
    }
    let folderPath = process.env.FOLDER_PATH;
    if (!folderPath || folderPath.length === 0) {
      folderPath = '/tmp/files_manager';
    }
    const filename = uuidv4();
    const localPath = path.join(folderPath, filename);
    // Check if the storing folder exists, if not, create it
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const decodeData = Buffer.from(data, 'base64').toString('utf-8');
    // write content to the file
    fs.writeFile(localPath, decodeData, (error) => {
      if (error) {
        console.log('Error creating file', error);
        return;
      }
      console.log(`${localPath} file created`);
    });
    // save the new file document in DB
    const result = await dbClient.filesCollection.insertOne({
      userId, name, type, isPublic, parentId, localPath,
    });
    const id = result.insertedId.toString(); // file id
    const newFile = {
      id, userId, name, type, isPublic, parentId,
    };
    return response.status(201).send(newFile);
  }
}

module.exports = FilesController;
