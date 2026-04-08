// ── Estado global ──
let currentCV = null;
let originalCV = null;

// ── Cargar CV al inicio ──
async function loadCV() {
    try {
        const res = await fetch('../../data/cv.json');
        currentCV = await res.json();
        originalCV = JSON.parse(JSON.stringify(currentCV));
        renderJson(currentCV);
        document.getElementById('nav-version').textContent = currentCV.meta.version;
    } catch (e) {
        showToast('No se pudo cargar cv.json — comprueba la ruta', true);
    }
}

function renderJson(data) {
    const editor = document.getElementById('json-editor');
    editor.value = JSON.stringify(data, null, 2);
    document.getElementById('json-version').textContent = `v${data.meta?.version || '—'}`;
    validateJson();
}

function validateJson() {
    const el = document.getElementById('json-validity');
    try {
        JSON.parse(document.getElementById('json-editor').value);
        el.textContent = '✓ JSON válido';
        el.className = 'status-ok';
    } catch {
        el.textContent = '✗ JSON inválido';
        el.className = 'status-err';
    }
}

// ── Aplicar / descartar ──
async function applyJson() {
  try {
    const parsed = JSON.parse(document.getElementById('json-editor').value);

    const res = await fetch('https://portfolio-2026-rx73.onrender.com/api/save-cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed)
    });

    if (!res.ok) throw new Error('Error al guardar');

    currentCV = parsed;
    document.getElementById('nav-version').textContent = parsed.meta.version;
    showToast('cv.json guardado correctamente ✓');

  } catch (err) {
    showToast('Error al guardar: ' + err.message, true);
  }
}

function resetJson() {
    renderJson(currentCV);
    showToast('Cambios descartados');
}

function downloadJson(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cv.json';
    a.click();
}

// ── Chat ──
function addMessage(role, text, state = '') {
    const messages = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = `msg ${role} ${state}`;
    div.innerHTML = `
        <span class="msg-label">${role === 'user' ? 'tú' : 'ia'}</span>
        <div class="msg-bubble">${text}</div>
      `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
}

function addTyping() {
    const messages = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = 'msg assistant';
    div.id = 'typing-indicator';
    div.innerHTML = `
        <span class="msg-label">ia</span>
        <div class="typing"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
      `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
    document.getElementById('typing-indicator')?.remove();
}

function useSuggestion(btn) {
    const input = document.getElementById('user-input');
    input.value = btn.textContent;
    input.focus();
    autoResize(input);
}

function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

function autoResize(el) {
    el.style.height = '44px';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text || !currentCV) return;

    const btn = document.getElementById('send-btn');
    btn.disabled = true;
    input.value = '';
    input.style.height = '44px';

    addMessage('user', text);
    addTyping();

    const today = new Date().toISOString().split('T')[0];

    const systemPrompt = `Eres un asistente especializado en actualizar el CV de Javier Montes Villamarín.
Recibirás el JSON actual del CV y una instrucción en lenguaje natural.
Tu tarea es devolver ÚNICAMENTE el JSON actualizado, sin explicaciones, sin markdown, sin bloques de código.
Solo el JSON puro y válido.

Reglas:
- Mantén todos los campos existentes salvo los que el usuario pida cambiar.
- Cuando añadas experiencia o educación, genera un id único (exp-N, edu-N, proj-N).
- Actualiza siempre meta.lastUpdated a "${today}".
- Incrementa meta.version en 0.0.1 cada vez.
- Si el usuario pide algo ambiguo, interpreta la intención más razonable.
- El JSON debe ser válido y completo.`;

    const userPrompt = `CV actual:\n${JSON.stringify(currentCV, null, 2)}\n\nInstrucción: ${text}`;

    try {
        const res = await fetch('https://portfolio-2026-rx73.onrender.com/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 4000,
                system: systemPrompt,
                messages: [{ role: 'user', content: userPrompt }]
            })
        });

        const data = await res.json();
        removeTyping();

        if (data.error) throw new Error(data.error.message);

        const raw = data.content?.[0]?.text?.trim() || '';

        // Intentar parsear el JSON devuelto
        let updatedCV;
        try {
            updatedCV = JSON.parse(raw);
        } catch {
            // Si falla, buscar JSON dentro del texto
            const match = raw.match(/\{[\s\S]*\}/);
            if (match) updatedCV = JSON.parse(match[0]);
            else throw new Error('La IA no devolvió un JSON válido');
        }

        currentCV = updatedCV;
        renderJson(updatedCV);
        document.getElementById('nav-version').textContent = updatedCV.meta.version;

        addMessage('assistant', `✓ CV actualizado a <code>v${updatedCV.meta.version}</code>. Revisa el JSON a la derecha y pulsa <code>Aplicar cambios</code> para descargar el archivo.`, 'success');

    } catch (err) {
        removeTyping();
        addMessage('assistant', `Hubo un error: <code>${err.message}</code>. Inténtalo de nuevo.`, 'error');
    }

    btn.disabled = false;
    input.focus();
}

// ── Toast ──
function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.borderColor = isError ? 'var(--danger)' : 'var(--accent-dim)';
    toast.style.color = isError ? 'var(--danger)' : 'var(--accent)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

loadCV();