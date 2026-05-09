<template>
  <div class="diagnostics-page">
    <!-- Gate: no quiz result -->
    <div v-if="!hasQuiz" class="quiz-gate">
      <span class="material-symbols-outlined gate-icon">biotech</span>
      <h2>{{ t('diagnostics.completeQuizFirst') }}</h2>
      <p>{{ t('diagnostics.noQuiz') }}<br>{{ t('diagnostics.takeQuizContinue') }}</p>
      <button class="primary-btn" @click="$router.push('/quiz')">{{ t('diagnostics.doQuiz') }}</button>
    </div>

    <template v-else>

    <section class="diagnostics-hero" :style="{ backgroundImage: `url(${diagnosticoBannerImg})` }">
      <div class="diagnostics-hero-bg-overlay"></div>
      <div class="container diagnostics-hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">SKIN DIAGNOSTICS</p>
          <h1>Refine your skin profile before booking care</h1>
          <p class="hero-text">
            Your quiz already created an initial skin profile. Now you can add more symptoms,
            upload reference photos, review your analysis and book the right dermatologist.
          </p>

          <div class="hero-actions">
            <button class="primary-btn" @click="scrollToSection('detailsSection')">
              {{ t('diagnostics.continueDiagnosis') }}
            </button>
            <button class="ghost-btn" @click="goToAppointmentBooking">
              {{ t('diagnostics.bookAppt') }}
            </button>
          </div>
        </div>

        <div class="hero-card">
          <div class="status-row">
            <span class="result-badge">{{ caseStatus }}</span>
            <span class="progress-pill">{{ completionProgress }}% complete</span>
          </div>

          <h3>Case Snapshot</h3>

          <div class="summary-list">
            <div class="summary-item">
            <span class="label">{{ t('diagnostics.skinType') }}</span>
              <strong>{{ formattedSkinType }}</strong>
            </div>
            <div class="summary-item">
            <span class="label">{{ t('diagnostics.sensitivity') }}</span>
              <strong>{{ formattedSensitivity }}</strong>
            </div>
            <div class="summary-item">
            <span class="label">{{ t('diagnostics.priorityConcern') }}</span>
              <strong>{{ mainConcern }}</strong>
            </div>
            <div class="summary-item">
            <span class="label">{{ t('diagnostics.suggestedConsultation') }}</span>
              <strong>{{ suggestedAppointmentType }}</strong>
            </div>
          </div>

          <p class="hero-card-note">
            PharmaDerm Diagnostics is a guided skincare tool and does not replace a dermatologist's diagnosis.
          </p>
        </div>
      </div>
    </section>

    <section class="section-light">
      <div class="container">
        <div class="section-heading center">
          <p class="eyebrow section-eyebrow">YOUR PROGRESS</p>
          <h2>{{ t('diagnostics.progressTitle') }}</h2>
          <p>Your experience is organized step by step so it feels guided and premium.</p>
        </div>

        <div class="timeline-grid">
          <div class="timeline-step" :class="{ completed: quizCompleted }">
            <div class="timeline-icon">{{ quizCompleted ? '✓' : '1' }}</div>
            <h4>Quiz completed</h4>
            <p>Your initial skin profile was generated from the quiz.</p>
          </div>

          <div class="timeline-step" :class="{ completed: detailsCompleted }">
            <div class="timeline-icon">{{ detailsCompleted ? '✓' : '2' }}</div>
            <h4>Diagnostics completed</h4>
            <p>Add more symptoms, priorities and case details.</p>
          </div>

          <div class="timeline-step">
            <div class="timeline-icon" style="cursor:pointer" @click="goToAppointmentBooking">3</div>
            <h4>{{ t('diagnostics.bookAppt') }}</h4>
            <p>{{ t('diagnostics.chooseSpecialist') }}</p>
          </div>

          <div class="timeline-step">
            <div class="timeline-icon" style="cursor:pointer" @click="$router.push('/citas')">4</div>
            <h4>{{ t('footer.myAppointments') }}</h4>
            <p>Review the history of your booked appointments.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section-white">
      <div class="container">
        <div class="section-heading center">
          <p class="eyebrow section-eyebrow">QUIZ OVERVIEW</p>
          <h2>{{ t('diagnostics.initialProfile') }}</h2>
          <p>These values were brought in from your quiz and are now the base for diagnostics.</p>
        </div>

        <div class="quiz-summary-grid">
          <div class="summary-card">
            <h4>Skin Type</h4>
            <p>{{ formattedSkinType }}</p>
          </div>

          <div class="summary-card">
            <h4>Sensitivity</h4>
            <p>{{ formattedSensitivity }}</p>
          </div>

          <div class="summary-card">
            <h4>{{ t('diagnostics.mainConcern') }}</h4>
            <p>{{ mainConcern }}</p>
          </div>

          <div class="summary-card">
            <h4>Routine Focus</h4>
            <p>{{ quizSummary.routineFocus || 'Barrier support and personalized care' }}</p>
          </div>
        </div>

        <div class="case-overview-grid">
          <div v-if="casePhoto" class="selfie-card">
            <h3>Quiz Reference Selfie</h3>
            <img :src="casePhoto" alt="Quiz selfie" class="case-photo-preview" />
          </div>

          <div class="metrics-card">
            <h3>Quiz Analysis Metrics</h3>

            <div v-if="quizMetrics.length" class="metric-list">
              <div
                v-for="metric in quizMetrics"
                :key="metric.key || metric.label"
                class="metric-item"
              >
                <div class="metric-head">
                  <span>{{ metric.label }}</span>
                  <strong>{{ Number(metric.score).toFixed(1) }}/10</strong>
                </div>
                <div class="metric-bar">
                  <div
                    class="metric-fill"
                    :style="{ width: ((metric.score / 10) * 100) + '%' }"
                  ></div>
                </div>
              </div>
            </div>

            <p v-else class="muted-text">
              Quiz metrics will appear here once they are generated and saved from the quiz.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="section-light" ref="detailsSection">
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow section-eyebrow">STEP 1</p>
          <h2>Tell us more about your skin today</h2>
          <p>Add details the quiz did not fully capture so your case feels more complete.</p>
        </div>

        <div class="details-layout">
          <div class="form-card">
            <label class="field-label">Describe what you are experiencing</label>
            <textarea
              v-model="form.description"
              rows="6"
              placeholder="Example: I have small bumps on my cheeks, visible pores around the nose, some redness and occasional tightness after cleansing."
            ></textarea>

            <div class="form-grid two">
              <div>
                <label class="field-label">How long has this been happening?</label>
                <select v-model="form.duration">
                  <option value="">Select an option</option>
                  <option>Just recently</option>
                  <option>1-2 weeks</option>
                  <option>1 month</option>
                  <option>Several months</option>
                  <option>More than a year</option>
                </select>
              </div>

              <div>
                <label class="field-label">How urgent does it feel?</label>
                <select v-model="form.urgency">
                  <option value="">Select urgency</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>

            <label class="field-label">Symptoms</label>
            <div class="chips-grid">
              <button
                v-for="symptom in symptomsOptions"
                :key="symptom"
                type="button"
                class="chip"
                :class="{ active: form.symptoms.includes(symptom) }"
                @click="toggleSymptom(symptom)"
              >
                {{ symptom }}
              </button>
            </div>

            <label class="field-label">Affected areas</label>
            <div class="chips-grid">
              <button
                v-for="area in areaOptions"
                :key="area"
                type="button"
                class="chip"
                :class="{ active: form.areas.includes(area) }"
                @click="toggleArea(area)"
              >
                {{ area }}
              </button>
            </div>

            <label class="field-label">Top priorities</label>
            <div class="chips-grid">
              <button
                v-for="priority in priorityOptions"
                :key="priority"
                type="button"
                class="chip"
                :class="{ active: form.priorities.includes(priority) }"
                @click="togglePriority(priority)"
              >
                {{ priority }}
              </button>
            </div>

            <div class="form-grid two">
              <div>
                <label class="field-label">Current routine complexity</label>
                <select v-model="form.routineLevel">
                  <option value="">Select an option</option>
                  <option>Very simple</option>
                  <option>Basic</option>
                  <option>Moderate</option>
                  <option>Complex</option>
                </select>
              </div>

              <div>
                <label class="field-label">Have you seen a dermatologist before?</label>
                <select v-model="form.previousConsult">
                  <option value="">Select an option</option>
                  <option>No</option>
                  <option>Yes, recently</option>
                  <option>Yes, a while ago</option>
                </select>
              </div>
            </div>
          </div>

          <div class="insight-card">
            <h3>Smart Diagnostic Insight</h3>
            <p class="insight-copy">
              Based on your quiz result and added information, your current case appears to be:
            </p>

            <div class="insight-box">
              <strong>{{ generatedInsight.title }}</strong>
              <p>{{ generatedInsight.text }}</p>
            </div>

            <div class="mini-points">
              <div>
                <span>Suggested next step</span>
                <strong>{{ generatedInsight.nextStep }}</strong>
              </div>
              <div>
                <span>Best appointment type</span>
                <strong>{{ suggestedAppointmentType }}</strong>
              </div>
              <div>
                <span>Care priority</span>
                <strong>{{ generatedInsight.priority }}</strong>
              </div>
            </div>

            <button class="primary-btn full" @click="saveDiagnosticCase" :disabled="isSavingDiagnostic || diagnosticSaved">
              {{ isSavingDiagnostic ? 'Saving...' : diagnosticSaved ? 'Diagnostic Saved' : 'Save my diagnostic case' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="section-white">
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow section-eyebrow">STEP 2</p>
          <h2>Add more reference photos</h2>
          <p>These images help provide more visual context before the appointment.</p>
        </div>

        <div class="upload-card">
          <label class="upload-zone">
            <input type="file" accept="image/*" multiple @change="handleImages" hidden />
            <span class="material-symbols-outlined upload-icon">add_photo_alternate</span>
            <strong>Upload additional skin photos</strong>
            <small>Front view, side view, or close-up of the affected area</small>
          </label>

          <div v-if="imagePreviews.length" class="preview-grid">
            <div v-for="(image, index) in imagePreviews" :key="index" class="preview-item">
              <img :src="image" alt="Uploaded preview" />
              <button type="button" class="preview-remove" @click="removeImage(index)">×</button>
            </div>
          </div>

          <div class="upload-actions">
            <button class="primary-btn" @click="saveStep2Photos" :disabled="isSavingPhotos || !imagePreviews.length">
              {{ isSavingPhotos ? 'Saving photos...' : 'Save photos' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="section-light">
      <div class="container">
        <div class="section-heading center">
          <p class="eyebrow section-eyebrow">TEMPORARY CARE DIRECTION</p>
          <h2>Your pre-consultation routine focus</h2>
          <p>This is a transitional recommendation based on the quiz and your current diagnostic details.</p>
        </div>

        <div class="routine-grid">
          <div class="routine-card">
            <h3>Morning Routine</h3>
            <ul>
              <li v-for="(item, index) in recommendedRoutine.morning" :key="'m' + index">
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="routine-card">
            <h3>Night Routine</h3>
            <ul>
              <li v-for="(item, index) in recommendedRoutine.night" :key="'n' + index">
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="routine-card">
            <h3>Prioritize</h3>
            <ul>
              <li v-for="(item, index) in recommendedRoutine.prioritize" :key="'p' + index">
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="routine-card">
            <h3>Avoid For Now</h3>
            <ul>
              <li v-for="(item, index) in recommendedRoutine.avoid" :key="'a' + index">
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section-white">
      <div class="container" style="text-align:center;padding:3rem 1rem;">
        <p class="eyebrow section-eyebrow">NEXT STEP</p>
        <h2 style="margin-bottom:0.75rem">Ready to book your consultation?</h2>
        <p style="color:#64748b;margin-bottom:1.5rem">
          Save your diagnostic and then choose a specialist for your appointment.
        </p>
        <button class="primary-btn" @click="goToAppointmentBooking">
          {{ t('diagnostics.bookWithSpecialist') }}
        </button>
      </div>
    </section>

    <section class="section-white disclaimer-section">
      <div class="container">
        <div class="disclaimer-box">
          <h3>Important notice</h3>
          <p>
            PharmaDerm Diagnostics offers guided skincare insights based on quiz responses,
            image references and user-reported symptoms. It does not replace diagnosis,
            treatment or medical advice from a licensed dermatologist.
          </p>
        </div>
      </div>
    </section>

    <section class="final-cta">
      <div class="container final-cta-inner">
        <div>
          <p class="eyebrow light">PHARMADERM CARE</p>
          <h2>Care designed around your skin profile</h2>
          <p>
            Build your case, connect with specialists and refine your skincare experience.
          </p>
        </div>

        <button class="light-btn" @click="$router.push('/routine')">{{ t('diagnostics.viewRoutine') }}</button>
      </div>
    </section>

    </template><!-- end v-else -->

    <!-- Toast notification (FASE 9) -->
    <transition name="fade">
      <div v-if="toastMsg" class="diag-toast">{{ toastMsg }}</div>
    </transition>
  </div>
</template>

<script>
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { getCurrentUserIdentity } from '../lib/currentUser.js';
import { apiFetch } from '../services/apiClient.js';
import { useHistoryStore } from '../stores/useHistoryStore.js';
import { useAuthStore } from '../stores/useAuthStore.js';
import { getProductsByQuizResult } from '../data/productCatalog.js';
import routineService from '../services/routineService.js';
import { useI18n } from '../lib/i18n.js';
import diagnosticoBannerImg from '../assets/fondo/diagnostico.jpg';
import { withTimeout } from '../utils/async.js';

const DIAGNOSIS_PHOTO_BUCKET = 'diagnosis-photos';

export default {
  name: "DiagnosticsView",
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      diagnosticoBannerImg,
      imagePreviews: [],
      tempPhotos: [],
      casePhoto: "",
      quizSummary: {
        completed: false,
        age: null,
        skinType: "",
        sensitivity: "",
        sensitivityLevel: 1,
        concerns: [],
        routineFocus: "",
        primaryConcern: "",
        summaryMetrics: [],
        fullMetrics: [],
        photoMeta: {},
        hasSelfie: false,
        selfie: "",
        routineSteps: []
      },
      form: {
        description: "",
        duration: "",
        urgency: "",
        symptoms: [],
        areas: [],
        priorities: [],
        routineLevel: "",
        previousConsult: "",
      },
      symptomsOptions: [
        "Redness",
        "Itching",
        "Dry patches",
        "Flaking",
        "Acne",
        "Burning sensation",
        "Oiliness",
        "Tightness",
        "Texture",
        "Dark spots"
      ],
      areaOptions: [
        "Forehead",
        "Cheeks",
        "Nose",
        "Chin",
        "Jawline",
        "Around eyes",
        "Neck",
        "Back",
        "Chest"
      ],
      priorityOptions: [
        "Acne control",
        "Barrier repair",
        "Hydration",
        "Texture smoothing",
        "Dark spots",
        "Sensitivity",
        "Pore appearance",
        "Redness relief"
      ],
      toastMsg: '',
      _toastTimer: null,
      diagnosticSaved: false,
      isSavingDiagnostic: false,
      latestDiagnosisId: null,
      isSavingPhotos: false,
    };
  },

  created() {
    this._historyStore = useHistoryStore()
    this._authStore = useAuthStore()
  },

  computed: {
    hasQuiz() {
      // quizSummary.completed is set by loadQuizSummary (Supabase or localStorage)
      if (this.quizSummary?.completed) return true
      try { return !!(this._historyStore?.getLatestQuizResult()); } catch { return false; }
    },

    quizCompleted() {
      return !!this.quizSummary.completed;
    },

    formattedSkinType() {
      const map = {
        seca: "Dry skin",
        normal: "Normal skin",
        mixta: "Combination skin",
        grasa: "Oily skin"
      };
      return map[this.quizSummary.skinType] || this.quizSummary.skinType || "Not available";
    },

    formattedSensitivity() {
      const raw = (this.quizSummary.sensitivity || "").toLowerCase();
      const map = {
        "ninguna sensibilidad": "No sensitivity",
        "baja sensibilidad": "Low sensitivity",
        "sensibilidad media": "Medium sensitivity",
        "sensibilidad alta": "High sensitivity"
      };
      return map[raw] || this.quizSummary.sensitivity || "Not available";
    },

    quizMetrics() {
      return this.quizSummary.fullMetrics && this.quizSummary.fullMetrics.length
        ? this.quizSummary.fullMetrics
        : this.quizSummary.summaryMetrics || [];
    },

    mainConcernCode() {
      if (this.quizSummary.primaryConcern) return this.quizSummary.primaryConcern;
      if (this.quizSummary.concerns && this.quizSummary.concerns.length) return this.quizSummary.concerns[0];
      return "";
    },

    mainConcern() {
      const code = this.mainConcernCode;
      if (code) return this.formatConcern(code);
      if (this.form.priorities.length) return this.form.priorities[0];
      return "Not specified";
    },

    detailsCompleted() {
      return !!(
        this.form.description &&
        this.form.duration &&
        this.form.urgency &&
        this.form.symptoms.length &&
        this.form.areas.length
      );
    },

    completionProgress() {
      let progress = this.quizCompleted ? 30 : 0;
      if (this.detailsCompleted) progress += 40;
      if (this.imagePreviews.length) progress += 15;
      if (this.diagnosticSaved) progress += 15;
      return progress;
    },

    caseStatus() {
      if (this.diagnosticSaved) return "Diagnostic saved";
      if (this.detailsCompleted) return "Under review";
      if (this.quizCompleted) return "Quiz importado";
      return "Nuevo caso";
    },

    suggestedAppointmentType() {
      const needsInPerson =
        this.form.urgency === "High" ||
        this.form.symptoms.includes("Burning sensation") ||
        this.form.symptoms.includes("Flaking");

      return needsInPerson ? "In person consultation" : "Virtual consultation";
    },

    generatedInsight() {
      const concern = this.mainConcern;
      const urgent = this.form.urgency === "High";
      const primaryKey = this.mainConcernCode;

      if (urgent) {
        return {
          title: "Priority skin evaluation recommended",
          text: `Your answers suggest that ${String(concern).toLowerCase()} may need prompt professional evaluation, especially if symptoms are persistent or worsening.`,
          nextStep: "Book an in-person dermatologist visit",
          priority: "High"
        };
      }

      if (primaryKey === "poros" || this.form.symptoms.includes("Acne") || this.form.priorities.includes("Acne control")) {
        return {
          title: "Breakout-prone, texture-focused profile",
          text: "Your profile points toward oil balance, pore care and dermatologist-guided support if congestion or bumps persist.",
          nextStep: "Start with a virtual consultation",
          priority: "Medium"
        };
      }

      if (primaryKey === "deshidratacion" || primaryKey === "sensibilidad" || this.form.priorities.includes("Barrier repair")) {
        return {
          title: "Barrier-focused recovery profile",
          text: "Your skin appears to need hydration, comfort and a calmer routine before stronger active steps are considered.",
          nextStep: "Review routine and consider a specialist consult",
          priority: "Medium"
        };
      }

      if (primaryKey === "manchas") {
        return {
          title: "Tone and discoloration refinement profile",
          text: "Your skin case suggests focusing on tone support, gentle consistency and strong sun protection habits.",
          nextStep: "Book a dermatologist review if discoloration persists",
          priority: "Medium"
        };
      }

      if (primaryKey === "arrugas") {
        return {
          title: "Texture and early aging support profile",
          text: "Your skin profile may benefit from hydration, gradual renewal support and professional guidance for long-term care.",
          nextStep: "Consider a guided dermatology consultation",
          priority: "Low to medium"
        };
      }

      return {
        title: "Personalized skin refinement recommended",
        text: "Your case appears suitable for targeted routine optimization and a consultation if you want more tailored care.",
        nextStep: "Book a virtual consultation",
        priority: "Low to medium"
      };
    },

    recommendedRoutine() {
      const primary = this.mainConcernCode;

      if (primary === "deshidratacion" || primary === "sensibilidad") {
        return {
          morning: [
            "Use a gentle non-stripping cleanser",
            "Apply a hydrating or soothing serum",
            "Seal with a barrier-support moisturizer and sunscreen"
          ],
          night: [
            "Cleanse gently without over-washing",
            "Use a simple repairing treatment step",
            "Finish with a rich or supportive moisturizer"
          ],
          prioritize: ["Ceramides", "Hyaluronic acid", "Panthenol", "Niacinamide"],
          avoid: ["Harsh exfoliation", "Too many actives together", "Strong fragrance"]
        };
      }

      if (primary === "poros") {
        return {
          morning: [
            "Use a balancing cleanser for combination or oily skin",
            "Apply a lightweight hydrating layer",
            "Finish with oil-friendly sunscreen"
          ],
          night: [
            "Cleanse without stripping the skin",
            "Use a clarifying or texture-supporting step",
            "Apply a non-comedogenic moisturizer"
          ],
          prioritize: ["Niacinamide", "Salicylic acid", "Ceramides", "Light hydration"],
          avoid: ["Aggressive scrubs", "Over-cleansing", "Very heavy pore-clogging textures"]
        };
      }

      if (primary === "manchas" || primary === "luminosidad") {
        return {
          morning: [
            "Use a gentle cleanser",
            "Apply a brightening or antioxidant-support step",
            "Finish with daily sunscreen"
          ],
          night: [
            "Cleanse gently",
            "Use a tone-supporting serum if tolerated",
            "Apply a barrier-friendly moisturizer"
          ],
          prioritize: ["Vitamin C", "Niacinamide", "Sunscreen", "Barrier support"],
          avoid: ["Skipping SPF", "Too many exfoliants at once", "Picking at the skin"]
        };
      }

      if (primary === "arrugas") {
        return {
          morning: [
            "Use a gentle cleanser",
            "Apply hydration and antioxidant support",
            "Use broad-spectrum sunscreen daily"
          ],
          night: [
            "Cleanse gently",
            "Use a smoothing or renewing step if tolerated",
            "Seal with moisturizer"
          ],
          prioritize: ["Retinoid support", "Peptides", "Ceramides", "Sunscreen"],
          avoid: ["Over-irritating combinations", "Skipping moisturizer", "Inconsistent SPF use"]
        };
      }

      return {
        morning: [
          "Use a gentle cleanser",
          "Apply a balancing serum",
          "Finish with moisturizer and sunscreen"
        ],
        night: [
          "Cleanse gently",
          "Use a targeted treatment if tolerated",
          "Apply a barrier-support moisturizer"
        ],
        prioritize: ["Niacinamide", "Ceramides", "Hydration", "Consistency"],
        avoid: ["Over-exfoliation", "Too many new products at once", "Skipping sunscreen"]
      };
    },

  },

  async mounted() {
    await this.loadQuizSummary();
    await this.loadSavedDiagnosticCase();
  },

  methods: {
    formatConcern(value) {
      const key = String(value || '').toLowerCase().trim();
      const map = {
        luminosidad: 'Radiance',
        deshidratacion: 'Hydration',
        hidratacion: 'Hydration',
        manchas: 'Dark spots',
        sensibilidad: 'Sensitivity',
        barrera: 'Skin barrier',
        arrugas: 'Early lines',
        poros: 'Visible pores',
        textura: 'Texture',
        acne: 'Acne',
        rojez: 'Redness',
      };
      return map[key] || value || 'Not specified';
    },

    toggleSymptom(value) {
      const idx = this.form.symptoms.indexOf(value)
      if (idx === -1) {
        this.form.symptoms = [...this.form.symptoms, value]
      } else {
        this.form.symptoms = this.form.symptoms.filter((_, i) => i !== idx)
      }
    },

    toggleArea(value) {
      const idx = this.form.areas.indexOf(value)
      if (idx === -1) {
        this.form.areas = [...this.form.areas, value]
      } else {
        this.form.areas = this.form.areas.filter((_, i) => i !== idx)
      }
    },

    togglePriority(value) {
      const idx = this.form.priorities.indexOf(value)
      if (idx === -1) {
        this.form.priorities = [...this.form.priorities, value]
      } else {
        this.form.priorities = this.form.priorities.filter((_, i) => i !== idx)
      }
    },

    async handleImages(event) {
      const files = Array.from(event.target.files || []);
      if (!files.length) return;

      // First, convert to dataUrl and show preview immediately
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });

      // Persist on save step through backend endpoint.
    },

    removeImage(index) {
      this.imagePreviews.splice(index, 1);
    },

    async saveStep2Photos() {
      if (this.isSavingPhotos || !this.imagePreviews.length) return;
      this.isSavingPhotos = true;
      try {
        const sess = JSON.parse(localStorage.getItem('pharmaderm_session') || 'null');
        if (!sess?.token) throw new Error('Please sign in again to save photos');
        const saved = await apiFetch('/diagnostics/latest', {
          method: 'PUT',
          body: {
            form: this.form,
            generatedInsight: this.generatedInsight,
            imagePreviews: this.imagePreviews,
          },
        });
        if (saved?.diagnosisId) this.latestDiagnosisId = saved.diagnosisId;
        this.showToast('Photos saved successfully.');
      } catch (e) {
        this.showToast(e?.message || 'Could not save photos');
      } finally {
        this.isSavingPhotos = false;
      }
    },

    scrollToSection(refName) {
      const el = this.$refs[refName];
      if (el && el.scrollIntoView) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },

    goToAppointmentBooking() {
      const query = {}
      if (this.generatedInsight?.title) query.diagnosis = this.generatedInsight.title
      if (this.mainConcern) query.reason = this.mainConcern
      // Pass the quiz concern code for recommendation scoring.
      const concernCode = this.mainConcernCode || this.form?.priorities?.[0]
      if (concernCode) query.concern = concernCode
      if (this.quizSummary?.skinType) query.skinType = this.quizSummary.skinType
      if (this.form?.urgency) query.urgency = this.form.urgency
      if (this.form?.symptoms?.length) query.symptoms = this.form.symptoms.join(',')
      if (this.latestDiagnosisId) query.diagnosisId = this.latestDiagnosisId
      // Pass the saved diagnosis ID so AppointmentBooking can link the appointment
      try {
        if (isSupabaseConfigured) {
          withTimeout(getCurrentUserIdentity(), 5000, 'Load user before booking').then((identity) => {
            if (identity?.id) {
              withTimeout(supabase.from('diagnosis_cases').select('id').eq('user_id', identity.id)
                .order('created_at', { ascending: false }).limit(1).maybeSingle()
                , 8000, 'Load latest diagnostic before booking')
                .then(({ data }) => {
                  if (data?.id) query.diagnosisId = data.id
                  this.$router.push({ path: '/citas/agendar', query })
                })
                .catch(() => this.$router.push({ path: '/citas/agendar', query }))
            } else {
              this.$router.push({ path: '/citas/agendar', query })
            }
          }).catch(() => this.$router.push({ path: '/citas/agendar', query }))
        } else {
          this.$router.push({ path: '/citas/agendar', query })
        }
      } catch {
        this.$router.push({ path: '/citas/agendar', query })
      }
    },

    showToast(msg) {
      this.toastMsg = msg;
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => { this.toastMsg = ''; }, 3000);
    },

    async saveDiagnosticCase() {
      // Prevent double-submission
      if (this.isSavingDiagnostic || this.diagnosticSaved) {
        return;
      }

      this.isSavingDiagnostic = true;

      try {
        // FASE 9 â€” save diagnostic case (separate from booking)
        const payload = {
          id: Date.now(),
          title: "Dermatology diagnostic saved",
          summary: this.generatedInsight.text,
          quizSummary: this.quizSummary,
          form: { ...this.form },
          insight: this.generatedInsight,
          status: "Saved",
          savedAt: new Date().toISOString(),
        };

        // Save to user-scoped localStorage via historyStore
        try {
          this._historyStore?.saveDiagnostic(payload);
        } catch { /* ignore */ }

        // Prefer backend persistence in backend/hybrid auth mode.
        try {
          const sess = JSON.parse(localStorage.getItem('pharmaderm_session') || 'null');
          if (sess?.token) {
            const saved = await apiFetch('/diagnostics/latest', {
              method: 'PUT',
              body: {
                form: this.form,
                generatedInsight: this.generatedInsight,
                imagePreviews: this.imagePreviews,
              },
            });
            if (saved?.diagnosisId) this.latestDiagnosisId = saved.diagnosisId;
          } else if (isSupabaseConfigured) {
            const identity = await withTimeout(getCurrentUserIdentity(), 5000, 'Load diagnostic user');
            if (identity?.id) {
              // Check if diagnosis case already exists for this user
              const { data: existingCase, error: checkError } = await withTimeout(supabase
                .from('diagnosis_cases')
                .select('id')
                .eq('user_id', identity.id)
                .maybeSingle(), 8000, 'Check diagnostic case');

              let diagnosisId;
              if (existingCase && !checkError) {
                // Update existing case
                const { data: updateResult, error: updateError } = await withTimeout(supabase
                  .from('diagnosis_cases')
                  .update({
                    description: this.form.description || null,
                    duration: this.form.duration || null,
                    urgency: this.form.urgency || null,
                    symptoms: this.form.symptoms,
                    affected_areas: this.form.areas,
                    priorities: this.form.priorities,
                    routine_level: this.form.routineLevel || null,
                    previous_consult: this.form.previousConsult || null,
                    generated_insight: this.generatedInsight,
                    status: 'saved',
                    updated_at: new Date().toISOString(),
                  })
                  .eq('user_id', identity.id)
                  .select('id')
                  .single(), 8000, 'Update diagnostic case');
                if (updateError) {
                  console.warn('[Diagnostics] Supabase diagnosis update failed:', updateError.message || updateError);
                } else {
                  diagnosisId = updateResult.id;
                }
              } else {
                // Insert new case
                const { data: insertResult, error: insertError } = await withTimeout(supabase
                  .from('diagnosis_cases')
                  .insert({
                    user_id: identity.id,
                    description: this.form.description || null,
                    duration: this.form.duration || null,
                    urgency: this.form.urgency || null,
                    symptoms: this.form.symptoms,
                    affected_areas: this.form.areas,
                    priorities: this.form.priorities,
                    routine_level: this.form.routineLevel || null,
                    previous_consult: this.form.previousConsult || null,
                    generated_insight: this.generatedInsight,
                    status: 'saved',
                  })
                  .select('id')
                  .single(), 8000, 'Save diagnostic case');
                if (insertError) {
                  console.warn('[Diagnostics] Supabase diagnosis insert failed:', insertError.message || insertError);
                } else {
                  diagnosisId = insertResult.id;
                }
              }

              // Save photos if any (they are already uploaded, just save records)
              if (this.imagePreviews.length > 0 && diagnosisId) {
                await this.savePhotosToDiagnosis(diagnosisId, this.imagePreviews);
              }

              // Save any temp photos that weren't saved before
              if (this.tempPhotos.length > 0 && diagnosisId) {
                await this.saveTempPhotosToDiagnosis(diagnosisId);
              }
            }
          }
        } catch { /* Supabase save is best-effort */ }

        this.diagnosticSaved = true;
        this.showToast("Diagnostic saved successfully.");

        // Step 1 only saves the diagnostic form.
        await this.$nextTick();
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      } finally {
        this.isSavingDiagnostic = false;
      }
    },

    async saveTempPhotosToDiagnosis(diagnosisId) {
      try {
        const insertPromises = this.tempPhotos.map(url =>
          supabase
            .from('diagnosis_photos')
            .insert({
              diagnosis_id: diagnosisId,
              url: url,
              is_selfie: false,
              uploaded_at: new Date().toISOString()
            })
        );
        await withTimeout(Promise.all(insertPromises), 8000, 'Save diagnostic temp photos');
        // Clear temp photos after saving
        this.tempPhotos = [];
      } catch (error) {
        console.warn('[Diagnostics] Save temp photos failed:', error);
      }
    },

    async savePhotosToDiagnosis(diagnosisId, photoUrls) {
      try {
        const insertPromises = photoUrls.map(url =>
          supabase
            .from('diagnosis_photos')
            .insert({
              diagnosis_id: diagnosisId,
              url: url,
              is_selfie: false,
              uploaded_at: new Date().toISOString()
            })
        );
        await withTimeout(Promise.all(insertPromises), 8000, 'Save diagnostic photos');
      } catch (error) {
        console.warn('[Diagnostics] Save photos to diagnosis failed:', error);
      }
    },

    async loadQuizSummary() {
      const userId = this._authStore?.user?.value?.id || null;
      console.log('[Diagnostics] loadQuizSummary | userId:', userId);

      let savedQuiz = null;
      let source = 'none';

      // Backend history is the source of truth in backend/hybrid auth mode.
      try {
        const history = await apiFetch('/history')
        const backendQuiz =
          (Array.isArray(history?.quiz_history) && history.quiz_history[0]) ||
          history?.quiz_result ||
          null
        if (backendQuiz) {
          const localQuiz = this._historyStore?.getLatestQuizResult?.() || null
          const fallbackSelfie = localQuiz?.selfie || null
          savedQuiz = {
            ...backendQuiz,
            selfie: backendQuiz?.selfie || fallbackSelfie || '',
            completed: true
          }
          source = 'backend-history'
        } else {
          source = 'backend-empty'
        }
      } catch (e) {
        console.warn('[Diagnostics] Backend history quiz load failed:', e?.message || e)
      }

            // Supabase is authoritative when configured
      if (!savedQuiz && isSupabaseConfigured && userId) {
        try {
          // A) Esquema denormalizado (quiz_sessions con completed_at, skin_type, concerns...)
          try {
            const { data, error } = await withTimeout(supabase
              .from('quiz_sessions')
              .select('*')
              .eq('user_id', userId)
              .order('completed_at', { ascending: false })
              .limit(1)
              .maybeSingle(), 8000, 'Load quiz summary');

            if (!error && data?.completed_at) {
              let selfieUrl = null;
              try {
                const { data: imageData, error: imageError } = await withTimeout(supabase
                  .from('quiz_images')
                  .select('public_url, storage_path')
                  .eq('quiz_session_id', data.id)
                  .eq('is_selfie', true)
                  .order('uploaded_at', { ascending: false })
                  .limit(1)
                  .maybeSingle(), 8000, 'Load quiz image');
                if (!imageError && imageData) {
                  selfieUrl = imageData.public_url || imageData.storage_path || null;
                }
              } catch { /* ignore */ }

              savedQuiz = {
                completed: true,
                skinType: data.skin_type || '',
                sensitivity: data.sensitivity || '',
                concerns: data.concerns || [],
                primaryConcern: data.primary_concern || '',
                profileTitle: data.profile_title || '',
                routineFocus: data.routine_focus || '',
                fullMetrics: data.full_metrics || [],
                summaryMetrics: (data.full_metrics || []).slice(0, 3),
                date: data.completed_at,
                photoMeta: data.photo_meta || {},
                selfie: selfieUrl,
              };
              source = 'supabase';
            }
          } catch { /* ignore */ }

          // B) Esquema `PharmaDerm-Backend/database/schema.sql` (quiz_sessions + skin_analyses)
          if (!savedQuiz) {
            const { data: sData, error: sErr } = await withTimeout(supabase
              .from('quiz_sessions')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle(), 8000, 'Load quiz session');

            if (!sErr && sData?.id) {
              const { data: aData } = await withTimeout(supabase
                .from('skin_analyses')
                .select('*')
                .eq('quiz_session_id', sData.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle(), 8000, 'Load skin analysis');

              let skinTypeCode = '';
              try {
                if (sData.skin_type_id) {
                  const { data: stData } = await withTimeout(supabase
                    .from('skin_types')
                    .select('code')
                    .eq('id', sData.skin_type_id)
                    .maybeSingle(), 8000, 'Load skin type');
                  skinTypeCode = stData?.code || '';
                }
              } catch { /* ignore */ }

              let selfieUrl = null;
              try {
                const { data: imageData, error: imageError } = await withTimeout(supabase
                  .from('quiz_images')
                  .select('public_url, storage_path')
                  .eq('quiz_session_id', sData.id)
                  .eq('is_selfie', true)
                  .order('uploaded_at', { ascending: false })
                  .limit(1)
                  .maybeSingle(), 8000, 'Load quiz image');
                if (!imageError && imageData) {
                  selfieUrl = imageData.public_url || imageData.storage_path || null;
                }
              } catch { /* ignore */ }

              const sensitivityMap = {
                resilient: 'No sensitivity',
                mild: 'Low sensitivity',
                reactive: 'Sensibilidad media',
                very_reactive: 'Sensibilidad alta',
              };

              const metrics = aData?.metrics || [];
              savedQuiz = {
                completed: true,
                skinType: skinTypeCode,
                sensitivity: sensitivityMap[sData.barrier_reactivity] || '',
                concerns: aData?.primary_concern ? [aData.primary_concern] : [],
                primaryConcern: aData?.primary_concern || '',
                profileTitle: aData?.profile_title || '',
                routineFocus: aData?.routine_focus || '',
                fullMetrics: metrics,
                summaryMetrics: Array.isArray(metrics) ? metrics.slice(0, 3) : [],
                date: aData?.created_at || sData.created_at,
                selfie: selfieUrl,
              };
              source = 'supabase(schema.sql)';
            } else {
              source = 'supabase:empty';
            }
          }

          // Supplement with richer localStorage data (selfie, morningSteps, etc.) if available
          if (savedQuiz) {
            const localQuiz = this._historyStore?.getLatestQuizResult();
            if (localQuiz?.skinType === savedQuiz.skinType || localQuiz?.primaryConcern === savedQuiz.primaryConcern) {
              savedQuiz = { ...savedQuiz, ...localQuiz, completed: true };
              source = source.includes('schema.sql') ? 'supabase(schema.sql)+local' : 'supabase+local';
            }
          }
        } catch (e) {
          console.warn('[Diagnostics] Supabase quiz check failed:', e?.message);
          source = 'supabase:errorâ†’fallback';
        }
      }

      // Fallback: localStorage (non-Supabase mode, or Supabase save still pending after quiz)
      if (!savedQuiz) {
        savedQuiz = this._historyStore?.getLatestQuizResult() || null;
        if (savedQuiz) source = 'localStorage';
      }

      console.log('[Diagnostics] source:', source, '|', savedQuiz
        ? { skinType: savedQuiz.skinType, primaryConcern: savedQuiz.primaryConcern, completed: savedQuiz.completed }
        : null
      );

      if (savedQuiz) {
        try {
          this.quizSummary = { ...this.quizSummary, ...savedQuiz };
          this.casePhoto = this.quizSummary.selfie || '';
        } catch (error) {
          console.error('[Diagnostics] Error applying quiz summary:', error);
        }
      }

      const query = this.$route.query;
      if (query.skinType || query.sensitivity || query.concerns) {
        this.quizSummary = {
          ...this.quizSummary,
          skinType: query.skinType || this.quizSummary.skinType,
          sensitivity: query.sensitivity || this.quizSummary.sensitivity,
          concerns: query.concerns
            ? String(query.concerns).split(',')
            : this.quizSummary.concerns,
          routineFocus: query.routineFocus || this.quizSummary.routineFocus,
        };
      }
    },

    async loadSavedDiagnosticCase() {
      const userId = this._authStore?.user?.value?.id || null;
      console.log('[Diagnostics] loadSavedDiagnosticCase | userId:', userId);

      let parsed = null;
      let source = 'none';

      // Backend diagnostics table first (backend/hybrid auth mode)
      try {
        const sess = JSON.parse(localStorage.getItem('pharmaderm_session') || 'null');
        if (sess?.token) {
          const latest = await apiFetch('/diagnostics/latest');
          if (latest?.case) {
            this.latestDiagnosisId = latest.case.id;
            parsed = {
              form: {
                description: latest.case.description || '',
                duration: latest.case.duration || '',
                urgency: latest.case.urgency || '',
                symptoms: latest.case.symptoms || [],
                areas: latest.case.affected_areas || [],
                priorities: latest.case.priorities || [],
                routineLevel: latest.case.routine_level || '',
                previousConsult: latest.case.previous_consult || '',
              },
              generatedInsight: latest.case.generated_insight || null,
              imagePreviews: Array.isArray(latest.photos) ? latest.photos.map(p => p.url) : [],
            };
          }
        }
        if (parsed) {
          source = 'backend-history'
        } else if (source === 'none') {
          source = 'backend-empty'
        }
      } catch (e) {
        console.warn('[Diagnostics] Backend history diagnostic load failed:', e?.message || e)
      }

      if (!parsed && isSupabaseConfigured && userId) {
        try {
          const { data, error } = await withTimeout(supabase
            .from('diagnosis_cases')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(), 8000, 'Load saved diagnostic');

          if (!error && data) {
            console.log('[Diagnostics] Loaded diagnosis case from DB:', data);
            parsed = {
              form: {
                description: data.description || '',
                duration: data.duration || '',
                urgency: data.urgency || '',
                symptoms: data.symptoms || [],
                areas: data.affected_areas || [],
                priorities: data.priorities || [],
                routineLevel: data.routine_level || '',
                previousConsult: data.previous_consult || '',
              },
              generatedInsight: data.generated_insight || null,
            };

            // Load associated photos
            const { data: photos, error: photosError } = await withTimeout(supabase
              .from('diagnosis_photos')
              .select('url')
              .eq('diagnosis_id', data.id)
              .order('uploaded_at', { ascending: true }), 8000, 'Load diagnostic photos');

            if (!photosError && photos) {
              parsed.imagePreviews = photos.map(photo => photo.url);
            }

            source = 'supabase';
          } else {
            source = 'supabase:empty';
          }
        } catch (e) {
          console.warn('[Diagnostics] Supabase diagnosis check failed:', e?.message);
          parsed = this._historyStore?.getLatestDiagnostic() || null;
          source = 'supabase:errorâ†’fallback';
        }
      } else {
        parsed = this._historyStore?.getLatestDiagnostic() || null;
        source = parsed ? 'localStorage' : 'none';
      }

      console.log('[Diagnostics] loadSavedDiagnosticCase | source:', source, '| found:', !!parsed);

      if (!parsed) return;

      console.log('[Diagnostics] Applying saved data:', parsed);

      try {
        if (parsed.form) {
          console.log('[Diagnostics] Applying form data:', parsed.form);
          Object.assign(this.form, parsed.form);
          if (Array.isArray(parsed.form.symptoms)) this.form.symptoms = [...parsed.form.symptoms]
          if (Array.isArray(parsed.form.areas)) this.form.areas = [...parsed.form.areas]
          if (Array.isArray(parsed.form.priorities)) this.form.priorities = [...parsed.form.priorities]
        }
        if (parsed.imagePreviews) {
          console.log('[Diagnostics] Applying image previews:', parsed.imagePreviews.length, 'images');
          this.imagePreviews = parsed.imagePreviews;
        }
        if (parsed.casePhoto) {
          console.log('[Diagnostics] Applying case photo');
          this.casePhoto = parsed.casePhoto;
        }
      } catch (error) {
        console.error('[Diagnostics] Error applying saved diagnostic case:', error);
      }
    },

    async generateRoutineFromDiagnosis() {
      // Generate routine based on diagnostic information
      const diagnosticResult = {
        skinType: this.quizSummary.skinType || 'normal',
        concerns: this.mainConcern ? [this.mainConcern] : [],
        sensitivity: this.quizSummary.sensitivity?.includes('alta') || this.quizSummary.sensitivity?.includes('reactive') ? 'reactive' : 'mild',
      };

      const toStep = (p, i) => ({
        ...p,
        step: i + 1,
        longDescription: p.description || p.longDescription || '',
        size: p.sizes?.[0]?.label || p.size || '',
        category: p.category || p.type || 'Cuidado',
      });

      const builtRoutine = {
        morning: getProductsByQuizResult(diagnosticResult, 'morning').map(toStep),
        night: getProductsByQuizResult(diagnosticResult, 'night').map(toStep),
      };

      // Save the generated routine
      const routineData = {
        name: `Routine based on diagnostic - ${this.mainConcern || 'Personalized skin'}`,
        primaryConcern: this.mainConcern,
        skinType: this.quizSummary.skinType,
        morningSteps: builtRoutine.morning,
        nightSteps: builtRoutine.night,
        generatedFromDiagnosis: true,
        diagnosisDate: new Date().toISOString(),
      };

      try {
        await this._historyStore?.saveRoutine(routineData);
        console.log('[Diagnostics] Routine generated and saved from diagnosis');
        this.showToast('Personalized routine generated from your diagnostic!');
      } catch (error) {
        console.warn('[Diagnostics] Failed to save routine from diagnosis:', error);
        this.showToast('Error generating the routine. Please try again.');
      }
    }
  }
};
</script>

