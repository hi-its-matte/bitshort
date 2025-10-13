   const API_URL = 'https://url-backend-7ues.onrender.com/shorten';
    
    const form = document.getElementById('shortenForm');
    const resultDiv = document.getElementById('result');
    const btnText = document.getElementById('btnText');
    const submitBtn = document.getElementById('submitBtn');

    function showResult(content, isError = false) {
      resultDiv.className = 'result show' + (isError ? ' error' : '');
      resultDiv.innerHTML = content;
    }

    async function copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        // Fallback per browser vecchi
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const longUrl = document.getElementById('longUrl').value.trim();
      const customAlias = document.getElementById('customAlias').value.trim();

      // Validazione URL
      try {
        new URL(longUrl);
      } catch {
        showResult('⚠️ URL non valido. Assicurati di includere https:// o http://', true);
        return;
      }

      // Loading state
      submitBtn.disabled = true;
      btnText.innerHTML = '<span class="loading-spinner"></span> Accorciamento...';
      resultDiv.className = 'result';
      resultDiv.innerHTML = '';

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            long: longUrl,
            short: customAlias || undefined
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Errore HTTP ${response.status}`);
        }

        // Successo
        const resultHTML = `
          <h3>✅ URL Accorciato con successo!</h3>
          <div class="short-url">
            <a href="${data.shortUrl}" target="_blank" id="shortUrlLink">${data.shortUrl}</a>
            <button class="copy-btn" onclick="handleCopy('${data.shortUrl}', this)">
              📋 Copia
            </button>
          </div>
          <div class="provider-badge">
            Provider: ${data.provider} (${data.domain})
          </div>
        `;
        
        showResult(resultHTML, false);

      } catch (error) {
        console.error('Errore:', error);
        
        let errorMessage = '❌ Errore durante l\'accorciamento';
        
        if (error.message.includes('Failed to fetch')) {
          errorMessage = '⚠️ Impossibile contattare il server. Il backend potrebbe essere in sleep (attendi 30 secondi e riprova).';
        } else if (error.message.includes('rate limit')) {
          errorMessage = '⏱️ Troppi tentativi. Attendi qualche minuto prima di riprovare.';
        } else if (error.message.includes('already')) {
          errorMessage = '⚠️ Questo alias personalizzato è già occupato. Prova un altro nome.';
        } else {
          errorMessage = `❌ ${error.message}`;
        }
        
        showResult(errorMessage, true);
      } finally {
        submitBtn.disabled = false;
        btnText.textContent = 'Accorcia';
      }
    });

    // Funzione globale per il copy
    window.handleCopy = async function(url, button) {
      const success = await copyToClipboard(url);
      
      if (success) {
        button.textContent = '✅ Copiato!';
        button.classList.add('copied');
        
        setTimeout(() => {
          button.textContent = '📋 Copia';
          button.classList.remove('copied');
        }, 2000);
      } else {
        button.textContent = '❌ Errore';
        setTimeout(() => {
          button.textContent = '📋 Copia';
        }, 2000);
      }
    };

    // Auto-focus sul campo URL
    document.getElementById('longUrl').focus();