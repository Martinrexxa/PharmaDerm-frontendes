<template>
  <div class="min-h-screen bg-[#F7F7F4] text-slate-900">
    <!-- Progress bar (no header needed since AppNavbar is global) -->
    <div v-if="showProgress" class="sticky top-0 z-30 bg-[#F7F7F4] border-b border-slate-200 px-4 py-3">
      <div class="max-w-[980px] mx-auto flex items-center gap-2">
        <div class="progress-node" :class="{ active: progressStep >= 1 }">1</div>
        <div class="flex-1 h-[2px] rounded-full bg-sky-100 overflow-hidden">
          <div class="h-full bg-[#16A6E2] transition-all duration-300" :style="{ width: progressBarWidth + '%' }"></div>
        </div>
        <div class="progress-node" :class="{ active: progressStep >= 2 }">2</div>
      </div>
    </div>

    <main class="max-w-[980px] mx-auto px-4 pb-28 relative overflow-x-hidden">
      <Transition name="step-fade" mode="out-in">
      <div :key="step">
      <section v-if="step === 'selfie_instructions'">
        <div class="relative overflow-hidden bg-white">
          <button class="quiz-home-btn" type="button" @click="closeQuiz">GO HOME</button>
          <div class="relative h-[300px] sm:h-[360px]">
            <img :src="heroSelfieBg" alt="Selfie guide" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-slate-900/30"></div>
          </div>

          <div class="px-6 py-8 bg-[#F7F7F4]">
            <h1 class="text-[28px] sm:text-[40px] tracking-wide font-light text-slate-900">{{ t('quiz.takeSelfie') }}</h1>

            <ul class="mt-7 space-y-5 text-[15px] sm:text-[18px] text-slate-800 leading-relaxed">
              <li class="flex gap-4"><span class="mt-[10px] w-[5px] h-[5px] rounded-full bg-slate-800 shrink-0"></span><span>Remove makeup and glasses</span></li>
              <li class="flex gap-4"><span class="mt-[10px] w-[5px] h-[5px] rounded-full bg-slate-800 shrink-0"></span><span>Pull your hair back</span></li>
              <li class="flex gap-4"><span class="mt-[10px] w-[5px] h-[5px] rounded-full bg-slate-800 shrink-0"></span><span>Use front camera and keep a neutral expression</span></li>
              <li class="flex gap-4"><span class="mt-[10px] w-[5px] h-[5px] rounded-full bg-slate-800 shrink-0"></span><span>Stay in well-lit natural light</span></li>
            </ul>

            <div class="mt-8 border border-slate-500 px-5 py-6 text-center text-slate-700 text-[14px] sm:text-[18px] leading-relaxed bg-white/60">
              <p>The skin analysis AI needs camera access to provide a personalized experience based on your selfie.</p>
              <p class="mt-2">Your selfie will not be stored in our database.</p>
            </div>

            <button class="mt-10 w-full h-[58px] bg-[#16A6E2] text-white text-[15px] sm:text-[18px] tracking-wide" type="button" @click="openCamera">{{ t('quiz.takeSelfie') }}</button>
            <button class="mt-5 w-full h-[58px] text-slate-900 text-[15px] sm:text-[18px] tracking-wide" type="button" @click="triggerUpload">{{ t('quiz.uploadPhoto') }}</button>
          </div>
        </div>
      </section>

      <section v-else-if="step === 'camera'">
        <div class="relative bg-black overflow-hidden min-h-[calc(100vh-96px)]">
          <video v-show="cameraReady && !capturedDataUrl" ref="videoEl" autoplay playsinline muted class="w-full h-[calc(100vh-96px)] object-cover"></video>
          <img v-if="!cameraReady || capturedDataUrl" :src="capturedDataUrl || heroSelfieBg" alt="Preview" class="w-full h-[calc(100vh-96px)] object-cover" />
          <div class="absolute inset-0 bg-black/10"></div>

          <div class="absolute top-3 left-3 right-3 flex gap-3 z-20">
            <div class="camera-chip" :class="{ ok: liveChecks.lighting }">LIGHTING</div>
            <div class="camera-chip" :class="{ ok: liveChecks.position }">FACE POSITION</div>
            <div class="camera-chip" :class="{ ok: liveChecks.straight }">LOOK STRAIGHT</div>
          </div>

          <p class="absolute top-16 left-0 right-0 text-center text-white text-[16px] sm:text-[22px] z-20 drop-shadow px-4">{{ statusText }}</p>

          <div class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div class="face-guide">
              <div class="corner tl"></div>
              <div class="corner tr"></div>
              <div class="corner bl"></div>
              <div class="corner br"></div>
              <div class="mesh"></div>
              <div v-if="countdown > 0 && !capturedDataUrl" class="absolute inset-0 flex items-center justify-center text-white text-[120px] font-light">{{ countdown }}</div>
            </div>
          </div>

          <div class="absolute left-0 right-0 bottom-0 z-20 px-4 pb-5">
            <div class="bg-white/80 backdrop-blur-md rounded-[26px] p-5">
              <button class="w-full h-[56px] bg-[#16A6E2] text-white text-[16px] tracking-wide disabled:opacity-50 disabled:cursor-not-allowed" type="button" :disabled="!cameraReady || detectorLoading" @click="captureWithValidation">{{ detectorLoading ? t('quiz.loadingDetector') : t('quiz.takeSelfie') }}</button>
              <button class="mt-4 w-full h-[56px] border border-slate-400 text-slate-800 text-[16px]" type="button" @click="triggerUpload">{{ t('quiz.uploadPhoto') }}</button>
            </div>
          </div>

          <canvas ref="canvasEl" class="hidden"></canvas>
        </div>
      </section>

      <section v-else-if="step === 'selfie_error'">
        <div class="relative min-h-[calc(100vh-96px)] overflow-hidden">
          <img :src="capturedDataUrl || heroSelfieBg" alt="Rejected selfie" class="w-full h-[calc(100vh-96px)] object-cover" />
          <div class="absolute inset-0 bg-black/35"></div>
          <div class="absolute inset-x-0 top-4 flex justify-center z-20"><img :src="logoSrcWhite" class="h-14 object-contain" alt="My Routine AI" /></div>
          <div class="absolute left-0 right-0 bottom-0 z-20 p-4">
            <div class="bg-white/80 backdrop-blur-md rounded-[26px] p-5">
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-red-600 mt-[2px]">cancel</span>
                <div>
                  <p class="text-[18px] text-slate-900">{{ validationMessage }}</p>
                  <p class="text-[13px] uppercase tracking-wide text-slate-500 mt-1">Try again</p>
                </div>
              </div>
              <button class="mt-5 w-full h-[56px] bg-[#16A6E2] text-white text-[16px] tracking-wide" type="button" @click="retakeSelfie">{{ t('quiz.retakeSelfie') }}</button>
              <button class="mt-2 w-full h-[56px] border border-slate-400 text-slate-800 text-[16px]" type="button" @click="triggerUpload">{{ t('quiz.uploadPhoto') }}</button>
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="step === 'selfie_confirm'">
        <div class="relative min-h-[calc(100vh-96px)] overflow-hidden">
          <img :src="capturedDataUrl || heroSelfieBg" alt="Accepted selfie" class="w-full h-[calc(100vh-96px)] object-cover" />
          <div class="absolute left-0 right-0 bottom-0 p-4">
            <div class="bg-[#F7F7F4] rounded-[30px] p-5">
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-emerald-600 text-[34px]">check_circle</span>
                <div>
                  <p class="text-[20px] font-normal text-slate-900">DONE</p>
                  <p class="text-[13px] uppercase tracking-wide text-slate-500 mt-1">OK FOR ANALYSIS</p>
                </div>
              </div>
              <button class="mt-5 w-full h-[56px] bg-[#16A6E2] text-white text-[16px] tracking-wide" type="button" @click="goToAbout">{{ t('quiz.continue') }}</button>
              <button class="mt-4 w-full h-[56px] border border-slate-500 text-slate-800 text-[16px]" type="button" @click="retakeSelfie">{{ t('quiz.retakeSelfie') }}</button>
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="step === 'about_you'" class="pt-6">
        <h2 class="text-center text-[22px] sm:text-[30px] font-light text-slate-900">{{ t('quiz.aboutYou') }}</h2>
        <div class="mt-8 space-y-4">
          <div class="chat-bubble">Hello! I'm your skin analysis assistant.</div>
          <div class="chat-bubble">I'll analyze your skin to help you understand your priorities. I'll ask you a few questions to complete the analysis.</div>
          <div class="chat-bubble">How old are you?</div>
          <div class="pt-10 pb-4 flex items-center justify-center">
            <button class="age-line-btn" type="button" @click="openAgeModal">
              <span class="dash"></span>
              <span class="value">{{ answers.age ? answers.age : '— —' }}</span>
              <span class="suffix">years old</span>
            </button>
          </div>
        </div>
      </section>

      <section v-else-if="step === 'skin_type'" class="pt-6">
        <h2 class="text-center text-[22px] sm:text-[30px] font-light tracking-wide text-slate-900">{{ t('quiz.skinProfile') }}</h2>

        <div class="mt-8 space-y-4">
          <div class="chat-bubble">We're comparing your photo with over 50,000 images.</div>
          <div class="chat-bubble">Our analysis suggests you may have <b>{{ suggestedSkinTypeText }}</b> skin.</div>
          <div class="chat-bubble">You can confirm or select a different skin type.</div>
        </div>

        <div class="mt-8">
          <div class="grid grid-cols-2 gap-5">
            <button
              v-for="item in skinTypes"
              :key="item.key"
              type="button"
              class="rounded-[22px] overflow-hidden bg-white shadow-[0_2px_12px_rgba(0,0,0,.06)] border transition text-left"
              :class="answers.skinType === item.key ? 'border-[#16A6E2] ring-2 ring-[#16A6E2]/20' : 'border-slate-200'"
              @click="selectSkinType(item.key)"
            >
              <img :src="item.image" :alt="item.title" class="w-full h-[150px] object-cover" @error="$event.target.src='https://placehold.co/600x400/e5e7eb/475569?text=TIPO+DE+PIEL'" />
              <div class="px-5 py-4">
                <p class="text-[#16A6E2] text-[20px] font-light tracking-wide">{{ item.title }}</p>
                <p class="mt-3 text-[#42BEEA] text-[14px] leading-relaxed">{{ item.description }}</p>
                <div class="mt-4 w-full h-[46px] rounded-[14px] text-[16px] flex items-center justify-center" :class="answers.skinType === item.key ? 'bg-[#16A6E2] text-white' : 'border border-[#16A6E2] text-[#16A6E2]'">{{ item.actionLabel }}</div>
              </div>
            </button>
          </div>
        </div>

        <div v-if="answers.skinType" class="mt-8 pill-blue">My skin type is {{ skinTypeLabel(answers.skinType) }}</div>

        <div class="mt-8 flex justify-center">
          <button class="w-full max-w-[420px] h-[56px] bg-[#16A6E2] text-white text-[16px]" type="button" @click="goToDiagnosticQuestion('barrier_reactivity')">CONFIRM</button>
        </div>
      </section>

      <section v-else-if="step === 'barrier_reactivity'" class="pt-6">
        <h2 class="text-center text-[22px] sm:text-[30px] font-light tracking-wide text-slate-900">SKIN PROFILE</h2>
        <div class="mt-3 text-center text-[11px] sm:text-[13px] uppercase tracking-[0.18em] text-[#16A6E2]">Guided diagnosis 1 of 4</div>
        <div class="mt-8 space-y-4">
          <div class="chat-bubble">How does your skin usually react to new products, harsh weather, or exfoliation?</div>
          <div class="chat-bubble">This helps us estimate your skin tolerance and barrier condition.</div>
        </div>
        <div class="mt-8 grid gap-4">
          <button v-for="option in diagnosticQuestions.barrierReactivity" :key="option.key" class="question-card" :class="{ selected: answers.barrierReactivity === option.key }" @click="selectDiagnosticOption('barrierReactivity', option.key, 'post_cleanse_feel')">
            <div class="flex items-start gap-4">
              <div class="question-icon" :class="{ selected: answers.barrierReactivity === option.key }"><span class="material-symbols-outlined text-[24px]">{{ option.icon }}</span></div>
              <div class="flex-1 text-left">
                <div class="flex items-start justify-between gap-3">
                  <h3 class="text-[16px] sm:text-[19px] text-slate-900 leading-tight">{{ option.title }}</h3>
                  <span v-if="answers.barrierReactivity === option.key" class="material-symbols-outlined text-[#16A6E2] text-[24px]">check_circle</span>
                </div>
                <p class="mt-2 text-[13px] sm:text-[15px] text-slate-600 leading-relaxed">{{ option.description }}</p>
              </div>
            </div>
          </button>
        </div>
      </section>

      <section v-else-if="step === 'post_cleanse_feel'" class="pt-6">
        <h2 class="text-center text-[22px] sm:text-[30px] font-light tracking-wide text-slate-900">SKIN PROFILE</h2>
        <div class="mt-3 text-center text-[11px] sm:text-[13px] uppercase tracking-[0.18em] text-[#16A6E2]">Guided diagnosis 2 of 4</div>
        <div class="mt-8 space-y-4">
          <div class="chat-bubble">After washing your face and waiting a few minutes, how does your skin normally feel?</div>
          <div class="chat-bubble">This helps us differentiate between dehydration, true dryness, and skin balance.</div>
        </div>
        <div class="mt-8 grid gap-4">
          <button v-for="option in diagnosticQuestions.postCleanseFeel" :key="option.key" class="question-card" :class="{ selected: answers.postCleanseFeel === option.key }" @click="selectDiagnosticOption('postCleanseFeel', option.key, 'shine_pattern')">
            <div class="flex items-start gap-4">
              <div class="question-icon" :class="{ selected: answers.postCleanseFeel === option.key }"><span class="material-symbols-outlined text-[24px]">{{ option.icon }}</span></div>
              <div class="flex-1 text-left">
                <div class="flex items-start justify-between gap-3">
                  <h3 class="text-[16px] sm:text-[19px] text-slate-900 leading-tight">{{ option.title }}</h3>
                  <span v-if="answers.postCleanseFeel === option.key" class="material-symbols-outlined text-[#16A6E2] text-[24px]">check_circle</span>
                </div>
                <p class="mt-2 text-[13px] sm:text-[15px] text-slate-600 leading-relaxed">{{ option.description }}</p>
              </div>
            </div>
          </button>
        </div>
      </section>

      <section v-else-if="step === 'shine_pattern'" class="pt-6">
        <h2 class="text-center text-[22px] sm:text-[30px] font-light tracking-wide text-slate-900">SKIN PROFILE</h2>
        <div class="mt-3 text-center text-[11px] sm:text-[13px] uppercase tracking-[0.18em] text-[#16A6E2]">Guided diagnosis 3 of 4</div>
        <div class="mt-8 space-y-4">
          <div class="chat-bubble">By the end of the day, where do you most often notice shine or excess oil?</div>
          <div class="chat-bubble">This refines whether sebum behavior is widespread, localized, or minimal.</div>
        </div>
        <div class="mt-8 grid gap-4">
          <button v-for="option in diagnosticQuestions.shinePattern" :key="option.key" class="question-card" :class="{ selected: answers.shinePattern === option.key }" @click="selectDiagnosticOption('shinePattern', option.key, 'breakout_pattern')">
            <div class="flex items-start gap-4">
              <div class="question-icon" :class="{ selected: answers.shinePattern === option.key }"><span class="material-symbols-outlined text-[24px]">{{ option.icon }}</span></div>
              <div class="flex-1 text-left">
                <div class="flex items-start justify-between gap-3">
                  <h3 class="text-[16px] sm:text-[19px] text-slate-900 leading-tight">{{ option.title }}</h3>
                  <span v-if="answers.shinePattern === option.key" class="material-symbols-outlined text-[#16A6E2] text-[24px]">check_circle</span>
                </div>
                <p class="mt-2 text-[13px] sm:text-[15px] text-slate-600 leading-relaxed">{{ option.description }}</p>
              </div>
            </div>
          </button>
        </div>
      </section>

      <section v-else-if="step === 'breakout_pattern'" class="pt-6">
        <h2 class="text-center text-[22px] sm:text-[30px] font-light tracking-wide text-slate-900">SKIN PROFILE</h2>
        <div class="mt-3 text-center text-[11px] sm:text-[13px] uppercase tracking-[0.18em] text-[#16A6E2]">Guided diagnosis 4 of 4</div>
        <div class="mt-8 space-y-4">
          <div class="chat-bubble">How often do you experience clogged pores, pimples, or breakouts?</div>
          <div class="chat-bubble">This helps us distinguish stable oily skin from acne-prone or congested skin.</div>
        </div>
        <div class="mt-8 grid gap-4">
          <button v-for="option in diagnosticQuestions.breakoutPattern" :key="option.key" class="question-card" :class="{ selected: answers.breakoutPattern === option.key }" @click="selectDiagnosticOption('breakoutPattern', option.key, 'profile_complete')">
            <div class="flex items-start gap-4">
              <div class="question-icon" :class="{ selected: answers.breakoutPattern === option.key }"><span class="material-symbols-outlined text-[24px]">{{ option.icon }}</span></div>
              <div class="flex-1 text-left">
                <div class="flex items-start justify-between gap-3">
                  <h3 class="text-[16px] sm:text-[19px] text-slate-900 leading-tight">{{ option.title }}</h3>
                  <span v-if="answers.breakoutPattern === option.key" class="material-symbols-outlined text-[#16A6E2] text-[24px]">check_circle</span>
                </div>
                <p class="mt-2 text-[13px] sm:text-[15px] text-slate-600 leading-relaxed">{{ option.description }}</p>
              </div>
            </div>
          </button>
        </div>
      </section>

      <section v-else-if="step === 'profile_complete'" class="pt-6">
        <h2 class="text-center text-[22px] sm:text-[30px] font-light tracking-wide text-slate-900">SKIN PROFILE</h2>
        <div class="mt-8 space-y-5">
          <div class="chat-bubble">I now have enough information to build a more personalized profile for your skin.</div>
          <div class="pill-blue">My skin type is {{ skinTypeLabel(answers.skinType || suggestedSkinType) }}</div>
          <div class="pill-blue">My skin {{ diagnosticLabel('barrierReactivity', answers.barrierReactivity) }}</div>
          <div class="pill-blue">After cleansing, my skin {{ diagnosticLabel('postCleanseFeel', answers.postCleanseFeel) }}</div>
          <div class="pill-blue">Shine appears {{ diagnosticLabel('shinePattern', answers.shinePattern) }}</div>
          <div class="pill-blue">Breakouts appear {{ diagnosticLabel('breakoutPattern', answers.breakoutPattern) }}</div>
          <div class="chat-bubble">Thank you for answering. I will now generate an analysis based on the full combination of your answers.</div>
        </div>
        <div class="mt-10 flex justify-center">
          <button class="w-full max-w-[480px] h-[62px] bg-[#16A6E2] text-white text-[18px] tracking-wide shadow-[0_8px_24px_rgba(22,166,226,.25)]" type="button" @click="generateAnalysisAndGoResults">NEXT</button>
        </div>
      </section>

      <section v-else-if="step === 'results_summary'" class="pt-4">
        <div class="flex justify-center"><img :src="logoSrc" class="h-12 object-contain" alt="My Routine AI" /></div>
        <div class="mt-6 promo-strip"><span class="material-symbols-outlined text-white">content_copy</span><p>Get 10% off your order by signing up to receive your results.</p></div>
        <p class="mt-6 text-[16px] sm:text-[20px] text-slate-800 leading-relaxed">This profile was created specifically for you based on your answers and the interaction between skin barrier, hydration, shine, and breakout tendency.</p>
        <div class="mt-5 rounded-[18px] border border-slate-200 bg-white px-5 py-5 shadow-[0_6px_20px_rgba(0,0,0,.04)]">
          <p class="text-[13px] uppercase tracking-[0.18em] text-[#16A6E2]">Personalized Diagnosis</p>
          <h3 class="mt-2 text-[22px] sm:text-[30px] text-slate-900 leading-tight">{{ analysis.profileTitle }}</h3>
          <p class="mt-3 text-[15px] sm:text-[18px] text-slate-700 leading-relaxed">{{ analysis.profileSummary }}</p>
        </div>
        <div class="mt-6 result-summary-card">
          <div class="photo-backdrop"><img :src="capturedDataUrl || selfiePlaceholder" alt="Selfie" class="summary-selfie" /></div>
          <div class="result-sheet">
            <span class="result-tag">Main Priority</span>
            <div v-for="metric in summaryMetrics" :key="metric.key" class="py-4 border-t border-slate-200 first:border-t-0">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <p class="text-[18px] sm:text-[28px] text-slate-900">{{ metric.label }}</p>
                  <p class="mt-2 text-[15px] sm:text-[22px] text-slate-700">{{ metric.note }}</p>
                  <div class="mt-3 h-[4px] bg-slate-200 rounded-full overflow-hidden"><div class="h-full bg-[#16A6E2]" :style="{ width: ((metric.score / 10) * 100) + '%' }"></div></div>
                </div>
                <div class="text-[18px] sm:text-[30px] text-slate-800 whitespace-nowrap mt-[2px]">{{ metric.score.toFixed(1) }}/10</div>
              </div>
            </div>
            <button class="mt-4 underline text-slate-700 text-[15px] sm:text-[18px]" type="button" @click="step = 'analysis_full'">View Full Analysis</button>
          </div>
        </div>
        <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[480px] mx-auto">
          <button class="w-full h-[58px] bg-white border border-slate-200 text-slate-900 text-[16px] shadow-[0_6px_18px_rgba(0,0,0,.05)]" type="button" @click="goToDiagnostics">
            CONTINUE DIAGNOSIS
          </button>
          <button class="w-full h-[58px] bg-[#16A6E2] text-white text-[16px]" type="button" @click="step = 'routine_intro'">
            VIEW ROUTINE
          </button>
        </div>
      </section>

      <section v-else-if="step === 'routine_intro'" class="pt-4">
        <div class="flex justify-center"><img :src="logoSrc" class="h-12 object-contain" alt="My Routine AI" /></div>
        <div class="mt-6 promo-strip"><span class="material-symbols-outlined text-white">content_copy</span><p>Get 10% off your order by signing up to receive your results.</p></div>
        <div class="mt-8">
          <h2 class="text-[30px] sm:text-[48px] font-light tracking-wide text-slate-900">YOUR PERSONALIZED ROUTINE</h2>
          <p class="mt-4 text-[17px] sm:text-[24px] text-slate-700 leading-relaxed">Your essential day and night routine elements to address your main focus area.</p>
        </div>
        <div class="mt-8 rounded-[8px] border border-slate-300 p-6 bg-[#F7F7F4]">
          <h3 class="text-[24px] sm:text-[34px] text-slate-900">{{ primaryConcernTitle }}</h3>
          <p class="mt-4 text-[16px] sm:text-[21px] text-slate-700 leading-relaxed">{{ primaryConcernDescription }}</p>
          <p class="mt-4 text-[15px] sm:text-[18px] text-slate-600 leading-relaxed">{{ analysis.routineFocus }}</p>
        </div>
        <div class="mt-8" v-if="routine.morning.length">
          <div class="border border-[#16A6E2] bg-white shadow-[0_6px_24px_rgba(0,0,0,.06)]">
            <div class="flex items-center justify-between">
              <div class="bg-[#16A6E2] text-white px-6 py-3 text-[14px] sm:text-[18px]">YOUR #1 ESSENTIAL</div>
              <div class="px-5 text-[15px] sm:text-[20px] text-slate-800">{{ starText(routine.morning[0].rating) }} <span class="text-slate-500">({{ routine.morning[0].reviews }})</span></div>
            </div>
            <div class="p-6 grid grid-cols-[1fr_140px] sm:grid-cols-[1fr_220px] gap-6 items-center">
              <div>
                <p class="text-[22px] sm:text-[32px] text-slate-900 leading-tight">{{ routine.morning[0].name }}</p>
                <p class="mt-4 text-[16px] sm:text-[22px] text-slate-700 leading-relaxed">{{ routine.morning[0].longDescription }}</p>
                <div class="mt-4 text-[18px] sm:text-[24px] text-slate-700">{{ routine.morning[0].size }}</div>
              </div>
              <div class="flex items-center justify-center"><img :src="routine.morning[0].image" :alt="routine.morning[0].name" class="max-h-[200px] sm:max-h-[260px] object-contain" /></div>
            </div>
          </div>
        </div>
        <div class="mt-8 email-buy-bar">
          <button class="email-cta" type="button" @click="sendRoutineByEmail"><span class="material-symbols-outlined">mail</span><span>EMAIL MY ROUTINE</span></button>
          <button class="buy-lock-btn" type="button" @click="goToRoutine"><span class="material-symbols-outlined">shopping_bag</span></button>
        </div>
        <div class="quiz-confirm-actions">
          <button class="btn-primary" type="button" @click="goToRoutinePage">Go to routine page</button>
        </div>
      </section>

      <section v-else-if="step === 'routine'" class="pt-4">
        <div class="flex justify-center"><img :src="logoSrc" class="h-12 object-contain" alt="My Routine AI" /></div>
        <div class="mt-6 promo-strip"><span class="material-symbols-outlined text-white">content_copy</span><p>Get 10% off your order by signing up to receive your results.</p></div>
        <div class="mt-8 border-b border-slate-300 flex">
          <button class="routine-tab" :class="{ active: routineTab === 'morning' }" type="button" @click="routineTab = 'morning'">MORNING</button>
          <button class="routine-tab" :class="{ active: routineTab === 'night' }" type="button" @click="routineTab = 'night'">NIGHT</button>
        </div>
        <div class="mt-8 space-y-10">
          <div v-for="product in currentRoutineList" :key="product.step + '-' + product.slug">
            <p class="text-[22px] sm:text-[30px] text-slate-900">Step {{ product.step }}</p>
            <p class="mt-2 text-[18px] sm:text-[24px] tracking-wide text-slate-700 uppercase">{{ product.category }}</p>
            <div class="mt-5 border border-[#16A6E2] bg-white shadow-[0_6px_24px_rgba(0,0,0,.06)]">
              <div class="flex items-center justify-between"><div class="px-6 py-3"></div><div class="px-5 text-[15px] sm:text-[20px] text-slate-800">{{ starText(product.rating) }} <span class="text-slate-500">({{ product.reviews }})</span></div></div>
              <div class="p-6 grid grid-cols-[1fr_140px] sm:grid-cols-[1fr_220px] gap-6 items-center">
                <div>
                  <p class="text-[22px] sm:text-[32px] text-slate-900 leading-tight">{{ product.name }}</p>
                  <p class="mt-4 text-[16px] sm:text-[22px] text-slate-700 leading-relaxed">{{ product.longDescription }}</p>
                  <div class="mt-4 text-[18px] sm:text-[24px] text-slate-700">{{ product.size }}</div>
                </div>
                <div class="flex items-center justify-center"><TransparentImg :src="product.image" :alt="product.name" class="max-h-[200px] sm:max-h-[260px] object-contain" /></div>
              </div>
              <div class="grid grid-cols-2">
                <button type="button" class="h-[66px] border-t border-r border-slate-300 text-[16px] sm:text-[24px] text-slate-900" @click="addProductAndGo(product)">VIEW IN STORE</button>
                <button type="button" class="h-[66px] border-t border-slate-300 bg-[#16A6E2] text-white text-[16px] sm:text-[24px] flex items-center justify-center gap-2" @click="addProductAndGo(product)"><span class="material-symbols-outlined text-[20px] sm:text-[24px]">shopping_bag</span>ADD TO BAG</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="step === 'analysis_full'" class="pt-6">
        <button class="mb-6 w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-200/60" type="button" @click="step = 'results_summary'"><span class="material-symbols-outlined">arrow_back</span></button>
        <h2 class="text-[30px] sm:text-[44px] font-light text-slate-900">My Analysis</h2>
        <p class="mt-4 text-[17px] sm:text-[24px] text-slate-700 leading-relaxed max-w-[860px]">{{ analysis.profileSummary }}</p>
        <div class="mt-6 rounded-[18px] bg-white border border-slate-200 px-5 py-5 shadow-[0_6px_20px_rgba(0,0,0,.04)]">
          <p class="text-[13px] uppercase tracking-[0.18em] text-[#16A6E2]">Indicative clinical interpretation</p>
          <ul class="mt-4 space-y-3 text-[15px] sm:text-[18px] text-slate-700 leading-relaxed">
            <li v-for="item in analysis.detailedFindings" :key="item">• {{ item }}</li>
          </ul>
        </div>
        <div class="mt-8 space-y-6">
          <div v-for="metric in fullMetrics" :key="metric.key" class="py-4 border-t border-slate-200 first:border-t-0">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <p class="text-[18px] sm:text-[28px] text-slate-900">{{ metric.label }}</p>
                <p class="mt-2 text-[15px] sm:text-[22px] text-slate-700">{{ metric.note }}</p>
                <div class="mt-3 h-[4px] bg-slate-200 rounded-full overflow-hidden"><div class="h-full bg-[#16A6E2]" :style="{ width: ((metric.score / 10) * 100) + '%' }"></div></div>
              </div>
              <div class="text-[18px] sm:text-[30px] text-slate-800 whitespace-nowrap mt-[2px]">{{ metric.score.toFixed(1) }}/10</div>
            </div>
          </div>
        </div>
      </section>
      </div>
      </Transition>
    </main>

    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFilePicked" />

    <div v-if="ageModal" class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div class="bg-white w-full max-w-[520px] p-6 sm:p-8 relative">
        <button class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-slate-700" type="button" @click="closeAgeModal"><span class="material-symbols-outlined">close</span></button>
        <h3 class="text-[28px] sm:text-[38px] tracking-wide font-light text-slate-900">YOUR AGE</h3>
        <p class="mt-4 text-[15px] sm:text-[19px] text-slate-700 leading-relaxed">Your skin requires different care as it evolves with age. Knowing your age will help us determine your skin's needs.</p>
        <div class="mt-8 flex items-center gap-5">
          <input v-model.number="ageDraft" type="number" min="10" max="99" class="age-modal-input" />
          <span class="text-[20px] sm:text-[30px] text-slate-800">years old</span>
        </div>
        <button class="mt-8 w-full h-[56px] bg-[#16A6E2] text-white text-[18px]" type="button" @click="saveAge">CONFIRM</button>
      </div>
    </div>

    <transition name="fade">
      <div v-if="toastMessage" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white px-5 py-3 rounded-full shadow-lg text-sm">{{ toastMessage }}</div>
    </transition>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/useCartStore';
