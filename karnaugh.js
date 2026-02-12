// ===== SISTEMA TOOLTIP =====
function mostraTooltip(elemento, messaggio, durata = 3000) {
    const overlay = document.getElementById('tooltipOverlay');
    if (!elemento) return Promise.resolve();
    
    const rect = elemento.getBoundingClientRect();
    overlay.innerHTML = `
        <div class="tooltip-spotlight" style="
            position: absolute;
            top: ${rect.top - 10}px; left: ${rect.left - 10}px;
            width: ${rect.width + 20}px; height: ${rect.height + 20}px;
        "></div>
        <div class="tooltip-message" style="
            position: absolute; top: ${rect.bottom + 20}px; left: ${Math.max(20, rect.left)}px;
        "><div class="tooltip-arrow"></div><div class="tooltip-text">${messaggio}</div></div>`;
    
    overlay.classList.add('active');
    return new Promise((resolve) => setTimeout(() => {
        overlay.classList.remove('active');
        setTimeout(() => { overlay.innerHTML = ''; resolve(); }, 300);
    }, durata));
}

// ===== STATO GLOBALE =====
let currentPhase = 1;
let score = 0;
let startTime = null;
let timerInterval = null;

// Dati esercizio
let truthTable = []; 
let minterms = []; 
let kmapState = Array(16).fill(0); 
let optimalGroups = []; 
let userGroups = []; 
let currentGroupIndex = 0;
let costData = { not: 0, and: 0, or: 0, total: 0 }; 

