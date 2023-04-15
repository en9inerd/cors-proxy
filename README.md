# Simple CORS proxy based on Cloudflare Workers

Use [wrangler](https://www.npmjs.com/package/wrangler) to deploy this worker to your Cloudflare account.

## Usage

```typescript
fetch("https://cors-proxy.workers.dev/?https://wikipedia.org").then(response => {
  console.log(response);
});
```
