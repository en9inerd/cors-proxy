# Simple CORS proxy based on Cloudflare Workers

Use [wrangler](https://www.npmjs.com/package/wrangler) to deploy this worker to your Cloudflare account.

## Usage

```typescript
fetch("https://cors-proxy.workers.dev/?apiUrl=https://api.ipify.org?format=json").then(response => {
  return response.json();
}).then(data => {
  console.log(data);
});
```

where `https://api.ipify.org?format=json` is the URL you want to fetch and `https://cors-proxy.workers.dev` is the URL of your deployed worker.