import { useHistoryStore } from '../stores/useHistoryStore';
import { useAuthStore } from '../stores/useAuthStore';
import { getProductsByQuizResult } from '../data/productCatalog';
import { convertPrice } from '../utils/currency';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { getCurrentUserIdentity } from '../lib/currentUser.js';
import { sendRoutineByEmail as emailRoutine, emailServiceConfigured } from '../services/emailService.js';
import TransparentImg from '../components/TransparentImg.vue';
import { useI18n } from '../lib/i18n.js';
import { withTimeout } from '../utils/async.js';

const router = useRouter();
const cart = useCartStore();
const history = useHistoryStore();
const auth = useAuthStore();
const { t } = useI18n();

const logoSrc = 'https://placehold.co/300x80/ffffff/111827?text=My+Routine+AI';
const logoSrcWhite = 'https://placehold.co/300x80/0f172a/ffffff?text=My+Routine+AI';
import quizBannerImg from '../assets/fondo/quiz.png';
const heroSelfieBg = quizBannerImg;
import skinSeca from '../assets/fondo/seca.jpg';
import skinNormal from '../assets/fondo/normal.jpg';
import skinMixta from '../assets/fondo/mixta.jpg';
import skinGrasa from '../assets/fondo/grasa.jpg';
const selfiePlaceholder = 'https://placehold.co/800x1000/dbeafe/1e3a8a?text=SELFIE';

