<template>
  <div class="expert-page">

    <!-- Hero -->
    <section class="expert-hero">
      <div class="container">
        <p class="eyebrow">CONSEJOS DE EXPERTOS</p>
        <h1>Guías Dermatológicas<br>Respaldadas por Especialistas</h1>
        <p class="hero-sub">Consejos basados en evidencia clínica, organizados por tipo de piel y preocupación principal.</p>
        <button class="hero-cta" @click="router.push('/quiz')">Analizar mi piel</button>
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
            <p class="featured-tag">CONSEJO DE LA SEMANA</p>
            <h2>La barrera cutánea lo es todo</h2>
            <p>Una barrera cutánea comprometida está detrás de la mayoría de los problemas de piel — desde sensibilidad y enrojecimiento hasta deshidratación y brotes. Restaurarla empieza con limpiadores suaves, hidratantes con ceramidas y uso constante de protector solar. Todo lo demás es secundario.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Articles grid -->
    <section class="articles-section">
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow blue">GUÍAS Y CONSEJOS</p>
          <h2>Biblioteca de Cuidado de la Piel</h2>
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
            <button class="read-more-btn">Leer guía completa →</button>
          </article>
        </div>
      </div>
    </section>

    <!-- Skin types -->
    <section class="skin-types-section">
      <div class="container">
        <div class="section-heading center">
          <p class="eyebrow blue">CONOCE TU PIEL</p>
          <h2>Tipos de Piel</h2>
          <p>Cada tipo de piel tiene necesidades únicas. Conocer el tuyo es el primer paso para una rutina efectiva.</p>
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
          <p class="eyebrow blue">GLOSARIO DE INGREDIENTES</p>
          <h2>Ingredientes Clave Explicados</h2>
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
        <h2>Obtén Tu Rutina Personalizada</h2>
        <p>Realiza nuestro análisis de piel y recibe una rutina adaptada a tu perfil único.</p>
        <div class="cta-buttons">
          <button class="btn-primary" @click="router.push('/quiz')">Comenzar análisis</button>
          <button class="btn-ghost" @click="router.push('/tienda')">Ver productos</button>
        </div>
      </div>
    </section>

    <!-- ── Modal de artículo ── -->
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
            <button class="modal-close" @click="closeArticle" aria-label="Cerrar">✕</button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <p class="modal-excerpt">{{ activeArticle.excerpt }}</p>

            <div v-if="activeArticle.body" class="modal-content">
              <p v-for="(paragraph, i) in activeArticle.body" :key="i">{{ paragraph }}</p>
            </div>

            <div v-if="activeArticle.tips.length" class="modal-tips">
              <h4>Consejos prácticos</h4>
              <ul>
                <li v-for="tip in activeArticle.tips" :key="tip">{{ tip }}</li>
              </ul>
            </div>

            <div v-if="activeArticle.relatedConcerns?.length" class="modal-related-concerns">
              <h4>Tipos de piel que más se benefician</h4>
              <div class="concern-chips">
                <span v-for="c in activeArticle.relatedConcerns" :key="c" class="concern-chip">{{ c }}</span>
              </div>
            </div>

            <div class="modal-disclaimer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              <p>Esta información es educativa y no sustituye la consulta con un dermatólogo certificado. Si tienes dudas sobre tu piel, te recomendamos agendar una orientación con un especialista.</p>
            </div>

            <div class="modal-actions">
              <button class="btn-primary" @click="() => { closeArticle(); router.push('/quiz') }">Analizar mi piel</button>
              <button class="btn-ghost-dark" @click="() => { closeArticle(); router.push('/diagnostics') }">Consultar especialista</button>
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
    category: 'HIDRATACIÓN',
    readTime: '3 min',
    title: 'Hidratación vs. Humectación: ¿Cuál es la diferencia?',
    excerpt: 'Muchas personas confunden estos dos conceptos. La hidratación agrega agua a las células de la piel, mientras que la humectación atrapa y sella esa agua.',
    body: [
      'La hidratación y la humectación son dos procesos diferentes pero complementarios. Los productos hidratantes, como el ácido hialurónico, atraen agua hacia las capas superficiales de la piel. Los humectantes, como ceramidas o aceites, crean una barrera que impide que esa agua se evapore.',
      'Para una piel bien hidratada necesitas ambos: primero un hidratante (suero con ácido hialurónico aplicado sobre piel húmeda), y después un humectante (crema o loción) que selle la hidratación. Saltarte uno de los dos pasos reduce la efectividad a la mitad.',
      'En climas secos o con aire acondicionado, la piel pierde agua más rápidamente. En estos casos, los sueros con glicerina y panthenol actúan como reservorios que mantienen el nivel de hidratación estable durante horas.',
    ],
    tips: ['Aplica ácido hialurónico sobre piel ligeramente húmeda', 'Sella con una crema hidratante a continuación', 'Bebe al menos 1.5 litros de agua al día', 'Evita duchas con agua muy caliente: resecan la piel'],
    relatedConcerns: ['Piel seca', 'Piel deshidratada', 'Piel normal', 'Piel madura'],
  },
  {
    id: 2,
    color: 'linear-gradient(135deg,#f77f00,#fcbf49)',
    svgPath: SVG_SUN,
    category: 'PROTECCIÓN SOLAR',
    readTime: '4 min',
    title: '¿Por Qué el SPF Es el Paso Más Importante de Tu Rutina?',
    excerpt: 'La protección solar previene el envejecimiento prematuro, la hiperpigmentación y el cáncer de piel. Los dermatólogos coinciden: ninguna rutina está completa sin SPF.',
    body: [
      'El sol emite dos tipos de radiación que afectan la piel: UVA (penetra profundo, causa envejecimiento y manchas) y UVB (quema la superficie, principal responsable del cáncer de piel). Un protector de amplio espectro con SPF 30 o superior bloquea más del 97% de los rayos UVB y una parte significativa de los UVA.',
      'El error más común es aplicar protector solar solo cuando hay sol directo. Los rayos UVA penetran nubes y cristales, lo que significa que la exposición acumulada en interiores, en el auto o en días nublados también daña la piel a largo plazo.',
      'La cantidad importa: para el rostro, aplica una cantidad equivalente a una moneda de un peso (unos 0.75 mL). Aplicar muy poco reduce significativamente la protección real. Reaplicar cada 2 horas si estás al exterior no es opcional.',
    ],
    tips: ['Aplica SPF 30+ todas las mañanas como último paso', 'Reaplicar cada 2 horas si estás al exterior', 'Úsalo incluso en días nublados o en interiores', 'El SPF no sustituye ropa, gorras y sombra'],
    relatedConcerns: ['Todo tipo de piel', 'Manchas', 'Piel fotosensible', 'Anti-envejecimiento'],
  },
  {
    id: 3,
    color: 'linear-gradient(135deg,#7b2d8b,#c77dff)',
    svgPath: SVG_LAYERS,
    category: 'ACTIVOS',
    readTime: '5 min',
    title: 'Cómo Capas Correctamente Los Productos de Skincare',
    excerpt: 'Aplicar productos en el orden equivocado reduce su efectividad. La regla general: del más ligero al más denso, base acuosa antes que oleosa.',
    body: [
      'El orden de aplicación importa porque determina qué ingredientes logran penetrar y cuáles quedan bloqueados. Aplicar una crema densa antes de un suero, por ejemplo, impide que los activos del suero lleguen a las capas donde son más efectivos.',
      'El orden estándar recomendado por dermatólogos es: limpiador → tónico → suero → crema hidratante → protector solar (de mañana) o aceite facial (de noche). Cada capa debe ser absorbida parcialmente antes de aplicar la siguiente (30-60 segundos es suficiente).',
      'Combinar ciertos activos puede irritar la piel. El retinol y los AHA/BHA no deben usarse la misma noche en pieles sensibles, ya que ambos renuevan la epidermis y pueden causar descamación excesiva. La vitamina C y el niacinamide, por el contrario, se complementan bien.',
    ],
    tips: ['Orden AM: limpiador → tónico → suero → hidratante → SPF', 'Orden PM: limpiador → tónico → suero → hidratante → aceite/retinol', 'Espera 30 segundos entre activos potentes', 'No mezcles retinol con AHA/BHA la misma noche'],
    relatedConcerns: ['Piel con acné', 'Manchas', 'Anti-envejecimiento', 'Piel madura'],
  },
  {
    id: 4,
    color: 'linear-gradient(135deg,#2d6a4f,#95d5b2)',
    svgPath: SVG_SPA,
    category: 'PIEL SENSIBLE',
    readTime: '3 min',
    title: 'Cómo Construir Una Rutina Para Piel Reactiva',
    excerpt: 'La piel sensible necesita un enfoque minimalista y sin fragancia. Menos pasos, fórmulas más suaves y prueba de parche para cada producto nuevo.',
    body: [
      'La piel sensible o reactiva reacciona a estímulos que otras pieles toleran sin problema: cambios de temperatura, ingredientes activos, fragancias, alcohol. La clave no es eliminar todos los productos sino simplificar al máximo y elegir con criterio.',
      'Una rutina básica para piel sensible tiene solo 3-4 pasos: limpiador suave sin sulfatos → hidratante con ceramidas y sin fragancia → protector solar de filtro mineral (zinc, titanio). Añadir más pasos sin necesidad aumenta el riesgo de irritación acumulada.',
      'La prueba de parche es esencial: aplica el producto nuevo en la parte interna del antebrazo o detrás de la oreja durante 24-48 horas antes de usarlo en el rostro. Si hay enrojecimiento, picazón o inflamación, descarta ese producto.',
    ],
    tips: ['Máximo 3-4 productos en tu rutina', 'Evita fragancias sintéticas y alcohol desnaturalizado', 'Introduce un producto nuevo a la vez, nunca varios simultáneos', 'Los filtros minerales (zinc) son más tolerados que los químicos'],
    relatedConcerns: ['Piel sensible', 'Piel con rosácea', 'Barrera comprometida', 'Piel reactiva'],
  },
  {
    id: 5,
    color: 'linear-gradient(135deg,#1d3557,#457b9d)',
    svgPath: SVG_CLEAN,
    category: 'LIMPIEZA',
    readTime: '2 min',
    title: 'Doble Limpieza: ¿Quién La Necesita y Quién No?',
    excerpt: 'La doble limpieza (limpiador oleoso + limpiador acuoso) elimina eficazmente el maquillaje y el protector solar. No es necesaria para todos.',
    body: [
      'La doble limpieza nació en Corea como parte de las rutinas de cuidado intensivo. El primer paso (aceite o bálsamo) disuelve impurezas liposolubles: maquillaje resistente al agua, protector solar, exceso de sebo. El segundo paso (limpiador espumante) elimina residuos acuosos y deja la piel limpia sin resecarla.',
      'Para quienes usan protector solar mineral pesado o maquillaje de cobertura alta, la doble limpieza asegura que ningún residuo quede bloqueando los poros. Si usas solo protector solar ligero y sin maquillaje, un buen limpiador convencional es suficiente.',
      'Las pieles secas y sensibles deben evitar el paso del aceite si este las deja con sensación de tirantez. Los limpiadores en crema o leche cumplen una función similar sin el riesgo de desequilibrar el manto ácido de la piel.',
    ],
    tips: ['Úsala si llevas maquillaje pesado o SPF denso', 'Piel seca/sensible: omite el primer paso aceite', 'Agua tibia siempre — el agua caliente reseca', 'Dos veces al día es suficiente; más puede alterar la barrera'],
    relatedConcerns: ['Piel mixta', 'Piel grasa', 'Piel normal', 'Piel con acné'],
  },
  {
    id: 6,
    color: 'linear-gradient(135deg,#9b2226,#e9c46a)',
    svgPath: SVG_AGE,
    category: 'ANTI-ENVEJECIMIENTO',
    readTime: '4 min',
    title: 'Retinol: Guía Para Principiantes',
    excerpt: 'El retinol es el estándar de oro anti-envejecimiento, pero requiere paciencia y una introducción gradual para evitar irritación.',
    body: [
      'El retinol es un derivado de la vitamina A que acelera la renovación celular, estimula la producción de colágeno y suaviza líneas finas. Sus efectos están bien documentados científicamente y es uno de los pocos ingredientes anti-aging con décadas de investigación clínica detrás.',
      'El error más común al empezar con retinol es usar concentraciones altas de inmediato. La piel necesita tiempo para adaptarse. Empieza con 0.025% o 0.05% una vez por semana, durante 2 semanas. Si no hay irritación, aumenta a dos veces por semana, y así gradualmente hasta llegar a uso diario.',
      'El retinol fotosensibiliza la piel, por lo que debe aplicarse exclusivamente de noche. Al día siguiente, un SPF 30+ es obligatorio. Combinarlo con un humectante sólido (ceramidas, glicerina, pantenol) reduce significativamente la descamación inicial.',
    ],
    tips: ['Comienza con concentración 0.025–0.05%', 'Aplica solo de noche, sobre piel seca', 'Siempre hidratante después y SPF a la mañana siguiente', 'Si hay irritación excesiva, usa el método "sandwich": hidratante → retinol → hidratante'],
    relatedConcerns: ['Anti-envejecimiento', 'Manchas', 'Piel madura', 'Textura irregular'],
  },
  {
    id: 7,
    color: 'linear-gradient(135deg,#023e8a,#0096c7)',
    svgPath: SVG_OILY,
    category: 'PIEL GRASA',
    readTime: '3 min',
    title: 'Controlar el Exceso de Grasa Sin Dañar la Barrera',
    excerpt: 'La limpieza excesiva y los productos agresivos producen el efecto contrario: más grasa. El equilibrio es la clave.',
    body: [
      'La piel grasa produce sebo en exceso, lo que puede obstruir los poros y generar brotes. El error más frecuente es tratar de eliminar toda la grasa, lo cual activa un mecanismo de rebote: la piel detecta que está "seca" y produce más sebo para compensar.',
      'La niacinamida al 4-10% es uno de los ingredientes más estudiados para regular la producción de sebo. Reduce el tamaño visible de los poros, mejora la textura y equilibra la piel sin resecarla. El ácido salicílico (BHA) exfolia dentro del poro, previniendo la acumulación que genera puntos negros.',
      'Las pieles grasas también necesitan hidratante. Un gel hidratante ligero (base de agua, sin aceite) mantiene la barrera intacta sin añadir brillo. Evitar el paso de hidratante porque "la piel ya tiene grasa" es un mito que empeora el problema a largo plazo.',
    ],
    tips: ['Limpiador suave espumante dos veces al día', 'Niacinamida: regula el sebo sin resecar', 'Gel hidratante sin aceite: no te saltes este paso', 'Exfolia con ácido salicílico 2-3 veces por semana'],
    relatedConcerns: ['Piel grasa', 'Piel mixta', 'Acné', 'Poros dilatados'],
  },
  {
    id: 8,
    color: 'linear-gradient(135deg,#2b9348,#55a630)',
    svgPath: SVG_ROUTINE,
    category: 'RUTINAS',
    readTime: '5 min',
    title: 'Los 5 Productos Que Toda Rutina Necesita',
    excerpt: 'No necesitas 12 pasos. La mayoría de los dermatólogos coincide: una rutina sólida de 5 productos cubre todo lo que tu piel necesita.',
    body: [
      'La industria del skincare tiene incentivos para hacer creer que necesitas docenas de productos. La realidad clínica es diferente: la mayoría de las pieles responden muy bien a una rutina de 4-5 pasos bien elegidos y aplicados con constancia.',
      'El limpiador es la base de todo: determina el estado de la piel antes de cualquier otro producto. Un buen limpiador elimina suciedad sin comprometer la barrera. El tratamiento (suero) aborda el problema específico de tu piel. La hidratante sella y protege. El SPF previene daño acumulado. El retinol o reparador nocturno trabaja mientras duermes.',
      'La constancia supera a la complejidad. Una rutina de 5 pasos aplicada cada día durante 3 meses dará mejores resultados que una rutina de 12 pasos aplicada de forma irregular. Tu piel prefiere estabilidad.',
    ],
    tips: ['AM: limpiador → suero → hidratante → SPF', 'PM: limpiador → suero → hidratante → retinol o reparador', 'Introduce cambios de a uno por vez', 'Dale al menos 4 semanas a cada producto antes de juzgarlo'],
    relatedConcerns: ['Todo tipo de piel', 'Principiantes', 'Rutina básica'],
  },
]

