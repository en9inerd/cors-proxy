// const blacklist: string[] = [];           // regexp for blacklisted urls
// const whitelist: string[] = [".*"];     // regexp for whitelisted origins

// function isListed(uri: string | null, listing: string[]) {
//   return (typeof uri == "string") ? listing.some((m) => uri.match(m) != null) : true;
// }

// addEventListener("fetch", event => {
//   event.respondWith((async function () {
//     const isOPTIONS = (event.request.method == "OPTIONS");
//     const origin_url = new URL(event.request.url);

//     function fix(myHeaders: any) {
//       myHeaders.set("Access-Control-Allow-Origin", event.request.headers.get("Origin"));
//       if (isOPTIONS) {
//         myHeaders.set("Access-Control-Allow-Methods", event.request.headers.get("access-control-request-method"));
//         const acrh = event.request.headers.get("access-control-request-headers");

//         if (acrh) {
//           myHeaders.set("Access-Control-Allow-Headers", acrh);
//         }

//         myHeaders.delete("X-Content-Type-Options");
//       }
//       return myHeaders;
//     }
//     const fetchUrl = decodeURIComponent(decodeURIComponent(origin_url.search.substr(1)));
//     const origin = event.request.headers.get("Origin");
//     const host = event.request.headers.get("Host");
//     const cookies = event.request.headers.get("Cookie");
//     const remoteIp = event.request.headers.get("CF-Connecting-IP");

//     if ((!isListed(fetchUrl, blacklist)) && (isListed(origin, whitelist))) {
//       let xheaders = event.request.headers.get("x-cors-headers");

//       try {
//         if (xheaders) xheaders = JSON.parse(xheaders);
//       } catch (e) { }

//       if (origin_url.search.startsWith("?")) {
//         const recv_headers: Record<string, string> = {};
//         for (const pair of event.request.headers.entries()) {
//           if ((pair[0].match("^origin") == null) &&
//             (pair[0].match("eferer") == null) &&
//             (pair[0].match("^cf-") == null) &&
//             (pair[0].match("^x-forw") == null) &&
//             (pair[0].match("^x-cors-headers") == null)
//           ) recv_headers[pair[0]] = pair[1];
//         }

//         if (xheaders) Object.entries(xheaders).forEach((c) => recv_headers[c[0]] = c[1]);
//         if (cookies) recv_headers["Cookie"] = cookies;
//         if (host) recv_headers["Host"] = host;

//         const newreq = new Request(event.request, {
//           "redirect": "follow",
//           "headers": recv_headers
//         });

//         const response = await fetch(fetchUrl, newreq);
//         let myHeaders = new Headers(response.headers);
//         const cors_headers = [];
//         const allh: Record<string, string> = {};
//         for (const pair of response.headers.entries()) {
//           cors_headers.push(pair[0]);
//           allh[pair[0]] = pair[1];
//         }
//         cors_headers.push("cors-received-headers");
//         myHeaders = fix(myHeaders);
//         myHeaders.set("Access-Control-Expose-Headers", cors_headers.join(","));
//         myHeaders.set("cors-received-headers", JSON.stringify(allh));

//         const body = isOPTIONS ? null : await response.arrayBuffer();

//         const init = {
//           headers: myHeaders,
//           status: (isOPTIONS ? 200 : response.status),
//           statusText: (isOPTIONS ? "OK" : response.statusText)
//         };
//         return new Response(body, init);

//       } else {
//         const country = event.request.cf?.country;
//         const colo = event.request.cf?.colo;
//         const myHeaders = fix(new Headers());

//         return new Response(
//           "Usage:\n" + origin_url.origin + "/?uri\n\n" +
//           (origin ? "Origin: " + origin + "\n" : "") +
//           "ip: " + remoteIp + "\n" +
//           (country ? "country: " + country + "\n" : "") +
//           (colo ? "datacenter: " + colo + "\n" : "") + "\n" +
//           ((xheaders) ? "\nx-cors-headers: " + JSON.stringify(xheaders) : ""),
//           { status: 200, headers: myHeaders }
//         );
//       }
//     } else {
//       return new Response(
//         "Access denied",
//         {
//           status: 401,
//           statusText: "Access denied",
//           headers: {
//             "Content-Type": "text/html"
//           }
//         });
//     }
//   }
//   )());
// });
