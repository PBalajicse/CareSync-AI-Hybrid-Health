/**
 * CareSync AI - Family Health Vault & Google FHIR Interoperability Controller
 */
document.addEventListener("DOMContentLoaded", () => {
    const memberNameInput = document.getElementById("memberName");
    const memberRelationSelect = document.getElementById("memberRelation");
    const memberBloodSelect = document.getElementById("memberBlood");
    const memberAgeInput = document.getElementById("memberAge");
    const memberWeightInput = document.getElementById("memberWeight");
    const chronicNotesInput = document.getElementById("chronicNotes");
    const saveMemberBtn = document.getElementById("saveMemberBtn");

    const memberListContainer = document.getElementById("memberListContainer");
    const carePlanBox = document.getElementById("carePlanBox");
    const carePlanTitle = document.getElementById("carePlanTitle");
    const carePlanChecklist = document.getElementById("carePlanChecklist");

    const loadFhirBtn = document.getElementById("loadFhirBtn");
    const fhirViewerBox = document.getElementById("fhirViewerBox");

    // 1. Save Family Member Profile to Spring Boot JPA
    saveMemberBtn.addEventListener("click", async () => {
        const fullName = memberNameInput.value.trim();
        if (!fullName) {
            alert("Please enter family member's name.");
            return;
        }

        const payload = {
            fullName: fullName,
            relation: memberRelationSelect.value,
            bloodGroup: memberBloodSelect.value,
            age: parseInt(memberAgeInput.value, 10) || 25,
            weightKg: parseFloat(memberWeightInput.value) || 50.0,
            chronicNotes: chronicNotesInput.value.trim() || "None"
        };

        saveMemberBtn.disabled = true;
        saveMemberBtn.textContent = "⏳ Saving to Enterprise Vault...";

        try {
            const res = await fetch("/api/family/members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                memberNameInput.value = "";
                chronicNotesInput.value = "";
                await loadFamilyMembers();
            } else {
                alert("Failed to save profile. Check server connection.");
            }
        } catch (err) {
            alert("Offline mode: Connect to network to sync new family profiles.");
        }

        saveMemberBtn.disabled = false;
        saveMemberBtn.textContent = "💾 Save to Enterprise Family Vault";
    });

    // 2. Fetch & Render Saved Family Members
    async function loadFamilyMembers() {
        try {
            const res = await fetch("/api/family/members");
            if (!res.ok) throw new Error("Fetch error");
            const members = await res.json();

            if (members.length === 0) {
                memberListContainer.innerHTML = `<p style="font-size:13px; color:#94a3b8;">No family profiles saved yet. Add one on the left!</p>`;
                return;
            }

            let html = "";
            members.forEach((m) => {
                html += `
                    <div class="member-card" data-id="${m.id}">
                        <div class="member-top">
                            <span style="font-size:11px; color:#38bdf8; font-weight:700;">${m.relation}</span>
                            <span class="blood-tag">${m.bloodGroup}</span>
                        </div>
                        <div class="member-name">${m.fullName}</div>
                        <div class="member-sub">Age: ${m.age} yrs • Weight: ${m.weightKg} kg</div>
                        <div class="member-sub" style="color:#fbbf24; margin-top:4px;">Notes: ${m.chronicNotes}</div>
                    </div>`;
            });
            memberListContainer.innerHTML = html;

            // Attach click event for Java Personalized Care Plan
            document.querySelectorAll(".member-card").forEach((card) => {
                card.addEventListener("click", () => fetchCarePlan(card.dataset.id));
            });
        } catch (e) {
            memberListContainer.innerHTML = `<p style="font-size:13px; color:#f87171;">Unable to load profiles.</p>`;
        }
    }

    // 3. Fetch Personalized Java Care Plan for Selected Member
    async function fetchCarePlan(memberId) {
        carePlanBox.style.display = "block";
        carePlanTitle.textContent = "⏳ Loading Personalized Java Clinical Care Plan...";
        carePlanChecklist.innerHTML = "";

        try {
            const res = await fetch(`/api/family/care-plan/${memberId}`);
            if (!res.ok) throw new Error("Care plan error");
            const plan = await res.json();

            carePlanTitle.textContent = `✔ ${plan.careCategory} • ${plan.memberName} (Blood: ${plan.bloodGroup})`;
            let listHtml = "";
            (plan.emergencyChecklist || []).forEach((item) => {
                listHtml += `<li>${item}</li>`;
            });
            carePlanChecklist.innerHTML = listHtml;
        } catch (e) {
            carePlanTitle.textContent = "Unable to generate care plan.";
        }
    }

    // 4. Load Latest Record in Google Cloud Healthcare FHIR-Lite JSON Format
    loadFhirBtn.addEventListener("click", async () => {
        fhirViewerBox.textContent = "Fetching clinical records and transforming to Google FHIR-Lite JSON...";
        try {
            const historyRes = await fetch("/api/health/history");
            const logs = await historyRes.json();

            if (!logs || logs.length === 0) {
                fhirViewerBox.textContent = "No triage records found yet. Run a check on the 'Emergency Triage AI' page first!";
                return;
            }

            const latestId = logs[0].id;
            const fhirRes = await fetch(`/api/health/google-fhir/${latestId}`);
            const fhirBundle = await fhirRes.json();
            fhirViewerBox.textContent = JSON.stringify(fhirBundle, null, 2);
        } catch (e) {
            fhirViewerBox.textContent = "Error loading Google FHIR Clinical Bundle.";
        }
    });

    loadFamilyMembers();
});
