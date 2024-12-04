import express, { Request, Response, Application } from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fileUpload from 'express-fileupload';
import { uploadS3 } from './routes/uploadS3';
import fs from 'fs';
import semver from 'semver';
import * as AWS from 'aws-sdk';



const app = express();
const PORT = 3000;

let server: any; // Define a variable to hold the server instance

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
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files setup
const projectRoot = path.resolve(__dirname, '..');
app.use(express.static(path.join(projectRoot, 'public')));

// Routes
app.get('/sign_in', (req: Request, res: Response) => {
  res.sendFile(path.join(projectRoot, 'views', 'sign_in.html'));
});

app.get('/register', (req: Request, res: Response) => {
  res.sendFile(path.join(projectRoot, 'views', 'register.html'));
});

app.get('/search', (req: Request, res: Response) => {
  res.sendFile(path.join(projectRoot, 'views', 'search.html'));
});

app.get('/user_preferences', (req: Request, res: Response) => {
  res.sendFile(path.join(projectRoot, 'views', 'user_preferences.html'));
});

app.post('/register', (req: Request, res: Response) => {
  const { username, password, email, first_name, last_name } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (username, password, email, first_name, last_name, permissions) VALUES (?, ?, ?, ?, ?, ?)',
    [username, hashedPassword, email, first_name, last_name, 'user'],
    function (err) {
      if (err) {
        return res.status(500).send('Error registering new user');
      }
      res.redirect('/sign_in');
    }
  );
});

app.post('/sign_in', (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [identifier, identifier],
    (err, user: { password: string } | undefined) => {
      if (err || !user) {
        return res.status(400).send('User not found');
      }

      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(400).send('Invalid credentials');
      }

      res.redirect('/search');
    }
  );
});

app.post('/update_user', (req: Request, res: Response) => {
  const { first_name, last_name, email } = req.body;
  const userId = 1;

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

app.post('/delete_account', (req: Request, res: Response) => {
  const userId = 1;

  db.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
    if (err) {
      return res.status(500).send('Error deleting account');
    }
    res.redirect('/sign_in');
  });
});

app.put('/upload/:packageName/:version', async (req: Request, res: Response): Promise<void> => {
  const { packageName, version } = req.params;
  const file = req.files?.package as fileUpload.UploadedFile;

  if (!file) {
    res.status(400).send('No file uploaded');
    return;
  }

  const key = `${packageName}/${version}/${file.name}`;

  try {
    const tempFilePath = path.join(__dirname, file.name);
    await file.mv(tempFilePath);

    const result = await uploadS3(tempFilePath, 'team16-npm-registry', key);

    fs.unlinkSync(tempFilePath);

    res.status(200).send(`File uploaded successfully: ${result.Location}`);
  } catch (err) {
    console.error('Error during upload:', err);
    res.status(500).send('Error uploading file');
  }
});

// Helper function to validate and parse version
function isValidVersion(version: string) {
  return semver.valid(version) || semver.validRange(version);
}

interface PackageQuery {
  Name: string;
  Version: string;
}


// /packages endpoint
app.post('/packages', (req: Request, res: Response):void => {
  const { offset = '0' } = req.query; // Pagination offset
  const packagesQuery: PackageQuery[] = req.body; // Assuming an array of PackageQuery

  // Validate the input query
  if (!packagesQuery || packagesQuery.length === 0 || !packagesQuery[0].Name) {
    res.status(400).send('Invalid or incomplete PackageQuery');
  }

  const offsetValue = parseInt(offset as string, 10);

  // Extract version info
  const versionQuery = packagesQuery[0].Version;
  if (!versionQuery || !isValidVersion(versionQuery)) {
    res.status(400).send('Invalid version format');
  }
  const s3 = new AWS.S3({ region: 'us-east-1' });  // Use your AWS region
  const bucketName = 'team16-npm-registry'; // S3 bucket name
  const nameQuery = packagesQuery[0].Name;

  // Define the S3 prefix (directory structure) based on the package name
  const prefix = `${nameQuery}/`;  // Filtering by package name

  // List objects in S3 under the specified prefix (package name)
  s3.listObjectsV2(
    {
      Bucket: bucketName,
      Prefix: prefix,
      MaxKeys: 10,
      StartAfter: offsetValue > 0 ? `${prefix}${offsetValue}` : undefined,
    },
    (err, data) => {
      if (err) {
        return res.status(500).send('Error querying packages from S3');
      }
  
      console.log('S3 data:', data); // Log the full data to inspect the keys
      if (!data || !data.Contents) {
        console.log('No packages found');
        return res.status(404).send('No packages found');
      }
  
      const filteredPackages = data.Contents.filter((object) => {
        const version = object.Key.split('/')[1]; // Adjust if the version isn't in the second part of the key
        return semver.satisfies(version, versionQuery);
      });
  
      if (filteredPackages.length === 0) {
        return res.status(404).send('No matching packages found');
      }
  
      const packages = filteredPackages.map((object) => ({
        Name: nameQuery,
        Version: object.Key.split('/')[1],
        ID: object.Key,
      }));
  
      res.setHeader('offset', `${offsetValue + packages.length}`);
      return res.status(200).json(packages);
    }
  );
  
});


// Start the server
const startServer = () => {
  server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

// Start the server
startServer();