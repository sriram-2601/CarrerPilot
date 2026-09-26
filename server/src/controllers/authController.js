import bcrypt from 'bcryptjs';
import { repository } from '../services/repository.js';
import { httpError } from '../utils/httpError.js';
import { signToken } from '../utils/jwt.js';

export const authController = {
  async register(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw httpError(400, 'Name, email, and password are required.');
    }

    if (password.length < 6) {
      throw httpError(400, 'Password must be at least 6 characters long.');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await repository.getOne('User', { email: normalizedEmail });
    if (existing) {
      throw httpError(409, 'An account with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await repository.create('User', {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    const profile = await repository.create('Profile', {
      userId: user._id,
      skills: [],
      projects: [],
      experience: [],
      education: [],
      preferences: {
        roles: [],
        location: '',
        workMode: 'any',
        stipendRange: ''
      },
      resumeText: '',
      embedding: []
    });

    const token = signToken({ id: user._id, email: user.email, name: user.name });

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      profile,
      token
    });
  },

  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      throw httpError(400, 'Email and password are required.');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await repository.getOne('User', { email: normalizedEmail });
    if (!user) {
      throw httpError(401, 'Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw httpError(401, 'Invalid email or password.');
    }

    const token = signToken({ id: user._id, email: user.email, name: user.name });

    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token
    });
  },

  async getMe(req, res) {
    const user = await repository.getById('User', req.user.id);
    if (!user) {
      throw httpError(404, 'User account not found.');
    }

    const profile = await repository.getOne('Profile', { userId: req.user.id });

    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      profile
    });
  }
};