const step = ref('selfie_instructions');
const immersiveSteps = new Set([
  'selfie_instructions',
  'camera',
  'selfie_error',
  'selfie_confirm',
  'about_you',
  'skin_type',
  'barrier_reactivity',
  'post_cleanse_feel',
  'shine_pattern',
  'breakout_pattern',
  'profile_complete',
]);
const routineTab = ref('morning');
const ageModal = ref(false);
const ageDraft = ref(17);
const toastMessage = ref('');
const fileInput = ref(null);
const videoEl = ref(null);
const canvasEl = ref(null);
const capturedDataUrl = ref('');
const cameraReady = ref(false);
const detectorLoading = ref(false);
const countdown = ref(0);
const statusText = ref('Test mode active: you can capture');
const validationMessage = ref('Please try again.');

const answers = reactive({
  age: null,
  skinType: '',
  barrierReactivity: '',
  postCleanseFeel: '',
  shinePattern: '',
  breakoutPattern: '',
});

const liveChecks = reactive({ lighting: true, position: true, straight: true });

const diagnosticQuestions = {
  barrierReactivity: [
    { key: 'resilient', title: 'Rarely reacts', description: 'Tolerates new products, weather, and actives well without noticeable burning or redness.', icon: 'sentiment_satisfied' },
    { key: 'mild', title: 'Sometimes irritated', description: 'May itch or slightly redden with some products or climate changes.', icon: 'sentiment_neutral' },
    { key: 'reactive', title: 'Reacts easily', description: 'Often burns, reddens, or becomes sensitized to exfoliants, fragrances, or sun.', icon: 'sentiment_dissatisfied' },
    { key: 'very_reactive', title: 'Very reactive or intolerant', description: 'Skin gets easily irritated and needs very gentle, repairing formulas.', icon: 'health_and_safety' },
  ],
  postCleanseFeel: [
    { key: 'comfortable', title: 'Comfortable and balanced', description: "Doesn't feel tight or too oily after cleansing.", icon: 'spa' },
    { key: 'slightly_tight', title: 'Slightly tight', description: 'Notices a slight dryness or need for moisturizer shortly after.', icon: 'water_drop' },
    { key: 'very_tight', title: 'Very tight or rough', description: 'Skin feels dry, uncomfortable, or slightly flaky after washing.', icon: 'air' },
    { key: 'tight_but_oily', title: 'Tight then shiny', description: 'First feels dry or tight, but later becomes oily or shiny.', icon: 'contrast' },
  ],
  shinePattern: [
    { key: 'minimal', title: 'Barely any shine', description: 'Skin stays fairly matte or balanced throughout the day.', icon: 'radio_button_unchecked' },
    { key: 'tzone', title: 'Mainly in T-zone', description: 'Shine concentrates on the forehead, nose, or chin.', icon: 'face_retouching_natural' },
    { key: 'all_over', title: 'Across most of the face', description: 'Excess oil appears throughout the face over the course of the day.', icon: 'wb_sunny' },
    { key: 'localized_with_pores', title: 'Shine with visible pores', description: 'Along with shine, noticeable pores or congested texture are visible.', icon: 'blur_on' },
  ],
  breakoutPattern: [
    { key: 'rare', title: 'Almost never', description: 'Pimples or clogged pores appear very rarely.', icon: 'check_circle' },
    { key: 'occasional', title: 'Occasionally', description: 'Appear from time to time due to stress, hormonal cycles, or a product.', icon: 'schedule' },
    { key: 'frequent', title: 'Frequently', description: 'Breakouts, texture, or blackheads appear repeatedly.', icon: 'priority_high' },
    { key: 'persistent', title: 'Persistent and recurring', description: 'Congestion or breakouts remain active most of the time.', icon: 'warning' },
  ],
};