const skinTypes = [
  {
    name: 'Piel Seca',
    initial: 'S',
    color: 'linear-gradient(135deg,#0077b6,#90e0ef)',
    description: 'Produce poco sebo y tiene dificultad para retener humedad. A menudo se siente tensa y puede mostrar descamación.',
    tips: ['Limpiadores cremosos sin sulfatos agresivos', 'Hidratante aplicado sobre piel húmeda', 'Busca ceramidas y ácidos grasos en los ingredientes'],
  },
  {
    name: 'Piel Normal',
    initial: 'N',
    color: 'linear-gradient(135deg,#2d6a4f,#95d5b2)',
    description: 'Bien equilibrada: ni demasiado grasa ni demasiado seca. Pocos brotes y poros pequeños.',
    tips: ['Mantén tu rutina actual', 'Enfócate en prevención con SPF diario', 'Los sueros antioxidantes ayudan a largo plazo'],
  },
  {
    name: 'Piel Mixta',
    initial: 'M',
    color: 'linear-gradient(135deg,#7b2d8b,#c77dff)',
    description: 'Zona T (frente, nariz, mentón) grasa con mejillas normales o secas. El tipo de piel más común.',
    tips: ['Limpiador suave y equilibrante', 'Hidratante ligera para todo el rostro', 'Trata solo la zona T si es necesario'],
  },
  {
    name: 'Piel Grasa',
    initial: 'G',
    color: 'linear-gradient(135deg,#023e8a,#48cae4)',
    description: 'Produce sebo en exceso. Propensa a poros dilatados, brillo y brotes.',
    tips: ['Limpia dos veces al día', 'Evita cremas pesadas y aceites comedogénicos', 'Niacinamida + ácido salicílico son tus aliados'],
  },
]