<style scoped>
.quiz-gate { text-align: center; padding: 6rem 1rem; min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }
.gate-icon { font-size: 64px; color: #004e92; }
.quiz-gate h2 { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0; }
.quiz-gate p { color: #64748b; line-height: 1.7; max-width: 480px; }

.diagnostics-page {
  --bg: #f8fafc;
  --text: #0f172a;
  --muted: #64748b;
  --surface: rgba(255, 255, 255, 0.92);
  --card: #ffffff;
  --soft: #f1f5f9;
  --border: #e2e8f0;
  --brand: #004e92;
  --link: #5dbcd2;
  --accent: #76b82a;
  --banner: #5dbcd2;
  --price: #004e92;
  --primary: #004e92;
  --primary-deep: #183a6b;
  --shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  --shadow-soft: 0 10px 26px rgba(15, 23, 42, 0.06);
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: Arial, Helvetica, sans-serif;
}

.container {
  width: min(1280px, 92%);
  margin: 0 auto;
}

/* HEADER COMO INICIO / PERFIL */
.pd-surface {
  background: var(--surface);
  backdrop-filter: blur(10px);
}

.pd-border-b {
  border-bottom: 1px solid var(--border);
}

.pd-banner {
  background: var(--banner);
}

.pd-brand {
  color: var(--brand);
}

.pd-accent {
  color: var(--accent);
}

.pd-icon {
  color: var(--brand);
}

.pd-hover:hover {
  background: rgba(148, 163, 184, 0.18);
}

/* POPOVERS */
.search-popover,
.profile-popover {
  position: absolute;
  top: calc(100% + 14px);
  right: 0;
  background: var(--card);
  border-radius: 24px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  z-index: 90;
}

.search-popover {
  width: 340px;
  padding: 1rem;
}

.profile-popover {
  width: 290px;
  padding: 1.2rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--soft);
  border-radius: 16px;
  padding: 0.9rem 1rem;
  border: 1px solid var(--border);
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 0.95rem;
  color: var(--text);
  font-family: Arial, Helvetica, sans-serif;
}

.profile-popover h4 {
  margin: 0 0 0.45rem;
  color: var(--text);
  font-size: 1rem;
}

.profile-popover p {
  margin: 0 0 1rem;
  color: var(--muted);
  line-height: 1.5;
  font-size: 0.92rem;
}

/* HERO */
.diagnostics-hero {
  padding: 3.5rem 0 2.5rem;
  background: linear-gradient(135deg, var(--brand), var(--link));
  background-size: cover;
  background-position: center;
  position: relative;
}

.diagnostics-hero-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0,78,146,0.82), rgba(93,188,210,0.7));
  z-index: 0;
}

