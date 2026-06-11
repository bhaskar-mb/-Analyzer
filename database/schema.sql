-- Create the database if it does not exist
CREATE DATABASE IF NOT EXISTS github_analyzer;
USE github_analyzer;

-- Create table to store analyzed profile information and calculated insights
CREATE TABLE IF NOT EXISTS github_profiles (
  username VARCHAR(100) PRIMARY KEY,
  name VARCHAR(150),
  avatar_url VARCHAR(255),
  html_url VARCHAR(255),
  bio TEXT,
  location VARCHAR(150),
  blog VARCHAR(255),
  company VARCHAR(150),
  followers INT DEFAULT 0,
  following INT DEFAULT 0,
  public_repos INT DEFAULT 0,
  total_stars INT DEFAULT 0,
  total_forks INT DEFAULT 0,
  primary_language VARCHAR(50),
  repo_languages JSON,
  popular_repo_name VARCHAR(150),
  popular_repo_stars INT DEFAULT 0,
  open_issues_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