const skinTypes = [
  { key: 'seca', title: 'DRY SKIN', description: 'Select this skin type if your skin tends to feel uncomfortable due to flaking, tightness, or lack of moisture.', image: skinSeca, actionLabel: 'Select' },
  { key: 'normal', title: 'NORMAL SKIN', description: 'Select this skin type if your skin feels balanced, comfortable, without excess oil or noticeable dryness.', image: skinNormal, actionLabel: 'Select' },
  { key: 'mixta', title: 'COMBINATION SKIN', description: 'Select this skin type if you notice a shinier T-zone and other areas that feel more balanced.', image: skinMixta, actionLabel: 'Select' },
  { key: 'grasa', title: 'OILY SKIN', description: 'Select this skin type if you frequently notice shine, prominent pores, or excess sebum.', image: skinGrasa, actionLabel: 'Select' },
];

// El catálogo ya no se define aquí — se usa getProductsByQuizResult del catálogo unificado

const analysis = ref({
  primaryConcern: 'luminosidad',
  profileTitle: '',
  profileSummary: '',
  detailedFindings: [],
  routineFocus: '',
  summaryMetrics: [],
  fullMetrics: [],
  photoMeta: { brightness: 120, contrast: 40, faceDetected: false },
});

let stream = null;
let countdownTimer = null;
let toastTimer = null;

