import type { ChaiModelCardPayload, ChaiPublicUser } from "@/lib/chai/constants";
import { CHAI_ORBDOC_ORGANIZATION } from "@/lib/chai/constants";

/** Base templates (orbdoc org + orbdoc- slugs); use `applyOrgModeToCard` for aidoc. */
export interface ChaiCardTemplate {
  id: string;
  /** Default title when mode is orbdoc */
  orgTitle: string;
  user: ChaiPublicUser;
  organization: { name: string; slug: string };
  model_card: ChaiModelCardPayload;
}

const emptyMetricBlock = {
  metric_goal: "",
  results: [] as unknown[],
  interpretation: "",
  test_type: "",
  testing_data_description: "",
  validation_process_and_justification: "",
};

export const orbdocHeartCard: ChaiCardTemplate = {
  id: "heart",
  orgTitle: "orbdoc",
  organization: CHAI_ORBDOC_ORGANIZATION,
  user: {
    full_name: "Dr. Sarah Chen",
    email: "sarah.chen@orbdoc.com",
    role: "ML Engineer",
  },
  model_card: {
    slug: "orbdoc-heart-disease-predictor-v1",
    model_name: "Heart Disease Predictor v1",
    model_developer: "orbdoc",
    developer_contact: "sarah.chen@orbdoc.com",
    release_stage: "beta",
    release_date: "2026-03-15",
    release_version: "1.0.0",
    global_availability: "yes",
    regulatory_approval: "",
    summary:
      "A risk prediction model for cardiovascular disease using EHR data. " +
      "Outputs a 0–100 risk score to support clinical decision-making.",
    keywords: ["cardiovascular", "risk prediction", "EHR", "clinical decision support"],
    intended_use_and_workflow:
      "Used in clinical decision support to flag high-risk patients for " +
      "follow-up. Integrates with Epic and Cerner EHRs.",
    primary_intended_users: "Clinicians, care coordinators",
    how_to_use:
      "Upload patient demographics and lab results via API or EHR " +
      "integration. Review risk score and recommended actions in the " +
      "dashboard.",
    targeted_patient_population:
      "Adults 18+ with at least one cardiovascular risk factor",
    cautioned_out_of_scope_settings:
      "Not for pediatric use. Not validated for emergency or acute care settings.",
    known_risks_and_limitations:
      "May underperform on rare conditions. Performance not validated on " +
      "non-English-speaking populations.",
    known_biases_or_ethical_considerations:
      "Trained on US data; may have bias toward majority populations. " +
      "Ongoing fairness monitoring.",
    clinical_risk_level: "medium",
    outcomes_and_outputs: "Risk score (0–100), recommended follow-up actions",
    model_type: "classification",
    foundation_models: "",
    input_data_source: "EHR data (demographics, labs, vitals)",
    output_and_input_data_types: "Structured clinical data, numeric risk score",
    development_data_characterization:
      "Retrospective dataset from 50 US health systems, 2018–2024",
    bias_mitigation_approaches: "Reweighting, stratified evaluation",
    ongoing_maintenance: "Quarterly model updates and monitoring",
    security: "Data encrypted at rest and in transit. SOC 2 Type II.",
    transparency: "Model card and evaluation reports publicly available.",
    funding_source: "Internal R&D",
    third_party_information: "",
    stakeholders_consulted:
      "Cardiologists, primary care physicians, patient advocates",
    evaluation_references: "",
    clinical_trial: "",
    peer_reviewed_publications: "DOI:10.1234/orbdoc.2026.001",
    reimbursement_status: "",
    patient_consent_or_disclosure: "Obtained per institutional IRB",
    bibliography:
      "Chen et al. (2026). Cardiovascular Risk Prediction in Clinical " +
      "Practice. Journal of Clinical AI.",
    ehr_compatibility: ["Epic", "Cerner"],
    regulatory_compliance: "",
    key_metrics: {
      usefulness: {
        metric_goal: "AUC-ROC ≥ 0.85",
        results: [
          { label: "AUC-ROC", value: { kind: "single", value: 0.89 } },
          {
            label: "Sensitivity",
            value: { kind: "single", value: 0.82, unit: "%" },
          },
        ],
        interpretation: "Meets target. Strong discriminative performance.",
        test_type: "Retrospective",
        testing_data_description: "Holdout set from 10 health systems",
        validation_process_and_justification:
          "5-fold cross-validation, external validation",
      },
      fairness: {
        metric_goal: "Demographic parity within 5%",
        results: [],
        interpretation: "",
        test_type: "",
        testing_data_description: "",
        validation_process_and_justification: "",
      },
      safety: {
        metric_goal: "No critical failures in safety audit",
        results: [],
        interpretation: "",
        test_type: "",
        testing_data_description: "",
        validation_process_and_justification: "",
      },
    },
  },
};

