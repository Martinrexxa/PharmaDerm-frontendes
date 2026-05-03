/**
 * i18n.js — Sistema de traducciones ES/EN para PharmaDerm.
 * No requiere instalación de librerías externas.
 *
 * Uso en componente:
 *   import { useI18n } from '@/lib/i18n'
 *   const { t, lang } = useI18n()
 *   t('nav.ourProducts')  →  "OUR PRODUCTS" | "NUESTROS PRODUCTOS"
 */

import { ref, computed } from 'vue'
import storageService from '../services/storageService.js'

const _lang = ref(storageService.get('settings', {})?.language || 'es')

export const translations = {
  es: {
    // Navbar
    nav: {
      ourProducts:    'NUESTROS PRODUCTOS',
      analyzeSkin:    'ANALIZA TU PIEL',
      expertAdvice:   'CONSEJOS EXPERTOS',
      ourStory:       'NUESTRA HISTORIA',
      freeShipping:   'ENVÍO GRATIS EN PEDIDOS MAYORES A RD$3,000 • COMPRA AHORA',
      search:         'Buscar',
      cart:           'Carrito',
      profile:        'Perfil',
    },
    // Mega menú
    menu: {
      face:        'ROSTRO',
      sunscreen:   'PROTECTOR SOLAR',
      body:        'CUERPO',
      skinConcern: 'PREOCUPACIÓN DE PIEL',
      productLine: 'LÍNEA DE PRODUCTO',
    },
    // Profile dropdown
    auth: {
      login:         'Iniciar sesión',
      createAccount: 'Crear cuenta',
      myCart:        'Mi carrito',
      myAccount:     'Mi cuenta',
      settings:      'Configuración',
      logout:        'Cerrar sesión',
      hello:         'Hola',
    },
    // Bottom nav
    bottomNav: {
      home:        'Inicio',
      shop:        'Tienda',
      diagnostics: 'Diagnóstico',
      routine:     'Rutina',
      profile:     'Perfil',
    },
    // Inicio
    home: {
      recommendedBy:  'Recomendado por Expertos',
      heroTitle:      'Cuidado dermatológico recomendado',
      heroSub:        'Restaura la barrera protectora de tu piel con fórmulas clínicamente probadas.',
      shopNow:        'Comprar ahora',
      analyzeSkin:    'Analiza tu piel',
      quizSub:        'Obtén una rutina personalizada en 2 minutos.',
      startQuiz:      'Iniciar quiz de piel',
      bestSellers:    'Más vendidos',
      viewAll:        'Ver todos',
      expertRec:      'Recomendados por expertos',
      officialPartner:'Socio oficial',
      premiumCare:    'Cuidado premium',
      shopBrand:      'Ver marca',
      proGuide:       'Orientación profesional',
      proGuideDesc:   'Conéctate con dermatólogos certificados en República Dominicana.',
      bookAppt:       'Reservar cita',
    },
    // Tienda
    shop: {
      title:          'Nuestra tienda',
      searchPlaceholder: 'Buscar productos...',
      filters:        'Filtros',
      allProducts:    'Todos',
      sortBy:         'Ordenar por',
      addToCart:      'Agregar',
      viewProduct:    'Ver producto',
      noResults:      'No se encontraron productos.',
    },
    // Quiz
    quiz: {
      takeSelfie:      'TOMAR UN SELFIE',
      uploadPhoto:     'CARGAR UNA FOTOGRAFÍA',
      photoRequired:   'Debes subir o tomar una foto para generar tu análisis de piel.',
      skinProfile:     'PERFIL DE LA PIEL',
      aboutYou:        'Acerca de usted',
      confirm:         'CONFIRMAR',
      next:            'SIGUIENTE',
      saveAnalysis:    'Guardar análisis',
      analysisSaved:   'Análisis guardado correctamente.',
      viewRoutine:     'VER RUTINA',
      morning:         'MAÑANA',
      night:           'NOCHE',
      addToBag:        'AGREGAR AL CARRITO',
      viewInShop:      'VER EN TIENDA',
    },
    // Diagnóstico
    diagnostics: {
      title:          'Diagnóstico dermatológico',
      noQuiz:         'Para generar tu diagnóstico personalizado primero debes completar el quiz de piel.',
      doQuiz:         'Hacer quiz',
      bookAppt:       'Reservar cita',
      viewRoutine:    'Ver rutina',
      saveResult:     'Guardar diagnóstico',
    },
    // Rutina
    routine: {
      title:          'Mi rutina personalizada',
      noQuiz:         'Completa el quiz para generar tu rutina personalizada.',
      doQuiz:         'Hacer quiz',
      morning:        'Rutina matutina',
      night:          'Rutina nocturna',
      repeatQuiz:     'Repetir quiz',
      updateAnalysis: 'Actualizar análisis',
    },
    // Checkout
    checkout: {
      title:          'Finalizar compra',
      contact:        'Datos de contacto',
      delivery:       'Dirección de entrega',
      payment:        'Método de pago',
      orderSummary:   'Resumen del pedido',
      subtotal:       'Subtotal',
      shipping:       'Envío',
      tax:            'Impuestos',
      total:          'Total',
      freeShipping:   'Gratis',
      confirm:        'Confirmar compra',
      processing:     'Procesando...',
      successTitle:   '¡Pedido confirmado!',
      successCode:    'Código',
      successMsg:     'Gracias por tu compra. Recibirás un correo de confirmación pronto.',
      emailSent:      'Correo de confirmación enviado.',
      emailFailed:    'El registro se guardó, pero el correo no pudo enviarse porque EmailJS no está configurado.',
      goHome:         'Ir al inicio',
      keepShopping:   'Seguir comprando',
      cardNumber:     'Número de tarjeta',
      cardHolder:     'Nombre del titular',
      expiry:         'Vencimiento',
      cvv:            'CVV',
      simulatedNote:  'Pago simulado — no se realizará ningún cargo real.',
      transferNote:   'Transfiere a una de nuestras cuentas y sube tu comprobante.',
      uploadReceipt:  'Subir comprobante',
      referenceNumber:'Número de referencia',
    },
    // Perfil
    profile: {
      title:       'Mi perfil',
      myData:      'Mis datos',
      orders:      'Pedidos recientes',
      appointments:'Mis citas',
      routine:     'Mi rutina',
      diagnostics: 'Mi diagnóstico',
      settings:    'Configuración',
      darkMode:    'Modo oscuro',
      language:    'Idioma',
      country:     'País',
      currency:    'Moneda',
      saveChanges: 'Guardar cambios',
      logout:      'Cerrar sesión',
      editInfo:    'Editar información',
      cancelEdit:  'Cancelar edición',
    },
    // General
    general: {
      loading:   'Cargando...',
      error:     'Ocurrió un error.',
      save:      'Guardar',
      cancel:    'Cancelar',
      close:     'Cerrar',
      back:      'Volver',
      addToCart: 'Agregar al carrito',
      buyNow:    'Comprar ahora',
      view:      'Ver',
      edit:      'Editar',
      delete:    'Eliminar',
      confirm:   'Confirmar',
    },
  },

  en: {
    nav: {
      ourProducts:  'OUR PRODUCTS',
      analyzeSkin:  'ANALYZE YOUR SKIN',
      expertAdvice: 'EXPERT ADVICE',
      ourStory:     'OUR STORY',
      freeShipping: 'FREE SHIPPING ON ORDERS OVER RD$3,000 • SHOP NOW',
      search:       'Search',
      cart:         'Cart',
      profile:      'Profile',
    },
    menu: {
      face:        'FACE',
      sunscreen:   'SUNSCREEN',
      body:        'BODY',
      skinConcern: 'SKIN CONCERN',
      productLine: 'PRODUCT LINE',
    },
    auth: {
      login:         'Log in',
      createAccount: 'Create account',
      myCart:        'My cart',
      myAccount:     'My account',
      settings:      'Settings',
      logout:        'Log out',
      hello:         'Hello',
    },
    bottomNav: {
      home:        'Home',
      shop:        'Shop',
      diagnostics: 'Diagnostics',
      routine:     'Routine',
      profile:     'Profile',
    },
    home: {
      recommendedBy:  'Recommended by Experts',
      heroTitle:      'Dermatologist Recommended Skincare',
      heroSub:        'Restore your skin\'s protective barrier with clinically proven formulas.',
      shopNow:        'Shop Recommendations',
      analyzeSkin:    'Analyze Your Skin',
      quizSub:        'Get a personalized routine in 2 minutes.',
      startQuiz:      'Start Skin Quiz',
      bestSellers:    'Best Sellers',
      viewAll:        'View All',
      expertRec:      'Expert Recommended',
      officialPartner:'Official Partner',
      premiumCare:    'Premium Care',
      shopBrand:      'Shop Brand',
      proGuide:       'Professional Guidance',
      proGuideDesc:   'Connect with certified dermatologists in the Dominican Republic.',
      bookAppt:       'Book Appointment',
    },
    shop: {
      title:          'Our store',
      searchPlaceholder: 'Search products...',
      filters:        'Filters',
      allProducts:    'All',
      sortBy:         'Sort by',
      addToCart:      'Add',
      viewProduct:    'View',
      noResults:      'No products found.',
    },
    quiz: {
      takeSelfie:    'TAKE A SELFIE',
      uploadPhoto:   'UPLOAD A PHOTO',
      photoRequired: 'You must upload or take a photo to generate your skin analysis.',
      skinProfile:   'SKIN PROFILE',
      aboutYou:      'About you',
      confirm:       'CONFIRM',
      next:          'NEXT',
      saveAnalysis:  'Save analysis',
      analysisSaved: 'Analysis saved successfully.',
      viewRoutine:   'VIEW ROUTINE',
      morning:       'MORNING',
      night:         'NIGHT',
      addToBag:      'ADD TO BAG',
      viewInShop:    'VIEW IN STORE',
    },
    diagnostics: {
      title:       'Dermatological Diagnosis',
      noQuiz:      'To generate your personalized diagnosis you must first complete the skin quiz.',
      doQuiz:      'Take quiz',
      bookAppt:    'Book appointment',
      viewRoutine: 'View routine',
      saveResult:  'Save diagnosis',
    },
    routine: {
      title:          'My personalized routine',
      noQuiz:         'Complete the quiz to generate your personalized routine.',
      doQuiz:         'Take quiz',
      morning:        'Morning routine',
      night:          'Night routine',
      repeatQuiz:     'Repeat quiz',
      updateAnalysis: 'Update analysis',
    },
    checkout: {
      title:         'Checkout',
      contact:       'Contact details',
      delivery:      'Delivery address',
      payment:       'Payment method',
      orderSummary:  'Order summary',
      subtotal:      'Subtotal',
      shipping:      'Shipping',
      tax:           'Tax',
      total:         'Total',
      freeShipping:  'Free',
      confirm:       'Confirm order',
      processing:    'Processing...',
      successTitle:  'Order confirmed!',
      successCode:   'Code',
      successMsg:    'Thank you for your purchase. You will receive a confirmation email soon.',
      emailSent:     'Confirmation email sent.',
      emailFailed:   'Order saved, but email could not be sent because EmailJS is not configured.',
      goHome:        'Go to home',
      keepShopping:  'Keep shopping',
      cardNumber:    'Card number',
      cardHolder:    'Cardholder name',
      expiry:        'Expiry',
      cvv:           'CVV',
      simulatedNote: 'Simulated payment — no real charge will be made.',
      transferNote:  'Transfer to one of our accounts and upload your receipt.',
      uploadReceipt: 'Upload receipt',
      referenceNumber:'Reference number',
    },
    profile: {
      title:       'My profile',
      myData:      'My details',
      orders:      'Recent orders',
      appointments:'My appointments',
      routine:     'My routine',
      diagnostics: 'My diagnosis',
      settings:    'Settings',
      darkMode:    'Dark mode',
      language:    'Language',
      country:     'Country',
      currency:    'Currency',
      saveChanges: 'Save changes',
      logout:      'Log out',
      editInfo:    'Edit information',
      cancelEdit:  'Cancel editing',
    },
    general: {
      loading:   'Loading...',
      error:     'An error occurred.',
      save:      'Save',
      cancel:    'Cancel',
      close:     'Close',
      back:      'Back',
      addToCart: 'Add to cart',
      buyNow:    'Buy now',
      view:      'View',
      edit:      'Edit',
      delete:    'Delete',
      confirm:   'Confirm',
    },
  },
}

/** Reactivo: cambia cuando el usuario cambia el idioma */
export function useI18n() {
  const lang = _lang

  function t(path) {
    const keys = path.split('.')
    let obj = translations[lang.value] || translations.es
    for (const k of keys) {
      if (obj == null) return path
      obj = obj[k]
    }
    return obj ?? path
  }

  function setLang(newLang) {
    if (translations[newLang]) {
      _lang.value = newLang
    }
  }

  return { t, lang, setLang }
}

/** Actualiza el idioma global (llamar desde useSettingsStore) */
export function setGlobalLang(lang) {
  if (translations[lang]) _lang.value = lang
}

export default useI18n
