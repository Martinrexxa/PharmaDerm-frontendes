<template>
  <div class="min-h-screen pd-root">
    <!-- MAIN -->
    <main class="max-w-[1200px] mx-auto px-6 py-8">
      <!-- HERO PERFIL -->
      <section
        class="pd-hero rounded-[28px] overflow-hidden shadow-xl relative"
        :style="{ backgroundImage: `url(${perfilBannerSrc})`, backgroundSize: 'cover', backgroundPosition: 'center top' }"
      >
        <div class="pd-hero-overlay rounded-[28px]"></div>
        <div class="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 px-6 sm:px-10 py-8 sm:py-10 text-white relative z-10">
          <div class="flex flex-col justify-center">
            <span class="text-xs uppercase tracking-[0.25em] opacity-80">
              {{ ui.welcomeBack }}
            </span>

              <h2 class="text-3xl sm:text-4xl font-extrabold mt-3 leading-tight">
              {{ isEs ? 'Hola' : 'Hi' }}, {{ auth.displayName.value }}
            </h2>

            <p class="mt-4 text-white/90 text-sm sm:text-base max-w-2xl">
              {{ ui.manageAccount }}
            </p>

            <div class="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                class="pd-cta px-6 py-3 rounded-full font-bold shadow-lg transition"
                @click="router.push('/diagnostics')"
              >
                {{ t('diagnostics.bookAppt') }}
              </button>

              <button
                type="button"
                class="pd-ghost-white px-6 py-3 rounded-full font-bold transition"
                @click="router.push('/tienda')"
              >
                {{ t('routine.viewStore') }}
              </button>
            </div>
          </div>

          <div class="pd-card rounded-[24px] p-5 sm:p-6 text-slate-900 shadow-xl self-start">
            <div class="flex items-start gap-4">
              <div class="pd-profile-avatar-wrap">
                <img
                  v-if="currentUser?.avatar"
                  :src="currentUser.avatar"
                  alt="Avatar"
                  class="pd-profile-avatar"
                />
                <div v-else class="pd-profile-avatar pd-profile-avatar-fallback">
                  {{ currentInitial }}
                </div>
              </div>

              <div class="min-w-0 flex-1">
                <p class="text-xs uppercase tracking-[0.2em] pd-muted font-bold">
                  {{ isEs ? 'Cuenta principal' : 'Main Account' }}
                </p>
                <h3 class="text-xl font-extrabold mt-1 text-slate-900">
                  {{ auth.displayName.value }}
                </h3>
                <p class="text-sm text-slate-500 break-all mt-1">
                  {{ currentUser?.email || (isEs ? 'Sin correo registrado' : 'No email registered') }}
                </p>

                <div class="mt-4 flex flex-wrap gap-2">
                  <span class="pd-chip-inline">{{ isEs ? 'Perfil activo' : 'Active profile' }}</span>
                  <span class="pd-chip-inline">{{ isEs ? 'Miembro Skin Care' : 'Skin Care Member' }}</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mt-6">
              <button type="button" class="pd-soft-btn" @click="router.push('/citas')">
                <span class="material-symbols-outlined">clinical_notes</span>
                <span>{{ ui.myAppointments }}</span>
              </button>

              <button type="button" class="pd-soft-btn" @click="router.push('/routine')">
                <span class="material-symbols-outlined">dermatology</span>
                <span>{{ ui.myRoutine }}</span>
              </button>

              <button type="button" class="pd-soft-btn" @click="router.push('/pedidos')">
                <span class="material-symbols-outlined">inventory_2</span>
                <span>{{ ui.orders }}</span>
              </button>

              <button type="button" class="pd-soft-btn" @click="toggleEditMode">
                <span class="material-symbols-outlined">edit</span>
                <span>{{ editMode ? ui.closeEditing : ui.edit }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- RESUMEN -->
      <section class="mt-10">
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <article class="pd-card pd-border rounded-2xl p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">{{ isEs ? 'Pedidos' : 'Orders' }}</p>
                <h3 class="text-2xl font-extrabold mt-2">{{ history.orders.value.length }}</h3>
              </div>
              <div class="pd-stat-icon">
                <span class="material-symbols-outlined">package_2</span>
              </div>
            </div>
          </article>

          <article class="pd-card pd-border rounded-2xl p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">{{ isEs ? 'Citas' : 'Appointments' }}</p>
                <h3 class="text-2xl font-extrabold mt-2">{{ history.appointments.value.length }}</h3>
              </div>
              <div class="pd-stat-icon">
                <span class="material-symbols-outlined">calendar_month</span>
              </div>
            </div>
          </article>

          <article class="pd-card pd-border rounded-2xl p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">{{ isEs ? 'Rutinas' : 'Routines' }}</p>
                <h3 class="text-2xl font-extrabold mt-2">{{ history.routines.value.length || history.quizHistory.value.length }}</h3>
              </div>
              <div class="pd-stat-icon">
                <span class="material-symbols-outlined">spa</span>
              </div>
            </div>
          </article>

          <article class="pd-card pd-border rounded-2xl p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">{{ isEs ? 'DiagnÃ³sticos' : 'Diagnostics' }}</p>
                <h3 class="text-2xl font-extrabold mt-2">{{ history.diagnostics.value.length }}</h3>
              </div>
              <div class="pd-stat-icon">
                <span class="material-symbols-outlined">clinical_notes</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- TABS -->
      <div class="mt-8 flex gap-2 flex-wrap">
        <button
          v-for="tab in [{key:'cuenta', label: ui.myAccountTab}, {key:'historial', label: ui.historyTab}, {key:'settings', label: ui.settingsTab}]"
          :key="tab.key"
          type="button"
          class="pd-tab-btn"
          :class="{ 'pd-tab-btn--active': activeTab === tab.key }"
          @click="goTab(tab.key)"
        >{{ tab.label }}</button>
      </div>

      <!-- CONTENT: My account -->
      <section v-if="activeTab === 'cuenta'" class="mt-6 grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
        <!-- LEFT COLUMN -->
        <div class="space-y-6">
          <!-- PERSONAL DETAILS -->
          <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
            <div class="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <div>
                <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">{{ isEs ? 'Perfil' : 'Profile' }}</p>
                <h3 class="font-bold text-xl mt-1">{{ isEs ? 'Mis datos' : 'My details' }}</h3>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="pd-field">
                <span>{{ isEs ? 'Nombre completo' : 'Full name' }}</span>
                <input
                  v-model="editableUser.name" maxlength="60"
                  type="text"
                  pattern="[A-Za-zÃ€-Ã–Ã˜-Ã¶Ã¸-Ã¿\s'-]*"
                  @beforeinput="blockNonLetterInput"
                  @input="editableUser.name = sanitizeLetters(editableUser.name)"
                  :disabled="!editMode"
                  placeholder="Your name"
                />
              </label>

              <label class="pd-field">
                <span>Email</span>
                <input
                  v-model="editableUser.email" maxlength="100"
                  type="email"
                  :disabled="!editMode"
                  placeholder="email@example.com"
                />
              </label>

              <label class="pd-field">
                <span>{{ isEs ? 'TelÃ©fono' : 'Phone' }}</span>
                <input
                  v-model="editableUser.phone"
                  type="tel"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  maxlength="10"
                  @input="editableUser.phone = String(editableUser.phone || '').replace(/\D/g, '').slice(0, 10)"
                  :disabled="!editMode"
                  placeholder="(809) 000-0000"
                />
              </label>

              <label class="pd-field">
                <span>{{ isEs ? 'Fecha de nacimiento' : 'Date of birth' }}</span>
                <input
                  v-model="editableUser.birth_date"
                  type="date"
                  :disabled="!editMode"
                  :max="maxBirthDate"
                />
              </label>
            </div>

            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="pd-field">
                <span>{{ isEs ? 'DirecciÃ³n' : 'Address' }}</span>
                <input
                  v-model="editableUser.address" maxlength="100"
                  type="text"
                  :disabled="!editMode"
                  placeholder="Street, number, neighborhood"
                />
              </label>

              <label class="pd-field">
                <span>{{ isEs ? 'Ciudad' : 'City' }}</span>
                <input
                  v-model="editableUser.city" maxlength="100"
                  type="text"
                  pattern="[A-Za-zÃ€-Ã–Ã˜-Ã¶Ã¸-Ã¿\s'-]*"
                  @beforeinput="blockNonLetterInput"
                  @input="editableUser.city = sanitizeLetters(editableUser.city)"
                  :disabled="!editMode"
                  placeholder="City"
                />
              </label>
            </div>

            <div v-if="saveMsg" class="mt-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
              {{ saveMsg }}
            </div>
            <div v-if="saveError" class="mt-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
              {{ saveError }}
            </div>

            <div v-if="editMode" class="flex flex-wrap gap-3 mt-5">
              <label class="pd-secondary-btn cursor-pointer inline-flex items-center justify-center">
                {{ isEs ? 'Cambiar foto' : 'Change photo' }}
                <input type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
              </label>

              <button type="button" class="pd-primary-btn" :disabled="isSaving" @click="saveProfile">
                {{ isSaving ? (isEs ? 'Guardando...' : 'Saving...') : t('profile.saveChanges') }}
              </button>

              <button type="button" class="pd-secondary-btn" @click="resetEditableUser">
                {{ isEs ? 'Restablecer' : 'Reset' }}
              </button>
            </div>
          </article>

          <!-- PEDIDOS -->
          <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
            <div class="flex items-center justify-between gap-4 mb-5">
              <div>
                <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Purchases</p>
                <h3 class="font-bold text-xl mt-1">{{ ui.recentOrders }}</h3>
              </div>

              <button type="button" class="pd-outline-btn" @click="router.push('/tienda')">
                Go to store
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="order in history.orders.value.slice(0, 5)"
                :key="order.id"
                class="pd-list-row"
              >
                <div>
                  <h4 class="font-semibold">Order {{ order.code || `#${order.id}` }}</h4>
                  <p class="text-sm pd-muted">{{ fmtDate(order.date) }}</p>
                </div>

                <div class="text-right">
                  <p class="font-bold pd-price">{{ formatPrice(order.total) }}</p>
                  <p class="text-sm text-emerald-600 font-semibold">Confirmed</p>
                </div>
              </div>

              <div v-if="history.orders.value.length === 0" class="pd-empty-box">
                You do not have any orders yet. <button class="pd-link underline ml-1" @click="router.push('/tienda')">Go to store</button>
              </div>
            </div>
          </article>

          <!-- CITAS -->
          <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
            <div class="flex items-center justify-between gap-4 mb-5">
              <div>
                <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Dermatology</p>
                <h3 class="font-bold text-xl mt-1">{{ ui.myAppointments }}</h3>
              </div>

              <button type="button" class="pd-outline-btn" @click="router.push('/citas')">
                {{ t('diagnostics.bookAppt') }}
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="apt in history.appointments.value.slice(0, 5)"
                :key="apt.id"
                class="pd-list-row"
              >
                <div>
                  <h4 class="font-semibold">{{ appointmentTypeLabel(apt.appointment_type || apt.service) }}</h4>
                  <p class="text-sm pd-muted">{{ fmtDate(apt.scheduled_date || apt.date) }} {{ apt.scheduled_time ? `Â· ${apt.scheduled_time}` : '' }}</p>
                </div>

                <div class="text-right">
                  <p class="font-semibold">{{ modalityLabel(apt.mode) }}</p>
                  <p class="text-sm pd-link font-semibold">{{ apt.doctor_name || apt.doctor || "Specialist" }}</p>
                </div>
              </div>

              <div v-if="history.appointments.value.length === 0" class="pd-empty-box">
                There are no scheduled appointments right now.
              </div>
            </div>
          </article>
        </div>

        <!-- COLUMNA DERECHA -->
        <div class="space-y-6">
          <!-- RUTINA -->
          <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
            <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Skin profile</p>
            <h3 class="font-bold text-xl mt-1">{{ ui.myRoutine }}</h3>

            <div v-if="routineSource && latestRoutineSteps.length" class="mt-5 space-y-3">
              <div
                v-for="step in latestRoutineSteps"
                :key="step.id || step.title"
                class="pd-routine-item"
              >
                <div class="pd-routine-icon">
                  <span class="material-symbols-outlined">{{ step.icon || "spa" }}</span>
                </div>

                <div class="min-w-0">
                  <h4 class="font-semibold">{{ step.title }}</h4>
                  <p class="text-sm pd-muted">{{ step.desc }}</p>
                </div>
              </div>
            </div>

            <div v-else class="pd-empty-box mt-5">
              You have not completed your personalized routine yet.
            </div>

            <button
              type="button"
              class="mt-5 w-full py-3 rounded-xl pd-primary text-white font-bold shadow-lg"
              @click="router.push(routineSource ? '/routine' : '/quiz')"
            >
              {{ routineSource ? t('profile.viewUpdateRoutine') : t('profile.createRoutine') }}
            </button>
          </article>

          <!-- DIAGNOSTICO -->
          <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
            <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Diagnostics</p>
            <h3 class="font-bold text-xl mt-1">My diagnostic</h3>

            <div v-if="latestDiagnostic" class="mt-5 pd-list-row">
              <div>
                <h4 class="font-semibold">
                  {{ latestDiagnostic.title || "Diagnostic completed" }}
                </h4>
                <p class="text-sm pd-muted">
                  {{ latestDiagnostic.summary || fmtDate(latestDiagnostic.date) }}
                </p>
              </div>
            </div>

            <div v-else class="pd-empty-box mt-5">
              You have not completed a diagnostic yet.
            </div>

            <button
              type="button"
              class="mt-5 w-full py-3 rounded-xl pd-primary text-white font-bold shadow-lg"
              @click="router.push('/diagnostics')"
            >
              {{ latestDiagnostic ? t('profile.viewUpdateDiagnostic') : t('profile.startDiagnostic') }}
            </button>
          </article>

          

          <!-- ATAJOS -->
          <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
            <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Quick access</p>
            <h3 class="font-bold text-xl mt-1">Your dashboard</h3>

            <div class="grid grid-cols-1 gap-3 mt-5">
              <button type="button" class="pd-shortcut" @click="router.push('/carrito')">
                <span class="material-symbols-outlined">shopping_cart</span>
                <span>{{ ui.goToCart }}</span>
              </button>

              <button type="button" class="pd-shortcut" @click="router.push('/diagnostics')">
                <span class="material-symbols-outlined">stethoscope</span>
                <span>{{ ui.consultSpecialist }}</span>
              </button>

              <button type="button" class="pd-shortcut" @click="doLogout">
                <span class="material-symbols-outlined">logout</span>
                <span>{{ ui.signOut }}</span>
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- CONTENT: History -->
      <section v-if="activeTab === 'historial'" class="mt-6 space-y-6">
        <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
          <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Skin analysis</p>
          <h3 class="font-bold text-xl mt-1">Quiz history</h3>
          <div class="mt-4 space-y-3">
            <div v-for="q in history.quizHistory.value" :key="q.id" class="pd-list-row">
              <div>
                <h4 class="font-semibold">Skin analysis</h4>
                <p class="text-sm pd-muted">{{ fmtDate(q.date) }} Â· {{ q.skinType || 'Unknown type' }}</p>
              </div>
              <div class="flex gap-2 flex-wrap">
                <button class="pd-outline-btn text-sm" @click="openDetailModal(q, 'quiz')">View Details</button>
                <button class="pd-outline-btn text-sm" @click="router.push('/routine')">View routine</button>
              </div>
            </div>
            <div v-if="!history.quizHistory.value.length" class="pd-empty-box">
              You have not completed any analysis yet. <button class="pd-link underline ml-1" @click="router.push('/quiz')">Start quiz</button>
            </div>
          </div>
        </article>

        <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
          <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Diagnostics</p>
          <h3 class="font-bold text-xl mt-1">Diagnostic history</h3>
          <div class="mt-4 space-y-3">
            <div v-for="d in history.diagnostics.value" :key="d.id" class="pd-list-row">
              <div>
                <h4 class="font-semibold">{{ d.title || 'Diagnostic' }}</h4>
                <p class="text-sm pd-muted">{{ fmtDate(d.date) }} Â· <span class="capitalize">{{ d.status || 'saved' }}</span></p>
              </div>
              <button class="pd-outline-btn text-sm" @click="openDetailModal(d, 'diagnostic')">View Details</button>
            </div>
            <div v-if="!history.diagnostics.value.length" class="pd-empty-box">
              There are no saved diagnostics.
            </div>
          </div>
        </article>

        <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
          <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Appointments</p>
          <h3 class="font-bold text-xl mt-1">Appointment history</h3>
          <div class="mt-4 space-y-3">
            <div v-for="apt in history.appointments.value" :key="apt.id" class="pd-list-row">
              <div>
                  <h4 class="font-semibold">{{ appointmentTypeLabel(apt.appointment_type || apt.service) }}</h4>
                  <p class="text-sm pd-muted">{{ fmtDate(apt.scheduled_date || apt.date) }} {{ apt.scheduled_time ? `Â· ${apt.scheduled_time}` : '' }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold">{{ modalityLabel(apt.mode) }}</p>
                <p class="text-sm pd-link">{{ apt.doctor_name || apt.doctor || 'Specialist' }}</p>
              </div>
            </div>
            <div v-if="!history.appointments.value.length" class="pd-empty-box">
              There are no appointments in your history.
            </div>
          </div>
        </article>

        <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
          <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Purchases</p>
          <h3 class="font-bold text-xl mt-1">Order history</h3>
          <div class="mt-4 space-y-3">
            <div v-for="order in history.orders.value" :key="order.id" class="pd-list-row">
              <div>
                <h4 class="font-semibold">Order {{ order.code || `#${order.id}` }}</h4>
                <p class="text-sm pd-muted">{{ fmtDate(order.date) }}</p>
              </div>
              <div class="text-right">
                <p class="font-bold pd-price">{{ formatPrice(order.total) }}</p>
                <p class="text-sm text-emerald-600 font-semibold capitalize">{{ order.status || 'confirmed' }}</p>
              </div>
            </div>
            <div v-if="!history.orders.value.length" class="pd-empty-box">
              There are no orders yet. <button class="pd-link underline ml-1" @click="router.push('/tienda')">Go to store</button>
            </div>
          </div>
        </article>
      </section>

      <!-- MODAL: View Details -->
      <teleport to="body">
        <div v-if="showDetailModal && selectedDetail" class="pd-modal-overlay" @click.self="closeDetailModal">
          <div class="pd-modal" role="dialog" aria-modal="true">
            <div class="pd-modal-header">
              <h3>{{ selectedDetailType === 'quiz' ? 'Saved Analysis' : 'Saved Diagnostic' }}</h3>
              <button type="button" class="pd-modal-close" @click="closeDetailModal">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="pd-modal-body">
              <p class="pd-modal-date">{{ fmtDate(selectedDetail.date || selectedDetail.savedAt) }}</p>

              <!-- QUIZ details -->
              <template v-if="selectedDetailType === 'quiz'">
                <div v-if="selectedDetail.skinType" class="pd-detail-row">
                  <span>Skin Type</span>
                  <strong>{{ selectedDetail.skinType }}</strong>
                </div>
                <div v-if="selectedDetail.sensitivity" class="pd-detail-row">
                  <span>Sensitivity</span>
                  <strong>{{ selectedDetail.sensitivity }}</strong>
                </div>
                <div v-if="selectedDetail.primaryConcern || (selectedDetail.concerns && selectedDetail.concerns.length)" class="pd-detail-row">
                  <span>Main Concern</span>
                  <strong>{{ selectedDetail.primaryConcern || (selectedDetail.concerns && selectedDetail.concerns[0]) || 'Not specified' }}</strong>
                </div>
                <div v-if="selectedDetail.profileTitle" class="pd-detail-section">
                  <h4>Profile</h4>
                  <p>{{ selectedDetail.profileTitle }}</p>
                </div>
                <div v-if="selectedDetail.routineFocus" class="pd-detail-row">
                  <span>Routine Focus</span>
                  <strong>{{ selectedDetail.routineFocus }}</strong>
                </div>
                <div v-if="selectedDetail.morningSteps && selectedDetail.morningSteps.length" class="pd-detail-section">
                  <h4>Morning Routine</h4>
                  <ul>
                    <li v-for="(step, i) in selectedDetail.morningSteps.slice(0, 6)" :key="'m' + i">
                      {{ step.name || step.title || step }}
                    </li>
                  </ul>
                </div>
                <div v-if="selectedDetail.nightSteps && selectedDetail.nightSteps.length" class="pd-detail-section">
                  <h4>Night Routine</h4>
                  <ul>
                    <li v-for="(step, i) in selectedDetail.nightSteps.slice(0, 6)" :key="'n' + i">
                      {{ step.name || step.title || step }}
                    </li>
                  </ul>
                </div>
                <div v-if="selectedDetail.fullMetrics && selectedDetail.fullMetrics.length" class="pd-detail-section">
                  <h4>Analysis Metrics</h4>
                  <ul>
                    <li v-for="metric in selectedDetail.fullMetrics.slice(0, 5)" :key="metric.key || metric.label">
                      {{ metric.label }}: {{ Number(metric.score).toFixed(1) }}/10
                    </li>
                  </ul>
                </div>
              </template>

              <!-- DIAGNOSTIC details -->
              <template v-else-if="selectedDetailType === 'diagnostic'">
                <div v-if="selectedDetail.quizSummary && selectedDetail.quizSummary.skinType" class="pd-detail-row">
                  <span>Skin Type</span>
                  <strong>{{ selectedDetail.quizSummary.skinType }}</strong>
                </div>
                <div v-if="selectedDetail.quizSummary && selectedDetail.quizSummary.sensitivity" class="pd-detail-row">
                  <span>Sensitivity</span>
                  <strong>{{ selectedDetail.quizSummary.sensitivity }}</strong>
                </div>
                <div v-if="selectedDetail.quizSummary && selectedDetail.quizSummary.concerns && selectedDetail.quizSummary.concerns.length" class="pd-detail-row">
                  <span>Main Concerns</span>
                  <strong>{{ selectedDetail.quizSummary.concerns.join(', ') }}</strong>
                </div>
                <div v-if="selectedDetail.insight && selectedDetail.insight.title" class="pd-detail-section">
                  <h4>Diagnosis</h4>
                  <strong>{{ selectedDetail.insight.title }}</strong>
                  <p>{{ selectedDetail.insight.text }}</p>
                </div>
                <div v-if="selectedDetail.insight && selectedDetail.insight.nextStep" class="pd-detail-row">
                  <span>Recommendations</span>
                  <strong>{{ selectedDetail.insight.nextStep }}</strong>
                </div>
                <div v-if="selectedDetail.insight && selectedDetail.insight.priority" class="pd-detail-row">
                  <span>Care Priority</span>
                  <strong>{{ selectedDetail.insight.priority }}</strong>
                </div>
                <div v-if="selectedDetail.form && selectedDetail.form.symptoms && selectedDetail.form.symptoms.length" class="pd-detail-row">
                  <span>Symptoms</span>
                  <strong>{{ selectedDetail.form.symptoms.join(', ') }}</strong>
                </div>
                <div v-if="selectedDetail.form && selectedDetail.form.areas && selectedDetail.form.areas.length" class="pd-detail-row">
                  <span>Affected Areas</span>
                  <strong>{{ selectedDetail.form.areas.join(', ') }}</strong>
                </div>
                <div v-if="selectedDetail.form && selectedDetail.form.priorities && selectedDetail.form.priorities.length" class="pd-detail-row">
                  <span>Top Priorities</span>
                  <strong>{{ selectedDetail.form.priorities.join(', ') }}</strong>
                </div>
                <div v-if="selectedDetail.form && selectedDetail.form.description" class="pd-detail-section">
                  <h4>Description</h4>
                  <p>{{ selectedDetail.form.description }}</p>
                </div>
                <div class="pd-detail-row">
                  <span>Status</span>
                  <strong class="capitalize">{{ selectedDetail.status || 'Saved' }}</strong>
                </div>
              </template>
            </div>

            <div class="pd-modal-footer">
              <button type="button" class="pd-primary-btn" @click="closeDetailModal">Close</button>
            </div>
          </div>
        </div>
      </teleport>

      <!-- CONTENT: Settings -->
      <section v-if="activeTab === 'settings'" class="mt-6 max-w-lg">
        <article class="pd-card pd-border rounded-2xl p-6 shadow-sm">
          <p class="text-[11px] uppercase tracking-widest pd-muted font-bold">Preferences</p>
          <h3 class="font-bold text-xl mt-1 mb-6">{{ ui.settingsTab }}</h3>

          <div class="space-y-5">
            <!-- Idioma -->
            <div class="pd-field">
              <span>{{ ui.appLanguage }}</span>
              <select :value="language" @change="setProfileLanguage($event.target.value)">
                <option value="es">{{ ui.spanish }}</option>
                <option value="en">{{ ui.english }}</option>
              </select>
            </div>

            <!-- Country -->
            <div class="pd-field">
              <span>{{ ui.country }}</span>
              <select :value="country" @change="setProfileCountry($event.target.value)">
                <option v-for="c in settings.countryList" :key="c.code" :value="c.code">{{ c.name }}</option>
              </select>
            </div>

            <!-- Moneda -->
            <div class="pd-field">
              <span>{{ ui.preferredCurrency }}</span>
              <select :value="currency" @change="setProfileCurrency($event.target.value)">
                <option v-for="m in settings.currencyList" :key="m.code" :value="m.code">{{ m.symbol }} â€” {{ m.name }}</option>
              </select>
            </div>

            <hr class="border-[var(--border)]" />

            <!-- Sign out -->
            <button type="button" class="w-full py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition" @click="doLogout">
              {{ t('nav.signOut') }}
            </button>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/useAuthStore";
import perfilImg1 from '../assets/fondo/perfil.png';
import { useSettingsStore } from "../stores/useSettingsStore";
import { useHistoryStore } from "../stores/useHistoryStore";
import userService from "../services/userService.js";
import { apiFetch } from "../services/apiClient.js";
import { priceIn } from "../utils/currency";
import { getProductsByQuizResult } from "../data/productCatalog.js";
import { useI18n } from "../lib/i18n.js";

const router = useRouter();
const route  = useRoute();
const auth = useAuthStore();
const { t, lang } = useI18n();

const perfilBannerSrc = perfilImg1;
const settings = useSettingsStore();
const history = useHistoryStore();

const { language, country, currency } = settings;
const isEs = computed(() => lang.value === 'es')
const ui = computed(() => ({
  welcomeBack: isEs.value ? 'Bienvenido de vuelta' : 'Welcome back',
  manageAccount: isEs.value
    ? 'Administra tu cuenta, revisa tus pedidos, consulta tus citas dermatolÃ³gicas y accede rÃ¡pido a tu rutina personalizada.'
    : 'Manage your account, review your orders, check your dermatology appointments, and quickly access your personalized routine.',
  myAppointments: isEs.value ? 'Mis citas' : 'My appointments',
  myRoutine: isEs.value ? 'Mi rutina' : 'My routine',
  orders: isEs.value ? 'Pedidos' : 'Orders',
  closeEditing: isEs.value ? 'Cerrar ediciÃ³n' : 'Close editing',
  edit: isEs.value ? 'Editar' : 'Edit',
  myAccountTab: isEs.value ? 'Mi cuenta' : 'My account',
  historyTab: isEs.value ? 'Historial' : 'History',
  settingsTab: isEs.value ? 'ConfiguraciÃ³n' : 'Settings',
  recentOrders: isEs.value ? 'Pedidos recientes' : 'Recent orders',
  goToCart: isEs.value ? 'Ir al carrito' : 'Go to cart',
  consultSpecialist: isEs.value ? 'Consultar especialista' : 'Consult a specialist',
  signOut: isEs.value ? 'Cerrar sesiÃ³n' : 'Sign out',
  appLanguage: isEs.value ? 'Idioma de la app' : 'App language',
  spanish: 'EspaÃ±ol',
  english: 'English',
  country: isEs.value ? 'PaÃ­s' : 'Country',
  preferredCurrency: isEs.value ? 'Moneda preferida' : 'Preferred currency',
}))

// Tab activo: 'cuenta' | 'settings' | 'historial'
const activeTab = computed(() => route.query.tab || 'cuenta');
function restoreProfileScroll(top = window.scrollY, left = window.scrollX) {
  nextTick(() => {
    requestAnimationFrame(() => window.scrollTo(left, top))
  })
}

function keepProfilePosition(action) {
  const top = window.scrollY
  const left = window.scrollX
  action()
  restoreProfileScroll(top, left)
}

function goTab(tab) {
  const top = window.scrollY
  const left = window.scrollX
  router.replace({ query: { ...route.query, tab } }).then(() => restoreProfileScroll(top, left))
}

function setProfileLanguage(value) {
  keepProfilePosition(() => settings.setLanguage(value))
}

function setProfileCountry(value) {
  keepProfilePosition(() => settings.setCountry(value))
}

function setProfileCurrency(value) {
  keepProfilePosition(() => settings.setCurrency(value))
}

const currentUser = auth.user;
const editMode = ref(false);

const maxBirthDate = computed(() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 13)
  return d.toISOString().split('T')[0]
})

