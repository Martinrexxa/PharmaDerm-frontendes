<template>
  <footer class="app-footer">

    <!-- 1. Top blue accent line -->
    <div class="footer-topline"></div>

    <!-- 2. Main white section -->
    <section class="footer-main">
      <div class="footer-container">
        <div class="footer-grid">

          <!-- Column 1: OUR PRODUCTS -->
          <div class="footer-col">
            <h4 class="footer-heading">{{ t('footer.ourProducts') }}</h4>
            <ul class="footer-links">
              <li><RouterLink to="/tienda">{{ t('footer.face') }}</RouterLink></li>
              <li><RouterLink :to="{ path: '/tienda', query: { concern: 'Fine Lines & Wrinkles' } }">{{ t('footer.antiAging') }}</RouterLink></li>
              <li><RouterLink :to="{ path: '/tienda', query: { concern: 'Acne Prone Skin' } }">{{ t('footer.acneOily') }}</RouterLink></li>
              <li><RouterLink :to="{ path: '/tienda', query: { type: 'Sunscreen' } }">{{ t('footer.sun') }}</RouterLink></li>
              <li><RouterLink :to="{ path: '/tienda', query: { concern: 'Dry Skin' } }">{{ t('footer.drySkin') }}</RouterLink></li>
              <li><RouterLink :to="{ path: '/tienda', query: { concern: 'Sensitive Skin' } }">{{ t('footer.sensitiveSkin') }}</RouterLink></li>
              <li><RouterLink :to="{ path: '/tienda', query: { brand: 'cerave' } }">CeraVe</RouterLink></li>
              <li><RouterLink :to="{ path: '/tienda', query: { brand: 'larocheposay' } }">La Roche-Posay</RouterLink></li>
            </ul>
          </div>

          <!-- Column 2: CUSTOMER SERVICE -->
          <div class="footer-col">
            <h4 class="footer-heading">{{ t('footer.customerService') }}</h4>
            <ul class="footer-links">
              <li><RouterLink to="/pedidos">{{ t('footer.orderStatus') }}</RouterLink></li>
              <li><RouterLink to="/citas">{{ t('footer.myAppointments') }}</RouterLink></li>
              <li><RouterLink to="/citas/agendar">{{ t('footer.bookAppointment') }}</RouterLink></li>
              <li><RouterLink to="/carrito">{{ t('footer.cart') }}</RouterLink></li>
              <li><RouterLink to="/checkout">{{ t('footer.checkout') }}</RouterLink></li>
              <li><RouterLink to="/perfil">{{ t('footer.myProfile') }}</RouterLink></li>
              <li><RouterLink to="/shipping-returns">{{ t('footer.shippingReturns') }}</RouterLink></li>
              <li><RouterLink to="/faq">FAQ</RouterLink></li>
              <li><RouterLink to="/contact">{{ t('footer.contactUsLink') }}</RouterLink></li>
            </ul>
          </div>

          <!-- Column 3: ABOUT US -->
          <div class="footer-col">
            <h4 class="footer-heading">{{ t('footer.aboutUs') }}</h4>
            <ul class="footer-links">
              <li><RouterLink to="/our-story">{{ t('footer.ourStory') }}</RouterLink></li>
              <li><RouterLink to="/expert-advice">{{ t('footer.expertAdvice') }}</RouterLink></li>
              <li><RouterLink to="/quiz">{{ t('footer.skinAnalysisTool') }}</RouterLink></li>
              <li><RouterLink to="/diagnostics">{{ t('footer.diagnostics') }}</RouterLink></li>
              <li><RouterLink to="/routine">{{ t('footer.recommendedRoutine') }}</RouterLink></li>
              <li><RouterLink to="/coleccion">{{ t('footer.collection') }}</RouterLink></li>
            </ul>
          </div>

          <!-- Column 4: SKINCARE ADVICE -->
          <div class="footer-col">
            <h4 class="footer-heading">{{ t('footer.skincareAdvice') }}</h4>
            <ul class="footer-links">
              <li><RouterLink :to="{ path: '/tienda', query: { concern: 'Acne Prone Skin' } }">{{ t('footer.acneOily') }}</RouterLink></li>
              <li><RouterLink :to="{ path: '/tienda', query: { concern: 'Sensitive Skin' } }">{{ t('footer.sensitiveSkin') }}</RouterLink></li>
              <li><RouterLink :to="{ path: '/tienda', query: { concern: 'Dry Skin' } }">{{ t('footer.drySkin') }}</RouterLink></li>
              <li><RouterLink :to="{ path: '/tienda', query: { concern: 'Fine Lines & Wrinkles' } }">{{ t('footer.antiAging') }}</RouterLink></li>
              <li><RouterLink :to="{ path: '/tienda', query: { type: 'Sunscreen' } }">{{ t('footer.sunProtection') }}</RouterLink></li>
              <li><RouterLink to="/expert-advice">{{ t('footer.skinBarrier') }}</RouterLink></li>
            </ul>
          </div>

          <!-- Right panel: Logo + Form + Contact + Social -->
          <div class="footer-right-panel">

            <!-- Brand logo -->
            <div class="footer-brand-area">
              <img :src="logoIconSrc" alt="PharmaDerm" class="footer-brand-logo" />
              <span class="footer-brand-name">PharmaDerm</span>
            </div>

            <!-- Subscribe form -->
            <div class="footer-subscribe-box">
              <p class="footer-asterisk-note">{{ t('footer.required') }}</p>
              <template v-if="!subscribed">
                <div class="footer-field">
                  <label for="sub-email">{{ t('footer.emailAddress') }}<span class="req-star">*</span></label>
                  <input
                    id="sub-email"
                    v-model.trim="emailVal"
                    type="email"
                    class="footer-input"
                    placeholder="your@email.com"
                    @blur="onEmailBlur"
                  />
                </div>
                <div class="footer-field">
                  <label for="sub-phone">{{ t('footer.phone') }}</label>
                  <input
                    id="sub-phone"
                    v-model.trim="phoneVal"
                    type="tel"
                    class="footer-input"
                    placeholder="+1 (809) 000-0000"
                  />
                </div>
                <label class="footer-consent-label">
                  <input type="checkbox" v-model="consent" />
                  <span>{{ t('footer.consent') }}</span>
                </label>
                <p v-if="formError" class="footer-error-msg">{{ formError }}</p>
                <button class="footer-submit-btn" @click="handleSubmit">{{ t('footer.submit') }}</button>
              </template>
              <p v-else class="footer-success-msg">{{ t('footer.subscribed') }}</p>
            </div>

            <!-- Contact Us -->
            <div class="footer-contact-box">
              <h4 class="footer-heading">{{ t('footer.contactUs') }}</h4>
              <p class="footer-contact-desc">{{ t('footer.contactDesc') }}</p>
              <ul class="footer-contact-list">
                <li>
                  <span class="material-symbols-outlined footer-icon">mail</span>
                  <a href="mailto:soporte@pharmadermrd.com">soporte@pharmadermrd.com</a>
                </li>
                <li>
                  <span class="material-symbols-outlined footer-icon">location_on</span>
                  <span>Santiago, Dominican Republic</span>
                </li>
                <li>
                  <span class="material-symbols-outlined footer-icon">schedule</span>
                  <span>{{ t('footer.hours') }}</span>
                </li>
              </ul>
            </div>

            <!-- Follow Us -->
            <div class="footer-social-box">
              <h4 class="footer-heading">{{ t('footer.followUs') }}</h4>
              <div class="footer-social-row">
                <a href="#" aria-label="Instagram" class="social-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                  <span>Instagram</span>
                </a>
                <a href="#" aria-label="TikTok" class="social-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.35a8.2 8.2 0 0 0 4.79 1.52V7.43a4.85 4.85 0 0 1-1.02-.74z"/>
                  </svg>
                  <span>TikTok</span>
                </a>
                <a href="#" aria-label="WhatsApp" class="social-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>

    <!-- 3. CTA blue bar -->
    <div class="footer-cta-bar">
      <div class="footer-container footer-cta-inner">
        <RouterLink to="/quiz" class="footer-cta-link">{{ t('footer.personalizedRoutine') }}</RouterLink>
        <span class="footer-cta-sep" aria-hidden="true"></span>
        <RouterLink to="/citas/agendar" class="footer-cta-link footer-cta-link--title">{{ t('footer.bookAppointment') }}</RouterLink>
        <span class="footer-cta-sep" aria-hidden="true"></span>
        <RouterLink to="/pedidos" class="footer-cta-link">{{ t('footer.trackOrder') }}</RouterLink>
      </div>
    </div>

    <!-- 4. Legal bar -->
    <div class="footer-legal-bar">
      <div class="footer-container footer-legal-inner">
        <span class="footer-legal-brand">PharmaDerm</span>
        <p class="footer-legal-text">
          &copy; 2026 - {{ t('footer.legal') }}
        </p>
        <div class="footer-legal-links">
          <RouterLink to="/terms">{{ t('footer.terms') }}</RouterLink>
          <RouterLink to="/privacy-policy">{{ t('footer.privacy') }}</RouterLink>
          <RouterLink to="/accessibility">{{ t('footer.accessibility') }}</RouterLink>
        </div>
      </div>
    </div>

  </footer>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import logoIconSrc from '../assets/logo -Photoroom.png'
