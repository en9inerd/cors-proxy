# Simple CORS proxy based on Cloudflare Workers

Use [wrangler](https://www.npmjs.com/package/wrangler) to deploy this worker to your Cloudflare account.

## Worker deployment

1. Install Wrangler.
2. Authenticate with your Cloudflare account using `wrangler login`.
3. Update `wrangler.toml` with your event name and webhook key.
4. (Optional) Add allowed origins to the whitelist:
    - Open the `index.ts` file.
    - Modify the `whitelist` array in the following format: `const whitelist: RegExp[] = [/origin1.com/, /origin2.com/];`
    - Add regular expressions for the origins you want to allow, e.g., `/origin1.com/` or `/.*\.example\.com/`.
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
