const form = document.getElementById("downloadForm");
const input = document.getElementById("videoUrl");
const statusText = document.getElementById("status");
const downloadBtn = document.getElementById("downloadBtn");
const pasteBtn = document.getElementById("pasteBtn");

document.getElementById("year").textContent = new Date().getFullYear();

document.querySelectorAll(".format-option input").forEach(radio => {
  radio.addEventListener("change", () => {
    document.querySelectorAll(".format-option").forEach(label => label.classList.remove("active"));
    radio.closest(".format-option").classList.add("active");
  });
});

document.getElementById("menuBtn").addEventListener("click", () => {
  const nav = document.getElementById("nav");
  nav.classList.toggle("open");
  document.getElementById("menuBtn").setAttribute("aria-expanded", nav.classList.contains("open"));
});
document.querySelectorAll("#nav a").forEach(a => a.addEventListener("click", () => {
  document.getElementById("nav").classList.remove("open");
}));

pasteBtn.addEventListener("click", async () => {
  try {
    input.value = await navigator.clipboard.readText();
    statusText.textContent = "Link pasted. Choose a format and press Download.";
    statusText.style.color = "#fff";
  } catch {
    input.focus();
    statusText.textContent = "Please paste your copied TikTok link into the box.";
  }
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  const url = input.value.trim();
  const format = document.querySelector('input[name="format"]:checked').value;
  if (!url) return;
  downloadBtn.disabled = true;
  downloadBtn.querySelector("span:first-child").textContent = "Preparing download…";
  statusText.textContent = "Please wait. This may take a little while.";
  try {
    const response = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, format })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Download failed. Please try another link.");
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `tiktok-video.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
    statusText.textContent = "Your download is ready.";
  } catch (error) {
    statusText.textContent = error.message;
    statusText.style.color = "#fff0a8";
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.querySelector("span:first-child").textContent = "Download";
  }
});