const showProgress = computed(() => ['about_you', 'skin_type', 'barrier_reactivity', 'post_cleanse_feel', 'shine_pattern', 'breakout_pattern', 'profile_complete'].includes(step.value));
const progressStep = computed(() => step.value === 'about_you' ? 1 : showProgress.value ? 2 : 0);
const progressBarWidth = computed(() => step.value === 'about_you' ? 0 : showProgress.value ? 100 : 0);
const suggestedSkinType = computed(() => {
  const meta = analysis.value.photoMeta;
  if (meta.brightness < 95) return 'seca';
  if (meta.brightness > 165 && meta.contrast < 35) return 'grasa';
  if (meta.contrast > 55) return 'mixta';
  return 'normal';
});
const suggestedSkinTypeText = computed(() => skinTypeLabel(suggestedSkinType.value));
const primaryConcernTitle = computed(() => concernTitle(analysis.value.primaryConcern));
const summaryMetrics = computed(() => analysis.value.summaryMetrics);
const fullMetrics = computed(() => analysis.value.fullMetrics);
const routine = computed(() => buildRoutine());
const currentRoutineList = computed(() => routine.value[routineTab.value]);
const primaryConcernDescription = computed(() => ({
  luminosidad: 'Radiant-looking skin is associated with brightness, even tone, and rested texture.',
  deshidratacion: 'When skin loses water easily it can look dull, feel tight, or have an uneven texture.',
  manchas: 'Uneven skin tone can make skin look less uniform.',
  sensibilidad: 'When skin reacts easily, the routine should focus on supporting the barrier.',
  arrugas: 'Over time, more noticeable lines and texture changes may appear.',
  poros: 'When there is shine and more visible pores, a balanced routine helps control excess oil.',
  barrera: 'When the skin barrier is compromised, skin tolerates actives poorly and is affected by climate or cleansing.',
}[analysis.value.primaryConcern] || 'Radiant-looking skin is associated with brightness, even tone, and rested texture.'));

function skinTypeLabel(key) { return ({ seca: 'dry', normal: 'normal', mixta: 'combination', grasa: 'oily' }[key] || 'normal'); }
function concernTitle(key) { return ({ luminosidad: 'Radiance', deshidratacion: 'Hydration', manchas: 'Dark spots', sensibilidad: 'Sensitivity', arrugas: 'Early lines', poros: 'Visible pores', barrera: 'Skin barrier' }[key] || 'Radiance'); }
function metricNote(score) { if (score >= 9) return 'Very stable'; if (score >= 8) return 'Good balance'; if (score >= 7) return 'Needs attention'; return 'Visible priority'; }
function clamp(value) { return Math.max(5.8, Math.min(9.6, Number(value.toFixed(1)))); }
function starText(value) { const r = Math.round(value || 0); return '★'.repeat(Math.max(0, Math.min(5, r))) + '☆'.repeat(Math.max(0, 5 - r)); }
function showToast(message) { toastMessage.value = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => { if (toastMessage.value === message) toastMessage.value = ''; }, 2500); }

function diagnosticLabel(group, key) {
  const labels = {
    resilient: 'rarely reacts', mild: 'sometimes gets irritated', reactive: 'reacts easily', very_reactive: 'is very reactive or intolerant',
    comfortable: 'feels comfortable and balanced', slightly_tight: 'feels slightly tight', very_tight: 'feels very tight or rough', tight_but_oily: 'feels tight, then becomes shiny',
    minimal: 'very little', tzone: 'mainly in the T-zone', all_over: 'across most of the face', localized_with_pores: 'in areas with visible pores',
    rare: 'almost never', occasional: 'occasionally', frequent: 'frequently', persistent: 'persistently',
  };
  return labels[key] || 'not yet defined';
}

function handleBack() {
  const map = {
    camera: 'selfie_instructions', selfie_error: 'camera', selfie_confirm: 'camera', about_you: 'selfie_confirm', skin_type: 'about_you',
    barrier_reactivity: 'skin_type', post_cleanse_feel: 'barrier_reactivity', shine_pattern: 'post_cleanse_feel', breakout_pattern: 'shine_pattern',
    profile_complete: 'breakout_pattern', results_summary: 'profile_complete', routine_intro: 'results_summary', routine: 'routine_intro', analysis_full: 'results_summary'
  };
  if (!map[step.value]) return closeQuiz();
  step.value = map[step.value];
}

function closeQuiz() { stopCamera(); router.push('/inicio'); }
function goToAbout() { stopCamera(); step.value = 'about_you'; }
function continueWithoutSelfie() { stopCamera(); capturedDataUrl.value = ''; analysis.value.photoMeta = { brightness: 125, contrast: 42, faceDetected: false }; step.value = 'about_you'; }
function goToRoutine() { step.value = 'routine'; }
function openAgeModal() { ageDraft.value = answers.age ?? 17; ageModal.value = true; }
function closeAgeModal() { ageModal.value = false; }
function saveAge() { const value = Number(ageDraft.value); if (!Number.isFinite(value) || value < 10 || value > 99) return showToast('Please enter a valid age.'); answers.age = value; ageModal.value = false; step.value = 'skin_type'; }
function triggerUpload() { if (fileInput.value) { fileInput.value.value = ''; fileInput.value.click(); } }

async function openCamera() { step.value = 'camera'; capturedDataUrl.value = ''; countdown.value = 0; await nextTick(); await startCamera(); }
async function startCamera() {
  cameraReady.value = false; stopCamera();
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('CAMERA_UNSUPPORTED');
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1440 } }, audio: false });
    await nextTick();
    if (videoEl.value) {
      videoEl.value.srcObject = stream;
      await videoEl.value.play();
      cameraReady.value = true;
    }
  } catch (e) {
    cameraReady.value = false;
    statusText.value = 'Could not access camera. Please UPLOAD A PHOTO instead.';
    showToast('Could not open camera. Try uploading a photo instead.');
  }
}
function stopCamera() { if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; } if (videoEl.value) videoEl.value.srcObject = null; cameraReady.value = false; clearInterval(countdownTimer); countdown.value = 0; }

function analyzeImageMeta(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxW = 220; const ratio = img.height / img.width; canvas.width = maxW; canvas.height = Math.max(1, Math.round(maxW * ratio));
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve({ brightness: 120, contrast: 40, faceDetected: false });
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let total = 0; const lumValues = [];
      for (let i = 0; i < data.length; i += 4) { const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]; total += lum; lumValues.push(lum); }
      const avg = total / lumValues.length; let varianceSum = 0;
      for (const lum of lumValues) varianceSum += (lum - avg) ** 2;
      const contrast = Math.sqrt(varianceSum / lumValues.length);
      resolve({ brightness: Math.round(avg), contrast: Math.round(contrast), faceDetected: false });
    };
    img.onerror = () => resolve({ brightness: 120, contrast: 40, faceDetected: false });
    img.src = dataUrl;
  });
}