function sanitizeLetters(value) {
  return String(value || '').replace(/[^\p{L}\s'-]/gu, '')
}

function blockNonLetterInput(event) {
  const text = String(event?.data || '')
  if (!text) return
  if (/[^\p{L}\s'-]/u.test(text)) event.preventDefault()
}

function _buildEditable(u) {
  const src = u || {}
  const rawBirth = src.birth_date || src.birthDate || ''
  const birthDate = rawBirth
    ? String(rawBirth).includes('T')
      ? String(rawBirth).split('T')[0]
      : String(rawBirth).slice(0, 10)
    : ''
  let address = src.address || ''
  let city = src.city || ''
  if (!address) {
    try {
      const saved = userService.getAddresses()
      if (saved && saved.length > 0) {
        const first = saved[0]
        address = first.address_line_1 || first.address || ''
        city = first.city || ''
      }
    } catch { /* ignore */ }
  }
  return {
    name: `${src.first_name || ''} ${src.last_name || ''}`.trim() || src.name || '',
    email: src.email || '',
    phone: src.phone || '',
    birth_date: birthDate,
    addressId: src.addressId || null,
    address,
    city,
    avatar: src.avatar || '',
  }
}

const editableUser = ref(_buildEditable(currentUser.value));

const saveMsg = ref('');
const saveError = ref('');
const isSaving = ref(false);

const showDetailModal = ref(false);
const selectedDetail = ref(null);
const selectedDetailType = ref('diagnostic');

function openDetailModal(item, type) {
  selectedDetail.value = item;
  selectedDetailType.value = type;
  showDetailModal.value = true;
}

function closeDetailModal() {
  showDetailModal.value = false;
  selectedDetail.value = null;
}

onMounted(async () => {
  try {
    const profile = await apiFetch('/user/profile')
    if (profile && profile.id) {
      auth.updateUser({
        id: profile.id,
        email: profile.email,
        first_name: profile.firstName || '',
        last_name: profile.lastName || '',
        name: profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
        phone: profile.phone || '',
        birth_date: profile.birth_date || '',
      })
      editableUser.value = _buildEditable(auth.user.value)
    }
  } catch {
    // keep local user snapshot if profile endpoint fails
  }
  await loadAddressFromDatabase();
});

const currentInitial = computed(() => {
  return (auth.displayName.value || "U").charAt(0).toUpperCase();
});

const latestRoutine = computed(() => history.routines.value[0] || null);
const latestQuiz = computed(() => history.quizHistory.value[0] || null);
const latestDiagnostic = computed(() => history.diagnostics.value[0] || null);
const routineSource = computed(() => latestRoutine.value || latestQuiz.value);

const latestRoutineSteps = computed(() => {
  const routine = routineSource.value;
  if (!routine) return [];
  
  // Combinar todas las fuentes posibles de pasos
  let morning = routine.morningSteps || routine.morningRoutine || [];
  let night = routine.nightSteps || routine.nightRoutine || [];
  let generic = routine.routineSteps || routine.steps || [];
  
  // Fallback: if this is a quiz result without explicit steps, generate them.
  if (!morning.length && !night.length && !generic.length && (routine.skinType || routine.skin_type)) {
    try {
      const quizPayload = {
        skinType: routine.skinType || routine.skin_type || 'normal',
        concerns: routine.concerns || [],
        sensitivity: routine.sensitivity || 'mild',
      };
      morning = getProductsByQuizResult(quizPayload, 'morning');
      night = getProductsByQuizResult(quizPayload, 'night');
    } catch (e) {
      console.warn('[Profile] Fallback step generation failed:', e);
    }
  }

  const allSteps = [...morning, ...night, ...generic];
  
  if (allSteps.length) {
    const uniqueSteps = [];
    const seenTitles = new Set();
    
    for (const p of allSteps) {
      const isString = typeof p === 'string';
      const title = isString ? p : (p.name || p.title || p.product_name || '');
      
      if (title && !seenTitles.has(title)) {
        seenTitles.add(title);
        uniqueSteps.push({
          id: uniqueSteps.length,
          title,
          desc: isString ? '' : (p.category || p.type || p.note || p.desc || ''),
          icon: isString ? 'wb_sunny' : 'spa',
        });
      }
      if (uniqueSteps.length >= 5) break;
    }
    
    return uniqueSteps;
  }
  return [];
});

async function loadAddressFromDatabase() {
  try {
    // Try backend/local cache
    const addresses = await userService.loadAddressesFromBackend()
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses[0]
      editableUser.value.addressId = defaultAddress.id || null
      editableUser.value.address = defaultAddress.address_line_1 || defaultAddress.address || ''
      editableUser.value.city = defaultAddress.city || ''
      console.log('[Profile] Address loaded from localStorage:', editableUser.value.address)
      return
    }
  } catch (error) {
    console.warn('[Profile] localStorage address load failed:', error)
  }
}

function toggleEditMode() {
  editableUser.value = _buildEditable(currentUser.value)
  loadAddressFromDatabase()
  editMode.value = !editMode.value;
}

function resetEditableUser() {
  editableUser.value = _buildEditable(currentUser.value)
}

function handleAvatarUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { editableUser.value.avatar = reader.result; };
  reader.readAsDataURL(file);
}

async function saveProfile() {
  saveMsg.value = '';
  saveError.value = '';
  isSaving.value = true;

  try {
    editableUser.value.name = sanitizeLetters(editableUser.value.name).slice(0, 60)
    editableUser.value.city = sanitizeLetters(editableUser.value.city).slice(0, 100)
    editableUser.value.phone = String(editableUser.value.phone || '').replace(/\D/g, '').slice(0, 10)
    const nameParts = (editableUser.value.name || '').trim().split(/\s+/)
    const firstName = nameParts[0] || ''
    const lastName  = nameParts.slice(1).join(' ') || ''

    await auth.updateProfile({
      firstName,
      lastName,
      phone: editableUser.value.phone ? editableUser.value.phone.trim() : null,
      birth_date: editableUser.value.birth_date || null,
    })

    const addressText = String(editableUser.value.address || '').slice(0, 100).trim()
    const cityText = (editableUser.value.city || '').trim()
    if (addressText) {
      try {
        const userId = auth.user?.value?.id || null
        const savedAddress = await userService.saveAddress({
          id: editableUser.value.addressId || undefined,
          address: addressText,
          city: cityText,
          label: 'My address',
          address_line_1: addressText,
          is_default: true,
        }, userId)
        if (savedAddress?.id) editableUser.value.addressId = savedAddress.id
      } catch (addrErr) {
        console.warn('[Profile] Address save failed:', addrErr)
      }
    }

    saveMsg.value = 'Profile updated successfully.';
    editMode.value = false;
  } catch (err) {
    console.error('[Profile] Save failed:', err);
    saveError.value = 'We could not update your profile. Please try again.';
  } finally {
    isSaving.value = false;
  }
}

async function doLogout() {
  await auth.logout();
  router.push("/login");
}

function fmtDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return iso; }
}

