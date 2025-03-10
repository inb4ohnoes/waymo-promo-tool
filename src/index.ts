interface Env {
  PROMO_KV: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Retrieve KV values
    const fullLink = await env.PROMO_KV.get("url") || "#";
    const activated = (await env.PROMO_KV.get("activated")) === "true";

    // Extract the promo code from the URL (assumes it's in the query string as `?code=XXXXXX`)
    const promoCodeMatch = fullLink.match(/[?&]code=([^&]+)/);
    const promoCode = promoCodeMatch ? promoCodeMatch[1] : "XXXX-XXXX";

    // HTML content
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Waymo Promo</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css">
  <style>
    body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
    .container { text-align: center; max-width: 600px; width: 90%; }
    .code-box { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-radius: 10px; font-size: 1.5rem; border: 2px solid gray; background-color: rgba(255, 255, 255, 0.1); }
    .error { background-color: rgba(255, 50, 50, 0.2); border: 2px solid darkred; }
    .copied { background-color: rgba(50, 205, 50, 0.2); border: 2px solid darkgreen; }
    .copy-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; padding: 0.5rem; }
    .copy-btn:disabled { cursor: not-allowed; opacity: 0.5; }
    .big-button { display: block; padding: 1rem; font-size: 1.2rem; text-align: center; background: #007aff; color: white; text-decoration: none; border-radius: 10px; margin-top: 1rem; }
    #copiedText { color: darkgreen; display: none; font-weight: bold; }
    .redeem-text { font-size: 0.9rem; color: gray; margin-top: 0.5rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>$10 off your first Waymo ride</h1>
    <h2>San Francisco territory only</h2>

    ${!activated ? `<p style="color: darkred;">Code has been used up this month. Try again next month.</p>` : ""}
    <p id="copiedText">Code copied!</p>

    <div id="codeBox" class="code-box ${!activated ? "error" : ""}">
      <input type="text" id="promoCode" value="${promoCode}" readonly style="border: none; background: none; width: 100%; font-size: 1.5rem;">
      <button class="copy-btn" onclick="copyCode()" ${!activated ? "disabled" : ""}>📑</button>
    </div>

    <a href="${fullLink}" class="big-button">Download App</a>
    <p class="redeem-text">Redeem in Account > Offers & Promotions > Redeem Code</p>
  </div>

  <script>
    function copyCode() {
      const codeInput = document.getElementById("promoCode");
      const codeBox = document.getElementById("codeBox");
      const copiedText = document.getElementById("copiedText");

      navigator.clipboard.writeText(codeInput.value).then(() => {
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
