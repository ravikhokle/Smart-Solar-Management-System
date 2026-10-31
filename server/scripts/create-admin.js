import readline from 'readline';
import { connectDb } from '../config/db.js';
import { User } from '../models/User.js';
import mongoose from 'mongoose';

function ask(rl, question, { silent } = {}) {
  return new Promise((resolve) => {
    if (!silent) {
      rl.question(question, resolve);
      return;
    }
    const stdin = process.stdin;
    process.stdout.write(question);
    stdin.resume();
    stdin.setRawMode?.(true);
    let value = '';
    const onData = (char) => {
      const c = char.toString('utf8');
      if (c === '\n' || c === '\r' || c === '\u0004') {
        stdin.setRawMode?.(false);
        stdin.removeListener('data', onData);
        process.stdout.write('\n');
        resolve(value);
        return;
      }
      if (c === '\u0003') process.exit(1);
      if (c === '\u0008' || c === '\u007f') {
        value = value.slice(0, -1);
        return;
      }
      value += c;
    };
    stdin.on('data', onData);
  });
}

async function main() {
  await connectDb();
  const existing = await User.countDocuments({ role: 'admin' });
  if (existing > 0) {
    console.error('An administrator already exists. Repeated bootstrap is not allowed.');
    await mongoose.disconnect();
    process.exit(1);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const name = (await ask(rl, 'Administrator name: ')).trim();
  const email = (await ask(rl, 'Administrator email: ')).trim().toLowerCase();
  const password = await ask(rl, 'Administrator password (min 8 characters): ', { silent: true });
  rl.close();

  if (!name || !email || !password || password.length < 8) {
    console.error('Name, email and a password of at least 8 characters are required.');
    await mongoose.disconnect();
    process.exit(1);
  }

  await User.create({
    name,
    email,
    password,
    role: 'admin',
    isActive: true,
    emailVerified: true,
  });
  console.log(`Administrator created for ${email}. You can now sign in.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(`Unable to create administrator: ${err.message}`);
  await mongoose.disconnect();
  process.exit(1);
});
