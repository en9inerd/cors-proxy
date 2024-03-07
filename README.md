# Simple CORS proxy based on Cloudflare Workers

Problem statement is described in [this blog post](https://enginerd.io/2023/04/17/cors-proxy/).

## Worker deployment

1. Install Wrangler.
2. Authenticate with your Cloudflare account using `wrangler login`.
3. Update `wrangler.toml` with your event name and webhook key.
4. (Optional) Include allowed origins in the whitelist by updating the `index.ts` file. Add regular expressions for desired origins to the `whitelist` array using the format: `const whitelist: RegExp[] = [/origin1.com/, /.*\.example\.com/];`
5. Deploy the worker using `wrangler deploy`.

## Usage

```typescript
fetch("https://cors-proxy.workers.dev/?apiUrl=https://api.ipify.org?format=json").then(response => {
  return response.json();
}).then(data => {
  console.log(data);
});
```

where `https://api.ipify.org?format=json` is the URL you want to fetch and `https://cors-proxy.workers.dev` is the URL of your deployed worker.