// ===== INIT =====
function iniziaEsercizio() {
    document.getElementById('introPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
    generaNuovoEsercizio();
    avviaTimer();
    logConsole("⚡ Esercizio iniziato! Analizza la tabella.", "success");
}

function nuovoEsercizio() {
    currentPhase = 1;
    kmapState = Array(16).fill(0);
    userGroups = [];
    currentGroupIndex = 0;
    
    const step9 = document.getElementById('step9');
    if (step9) step9.style.display = 'none';
    
    for (let i = 1; i <= 8; i++) {
        const step = document.getElementById(`step${i}`);
        if(step) {
            step.classList.remove('active', 'completed');
            step.classList.add('locked');
            const btn = document.getElementById(`btn${i}`);
            if (i > 1 && btn) btn.disabled = true;
            const fb = document.getElementById(`feedback${i}`);
            if(fb) { fb.innerHTML = ''; fb.className = 'feedback-msg'; }
            const inputs = step.querySelectorAll('input');
            inputs.forEach(inp => inp.value = '');
        }
    }
    document.getElementById('step1').classList.remove('locked');
    document.getElementById('step1').classList.add('active');
    
    document.getElementById('group-controls').innerHTML = '';
    document.getElementById('equations-input').innerHTML = '';
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('step-indicator').textContent = 'Fase 1 di 8';
    document.getElementById('btnNewExercise').style.display = 'none';
    
    generaNuovoEsercizio();
    logConsole("🔄 Nuovo esercizio generato!", "info");
}

function generaNuovoEsercizio() {
    const numMinterms = 3 + Math.floor(Math.random() * 6);
    const allIndices = Array.from({length: 16}, (_, i) => i);
    minterms = [];
    for (let i = 0; i < numMinterms; i++) {
        const randomIndex = Math.floor(Math.random() * allIndices.length);
        minterms.push(allIndices[randomIndex]);
        allIndices.splice(randomIndex, 1);
    }
    minterms.sort((a, b) => a - b);
    
    truthTable = [];
    for (let i = 0; i < 16; i++) {
        const binary = i.toString(2).padStart(4, '0');
        truthTable.push({
            abcd: binary,
            a: binary[0], b: binary[1], c: binary[2], d: binary[3],
            decimal: i, output: minterms.includes(i) ? 1 : 0
        });
    }
    
    renderTruthTable();
    renderKmap();
    optimalGroups = calcolaGruppiOttimali(minterms);
    calcolaCostoAtteso();
    logConsole(`📊 Generati ${numMinterms} mintermini`, "info");
}

function renderTruthTable() {
    const table = document.getElementById('truthTable');
    let html = `<div class="truth-row truth-header"><div class="truth-cell">A</div><div class="truth-cell">B</div><div class="truth-cell">C</div><div class="truth-cell">D</div><div class="truth-cell truth-output">U</div></div>`;
    truthTable.forEach((row, index) => {
        html += `<div class="truth-row ${row.output===1?'truth-one':''}" data-index="${index}">
            <div class="truth-cell">${row.a}</div><div class="truth-cell">${row.b}</div><div class="truth-cell">${row.c}</div><div class="truth-cell">${row.d}</div><div class="truth-cell truth-output">${row.output}</div></div>`;
    });
    table.innerHTML = html;
}

function renderKmap() {
    const wrapper = document.querySelector('.kmap-wrapper');
    if (!wrapper) return;
    const grayCode = ['00', '01', '11', '10'];
    let html = '<div class="kmap-labels-top"><div class="kmap-corner">AB\\CD</div>';
    grayCode.forEach(ab => html += `<div class="kmap-label">${ab}</div>`);
    html += '</div>';
    grayCode.forEach((cd, rowIndex) => {
        html += `<div class="kmap-grid-row"><div class="kmap-label-left">${cd}</div><div class="kmap-row-cells">`;
        grayCode.forEach((ab, colIndex) => {
            const decimal = grayToDecimal(ab, cd);
            const val = kmapState[decimal];
            html += `<div class="kmap-cell ${val?'filled':''}" data-decimal="${decimal}" onclick="toggleKmapCell(${decimal})">
                <span class="cell-value">${val}</span><span class="cell-decimal">${decimal}</span></div>`;
        });
        html += '</div></div>';
    });
    wrapper.innerHTML = html;
}

function grayToDecimal(ab, cd) {
    const map = {'00':0, '01':1, '11':3, '10':2};
    return map[ab]*4 + map[cd];
}

function toggleKmapCell(d) {
    if (currentPhase !== 3) return;
    kmapState[d] = kmapState[d] ? 0 : 1;
    renderKmap();
}

// ===== ALGORITMO ROBUSTO =====
function calcolaGruppiOttimali(minterms) {
    if (minterms.length === 0) return [];
    const allGroups = generaTuttiGruppiGeometrici();
    const validGroups = allGroups.filter(g => g.cells.every(c => minterms.includes(c)));
    const prime = validGroups.filter(g => {
        return !validGroups.some(other => other !== g && other.size > g.size && g.cells.every(c => other.cells.includes(c)));
    });
    return trovaCoperturaMinima(prime, minterms);
}

function generaTuttiGruppiGeometrici() {
    const groups = [];
    const sizes = [{h:1,w:1}, {h:1,w:2}, {h:2,w:1}, {h:1,w:4}, {h:4,w:1}, {h:2,w:2}, {h:2,w:4}, {h:4,w:2}, {h:4,w:4}];
    const visualToGray = [0, 1, 3, 2];
    for (let r=0; r<4; r++) {
        for (let c=0; c<4; c++) {
            sizes.forEach(size => {
                const cells = [];
                for (let h=0; h<size.h; h++) {
                    for (let w=0; w<size.w; w++) {
                        const decimal = (visualToGray[(c+w)%4]*4) + visualToGray[(r+h)%4];
                        cells.push(decimal);
                    }
                }
                cells.sort((a,b)=>a-b);
                if (!groups.some(g => g.cells.length === cells.length && g.cells.every((v,i) => v === cells[i]))) {
                    groups.push({size:cells.length, cells:cells, equation:cellaToEquazione(cells)});
                }
            });
        }
    }
    return groups;
}

function trovaCoperturaMinima(primes, minterms) {
    const covered = new Set();
    const result = [];
    const minSet = new Set(minterms);
    const counts = {}; minterms.forEach(m => counts[m] = 0);
    primes.forEach(p => p.cells.forEach(c => { if(minSet.has(c)) counts[c]++; }));
    
    const essentials = new Set();
    minterms.forEach(m => {
        if(counts[m] === 1) {
            const g = primes.find(g => g.cells.includes(m));
            if(g) essentials.add(g);
        }
    });
    essentials.forEach(g => { result.push(g); g.cells.forEach(c => covered.add(c)); });
    
    let remaining = primes.filter(g => !essentials.has(g));
    while(covered.size < minterms.length) {
        let best = null, maxUncovered = -1;
        remaining.forEach(g => {
            const count = g.cells.filter(c => minSet.has(c) && !covered.has(c)).length;
            if (count > maxUncovered) { maxUncovered = count; best = g; }
            else if (count === maxUncovered && count > 0 && g.size > best.size) best = g;
        });
        if(best && maxUncovered > 0) {
            result.push(best);
            best.cells.forEach(c => covered.add(c));
            remaining = remaining.filter(g => g !== best);
        } else break;
    }
    return result;
}

function cellaToEquazione(cells) {
    const bits = cells.map(c => c.toString(2).padStart(4,'0'));
    let eq = '';
    for(let i=0; i<4; i++) {
        const first = bits[0][i];
        if(bits.every(b => b[i] === first)) {
            eq += first === '1' ? ['A','B','C','D'][i] : ['A','B','C','D'][i] + "'";
        }
    }
    return eq || '1';
}

function calcolaCostoAtteso() {
    let notCost = 0, andCost = 0;
    const negatedVars = new Set();
    optimalGroups.forEach(g => {
        const eq = g.equation;
        for(let i=0; i<eq.length; i++) if(eq[i+1]==="'") negatedVars.add(eq[i]);
        const lits = eq.replace(/'/g, '').length;
        if(lits > 1) andCost += (lits - 1);
    });
    notCost = negatedVars.size;
    const orCost = optimalGroups.length > 1 ? (optimalGroups.length - 1) : 0;
    costData = { not: notCost, and: andCost, or: orCost, total: notCost + andCost + orCost };
}

// ===== VERIFICA FASI =====
function verificaFase(fase) {
    const fb = document.getElementById(`feedback${fase}`);
    fb.className = 'feedback-msg'; fb.innerHTML = '';
    let ok = false;

    if (fase === 1) {
        if(parseInt(document.getElementById('inp1').value) === minterms.length) {
            ok = true; fb.innerHTML = "✅ Corretto!"; fb.className += " success";
            minterms.forEach(m => document.querySelector(`[data-index="${m}"]`).classList.add('highlight-pulse'));
            score += 100;
        } else { fb.innerHTML = "❌ Errato."; fb.className += " error"; }
    }
    else if (fase === 2) {
        const n = document.getElementById('inp2').value.split(',').map(x=>parseInt(x.trim())).filter(x=>!isNaN(x)).sort((a,b)=>a-b);
        if(JSON.stringify(n) === JSON.stringify(minterms)) {
            ok = true; fb.innerHTML = "✅ Esatto!"; fb.className += " success"; score += 150;
        } else { fb.innerHTML = "❌ Errato."; fb.className += " error"; }
    }
    else if (fase === 3) {
        const u = kmapState.map((v,i)=>v?i:-1).filter(i=>i>=0).sort((a,b)=>a-b);
        if(JSON.stringify(u) === JSON.stringify(minterms)) {
            ok = true; fb.innerHTML = "✅ Mappa OK!"; fb.className += " success"; score += 200;
        } else { fb.innerHTML = "❌ Mappa errata."; fb.className += " error"; }
    }
    else if (fase === 4) {
        if(parseInt(document.getElementById('inp4').value) === optimalGroups.length) {
            ok = true; fb.innerHTML = "✅ Corretto!"; fb.className += " success"; score += 150; setupGroupDrawing();
        } else { fb.innerHTML = "❌ Errato."; fb.className += " error"; }
    }
    else if (fase === 5) {
        if(verificaRaggruppamenti()) {
            ok = true; fb.innerHTML = "✅ Gruppi OK!"; fb.className += " success"; score += 250; setupEquationsInput();
        } else { fb.innerHTML = "❌ Gruppi errati."; fb.className += " error"; }
    }
    else if (fase === 6) {
        if(verificaEquazioni()) {
            ok = true; fb.innerHTML = "✅ Equazioni OK!"; fb.className += " success"; score += 300;
        } else { fb.innerHTML = "❌ Errato."; fb.className += " error"; }
    }
    else if (fase === 7) {
        const raw = document.getElementById('inp7').value;
        const uSOP = normalizzaEquazione(raw);
        let valid = false;
        if(uSOP.includes("F")) {
            const matches = uSOP.match(/F\d+/g);
            if(matches) {
                const uF = [...new Set(matches)].sort();
                const eF = userGroups.map((_, i) => `F${i+1}`).sort();
                if(JSON.stringify(uF) === JSON.stringify(eF)) valid = true;
            }
        } else {
            const cSOP = generaSOPCorretta();
            const uT = uSOP.split('+').sort().filter(t=>t);
            const cT = cSOP.split('+').sort().filter(t=>t);
            if(uT.length===cT.length && uT.every(t=>cT.includes(t))) valid = true;
        }
        if(valid) {
            ok = true; fb.innerHTML = "✅ SOP Corretta!"; fb.className += " success"; score += 400;
        } else { fb.innerHTML = "❌ Errato. Usa F1+F2 o la formula esplicita."; fb.className += " error"; }
    }
    else if (fase === 8) {
        const n = parseInt(document.getElementById('inp8-not').value);
        const a = parseInt(document.getElementById('inp8-and').value);
        const o = parseInt(document.getElementById('inp8-or').value);
        const t = parseInt(document.getElementById('inp8-total').value);
        
        if(n===costData.not && a===costData.and && o===costData.or && t===costData.total) {
            ok = true; fb.innerHTML = "✅ Calcoli Perfetti!"; fb.className += " success"; score += 500;
            // Mostra circuito
            document.getElementById('step9').style.display = 'block';
            document.getElementById('finalEquationDisplay').textContent = "U = " + generaSOPCorretta();
            setTimeout(() => { drawAutomaticCircuit(); document.getElementById('step9').scrollIntoView({behavior:'smooth'}); mostraConfetti(); }, 500);
            document.getElementById('btnNewExercise').style.display = 'block';
        } else { fb.innerHTML = "❌ Errato."; fb.className += " error"; }
    }

    if(ok) {
        updateScore();
        if(fase < 8) setTimeout(() => avanzaFase(fase), 1000);
    }
}

// ===== UI HELPERS =====
function setupGroupDrawing() {
    const div = document.getElementById('group-controls');
    div.innerHTML = '';
    const colors = ['#ff6b6b', '#0fbb18', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8', '#130994', '#00b894'];
    userGroups = Array(optimalGroups.length).fill(null).map(()=>({cells:[]}));
    optimalGroups.forEach((g,i) => {
        const btn = document.createElement('button');
        btn.className = 'btn-group';
        btn.style.background = colors[i%colors.length];
        btn.textContent = `F${i+1}`;
        btn.onclick = () => setCurrentGroup(i, colors[i%colors.length]);
        div.appendChild(btn);
    });
    document.querySelectorAll('.kmap-cell').forEach(c => {
        c.style.cursor = 'pointer';
        c.onclick = () => { if(minterms.includes(parseInt(c.dataset.decimal))) toggleCellInGroup(parseInt(c.dataset.decimal)); };
    });
    setCurrentGroup(0, colors[0]);
}

function setCurrentGroup(i, color) {
    currentGroupIndex = i;
    document.querySelectorAll('.btn-group').forEach((b,idx) => b.style.opacity = idx===i?'1':'0.5');
}
function toggleCellInGroup(d) {
    const g = userGroups[currentGroupIndex];
    const idx = g.cells.indexOf(d);
    if(idx>=0) g.cells.splice(idx,1); else g.cells.push(d);
    updateGroupVisualization();
}
function updateGroupVisualization() {
    const colors = ['#ff6b6b', '#0fbb18', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8', '#130994', '#00b894'];
    document.querySelectorAll('.kmap-cell').forEach(c => { c.style.backgroundColor = ''; c.style.border = ''; });
    userGroups.forEach((g,i) => {
        const col = colors[i%colors.length];
        g.cells.forEach(d => {
            const c = document.querySelector(`[data-decimal="${d}"]`);
            if(c) { c.style.backgroundColor = col+'40'; c.style.border = `3px solid ${col}`; }
        });
    });
}
function verificaRaggruppamenti() {
    for(let g of userGroups) {
        if(![1,2,4,8].includes(g.cells.length)) return false;
        if(!g.cells.every(c=>minterms.includes(c))) return false;
    }
    const set = new Set(); userGroups.forEach(g=>g.cells.forEach(c=>set.add(c)));
    return set.size === minterms.length && userGroups.length === optimalGroups.length;
}

function setupEquationsInput() {
    const div = document.getElementById('equations-input');
    div.innerHTML = '';
    userGroups.forEach((g,i) => {
        const cells = [...g.cells].sort((a,b)=>a-b).join(', ');
        const row = document.createElement('div');
        row.className = 'equation-input-row';
        row.innerHTML = `<div style="display:flex; flex-direction:column; width:100%;">
            <label style="font-weight:bold; color:var(--accent);">F${i+1} <span style="font-size:0.8em; color:#999; font-weight:normal;">(Celle: ${cells})</span> = </label>
            <input type="text" id="eq${i}" placeholder="es: AB'C" style="width:100%; margin-top:5px;"></div>`;
        div.appendChild(row);
    });
}
function verificaEquazioni() {
    for(let i=0; i<userGroups.length; i++) {
        if(normalizzaEquazione(document.getElementById(`eq${i}`).value) !== cellaToEquazione(userGroups[i].cells)) return false;
    }
    return true;
}
function normalizzaEquazione(s) { return s.replace(/\s/g,'').toUpperCase().replace(/NOT/g,"'"); }
function generaSOPCorretta() { return userGroups.map(g=>cellaToEquazione(g.cells)).join('+'); }

function avanzaFase(fase) {
    document.getElementById(`step${fase}`).classList.remove('active');
    document.getElementById(`step${fase}`).classList.add('completed');
    const next = fase+1;
    const step = document.getElementById(`step${next}`);
    if(step) {
        step.classList.remove('locked');
        step.classList.add('active');
        const btn = document.getElementById(`btn${next}`);
        if(btn) btn.disabled = false;
        document.getElementById('progressBar').style.width = (next/8)*100+'%';
        document.getElementById('step-indicator').textContent = `Fase ${next} di 8`;
        step.scrollIntoView({behavior:'smooth', block:'center'});
    }
    currentPhase = next;
}
function updateScore() { document.getElementById('scoreVal').textContent = score; }
function avviaTimer() {
    startTime = Date.now();
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const e = Math.floor((Date.now()-startTime)/1000);
        document.getElementById('timerVal').textContent = `${Math.floor(e/60).toString().padStart(2,'0')}:${(e%60).toString().padStart(2,'0')}`;
    }, 1000);
}
function logConsole(t, type) {
    const c = document.getElementById("consoleBox");
    c.innerHTML += `<span style="color:${type==='success'?'#50fa7b':type==='error'?'#ff5555':'#8be9fd'}">> ${t}</span><br>`;
    c.scrollTop = c.scrollHeight;
}
function mostraConfetti() {
    const colors = ['#f00','#0f0','#00f','#ff0','#0ff'];
    for(let i=0;i<50;i++) {
        const d = document.createElement('div'); d.className='confetti';
        d.style.left=Math.random()*100+'vw'; d.style.background=colors[Math.floor(Math.random()*colors.length)];
        document.body.appendChild(d); setTimeout(()=>d.remove(),2000);
    }
}

// =========================================================
//  GENERATORE AUTOMATICO CIRCUITO (SVG) – VERSIONE CURVA
// =========================================================

function drawAutomaticCircuit() {
    const svg = document.getElementById("circuitSvg");
    if (!svg) return;
    svg.innerHTML = ""; // Pulisce il vecchio disegno

    // Dati di input
    const inputs = ["A", "B", "C", "D"];
    // Usa i gruppi ottimali se esistono, altrimenti array vuoto
    const groups = (typeof optimalGroups !== 'undefined') ? optimalGroups : [];

    // --- CONFIGURAZIONE DIMENSIONI ---
    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 500;
    
    // Posizioni X delle colonne
    const busXStart = 60;      // Dove iniziano le linee verticali degli input
    const busSpacing = 30;     // Spazio tra A, B, C, D
    const andGateX = 350;      // Dove stanno le porte AND
    const orGateX = 550;       // Dove sta la porta OR
    const outputX = width - 50;

    // --- 1. DISEGNO IL BUS DEGLI INPUT (Linee Verticali) ---
    // Mappa per salvare la coordinata X di ogni input: {'A': 60, 'B': 90...}
    const busCoords = {}; 

    inputs.forEach((inp, i) => {
        const x = busXStart + (i * busSpacing);
        busCoords[inp] = x;

        // Etichetta in alto
        createSvgText(svg, x, 30, inp, "svg-input-label", "middle");
        
        // Linea verticale lunga (il Bus)
        createSvgLine(svg, x, 40, x, height - 40, "#44475a", 2, 0.5);
    });

    // Se non ci sono gruppi, fermati qui
    if (groups.length === 0) return;

    // --- 2. CALCOLO POSIZIONI PORTE AND ---
    const numAnds = groups.length;
    // Calcoliamo lo spazio verticale per centrare le porte
    const availableH = height - 100;
    const stepY = availableH / (numAnds + 1);
    
    // Array per salvare le uscite delle AND per collegarle poi alla OR
    const andOutputs = [];

    groups.forEach((g, idx) => {
        // Coordinata Y centrale di questa porta AND
        const gateY = 50 + stepY * (idx + 1);
        
        // Analisi dell'equazione (es. "AB'C")
        // Parsiamo la stringa per trovare quali letterali servono
        const eq = g.equation; 
        const literals = [];
        
        // Regex semplice per catturare Lettera ed eventuale apostrofo
        // Es: A, B', C -> matches: ["A", "B'", "C"]
        const regex = /([A-D])('?)/g; 
        let match;
        while ((match = regex.exec(eq)) !== null) {
            literals.push({
                char: match[1],      // Es: "A"
                isNot: match[2] === "'" // true se c'è l'apostrofo
            });
        }

        const numInputs = literals.length;

        // Disegna la porta AND (solo se ci sono ingressi, altrimenti è un caso degenere)
        // Se c'è solo 1 letterale, tecnicamente non serve una AND, ma per coerenza la disegniamo o facciamo un buffer
        // Qui assumiamo logica standard SOP: disegniamo AND
        drawSvgGate(svg, "AND", andGateX, gateY, 1);

        // --- 3. COLLEGAMENTI INPUT -> AND ---
        literals.forEach((lit, litIndex) => {
            const busX = busCoords[lit.char];
            
            // Calcolo offset del pin di ingresso sulla porta AND
            // Distribuisce i pin verticalmente sul retro della porta
            // Es: se sono 3 input, li mette a -10, 0, +10 rispetto al centro
            const pinSpacing = 10;
            const pinOffsetY = ((litIndex - (numInputs - 1) / 2) * pinSpacing);
            
            const targetX = andGateX - 24; // Ingresso porta AND (graficamente a sx del centro)
            const targetY = gateY + pinOffsetY;

            // Disegna il filo curvo
            // Aggiungiamo un "pallino" sul bus per indicare la connessione
            createSvgCircle(svg, busX, targetY, 3, "#8be9fd"); // Pallino sul bus (opzionale: busX, busY o busX, targetY per stile ortogonale)
            // Nota: per stile pulito, facciamo partire la curva dall'altezza del targetY sul bus, 
            // ma mettiamo il pallino di giunzione sul bus. 
            // Correzione: Il pallino va sull'incrocio (busX, targetY) non è corretto se il bus è una linea continua.
            // Facciamo partire il filo da (busX, targetY) assumendo che il segnale viaggi sul bus verticale.
            
            // Disegna connessione: Bus -> Curva -> Pin
            drawBezierWire(svg, busX, targetY, targetX, targetY, "#8be9fd");

            // --- GESTIONE NOT (Negazione) ---
            if (lit.isNot) {
                // Disegna un piccolo cerchietto di negazione subito prima della porta
                createSvgCircle(svg, targetX - 5, targetY, 4, "#ff5555", "none", 1.5);
                // Oppure una piccola linea barrata. Il cerchio è standard.
            }
        });

        // Salviamo l'uscita di questa AND
        andOutputs.push({ x: andGateX + 24, y: gateY });
    });

    // --- 4. PORTA OR FINALE (o Buffer se c'è solo 1 gruppo) ---
    const orY = height / 2; // La OR sta sempre al centro verticale
    
    if (numAnds > 1) {
        drawSvgGate(svg, "OR", orGateX, orY, 1.2);

        // Collega tutte le AND alla OR
        andOutputs.forEach((out, i) => {
            // Distribuisci gli ingressi sulla OR
            const pinSpacing = 8;
            const pinOffsetY = ((i - (numAnds - 1) / 2) * pinSpacing);
            
            const targetX = orGateX - 24;
            const targetY = orY + pinOffsetY;

            drawBezierWire(svg, out.x, out.y, targetX, targetY, "#50fa7b");
        });

        // Uscita finale
        createSvgLine(svg, orGateX + 30, orY, outputX, orY, "#ff5555", 3);
        createSvgText(svg, outputX + 10, orY + 5, "U", "svg-output-label", "start");

    } else if (numAnds === 1) {
        // Se c'è solo un gruppo, l'uscita della AND è l'uscita finale
        const singleOut = andOutputs[0];
        drawBezierWire(svg, singleOut.x, singleOut.y, outputX, singleOut.y, "#ff5555");
        createSvgText(svg, outputX + 10, singleOut.y + 5, "U", "svg-output-label", "start");
    }
}


// =========================================================
//  FUNZIONI HELPER SVG (Aggiornate per le curve)
// =========================================================

/**
 * Disegna un filo curvo (Bezier cubica) tra due punti
 */
function drawBezierWire(svg, x1, y1, x2, y2, color) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    
    // Logica per la curvatura:
    // Creiamo due punti di controllo (cp1, cp2) per fare una "S"
    // cp1 tira orizzontalmente a destra da x1
    // cp2 tira orizzontalmente a sinistra da x2
    const dist = Math.abs(x2 - x1) * 0.6; // Tensione della curva
    
    const cp1x = x1 + dist;
    const cp1y = y1;
    const cp2x = x2 - dist;
    const cp2y = y2;

    const d = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
    
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("class", "svg-wire"); // Per animazioni CSS se presenti
    
    svg.appendChild(path);
}

function createSvgLine(svg, x1, y1, x2, y2, color, w, opacity = 1) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "line");
    el.setAttribute("x1", x1);
    el.setAttribute("y1", y1);
    el.setAttribute("x2", x2);
    el.setAttribute("y2", y2);
    el.setAttribute("stroke", color);
    el.setAttribute("stroke-width", w);
    el.setAttribute("opacity", opacity);
    svg.appendChild(el);
}