function appointmentTypeLabel(type) {
  const map = {
    consulta_general: 'General consultation',
    seguimiento: 'Follow-up',
    urgencia: 'Urgent care',
    estetica: 'Aesthetic consultation',
  }
  return map[type] || type || 'Dermatology consultation';
}

function modalityLabel(mode) {
  const map = {
    presencial: 'In-person',
    virtual: 'Virtual',
    both: 'Virtual and In-person',
    ambos: 'Virtual and In-person',
  };
  return map[String(mode || '').toLowerCase()] || mode || 'In-person';
}

function formatPrice(n) {
  return priceIn(Number(n) || 0, 'DOP', currency.value);
}

</script>

<style scoped>
.pd-root {
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
  --price: #004e92;
  --cta-bg: #ffffff;
  --cta-text: #004e92;
  --primary: #004e92;
}

.pd-root {
  background: var(--bg);
  color: var(--text);
}

.pd-muted { color: var(--muted); }
.pd-surface { background: var(--surface); backdrop-filter: blur(10px); }
.pd-card { background: var(--card); }
.pd-border { border: 1px solid var(--border); }
.pd-brand { color: var(--brand); }
.pd-accent { color: var(--accent); }
.pd-icon { color: var(--brand); }
.pd-link { color: var(--link); }
.pd-price { color: var(--price); }
.pd-primary { background: var(--primary); }