async function onFilePicked(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) return showToast('The selected file is not an image.');
  const reader = new FileReader();
  reader.onload = async () => {
    capturedDataUrl.value = String(reader.result || '');
    stopCamera();
    analysis.value.photoMeta = await analyzeImageMeta(capturedDataUrl.value);
    step.value = 'selfie_confirm';
  };
  reader.readAsDataURL(file);
}

async function captureWithValidation() {
  if (!cameraReady.value || !videoEl.value || !canvasEl.value) return;
  countdown.value = 3; clearInterval(countdownTimer);
  countdownTimer = setInterval(async () => {
    countdown.value -= 1;
    if (countdown.value <= 0) { clearInterval(countdownTimer); await captureFrameAndContinue(); }
  }, 800);
}

async function captureFrameAndContinue() {
  if (!videoEl.value || !canvasEl.value) return;
  const video = videoEl.value, canvas = canvasEl.value;
  const width = video.videoWidth || 720, height = video.videoHeight || 1280;
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  ctx.drawImage(video, 0, 0, width, height);
  capturedDataUrl.value = canvas.toDataURL('image/jpeg', 0.92);
  analysis.value.photoMeta = await analyzeImageMeta(capturedDataUrl.value);
  stopCamera();
  if (analysis.value.photoMeta.brightness < 45) { validationMessage.value = 'The photo is too dark for analysis.'; step.value = 'selfie_error'; return; }
  step.value = 'selfie_confirm';
}

async function retakeSelfie() { await openCamera(); }
function selectSkinType(key) { answers.skinType = key; }
function goToDiagnosticQuestion(target) { if (!answers.skinType) return showToast('Please select your skin type to continue.'); step.value = target; }
function selectDiagnosticOption(field, value, nextStep) { answers[field] = value; step.value = nextStep; }

function buildProfileTitle(ctx) {
  const base = { seca: 'Dry profile', normal: 'Balanced profile', mixta: 'Combination profile', grasa: 'Oily profile' }[ctx.skinType] || 'Skin profile';
  let suffix = 'stable';
  if (['reactive', 'very_reactive'].includes(ctx.barrierReactivity)) suffix = 'with sensitive barrier';
  else if (['slightly_tight', 'very_tight'].includes(ctx.postCleanseFeel)) suffix = 'with dehydration tendency';
  else if (ctx.shinePattern === 'localized_with_pores' || ctx.breakoutPattern === 'persistent') suffix = 'with congestion tendency';
  else if (ctx.shinePattern === 'tzone') suffix = 'with localized sebum';
  return `${base} ${suffix}`;
}

function buildProfileSummary(ctx) {
  const parts = [];
  parts.push({ seca: 'Your combination of answers resembles dry or dry-dehydrated skin.', normal: 'Your combination of answers resembles relatively balanced skin.', mixta: 'Your combination of answers fits a combination skin profile.', grasa: 'Your combination of answers suggests skin with high sebaceous activity.' }[ctx.skinType] || 'Your combination of answers defines an indicative skin profile.');
  if (['reactive', 'very_reactive'].includes(ctx.barrierReactivity)) parts.push('Additionally, the skin response indicates a more vulnerable barrier, so gentle formulas should be prioritized.');
  if (['slightly_tight', 'very_tight'].includes(ctx.postCleanseFeel)) parts.push('The post-cleansing sensation points to water loss or lack of comfort.');
  if (ctx.postCleanseFeel === 'tight_but_oily') parts.push('That pattern of tightness followed by shine often indicates dehydration with sebaceous compensation.');
  if (['localized_with_pores', 'all_over'].includes(ctx.shinePattern) || ['frequent', 'persistent'].includes(ctx.breakoutPattern)) parts.push('The presence of shine, noticeable pores, or frequent breakouts suggests congestion and the need for balance between sebum control and barrier support.');
  parts.push({ sensibilidad: 'The main priority right now is improving tolerance and skin comfort.', barrera: 'The main priority right now is strengthening the skin barrier.', deshidratacion: 'The main priority right now is restoring hydration and comfort.', poros: 'The main priority right now is balancing sebum, texture, and pores.', manchas: 'The main priority right now is evening out skin tone.', arrugas: 'The main priority right now is prevention and softening of early lines.', luminosidad: 'The main priority right now is improving or maintaining radiance.' }[ctx.primaryConcern] || 'The main priority right now is improving or maintaining radiance.');
  return parts.join(' ');
}

function buildDetailedFindings(ctx, metrics) {
  const findings = [];
  if (ctx.skinType === 'seca') findings.push('The overall behavior points to lower lipid levels and more risk of tightness.');
  if (ctx.skinType === 'mixta') findings.push('The combination profile suggests a face with different needs depending on the area.');
  if (ctx.skinType === 'grasa') findings.push('Sebum production seems to play a significant role in your skin behavior.');
  if (ctx.skinType === 'normal') findings.push('The base profile is relatively stable, so the focus is on maintaining balance.');
  if (ctx.barrierReactivity === 'very_reactive') findings.push('High reactivity is consistent with an impaired barrier or reduced cosmetic tolerance.');
  if (ctx.barrierReactivity === 'reactive') findings.push('There are signs of functional sensitivity: burning, redness, or poor tolerance to stronger products.');
  if (ctx.postCleanseFeel === 'very_tight') findings.push('Intense tightness after washing points to marked dehydration or overly aggressive cleansing.');
  if (ctx.postCleanseFeel === 'tight_but_oily') findings.push('The tightness + subsequent shine pattern is often seen when skin tries to compensate for lack of water with more sebum.');
  if (ctx.shinePattern === 'localized_with_pores') findings.push('Shine accompanied by visible pores often correlates with uneven texture and microcongestion.');
  if (ctx.breakoutPattern === 'persistent') findings.push('Recurring breakouts indicate the routine should be consistent, light, and non-comedogenic.');
  findings.push(`Your highest priority indicator is ${metrics[0].label.toLowerCase()}, followed by ${metrics[1].label.toLowerCase()}.`);
  return findings;
}

function generateAnalysis() {
  const age = answers.age || 20;
  const ctx = { skinType: answers.skinType || suggestedSkinType.value, barrierReactivity: answers.barrierReactivity, postCleanseFeel: answers.postCleanseFeel, shinePattern: answers.shinePattern, breakoutPattern: answers.breakoutPattern };
  const photo = analysis.value.photoMeta;
  let barrier = 8.7, hydration = 8.6, sebum = 8.4, texture = 8.3, tone = 8.2, lines = age >= 30 ? 7.8 : age >= 25 ? 8.3 : 8.9;
  if (ctx.skinType === 'seca') { hydration -= 1.1; barrier -= 0.5; sebum += 0.4; texture -= 0.3; }
  if (ctx.skinType === 'mixta') { sebum -= 0.6; hydration -= 0.3; texture -= 0.2; }
  if (ctx.skinType === 'grasa') { sebum -= 1.1; texture -= 0.6; hydration -= 0.2; }
  if (ctx.barrierReactivity === 'mild') barrier -= 0.6;
  if (ctx.barrierReactivity === 'reactive') { barrier -= 1.2; hydration -= 0.4; tone -= 0.2; }
  if (ctx.barrierReactivity === 'very_reactive') { barrier -= 1.8; hydration -= 0.7; tone -= 0.3; }
  if (ctx.postCleanseFeel === 'slightly_tight') hydration -= 0.7;
  if (ctx.postCleanseFeel === 'very_tight') { hydration -= 1.4; barrier -= 0.7; texture -= 0.3; }
  if (ctx.postCleanseFeel === 'tight_but_oily') { hydration -= 1; sebum -= 0.6; barrier -= 0.4; }
  if (ctx.shinePattern === 'tzone') sebum -= 0.7;
  if (ctx.shinePattern === 'all_over') { sebum -= 1.3; texture -= 0.4; }
  if (ctx.shinePattern === 'localized_with_pores') { sebum -= 1.4; texture -= 0.8; }
  if (ctx.breakoutPattern === 'occasional') texture -= 0.4;
  if (ctx.breakoutPattern === 'frequent') { texture -= 0.9; tone -= 0.4; sebum -= 0.4; }
  if (ctx.breakoutPattern === 'persistent') { texture -= 1.4; tone -= 0.6; sebum -= 0.7; }
  if (photo.brightness < 95) { tone -= 0.3; hydration -= 0.4; }
  if (photo.contrast < 28) { tone -= 0.3; texture -= 0.2; }
  if (age >= 28) lines -= 0.5; if (age >= 34) lines -= 0.6;
  const metrics = [
    { key: 'barrera', label: 'Skin barrier', score: clamp(barrier) },
    { key: 'deshidratacion', label: 'Hydration', score: clamp(hydration) },
    { key: 'poros', label: 'Sebum & pores', score: clamp(sebum) },
    { key: 'textura', label: 'Texture & congestion', score: clamp(texture) },
    { key: 'manchas', label: 'Even skin tone', score: clamp(tone) },
    { key: 'arrugas', label: 'Early lines', score: clamp(lines) },
  ];
  const sorted = [...metrics].sort((a, b) => a.score - b.score);
  let primaryConcern = 'luminosidad';
  if (sorted[0].key === 'barrera') primaryConcern = barrier <= 7.5 ? 'sensibilidad' : 'barrera';
  if (sorted[0].key === 'deshidratacion') primaryConcern = 'deshidratacion';
  if (sorted[0].key === 'poros' || sorted[0].key === 'textura') primaryConcern = 'poros';
  if (sorted[0].key === 'manchas') primaryConcern = 'manchas';
  if (sorted[0].key === 'arrugas') primaryConcern = 'arrugas';
  const fullCtx = { ...ctx, primaryConcern };
  return {
    primaryConcern,
    profileTitle: buildProfileTitle(ctx),
    profileSummary: buildProfileSummary(fullCtx),
    detailedFindings: buildDetailedFindings(ctx, sorted),
    routineFocus: ({ sensibilidad: 'The routine should be short, calming, and without too many actives at once.', barrera: 'The routine should prioritize barrier repair and gentle cleansing.', deshidratacion: 'The priority will be to cleanse gently, add water, and reinforce the barrier.', poros: 'The routine should balance shine and congestion without over-drying.', manchas: 'The routine will focus on skin tone evenness combined with sun protection.', arrugas: 'The priority will be prevention and anti-aging support with hydration and sun protection.', luminosidad: 'The routine will focus on maintaining overall balance.' }[primaryConcern]),
    summaryMetrics: sorted.slice(0, 3).map(m => ({ ...m, note: metricNote(m.score) })),
    fullMetrics: metrics.map(m => ({ ...m, note: metricNote(m.score) })),
    photoMeta: { ...photo },
  };
}