function createSvgCircle(svg, cx, cy, r, fill, stroke = "none", strokeW = 0) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    el.setAttribute("cx", cx);
    el.setAttribute("cy", cy);
    el.setAttribute("r", r);
    el.setAttribute("fill", fill);
    if (stroke !== "none") {
        el.setAttribute("stroke", stroke);
        el.setAttribute("stroke-width", strokeW);
    }
    svg.appendChild(el);
}

function createSvgText(svg, x, y, text, cls, anch) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "text");
    el.setAttribute("x", x);
    el.setAttribute("y", y);
    el.setAttribute("class", cls);
    if (anch) el.setAttribute("text-anchor", anch);
    el.textContent = text;
    svg.appendChild(el);
}

function drawSvgGate(svg, type, x, y, scale) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", `translate(${x}, ${y}) scale(${scale})`);

    let d = "";
    let cls = "";

    // NOT Gate (corpo triangolare)
    if (type === "NOT") {
        d = "M -12,-12 L 18,0 L -12,12 Z";
        cls = "svg-gate-not";
        // Cerchietto uscita NOT
        createSvgCircle(g, 24, 0, 5, "var(--editor-bg)", "var(--warning)", 2);
    }

    // AND Gate
    if (type === "AND") {
        // Forma a D
        d = "M -24,-20 L 10,-20 A 20,20 0 0,1 10,20 L -24,20 Z";
        cls = "svg-gate-and";
    }

    // OR Gate
    if (type === "OR") {
        // Forma a scudo curvo
        d = "M -24,-24 Q 10,-24 30,0 Q 10,24 -24,24 Q -10,0 -24,-24";
        cls = "svg-gate-or";
    }

    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", d);
    // Assicurati che nel CSS esistano queste classi o usa colori inline fallback
    p.setAttribute("class", `svg-gate-body ${cls}`);
    p.setAttribute("stroke", "#bd93f9"); // Fallback color
    p.setAttribute("fill", "#282a36");   // Fallback color
    p.setAttribute("stroke-width", "2");
    
    g.appendChild(p);
    svg.appendChild(g);
}