/**
 * CareSync AI - Live Outbreak Radar & Dynamic Disease Surveillance Controller
 */
document.addEventListener("DOMContentLoaded", () => {
    const outbreakAlertBanner = document.getElementById("outbreakAlertBanner");
    const zoneListContainer = document.getElementById("zoneListContainer");
    const cntFever = document.getElementById("cntFever");
    const cntDehydration = document.getElementById("cntDehydration");
    const cntBurn = document.getElementById("cntBurn");
    const refreshRadarBtn = document.getElementById("refreshRadarBtn");
    const canvas = document.getElementById("outbreakRadarCanvas");
    const ctx = canvas.getContext("2d");

    let sweepAngle = 0;
    let hotspots = [
        { x: 130, y: 120, risk: "HIGH", label: "Zone A (Fever)" },
        { x: 250, y: 210, risk: "MODERATE", label: "Zone B (ORS)" },
        { x: 165, y: 270, risk: "LOW", label: "Zone C (Trauma)" }
    ];

    // 1. Fetch Live Outbreak Surveillance Data from Spring Boot
    async function loadOutbreakTelemetry() {
        try {
            const res = await fetch("/api/outbreak/radar");
            if (!res.ok) throw new Error("Radar API error");
            const data = await res.json();

            outbreakAlertBanner.textContent = `📡 [${data.outbreakAlertLevel}] ${data.advisoryMessage} (Total Monitored Logs: ${data.totalMonitoredCases})`;
            if (data.outbreakAlertLevel === "HIGH_CLUSTER_WARNING") {
                outbreakAlertBanner.style.borderColor = "#ef4444";
                outbreakAlertBanner.style.color = "#fca5a5";
                outbreakAlertBanner.style.background = "rgba(239, 68, 68, 0.16)";
            }

            const clusters = data.symptomClusters || {};
            cntFever.textContent = clusters.viralFeverCluster ?? 0;
            cntDehydration.textContent = clusters.dehydrationCluster ?? 0;
            cntBurn.textContent = clusters.burnTraumaCluster ?? 0;

            let zoneHtml = "";
            (data.zoneHeatData || []).forEach((z, idx) => {
                if (hotspots[idx]) {
                    hotspots[idx].risk = z.risk;
                    hotspots[idx].label = `${z.zone} (${z.cases})`;
                }
                const badgeColor = z.risk === "HIGH" ? "#f87171" : (z.risk === "MODERATE" ? "#fbbf24" : "#34d399");
                zoneHtml += `
                    <div class="zone-card ${z.risk}">
                        <div>
                            <div style="font-size:14px; font-weight:700; color:#fff;">${z.zone}</div>
                            <div style="font-size:12px; color:#94a3b8;">Active Reported Cases: ${z.cases}</div>
                        </div>
                        <span style="color:${badgeColor}; font-weight:800; font-size:12px;">● ${z.risk} RISK</span>
                    </div>`;
            });
            zoneListContainer.innerHTML = zoneHtml;
        } catch (err) {
            outbreakAlertBanner.textContent = "⚡ OFFLINE SURVEILLANCE MODE: Displaying local cached regional heatmap.";
        }
    }

    // 2. Live Animated Bio-Surveillance Radar Sweep Loop
    function animateRadar() {
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const maxR = 165;

        ctx.fillStyle = "#040812";
        ctx.fillRect(0, 0, w, h);

        // Concentric Radar Rings
        ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
        ctx.lineWidth = 1;
        [55, 110, 165].forEach((r) => {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(cx - maxR, cy);
        ctx.lineTo(cx + maxR, cy);
        ctx.moveTo(cx, cy - maxR);
        ctx.lineTo(cx, cy + maxR);
        ctx.stroke();

        // Rotating Radar Sweep Beam
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(sweepAngle);
        const grad = ctx.createLinearGradient(0, 0, maxR, 0);
        grad.addColorStop(0, "rgba(16, 185, 129, 0.35)");
        grad.addColorStop(1, "rgba(6, 182, 212, 0.02)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, maxR, -0.25, 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Draw Dynamic Disease Hotspots
        hotspots.forEach((spot) => {
            const pulse = 6 + Math.sin(sweepAngle * 4) * 2.5;
            ctx.fillStyle = spot.risk === "HIGH" ? "#ef4444" : (spot.risk === "MODERATE" ? "#f59e0b" : "#10b981");
            ctx.beginPath();
            ctx.arc(spot.x, spot.y, pulse, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#e2e8f0";
            ctx.font = "11px sans-serif";
            ctx.fillText(spot.label, spot.x - 32, spot.y - 12);
        });

        sweepAngle += 0.025;
        requestAnimationFrame(animateRadar);
    }

    refreshRadarBtn.addEventListener("click", loadOutbreakTelemetry);

    loadOutbreakTelemetry();
    animateRadar();
});
