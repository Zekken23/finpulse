// Vercel Serverless Function for Auth (Register, Login, Profile, Password) using Vercel Blob
import { getDatabase, saveDatabase } from './blobDb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action || (req.url.includes('register') ? 'register' : req.url.includes('login') ? 'login' : req.url.includes('profile') ? 'profile' : 'change-password');

  try {
    const dbData = await getDatabase();
    const users = dbData.users || [];

    // 1. REGISTER
    if (action === 'register' && req.method === 'POST') {
      const { name, email, password } = req.body || {};
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ error: 'Email sudah terdaftar. Silakan login.' });
      }

      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        passwordHash: password,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      dbData.users = users;
      await saveDatabase(dbData);

      const sessionUser = { id: newUser.id, name: newUser.name, email: newUser.email, createdAt: newUser.createdAt };
      return res.status(201).json({ message: 'User registered successfully', user: sessionUser });
    }

    // 2. LOGIN
    if (action === 'login' && req.method === 'POST') {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        return res.status(400).json({ error: 'Email belum terdaftar. Silakan registrasi terlebih dahulu.' });
      }

      if (foundUser.passwordHash !== password) {
        return res.status(400).json({ error: 'Password yang Anda masukkan salah.' });
      }

      const sessionUser = { id: foundUser.id, name: foundUser.name, email: foundUser.email, createdAt: foundUser.createdAt };
      return res.json({ message: 'Login successful', user: sessionUser });
    }

    // 3. UPDATE PROFILE
    if (action === 'profile' && req.method === 'PUT') {
      const { userId, name } = req.body || {};
      if (!userId || !name) {
        return res.status(400).json({ error: 'User ID and name required' });
      }

      const index = users.findIndex(u => u.id === userId);
      if (index >= 0) {
        users[index].name = name.trim();
        dbData.users = users;
        await saveDatabase(dbData);
      }

      return res.json({ message: 'Profile updated successfully', name });
    }

    // 4. CHANGE PASSWORD
    if (action === 'change-password' && req.method === 'PUT') {
      const { userId, oldPassword, newPassword } = req.body || {};
      if (!userId || !oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Missing required password fields' });
      }

      const index = users.findIndex(u => u.id === userId);
      if (index < 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (users[index].passwordHash !== oldPassword) {
        return res.status(400).json({ error: 'Kata sandi saat ini salah.' });
      }

      users[index].passwordHash = newPassword;
      dbData.users = users;
      await saveDatabase(dbData);

      return res.json({ message: 'Password updated successfully' });
    }

    return res.status(404).json({ error: 'Action not found' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
