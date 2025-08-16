import { readFile } from "fs/promises";
import {createServer} from "http";
import path from "path";
import crypto from "crypto";
import { url } from "inspector";
import { writeFile } from "fs/promises";

const PORT=6969;
const DATA_FILE=path.join("data", "links.json");

const serveFile= async(res, fileURLToPath, contentType) =>{
    try{
        const data=await readFile(fileURLToPath);
        res.writeHead(200, {"content-type": contentType});
        res.end(data);
    }catch(err){
        res.writeHead(404, {"content-Type": "Text/plain"})
        res.end("404 page not found")
    }
}

const loadlinks=async() =>{
    try {
        const data=await readFile(DATA_FILE,"utf-8");
        return JSON.parse(data);
    } catch (error) {
            if(error.code==="ENOENT"){
                writeFile(DATA_FILE, JSON.stringify({}));//JSON.stringify=empty json object
                return {};
            }
            throw error;
        
    }
}

const saveLinks=async(links) =>{
   await writeFile(DATA_FILE, JSON.stringify(links));
}

const server=createServer(async(req, res) => {
    console.log(req.url);
     if(req.method === "GET"){
        if(req.url === "/"){
            return serveFile(res, path.join( "public", "index.html"), "text/html");
        }
        else if(req.url === "/style.css"){
            return serveFile(res, path.join( "public", "style.css"), "text/css");
        }
        else{
            const links=await loadlinks();
            const shortCode= req.url.slice(1);
            const originalUrl=links[shortCode];
            if(originalUrl){
                res.writeHead(302, {Location: originalUrl});
                res.end();
            }
            else{
                res.writeHead(404, {"content-Type": "Text/plain"})
                res.end("404 page not found")
            }
        }
    }   

    else if(req.method === "POST" && req.url === "/shorten") {

        const links=await loadlinks();
        let body="";
        req.on("data", (chunk)=>{
            body+=chunk;
        })
        req.on('end',async ()=>{
            console.log(body);
            const { url, short } = JSON.parse(body);
            console.log(url, short);

            if(!url){
                res.writeHead(400,{"content-Type":"text/plain"})
                return res.end("URL is required");
            }

            const finalshortcode=short || crypto.randomBytes(4).toString("hex");
            if(links[finalshortcode]){
                res.writeHead(400,{"content-type" : "text/plain"});
                return res.end("short code already exists");
            }

            links[finalshortcode] = url;
            await saveLinks(links);

            res.writeHead(200, {"content-type":"application/json"});
            res.end(JSON.stringify({success: true,
                shortCode: finalshortcode,
            }));
        });
    }
});

server.listen(PORT,() => {
    console.log(`Server running at http://localhost:${PORT}`);
});