.pd-hero { position: relative; overflow: hidden; }

.pd-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0,78,146,0.72) 0%, rgba(0,78,146,0.55) 100%);
  z-index: 1;
}
.pd-cta { background: var(--cta-bg); color: var(--cta-text); }
.pd-cta:hover { filter: brightness(0.98); }

.pd-ghost-white {
  border: 1px solid rgba(255,255,255,0.42);
  color: #fff;
  background: rgba(255,255,255,0.08);
}
.pd-ghost-white:hover { background: rgba(255,255,255,0.14); }

.pd-profile-avatar-wrap { flex-shrink: 0; }

.pd-profile-avatar {
  width: 92px;
  height: 92px;
  border-radius: 999px;
  object-fit: cover;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.12);
}

.pd-profile-avatar-fallback {
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--brand), var(--link));
  color: white;
  font-size: 28px;
  font-weight: 900;
}

.pd-chip-inline {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: #eef6ff;
  color: #0f4c81;
  font-size: 12px;
  font-weight: 700;
}

.pd-soft-btn {
  border: 1px solid var(--border);
  background: var(--soft);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 700;
  color: var(--text);
}

.pd-stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--link) 10%, white);
  color: var(--brand);
}

.pd-outline-btn {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 700;
}

.pd-primary-btn {
  border: none;
  background: var(--primary);
  color: #fff;
  padding: 12px 18px;
  border-radius: 12px;
  font-weight: 700;
}