.diagnostics-hero .container {
  position: relative;
  z-index: 1;
}

.diagnostics-hero-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 2rem;
  align-items: center;
}

.eyebrow {
  font-size: 0.8rem;
  letter-spacing: 0.22em;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.78);
  margin-bottom: 0.9rem;
  text-transform: uppercase;
}

.section-eyebrow {
  color: var(--brand);
}

.eyebrow.light {
  color: rgba(255, 255, 255, 0.78);
}

.hero-copy h1 {
  font-size: clamp(2.2rem, 4vw, 4rem);
  line-height: 1;
  margin: 0 0 1rem;
  letter-spacing: -0.03em;
  color: #fff;
  font-weight: 700;
}

.hero-text {
  font-size: 1.05rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  max-width: 680px;
}

.hero-actions {
  display: flex;
  gap: 0.9rem;
  margin-top: 1.8rem;
  flex-wrap: wrap;
}

/* CARDS */
.hero-card,
.form-card,
.insight-card,
.upload-card,
.booking-card,
.booking-summary,
.summary-card,
.doctor-card,
.timeline-step,
.routine-card,
.disclaimer-box,
.selfie-card,
.metrics-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 28px;
  box-shadow: var(--shadow-soft);
  padding: 1.5rem;
}

.hero-card h3,
.form-card h3,
.insight-card h3,
.upload-card h3,
.booking-card h3,
.booking-summary h3,
.summary-card h3,
.timeline-step h3,
.routine-card h3,
.disclaimer-box h3,
.selfie-card h3,
.metrics-card h3 {
  color: var(--text);
  margin-top: 0;
}

