import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const DATA_FILE = path.join("data", "links.json");

// Utility function to load links from the JSON file
export const loadLinks = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(DATA_FILE, JSON.stringify({}));
      return {};
    }
    throw error;
  }
};

// Utility function to save links to the JSON file
export const saveLinks = async (links) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(links, null, 2));
};

// Handler for the short URL creation (POST request)
export const postShortenerLink = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", async () => {
    try {
      const { url, short } = JSON.parse(body);

      if (!url) {
        res.writeHead(400, { "content-Type": "text/plain" });
        return res.end("URL is required");
      }

      const links = await loadLinks();
      const finalshortcode = short || crypto.randomBytes(4).toString("hex");

      if (links[finalshortcode]) {
        res.writeHead(400, { "content-type": "text/plain" });
        return res.end("Short code already exists");
      }

      links[finalshortcode] = url;
      await saveLinks(links);

      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ success: true, shortCode: finalshortcode }));
    } catch (error) {
      console.error(error);
      res.writeHead(500, { "content-type": "text/plain" });
      res.end("Internal server error");
    }
  });
};

// Handler for redirecting short codes (GET request)
export const redirectShortCode = async (req, res, shortCode) => {
  try {
    const links = await loadLinks();
    const originalUrl = links[shortCode];

    if (originalUrl) {
      res.writeHead(302, { Location: originalUrl });
      res.end();
    } else {
      res.writeHead(404, { "content-Type": "Text/plain" });
      res.end("404 page not found");
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "content-type": "text/plain" });
    res.end("Internal server error");
  }
};