export const orbdocRadiologyCard: ChaiCardTemplate = {
  id: "radiology",
  orgTitle: "orbdoc",
  organization: CHAI_ORBDOC_ORGANIZATION,
  user: {
    full_name: "James Okonkwo",
    email: "j.okonkwo@orbdoc.com",
    role: "Clinical AI Lead",
  },
  model_card: {
    slug: "orbdoc-chest-xray-pneumonia-v2",
    model_name: "Chest X-Ray Pneumonia Detector v2",
    model_developer: "orbdoc",
    developer_contact: "j.okonkwo@orbdoc.com",
    release_stage: "production",
    release_date: "2026-01-10",
    release_version: "2.0.0",
    global_availability: "yes",
    regulatory_approval: "FDA 510(k) cleared",
    summary:
      "Deep learning model for detecting pneumonia from chest X-rays. " +
      "Assists radiologists by flagging suspicious regions and providing " +
      "confidence scores.",
    keywords: ["pneumonia", "chest X-ray", "radiology", "object detection", "DICOM"],
    intended_use_and_workflow:
      "Radiologist decision support. Model highlights regions of interest; " +
      "final diagnosis remains with the clinician.",
    primary_intended_users: "Radiologists, pulmonologists",
    how_to_use:
      "Upload DICOM or JPEG chest X-ray. Model returns bounding boxes and " +
      "confidence scores. Integrates with PACS via FHIR.",
    targeted_patient_population:
      "Adults and pediatric patients presenting with respiratory symptoms",
    cautioned_out_of_scope_settings:
      "Not for lateral or oblique views. Not validated for portable or bedside X-rays.",
    known_risks_and_limitations:
      "Sensitivity lower on pediatric cases. Requires high-quality " +
      "anterior-posterior or posterior-anterior views.",
    known_biases_or_ethical_considerations:
      "Training data skewed toward certain demographics. Active bias audits in place.",
    clinical_risk_level: "high",
    outcomes_and_outputs:
      "Bounding boxes, confidence scores, suggested differential diagnoses",
    model_type: "object_detection",
    foundation_models: "",
    input_data_source: "Chest X-ray images (DICOM, JPEG)",
    output_and_input_data_types:
      "Image input, structured JSON output with coordinates and scores",
    development_data_characterization:
      "Multi-site retrospective dataset, 200k+ images, 2019–2025",
    bias_mitigation_approaches:
      "Stratified sampling, subgroup analysis, continuous monitoring",
    ongoing_maintenance: "Monthly performance reviews, annual retraining",
    security: "HIPAA compliant. Images processed in secure cloud.",
    transparency: "Technical documentation and bias reports available.",
    funding_source: "NIH grant, venture funding",
    third_party_information: "",
    stakeholders_consulted:
      "Radiologists, FDA consultants, patient advisory board",
    evaluation_references: "",
    clinical_trial: "NCT12345678",
    peer_reviewed_publications:
      "DOI:10.5678/orbdoc.2026.002, DOI:10.5678/orbdoc.2025.015",
    reimbursement_status: "CPT code under review",
    patient_consent_or_disclosure: "De-identified data; consent waived per IRB",
    bibliography:
      "Okonkwo et al. (2026). Deep Learning for Pneumonia Detection. Radiology AI.",
    ehr_compatibility: ["Epic", "Cerner", "athenahealth"],
    regulatory_compliance: "CA AB 2013",
    key_metrics: {
      usefulness: {
        metric_goal: "Sensitivity ≥ 90%, Specificity ≥ 85%",
        results: [
          {
            label: "Sensitivity",
            value: { kind: "single", value: 0.91, unit: "%" },
          },
          {
            label: "Specificity",
            value: { kind: "single", value: 0.87, unit: "%" },
          },
          { label: "mAP", value: { kind: "single", value: 0.78 } },
        ],
        interpretation: "Meets clinical targets. mAP improved in v2.",
        test_type: "Prospective",
        testing_data_description: "Multi-site prospective cohort, 5k images",
        validation_process_and_justification:
          "External validation at 3 sites",
      },
      fairness: {
        metric_goal: "Performance parity across demographic subgroups",
        results: [
          {
            label: "Subgroup AUC range",
            value: { kind: "single", value: "0.84–0.88" },
          },
        ],
        interpretation: "Within acceptable range.",
        test_type: "Stratified analysis",
        testing_data_description: "Stratified by age, sex, race/ethnicity",
        validation_process_and_justification: "Fairness audit per FDA guidance",
      },
      safety: {
        metric_goal: "Zero critical failures in 10k-case safety study",
        results: [
          {
            label: "Critical failures",
            value: { kind: "single", value: 0 },
          },
        ],
        interpretation: "No critical failures observed.",
        test_type: "Safety audit",
        testing_data_description: "10k-case retrospective safety review",
        validation_process_and_justification: "Independent safety review board",
      },
    },
  },
};