/* STATUS */
.status-row {
  display: flex;
  justify-content: space-between;
  gap: 0.7rem;
  flex-wrap: wrap;
  margin-bottom: 0.8rem;
}

.result-badge,
.progress-pill {
  display: inline-flex;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  background: #eef6ff;
  color: #0f4c81;
  font-size: 0.82rem;
  font-weight: 700;
}

.summary-list {
  display: grid;
  gap: 0.85rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.summary-item .label {
  color: var(--muted);
}

.hero-card-note {
  margin-top: 1rem;
  color: var(--muted);
  font-size: 0.92rem;
  line-height: 1.6;
}

/* SECTIONS */
.section-light {
  padding: 4rem 0;
  background: var(--bg);
}

.section-white {
  padding: 4rem 0;
  background: transparent;
}

.section-heading {
  margin-bottom: 2rem;
}

.section-heading.center {
  text-align: center;
  max-width: 780px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 2.5rem;
}

.section-heading h2 {
  margin: 0 0 0.8rem;
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  letter-spacing: -0.03em;
  color: var(--text);
  font-weight: 700;
}

.section-heading p {
  margin: 0;
  color: var(--muted);
  line-height: 1.75;
}

/* GRIDS */
.timeline-grid,
.quiz-summary-grid,
.routine-grid {
  display: grid;
  gap: 1.2rem;
}

.timeline-grid {
  grid-template-columns: repeat(4, 1fr);
}

.quiz-summary-grid {
  grid-template-columns: repeat(4, 1fr);
}

.routine-grid {
  grid-template-columns: repeat(4, 1fr);
}

.timeline-step.completed {
  border-color: #84b6f4;
  box-shadow: 0 20px 44px rgba(77, 130, 188, 0.12);
}

.timeline-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #eef6ff;
  color: var(--brand);
  display: grid;
  place-items: center;
  font-weight: 700;
  margin-bottom: 1rem;
}

