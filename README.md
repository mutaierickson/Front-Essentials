# Essentials by Ed

Essentials by Ed is a full-stack web application with a React frontend and an Express backend. The project is structured into separate frontend and backend applications to make development and deployment easier.

## Project Structure

```
ESSENTIALS-BY-ED-master/
├── frontend/          # React + TypeScript + Vite frontend
├── backend/           # Express backend/API
│   └── .env           # Server secrets (not committed)
├── package.json       # Project scripts and dependencies
└── README.md
```

## Getting Started

### 1. Install dependencies

From the project root, run:

```bash
npm run install:all
```

This installs the required dependencies for both the frontend and backend.

### 2. Environment variables

Keep server secrets in `backend/.env`. The backend loads that file from its own folder. Do not put this file in the project root, and do not commit it.

If the frontend needs public `VITE_*` variables, put those in `frontend/.env`.

**Important:** Never expose private keys or secrets through `VITE_` variables. Anything prefixed with `VITE_` can be accessed by the browser.

## Running the Project Locally

You'll need two terminals when running the application locally.

### Start the backend

```bash
npm run dev:backend
```

The API will normally run on:

```text
http://localhost:3001
```

### Start the frontend

In a second terminal:

```bash
npm run dev:frontend
```

Vite will start the frontend development server and provide the local URL in the terminal.

## Deployment

The frontend can be deployed to Vercel, while the backend can either be hosted separately or converted to Vercel serverless functions.

### Frontend Environment Variables

Add the following variables to your Vercel project under:

**Vercel → Project Settings → Environment Variables**

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=
```

Where:

* `VITE_SUPABASE_URL` – Your Supabase project URL.
* `VITE_SUPABASE_ANON_KEY` – Your Supabase public/anonymous key.
* `VITE_API_URL` – The URL of the deployed backend API. For example:

```text
https://your-backend.vercel.app/api
```

`VITE_API_URL` is optional if the frontend doesn't need to communicate with a separately hosted backend.

### Backend Environment Variables

The backend uses server-side environment variables from `backend/.env` locally. On a host, set the same variables in that service's environment. They should **not** be exposed to the browser.

Depending on the features being used, these may include:

```env
DATABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

MPESA_ENV=
MPESA_BASE_URL=
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=

GEMINI_API_KEY=

SMS_API_KEY=
SMS_PARTNER_ID=
SMS_SHORTCODE=
```

Only add the variables required by the features you are using.

## Vercel Setup

When deploying the frontend to Vercel:

1. Create or select your Vercel project.
2. Set the **Root Directory** to:

```text
frontend
```

3. Add the required `VITE_*` environment variables.
4. Deploy the project.

The backend should be deployed separately if it remains an Express application. Once deployed, update:

```env
VITE_API_URL=https://your-backend-url/api
```

and redeploy the frontend.

## Security

Keep server-side secrets in `backend/.env`.

Do **not** add the following to `VITE_*` variables:

* Database connection strings
* Supabase service role keys
* M-Pesa secrets
* API private keys
* SMS credentials
* Any other server-side credentials

Vite makes `VITE_*` variables available to the client-side application, so they should only contain values that are safe to expose publicly.

## Development Notes

The project is intentionally split into two parts:

* **Frontend** – React, TypeScript and Vite
* **Backend** – Express API

This separation makes it easier to develop, maintain and deploy each part independently.

For local development, start both the backend and frontend before using features that depend on the API.
