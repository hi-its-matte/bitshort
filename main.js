document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("shortenForm");
  const longUrlInput = document.getElementById("longUrl");
  const customShortInput = document.getElementById("customShort");
  const resultDiv = document.getElementById("result");
  const errorMsg = document.getElementById("error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const longUrl = longUrlInput.value.trim();
    const customShort = customShortInput.value.trim();

    // Validazione URL
    if (!longUrl) {
      errorMsg.textContent = "Inserisci un URL valido!";
      errorMsg.style.display = "block";
      return;
    }

    // Validazione formato URL
    try {
      new URL(longUrl);
    } catch {
      errorMsg.textContent = "⚠️ L'URL inserito non è valido!";
      errorMsg.style.display = "block";
      return;
    }

    // Reset messaggi
    errorMsg.textContent = "";
    errorMsg.style.display = "none";
    resultDiv.style.display = "block";
    resultDiv.innerHTML = "⏳ Accorciamento in corso...";

    try {
      const res = await fetch("https://url-backend-7ues.onrender.com/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          long: longUrl,
          short: customShort || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        // Gestione errori specifici dal server
        throw new Error(data.error || `Errore server: ${res.status}`);
      }

      if (data.short) {
        const fullShortUrl = `https://${data.short}`;
        resultDiv.innerHTML = `
          ✅ <strong>URL accorciato:</strong><br>
          <a href="${fullShortUrl}" target="_blank" rel="noopener noreferrer">${fullShortUrl}</a>
          <button onclick="navigator.clipboard.writeText('${fullShortUrl}')" style="margin-left: 10px;">
            📋 Copia
          </button>
        `;
      } else {
        throw new Error("Risposta non valida dal server");
      }
    } catch (err) {
      resultDiv.style.display = "none";
      errorMsg.style.display = "block";
      errorMsg.textContent = "⚠️ Errore: " + err.message;
    }
  });
});