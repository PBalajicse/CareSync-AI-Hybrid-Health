package caressyncbackend.service;


import caressyncbackend.enums.AgeGroup;
import org.springframework.stereotype.Service;

@Service
public class DrugInteractionService {

    public String evaluateDrugAndAllergySafety(AgeGroup group, Integer age, String knownAllergy, String symptomQuery) {
        String allergy = (knownAllergy != null) ? knownAllergy.trim().toUpperCase() : "NONE";
        String symptom = (symptomQuery != null) ? symptomQuery.toLowerCase() : "";
        int safeAge = (age != null) ? age : 25;

        StringBuilder alert = new StringBuilder();

        // 1. Pediatric Aspirin Contraindication (Reye's Syndrome Prevention)
        if (group == AgeGroup.CHILD || safeAge < 16) {
            alert.append("CRITICAL PEDIATRIC RULE: Strictly AVOID Aspirin (risk of Reye's syndrome in children). ");
        }

        // 2. Known Allergy Screening
        if (!allergy.equals("NONE") && !allergy.isEmpty()) {
            switch (allergy) {
                case "IBUPROFEN":
                case "NSAID":
                    alert.append("ALLERGY ALERT (NSAID/Ibuprofen): Contraindicated! Do NOT give Ibuprofen, Mefenamic acid, or Diclofenac. ");
                    break;
                case "PENICILLIN":
                case "AMOXICILLIN":
                    alert.append("ALLERGY ALERT (Penicillin): Avoid Amoxicillin/Ampicillin antibiotics; notify doctor for macrolide alternatives. ");
                    break;
                case "PARACETAMOL":
                case "ACETAMINOPHEN":
                    alert.append("ALLERGY ALERT (Paracetamol): Contraindicated! Use physical cooling (lukewarm sponge) & seek immediate physician guidance. ");
                    break;
                case "SULFA":
                    alert.append("ALLERGY ALERT (Sulfa Drugs): Avoid Sulfamethoxazole/Cotrimoxazole medications. ");
                    break;
                default:
                    alert.append("ALLERGY ALERT (").append(allergy).append("): Verify all medicine labels before administration. ");
            }
        }

        // 3. Symptom-Specific Contraindication Rules
        if ((symptom.contains("dehydrat") || symptom.contains("vomit")) && !allergy.equals("IBUPROFEN")) {
            alert.append("RENAL SAFETY: Avoid Ibuprofen/NSAIDs during dehydration or vomiting (risk of kidney strain).");
        } else if (group == AgeGroup.SENIOR) {
            alert.append("GERIATRIC SAFETY: Avoid sedating antihistamines or high-dose NSAIDs without doctor approval.");
        }

        return alert.length() > 0
                ? alert.toString().trim()
                : "SAFE PROFILE: No known drug/allergy contraindications detected for standard first-aid.";
    }
}