.summary-card p,
.timeline-step p,
.routine-card li,
.disclaimer-box p,
.doctor-description,
.doctor-meta,
.muted-text,
.insight-copy,
.insight-box p,
.summary-note {
  color: var(--muted);
  line-height: 1.7;
}

/* QUIZ OVERVIEW */
.case-overview-grid {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 1.2rem;
  margin-top: 1.2rem;
}

.case-photo-preview {
  width: 100%;
  max-height: 420px;
  object-fit: cover;
  border-radius: 20px;
}

.metric-list {
  display: grid;
  gap: 0.9rem;
}

.metric-item {
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--border);
}

.metric-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.55rem;
  color: var(--text);
}

.metric-bar {
  height: 8px;
  border-radius: 999px;
  background: #eaf0f7;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--brand), var(--link));
}

/* DETAILS / BOOKING */
.details-layout,
.booking-layout {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 1.4rem;
}

.form-grid {
  display: grid;
  gap: 1rem;
}

.form-grid.two {
  grid-template-columns: repeat(2, 1fr);
}

.field-label {
  display: block;
  margin: 1rem 0 0.55rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
}

textarea,
select,
input[type="text"],
input[type="date"] {
  width: 100%;
  border: 1px solid var(--border);
  background: var(--soft);
  color: var(--text);
  border-radius: 16px;
  padding: 0.95rem 1rem;
  font-size: 0.96rem;
  outline: none;
  transition: 0.25s ease;
  box-sizing: border-box;
  font-family: Arial, Helvetica, sans-serif;
}

