# GitHub Profile Analyzer API

A Node.js and Express.js REST API service that integrates with the public GitHub REST API to perform analysis on user profiles and store details alongside computed insights inside a MySQL (MariaDB) database.

## 🚀 Features & Computed Insights

- **Profile Metadata**: Username, Name, Avatar URL, Bio, Location, Blog, Company, Followers Count, and Following Count.
- **Deep Repository Analysis**:
  - `total_stars`: The sum of stars accumulated across all public repositories.
  - `total_forks`: The sum of forks accumulated across all public repositories.
  - `open_issues_count`: The total count of active open issues.
  - `primary_language`: The user's most frequently used programming language.
  - `repo_languages`: Detailed programming language breakdown (count and percentage share) across all repositories.
  - `popular_repo_name` & `popular_repo_stars`: Identifies the user's most starred repository and its star count.
- **API Endpoints**:
  - POST to analyze and save profiles.
  - GET to list all saved profiles.
  - GET details of a specific profile.
  - PUT to force-refresh cached profile insights.
  - DELETE to clean up/remove profile analyses.

---

## 🛠️ Tech Stack

- **Runtime Environment**: Node.js (configured with ES Modules)
- **Framework**: Express.js
- **Database**: MySQL / MariaDB (utilizing `mysql2/promise` connection pooling)
- **HTTP Client**: Axios (for calling the GitHub API)
- **Development Tooling**: Nodemon (auto-reload)

---

## 📋 Prerequisites

Before running the application, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher is recommended)
- [XAMPP](https://www.apachefriends.org/) (with MySQL/MariaDB service enabled)

---

## ⚙️ Installation & Configuration

### 1. Clone or Open the Directory
Navigate to the project directory:
```bash
cd c:\Users\marel\OneDrive\Desktop\GitHub
```

### 2. Install Project Dependencies
Run the following command to download and install required dependencies:
```bash
npm install
```

### 3. Initialize the Database Schema
Start your XAMPP MySQL database service and run the schema script to create the `github_analyzer` database and `github_profiles` table.

You can execute it using the CLI:
```bash
# Using standard Command Prompt
"C:\xampp\mysql\bin\mysql.exe" -u root < database/schema.sql
```
Or simply copy and execute the SQL queries from `database/schema.sql` inside your phpMyAdmin dashboard SQL editor (`http://localhost/phpmyadmin/`).

### 4. Configure Environment Variables
Copy the `.env.example` file to create your own `.env` configuration:
```bash
copy .env.example .env
```
Open the `.env` file and configure your settings:
```ini
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=github_analyzer

# Optional: Add a GitHub Personal Access Token (PAT) to increase API limits (60 requests/hr -> 5000 requests/hr)
# Generate one at: https://github.com/settings/tokens
GITHUB_TOKEN=your_github_token_here
```

---

## 🏃 Running the Application

To start the server in **development mode** (with hot-reloading using nodemon):
```bash
npm run dev
```

To start the server in **production mode**:
```bash
npm start
```

On successful startup, the console will print:
```text
Successfully connected to the MySQL database.
===================================================
  Server is running on port: 5000
  Health Check URL: http://localhost:5000/
  Profiles API Base: http://localhost:5000/api/profiles
===================================================
```

---

## 📑 API Endpoints Documentation

### 1. Base Health Check
Verifies if the API is online.

- **URL**: `/`
- **Method**: `GET`
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "GitHub Profile Analyzer API is online.",
    "documentation": "See README.md for list of endpoints."
  }
  ```

---

### 2. Analyze and Store Profile
Fetches data from GitHub, performs calculations, and inserts/updates records in MySQL.

- **URL**: `/api/profiles/:username`
- **Method**: `POST`
- **URL Params**: `username` (string) - The target GitHub username.
- **Success Response**: `201 Created`
  ```json
  {
    "success": true,
    "message": "GitHub profile analyzed and saved successfully.",
    "data": {
      "username": "torvalds",
      "name": "Linus Torvalds",
      "avatar_url": "https://avatars.githubusercontent.com/u/1024?v=4",
      "html_url": "https://github.com/torvalds",
      "bio": "Creator of Linux and Git",
      "location": "Portland, OR",
      "blog": "",
      "company": "Linux Foundation",
      "followers": 234102,
      "following": 0,
      "public_repos": 7,
      "total_stars": 230112,
      "total_forks": 45012,
      "primary_language": "C",
      "repo_languages": {
        "C": { "count": 5, "percentage": 71.4 },
        "Shell": { "count": 2, "percentage": 28.6 }
      },
      "popular_repo_name": "linux",
      "popular_repo_stars": 178223,
      "open_issues_count": 12,
      "created_at": "2026-06-11T14:32:00.000Z",
      "updated_at": "2026-06-11T14:32:00.000Z"
    }
  }
  ```
- **Error Response**: `404 Not Found` (If user does not exist on GitHub)
  ```json
  {
    "success": false,
    "message": "GitHub user \"invalid_user_name_here\" not found."
  }
  ```

---

### 3. Get All Stored Profiles List
Retrieves basic metadata and summary statistics for all profiles saved in the database.

- **URL**: `/api/profiles`
- **Method**: `GET`
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "username": "torvalds",
        "name": "Linus Torvalds",
        "avatar_url": "https://avatars.githubusercontent.com/u/1024?v=4",
        "html_url": "https://github.com/torvalds",
        "bio": "Creator of Linux and Git",
        "location": "Portland, OR",
        "followers": 234102,
        "public_repos": 7,
        "total_stars": 230112,
        "primary_language": "C",
        "updated_at": "2026-06-11T14:32:00.000Z"
      }
    ]
  }
  ```

