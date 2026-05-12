<template>
  <div class="contact-page">

    <section class="contact-hero">
      <div class="hero-inner">
        <p class="hero-eyebrow">GET IN TOUCH</p>
        <h1>Contact Us</h1>
        <p class="hero-sub">We are here to help. Reach out for skincare guidance, product support or appointment assistance.</p>
      </div>
    </section>

    <section class="contact-body">
      <div class="contact-container">
        <div class="contact-grid">

          <!-- Left: Info -->
          <div class="contact-info">
            <div class="info-block">
              <span class="material-symbols-outlined info-icon">mail</span>
              <div>
                <h3>Email</h3>
                <a href="mailto:soporte@pharmadermrd.com">soporte@pharmadermrd.com</a>
              </div>
            </div>
            <div class="info-block">
              <span class="material-symbols-outlined info-icon">location_on</span>
              <div>
                <h3>Location</h3>
                <p>Santiago, Dominican Republic</p>
              </div>
            </div>
            <div class="info-block">
              <span class="material-symbols-outlined info-icon">schedule</span>
              <div>
                <h3>Business Hours</h3>
                <p>Monday to Saturday<br />9:00 AM - 6:00 PM</p>
              </div>
            </div>

            <div class="social-section">
              <h3 class="social-title">Follow Us</h3>
              <div class="social-row">
                <a href="#" aria-label="Instagram" class="social-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                  Instagram
                </a>
                <a href="#" aria-label="WhatsApp" class="social-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </a>
                <a href="#" aria-label="TikTok" class="social-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.35a8.2 8.2 0 0 0 4.79 1.52V7.43a4.85 4.85 0 0 1-1.02-.74z"/>
                  </svg>
                  TikTok
                </a>
              </div>
            </div>
          </div>

          <!-- Right: Form -->
          <div class="contact-form-box">
            <template v-if="!submitted">
              <h2>Send Us a Message</h2>
              <p class="form-intro">Fill in the form below and we will get back to you within one business day.</p>

              <div v-if="formError" class="form-error-msg">{{ formError }}</div>

              <div class="form-grid">
                <div class="form-field full">
                  <label>Full Name <span class="req">*</span></label>
                  <input v-model="form.name" type="text" maxlength="60" pattern="[A-Za-z\\s'-]*" placeholder="Your full name" @beforeinput="blockNonLetterInput" @input="form.name = sanitizeLetters(form.name).slice(0, 60)" />
                </div>
                <div class="form-field">
                  <label>Email Address <span class="req">*</span></label>
                  <input v-model="form.email" type="email" maxlength="100" placeholder="your@email.com" @input="form.email = String(form.email || '').slice(0, 100)" />
                </div>
                <div class="form-field">
                  <label>Subject</label>
                  <input v-model="form.subject" type="text" maxlength="100" pattern="[A-Za-z\\s'-]*" placeholder="Order, appointment, product..." @beforeinput="blockNonLetterInput" @input="form.subject = sanitizeLetters(form.subject).slice(0, 100)" />
                </div>
                <div class="form-field full">
                  <label>Message <span class="req">*</span></label>
                  <textarea v-model="form.message" rows="5" maxlength="100" placeholder="How can we help you?" @beforeinput="blockNonLetterInput" @input="form.message = sanitizeLetters(form.message).slice(0, 100)"></textarea>
                </div>
              </div>

              <button class="form-submit" @click="submit">Send Message</button>
            </template>

            <div v-else class="form-success">
              <span class="material-symbols-outlined success-icon">check_circle</span>
              <h2>Message Sent</h2>
              <p>Thank you for contacting PharmaDerm. We will get back to you within one business day at <strong>{{ form.email }}</strong>.</p>
              <button class="form-reset" @click="reset">Send Another Message</button>
            </div>
          </div>

        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'

const form = ref({ name: '', email: '', subject: '', message: '' })
const submitted = ref(false)
const formError = ref('')