export const orbdocTriageCard: ChaiCardTemplate = {
  id: "triage",
  orgTitle: "orbdoc",
  organization: CHAI_ORBDOC_ORGANIZATION,
  user: {
    full_name: "Alex Rivera",
    email: "a.rivera@orbdoc.com",
    role: "Product & Safety Lead",
  },
  model_card: {
    slug: "orbdoc-ed-triage-priority-v1",
    model_name: "ED Triage Priority Assistant v1",
    model_developer: "orbdoc",
    developer_contact: "a.rivera@orbdoc.com",
    release_stage: "pilot",
    release_date: "2026-02-01",
    release_version: "0.9.0",
    global_availability: "limited",
    regulatory_approval: "",
    summary:
      "NLP-assisted triage prioritization using chief complaint and vitals " +
      "to suggest ESI-aligned urgency for ED workflows.",
    keywords: ["triage", "emergency department", "ESI", "NLP"],
    intended_use_and_workflow:
      "Supports nurses during intake; does not replace clinical judgment or " +
      "formal ESI assignment.",
    primary_intended_users: "ED nurses, charge nurses",
    how_to_use:
      "Enter chief complaint text and vitals; review suggested priority band and rationale.",
    targeted_patient_population: "Adult ED patients",
    cautioned_out_of_scope_settings: "Not for pediatric EDs or trauma activation protocols.",
    known_risks_and_limitations:
      "May mis-rank rare presentations. Requires local calibration.",
    known_biases_or_ethical_considerations:
      "Monitored for language and demographic bias; human-in-the-loop required.",
    clinical_risk_level: "medium",
    outcomes_and_outputs: "Suggested triage band, short rationale snippet",
    model_type: "nlp_classification",
    foundation_models: "",
    input_data_source: "Chief complaint free text, structured vitals",
    output_and_input_data_types: "Text and numeric inputs; structured triage output",
    development_data_characterization: "Multi-hospital ED visits, de-identified, 2022–2025",
    bias_mitigation_approaches: "Subgroup dashboards, threshold tuning per site",
    ongoing_maintenance: "Biweekly drift checks",
    security: "PHI-minimized pipeline; BAA with hosting provider",
    transparency: "Internal model card and incident review process",
    funding_source: "orbdoc internal pilot budget",
    third_party_information: "",
    stakeholders_consulted: "ED nursing leadership, hospital compliance",
    evaluation_references: "",
    clinical_trial: "",
    peer_reviewed_publications: "",
    reimbursement_status: "",
    patient_consent_or_disclosure:
      "Use governed by site policies and IRB where applicable",
    bibliography: "",
    ehr_compatibility: ["Epic", "Cerner"],
    regulatory_compliance: "",
    key_metrics: {
      usefulness: emptyMetricBlock,
      fairness: emptyMetricBlock,
      safety: emptyMetricBlock,
    },
  },
};