import { useI18n } from '../lib/i18n.js'
import { apiFetch } from '../services/apiClient.js'

const { t } = useI18n()
const emailVal = ref('')
const phoneVal = ref('')
const consent = ref(false)
const formError = ref('')
const subscribed = ref(false)
const SUB_KEY = 'pharmaderm_footer_subscribed_email'

function markSubscribed(email) {
  const safe = String(email || '').trim().toLowerCase()
  if (!safe) return
  try { localStorage.setItem(SUB_KEY, safe) } catch {}
}

function getMarkedSubscribedEmail() {
  try { return String(localStorage.getItem(SUB_KEY) || '').trim().toLowerCase() } catch { return '' }
}

async function checkSubscribedByEmail(email) {
  const safe = String(email || '').trim().toLowerCase()
  if (!safe) return false
  const marked = getMarkedSubscribedEmail()
  if (marked && marked === safe) return true
  try {
    const data = await apiFetch('/subscribers/status?email=' + encodeURIComponent(safe))
    return Boolean(data?.subscribed)
  } catch {
    return false
  }
}

async function onEmailBlur() {
  const exists = await checkSubscribedByEmail(emailVal.value)
  if (exists) subscribed.value = true
}

async function handleSubmit() {
  formError.value = ''
  if (!emailVal.value) {
    formError.value = t('footer.emailRequired')
    return
  }
  try {
    const result = await apiFetch('/subscribers', {
      method: 'POST',
      body: {
        email: emailVal.value,
        phone: phoneVal.value || null,
        consent: consent.value,
      },
    })
    if (result?.ok) {
      markSubscribed(emailVal.value)
      subscribed.value = true
      return
    }
    formError.value = t('footer.emailRequired')
  } catch {
    formError.value = 'Could not submit right now. Please try again.'
  }
}

