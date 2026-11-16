# TikTok Video Downloader

A responsive SSSTik-inspired starter website with an Express + yt-dlp backend.

## Deploy on Render (recommended)
1. Create a GitHub repository and upload all files in this folder.
2. In Render, choose **New → Blueprint** and connect the repository, or choose **New → Web Service** and select the repository.
3. Select **Docker** as the runtime if creating the service manually.
4. Deploy. Render will build the Docker image and start the app.
5. Open the `onrender.com` URL after deployment.

The included `render.yaml` uses the free plan where available. Free instances may sleep and take time to wake up.

## Deploy on Netlify
This project has a server-side downloader, so it cannot run as a static-only Netlify site. Host the complete project on Render, or host only the `public` folder on Netlify and separately deploy the Node backend on Render (then configure a backend API URL in `public/app.js`).

## Local run
Requires Node.js, Python 3, ffmpeg and yt-dlp:
```bash
pip install -U yt-dlp
npm install
npm start
```
Then open http://localhost:3000.

## Important
- This is a starter implementation. TikTok may change its delivery methods, and some videos (private, region-restricted, age-restricted, or otherwise unavailable) may fail.
- No-watermark output is not guaranteed; the extractor can only provide formats TikTok makes available.
- Download only videos you own or have permission to save. Respect creators' rights and TikTok's terms.
- Add rate limiting, request limits, monitoring, and an abuse/contact policy before making the service public. Do not store users' submitted links or downloaded files.