function sanitizeLetters(value) {
  return String(value || '').replace(/[^\p{L}\s'-]/gu, '')
}

function blockNonLetterInput(event) {
  const text = String(event?.data || '')
  if (!text) return
  if (/[^\p{L}\s'-]/u.test(text)) event.preventDefault()
}

async function submit() {
  formError.value = ''
  form.value.name = sanitizeLetters(form.value.name).slice(0, 60)
  form.value.subject = sanitizeLetters(form.value.subject).slice(0, 100)
  form.value.message = sanitizeLetters(form.value.message).slice(0, 100)
  form.value.email = String(form.value.email || '').slice(0, 100)
  if (!form.value.name.trim() || !form.value.email.trim() || !form.value.message.trim()) {
    formError.value = 'Please fill in all required fields.'
    return
  }
  if (!form.value.email.includes('@')) {
    formError.value = 'Please enter a valid email address.'
    return
  }
  submitted.value = true
  await nextTick()
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}

async function reset() {
  form.value = { name: '', email: '', subject: '', message: '' }
  submitted.value = false
  await nextTick()
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}
</script>

<style scoped>
.contact-page { min-height: 100vh; background: #f8fafc; }

.contact-hero {
  background: linear-gradient(135deg, #004e92 0%, #16a6e2 100%);
  padding: 4rem 1.5rem 3.5rem;
  text-align: center;
  color: white;
}
.hero-inner { max-width: 680px; margin: 0 auto; }
.hero-eyebrow { font-size: 11px; font-weight: 800; letter-spacing: .14em; opacity: .7; margin: 0 0 .6rem; text-transform: uppercase; }
.contact-hero h1 { font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 800; margin: 0 0 1rem; }
.hero-sub { font-size: 1.05rem; opacity: .85; margin: 0; line-height: 1.6; }

.contact-body { padding: 3rem 1.5rem 5rem; }
.contact-container { max-width: 1100px; margin: 0 auto; }

.contact-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 40px;
  align-items: start;
}

/* Info column */
.contact-info { display: flex; flex-direction: column; gap: 24px; }

.info-block {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}
.info-icon { font-size: 22px; color: #16a6e2; flex-shrink: 0; margin-top: 2px; }
.info-block h3 { font-size: .8rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #6b7280; margin: 0 0 4px; }
.info-block p, .info-block a { font-size: .93rem; color: #374151; margin: 0; line-height: 1.5; text-decoration: none; }
.info-block a:hover { color: #004e92; text-decoration: underline; }

.social-section { padding: 18px 20px; background: white; border: 1px solid #e5e7eb; border-radius: 12px; }
.social-title { font-size: .8rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #6b7280; margin: 0 0 12px; }
.social-row { display: flex; flex-direction: column; gap: 8px; }
.social-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: .9rem;
  color: #374151;
  text-decoration: none;
  transition: color .15s;
}
.social-link:hover { color: #004e92; }

/* Form column */
.contact-form-box {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 2rem 2.5rem;
}
.contact-form-box h2 { font-size: 1.4rem; font-weight: 800; color: #111827; margin: 0 0 .5rem; }
.form-intro { font-size: .93rem; color: #6b7280; margin: 0 0 1.5rem; }

.form-error-msg { padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-size: .88rem; border-radius: 6px; margin-bottom: 1rem; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 1.5rem; }
.form-field { display: flex; flex-direction: column; gap: 5px; }
.form-field.full { grid-column: 1 / -1; }
.form-field label { font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: #6b7280; }
.req { color: #004e92; }
.form-field input, .form-field textarea {
  border: 1px solid #d1d5db;
  padding: 10px 14px;
  font-size: .93rem;
  color: #111827;
  background: #fafafa;
  border-radius: 6px;
  outline: none;
  transition: border-color .15s;
  font-family: inherit;
  resize: vertical;
}
.form-field input:focus, .form-field textarea:focus { border-color: #16a6e2; background: white; }

.form-submit {
  height: 48px;
  width: 100%;
  background: #004e92;
  color: white;
  border: none;
  font-size: .95rem;
  font-weight: 800;
  letter-spacing: .04em;
  cursor: pointer;
  border-radius: 6px;
  transition: background .15s;
}
.form-submit:hover { background: #003a70; }

/* Success state */
.form-success { text-align: center; padding: 2rem; }
.success-icon { font-size: 64px; color: #22c55e; display: block; margin-bottom: 1rem; }
.form-success h2 { font-size: 1.5rem; font-weight: 800; color: #111827; margin: 0 0 .75rem; }
.form-success p { font-size: .95rem; color: #4b5563; margin: 0 0 1.5rem; line-height: 1.6; }
.form-reset {
  display: inline-block;
  padding: .75rem 2rem;
  background: #004e92;
  color: white;
  border: none;
  font-weight: 700;
  border-radius: 999px;
  cursor: pointer;
  font-size: .9rem;
}

@media (max-width: 860px) {
  .contact-grid { grid-template-columns: 1fr; }
}
@media (max-width: 560px) {
  .form-grid { grid-template-columns: 1fr; }
  .form-field.full { grid-column: auto; }
  .contact-form-box { padding: 1.5rem; }
}
</style>