const ingredients = [
  { name: 'Ácido Hialurónico', benefit: 'Hidratación', description: 'Atrae hasta 1000 veces su peso en agua, hidratando y voluminizando todos los tipos de piel.' },
  { name: 'Niacinamida', benefit: 'Multi-función', description: 'Regula el sebo, mejora los poros, unifica el tono y fortalece la barrera cutánea.' },
  { name: 'Ceramidas', benefit: 'Reparación de barrera', description: 'Lípidos naturales que mantienen unidas las células cutáneas y previenen la pérdida de agua.' },
  { name: 'Retinol', benefit: 'Anti-envejecimiento', description: 'Derivado de vitamina A que acelera la renovación celular, reduce arrugas y aclara manchas.' },
  { name: 'Vitamina C', benefit: 'Iluminación', description: 'Antioxidante que neutraliza radicales libres, unifica el tono y estimula el colágeno.' },
  { name: 'Ácido Salicílico', benefit: 'Acné y poros', description: 'BHA que exfolia dentro del poro, elimina bloqueos y reduce brotes.' },
  { name: 'Pantenol (B5)', benefit: 'Calmante', description: 'Calma la inflamación, apoya la cicatrización y añade una capa de hidratación.' },
  { name: 'SPF (Protector Solar)', benefit: 'Protección', description: 'Protege contra daño UVA/UVB: el ingrediente anti-envejecimiento más efectivo disponible.' },
]
</script>

