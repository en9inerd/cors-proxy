const blacklist = [] as RegExp[]; // regexp for blacklisted urls
const whitelist = [/.*/] as RegExp[]; // regexp for whitelisted origins

function isListed(uri: string | null, listing: RegExp[]): boolean {
  return typeof uri === "string" ? listing.some(m => !!uri.match(m)) : true;
}

addEventListener("fetch", event => {
  event.respondWith((async () => {
    const isOPTIONS = event.request.method === "OPTIONS";
    const originUrl = new URL(event.request.url);

    function fixHeaders(headers: Headers): Headers {
      headers.set("Access-Control-Allow-Origin", event.request.headers.get("Origin")!);
      if (isOPTIONS) {
        headers.set("Access-Control-Allow-Methods", event.request.headers.get("access-control-request-method")!);
        const accessControlRequestHeaders = event.request.headers.get("access-control-request-headers");
        if (accessControlRequestHeaders) {
          headers.set("Access-Control-Allow-Headers", accessControlRequestHeaders);
        }
        headers.delete("X-Content-Type-Options");
      }
      return headers;
    }

    const fetchUrl = decodeURIComponent(decodeURIComponent(originUrl.search.substr(1)));
    const origin = event.request.headers.get("Origin");
    const host = event.request.headers.get("Host");
    const cookies = event.request.headers.get("Cookie");
    const remoteIp = event.request.headers.get("Cf-Connecting-IP");
    const remoteIp6 = event.request.headers.get("Cf-Connecting-IPv6");

    if (!isListed(fetchUrl, blacklist) && isListed(origin, whitelist)) {
      let xheaders: Record<string, string> | undefined = undefined;
      const xCorsHeaders = event.request.headers.get("x-cors-headers");
      if (xCorsHeaders) {
        try {
          xheaders = JSON.parse(xCorsHeaders);
        } catch (e) { }
      }

      if (originUrl.search.startsWith("?")) {
        const recvHeaders: Record<string, string> = {};
        for (const [name, value] of event.request.headers) {
          if (!name.match(/^origin/i) && !name.match(/referer/i) && !name.match(/^cf-/i)
            && !name.match(/^x-forw/i) && !name.match(/^x-cors-headers/i)) {
            recvHeaders[name] = value;
          }
        }
        if (xheaders) {
          Object.entries(xheaders).forEach(([name, value]) => {
            recvHeaders[name] = value;
          });
        }
        if (cookies) {
          recvHeaders["Cookie"] = cookies;
        }
        if (host) {
          recvHeaders["Host"] = host;
        }
        const newReq = new Request(event.request, {
          redirect: "follow",
          headers: recvHeaders,
        });
        const response = await fetch(fetchUrl, newReq);
        const corsHeaders = Array.from(response.headers.keys());
        corsHeaders.push("cors-received-headers");
        const receivedHeaders: Record<string, string> = {};
        for (const [name, value] of response.headers) {
          receivedHeaders[name] = value;
        }
        const headers = fixHeaders(new Headers(response.headers));
        headers.set("Access-Control-Expose-Headers", corsHeaders.join(","));
        headers.set("cors-received-headers", JSON.stringify(receivedHeaders));
        const body = isOPTIONS ? null : await response.arrayBuffer();
        return new Response(body, {
          headers,
          status: isOPTIONS ? 200 : response.status,
          statusText: isOPTIONS ? "OK" : response.statusText,
        });
      } else {
        const country = event.request.cf?.country;
        const colo = event.request.cf?.colo;
        const myHeaders = fixHeaders(new Headers());
        const responseBody = JSON.stringify({
          usage: `${originUrl.origin}/?uri`,
          origin: origin ? origin : "",
          ip: remoteIp ? remoteIp : remoteIp6 ? remoteIp6 : "",
          country: country ? country : "",
          datacenter: colo ? colo : "",
          xCorsHeaders: xheaders ? xheaders : "",
        });
        myHeaders.set("Content-Type", "application/json");

        return new Response(responseBody, {
          status: 200,
          headers: myHeaders,
        });
      }
    } else {
      return new Response("Access denied", {
        status: 401,
        statusText: "Access denied",
        headers: {
          "Content-Type": "text/html",
        },
      });
    }
  })());
});
