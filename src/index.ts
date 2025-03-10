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
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0">
      <title>Waymo Promo</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css">
      <style>
        html, body {
          height: 100%;
          margin: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
        }
        body {
          touch-action: pan-x pan-y;
          touch-action: none;
        }
        .container {
          text-align: center;
          max-width: 600px;
          width: 90%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-grow: 1;
          padding-bottom: 125px; /* Pushes content up to make space for footer */
        }
        h1 { margin-bottom: 0.3rem; white-space: pre-line; }
        h2 { margin-top: 0.1rem; }
        .code-box, .big-button {
          width: 100%; max-width: 400px;
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem; border-radius: 10px; font-size: 1.5rem;
        }
        h3 {
          white-space: pre-line;
        }
        .code-box {
          border: 2px solid gray; background-color: rgba(255, 255, 255, 0.1);
          transition: background-color 0.3s ease-in-out, border-color 0.3s ease-in-out;
        }
        .error { background-color: rgba(255, 50, 50, 0.2); border: 2px solid darkred; }
        .copied { background-color: rgba(50, 205, 50, 0.2); border: 2px solid darkgreen !important; }
        .copy-btn {
          background: none; border: none; font-size: 1.2rem; cursor: pointer; padding: 0.5rem;
          outline: none; user-select: none;
        }
        .copy-btn:hover, .copy-btn:focus { background: none; }
        .big-button {
          justify-content: center; text-align: center; background: #007aff; color: white;
          text-decoration: none; border-radius: 10px; margin-top: 1rem;
          transition: background 0.2s ease-in-out;
        }
        .big-button:hover, .big-button:active {
          text-decoration: none;
        }
        #copiedText {
          color: #3cb371; font-weight: bold; opacity: 0;
          transition: opacity 0.3s ease-in-out;
          height: 1.5rem;
          margin-top: 0.5rem;
          display: ${activated ? "block" : "none"};
          pointer-events: none; /* Ensures it doesn't interfere with interactions */
        }
        .error-text {
          color: #ff6666; font-weight: bold;
          white-space: pre-line;
          margin-top: 0.5rem;
        }
        .redeem-text { font-size: 0.9rem; color: gray; margin-top: 0.5rem; }
        .footer-img {
          width: 95%; max-width: 600px; padding: 0 20px;
          position: absolute; bottom: 0;
          left: 50%; transform: translateX(-50%);
        }
        li {
          float: left;
          display: inline;
        }
      </style>
    </head>
    <body>
       <ul>
        <li>
          <p style="margin: 0;">Waymo Promo Tool</p>
        </li>
        <li style="float:right; margin: 0 2em;">
          <a href="https://github.com/burritosoftware/waymo-promo-tool">GitHub</a>
        </li>
      </ul>
      <div class="container">
        <h3>Hi! Here's my current referral code!\nThanks for watching.</h3>
        <h1>$10 off your first\nWaymo One ride</h1>
        <h2>San Francisco territory only</h2>
      
        ${!activated ? `<p class="error-text">Code has been used up this month.\nTry again next month.</p>` : ""}
        <p id="copiedText">Code copied!</p>

        <div id="codeBox" class="code-box ${!activated ? "error" : ""}">
          <input type="text" id="promoCode" value="${promoCode}" readonly
            style="border: none; background: none; width: 100%; font-size: 1.5rem;">
          <button class="copy-btn" onclick="copyCode()" ${!activated ? "disabled" : ""}>📋</button>
        </div>

        <a href="${fullLink}" class="big-button">Download App</a>
        <p class="redeem-text">Account → Offers & promotions → Redeem code</p>
      </div>
      <img src="/img/waymo-half-shot.png" alt="Waymo Car" class="footer-img">
      <script>
        function copyCode() {
          const copiedText = document.getElementById("copiedText");
          const codeBox = document.getElementById("codeBox");

          copiedText.style.opacity = "1";
          codeBox.classList.add("copied");

          navigator.clipboard.writeText(document.getElementById("promoCode").value).then(() => {
            setTimeout(() => {
              copiedText.style.opacity = "0";
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
