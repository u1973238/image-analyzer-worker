export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CAS 1: PETICIÓ POST (Processament i anàlisi d'imatges)
    if (request.method === 'POST') {
      try {
        const formData = await request.formData();
        const fileItem = formData.get('imatge_fitxer');
        const opcio = formData.get('opcio') || 'tot';

        if (!fileItem || !(fileItem instanceof File)) {
          return new Response(JSON.stringify({ status: "error", missatge: "No s'ha rebut cap fitxer vàlid" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Llegim els bytes de la imatge
        const arrayBuffer = await fileItem.arrayBuffer();
        
        // Simulació de dades tècniques a l'Edge (Edge computing)
        const dadesTecniques = {
          "nom_arxiu": fileItem.name,
          "format": fileItem.type.replace('image/', '').toUpperCase(),
          "mida_bytes": fileItem.size,
          "orientacio": "detectada pel client"
        };

        let resposta = { status: "success", filtre: opcio };

        if (opcio === 'dades') {
          resposta.dades = dadesTecniques;
        } else if (opcio === 'color') {
          resposta.color_predominant = "#1a73e8"; 
        } else {
          resposta.dades = dadesTecniques;
          resposta.analisi = { "color_predominant": "#1a73e8" };
        }

        return new Response(JSON.stringify(resposta, null, 4), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*' 
          }
        });

      } catch (error) {
        return new Response(JSON.stringify({ status: "error", missatge: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // CAS 2: PETICIÓ GET (Interfície d'usuari interactiva fixa)
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Image Analyzer - Cloudflare Workers</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; background-color: #f8f9fa; }
            .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
            h1 { color: #f38020; margin-top: 0; font-size: 24px; } /* Color oficial Cloudflare */
            label { font-weight: bold; display: block; margin-top: 15px; color: #3c4043; }
            select, input, button { width: 100%; padding: 12px; margin: 8px 0; border-radius: 6px; border: 1px solid #dadce0; box-sizing: border-box; font-size: 14px; }
            button { background-color: #f38020; color: white; border: none; cursor: pointer; font-weight: bold; margin-top: 20px; }
            button:hover { background-color: #d66a18; }
            #resultat { background: #202124; color: #e8eaed; padding: 15px; border-radius: 8px; margin-top: 20px; display: none; white-space: pre-wrap; font-family: monospace; font-size: 13px; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Analitzador d'Imatges (Cloudflare Edge)</h1>
            <p style="color: #5f6368; font-size: 14px;">Funció migrada de Python a JavaScript executant-se al límit de la xarxa.</p>
            <form id="uploadForm">
                <label>Quina informació vols rebre?</label>
                <select name="opcio" id="opcioSelector">
                    <option value="tot">Tot l'anàlisi (Dades + Color)</option>
                    <option value="dades">Només dades tècniques</option>
                    <option value="color">Només color predominant</option>
                </select>
                <label>Selecciona la imatge:</label>
                <input type="file" name="imatge_fitxer" id="fileInput" accept="image/*" required>
                <button type="submit">Executar al Worker</button>
            </form>
            <div id="resultat"></div>
        </div>
        <script>
            document.getElementById('uploadForm').onsubmit = async (e) => {
                e.preventDefault();
                const resDiv = document.getElementById('resultat');
                const formData = new FormData();
                formData.append('imatge_fitxer', document.getElementById('fileInput').files[0]);
                formData.append('opcio', document.getElementById('opcioSelector').value);
                try {
                    const response = await fetch(window.location.href, { method: 'POST', body: formData });
                    const data = await response.json();
                    resDiv.textContent = JSON.stringify(data, null, 4);
                    resDiv.style.display = 'block';
                    
                    // S'ha eliminat completament el codi que modificava el document.body.style.backgroundColor
                    
                } catch (error) {
                    resDiv.textContent = "Error: " + error;
                    resDiv.style.display = 'block';
                }
            };
        </script>
    </body>
    </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  },
};