<template>
  <div class="expert-page">

    <!-- Hero -->
    <section class="expert-hero">
      <div class="container">
        <p class="eyebrow">EXPERT ADVICE</p>
        <h1>Dermatology Guides<br>Backed by Specialists</h1>
        <p class="hero-sub">Evidence-based advice organized by skin type and primary concern.</p>
        <button class="hero-cta" @click="router.push('/quiz')">Analyze my skin</button>
      </div>
    </section>

    <!-- Featured -->
    <section class="featured-section">
      <div class="container">
        <div class="featured-card">
          <div class="featured-visual" style="background: linear-gradient(135deg,#004e92,#5dbcd2)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="32" height="32"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </div>
          <div>
            <p class="featured-tag">TIP OF THE WEEK</p>
            <h2>The skin barrier is everything</h2>
            <p>A compromised skin barrier is behind many skin concerns, from sensitivity and redness to dehydration and breakouts. Restoring it starts with gentle cleansers, ceramide moisturizers and consistent sunscreen. Everything else comes second.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Articles grid -->
    <section class="articles-section">
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow blue">GUIDES AND TIPS</p>
          <h2>Skincare Library</h2>
        </div>
        <div class="articles-grid">
          <article
            v-for="article in articles"
            :key="article.id"
            class="article-card"
            role="button"
            tabindex="0"
            @click="openArticle(article)"
            @keyup.enter="openArticle(article)"
          >
            <div class="article-visual" :style="`background: ${article.color}`">
              <component :is="'svg'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24" height="24" v-html="article.svgPath"></component>
            </div>
            <div class="article-meta">
              <span class="article-tag">{{ article.category }}</span>
              <span class="article-read">{{ article.readTime }}</span>
            </div>
            <h3>{{ article.title }}</h3>
            <p class="article-excerpt">{{ article.excerpt }}</p>
            <button class="read-more-btn">Read full guide -></button>
          </article>
        </div>
      </div>
    </section>

    <!-- Skin types -->
    <section class="skin-types-section">
      <div class="container">
        <div class="section-heading center">
          <p class="eyebrow blue">KNOW YOUR SKIN</p>
          <h2>Skin Types</h2>
          <p>Every skin type has unique needs. Knowing yours is the first step toward an effective routine.</p>
        </div>
        <div class="skin-types-grid">
          <div v-for="type in skinTypes" :key="type.name" class="skin-type-card">
            <div class="skin-type-badge" :style="`background: ${type.color}`">{{ type.initial }}</div>
            <h3>{{ type.name }}</h3>
            <p>{{ type.description }}</p>
            <ul>
              <li v-for="tip in type.tips" :key="tip">{{ tip }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Ingredients glossary -->
    <section class="ingredients-section">
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow blue">INGREDIENT GLOSSARY</p>
          <h2>Key Ingredients Explained</h2>
        </div>
        <div class="ingredients-grid">
          <div v-for="ing in ingredients" :key="ing.name" class="ingredient-card">
            <strong>{{ ing.name }}</strong>
            <span class="ing-benefit">{{ ing.benefit }}</span>
            <p>{{ ing.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="expert-cta">
      <div class="container">
        <h2>Get Your Personalized Routine</h2>
        <p>Complete our skin analysis and receive a routine tailored to your unique profile.</p>
        <div class="cta-buttons">
          <button class="btn-primary" @click="router.push('/quiz')">Start analysis</button>
          <button class="btn-ghost" @click="router.push('/tienda')">View products</button>
        </div>
      </div>
    </section>

    <!-- Article modal -->
    <Teleport to="body">
      <div v-if="activeArticle" class="modal-overlay" @click.self="closeArticle">
        <div class="modal-panel" role="dialog" aria-modal="true">
          <!-- Header visual -->
          <div class="modal-visual" :style="`background: ${activeArticle.color}`">
            <div class="modal-visual-inner">
              <span class="modal-tag">{{ activeArticle.category }}</span>
              <h2>{{ activeArticle.title }}</h2>
              <span class="modal-read">{{ activeArticle.readTime }}</span>
            </div>
            <button class="modal-close" @click="closeArticle" aria-label="Close">x</button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <p class="modal-excerpt">{{ activeArticle.excerpt }}</p>

            <div v-if="activeArticle.body" class="modal-content">
              <p v-for="(paragraph, i) in activeArticle.body" :key="i">{{ paragraph }}</p>
            </div>

            <div v-if="activeArticle.tips.length" class="modal-tips">
              <h4>Practical tips</h4>
              <ul>
                <li v-for="tip in activeArticle.tips" :key="tip">{{ tip }}</li>
              </ul>
            </div>

            <div v-if="activeArticle.relatedConcerns?.length" class="modal-related-concerns">
              <h4>Skin types that benefit most</h4>
              <div class="concern-chips">
                <span v-for="c in activeArticle.relatedConcerns" :key="c" class="concern-chip">{{ c }}</span>
              </div>
            </div>

            <div class="modal-disclaimer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              <p>This information is educational and does not replace a consultation with a certified dermatologist. If you have concerns about your skin, we recommend booking guidance with a specialist.</p>
            </div>

            <div class="modal-actions">
              <button class="btn-primary" @click="() => { closeArticle(); router.push('/quiz') }">Analyze my skin</button>
              <button class="btn-ghost-outline" @click="() => { closeArticle(); router.push('/diagnostics') }">Consult a specialist</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeArticle = ref(null)

function openArticle(article) { activeArticle.value = article }
function closeArticle() { activeArticle.value = null }

// SVG path strings para los iconos de cada tarjeta
const SVG_WATER   = '<path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/>'
const SVG_SUN     = '<path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zm-1.99 6.41H2v2h2.77l.73-2H4.77zM13 1h-2v2.52l2-.6V1zm7.45 3.46l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zM17.5 10.5l.73 2H21v-2h-3.5zM12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16h2v-2.52l-2 .6V22zm-7.45-3.46l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>'
const SVG_LAYERS  = '<path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zm.01-2.54l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z"/>'
const SVG_SPA     = '<path d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zM5.6 10.25c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5C18.4 8.87 17.28 7.75 15.9 7.75c-.53 0-1.01.16-1.42.44l.02-.19C14.5 6.62 13.38 5.5 12 5.5S9.5 6.62 9.5 8l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5zM12 2C6.48 2 2 6.48 2 12c4.97 0 9-4.03 9-9 0 4.97 4.03 9 9 9-4.97 0-9 4.03-9 9z"/>'
const SVG_CLEAN   = '<path d="M9.64 7.64c.23-.5.36-1.05.36-1.64C10 4.01 8.99 3 7.64 3 6.01 3 5.16 4.51 5.01 5.94L2 7l9 4 1-9-2.36 5.64zM22 6l-9-4-1 9 2.36-5.64c-.23.5-.36 1.05-.36 1.64C14 8.99 15.01 10 16.36 10c1.63 0 2.48-1.51 2.63-2.94L22 6zM12 14L3 10l.62 10.22C3.7 21.21 4.53 22 5.53 22h12.95c.99 0 1.83-.79 1.91-1.78L21 10l-9 4z"/>'
const SVG_AGE     = '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>'
const SVG_OILY    = '<path d="M21 6.5c0-2.5-2-4.5-4.5-4.5S12 4 12 6.5c0 1.74 1.01 3.26 2.5 4.03V21h3v-10.47c1.49-.77 2.5-2.29 2.5-4.03zM5 3L3 9h2v12h4V9h2L9 3H5z"/>'
const SVG_ROUTINE = '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>'

const articles = [
  {
    id: 1,
    color: 'linear-gradient(135deg,#0077b6,#00b4d8)',
    svgPath: SVG_WATER,
    category: 'HYDRATION',
    readTime: '3 min',
    title: 'Hydration vs. Moisturizing: What is the difference?',
    excerpt: 'Hydration adds water to the skin, while moisturizing helps seal that water in and protect the barrier.',
    body: [
      'Hydration and moisturizing are different but complementary. Hydrating ingredients such as hyaluronic acid attract water into the upper layers of the skin, while moisturizers with ceramides or emollients help prevent that water from evaporating.',
      'For well-balanced skin, use both: apply a hydrating serum on slightly damp skin, then seal it with a moisturizer or lotion.',
      'Dry climates and air conditioning can increase water loss, so humectants like glycerin and panthenol can help keep hydration stable for longer.',
    ],
    tips: ['Apply hyaluronic acid on slightly damp skin', 'Seal with moisturizer afterward', 'Drink enough water throughout the day', 'Avoid very hot showers because they dry the skin'],
    relatedConcerns: ['Dry skin', 'Dehydrated skin', 'Normal skin', 'Mature skin'],
  },
  {
    id: 2,
    color: 'linear-gradient(135deg,#f77f00,#fcbf49)',
    svgPath: SVG_SUN,
    category: 'SUN PROTECTION',
    readTime: '4 min',
    title: 'Why SPF is the most important step in your routine',
    excerpt: 'Sunscreen helps prevent premature aging, hyperpigmentation and UV damage. No routine is complete without SPF.',
    body: [
      'UVA rays penetrate deeply and contribute to aging and dark spots, while UVB rays burn the surface and are strongly linked to skin cancer risk. Broad-spectrum SPF 30 or higher is a daily essential.',
      'A common mistake is using sunscreen only on sunny days. UVA rays can pass through clouds and windows, so daily exposure adds up over time.',
      'Amount matters: apply enough product to cover the face and reapply every two hours when outdoors.',
    ],
    tips: ['Apply SPF 30+ every morning as the last step', 'Reapply every two hours outdoors', 'Use it even on cloudy days or indoors near windows', 'SPF does not replace hats, shade and protective clothing'],
    relatedConcerns: ['All skin types', 'Dark spots', 'Photosensitive skin', 'Anti-aging'],
  },
  {
    id: 3,
    color: 'linear-gradient(135deg,#7b2d8b,#c77dff)',
    svgPath: SVG_LAYERS,
    category: 'ACTIVES',
    readTime: '5 min',
    title: 'How to layer skincare products correctly',
    excerpt: 'The wrong order can reduce results. A simple rule: apply from thinnest to thickest.',
    body: [
      'Product order matters because it affects which ingredients can reach the skin. A heavy cream before a serum can block the serum from absorbing properly.',
      'A common order is cleanser, toner, serum, moisturizer and sunscreen in the morning. At night, replace sunscreen with a repair product or facial oil when appropriate.',
      'Some actives can irritate when combined. Retinol and AHA/BHA exfoliants should be introduced carefully, especially for sensitive skin.',
    ],
    tips: ['AM: cleanser, serum, moisturizer, SPF', 'PM: cleanser, serum, moisturizer, repair treatment', 'Wait briefly between strong actives', 'Do not overload sensitive skin with too many actives'],
    relatedConcerns: ['Acne-prone skin', 'Dark spots', 'Anti-aging', 'Mature skin'],
  },
  {
    id: 4,
    color: 'linear-gradient(135deg,#2d6a4f,#95d5b2)',
    svgPath: SVG_SPA,
    category: 'SENSITIVE SKIN',
    readTime: '3 min',
    title: 'How to build a routine for reactive skin',
    excerpt: 'Sensitive skin usually does best with fewer steps, fragrance-free formulas and careful patch testing.',
    body: [
      'Reactive skin can respond to temperature changes, fragrance, alcohol or strong actives. The goal is not to avoid all products, but to simplify and choose carefully.',
      'A basic sensitive-skin routine can include a gentle cleanser, a ceramide moisturizer and a mineral sunscreen.',
      'Patch testing helps reduce risk: apply a new product to a small area for 24 to 48 hours before using it on the face.',
    ],
    tips: ['Keep the routine to 3 or 4 products', 'Avoid fragrance and harsh alcohols', 'Introduce one new product at a time', 'Mineral filters are often better tolerated'],
    relatedConcerns: ['Sensitive skin', 'Rosacea-prone skin', 'Compromised barrier', 'Reactive skin'],
  },
  {
    id: 5,
    color: 'linear-gradient(135deg,#1d3557,#457b9d)',
    svgPath: SVG_CLEAN,
    category: 'CLEANSING',
    readTime: '2 min',
    title: 'Double cleansing: who needs it and who does not?',
    excerpt: 'Double cleansing can remove heavy makeup and sunscreen, but it is not necessary for everyone.',
    body: [
      'The first cleanse dissolves oil-soluble residue such as waterproof makeup, sunscreen and excess sebum. The second cleanse removes water-based residue.',
      'If you wear heavy sunscreen or makeup, double cleansing can help prevent pore buildup. If you use only light sunscreen, one good cleanser may be enough.',
      'Dry and sensitive skin should avoid any cleansing step that leaves tightness or irritation.',
    ],
    tips: ['Use it for heavy makeup or dense SPF', 'Dry or sensitive skin can skip the oil step', 'Use lukewarm water', 'Over-cleansing can disrupt the barrier'],
    relatedConcerns: ['Combination skin', 'Oily skin', 'Normal skin', 'Acne-prone skin'],
  },
  {
    id: 6,
    color: 'linear-gradient(135deg,#9b2226,#e9c46a)',
    svgPath: SVG_AGE,
    category: 'ANTI-AGING',
    readTime: '4 min',
    title: 'Retinol: a beginner guide',
    excerpt: 'Retinol is a gold-standard anti-aging ingredient, but it should be introduced gradually.',
    body: [
      'Retinol is a vitamin A derivative that supports cell turnover, collagen production and smoother-looking texture.',
      'Start low and slow. Use it once weekly at first, then increase frequency only if your skin tolerates it.',
      'Retinol is best used at night. Daily sunscreen is essential the next morning.',
    ],
    tips: ['Start with a low concentration', 'Apply at night on dry skin', 'Moisturize afterward and use SPF daily', 'Use the moisturizer-retinol-moisturizer sandwich method if needed'],
    relatedConcerns: ['Anti-aging', 'Dark spots', 'Mature skin', 'Uneven texture'],
  },
  {
    id: 7,
    color: 'linear-gradient(135deg,#023e8a,#0096c7)',
    svgPath: SVG_OILY,
    category: 'OILY SKIN',
    readTime: '3 min',
    title: 'Control excess oil without damaging the barrier',
    excerpt: 'Over-cleansing and harsh products can make oiliness worse. Balance is key.',
    body: [
      'Oily skin produces extra sebum, which can clog pores and lead to breakouts. Stripping the skin can trigger rebound oiliness.',
      'Niacinamide can help regulate sebum and improve the look of pores. Salicylic acid exfoliates inside the pore and helps prevent buildup.',
      'Oily skin still needs moisturizer. A lightweight water-based gel can support the barrier without adding shine.',
    ],
    tips: ['Use a gentle foaming cleanser twice daily', 'Try niacinamide for oil balance', 'Do not skip lightweight moisturizer', 'Use salicylic acid two or three times weekly if tolerated'],
    relatedConcerns: ['Oily skin', 'Combination skin', 'Acne', 'Visible pores'],
  },
  {
    id: 8,
    color: 'linear-gradient(135deg,#2b9348,#55a630)',
    svgPath: SVG_ROUTINE,
    category: 'ROUTINES',
    readTime: '5 min',
    title: 'The 5 products every routine needs',
    excerpt: 'You do not need 12 steps. A consistent routine with a few essentials can cover most skin needs.',
    body: [
      'Most skin responds well to a simple routine chosen carefully and used consistently.',
      'The core routine is cleanser, targeted treatment, moisturizer, sunscreen and a night repair step when needed.',
      'Consistency beats complexity. A routine you can follow daily will perform better than one you abandon.',
    ],
    tips: ['AM: cleanser, serum, moisturizer, SPF', 'PM: cleanser, serum, moisturizer, repair product', 'Change one product at a time', 'Give products several weeks before judging results'],
    relatedConcerns: ['All skin types', 'Beginners', 'Basic routine'],
  },
]

const skinTypes = [
  { name: 'Dry Skin', initial: 'D', color: 'linear-gradient(135deg,#0077b6,#90e0ef)', description: 'Produces little sebum and struggles to retain moisture. It can feel tight or flaky.', tips: ['Use creamy sulfate-free cleansers', 'Apply moisturizer on damp skin', 'Look for ceramides and fatty acids'] },
  { name: 'Normal Skin', initial: 'N', color: 'linear-gradient(135deg,#2d6a4f,#95d5b2)', description: 'Well balanced: not too oily and not too dry, with few breakouts.', tips: ['Maintain your current routine', 'Prioritize daily SPF', 'Antioxidant serums can help long term'] },
  { name: 'Combination Skin', initial: 'C', color: 'linear-gradient(135deg,#7b2d8b,#c77dff)', description: 'An oily T-zone with normal or dry cheeks. It is one of the most common skin types.', tips: ['Use a gentle balancing cleanser', 'Choose a lightweight moisturizer', 'Treat the T-zone only when needed'] },
  { name: 'Oily Skin', initial: 'O', color: 'linear-gradient(135deg,#023e8a,#48cae4)', description: 'Produces excess sebum and is prone to shine, enlarged pores and breakouts.', tips: ['Cleanse twice daily', 'Avoid heavy comedogenic oils', 'Niacinamide and salicylic acid can help'] },
]

const ingredients = [
  { name: 'Hyaluronic Acid', benefit: 'Hydration', description: 'Attracts water to hydrate and plump the look of all skin types.' },
  { name: 'Niacinamide', benefit: 'Multi-function', description: 'Helps regulate oil, refine the look of pores, even tone and support the barrier.' },
  { name: 'Ceramides', benefit: 'Barrier repair', description: 'Natural lipids that help keep skin cells together and reduce water loss.' },
  { name: 'Retinol', benefit: 'Anti-aging', description: 'A vitamin A derivative that supports cell turnover and improves the look of wrinkles and spots.' },
  { name: 'Vitamin C', benefit: 'Brightening', description: 'An antioxidant that helps even tone and support collagen.' },
  { name: 'Salicylic Acid', benefit: 'Acne and pores', description: 'A BHA that exfoliates inside the pore and helps reduce breakouts.' },
  { name: 'Panthenol (B5)', benefit: 'Soothing', description: 'Helps calm the skin and supports barrier recovery.' },
  { name: 'SPF (Sunscreen)', benefit: 'Protection', description: 'Protects against UVA/UVB damage and is the most effective anti-aging step.' },
]

</script>

<style scoped>
.expert-page { background: #f8fafc; min-height: 100vh; }

.container { width: min(1280px, 92%); margin: 0 auto; }

/* -- Hero -- */
.expert-hero { background: linear-gradient(135deg,#004e92,#5dbcd2); padding: 5rem 0 4rem; text-align: center; color: white; }
.expert-hero h1 { font-size: clamp(2.2rem, 5vw, 4rem); font-weight: 800; margin: 0.5rem 0 1rem; line-height: 1.1; }
.hero-sub { font-size: 1.1rem; max-width: 600px; margin: 0 auto 2rem; opacity: 0.9; line-height: 1.7; }
.hero-cta { background: white; color: #004e92; border: none; padding: 1rem 2rem; font-weight: 800; font-size: 1rem; cursor: pointer; border-radius: 999px; }
.hero-cta:hover { background: #eef5fd; }

.eyebrow { font-size: 0.75rem; letter-spacing: 0.22em; font-weight: 700; color: rgba(255,255,255,0.7); text-transform: uppercase; margin: 0 0 0.8rem; }
.eyebrow.blue { color: #004e92; }

/* -- Featured -- */
.featured-section { padding: 3.5rem 0; }
.featured-card { display: grid; grid-template-columns: 80px 1fr; gap: 2rem; align-items: start; background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 2rem; box-shadow: 0 8px 24px rgba(0,0,0,.04); }
.featured-visual { width: 80px; height: 80px; border-radius: 20px; display: grid; place-items: center; flex-shrink: 0; }
.featured-tag { font-size: 0.72rem; letter-spacing: 0.2em; font-weight: 700; color: #5dbcd2; text-transform: uppercase; margin: 0 0 0.5rem; }
.featured-card h2 { font-size: 1.8rem; font-weight: 800; color: #0f172a; margin: 0 0 0.75rem; }
.featured-card p { color: #475569; line-height: 1.75; margin: 0; }

/* -- Articles -- */
.articles-section { padding: 3rem 0 4rem; }
.section-heading { margin-bottom: 2rem; }
.section-heading.center { text-align: center; max-width: 700px; margin: 0 auto 2.5rem; }
.section-heading h2 { font-size: clamp(1.8rem, 3vw, 2.6rem); font-weight: 800; color: #0f172a; margin: 0.3rem 0 0; }
.section-heading p { color: #64748b; margin: 0.5rem 0 0; }

.articles-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2rem; }
.article-card { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 0; overflow: hidden; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; }
.article-card:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(0,0,0,.12); }
.article-card:focus { outline: 2px solid #5dbcd2; outline-offset: 2px; }

.article-visual { height: 100px; display: grid; place-items: center; }
.article-meta { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem 0; }
.article-tag { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; color: #5dbcd2; text-transform: uppercase; }
.article-read { font-size: 0.72rem; color: #94a3b8; }
.article-card h3 { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin: 0.5rem 1.25rem 0.4rem; line-height: 1.35; }
.article-excerpt { font-size: 0.84rem; color: #64748b; line-height: 1.6; margin: 0 1.25rem 0.75rem; flex: 1; }
.read-more-btn { margin: 0 1.25rem 1.25rem; align-self: flex-start; background: none; border: none; color: #004e92; font-weight: 700; font-size: 0.82rem; cursor: pointer; padding: 0; }

/* -- Skin types -- */
.skin-types-section { padding: 4rem 0; background: white; }
.skin-types-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2rem; }
.skin-type-card { border: 1px solid #e2e8f0; border-radius: 20px; padding: 1.5rem; }
.skin-type-badge { width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center; font-size: 1.4rem; font-weight: 900; color: white; margin-bottom: 0.75rem; }
.skin-type-card h3 { font-size: 1.1rem; font-weight: 800; color: #0f172a; margin: 0 0 0.5rem; }
.skin-type-card p { font-size: 0.88rem; color: #64748b; line-height: 1.6; margin: 0 0 0.75rem; }
.skin-type-card ul { padding-left: 1rem; margin: 0; }
.skin-type-card li { font-size: 0.82rem; color: #475569; margin-bottom: 0.35rem; }

/* -- Ingredients -- */
.ingredients-section { padding: 4rem 0; }
.ingredients-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.ingredient-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.25rem; }
.ingredient-card strong { display: block; font-size: 1rem; font-weight: 800; color: #0f172a; margin-bottom: 0.25rem; }
.ing-benefit { display: inline-block; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; color: #5dbcd2; text-transform: uppercase; background: #eef9fc; padding: 0.2rem 0.5rem; border-radius: 999px; margin-bottom: 0.6rem; }
.ingredient-card p { font-size: 0.85rem; color: #64748b; line-height: 1.6; margin: 0; }

/* -- CTA -- */
.expert-cta { padding: 5rem 0; background: linear-gradient(135deg,#004e92,#5dbcd2); text-align: center; color: white; }
.expert-cta h2 { font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 800; margin: 0 0 1rem; }
.expert-cta p { font-size: 1.1rem; opacity: 0.9; margin: 0 0 2rem; }
.cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.btn-primary { background: white; color: #004e92; border: none; padding: 1rem 2rem; font-weight: 800; cursor: pointer; border-radius: 999px; font-size: 1rem; }
.btn-primary:hover { background: #eef5fd; }
.btn-ghost { background: transparent; color: white; border: 2px solid rgba(255,255,255,0.6); padding: 1rem 2rem; font-weight: 800; cursor: pointer; border-radius: 999px; font-size: 1rem; }
.btn-ghost:hover { background: rgba(255,255,255,0.1); }

/* -- Modal -- */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9999;
  display: flex; align-items: flex-end; justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

.modal-panel {
  background: white; border-radius: 24px 24px 24px 24px; width: min(680px, 100%);
  max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease;
}
@keyframes slideUp { from { transform: translateY(40px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

.modal-visual { position: relative; padding: 2.5rem 2rem 2rem; color: white; border-radius: 24px 24px 0 0; }
.modal-visual-inner { padding-right: 2.5rem; }
.modal-tag { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.85; display: block; margin-bottom: 0.5rem; }
.modal-visual h2 { font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 800; margin: 0 0 0.5rem; line-height: 1.2; }
.modal-read { font-size: 0.85rem; opacity: 0.8; }
.modal-close { position: absolute; top: 1.25rem; right: 1.25rem; background: rgba(255,255,255,0.25); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; font-size: 1rem; cursor: pointer; display: grid; place-items: center; }
.modal-close:hover { background: rgba(255,255,255,0.4); }

.modal-body { padding: 1.75rem 2rem 2rem; }
.modal-excerpt { font-size: 1rem; color: #475569; line-height: 1.7; margin: 0 0 1.5rem; font-weight: 500; }

.modal-content p { font-size: 0.92rem; color: #475569; line-height: 1.75; margin: 0 0 1rem; }

.modal-tips { margin: 1.25rem 0; background: #f0f9ff; border-radius: 16px; padding: 1.25rem 1.5rem; }
.modal-tips h4 { font-size: 0.85rem; font-weight: 700; color: #004e92; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 0.75rem; }
.modal-tips ul { padding-left: 1.2rem; margin: 0; }
.modal-tips li { font-size: 0.9rem; color: #334155; margin-bottom: 0.4rem; line-height: 1.5; }

.modal-related-concerns { margin: 1.25rem 0; }
.modal-related-concerns h4 { font-size: 0.82rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 0.6rem; }
.concern-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.concern-chip { background: #e0f2fe; color: #0369a1; font-size: 0.8rem; font-weight: 600; padding: 0.3rem 0.75rem; border-radius: 999px; }

.modal-disclaimer { display: flex; gap: 0.75rem; align-items: flex-start; background: #fefce8; border: 1px solid #fde047; border-radius: 12px; padding: 1rem 1.25rem; margin: 1.25rem 0; }
.modal-disclaimer svg { color: #b45309; flex-shrink: 0; margin-top: 2px; }
.modal-disclaimer p { font-size: 0.83rem; color: #78350f; line-height: 1.6; margin: 0; }

.modal-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1.5rem; }
.modal-actions .btn-primary { background: #004e92; color: white; border: none; padding: 0.85rem 1.5rem; font-weight: 700; cursor: pointer; border-radius: 999px; font-size: 0.92rem; }
.modal-actions .btn-primary:hover { background: #003a70; }
.btn-ghost-outline { background: transparent; color: #004e92; border: 2px solid #004e92; padding: 0.85rem 1.5rem; font-weight: 700; cursor: pointer; border-radius: 999px; font-size: 0.92rem; }
.btn-ghost-outline:hover { background: #eef5fd; }

/* -- Responsive -- */
@media (max-width: 1100px) {
  .articles-grid, .skin-types-grid, .ingredients-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .featured-card { grid-template-columns: 1fr; }
  .articles-grid, .skin-types-grid, .ingredients-grid { grid-template-columns: 1fr; }
  .modal-overlay { padding: 0; align-items: flex-end; }
  .modal-panel { border-radius: 24px 24px 0 0; max-height: 95vh; }
  .modal-body { padding: 1.25rem 1.25rem 2rem; }
}
</style>