<style scoped>
.expert-page { background: #f8fafc; min-height: 100vh; }
.dark .expert-page { background: #0f172a; }

.container { width: min(1280px, 92%); margin: 0 auto; }

/* ── Hero ── */
.expert-hero { background: linear-gradient(135deg,#004e92,#5dbcd2); padding: 5rem 0 4rem; text-align: center; color: white; }
.expert-hero h1 { font-size: clamp(2.2rem, 5vw, 4rem); font-weight: 800; margin: 0.5rem 0 1rem; line-height: 1.1; }
.hero-sub { font-size: 1.1rem; max-width: 600px; margin: 0 auto 2rem; opacity: 0.9; line-height: 1.7; }
.hero-cta { background: white; color: #004e92; border: none; padding: 1rem 2rem; font-weight: 800; font-size: 1rem; cursor: pointer; border-radius: 999px; }
.hero-cta:hover { background: #eef5fd; }

.eyebrow { font-size: 0.75rem; letter-spacing: 0.22em; font-weight: 700; color: rgba(255,255,255,0.7); text-transform: uppercase; margin: 0 0 0.8rem; }
.eyebrow.blue { color: #004e92; }
.dark .eyebrow.blue { color: #5dbcd2; }

/* ── Featured ── */
.featured-section { padding: 3.5rem 0; }
.featured-card { display: grid; grid-template-columns: 80px 1fr; gap: 2rem; align-items: start; background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 2rem; box-shadow: 0 8px 24px rgba(0,0,0,.04); }
.dark .featured-card { background: #1e293b; border-color: #334155; }
.featured-visual { width: 80px; height: 80px; border-radius: 20px; display: grid; place-items: center; flex-shrink: 0; }
.featured-tag { font-size: 0.72rem; letter-spacing: 0.2em; font-weight: 700; color: #5dbcd2; text-transform: uppercase; margin: 0 0 0.5rem; }
.featured-card h2 { font-size: 1.8rem; font-weight: 800; color: #0f172a; margin: 0 0 0.75rem; }
.dark .featured-card h2 { color: #f1f5f9; }
.featured-card p { color: #475569; line-height: 1.75; margin: 0; }
.dark .featured-card p { color: #94a3b8; }

/* ── Articles ── */
.articles-section { padding: 3rem 0 4rem; }
.section-heading { margin-bottom: 2rem; }
.section-heading.center { text-align: center; max-width: 700px; margin: 0 auto 2.5rem; }
.section-heading h2 { font-size: clamp(1.8rem, 3vw, 2.6rem); font-weight: 800; color: #0f172a; margin: 0.3rem 0 0; }
.dark .section-heading h2 { color: #f1f5f9; }
.section-heading p { color: #64748b; margin: 0.5rem 0 0; }
.dark .section-heading p { color: #94a3b8; }

.articles-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2rem; }
.article-card { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 0; overflow: hidden; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; }
.dark .article-card { background: #1e293b; border-color: #334155; }
.article-card:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(0,0,0,.12); }
.article-card:focus { outline: 2px solid #5dbcd2; outline-offset: 2px; }

.article-visual { height: 100px; display: grid; place-items: center; }
.article-meta { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem 0; }
.article-tag { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; color: #5dbcd2; text-transform: uppercase; }
.article-read { font-size: 0.72rem; color: #94a3b8; }
.article-card h3 { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin: 0.5rem 1.25rem 0.4rem; line-height: 1.35; }
.dark .article-card h3 { color: #f1f5f9; }
.article-excerpt { font-size: 0.84rem; color: #64748b; line-height: 1.6; margin: 0 1.25rem 0.75rem; flex: 1; }
.dark .article-excerpt { color: #94a3b8; }
.read-more-btn { margin: 0 1.25rem 1.25rem; align-self: flex-start; background: none; border: none; color: #004e92; font-weight: 700; font-size: 0.82rem; cursor: pointer; padding: 0; }
.dark .read-more-btn { color: #5dbcd2; }

/* ── Skin types ── */
.skin-types-section { padding: 4rem 0; background: white; }
.dark .skin-types-section { background: #1e293b; }
.skin-types-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2rem; }
.skin-type-card { border: 1px solid #e2e8f0; border-radius: 20px; padding: 1.5rem; }
.dark .skin-type-card { border-color: #334155; background: #0f172a; }
.skin-type-badge { width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center; font-size: 1.4rem; font-weight: 900; color: white; margin-bottom: 0.75rem; }
.skin-type-card h3 { font-size: 1.1rem; font-weight: 800; color: #0f172a; margin: 0 0 0.5rem; }
.dark .skin-type-card h3 { color: #f1f5f9; }
.skin-type-card p { font-size: 0.88rem; color: #64748b; line-height: 1.6; margin: 0 0 0.75rem; }
.dark .skin-type-card p { color: #94a3b8; }
.skin-type-card ul { padding-left: 1rem; margin: 0; }
.skin-type-card li { font-size: 0.82rem; color: #475569; margin-bottom: 0.35rem; }
.dark .skin-type-card li { color: #94a3b8; }

/* ── Ingredients ── */
.ingredients-section { padding: 4rem 0; }
.ingredients-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.ingredient-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.25rem; }
.dark .ingredient-card { background: #1e293b; border-color: #334155; }
.ingredient-card strong { display: block; font-size: 1rem; font-weight: 800; color: #0f172a; margin-bottom: 0.25rem; }
.dark .ingredient-card strong { color: #f1f5f9; }
.ing-benefit { display: inline-block; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; color: #5dbcd2; text-transform: uppercase; background: #eef9fc; padding: 0.2rem 0.5rem; border-radius: 999px; margin-bottom: 0.6rem; }
.dark .ing-benefit { background: #0f3348; }
.ingredient-card p { font-size: 0.85rem; color: #64748b; line-height: 1.6; margin: 0; }
.dark .ingredient-card p { color: #94a3b8; }

/* ── CTA ── */
.expert-cta { padding: 5rem 0; background: linear-gradient(135deg,#004e92,#5dbcd2); text-align: center; color: white; }
.expert-cta h2 { font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 800; margin: 0 0 1rem; }
.expert-cta p { font-size: 1.1rem; opacity: 0.9; margin: 0 0 2rem; }
.cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.btn-primary { background: white; color: #004e92; border: none; padding: 1rem 2rem; font-weight: 800; cursor: pointer; border-radius: 999px; font-size: 1rem; }
.btn-primary:hover { background: #eef5fd; }
.btn-ghost { background: transparent; color: white; border: 2px solid rgba(255,255,255,0.6); padding: 1rem 2rem; font-weight: 800; cursor: pointer; border-radius: 999px; font-size: 1rem; }
.btn-ghost:hover { background: rgba(255,255,255,0.1); }

/* ── Modal ── */
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
.dark .modal-panel { background: #1e293b; }
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
.dark .modal-excerpt { color: #94a3b8; }

.modal-content p { font-size: 0.92rem; color: #475569; line-height: 1.75; margin: 0 0 1rem; }
.dark .modal-content p { color: #94a3b8; }

.modal-tips { margin: 1.25rem 0; background: #f0f9ff; border-radius: 16px; padding: 1.25rem 1.5rem; }
.dark .modal-tips { background: #0f2d3d; }
.modal-tips h4 { font-size: 0.85rem; font-weight: 700; color: #004e92; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 0.75rem; }
.dark .modal-tips h4 { color: #5dbcd2; }
.modal-tips ul { padding-left: 1.2rem; margin: 0; }
.modal-tips li { font-size: 0.9rem; color: #334155; margin-bottom: 0.4rem; line-height: 1.5; }
.dark .modal-tips li { color: #cbd5e1; }

.modal-related-concerns { margin: 1.25rem 0; }
.modal-related-concerns h4 { font-size: 0.82rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 0.6rem; }
.concern-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.concern-chip { background: #e0f2fe; color: #0369a1; font-size: 0.8rem; font-weight: 600; padding: 0.3rem 0.75rem; border-radius: 999px; }
.dark .concern-chip { background: #0f3348; color: #7dd3fc; }

.modal-disclaimer { display: flex; gap: 0.75rem; align-items: flex-start; background: #fefce8; border: 1px solid #fde047; border-radius: 12px; padding: 1rem 1.25rem; margin: 1.25rem 0; }
.dark .modal-disclaimer { background: #1c1408; border-color: #713f12; }
.modal-disclaimer svg { color: #b45309; flex-shrink: 0; margin-top: 2px; }
.modal-disclaimer p { font-size: 0.83rem; color: #78350f; line-height: 1.6; margin: 0; }
.dark .modal-disclaimer p { color: #fbbf24; }

.modal-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1.5rem; }
.modal-actions .btn-primary { background: #004e92; color: white; border: none; padding: 0.85rem 1.5rem; font-weight: 700; cursor: pointer; border-radius: 999px; font-size: 0.92rem; }
.modal-actions .btn-primary:hover { background: #003a70; }
.btn-ghost-dark { background: transparent; color: #004e92; border: 2px solid #004e92; padding: 0.85rem 1.5rem; font-weight: 700; cursor: pointer; border-radius: 999px; font-size: 0.92rem; }
.dark .btn-ghost-dark { color: #5dbcd2; border-color: #5dbcd2; }
.btn-ghost-dark:hover { background: #eef5fd; }

/* ── Responsive ── */
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
