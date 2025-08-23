import { createServer } from "http";
import handleRequest from "./routes/shortener.routes.js";

const PORT = process.env.PORT || 3000;

const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});