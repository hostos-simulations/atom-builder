document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('atomCanvas');
    const ctx = canvas.getContext('2d');
    const guessInput = document.getElementById('element-guess');

    const elements = [
        { name: "None", symbol: "-" },
        { name: "Hydrogen", symbol: "H" }, { name: "Helium", symbol: "He" },
        { name: "Lithium", symbol: "Li" }, { name: "Beryllium", symbol: "Be" },
        { name: "Boron", symbol: "B" }, { name: "Carbon", symbol: "C" },
        { name: "Nitrogen", symbol: "N" }, { name: "Oxygen", symbol: "O" },
        { name: "Fluorine", symbol: "F" }, { name: "Neon", symbol: "Ne" },
        { name: "Sodium", symbol: "Na" }, { name: "Magnesium", symbol: "Mg" },
        { name: "Aluminum", symbol: "Al" }, { name: "Silicon", symbol: "Si" },
        { name: "Phosphorus", symbol: "P" }, { name: "Sulfur", symbol: "S" },
        { name: "Chlorine", symbol: "Cl" }, { name: "Argon", symbol: "Ar" }
    ];

    let atom = { protons: 0, neutrons: 0, electrons: 0 };
    let animationFrameId;

    document.getElementById('add-proton').addEventListener('click', () => addParticle('protons'));
    document.getElementById('remove-proton').addEventListener('click', () => removeParticle('protons'));
    document.getElementById('add-neutron').addEventListener('click', () => addParticle('neutrons'));
    document.getElementById('remove-neutron').addEventListener('click', () => removeParticle('neutrons'));
    document.getElementById('add-electron').addEventListener('click', () => addParticle('electrons'));
    document.getElementById('remove-electron').addEventListener('click', () => removeParticle('electrons'));
    document.getElementById('reset-button').addEventListener('click', resetSimulation);
    document.getElementById('download-button').addEventListener('click', downloadAtomImage);

    function addParticle(type) { atom[type]++; update(); }
    function removeParticle(type) { if (atom[type] > 0) { atom[type]--; update(); } }
    
    function resetSimulation() {
        atom = { protons: 0, neutrons: 0, electrons: 0 };
        guessInput.value = "";
        update();
    }
    
    function downloadAtomImage() {
        const studentGuess = guessInput.value.trim() || "No_Guess";
        drawAtom(true); 
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 20px Montserrat';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`Element Guess: ${studentGuess}`, 20, 20);
        ctx.fillText(`Configuration: P:${atom.protons}, N:${atom.neutrons}, E:${atom.electrons}`, 20, 50);
        
        const safeStudentGuess = studentGuess.replace(/[^a-z0-9]/gi, '_');
        const filename = `${safeStudentGuess}_(P${atom.protons}-N${atom.neutrons}-E${atom.electrons}).png`;
        
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
        drawAtom(); 
    }

    function update() {
        updateInfo();
        drawAtom();
    }

    function updateInfo() {
        document.getElementById('proton-count').textContent = atom.protons;
        document.getElementById('neutron-count').textContent = atom.neutrons;
        document.getElementById('electron-count').textContent = atom.electrons;
        document.getElementById('mass-number').textContent = atom.protons + atom.neutrons;
    }

    function drawAtom(isStatic = false) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawOrbits(centerX, centerY);
        drawNucleus(centerX, centerY);
        drawElectrons(centerX, centerY, isStatic);
    }

    function drawNucleus(cx, cy) {
        const nucleonCount = atom.protons + atom.neutrons;
        if (nucleonCount === 0) return;

        let particlesToDraw = [];
        for (let i = 0; i < atom.protons; i++) particlesToDraw.push('proton');
        for (let i = 0; i < atom.neutrons; i++) particlesToDraw.push('neutron');

        // Shuffle for visual variety
        for (let i = particlesToDraw.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [particlesToDraw[i], particlesToDraw[j]] = [particlesToDraw[j], particlesToDraw[i]];
        }

        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const particleRadius = 12;
        const radiusScale = particleRadius * 0.9; // How tightly packed the spiral is

        for (let i = 0; i < nucleonCount; i++) {
            const type = particlesToDraw[i];
            const angle = i * goldenAngle;
            const radius = radiusScale * Math.sqrt(i);
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);

            ctx.beginPath();
            ctx.arc(x, y, particleRadius, 0, 2 * Math.PI);
            ctx.fillStyle = type === 'proton' ? '#ff6347' : '#6495ed';
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.5)";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(type === 'proton' ? '+' : 'N', x, y);
        }
    }
    
    function drawOrbits(cx, cy) {
        if (atom.electrons > 0) drawEllipse(cx, cy, 120, 100);
        if (atom.electrons > 2) drawEllipse(cx, cy, 220, 180);
        if (atom.electrons > 10) drawEllipse(cx, cy, 320, 260);
    }
    
    function drawEllipse(cx, cy, rx, ry) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, Math.PI * 0.75, 0, 2 * Math.PI);
        ctx.strokeStyle = '#87CEEB';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    function drawElectrons(cx, cy, isStatic = false) {
        let electronsToDraw = atom.electrons;
        const time = isStatic ? 0 : Date.now();
        
        if (electronsToDraw > 0) {
            const shellElectrons = Math.min(electronsToDraw, 2);
            for (let i = 0; i < shellElectrons; i++) {
                const angle = (i / shellElectrons) * 2 * Math.PI + time / 2000;
                drawSingleElectron(cx, cy, 120, 100, angle, 8);
            }
            electronsToDraw -= shellElectrons;
        }
        if (electronsToDraw > 0) {
            const shellElectrons = Math.min(electronsToDraw, 8);
            for (let i = 0; i < shellElectrons; i++) {
                 const angle = (i / shellElectrons) * 2 * Math.PI + time / 4000;
                 drawSingleElectron(cx, cy, 220, 180, angle, 8);
            }
            electronsToDraw -= shellElectrons;
        }
        if (electronsToDraw > 0) {
            const shellElectrons = Math.min(electronsToDraw, 8);
            for (let i = 0; i < shellElectrons; i++) {
                 const angle = (i / shellElectrons) * 2 * Math.PI + time / 6000;
                 drawSingleElectron(cx, cy, 320, 260, angle, 8);
            }
        }
    }
    
    function drawSingleElectron(cx, cy, rx, ry, angle, radius) {
        const orbitAngle = Math.PI * 0.75;
        const x0 = rx * Math.cos(angle);
        const y0 = ry * Math.sin(angle);
        const x = cx + x0 * Math.cos(orbitAngle) - y0 * Math.sin(orbitAngle);
        const y = cy + x0 * Math.sin(orbitAngle) + y0 * Math.cos(orbitAngle);

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffd700';
        ctx.fill();
        ctx.fillStyle = '#081424';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('-', x, y + 1);
    }

    function animate() {
        if(atom.electrons > 0) { drawAtom(); }
        animationFrameId = requestAnimationFrame(animate);
    }
    
    update();
    cancelAnimationFrame(animationFrameId);
    animate();
});