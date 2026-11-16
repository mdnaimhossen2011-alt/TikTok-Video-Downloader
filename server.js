const express = require("express");
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "20kb" }));

function validTikTokUrl(raw) {
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    return ["tiktok.com", "m.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"].includes(host)
      || host.endsWith(".tiktok.com");
  } catch { return false; }
}

app.post("/api/download", async (req, res) => {
  const url = String(req.body?.url || "").trim();
  const format = req.body?.format === "mp3" ? "mp3" : "mp4";
  if (!validTikTokUrl(url)) {
    return res.status(400).json({ error: "Please enter a valid TikTok video link." });
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tiktok-"));
  const output = path.join(dir, `download.%(ext)s`);
  const args = ["-m", "yt_dlp", "--no-playlist", "--no-warnings", "--restrict-filenames",
    "-o", output, "--print", "after_move:filepath"];
  if (format === "mp3") args.push("-x", "--audio-format", "mp3", "--audio-quality", "0");
  else args.push("--merge-output-format", "mp4");
  args.push(url);

  const child = spawn("python3", args);
  let stdout = "", stderr = "", finished = false;
  const timeout = setTimeout(() => child.kill("SIGKILL"), 120000);
  child.stdout.on("data", d => stdout += d.toString());
  child.stderr.on("data", d => stderr += d.toString());
  child.on("error", () => {
    clearTimeout(timeout);
    fs.rmSync(dir, { recursive: true, force: true });
    if (!res.headersSent) res.status(500).json({ error: "Downloader could not start. Please try again later." });
  });
  child.on("close", code => {
    clearTimeout(timeout);
    if (finished) return;
    const filePath = stdout.trim().split(/\r?\n/).filter(Boolean).pop();
    if (code !== 0 || !filePath || !fs.existsSync(filePath)) {
      fs.rmSync(dir, { recursive: true, force: true });
      return res.status(502).json({ error: "Could not download this video. It may be private, unavailable, or temporarily unsupported." });
    }
    finished = true;
    res.download(filePath, `tiktok-video.${format}`, err => {
      fs.rmSync(dir, { recursive: true, force: true });
      if (err && !res.headersSent) res.status(500).end();
    });
  });
});

app.get("/health", (_req, res) => res.json({ ok: true }));
app.listen(PORT, () => console.log(`TikTok downloader running on ${PORT}`));