.pd-secondary-btn {
  border: 1px solid var(--border);
  background: var(--soft);
  color: var(--text);
  padding: 12px 18px;
  border-radius: 12px;
  font-weight: 700;
}

.pd-field {
  display: grid;
  gap: 8px;
}

.pd-field span {
  font-size: 13px;
  font-weight: 700;
  color: var(--muted);
}

.pd-field input,
.pd-field select {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--soft);
  color: var(--text);
  padding: 14px 16px;
  outline: none;
  font-size: 14px;
}

.pd-field input:disabled { opacity: 0.9; cursor: default; }

.pd-list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: color-mix(in srgb, var(--soft) 85%, white);
}

.pd-empty-box {
  padding: 24px;
  border: 1px dashed var(--border);
  border-radius: 18px;
  color: var(--muted);
  font-weight: 700;
  text-align: center;
}

.pd-routine-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 14px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--soft) 85%, white);
  border: 1px solid var(--border);
}

.pd-routine-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--link) 12%, white);
  color: var(--brand);
  flex-shrink: 0;
}

.pd-shortcut {
  width: 100%;
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--soft) 88%, white);
  color: var(--text);
  border-radius: 16px;
  padding: 15px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
}

/* Tabs */
.pd-tab-btn {
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 700;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
}
.pd-tab-btn:hover { background: var(--soft); color: var(--text); }
.pd-tab-btn--active {
  background: var(--brand);
  color: white;
  border-color: var(--brand);
}
@media (max-width: 900px) {
  .pd-list-row {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 720px) {
  .pd-profile-avatar {
    width: 78px;
    height: 78px;
  }
}

/* Modal */
.pd-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.48);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.pd-modal {
  background: #fff;
  border-radius: 24px;
  width: min(640px, 100%);
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
  border: 1px solid var(--border);
}

.pd-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0;
}

.pd-modal-header h3 {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text);
  margin: 0;
}

.pd-modal-close {
  background: none;
  border: 1px solid var(--border);
  border-radius: 999px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--muted);
}

.pd-modal-body {
  padding: 1.2rem 1.5rem;
}

.pd-modal-footer {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.pd-modal-date {
  color: var(--muted);
  font-size: 0.88rem;
  margin-bottom: 1rem;
}

.pd-detail-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.9rem;
}

.pd-detail-row span {
  color: var(--muted);
  flex-shrink: 0;
}

.pd-detail-row strong {
  text-align: right;
  color: var(--text);
}

.pd-detail-section {
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--border);
}

.pd-detail-section h4 {
  font-size: 0.82rem;
  color: var(--muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.4rem;
}

.pd-detail-section p {
  color: var(--text);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0.25rem 0 0;
}

.pd-detail-section strong {
  display: block;
  color: var(--text);
  font-weight: 700;
  font-size: 0.95rem;
}

.pd-detail-section ul {
  list-style: disc;
  padding-left: 1.2rem;
  margin: 0.3rem 0 0;
  color: var(--text);
  font-size: 0.9rem;
  line-height: 1.7;
}
</style>


