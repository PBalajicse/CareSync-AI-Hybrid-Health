/**
 * CareSync AI - 108 Ambulance & Hospital ICU Dispatch Controller
 */
document.addEventListener("DOMContentLoaded", () => {
    const hospitalGrid = document.getElementById("hospitalGrid");
    const dispPatientName = document.getElementById("dispPatientName");
    const dispAgeGroup = document.getElementById("dispAgeGroup");
    const dispType = document.getElementById("dispType");
    const triggerDispatchBtn = document.getElementById("triggerDispatchBtn");
    const ticketListContainer = document.getElementById("ticketListContainer");

    // 1. Load Nearby Hospital ICU Bed Readiness from Java Backend
    async function loadHospitals() {
        try {
            const res = await fetch("/api/dispatch/hospitals");
            if (!res.ok) throw new Error("Hospital API error");
            const hospitals = await res.json();

            let html = "";
            hospitals.forEach((h) => {
                html += `
                    <div class="hospital-card">
                        <div class="hosp-top">
                            <span style="font-size:11px; color:#38bdf8; font-weight:700;">SPECIALTY: ${h.specialty}</span>
                            <span class="bed-badge">● ${h.icuBedsAvailable} ICU BEDS READY</span>
                        </div>
                        <div class="hosp-name">${h.hospital}</div>
                        <div class="hosp-meta">Distance: ${h.distanceKm} km • Status: ${h.status}</div>
                    </div>`;
            });
            hospitalGrid.innerHTML = html;
        } catch (e) {
            hospitalGrid.innerHTML = `<div class="hospital-card"><p style="color:#fbbf24; font-size:13px;">Offline Mode: Call 108 directly for immediate ambulance dispatch.</p></div>`;
        }
    }

    // 2. Trigger Smart Ambulance Dispatch & Pre-Arrival Hospital Alert
    triggerDispatchBtn.addEventListener("click", async () => {
        const patientName = dispPatientName.value.trim() || "Emergency Patient";
        const payload = {
            patientName: patientName,
            ageGroup: dispAgeGroup.value,
            emergencyType: dispType.value
        };

        triggerDispatchBtn.disabled = true;
        triggerDispatchBtn.textContent = "🚨 Dispatching Ambulance & Notifying Hospital...";

        try {
            const res = await fetch("/api/dispatch/trigger", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const ticket = await res.json();
                alert(`DISPATCH CONFIRMED!\nTicket: ${ticket.ticketCode}\nAssigned: ${ticket.assignedHospital}\nAmbulance ETA: ${ticket.estimatedArrivalMin} mins`);
                await loadDispatchTickets();
            }
        } catch (err) {
            alert("Offline Alert: Please dial 108 immediately!");
        }

        triggerDispatchBtn.disabled = false;
        triggerDispatchBtn.textContent = "🚑 Dispatch Ambulance & Notify Hospital";
    });

    // 3. Load Active Dispatch Tickets from Spring Boot JPA
    async function loadDispatchTickets() {
        try {
            const res = await fetch("/api/dispatch/tickets");
            if (!res.ok) throw new Error("Tickets fetch error");
            const tickets = await res.json();

            if (tickets.length === 0) {
                ticketListContainer.innerHTML = `<p style="font-size:13px; color:#94a3b8;">No active emergency dispatches yet.</p>`;
                return;
            }

            let html = "";
            tickets.forEach((t) => {
                html += `
                    <div class="ticket-card">
                        <div class="ticket-top">
                            <span>🚨 ${t.ticketCode} • ETA: ${t.estimatedArrivalMin} MINS</span>
                            <span>${t.ageGroup}</span>
                        </div>
                        <div class="ticket-hosp">${t.assignedHospital}</div>
                        <div class="ticket-meta">Patient: ${t.patientName} • Condition: ${t.emergencyType}</div>
                        <div style="font-size:11px; color:#34d399; margin-top:4px;">Status: ${t.dispatchStatus}</div>
                    </div>`;
            });
            ticketListContainer.innerHTML = html;
        } catch (e) {
            ticketListContainer.innerHTML = `<p style="font-size:13px; color:#f87171;">Unable to load dispatch tickets.</p>`;
        }
    }

    loadHospitals();
    loadDispatchTickets();
});
