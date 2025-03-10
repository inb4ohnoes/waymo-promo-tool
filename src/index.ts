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

    // Only show "Code copied!" element if there's no error
    const copiedTextElement = activated
      ? `<p id="copiedText">Code copied!</p>`
      : "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Waymo Promo</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css">
  <style>
    /* Layout & Centering */
    body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center; /* Center vertically & horizontally */
      margin: 0;
      height: 100vh;
      overflow: hidden; /* No scrolling */
    }
    .container {
      text-align: center;
      max-width: 600px;
      width: 90%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* Titles */
    h1 { margin-bottom: 0.3rem; }
    h2 { margin-top: 0.1rem; }

    /* Code Box & Download Button */
    .code-box, .big-button {
      width: 100%;
      max-width: 400px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-radius: 10px;
      font-size: 1.5rem;
    }
    .code-box {
      border: 2px solid gray;
      background-color: rgba(255, 255, 255, 0.1);
      transition: background-color 0.3s ease-in-out, border-color 0.3s ease-in-out;
    }

    /* Error / Copied States */
    .error {
      background-color: rgba(255, 50, 50, 0.2);
      border: 2px solid darkred;
    }
    .copied {
      background-color: rgba(50, 205, 50, 0.2);
      border: 2px solid darkgreen !important;
    }

    /* Copy Button */
    .copy-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.5rem;
      outline: none;
      user-select: none; /* Prevent text selection highlight */
    }
    .copy-btn:focus, .copy-btn:hover {
      outline: none;
      background: none; /* Remove hover highlight */
    }
    .copy-btn:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    /* Download Button */
    .big-button {
      justify-content: center;
      text-align: center;
      background: #007aff;
      color: white;
      text-decoration: none;
      border-radius: 10px;
      margin-top: 1rem;
      transition: background 0.2s ease-in-out;
    }
    .big-button:hover { text-decoration: none; }
    .big-button:active { background: #005fcc; }

    /* "Code copied!" text */
    #copiedText {
      color: #3cb371;
      visibility: hidden; /* Reserve space, but hide text */
      font-weight: bold;
      opacity: 0; /* Start invisible */
      transition: opacity 0.3s ease-in-out;
      margin-top: 0.5rem;
    }

    /* Error Text */
    .error-text {
      color: #ff6666;
      font-weight: bold;
      white-space: pre-line; /* For new line in error text */
      margin-top: 0.5rem;
    }

    /* Redeem Text */
    .redeem-text {
      font-size: 0.9rem;
      color: gray;
      margin-top: 0.5rem;
    }

    /* Footer Image */
    .footer-img {
      width: calc(100% - 40px); /* Add 20px on each side for "padding" */
      max-width: 600px;
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>$10 off your first Waymo One ride</h1>
    <h2>San Francisco territory only</h2>

    ${
      !activated
        ? `<p class="error-text">Code has been used up this month.\nTry again next month.</p>`
        : ""
    }
    ${copiedTextElement}

    <div id="codeBox" class="code-box ${!activated ? "error" : ""}">
      <input
        type="text"
        id="promoCode"
        value="${promoCode}"
        readonly
        style="border: none; background: none; width: 100%; font-size: 1.5rem;"
      />
      <button class="copy-btn" onclick="copyCode()" ${
        !activated ? "disabled" : ""
      }>📋</button>
    </div>

    <a href="${fullLink}" class="big-button">Download App</a>
    <p class="redeem-text">Redeem in Account > Offers & promotions > Redeem code</p>
  </div>

  <img src="/img/waymo-half-shot.png" alt="Waymo Car" class="footer-img" />

  <script>
    function copyCode() {
      const copiedText = document.getElementById("copiedText");
      const codeBox = document.getElementById("codeBox");

      // Copy text to clipboard
      navigator.clipboard.writeText(document.getElementById("promoCode").value).then(() => {
        // Make "Code copied!" text visible
        copiedText.style.visibility = "visible";

        // Force reflow to ensure the fade in is recognized across browsers
        copiedText.getBoundingClientRect();

        // Fade in
        copiedText.style.opacity = "1";
        codeBox.classList.add("copied");

        // After 3s, fade out
        setTimeout(() => {
          copiedText.style.opacity = "0";
          codeBox.classList.remove("copied");

          // Wait for fade-out transition to finish
          setTimeout(() => {
            copiedText.style.visibility = "hidden";
          }, 300);
        }, 3000);
      });
    }
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  },
};