const QUIZ_IMAGE_BUCKET = 'quiz-selfies'

async function uploadQuizSelfie(userId, quizSessionId, dataUrl, photoMeta = {}) {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return null

  let storagePath = null
  let publicUrl = null

  try {
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    const fileName = `quiz-images/${userId}/${quizSessionId}.jpg`

    const { error: uploadError } = await supabase.storage
      .from(QUIZ_IMAGE_BUCKET)
      .upload(fileName, blob, { upsert: true })

    if (!uploadError) {
      storagePath = fileName
      const { data: urlData, error: urlError } = supabase.storage
        .from(QUIZ_IMAGE_BUCKET)
        .getPublicUrl(fileName)
      if (!urlError) publicUrl = urlData?.publicUrl || null
    } else {
      console.warn('[Quiz] Supabase storage upload failed:', uploadError.message)
    }
  } catch (uploadException) {
    console.warn('[Quiz] Supabase storage upload exception:', uploadException?.message || uploadException)
  }

  if (!publicUrl) {
    publicUrl = dataUrl
  }

  try {
    const { error: imageError } = await supabase.from('quiz_images').insert({
      quiz_session_id: quizSessionId,
      storage_path: storagePath,
      public_url: publicUrl,
      is_selfie: true,
      face_detected: photoMeta?.faceDetected || false,
      brightness: photoMeta?.brightness || null,
    })

    if (imageError) {
      console.warn('[Quiz] Supabase image record failed:', imageError.message)
    }
  } catch (insertException) {
    console.warn('[Quiz] Supabase image record exception:', insertException?.message || insertException)
  }

  return { storagePath, publicUrl }
}

async function saveQuizToSupabase(quizData) {
  // FASE 10 — save quiz session to Supabase (best-effort)
  if (!isSupabaseConfigured) return
  try {
    const user = await getCurrentUserIdentity()
    if (!user?.id) return

    // Preferido: esquema normalizado del backend (`PharmaDerm-Backend/database/schema.sql`)
    // - quiz_sessions: señales del quiz + metadata
    // - skin_analyses: resultado (perfil/título/métricas)
    const photoMeta = quizData.photoMeta || {}

    // Resolve skin_type_id if the lookup table exists
    let skinTypeId = null
    try {
      if (quizData.skinType) {
        const st = await supabase
          .from('skin_types')
          .select('id')
          .eq('code', quizData.skinType)
          .maybeSingle()
        skinTypeId = st?.data?.id ?? null
      }
    } catch { /* ignore */ }

    const insertQuiz = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: user.id,
        skin_type_id: skinTypeId,
        barrier_reactivity: quizData.answers?.barrierReactivity || null,
        post_cleanse_feel: quizData.answers?.postCleanseFeel || null,
        shine_pattern: quizData.answers?.shinePattern || null,
        breakout_pattern: quizData.answers?.breakoutPattern || null,
        age: quizData.age || null,
        photo_meta: photoMeta,
        selfie_stored: !!quizData.selfie,
        completed: true,
      })
      .select('id')
      .maybeSingle()

    if (!insertQuiz.error && insertQuiz.data?.id) {
      await uploadQuizSelfie(user.id, insertQuiz.data.id, quizData.selfie, photoMeta)
      const analysisRes = await supabase.from('skin_analyses').insert({
        quiz_session_id: insertQuiz.data.id,
        user_id: user.id,
        primary_concern: quizData.primaryConcern || null,
        profile_title: quizData.profileTitle || null,
        profile_summary: quizData.profileSummary || null,
        detailed_findings: quizData.detailedFindings || null,
        routine_focus: quizData.routineFocus || null,
        metrics: quizData.fullMetrics || [],
      })

      if (!analysisRes.error) return
      console.warn('[Quiz] Supabase save failed (skin_analyses):', analysisRes.error?.message)
    } else {
      console.warn('[Quiz] Supabase save failed (schema.sql quiz_sessions):', insertQuiz.error?.message)
    }

    // Fallback: esquema "denormalizado" (si tu BD NO tiene el schema.sql aplicado)
    const attemptA = await supabase.from('quiz_sessions').insert({
      user_id: user.id,
      skin_type: quizData.skinType || null,
      sensitivity: quizData.sensitivity || null,
      primary_concern: quizData.primaryConcern || null,
      concerns: quizData.concerns || [],
      profile_title: quizData.profileTitle || null,
      routine_focus: quizData.routineFocus || null,
      full_metrics: quizData.fullMetrics || [],
      answers: quizData.answers || {},
      completed_at: new Date().toISOString(),
    })

    if (attemptA.error) console.warn('[Quiz] Supabase save failed (denormalized quiz_sessions):', attemptA.error?.message)
  } catch (e) {
    console.warn('[Quiz] Supabase save failed (non-critical):', e?.message)
  }
}

async function generateAnalysisAndGoResults() {
  if (!capturedDataUrl.value) {
    showToast(t('quiz.photoRequired'));
    step.value = 'selfie_instructions';
    return;
  }
  const result = generateAnalysis();
  analysis.value = result;
  const builtRoutine = buildRoutine();
  const sensitivityMap = { resilient: 'No sensitivity', mild: 'Low sensitivity', reactive: 'Medium sensitivity', very_reactive: 'High sensitivity' }
  const quizData = {
    completed: true,
    age: answers.age || null,
    skinType: answers.skinType || suggestedSkinType.value,
    sensitivity: sensitivityMap[answers.barrierReactivity] || 'Low sensitivity',
    concerns: result.primaryConcern ? [result.primaryConcern] : [],
    profileTitle: result.profileTitle,
    profileSummary: result.profileSummary,
    detailedFindings: result.detailedFindings,
    primaryConcern: result.primaryConcern,
    routineFocus: result.routineFocus,
    summaryMetrics: result.summaryMetrics,
    fullMetrics: result.fullMetrics,
    answers: { ...answers },
    selfie: capturedDataUrl.value || '',
    morningRoutine: builtRoutine.morning.map(p => p.name),
    nightRoutine: builtRoutine.night.map(p => p.name),
    morningSteps: builtRoutine.morning,
    nightSteps: builtRoutine.night,
    routineSteps: builtRoutine.morning,
  }
  await history.saveQuizResult(quizData)
  // FASE 10 — save to Supabase (non-blocking, best-effort)
  saveQuizToSupabase(quizData)
  step.value = 'results_summary';
}

function buildRoutine() {
  const quizResult = {
    skinType: answers.skinType || suggestedSkinType.value,
    concerns: analysis.value.primaryConcern ? [analysis.value.primaryConcern] : [],
    sensitivity: answers.barrierReactivity || 'mild',
  };
  const toStep = (p, i) => ({
    ...p,
    step: i + 1,
    longDescription: p.description || p.longDescription || '',
    size: p.sizes?.[0]?.label || p.size || '',
    category: p.category || p.type || 'Cuidado',
  });
  return {
    morning: getProductsByQuizResult(quizResult, 'morning').map(toStep),
    night:   getProductsByQuizResult(quizResult, 'night').map(toStep),
  };
}

