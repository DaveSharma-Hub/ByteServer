import http from "http";
import { transformToBytes, transformToJSON } from "./transformer.js";

const API_METHODS = {
  GET: "GET",
  POST: "POST",
};

class Server {
  #server = null;
  #port = 3000;
  #endpointMap = {};

  constructor() {
    this.#server = http.createServer((req, res) => {
      const rawDataChunks = [];
      req.on("data", (data) => {
        rawDataChunks.push(data);
      });
      req.on("end", () => {
        const buffer = Buffer.concat(rawDataChunks);
        const interpretedData = this.#interpretDataToJSON(buffer);
        if (interpretedData) {
          const { endpoint, body, method } = interpretedData;
          const { fn } = this.#endpointMap[endpoint];
          const { request, result } = this.#createRequestResult({
            body,
            method,
            req,
            res,
          });
          fn(request, result);
          return;
        }
        res.writeHead(404);
        res.end("Invalid endpoint");
      });
      req.on("error", () => {
        res.writeHead(500);
        res.end("Server error");
      });
    });
  }

  #interpretDataToJSON(byteData) {
    /*
        endpoint -> |length|endpoint|
        method -> |length|method|
        body -> |length|body| -> convert body to json
        */
    console.log(byteData);
    const endpointBeg = 0;
    const endpointEnd = 2;
    const endpointLength = Buffer.from(
      byteData.slice(endpointBeg, endpointEnd)
    ).readInt16LE(0);
    const endpoint = Buffer.from(
      byteData.slice(endpointEnd, endpointEnd + endpointLength),
      "utf-8"
    ).toString();
    console.log('endpoint', endpoint, endpointLength);
    const methodBeg = endpointEnd + endpointLength;
    const methodEnd = methodBeg + 2;
    const methodLength = Buffer.from(
      byteData.slice(methodBeg, methodEnd)
    ).readInt16LE(0);
    const method = Buffer.from(
      byteData.slice(methodEnd, methodEnd + methodLength),
      "utf-8"
    ).toString();
    console.log('method', method, methodLength);

    if (endpoint in this.#endpointMap) {
      const { method: api_method, schema } = this.#endpointMap[endpoint];
      if (api_method === method) {
        const bodyBeg = methodEnd + methodLength;
        const bodyEnd = bodyBeg + 2;
        const bodyLength = Buffer.from(
          byteData.slice(bodyBeg, bodyEnd)
        ).readInt16LE(0);
        const body = transformToJSON(schema)(
          byteData.slice(bodyEnd, bodyEnd + bodyLength)
        );
        
        return {
          endpoint,
          body,
          method,
        };
      }
    }
  }

  #convertDataToByte(json) {
    return transformToBytes(json);
  }

  #createRequestResult({ body, method, req, res }) {
    const request = {
      body: {
        params: body,
      },
      method: method,
    };
    const result = {
      send: (json) => {
        const byteData = this.#convertDataToByte(json);
        res
          .writeHead(200, {
            "Content-Length": Buffer.byteLength(byteData),
            "Content-Type": "application/octet-stream",
          })
          .end(byteData);
      },
      sendStatus: (status) => {
        res.writeHead(status).end();
      },
    };
    return { request, result };
  }

  use(middleareFn, endpoints = []) {
    if (endpoints.length === 0) {
    }
  }

  get(endpoint, fn, schema) {
    this.#endpointMap[endpoint] = {
      fn: fn,
      method: API_METHODS.GET,
      schema: schema,
    };
  }

  post(endpoint, fn, schema) {
    this.#endpointMap[endpoint] = {
      fn: fn,
      method: API_METHODS.POST,
      schema: schema,
    };
  }

  listen(port, fn) {
    this.#server.listen(port || this.#port, fn);
  }
}

export default Server;
