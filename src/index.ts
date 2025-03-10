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

    // Only show "Code copied!" element if no error
    // We’ll reserve space for it so elements don't jump.
    const copiedTextMarkup = activated
      ? `<p id="copiedText" class="hidden">Code copied!</p>`
      : "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Waymo Promo</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css">
  <style>
    /* Override Water.css margin to ensure true centering */
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100%;
      height: 100%;
    }
    body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center; /* center horizontally & vertically */
      overflow: hidden; /* no scrolling */
      position: relative; /* for the bottom image */
      background-color: #1a1a1a; /* optional darker background for contrast */
    }

    .container {
      /* Force container to center on large screens */
      text-align: center !important;
      max-width: 600px;
      width: 90%;
      margin: 0 auto !important;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* Titles */
    h1 { margin-bottom: 0.3rem; }
    h2 { margin-top: 0.1rem; }

    /* Code box & Download button */
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

    /* Error & Copied states */
    .error {
      background-color: rgba(255, 50, 50, 0.2);
      border: 2px solid darkred;
    }
    .copied {
      background-color: rgba(50, 205, 50, 0.2);
      border: 2px solid darkgreen !important;
    }

    /* Copy button */
    .copy-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.5rem;
      outline: none;
      user-select: none; /* prevent selection highlight */
    }
    .copy-btn:focus, .copy-btn:hover {
      outline: none;
      background: none; /* remove hover highlight */
    }
    .copy-btn:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    /* Download App button */
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

    /* "Code copied!" text transitions */
    #copiedText {
      color: #3cb371;
      font-weight: bold;
      margin-top: 0.5rem;
      height: 1.5rem; /* reserve space to avoid jump */
      transition: opacity 0.3s ease-in-out;
    }
    .hidden {
      visibility: hidden;
      opacity: 0;
    }
    .show {
      visibility: visible;
      opacity: 1;
    }

    /* Error text */
    .error-text {
      color: #ff6666;
      font-weight: bold;
      white-space: pre-line; /* for new line in error text */
      margin-top: 0.5rem;
    }

    /* Redeem text */
    .redeem-text {
      font-size: 0.9rem;
      color: gray;
      margin-top: 0.5rem;
    }

    /* Footer image with horizontal "padding" */
    .footer-img {
      width: calc(100% - 40px); /* add 20px space on each side */
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
    ${copiedTextMarkup}

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
      const promoInput = document.getElementById("promoCode");

      if (!copiedText || !promoInput) return; // if error or not activated

      // Copy text to clipboard
      navigator.clipboard.writeText(promoInput.value).then(() => {
        // Make sure the element is hidden -> then show it
        copiedText.classList.remove("hidden");
        void copiedText.offsetWidth; // force reflow for Safari
        copiedText.classList.add("show");

        codeBox.classList.add("copied");

        setTimeout(() => {
          // Fade out
          copiedText.classList.remove("show");
          codeBox.classList.remove("copied");
          setTimeout(() => {
            copiedText.classList.add("hidden");
          }, 300); // wait for fade-out transition
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
