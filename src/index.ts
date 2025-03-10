interface Env {
  ASSETS: Fetcher;
  PROMO_KV: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Serve static assets (image, etc.)
    if (url.pathname.startsWith("/img/")) {
      return env.ASSETS.fetch(request);
    }

    // Retrieve KV values
    const fullLink = await env.PROMO_KV.get("url") || "#";
    const activated = (await env.PROMO_KV.get("activated")) === "true";

    // Extract promo code from the stored URL
    const promoCodeMatch = fullLink.match(/[?&]code=([^&]+)/);
    const promoCode = promoCodeMatch ? promoCodeMatch[1] : "XXXX-XXXX";

    // Return the HTML page
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
        .code-box { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-radius: 10px; font-size: 1.5rem; border: 2px solid gray; background-color: rgba(255, 255, 255, 0.1); transition: background-color 0.3s, border-color 0.3s; }
        .error { background-color: rgba(255, 50, 50, 0.2); border: 2px solid darkred; }
        .copied { background-color: rgba(50, 205, 50, 0.2); border: 2px solid darkgreen !important; }
        .copy-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; padding: 0.5rem; }
        .copy-btn:disabled { cursor: not-allowed; opacity: 0.5; }
        .big-button { display: block; padding: 1rem; font-size: 1.2rem; text-align: center; background: #007aff; color: white; text-decoration: none; border-radius: 10px; margin-top: 1rem; }
        #copiedText { color: #3cb371; display: none; font-weight: bold; } /* Lighter green */
        .error-text { color: #ff6666; font-weight: bold; } /* Lighter red */
        .redeem-text { font-size: 0.9rem; color: gray; margin-top: 0.5rem; }
        .footer-img { width: 100%; max-width: 600px; padding: 0 10px; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>$10 off your first Waymo One ride</h1>
        <h2>San Francisco territory only</h2>
        ${!activated ? `<p class="error-text">Code has been used up this month. Try again next month.</p>` : ""}
        <p id="copiedText">Code copied!</p>
        <div id="codeBox" class="code-box ${!activated ? "error" : ""}">
          <input type="text" id="promoCode" value="${promoCode}" readonly style="border: none; background: none; width: 100%; font-size: 1.5rem;">
          <button class="copy-btn" onclick="copyCode()" ${!activated ? "disabled" : ""}>📑</button>
        </div>
        <a href="${fullLink}" class="big-button">Download App</a>
        <p class="redeem-text">Redeem in Account > Offers & promotions > Redeem code</p>
      </div>
      <img src="/img/waymo-half-shot.png" alt="Waymo Car" class="footer-img">
      <script>
        function copyCode() {
          const copiedText = document.getElementById("copiedText");
          const codeBox = document.getElementById("codeBox");
          
          navigator.clipboard.writeText(document.getElementById("promoCode").value).then(() => {
            copiedText.style.display = "block";
            codeBox.classList.add("copied");

            setTimeout(() => {
              copiedText.style.display = "none";
              codeBox.classList.remove("copied");
            }, 3000);
          });
        }
      </script>
    </body>
    </html>`;

    return new Response(html, { headers: { "Content-Type": "text/html" } });
  }
};
