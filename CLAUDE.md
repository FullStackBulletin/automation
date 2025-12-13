# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a newsletter automation system for [FullStack Bulletin](https://fullstackbulletin.com/). It uses AWS SAM to deploy a Step Functions state machine that orchestrates Lambda functions to generate weekly newsletter issues.

## Build and Deploy Commands

```bash
# Validate, build, and deploy to AWS
sam validate --lint && sam build --beta-features && sam deploy

# Run all tests (linting + unit tests for Node.js)
npm test

# Run only unit tests
npm run test:unit

# Run only linting
npm run test:lint

# Run Rust tests
cargo test --all-features

# Run Rust clippy
cargo clippy --all-features

# Format Rust code
cargo fmt
```

## Architecture

### AWS Step Functions Workflow (`statemachine/create_issue.asl.yaml`)

The state machine runs every Friday at 5PM UTC and executes:
1. **Fetch Issue Number** - Scrapes Buttondown archive to get next issue number
2. **Parallel data fetching:**
   - Fetch Quote - Gets a random programming quote
   - Fetch Book - Gets a recommended book
   - Fetch Sponsor - Retrieves sponsor from Airtable
   - Fetch Links - Processes Mastodon posts for newsletter links
3. **Create Issue** - Generates and sends draft via Buttondown API

### Rust Lambda Functions (`functions/`)

All Rust functions use `cargo-lambda` for building and target ARM64 (`provided.al2023` runtime):

- **fetch-issue-number** - HTML scraper using `scraper` crate
- **fetch-quote** - Random quote generator
- **fetch-book** - Book recommendation fetcher
- **fetch-sponsor** - Airtable API client for sponsor data
- **create-issue** - Buttondown API integration with Tera templates

### Node.js Lambda Function

- **fetch-links** - Complex link processing pipeline that:
  - Fetches Mastodon statuses
  - Extracts, normalizes, and scores URLs
  - Retrieves metadata and canonical URLs
  - Uploads images to Cloudinary
  - Applies blacklist filtering

### Shared Library (`shared/`)

Contains common types used across Rust functions:
- `Event` - Input event structure with `NextIssue`
- `Issue` - Contains the issue number

## Key Patterns

- Rust functions read config from environment variables at startup
- Functions use `reqwest` with `rustls-tls` for HTTP (Lambda compatible)
- Step Functions handles retries with exponential backoff
- Node.js function uses ES modules (`"type": "module"`)
