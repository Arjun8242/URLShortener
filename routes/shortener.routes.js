import path from "path";
import { postShortenerLink, redirectShortCode } from "../controllers/shortener.controller.js";
import { serveFile } from "./utils.js"; // Assuming you will move serveFile to a utils file

const handleRequest = async (req, res) => {
  if (req.method === "GET") {
    if (req.url === "/") {
      return serveFile(res, path.join("public", "index.html"), "text/html");
    } else if (req.url === "/style.css") {
      return serveFile(res, path.join("public", "style.css"), "text/css");
    } else {
      const shortCode = req.url.slice(1);
      return redirectShortCode(req, res, shortCode);
    }
  } else if (req.method === "POST" && req.url === "/shorten") {
    return postShortenerLink(req, res);
  }
};

// Export the handler for use in app.js
export default handleRequest;