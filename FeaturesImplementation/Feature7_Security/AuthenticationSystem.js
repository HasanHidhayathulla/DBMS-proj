// Authentication System with JWT
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'hotel-management-system-secret-key-change-in-production';

// Function to hash a password
function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

// Function to verify password
function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

// Function to authenticate a user
function authenticateUser(username, plainPassword, storedHashedPassword) {
  try {
    if (!plainPassword || !storedHashedPassword) {
      return { success: false, message: 'Username or password missing' };
    }
    
    const isPasswordValid = verifyPassword(plainPassword, storedHashedPassword);
    if (isPasswordValid) {
      return { success: true, message: 'User authenticated successfully' };
    } else {
      return { success: false, message: 'Invalid password' };
    }
  } catch (error) {
    return { success: false, message: 'Authentication error: ' + error.message };
  }
}

// Function to generate JWT token
function generateToken(userId, username, role) {
  try {
    const token = jwt.sign(
      { userId, username, role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return { success: true, token };
  } catch (error) {
    return { success: false, message: 'Token generation error: ' + error.message };
  }
}

// Function to validate JWT token
function validateToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { success: true, data: decoded };
  } catch (error) {
    return { success: false, message: 'Invalid or expired token' };
  }
}

// Function to enforce password policies
function enforcePasswordPolicy(password) {
  // Password must be at least 8 characters, contain uppercase, digit, and special character
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  
  if (!password) {
    return { success: false, message: 'Password is required' };
  }
  
  if (!passwordRegex.test(password)) {
    return { 
      success: false, 
      message: 'Password must be at least 8 characters with uppercase letter, digit, and special character (!@#$%^&*)' 
    };
  }
  
  return { success: true, message: 'Password meets policy requirements' };
}

module.exports = { 
  authenticateUser, 
  enforcePasswordPolicy,
  generateToken,
  validateToken,
  hashPassword,
  verifyPassword
};