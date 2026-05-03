<template>
  <div class="story-page">

    <!-- Hero -->
    <section class="story-hero">
      <div class="container">
        <p class="eyebrow">NUESTRA HISTORIA</p>
        <h1>Cuidado dermatológico<br>confiable, accesible<br>y personalizado</h1>
        <p class="hero-sub">PharmaDerm nació para acercar productos dermatológicos de calidad y orientación real a quienes los necesitan, sin complicaciones ni sobrecostos.</p>
        <div class="hero-actions">
          <button class="hero-cta" @click="router.push('/quiz')">Analizar mi piel</button>
          <button class="hero-ghost" @click="router.push('/tienda')">Ver productos</button>
        </div>
      </div>
    </section>

    <!-- Quiénes somos -->
    <section class="about-section">
      <div class="container about-grid">
        <div class="about-text">
          <p class="eyebrow blue">QUIÉNES SOMOS</p>
          <h2>Una microempresa dermatológica comprometida con tu piel</h2>
          <p>PharmaDerm es una microempresa comercial privada dedicada a la venta y distribución de productos dermatológicos y de cuidado de la piel. Nuestro enfoque principal es ofrecer productos confiables, originales y de calidad, especialmente de marcas reconocidas como CeraVe y La Roche-Posay.</p>
          <p>No nos limitamos a vender productos — también brindamos orientación básica, recomendaciones según tipo de piel y seguimiento postventa para que cada cliente encuentre lo que realmente necesita.</p>
          <p>Operamos desde <strong>Santiago de los Caballeros</strong>, con proyección de expansión a nivel nacional a través de ventas digitales y envíos.</p>
        </div>
        <div class="about-highlights">
          <div v-for="h in highlights" :key="h.label" class="highlight-card">
            <div class="highlight-icon" :style="`background: ${h.color}`">
              <span v-html="h.svg"></span>
            </div>
            <strong>{{ h.label }}</strong>
            <p>{{ h.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Misión y Visión -->
    <section class="mission-section">
      <div class="container">
        <div class="mv-grid">
          <div class="mv-card mission">
            <p class="mv-label">MISIÓN</p>
            <h3>¿Por qué existimos?</h3>
            <p>Ofrecer productos dermatológicos de calidad, accesibles y confiables, orientados al cuidado, salud y bienestar de la piel, mediante un servicio responsable, eficiente y personalizado, apoyado en herramientas digitales, orientación básica y una adecuada organización interna que permita satisfacer las necesidades de los clientes.</p>
          </div>
          <div class="mv-card vision">
            <p class="mv-label">VISIÓN</p>
            <h3>¿A dónde vamos?</h3>
            <p>Consolidar progresivamente a PharmaDerm como una microempresa especializada en dermatología, reconocida por la calidad de sus productos, la atención personalizada, la innovación en sus servicios y su compromiso con el cuidado integral de la piel, logrando una presencia estable y competitiva dentro del mercado local.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Valores -->
    <section class="values-section">
      <div class="container">
        <div class="section-heading center">
          <p class="eyebrow blue">LO QUE NOS DEFINE</p>
          <h2>Nuestros Valores</h2>
          <p>Estos principios guían cada decisión, cada recomendación y cada interacción con nuestros clientes.</p>
        </div>
        <div class="values-grid">
          <div v-for="value in values" :key="value.title" class="value-card">
            <div class="value-dot" :style="`background: ${value.color}`"></div>
            <h3>{{ value.title }}</h3>
            <p>{{ value.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Qué nos diferencia -->
    <section class="diff-section">
      <div class="container diff-grid">
        <div>
          <p class="eyebrow blue">QUÉ NOS DIFERENCIA</p>
          <h2>Más que una tienda de productos</h2>
          <p>PharmaDerm organiza su catálogo por necesidad de piel, no solo por marca. Esto hace la compra más fácil y evita confusión. Nuestro modelo incluye:</p>
        </div>
        <div class="diff-list">
          <div v-for="d in differentiators" :key="d" class="diff-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#004e92" width="20" height="20"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
            <span>{{ d }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Modelo de negocio -->
    <section class="model-section">
      <div class="container">
        <div class="section-heading center">
          <p class="eyebrow blue">CÓMO TRABAJAMOS</p>
          <h2>Nuestro Modelo Digital</h2>
          <p>PharmaDerm inicia como tienda digital, acercando los productos directamente a los clientes.</p>
        </div>
        <div class="model-steps">
          <div v-for="(step, i) in modelSteps" :key="step.title" class="model-step">
            <div class="step-number">{{ i + 1 }}</div>
            <h4>{{ step.title }}</h4>
            <p>{{ step.desc }}</p>
          </div>
        </div>
        <div class="channels-row">
          <span v-for="ch in channels" :key="ch" class="channel-chip">{{ ch }}</span>
        </div>
      </div>
    </section>

    <!-- A quién impactamos -->
    <section class="impact-section">
      <div class="container">
        <div class="section-heading center">
          <p class="eyebrow blue">A QUIÉN SERVIMOS</p>
          <h2>Nuestros Clientes</h2>
          <p>PharmaDerm atiende a quienes desean cuidar su piel con productos confiables pero no siempre saben por dónde empezar.</p>
        </div>
        <div class="impact-grid">
          <div v-for="segment in segments" :key="segment.title" class="impact-card">
            <div class="impact-badge" :style="`background: ${segment.color}`">{{ segment.initial }}</div>
            <h4>{{ segment.title }}</h4>
            <p>{{ segment.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Marcas -->
    <section class="brands-section">
      <div class="container">
        <div class="section-heading center">
          <p class="eyebrow blue">MARCAS QUE TRABAJAMOS</p>
          <h2>Calidad Dermatológica Reconocida</h2>
          <p>Trabajamos exclusivamente con marcas con fórmulas validadas y respaldo dermatológico comprobado.</p>
        </div>
        <div class="brands-grid">
          <div v-for="brand in brands" :key="brand.name" class="brand-card">
            <div class="brand-logo" :style="`background: ${brand.color}`">{{ brand.initials }}</div>
            <h3>{{ brand.name }}</h3>
            <p>{{ brand.description }}</p>
            <div class="brand-tags">
              <span v-for="tag in brand.tags" :key="tag" class="brand-tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Proyección futura -->
    <section class="future-section">
      <div class="container future-grid">
        <div>
          <p class="eyebrow light">PROYECCIÓN FUTURA</p>
          <h2>Hacia Dónde Vamos</h2>
          <p>PharmaDerm está en sus etapas iniciales y trabaja para crecer de manera sólida y sostenible. Nuestra proyección incluye:</p>
        </div>
        <div class="future-list">
          <div v-for="f in futureGoals" :key="f" class="future-item">
            <div class="future-dot"></div>
            <span>{{ f }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="story-cta">
      <div class="container">
        <h2>Empieza Tu Rutina Hoy</h2>
        <p>Realiza el análisis de piel, recibe tu rutina personalizada y accede a los productos correctos para ti.</p>
        <div class="cta-buttons">
          <button class="btn-primary" @click="router.push('/quiz')">Analizar mi piel</button>
          <button class="btn-ghost" @click="router.push('/diagnostics')">Consultar especialista</button>
          <button class="btn-ghost" @click="router.push('/tienda')">Ver productos</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const SVG_CHECK = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>'
const SVG_HEART = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
const SVG_STAR  = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>'
const SVG_TRUCK = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zm-.5 1.5l1.96 2.5H17V9.5h2.5zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2.22-3c-.55-.61-1.33-1-2.22-1s-1.67.39-2.22 1H3V6h12v9H8.22zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>'

const highlights = [
  { color: 'linear-gradient(135deg,#004e92,#5dbcd2)', svg: SVG_CHECK, label: 'Productos originales', desc: 'Solo marcas reconocidas con respaldo dermatológico comprobado.' },
  { color: 'linear-gradient(135deg,#2d6a4f,#95d5b2)', svg: SVG_HEART, label: 'Atención personalizada', desc: 'Orientación antes y después de la compra según tu tipo de piel.' },
  { color: 'linear-gradient(135deg,#9b2226,#e9c46a)', svg: SVG_STAR, label: 'Calidad garantizada', desc: 'Seleccionamos productos seguros y confiables para cada necesidad.' },
  { color: 'linear-gradient(135deg,#023e8a,#0096c7)', svg: SVG_TRUCK, label: 'Entrega a domicilio', desc: 'Enviamos a Santiago y con proyección de envíos a nivel nacional.' },
]

const values = [
  { title: 'Responsabilidad', color: '#004e92', description: 'Actuamos con compromiso en la selección, venta y recomendación de productos, entendiendo que trabajamos con artículos relacionados al cuidado de la piel.' },
  { title: 'Calidad', color: '#2d6a4f', description: 'Priorizamos productos seguros, originales y confiables, seleccionados de marcas reconocidas y enfocadas en el bienestar dermatológico.' },
  { title: 'Ética', color: '#7b2d8b', description: 'Todas las operaciones se realizan con transparencia, honestidad y respeto hacia los clientes, proveedores y colaboradores.' },
  { title: 'Compromiso con el cliente', color: '#9b2226', description: 'Brindamos una atención cercana, clara y personalizada, orientando al consumidor antes y después de la compra.' },
  { title: 'Innovación', color: '#023e8a', description: 'Integramos herramientas digitales, estrategias de marketing educativo y recomendaciones personalizadas para mejorar la experiencia del cliente.' },
  { title: 'Servicio', color: '#f77f00', description: 'Promovemos una atención amable, profesional y eficiente, creando confianza y fidelidad en los consumidores.' },
  { title: 'Sostenibilidad', color: '#2b9348', description: 'Desarrollamos acciones responsables con la comunidad y el medio ambiente, especialmente mediante educación y consumo consciente.' },
]

const differentiators = [
  'Catálogo organizado por necesidad de piel, no solo por marca',
  'Análisis de piel personalizado para cada cliente',
  'Orientación básica incluida: no vendes solo un producto, orientas',
  'Seguimiento postventa para verificar resultados',
  'Marketing educativo: publicaciones sobre cuidado real de la piel',
  'Combos de rutinas armados según tipo de piel',
  'Solo productos originales de marcas con respaldo dermatológico',
]

const modelSteps = [
  { title: 'Atracción digital', desc: 'Redes sociales, publicaciones educativas, testimonios y promociones en Instagram, TikTok y WhatsApp Business.' },
  { title: 'Consulta inicial', desc: 'El cliente escribe por WhatsApp o mensaje directo. Recibe orientación básica según tipo de piel y necesidad.' },
  { title: 'Recomendación y venta', desc: 'Se confirma disponibilidad, precio, método de pago y dirección. El pedido se prepara con empaque seguro.' },
  { title: 'Entrega y seguimiento', desc: 'Entrega a domicilio con instrucciones básicas de uso. Seguimiento postventa para asegurar resultados.' },
]

const channels = ['Instagram', 'TikTok', 'WhatsApp Business', 'Catálogo digital', 'Entrega a domicilio', 'Santiago de los Caballeros']

const segments = [
  { initial: 'J', color: 'linear-gradient(135deg,#004e92,#5dbcd2)', title: 'Jóvenes con acné', desc: 'Adolescentes y adultos jóvenes con exceso de grasa, comedones o dudas sobre rutinas básicas.' },
  { initial: 'A', color: 'linear-gradient(135deg,#2d6a4f,#95d5b2)', title: 'Adultos en prevención', desc: 'Personas interesadas en hidratación, protección solar y cuidado diario preventivo.' },
  { initial: 'S', color: 'linear-gradient(135deg,#7b2d8b,#c77dff)', title: 'Piel sensible', desc: 'Clientes con piel irritada, barrera comprometida o reacciones frecuentes a productos genéricos.' },
  { initial: 'M', color: 'linear-gradient(135deg,#9b2226,#e9c46a)', title: 'Manchas y tono desigual', desc: 'Adultos interesados en hiperpigmentación, manchas solares y fotoenvejecimiento.' },
  { initial: 'H', color: 'linear-gradient(135deg,#f77f00,#fcbf49)', title: 'Cambios hormonales', desc: 'Mujeres en etapas hormonales como premenopausia o menopausia que buscan adaptación de rutina.' },
  { initial: 'O', color: 'linear-gradient(135deg,#023e8a,#0096c7)', title: 'Originales y confiables', desc: 'Clientes que quieren productos dermatológicos originales sin depender exclusivamente de farmacias grandes.' },
]

const brands = [
  {
    name: 'La Roche-Posay',
    initials: 'LRP',
    color: '#004e92',
    description: 'Marca dermocosmética francesa desarrollada con más de 300 dermatólogos. Reconocida mundialmente por sus fórmulas para pieles sensibles, acné, manchas y protección solar.',
    tags: ['SPF', 'Piel sensible', 'Acné', 'Manchas'],
  },
  {
    name: 'CeraVe',
    initials: 'CV',
    color: '#2d6a4f',
    description: 'Desarrollada con dermatólogos para restaurar y mantener la barrera natural de la piel usando ceramidas esenciales. Recomendada para pieles secas, sensibles y con barrera comprometida.',
    tags: ['Reparación de barrera', 'Hidratación', 'Accesible', 'Suave'],
  },
]

const futureGoals = [
  'Ampliar el inventario con nuevas marcas dermatológicas reconocidas',
  'Fortalecer la presencia digital y el marketing educativo',
  'Establecer alianzas estratégicas con proveedores autorizados',
  'Habilitar envíos nacionales a todas las provincias de la República Dominicana',
  'Desarrollar un punto físico de atención cuando la clientela lo justifique',
  'Ampliar los programas de responsabilidad social: educación sobre cuidado responsable de la piel',
]
</script>

<style scoped>
.story-page { background: #f8fafc; min-height: 100vh; }
.dark .story-page { background: #0f172a; }
.container { width: min(1280px, 92%); margin: 0 auto; }
.eyebrow { font-size: 0.75rem; letter-spacing: 0.22em; font-weight: 700; text-transform: uppercase; margin: 0 0 0.8rem; }
.eyebrow.blue { color: #004e92; }
.dark .eyebrow.blue { color: #5dbcd2; }
.eyebrow.light { color: rgba(255,255,255,0.75); }

/* Hero */
.story-hero { background: linear-gradient(135deg,#004e92,#5dbcd2); padding: 6rem 0 5rem; color: white; }
.story-hero h1 { font-size: clamp(2.2rem, 5.5vw, 4.5rem); font-weight: 800; line-height: 1.1; margin: 0.5rem 0 1.2rem; }
.hero-sub { font-size: 1.1rem; max-width: 600px; line-height: 1.75; opacity: 0.92; margin: 0 0 2rem; }
.hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
.hero-cta { background: white; color: #004e92; border: none; padding: 1rem 2rem; font-weight: 800; font-size: 1rem; cursor: pointer; border-radius: 999px; }
.hero-cta:hover { background: #eef5fd; }
.hero-ghost { background: transparent; color: white; border: 2px solid rgba(255,255,255,0.6); padding: 1rem 2rem; font-weight: 800; font-size: 1rem; cursor: pointer; border-radius: 999px; }
.hero-ghost:hover { background: rgba(255,255,255,0.1); }

/* About */
.about-section { padding: 5rem 0; background: white; }
.dark .about-section { background: #1e293b; }
.about-grid { display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 4rem; align-items: start; }
.about-text h2 { font-size: clamp(1.6rem, 2.8vw, 2.6rem); font-weight: 800; color: #0f172a; margin: 0.5rem 0 1.2rem; line-height: 1.2; }
.dark .about-text h2 { color: #f1f5f9; }
.about-text p { color: #475569; line-height: 1.75; margin-bottom: 1rem; }
.dark .about-text p { color: #94a3b8; }
.about-highlights { display: grid; gap: 1rem; }
.highlight-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; }
.dark .highlight-card { background: #0f172a; border-color: #334155; }
.highlight-icon { width: 40px; height: 40px; border-radius: 10px; display: grid; place-items: center; margin-bottom: 0.25rem; }
.highlight-card strong { font-size: 0.95rem; font-weight: 800; color: #0f172a; }
.dark .highlight-card strong { color: #f1f5f9; }
.highlight-card p { font-size: 0.83rem; color: #64748b; line-height: 1.55; margin: 0; }
.dark .highlight-card p { color: #94a3b8; }

/* Misión / Visión */
.mission-section { padding: 4rem 0; }
.mv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.mv-card { border-radius: 24px; padding: 2.5rem; }
.mv-card.mission { background: linear-gradient(135deg,#004e92,#0077b6); color: white; }
.mv-card.vision { background: linear-gradient(135deg,#2d6a4f,#40916c); color: white; }
.mv-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.8; margin: 0 0 0.5rem; }
.mv-card h3 { font-size: 1.3rem; font-weight: 800; margin: 0 0 1rem; }
.mv-card p { line-height: 1.75; opacity: 0.92; margin: 0; font-size: 0.95rem; }

/* Valores */
.values-section { padding: 5rem 0; background: white; }
.dark .values-section { background: #1e293b; }
.section-heading { margin-bottom: 2rem; }
.section-heading.center { text-align: center; max-width: 700px; margin: 0 auto 2.5rem; }
.section-heading h2 { font-size: clamp(1.8rem, 3vw, 2.6rem); font-weight: 800; color: #0f172a; margin: 0.3rem 0 0; }
.dark .section-heading h2 { color: #f1f5f9; }
.section-heading p { color: #64748b; margin: 0.6rem 0 0; line-height: 1.65; }
.dark .section-heading p { color: #94a3b8; }
.values-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2rem; }
.value-card { border: 1px solid #e2e8f0; border-radius: 20px; padding: 1.5rem; transition: transform 0.2s, box-shadow 0.2s; }
.dark .value-card { border-color: #334155; background: #0f172a; }
.value-card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(0,0,0,.08); }
.value-dot { width: 12px; height: 12px; border-radius: 50%; margin-bottom: 1rem; }
.value-card h3 { font-size: 1rem; font-weight: 800; color: #0f172a; margin: 0 0 0.5rem; }
.dark .value-card h3 { color: #f1f5f9; }
.value-card p { font-size: 0.86rem; color: #64748b; line-height: 1.65; margin: 0; }
.dark .value-card p { color: #94a3b8; }

/* Diferenciadores */
.diff-section { padding: 5rem 0; }
.diff-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; }
.diff-grid h2 { font-size: clamp(1.6rem, 2.8vw, 2.4rem); font-weight: 800; color: #0f172a; margin: 0.5rem 0 1rem; }
.dark .diff-grid h2 { color: #f1f5f9; }
.diff-grid > div:first-child > p { color: #64748b; line-height: 1.7; margin: 0; }
.dark .diff-grid > div:first-child > p { color: #94a3b8; }
.diff-list { display: grid; gap: 0.75rem; }
.diff-item { display: flex; align-items: flex-start; gap: 0.75rem; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0.85rem 1rem; }
.dark .diff-item { background: #1e293b; border-color: #334155; }
.diff-item svg { flex-shrink: 0; margin-top: 2px; }
.diff-item span { font-size: 0.9rem; color: #334155; line-height: 1.5; }
.dark .diff-item span { color: #cbd5e1; }

/* Modelo */
.model-section { padding: 5rem 0; background: white; }
.dark .model-section { background: #1e293b; }
.model-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2rem; margin-bottom: 2rem; }
.model-step { text-align: center; padding: 1.5rem 1rem; }
.step-number { width: 44px; height: 44px; background: #004e92; color: white; font-size: 1.2rem; font-weight: 800; border-radius: 50%; display: grid; place-items: center; margin: 0 auto 1rem; }
.model-step h4 { font-size: 0.95rem; font-weight: 800; color: #0f172a; margin: 0 0 0.5rem; }
.dark .model-step h4 { color: #f1f5f9; }
.model-step p { font-size: 0.84rem; color: #64748b; line-height: 1.6; margin: 0; }
.dark .model-step p { color: #94a3b8; }
.channels-row { display: flex; flex-wrap: wrap; gap: 0.6rem; justify-content: center; }
.channel-chip { background: #eef6ff; color: #004e92; font-size: 0.82rem; font-weight: 700; padding: 0.4rem 0.9rem; border-radius: 999px; }
.dark .channel-chip { background: #0f2d4d; color: #7dd3fc; }

/* Impact */
.impact-section { padding: 5rem 0; }
.impact-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }
.impact-card { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 1.5rem; }
.dark .impact-card { background: #1e293b; border-color: #334155; }
.impact-badge { width: 48px; height: 48px; border-radius: 14px; color: white; font-size: 1.3rem; font-weight: 900; display: grid; place-items: center; margin-bottom: 0.75rem; }
.impact-card h4 { font-size: 0.95rem; font-weight: 800; color: #0f172a; margin: 0 0 0.4rem; }
.dark .impact-card h4 { color: #f1f5f9; }
.impact-card p { font-size: 0.84rem; color: #64748b; line-height: 1.6; margin: 0; }
.dark .impact-card p { color: #94a3b8; }

/* Brands */
.brands-section { padding: 5rem 0; background: white; }
.dark .brands-section { background: #1e293b; }
.brands-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; max-width: 800px; margin: 0 auto; }
.brand-card { border: 1px solid #e2e8f0; border-radius: 24px; padding: 2rem; text-align: center; }
.dark .brand-card { border-color: #334155; background: #0f172a; }
.brand-logo { width: 72px; height: 72px; color: white; font-size: 1.3rem; font-weight: 800; border-radius: 20px; display: grid; place-items: center; margin: 0 auto 1rem; }
.brand-card h3 { font-size: 1.2rem; font-weight: 800; color: #0f172a; margin: 0 0 0.6rem; }
.dark .brand-card h3 { color: #f1f5f9; }
.brand-card p { font-size: 0.9rem; color: #64748b; line-height: 1.65; margin: 0 0 1rem; }
.dark .brand-card p { color: #94a3b8; }
.brand-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; }
.brand-tag { font-size: 0.72rem; font-weight: 700; background: #eef6ff; color: #004e92; padding: 0.25rem 0.6rem; border-radius: 999px; }
.dark .brand-tag { background: #0f2d4d; color: #7dd3fc; }

/* Proyección */
.future-section { padding: 5rem 0; background: linear-gradient(135deg,#004e92,#183a6b); color: white; }
.future-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; }
.future-grid h2 { font-size: clamp(1.8rem, 3vw, 2.8rem); font-weight: 800; color: white; margin: 0.5rem 0 1.2rem; }
.future-grid > div:first-child > p { color: rgba(255,255,255,0.85); line-height: 1.75; margin: 0; }
.future-list { display: grid; gap: 0.85rem; }
.future-item { display: flex; align-items: flex-start; gap: 0.75rem; }
.future-dot { width: 10px; height: 10px; background: #5dbcd2; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }
.future-item span { font-size: 0.92rem; color: rgba(255,255,255,0.88); line-height: 1.6; }

/* CTA */
.story-cta { padding: 5rem 0; text-align: center; background: #f8fafc; }
.dark .story-cta { background: #0f172a; }
.story-cta h2 { font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 800; color: #0f172a; margin: 0 0 1rem; }
.dark .story-cta h2 { color: #f1f5f9; }
.story-cta p { color: #64748b; font-size: 1.1rem; margin: 0 0 2rem; }
.dark .story-cta p { color: #94a3b8; }
.cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.btn-primary { background: #004e92; color: white; border: none; padding: 1rem 2rem; font-weight: 800; cursor: pointer; border-radius: 999px; font-size: 1rem; }
.btn-primary:hover { background: #003b71; }
.btn-ghost { background: transparent; color: #004e92; border: 2px solid #004e92; padding: 1rem 2rem; font-weight: 800; cursor: pointer; border-radius: 999px; font-size: 1rem; }
.dark .btn-ghost { color: #5dbcd2; border-color: #5dbcd2; }
.btn-ghost:hover { background: #eef5fd; }

/* Responsive */
@media (max-width: 1100px) {
  .about-grid, .mv-grid, .diff-grid, .future-grid { grid-template-columns: 1fr; gap: 2rem; }
  .values-grid { grid-template-columns: repeat(2, 1fr); }
  .model-steps { grid-template-columns: repeat(2, 1fr); }
  .impact-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .values-grid, .brands-grid, .impact-grid { grid-template-columns: 1fr; }
  .model-steps { grid-template-columns: 1fr; }
}
</style>