function addProductAndGo(product) {
  if (!product) return;
  const usdPrice = product.sizes?.[0]?.priceUSD ?? product.priceFrom ?? product.priceUSD ?? 0;
  const priceRD = Math.round(convertPrice(usdPrice, 'USD', 'DOP'));
  const size = product.sizes?.[0]?.label || product.size || 'Default';
  cart.addItem(product, { size, qty: 1, priceRD });
  router.push('/carrito');
}

function goToDiagnostics() {
  router.push('/diagnostics')
}

function goToRoutinePage() {
  router.push('/routine')
}

function setChromeHidden(hidden) {
  window.dispatchEvent(new CustomEvent('pd:chrome', { detail: { hidden } }))
}

watch(step, async (nextStep) => {
  setChromeHidden(immersiveSteps.has(nextStep))
  await nextTick()
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}, { immediate: true })

async function sendRoutineByEmail() {
  // FASE 10 — send routine via EmailJS (static import)
  if (!emailServiceConfigured) {
    showToast('The email service is not configured yet.')
    return
  }
  try {
    let email = null
    try {
      const user = await getCurrentUserIdentity()
      email = user?.email
    } catch { /* ignore */ }
    if (!email) email = auth.user?.value?.email || null
    if (!email) { showToast('Sign in to receive your routine by email.'); return }
    const r = routine.value
    const profileUser = auth.user?.value || auth.user
    const userName = profileUser?.first_name || profileUser?.firstName || profileUser?.name || 'Cliente'
    const morning = (r.morning || []).map((p, i) => `Paso ${i + 1}: ${p.name}`).join('\n')
    const night = (r.night || []).map((p, i) => `Paso ${i + 1}: ${p.name}`).join('\n')
    const recommended = [...(r.morning || []), ...(r.night || [])]
      .map(p => p.name)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .join(', ')

    const result = await withTimeout(emailRoutine({
      to_email: email,
      to_name: userName,
      skin_type: answers.skinType || suggestedSkinType.value,
      diagnosis: concernTitle(analysis.value.primaryConcern) || '',
      morning_routine: morning,
      night_routine: night,
      recommended_products: recommended,
      reply_to: 'soporte@pharmadermrd.com',
      routine_id: Date.now(),
    }, 'es'), 12000, 'Routine email')
    showToast(
      result.ok
        ? 'Routine sent to your email.'
        : result.message || (result.simulated ? 'Email delivery is not configured correctly.' : 'The email could not be sent.')
    )
  } catch {
    showToast('The email could not be sent.')
  }
}

onMounted(() => {
  nextTick(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }))
  // FASE 10 — pre-populate age from user profile if available
  const profileUser = auth.user?.value || auth.user
  if (profileUser?.birth_date) {
    const birthYear = new Date(profileUser.birth_date).getFullYear()
    const age = new Date().getFullYear() - birthYear
    if (age >= 10 && age <= 99) answers.age = age
  } else if (profileUser?.age) {
    const age = Number(profileUser.age)
    if (age >= 10 && age <= 99) answers.age = age
  }
});

onBeforeUnmount(() => { setChromeHidden(false); stopCamera(); clearInterval(countdownTimer); clearTimeout(toastTimer); });
</script>

<style scoped>
.progress-node { width: 28px; height: 28px; border-radius: 999px; border: 1px solid #16a6e2; color: #16a6e2; display: grid; place-items: center; font-size: 14px; background: white; }
.progress-node.active { background: #16a6e2; color: white; }
.quiz-home-btn { position: absolute; top: 14px; left: 14px; z-index: 10; min-height: 42px; border: 1px solid rgba(255,255,255,.7); background: rgba(255,255,255,.88); color: #005187; padding: 0 16px; font-weight: 800; letter-spacing: .02em; backdrop-filter: blur(8px); }
.camera-chip { flex: 1; text-align: center; border: 1px solid #34d399; color: #34d399; background: rgba(0,0,0,.25); padding: 10px 8px; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
.face-guide { width: min(78vw, 420px); height: min(62vh, 560px); position: relative; }
.corner { position: absolute; width: 62px; height: 62px; border: 6px solid rgba(255,255,255,.95); }
.corner.tl { top: 0; left: 0; border-right: 0; border-bottom: 0; border-radius: 18px 0 0 0; }
.corner.tr { top: 0; right: 0; border-left: 0; border-bottom: 0; border-radius: 0 18px 0 0; }
.corner.bl { bottom: 0; left: 0; border-right: 0; border-top: 0; border-radius: 0 0 0 18px; }
.corner.br { bottom: 0; right: 0; border-left: 0; border-top: 0; border-radius: 0 0 18px 0; }
.mesh { position: absolute; inset: 12% 10%; background-image: linear-gradient(rgba(255,255,255,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.22) 1px, transparent 1px); background-size: 16px 16px; mask-image: radial-gradient(circle at center, rgba(0,0,0,.65), transparent 82%); -webkit-mask-image: radial-gradient(circle at center, rgba(0,0,0,.65), transparent 82%); }
.chat-bubble { background: white; border-radius: 24px; padding: 16px 20px; font-size: 16px; color: #1f2937; line-height: 1.65; box-shadow: 0 1px 0 rgba(0,0,0,.04); }
.pill-blue { width: 100%; background: #16A6E2; color: white; border-radius: 999px; padding: 16px 24px; font-size: 16px; }
.question-card { width: 100%; border-radius: 26px; border: 1px solid #e2e8f0; background: white; padding: 20px; text-align: left; transition: .2s; box-shadow: 0 6px 24px rgba(0,0,0,.04); }
.question-card.selected { border-color: #16A6E2; box-shadow: 0 0 0 2px rgba(22,166,226,.15); }
.question-icon { width: 48px; height: 48px; border-radius: 999px; display: flex; align-items: center; justify-content: center; background: #f1f5f9; color: #475569; flex-shrink: 0; }
.question-icon.selected { background: #16A6E2; color: white; }
.age-line-btn { display: flex; align-items: center; gap: 14px; border: 0; background: transparent; color: #1f2937; font-size: 18px; }
.age-line-btn .dash { width: 64px; height: 2px; background: #cbd5e1; display: inline-block; }
.age-line-btn .value { min-width: 44px; text-align: center; font-size: 22px; letter-spacing: .12em; }
.age-line-btn .suffix { color: #334155; }
.age-modal-input { width: 160px; height: 100px; border: 2px solid #dca500; font-size: 44px; text-align: center; outline: none; color: #0f172a; }
.carousel-dot { width: 18px; height: 4px; border-radius: 999px; background: #d1d5db; }
.carousel-dot.active { background: #16a6e2; }
.promo-strip { background: #16a6e2; color: white; padding: 14px 16px; display: flex; align-items: center; gap: 12px; font-size: 15px; line-height: 1.45; }
.result-summary-card { overflow: hidden; }
.photo-backdrop { background: linear-gradient(90deg, rgba(0,0,0,.65), rgba(0,0,0,.1), rgba(0,0,0,.65)), #111827; min-height: 330px; display: flex; align-items: center; justify-content: center; padding: 22px; }
.summary-selfie { width: min(260px, 70vw); height: auto; border-radius: 6px; object-fit: cover; }
.result-sheet { background: white; margin: -18px 24px 0; padding: 24px; box-shadow: 0 6px 20px rgba(0,0,0,.08); position: relative; }
.result-tag { display: inline-block; background: #16a6e2; color: white; padding: 4px 8px; font-size: 11px; border-radius: 4px; }
.routine-tab { flex: 1; height: 58px; font-size: 18px; color: #475569; border-bottom: 3px solid transparent; }
.routine-tab.active { color: #16a6e2; border-bottom-color: #16a6e2; }
.email-buy-bar { display: grid; grid-template-columns: 1fr 88px; gap: 14px; }
.email-cta { min-height: 64px; border: 1px solid #475569; background: white; color: #0f172a; padding: 12px 16px; display: flex; align-items: center; gap: 12px; text-align: left; font-size: 15px; }
.buy-lock-btn { min-height: 64px; background: #c6ecfb; color: white; display: flex; align-items: center; justify-content: center; }
.quiz-confirm-actions { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 14px; }
.quiz-confirm-actions .btn-primary { min-height: 56px; border: 1px solid #16a6e2; background: #16a6e2; color: white; font-weight: 800; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.fade-enter-active, .fade-leave-active { transition: opacity .25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@media (max-width: 640px) { .promo-strip { font-size: 13px; } .email-buy-bar { grid-template-columns: 1fr 72px; } .email-cta { font-size: 13px; } .result-sheet { margin: -14px 12px 0; padding: 18px; } }
</style>


