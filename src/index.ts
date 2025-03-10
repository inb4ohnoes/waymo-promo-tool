interface Env {
  ASSETS: Fetcher;
  PROMO_KV: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Serve static assets
    if (url.pathname.startsWith("/img/")) {
      return env.ASSETS.fetch(request);
    }

    // Retrieve KV values
    const fullLink = await env.PROMO_KV.get("url") || "#";
    const activated = (await env.PROMO_KV.get("activated")) === "true";
    const promoCodeMatch = fullLink.match(/[?&]code=([^&]+)/);
    const promoCode = promoCodeMatch ? promoCodeMatch[1] : "XXXX-XXXX";

    // Return HTML page
    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Waymo Promo</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css">
      <style>
        body { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .container { text-align: center; max-width: 600px; width: 90%; flex-grow: 1; display: flex; flex-direction: column; justify-content: center; }
        .footer-img { width: 100%; max-width: 600px; padding: 0 10px; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>$10 off your first Waymo One ride</h1>
        <h2>San Francisco territory only</h2>
        ${!activated ? `<p style="color: #ff6666; font-weight: bold;">Code has been used up this month. Try again next month.</p>` : ""}
        <p id="copiedText" style="color: #3cb371; display: none;">Code copied!</p>
        <div class="code-box ${!activated ? "error" : ""}" style="border: 2px solid gray; padding: 1rem; border-radius: 10px;">
          <input type="text" id="promoCode" value="${promoCode}" readonly style="border: none; background: none; width: 100%; font-size: 1.5rem;">
          <button class="copy-btn" onclick="copyCode()" ${!activated ? "disabled" : ""}>📑</button>
        </div>
        <a href="${fullLink}" class="big-button" style="padding: 1rem; font-size: 1.2rem; text-align: center; background: #007aff; color: white; text-decoration: none; border-radius: 10px; margin-top: 1rem;">Download App</a>
        <p class="redeem-text" style="font-size: 0.9rem; color: gray; margin-top: 0.5rem;">Redeem in Account > Offers & promotions > Redeem code</p>
      </div>
      <img src="/img/waymo-half-shot.webp" alt="Waymo Car" class="footer-img">
      <script>
        function copyCode() {
          const copiedText = document.getElementById("copiedText");
          navigator.clipboard.writeText(document.getElementById("promoCode").value).then(() => {
            copiedText.style.display = "block";
            setTimeout(() => copiedText.style.display = "none", 3000);
          });
        }
      </script>
    </body>
    </html>`;

    return new Response(html, { headers: { "Content-Type": "text/html" } });
  }
};
