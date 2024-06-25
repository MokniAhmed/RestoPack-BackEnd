import { connection, Model } from 'mongoose';
import connect from 'config/mongoose';
import bcrypt from 'bcryptjs';
import { env } from 'config/vars';

// user
import users from './users.json';
import User from 'models/user.model';

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(null), ms);
  });

const dropped: string[] = [];

async function generateDocs(
  documents: any[],
  model: Model<any>,
  counter?: number,
) {
  try {
    if (!dropped.find((name) => name === model.collection.name)) {
      await model.collection.drop();
      dropped.push(model.collection.name);
    }
    await model.insertMany(documents);
  } catch (e) {
    if (e.message === 'ns not found') {
      dropped.push(model.collection.name);
    }
  
  }
}

async function generate() {
  await connect();

  /*** fixtures ***/
  if (env === 'development') {
    await generateDocs(
      users.map((user) => ({
        ...user,
        password: bcrypt.hashSync(user.password),
      })),
      User
    );
  }
  /*** fixtures ***/

  await connection.close();
  process.exit(0);
}

generate();
