# EduHalal - Bangladesh Student Homework Helper

A Next.js application that provides AI-powered homework assistance for students in Bangladesh across different educational levels.

## Features

- Separate chat interfaces for different education levels:
  - Below SSC
  - SSC (Secondary School Certificate)
  - HSC (Higher Secondary Certificate)
  - Admission Tests
  - University
- Powered by Google's Gemini 2.0 AI
- Image upload capability for homework problems
- Beautiful, responsive UI

## Getting Started

### Prerequisites

- Node.js 16.14 or later

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
GOOGLE_API_KEY=AIzaSyDFX8oR3jKgLdKnja6JEPPYTBPwhxw_7r0
```

## Project Structure

- `/app` - Next.js application using App Router
  - `/components` - Reusable UI components
  - `/utils` - Utility functions and services
  - `/api` - API routes
  - `/chat` - Chat interfaces for different education levels

## Technologies Used

- Next.js with App Router
- TypeScript
- Tailwind CSS
- Google Gemini 2.0 AI API

## Deployment

This project can be deployed to Vercel or any other Next.js-compatible hosting service. 