textarea::placeholder,
input::placeholder {
  color: #94a3b8;
}

textarea:focus,
select:focus,
input:focus {
  border-color: #7da9d8;
  box-shadow: 0 0 0 4px rgba(125, 169, 216, 0.14);
}

.chips-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 0.2rem;
}

.chip {
  padding: 0.75rem 1rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
  cursor: pointer;
  transition: 0.25s ease;
  font-weight: 600;
  font-family: Arial, Helvetica, sans-serif;
}

.chip:hover,
.chip.active {
  background: #eef6ff;
  border-color: #7aa7d6;
  color: var(--brand);
}

.insight-box {
  margin: 1rem 0 1.2rem;
  padding: 1rem 1.1rem;
  border-radius: 18px;
  background: var(--soft);
  border: 1px solid var(--border);
}

.mini-points {
  display: grid;
  gap: 0.9rem;
  margin-bottom: 1rem;
}

.mini-points div {
  padding: 0.9rem 1rem;
  border-radius: 18px;
  background: var(--card);
  border: 1px solid var(--border);
}

.mini-points span {
  display: block;
  color: var(--muted);
  font-size: 0.88rem;
  margin-bottom: 0.2rem;
}

/* UPLOAD */
.upload-zone {
  min-height: 180px;
  border: 2px dashed var(--border);
  border-radius: 24px;
  display: grid;
  place-items: center;
  text-align: center;
  gap: 0.3rem;
  padding: 1.5rem;
  background: linear-gradient(180deg, #fbfdff, var(--soft));
  cursor: pointer;
}

.upload-icon {
  font-size: 2.5rem;
  color: var(--link);
}

.preview-grid {
  margin-top: 1.2rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.preview-item {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  border: 1px solid var(--border);
  background: var(--card);
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.85);
  color: #fff;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.upload-actions {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
}

/* DOCTORS */
.doctors-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.3rem;
}