---

### 4. Get Single Profile
Fetches complete insights of a single user profile from the MySQL database.

- **URL**: `/api/profiles/:username`
- **Method**: `GET`
- **URL Params**: `username` (string)
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "username": "torvalds",
      "name": "Linus Torvalds",
      "avatar_url": "https://avatars.githubusercontent.com/u/1024?v=4",
      "html_url": "https://github.com/torvalds",
      "bio": "Creator of Linux and Git",
      "location": "Portland, OR",
      "blog": "",
      "company": "Linux Foundation",
      "followers": 234102,
      "following": 0,
      "public_repos": 7,
      "total_stars": 230112,
      "total_forks": 45012,
      "primary_language": "C",
      "repo_languages": {
        "C": { "count": 5, "percentage": 71.4 },
        "Shell": { "count": 2, "percentage": 28.6 }
      },
      "popular_repo_name": "linux",
      "popular_repo_stars": 178223,
      "open_issues_count": 12,
      "created_at": "2026-06-11T14:32:00.000Z",
      "updated_at": "2026-06-11T14:32:00.000Z"
    }
  }
  ```
- **Error Response**: `404 Not Found` (If username is not analyzed in database yet)
  ```json
  {
    "success": false,
    "message": "Profile for user \"torvalds\" was not found in the database. Use POST /api/profiles/torvalds to analyze and save it first."
  }
  ```

---

### 5. Force Refresh Profile
Re-fetch statistics from the GitHub API and update the record.

- **URL**: `/api/profiles/:username/refresh`
- **Method**: `PUT`
- **URL Params**: `username` (string)
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "GitHub profile data refreshed successfully.",
    "data": { ... }
  }
  ```

---

### 6. Delete Profile Analysis
Deletes the stored profile insights record from the database.

- **URL**: `/api/profiles/:username`
- **Method**: `DELETE`
- **URL Params**: `username` (string)
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Profile for user \"torvalds\" deleted successfully from database."
  }
  ```

---

## 📬 Postman Testing

A Postman collection is included in the project root: `postman_collection.json`. 
You can import this collection into Postman to instantly test all routes. The collection utilizes variables `{{url}}` (defaults to `http://localhost:5000`) and `{{username}}` (defaults to `torvalds`) for fast, automated parameterization.
