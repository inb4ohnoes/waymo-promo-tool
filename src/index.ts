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
    .container { text-align: center; max-width: 600px; margin: 2rem auto; }
    .code-box { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-radius: 5px; font-size: 1.5rem; }
    .error { background-color: #ffdddd; border: 1px solid red; }
    .copy-btn { background: none; border: none; font-size: 1rem; cursor: pointer; padding: 0.5rem; }
    .copy-btn:disabled { cursor: not-allowed; opacity: 0.5; }
    .big-button { display: block; padding: 1rem; font-size: 1.2rem; text-align: center; background: #007aff; color: white; text-decoration: none; border-radius: 5px; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>$10 off your first Waymo ride</h1>
    <h2>San Francisco territory only</h2>

    ${!activated ? `<p style="color: red;">Code has been used up this month. Try again next month.</p>` : ""}
    
    <div class="code-box ${!activated ? "error" : ""}">
      <input type="text" id="promoCode" value="${promoCode}" readonly style="border: none; background: none; width: 100%; font-size: 1.5rem;">
      <button class="copy-btn" onclick="copyCode()" ${!activated ? "disabled" : ""}>📋</button>
    </div>

    <p>Redeem in <strong>Account > Offers & Promotions > Redeem Code</strong></p>
    
    <a href="${fullLink}" class="big-button">Download App</a>
  </div>

  <script>
    function copyCode() {
      const codeInput = document.getElementById("promoCode");
      navigator.clipboard.writeText(codeInput.value).then(() => {
        alert("Code copied!");
      });
    }
  </script>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html" } });
  }
};
