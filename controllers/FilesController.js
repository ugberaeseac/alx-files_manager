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

    // Validate required fields
    const {
      name, type, parentId = 0, isPublic = false, data,
    } = body;
    if (!name) {
      return response.status(400).send({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return response.status(400).send({ error: 'Missing or invalid type' });
    }
    if (type !== 'folder' && !data) {
      return response.status(400).send({ error: 'Missing data' });
    }

    // Validate parentId
    if (parentId !== 0) {
      const parentFile = await dbClient.filesCollection.findOne({ _id: new ObjectID(parentId) });
      if (!parentFile) {
        return response.status(400).send({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return response.status(400).send({ error: 'Parent is not a folder' });
      }
    }

    // Create local storage folder path
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const localFolderPath = path.join(folderPath, 'files');
    if (!fs.existsSync(localFolderPath)) {
      fs.mkdirSync(localFolderPath, { recursive: true });
    }

    // Process file upload
    if (type !== 'folder') {
      const fileData = Buffer.from(data, 'base64');
      const filename = uuidv4();
      const localFilePath = path.join(localFolderPath, filename);
      fs.writeFileSync(localFilePath, fileData);

      // Save file data to DB
      const result = await dbClient.filesCollection.insertOne({
        userId: new ObjectID(userId),
        name,
        type,
        isPublic,
        parentId: new ObjectID(parentId),
        localPath: localFilePath,
      });
      const newFile = {
        id: result.insertedId,
        userId,
        name,
        type,
        isPublic,
        parentId,
        localPath: localFilePath,
      };
      return response.status(201).send(newFile);
    }

    // For folder type, save folder data to DB
    const result = await dbClient.filesCollection.insertOne({
      userId: new ObjectID(userId),
      name,
      type,
      isPublic,
      parentId: new ObjectID(parentId),
    });
    const newFolder = {
      id: result.insertedId,
      userId,
      name,
      type,
      isPublic,
      parentId,
    };
    return response.status(201).send(newFolder);
  }
}

module.exports = FilesController;