onMounted(async () => {
  try {
    const rawUser = JSON.parse(localStorage.getItem('pharmaderm_user') || 'null')
    const preferredEmail = String(rawUser?.email || '').trim().toLowerCase()
    if (preferredEmail) emailVal.value = preferredEmail
    const probeEmail = preferredEmail || getMarkedSubscribedEmail()
    if (probeEmail) {
      subscribed.value = await checkSubscribedByEmail(probeEmail)
    }
  } catch {
    // ignore hydration errors
  }
})
</script>

<style scoped>
/* ── Reset helpers ── */
.app-footer * { box-sizing: border-box; }
.app-footer a { text-decoration: none; }

/* ── Shared container ── */
.footer-container {
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: 0 28px;
}

/* ════════════════════════════════════════
   1. Top blue accent line
════════════════════════════════════════ */
.footer-topline {
  display: none;
}

/* ════════════════════════════════════════
   2. Main white section
════════════════════════════════════════ */
.footer-main {
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 48px 0 44px;
}

/* 5-column grid: 4 link cols + 1 wide right panel */
.footer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1.9fr;
  gap: 36px 28px;
  align-items: start;
}

/* ── Column headings ── */
.footer-heading {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .09em;
  color: #1f2937;
  margin: 0 0 14px;
  padding-bottom: 8px;
  border-bottom: 2px solid #005187;
  display: inline-block;
  text-transform: uppercase;
}

/* ── Link lists ── */
.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.footer-links a {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  color: #4b5563;
  padding: 3px 0;
  transition: color .15s, transform .15s;
}

.footer-links a:hover {
  color: #005187;
  transform: translateX(4px);
}

/* ── Right panel ── */
.footer-right-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Brand logo */
.footer-brand-area { display: flex; align-items: center; gap: 10px; }

.footer-brand-logo {
  height: 40px;
  width: 40px;
  object-fit: contain;
  border-radius: 8px;
  flex-shrink: 0;
}

.footer-brand-name {
  font-size: 18px;
  font-weight: 800;
  color: #005187;
  letter-spacing: .01em;
}

/* ── Subscribe form ── */
.footer-subscribe-box {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px 20px 16px;
}

.footer-asterisk-note {
  font-size: 11px;
  color: #6b7280;
  margin: 0 0 14px;
}

.req-star {
  color: #005187;
  margin-left: 2px;
  font-weight: 800;
}

