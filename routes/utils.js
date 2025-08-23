import { readFile } from "fs/promises";

export const serveFile = async (res, filePath, contentType) => {
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { "content-type": contentType });
    res.end(data);
  } catch (err) {
    res.writeHead(404, { "content-Type": "Text/plain" });
    res.end("404 page not found");
  }
};