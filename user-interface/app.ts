import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { exec } from 'child_process';

const app = express();
const PORT = 3000;

// Database setup
const dbPath = path.join(__dirname, '../db/users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(`Error opening database at ${dbPath}: ${err.message}`);
  } else {
    console.log(`Connected to the database at ${dbPath}`);
  }
});

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files setup
const projectRoot = path.resolve(__dirname, '../user-interface');
app.use(express.static(path.join(projectRoot, 'public')));

// Routes
// Serve the sign-in page
app.get('/sign_in', (req: Request, res: Response) => {
  res.sendFile(path.join(projectRoot, 'views', 'sign_in.html'));
});

// Serve the register page
app.get('/register', (req: Request, res: Response) => {
  res.sendFile(path.join(projectRoot, 'views', 'register.html'));
});

// Serve the search page
app.get('/search', (req: Request, res: Response) => {
  res.sendFile(path.join(projectRoot, 'views', 'search.html'));
});

// Serve the user preferences page
app.get('/user_preferences', (req: Request, res: Response) => {
  res.sendFile(path.join(projectRoot, 'views', 'user_preferences.html'));
});

// Handle registration form submission
app.post('/register', (req: Request, res: Response) => {
  const { username, password, email, first_name, last_name } = req.body;

  // Hash the password before storing
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Insert the new user into the database
  db.run(
    'INSERT INTO users (username, password, email, first_name, last_name, permissions) VALUES (?, ?, ?, ?, ?, ?)',
    [username, hashedPassword, email, first_name, last_name, 'user'],
    function (err) {
      if (err) {
        return res.status(500).send('Error registering new user');
      }
      res.redirect('/sign_in'); // Redirect to the sign-in page after successful registration
    }
  );
});

// Handle sign-in form submission
app.post('/sign_in', (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  // Try to find the user by username or email
  db.get(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [identifier, identifier],
    (err, user: { password: string } | undefined) => {
      if (err || !user) {
        return res.status(400).send('User not found');
      }

      // Compare the submitted password with the stored hash
      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(400).send('Invalid credentials');
      }

      // Redirect to search page on successful login
      res.redirect('/search');
    }
  );
});

// Handle updating the user preferences
app.post('/update_user', (req: Request, res: Response) => {
  const { first_name, last_name, email } = req.body;
  const userId = 1; // Use session or token to identify user; assuming userId = 1 here

  db.run(
    'UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?',
    [first_name, last_name, email, userId],
    function (err) {
      if (err) {
        return res.status(500).send('Error updating user information');
      }
      res.redirect('/user_preferences');
    }
  );
});

// Handle account deletion
app.post('/delete_account', (req: Request, res: Response) => {
  const userId = 1; // Use session or token to identify user; assuming userId = 1 here

  db.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
    if (err) {
      return res.status(500).send('Error deleting account');
    }
    res.redirect('/sign_in');
  });
});

// Function to start the server
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

// Check if port 3000 is in use and attempt to kill any process using it
exec(`lsof -t -i:${PORT}`, (err, stdout, stderr) => {
  if (err || stderr) {
    // No process found using the port, start the server directly
    startServer();
  } else {
    // Port is in use, stdout contains the PID(s) of the process(es) using the port
    const pid = stdout.trim();
    console.log(`Port ${PORT} is currently in use by PID ${pid}. Attempting to kill...`);

    // Kill the process occupying the port
    exec(`kill -9 ${pid}`, (killErr, killStdout, killStderr) => {
      if (killErr || killStderr) {
        console.error(`Failed to kill process on port ${PORT}: ${killStderr || killErr?.message}`);
      } else {
        console.log(`Successfully killed process on port ${PORT}. Starting server...`);
        startServer();
      }
    });
    
  }
});
