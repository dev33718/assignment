const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
require('dotenv').config();
const sendEmail = require('../utils/sendEmail');

exports.createAccount = async (req, res) => {
  const { first_name, last_name, email, phone, password, birthday } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const createdAt = new Date().toISOString();
  const lastModified = new Date().toISOString();
  
  try {
    const result = await pool.query(
      `INSERT INTO accounts (first_name, last_name, email, phone, password, birthday, created_at, last_modified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [first_name, last_name, email, phone, hashedPassword, birthday, createdAt, lastModified]
    );

    await sendEmail(email);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM accounts WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const account = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: account.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.getAccounts = async (req, res) => {
  const { limit, offset } = req.query;
  try {
    const result = await pool.query('SELECT * FROM accounts LIMIT $1 OFFSET $2', [limit, offset]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.updateAccount = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone, birthday } = req.body;
  const lastModified = new Date().toISOString();
  try {
    const result = await pool.query(
      `UPDATE accounts SET first_name = $1, last_name = $2, email = $3, phone = $4, birthday = $5, last_modified = $6 WHERE user_id = $7 RETURNING *`,
      [first_name, last_name, email, phone, birthday, lastModified, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.deleteAccount = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM accounts WHERE user_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};