.doctor-card {
  overflow: hidden;
  transition: 0.25s ease;
}

.doctor-card:hover {
  transform: translateY(-4px);
}

.doctor-card.selected {
  border-color: #84b6f4;
  box-shadow: 0 20px 48px rgba(91, 135, 191, 0.16);
}

.doctor-image {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

.doctor-body {
  padding: 1.2rem;
}

.doctor-topline {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.doctor-tag,
.doctor-rating {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--brand);
  background: #eef6ff;
  padding: 0.4rem 0.65rem;
  border-radius: 999px;
}

.doctor-specialty {
  color: #486684;
  font-weight: 600;
  margin: 0.3rem 0 0.7rem;
}

/* SUMMARY */
.summary-block {
  padding: 0.95rem 0;
  border-bottom: 1px solid var(--border);
}

.summary-block span {
  display: block;
  color: var(--muted);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.summary-note {
  margin-top: 1.2rem;
  padding: 1rem;
  border-radius: 18px;
  background: var(--soft);
}

.disclaimer-section {
  padding-top: 1rem;
}

/* FINAL CTA */
.final-cta {
  padding: 4rem 0;
  background: linear-gradient(135deg, var(--brand), var(--link));
  color: #fff;
}

.final-cta-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.final-cta-inner h2,
.final-cta-inner p {
  color: #fff;
}

/* BUTTONS */
.primary-btn,
.ghost-btn,
.light-btn {
  border: none;
  border-radius: 999px;
  padding: 0.9rem 1.35rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s ease;
  font-family: Arial, Helvetica, sans-serif;
}

.primary-btn {
  background: linear-gradient(135deg, var(--brand), var(--primary-deep));
  color: #fff;
  box-shadow: 0 14px 28px rgba(19, 59, 99, 0.18);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px rgba(19, 59, 99, 0.24);
}

.ghost-btn {
  background: #fff;
  color: var(--brand);
  border: 1px solid var(--border);
}

.ghost-btn:hover {
  background: #eef5fd;
}

.light-btn {
  background: #fff;
  color: var(--brand);
}

.full {
  width: 100%;
}

.big {
  margin-top: 1.2rem;
  padding: 1rem 1.3rem;
}

.small {
  margin-top: 0.5rem;
}

/* ANIMATIONS */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.22s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* RESPONSIVE */
@media (max-width: 1100px) {
  .diagnostics-hero-grid,
  .details-layout,
  .booking-layout,
  .quiz-summary-grid,
  .doctors-grid,
  .timeline-grid,
  .routine-grid,
  .case-overview-grid {
    grid-template-columns: 1fr;
  }

  .preview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .form-grid.two,
  .final-cta-inner {
    grid-template-columns: 1fr;
    display: grid;
  }

  .hero-copy h1 {
    font-size: 2.35rem;
  }

  .preview-grid {
    grid-template-columns: 1fr 1fr;
  }

  .search-popover,
  .profile-popover {
    width: min(92vw, 340px);
  }
}

/* Toast notification */
.diag-toast {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: #0f172a;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 9999;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>



