# Deploying to Render (Node.js Web Service)

This project is now configured as a **Node.js Web Service** using the Blueprint configuration in `render.yaml`. This enables the backend proxy (`server.js`) to securely communicate with the RunwayML API, handling task polling and avoiding CORS issues.

## Prerequisites

Before deploying, make sure you have:
1. A **GitHub**, **GitLab**, or **Bitbucket** repository with this project's code pushed to it.
2. A **Render** account (register at [render.com](https://render.com)).

## Deployment Steps

### Step 1: Add Blueprint on Render
1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Click **New** in the top right corner and select **Blueprint**.
3. Connect your repository (`chitra_chatbot`).
4. Render will automatically detect the `render.yaml` file in the root of your repository and configure the Web Service.

### Step 2: Configure Environment Variables
To enable RunwayML and Ideogram features, set the following environment variables in your Render Dashboard:
1. Go to your Web Service dashboard in Render.
2. Go to **Environment** settings.
3. Add the following environment variables:
   - `RUNWAY_API_KEY`: Your RunwayML API key (`key_...`). Required for high-quality Image-to-Image capabilities.
   - `VITE_IDEOGRAM_API_KEY`: (Optional) Your Ideogram API Key for premium text-to-image tier features.

4. Click **Save Changes**. Render will automatically trigger a rebuild and redeployment of the web service.

### Step 3: Verify and Access
Once the build and deployment are complete:
1. Render will host your Node.js application on a free `onrender.com` subdomain (e.g., `chitra-chatbot.onrender.com`).
2. You can access the live URL from the service page in your dashboard.
3. The server will dynamically serve the built React static files and handle API routing seamlessly.
