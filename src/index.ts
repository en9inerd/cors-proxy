const blacklist = [] as RegExp[]; // regexp for blacklisted urls
const whitelist = [/.*/] as RegExp[]; // regexp for whitelisted origins

function isListed(uri: string, listing: RegExp[]): boolean {
  return listing.some((m) => !!uri.match(m));
}

const handler: ExportedHandler = {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
    };
    const url = new URL(request.url);
    const apiUrl = url.searchParams.get("apiUrl") || "";
    const origin = request.headers.get("Origin") || "";

    // Check if the origin is in the whitelist or the API URL is in the blacklist. Consider
    if ((isListed(apiUrl, blacklist) || !isListed(origin, whitelist)) && apiUrl) {
      return new Response(null, {
        status: 403,
        statusText: "Forbidden",
      });
    }

    function infoResponse(json: string) {
      return new Response(json, {
        status: 200,
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": origin!,
        },
      });
    }

    async function handleRequest(request: Request) {
      // Rewrite request to point to API URL. This also makes the request mutable
      // so you can add the correct Origin header to make the API server think
      // that this request is not cross-site.
      request = new Request(apiUrl, request);
      request.headers.set("Origin", new URL(apiUrl).origin);
      let response = await fetch(request);
      // Recreate the response so you can modify the headers

      response = new Response(response.body, response);
      // Set CORS headers

      response.headers.set("Access-Control-Allow-Origin", origin!);

      // Append to/Add Vary header so browser will cache response correctly
      response.headers.append("Vary", "Origin");

      return response;
    }

    async function handleOptions(request: Request) {
      if (
        request.headers.get("Origin") !== null &&
        request.headers.get("Access-Control-Request-Method") !== null &&
        request.headers.get("Access-Control-Request-Headers") !== null
      ) {
        // Handle CORS preflight requests.
        return new Response(null, {
          headers: {
            ...corsHeaders,
            "Access-Control-Allow-Headers": request.headers.get(
              "Access-Control-Request-Headers"
            )!,
          },
        });
      } else {
        // Handle standard OPTIONS request.
        return new Response(null, {
          headers: {
            Allow: "GET, HEAD, POST, OPTIONS",
          },
        });
      }
    }

    if (apiUrl) {
      if (request.method === "OPTIONS") {
        // Handle CORS preflight requests
        return handleOptions(request);
      } else if (
        request.method === "GET" ||
        request.method === "HEAD" ||
        request.method === "POST"
      ) {
        // Handle requests to the API server
        return handleRequest(request);
      } else {
        return new Response(null, {
          status: 405,
          statusText: "Method Not Allowed",
        });
      }
    } else {
      const requesterIp = request.headers.get("CF-Connecting-IP") || "";
      const requesterIp6 = request.headers.get("CF-Connecting-IPv6") || "";
      const requesterInfo = JSON.stringify({
        usage: `${url.origin}/?apiUrl=<API_URL>`,
        origin: request.headers.get("Origin") || "",
        ip: requesterIp || requesterIp6 || "",
        country: request.cf?.country || "",
        datacenter: request.cf?.colo || "",
        xCorsHeaders: request.headers.get("x-cors-headers") || "",
      });

      return infoResponse(requesterInfo);
    }
  },
};

export default handler;