.footer-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.footer-field label {
  font-size: 11px;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.footer-input {
  height: 40px;
  border: 1px solid #d1d5db;
  padding: 0 12px;
  font-size: 14px;
  color: #111827;
  background: #fff;
  outline: none;
  transition: border-color .15s;
  border-radius: 3px;
}

.footer-input:focus { border-color: #005187; }

.footer-consent-label {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 12px;
  cursor: pointer;
}

.footer-consent-label input[type="checkbox"] {
  margin-top: 3px;
  flex-shrink: 0;
  accent-color: #005187;
  width: 14px;
  height: 14px;
}

.footer-consent-label span {
  font-size: 11px;
  color: #6b7280;
  line-height: 1.55;
}

.footer-error-msg {
  font-size: 12px;
  color: #dc2626;
  margin: 0 0 8px;
}

.footer-submit-btn {
  height: 42px;
  background: #005187;
  color: #ffffff;
  border: none;
  padding: 0 30px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .09em;
  cursor: pointer;
  border-radius: 3px;
  transition: background .15s;
  display: inline-flex;
  align-items: center;
}

.footer-submit-btn:hover { background: #003d66; }

.footer-success-msg {
  font-size: 14px;
  color: #005187;
  font-weight: 700;
  padding: 10px 0;
  margin: 0;
}

/* ── Contact box ── */
.footer-contact-box { display: flex; flex-direction: column; gap: 8px; }

.footer-contact-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.footer-contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-contact-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #4b5563;
}

.footer-contact-list a {
  color: #005187;
  font-size: 13px;
  transition: color .15s, text-decoration-color .15s;
}

.footer-contact-list a:hover {
  color: #003d66;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

.footer-icon {
  font-size: 17px;
  color: #005187;
  flex-shrink: 0;
}

/* ── Social box ── */
.footer-social-box { display: flex; flex-direction: column; gap: 10px; }

.footer-social-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.social-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #4b5563;
  font-size: 13px;
  padding: 8px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: background .15s, border-color .15s, color .15s, transform .15s;
}

.social-btn:hover {
  background: #eef9ff;
  border-color: #005187;
  color: #005187;
  transform: translateY(-2px);
}

/* ════════════════════════════════════════
   3. CTA blue bar
════════════════════════════════════════ */
.footer-cta-bar {
  background: #eaf8ff;
}

.footer-cta-inner {
  display: flex;
  align-items: stretch;
  min-height: 58px;
}

.footer-cta-link {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
  color: #005187;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .08em;
  text-align: center;
  text-transform: uppercase;
  transition: background .15s, color .15s;
  white-space: nowrap;
}

.footer-cta-link:hover {
  background: #d7f2ff;
  color: #003d66;
}

.footer-cta-link--title {
  text-transform: none;
}

.footer-cta-sep {
  display: none;
}

/* ════════════════════════════════════════
   4. Legal bar
════════════════════════════════════════ */
.footer-legal-bar {
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
  padding: 18px 0;
}

.footer-legal-inner {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.footer-legal-brand {
  font-size: 16px;
  font-weight: 800;
  color: #005187;
  letter-spacing: .02em;
  flex-shrink: 0;
}

.footer-legal-text {
  flex: 1;
  font-size: 11px;
  color: #64748b;
  margin: 0;
  line-height: 1.55;
  min-width: 200px;
}

.footer-legal-links {
  display: flex;
  gap: 16px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.footer-legal-links a {
  font-size: 11px;
  color: #475569;
  white-space: nowrap;
  transition: color .15s, text-decoration-color .15s;
}

.footer-legal-links a:hover {
  color: #005187;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

/* ════════════════════════════════════════
   Responsive
════════════════════════════════════════ */

/* Tablet: 4 link cols → 2×2, right panel full width */
@media (max-width: 1100px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    row-gap: 36px;
  }
  .footer-right-panel {
    grid-column: 1 / -1;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 24px;
    align-items: flex-start;
  }
  .footer-brand-area { width: 100%; }
  .footer-subscribe-box { flex: 1 1 280px; }
  .footer-contact-box, .footer-social-box { flex: 1 1 200px; }
}

/* Small tablet: 2-column link grid */
@media (max-width: 780px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    row-gap: 28px;
  }
  .footer-right-panel {
    flex-direction: column;
  }
  .footer-subscribe-box,
  .footer-contact-box,
  .footer-social-box { flex: unset; width: 100%; }
  .footer-cta-inner {
    flex-direction: column;
  }
  .footer-cta-sep {
    width: 100%;
    height: 1px;
    align-self: auto;
  }
  .footer-cta-link {
    width: 100%;
    padding: 14px 16px;
  }
}

/* Mobile: single column */
@media (max-width: 480px) {
  .footer-grid { grid-template-columns: 1fr; row-gap: 22px; }
  .footer-main { padding: 32px 0 28px; }
  .footer-legal-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .footer-legal-text { min-width: unset; }
  .footer-social-row { flex-wrap: wrap; }
}
</style>
