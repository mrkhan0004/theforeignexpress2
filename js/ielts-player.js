/* The Foreign Express Academic IELTS sample player.
 * Objective sample questions can be scored locally. Writing and Speaking are
 * not assigned a band because no validated scoring service is connected.
 */
(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const testId = params.get('id') || '';
  const mode = params.get('mode') === 'exam' ? 'exam' : 'practice';
  const test = FE_TESTS[testId];
  const root = document.getElementById('teRoot');
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const keyForDraft = `tfe_ielts_draft_${testId}`;
  const readDraft = () => { try { return JSON.parse(localStorage.getItem(keyForDraft) || '{}') || {}; } catch (_) { return {}; } };
  const answers = readDraft();
  const saveDraft = () => { try { localStorage.setItem(keyForDraft, JSON.stringify(answers)); } catch (_) { toast('Draft could not be saved in this browser.'); } };

  if (!test || !root) {
    if (root) root.innerHTML = `<section class="lp-empty"><p class="lp-eyebrow">ACADEMIC PRACTICE</p><h1>Test not available</h1><p>This test ID is not connected to a local question set yet. Choose a playable practice set from the IELTS library.</p><a class="rv-btn rv-btn-dark" href="ielts.html#library">Return to Academic test library ↗</a></section>`;
    return;
  }

  if (typeof FE !== 'undefined' && FE.hasIeltsAccess && !FE.hasIeltsAccess()) {
    root.innerHTML = FE.renderIeltsGateHtml();
    return;
  }

  const sections = test.secs.map(id => FE_SECTIONS[id]).filter(Boolean);
  if (!sections.length) {
    root.innerHTML = `<section class="lp-empty"><h1>Test content missing</h1><p>The selected test has no connected sections. Check the test-data file before publishing it.</p><a href="ielts.html#library">Return to library</a></section>`;
    return;
  }

  let currentSection = 0;
  let sectionSeconds = sections[0].mins * 60;
  let sectionTimer = null;
  let pausedTimer = false;
  let highlighterOn = false;
  let audioPlaying = false;
  let audioPaused = false;
  let audioReplays = 0;
  let activeWriteTask = 'w1';
  let activeSpeakingPart = 0;
  let speakingClock = null;
  let speakingClockRemaining = 0;
  let speakingClockEnd = null;
  let mediaRecorder = null;
  let mediaStream = null;
  let mediaChunks = [];
  let recording = false;
  let pendingSubmit = null;
  const recordings = {};
  const objectiveResults = [];
  const sectionResults = [];

  const totalQuestions = section => {
    if (section.type === 'writing') return (section.tasks || []).length || 1;
    if (section.type === 'speaking') return (section.parts || []).reduce((sum, part) => sum + (part.questions || []).length, 0);
    return (section.questions || []).length;
  };
  const optionsFor = question => question.t === 'tf' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : (question.opts || []);
  const totalQuestionsAll = sections.reduce((sum, section) => sum + totalQuestions(section), 0);
  const showToast = message => {
    if (window.FE && typeof FE.toast === 'function') FE.toast(message);
    else window.alert(message);
  };
  const formatTime = seconds => `${String(Math.floor(Math.max(0, seconds) / 60)).padStart(2, '0')}:${String(Math.max(0, seconds) % 60).padStart(2, '0')}`;
  const recordingExtension = record => String(record && record.type || '').toLowerCase().includes('mp4') ? 'm4a' : 'webm';
  const current = () => sections[currentSection];
  const currentPart = () => (current().parts || [])[activeSpeakingPart];

  function intro() {
    root.innerHTML = `<section class="lp-intro">
      <p class="lp-eyebrow">THE FOREIGN EXPRESS · ACADEMIC PRACTICE</p>
      <h1>${esc(test.name)}<br><span>Practise with a clear split-screen layout.</span></h1>
      <p class="lp-intro-copy">Work in the left and right panes on desktop, move through questions, use the timer and save text answers locally in this browser. On smaller screens, the panes stack vertically.</p>
      <div class="lp-mode-row"><span class="lp-mode-chip">${mode === 'exam' ? 'EXAM-STYLE TIMER' : 'PRACTICE MODE'}</span><span class="lp-mode-chip">ACADEMIC ONLY</span><span class="lp-mode-chip">${sections.length} SECTION${sections.length === 1 ? '' : 'S'}</span><span class="lp-mode-chip">${test.mins} MINUTES</span></div>
      <div class="lp-section-list">${sections.map((section, index) => `<div class="lp-section-preview"><b>${String(index + 1).padStart(2, '0')} · ${esc(section.title)}</b><small>${section.mins} min · ${totalQuestions(section)} ${section.type === 'speaking' ? 'prompts' : section.type === 'writing' ? 'tasks' : 'questions'}</small></div>`).join('')}</div>
      <div class="lp-disclaimer">This build contains original sample material, not licensed Cambridge test papers. Listening uses browser text-to-speech for the bundled sample script rather than an official audio recording. Writing and speaking are not automatically AI-scored.</div>
      <div class="lp-intro-actions"><button class="rv-btn rv-btn-dark" type="button" data-action="begin-test">Start practice ↗</button><a class="rv-link-arrow" href="ielts.html#library">Back to test library →</a></div>
    </section>`;
  }

  function loadSection(index) {
    clearInterval(sectionTimer);
    clearInterval(speakingClock);
    speakingClock = null;
    speakingClockEnd = null;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      try { mediaRecorder.stop(); } catch (_) {}
    }
    stopTracks();
    currentSection = index;
    sectionSeconds = current().mins * 60;
    pausedTimer = false;
    audioPlaying = false;
    audioPaused = false;
    audioReplays = 0;
    highlighterOn = false;
    activeWriteTask = 'w1';
    activeSpeakingPart = 0;
    const section = current();
    const singleColumnListening = section.type === 'listening';
    const panes = renderPanes(section);
    const splitMarkup = singleColumnListening
      ? `<div class="lp-split-screen lp-single-pane-listening"><section class="lp-pane lp-pane-right" id="qPane">${panes.left}${panes.right}</section></div>`
      : `<div class="lp-split-screen"><section class="lp-pane lp-pane-left" id="srcPane">${panes.left}</section><section class="lp-pane lp-pane-right" id="qPane">${panes.right}</section></div>`;
    const showSectionTimer = section.type !== 'speaking';
    root.innerHTML = `<div class="lp-topbar">
        <div class="lp-topbar-title"><small>THE FOREIGN EXPRESS · ACADEMIC TEST PLAYER</small><strong>${esc(test.name)} · ${index + 1}/${sections.length} — ${esc(section.title)}</strong></div>
        <div class="lp-topbar-controls"><span class="lp-mode-label">${mode === 'exam' ? 'EXAM MODE' : 'PRACTICE'}</span>${showSectionTimer ? `<span class="lp-timer" id="teTimer">${formatTime(sectionSeconds)}</span>` : ''}
          ${mode === 'practice' && showSectionTimer ? '<button class="lp-control-btn" type="button" data-action="toggle-pause">Pause timer</button>' : ''}
          <button class="lp-control-btn" type="button" data-action="submit-section">${index === sections.length - 1 ? 'Finish section' : 'Submit & continue'}</button>
          <a class="lp-control-btn lp-danger" href="ielts.html#library">Exit</a>
        </div>
      </div>
      ${splitMarkup}
      <nav class="lp-question-nav" id="qNav" aria-label="Question navigation"></nav>`;

    if (section.type === 'reading') {
      attachHighlight();
      renderQuestionNav(section);
    } else if (section.type === 'listening') {
      renderQuestionNav(section);
    } else if (section.type === 'writing') {
      refreshWordCount();
      document.getElementById('qNav').innerHTML = '<span class="lp-nav-title">Writing workspace</span><span class="lp-muted">Switch between Task 1 and Task 2 using the tabs.</span>';
    } else if (section.type === 'speaking') {
      document.getElementById('qNav').style.display = 'none';
      refreshMicState();
    }
    if (showSectionTimer) startSectionTimer();
  }

  function renderPanes(section) {
    if (section.type === 'reading') {
      const left = `<p class="lp-pane-kicker">Academic Reading · Passage</p><h2>${esc(section.title)}</h2>
        <div class="lp-tool-row"><button type="button" class="lp-tool" data-action="toggle-highlighter" id="hlBtn" aria-pressed="false">Highlight: off</button><button type="button" class="lp-tool" data-action="clear-highlights">Clear highlights</button></div>
        <div class="lp-passage" id="passage">${section.passage}</div>`;
      const right = `<p class="lp-pane-kicker">Answer sheet</p><h2>Read and answer</h2><p class="lp-muted">Select one option or enter the missing word. Use the question navigator at the bottom to jump through the test.</p>${section.questions.map((question, qIndex) => renderQuestion(question, qIndex)).join('')}`;
      return { left, right };
    }
    if (section.type === 'listening') {
      const practiceTranscript = mode === 'practice' ? `<button type="button" class="lp-tool" data-action="toggle-transcript">Transcript: show / hide</button>` : '';
      const left = `<p class="lp-pane-kicker">Academic Listening · Audio sample</p><h2>${esc(section.title)}</h2>
        <div class="lp-tool-row"><button type="button" class="lp-tool is-active" data-action="play-audio">▶ Play read-aloud</button><button type="button" class="lp-tool" data-action="pause-audio" id="pauseAudioBtn">Ⅱ Pause</button><button type="button" class="lp-tool" data-action="stop-audio">■ Stop</button>${practiceTranscript}</div>
        <p class="lp-muted">This demonstration reads the original sample script with your browser's speech synthesis. It is not a licensed IELTS audio recording. Replays: <b id="repN">0</b> / ${mode === 'exam' ? '1' : '3'}.</p>
        <div id="transcript" class="lp-passage" style="display:none">${section.chunks.map((chunk, index) => `<p data-ch="${index}">${esc(chunk)}</p>`).join('')}</div><div id="liveChunks" class="lp-passage" aria-live="polite" style="display:none"></div>`;
      const right = `<p class="lp-pane-kicker">Academic Listening · Answer sheet</p><h2>Listen for the detail</h2><p class="lp-muted">Play the sample once before answering.</p>${section.questions.map((question, qIndex) => renderQuestion(question, qIndex)).join('')}`;
      return { left, right };
    }
    if (section.type === 'writing') return { left: renderWritingPrompt(section), right: renderWritingEditor(section) };
    if (section.type === 'speaking') return { left: renderSpeakingPrompt(section), right: renderSpeakingRecorder(section) };
    return { left: '<h2>Unsupported section</h2>', right: '<p>Section type is not configured.</p>' };
  }

  function renderQuestion(question, qIndex) {
    const key = `${currentSection}-${qIndex}`;
    const answer = answers[key];
    let body = '';
    if (question.t === 'fib') {
      body = `<input class="lp-answer-input" type="text" autocomplete="off" data-answer-key="${key}" value="${esc(answer || '')}" placeholder="Type your answer…" aria-label="Answer question ${qIndex + 1}">`;
    } else {
      const options = optionsFor(question);
      body = `<div class="lp-options">${options.map((option, optionIndex) => `<button type="button" class="lp-option ${answer === optionIndex ? 'is-selected' : ''}" data-action="pick-answer" data-key="${key}" data-choice="${optionIndex}" aria-pressed="${answer === optionIndex}"><span class="lp-option-key">${String.fromCharCode(65 + optionIndex)}</span><span>${esc(option)}</span></button>`).join('')}</div>`;
    }
    const hint = mode === 'practice' && question.hint ? `<button type="button" class="lp-tool" data-action="toggle-hint" aria-expanded="false">Show practice hint</button><div class="lp-hint" hidden>${esc(question.hint)}</div>` : '';
    const questionLabel = question.t === 'tf' ? 'TRUE / FALSE / NOT GIVEN' : question.t === 'fib' ? 'Type your answer' : 'Choose one answer';
    return `<article class="lp-question-card" id="q-${key}"><span class="lp-question-title">${esc(question.q)}</span><p class="lp-question-note">${questionLabel}</p>${body}${hint}</article>`;
  }

  function renderWritingTabs(section) {
    const tasks = section.tasks || [{ id: 'w2', label: 'Task 2', title: section.title, prompt: section.prompt }];
    return `<div class="lp-task-tabs" role="tablist" aria-label="Writing task">${tasks.map(task => `<button type="button" class="lp-task-tab" role="tab" data-action="select-writing-task" data-task="${esc(task.id)}" aria-selected="${task.id === activeWriteTask}">${esc(task.label)}</button>`).join('')}</div>`;
  }

  function renderWritingPrompt(section) {
    const tasks = section.tasks || [{ id: 'w2', label: 'Task 2', title: section.title, prompt: section.prompt }];
    const task = tasks.find(item => item.id === activeWriteTask) || tasks[0];
    activeWriteTask = task.id;
    const table = task.table ? `<table class="lp-writing-data"><thead><tr>${task.table[0].map(cell => `<th>${esc(cell)}</th>`).join('')}</tr></thead><tbody>${task.table.slice(1).map(row => `<tr>${row.map(cell => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>` : '';
    return `<p class="lp-pane-kicker">Academic Writing · Task prompt</p><h2>${esc(task.title || task.label)}</h2>${renderWritingTabs(section)}<p>${esc(task.prompt).replace(/\n/g, '<br>')}</p>${table}<div class="lp-disclaimer">The task above is original sample content created for this demo. Task 1 uses a sample data table, not a Cambridge paper.</div>`;
  }

  function renderWritingEditor(section) {
    const tasks = section.tasks || [{ id: 'w2', label: 'Task 2', title: section.title, prompt: section.prompt, minWords: 250 }];
    const task = tasks.find(item => item.id === activeWriteTask) || tasks[0];
    activeWriteTask = task.id;
    const minWords = task.id === 'w1' ? 150 : 250;
    const text = answers[task.id] || '';
    const words = countWords(text);
    return `<p class="lp-pane-kicker">Academic Writing · Your response</p><h2>Write your answer</h2>${renderWritingTabs(section)}
      <div class="lp-editor-toolbar"><strong>${esc(task.label)} response</strong><span id="wordCount" class="lp-word-count ${words < minWords ? 'is-short' : ''}">${words} words · minimum ${minWords}</span></div>
      <textarea id="essay" class="lp-writing-editor" data-writing-key="${esc(task.id)}" aria-label="${esc(task.label)} response" placeholder="Write your response here…">${esc(text)}</textarea>
      <p class="lp-local-save">Draft is autosaved in this browser only. It is not uploaded to a server.</p>
      <div class="lp-disclaimer">No AI Writing Checker API is connected in this build. Submission records word counts and completion status; it does not invent a band score.</div>`;
  }

  function renderSpeakingPrompt(section) {
    const part = currentPart();
    const cue = part.cue ? `<div class="lp-speak-cue"><small>PREPARATION CARD · ${esc(part.label.toUpperCase())}</small><p>${esc(part.cue)}</p></div>` : '';
    return `<p class="lp-pane-kicker">Academic Speaking · Examiner side</p><h2>${esc(part.title)}</h2>
      <div class="lp-part-tabs" role="tablist" aria-label="Speaking parts">${section.parts.map((item, index) => `<button type="button" class="lp-part-tab" role="tab" data-action="select-speaking-part" data-part="${index}" aria-selected="${index === activeSpeakingPart}">${esc(item.label)}</button>`).join('')}</div>
      ${cue}<p class="lp-muted">Use the prompts below to structure your answer. These are original practice prompts, not official test questions.</p>
      <ol class="lp-prompt-list">${part.questions.map(question => `<li>${esc(question)}</li>`).join('')}</ol>
      <div class="lp-tool-row"><button type="button" class="lp-tool" data-action="read-speaking-prompts">▶ Read prompts aloud</button></div>`;
  }

  function renderSpeakingRecorder(section) {
    const part = currentPart();
    const record = recordings[activeSpeakingPart];
    const reflectionKey = `speaking-reflection-${activeSpeakingPart}`;
    return `<p class="lp-pane-kicker">Academic Speaking · Response side</p><h2>Record your answer</h2>
      <div class="lp-recorder-card">
        <div class="lp-mic-status" id="micStatus"><span class="lp-mic-dot"></span><span id="micStatusText">Microphone not started</span></div>
        <p class="lp-muted">Browser microphone access is required. Recording stays in this page unless you choose to download it; it is not uploaded.</p>
        <div class="lp-speaking-clock" id="speakingClock">${record ? '00:00' : formatTime(part.prepSec || part.answerSec)}</div><div class="lp-speaking-clock-label" id="speakingClockLabel">${record ? 'Recording ready for playback/download' : (part.prepSec ? 'Preparation time available' : 'Answer time available') + ' · ' + (part.prepSec ? '1 minute prep' : `${Math.floor(part.answerSec / 60)} minute response window`)}</div>
        <div class="lp-recorder-actions">${part.prepSec ? '<button type="button" class="lp-record-btn secondary" data-action="start-speaking-prep">Start 1-minute prep</button>' : ''}<button type="button" class="lp-record-btn" data-action="start-speaking-recording" id="recordBtn">● Record answer</button><button type="button" class="lp-record-btn stop" data-action="stop-speaking-recording" id="stopRecordBtn" disabled>■ Stop</button></div>
        ${record ? `<audio class="lp-audio-preview" controls src="${record.url}"></audio><a class="lp-download-audio" href="${record.url}" download="foreign-express-speaking-part-${activeSpeakingPart + 1}.${recordingExtension(record)}">Download recorded answer ↗</a>` : '<p class="lp-muted" id="recordingHint">Your audio preview will appear here after you stop recording.</p>'}
      </div>
      <div class="lp-recorder-card"><label class="lp-question-title" for="reflection">Self-review notes</label><textarea id="reflection" class="lp-reflection" data-reflection-key="${reflectionKey}" placeholder="What felt clear? Which words or ideas would you improve?">${esc(answers[reflectionKey] || '')}</textarea><p class="lp-local-save">Notes are autosaved locally. Speaking band scoring and speech-to-text are not connected.</p></div>
      <div class="lp-disclaimer">Microphone capture generally requires HTTPS or localhost and your permission. If the browser does not support MediaRecorder, use another supported browser/device. No audio is sent to an AI service.</div>`;
  }

  function startSectionTimer() {
    clearInterval(sectionTimer);
    updateSectionClock();
    sectionTimer = setInterval(() => {
      if (pausedTimer) return;
      sectionSeconds = Math.max(0, sectionSeconds - 1);
      updateSectionClock();
      if (sectionSeconds <= 0) {
        clearInterval(sectionTimer);
        showToast('Section time is up. Submitting your current work.');
        submitSection(true);
      }
    }, 1000);
  }

  function updateSectionClock() {
    const timer = document.getElementById('teTimer');
    if (!timer) return;
    timer.textContent = formatTime(sectionSeconds);
    timer.classList.toggle('low', sectionSeconds <= 60);
  }

  function countWords(text) {
    const trimmed = String(text || '').trim();
    return trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  }

  function refreshWordCount() {
    const field = document.getElementById('essay');
    const display = document.getElementById('wordCount');
    if (!field || !display) return;
    const taskId = field.dataset.writingKey;
    const minWords = taskId === 'w1' ? 150 : 250;
    const words = countWords(field.value);
    display.textContent = `${words} words · minimum ${minWords}`;
    display.classList.toggle('is-short', words < minWords);
  }

  function selectWritingTask(taskId) {
    if (!current().tasks || !current().tasks.some(task => task.id === taskId)) return;
    const field = document.getElementById('essay');
    if (field) { answers[field.dataset.writingKey] = field.value; saveDraft(); }
    activeWriteTask = taskId;
    document.getElementById('srcPane').innerHTML = renderWritingPrompt(current());
    document.getElementById('qPane').innerHTML = renderWritingEditor(current());
    refreshWordCount();
  }

  function renderQuestionNav(section) {
    const nav = document.getElementById('qNav');
    if (!nav) return;
    const answeredCount = section.questions.reduce((sum, _question, index) => {
      const value = answers[`${currentSection}-${index}`];
      return sum + (value !== undefined && String(value).trim() !== '' ? 1 : 0);
    }, 0);
    nav.innerHTML = `<span class="lp-nav-title">Questions</span>${section.questions.map((_q, index) => {
      const value = answers[`${currentSection}-${index}`];
      const answered = value !== undefined && String(value).trim() !== '';
      return `<button class="lp-qchip ${answered ? 'is-answered' : ''}" type="button" data-action="jump-question" data-question="${index}" aria-label="Jump to question ${index + 1}">${index + 1}</button>`;
    }).join('')}<span class="lp-muted" style="margin-left:auto">${answeredCount}/${section.questions.length} answered</span>`;
  }

  function startTimerPause() {
    pausedTimer = !pausedTimer;
    const button = root.querySelector('[data-action="toggle-pause"]');
    if (button) button.textContent = pausedTimer ? 'Resume timer' : 'Pause timer';
    showToast(pausedTimer ? 'Practice timer paused.' : 'Practice timer resumed.');
  }

  function pickAnswer(key, choice) {
    answers[key] = Number(choice);
    saveDraft();
    const section = current();
    const questionIndex = Number(key.split('-').pop());
    const question = section.questions[questionIndex];
    const card = document.getElementById(`q-${key}`);
    if (card && question) {
      card.querySelectorAll('[data-action="pick-answer"]').forEach(button => {
        const selected = Number(button.dataset.choice) === Number(choice);
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
    }
    renderQuestionNav(section);
  }

  function attachHighlight() {
    const passage = document.getElementById('passage');
    if (!passage) return;
    passage.addEventListener('mouseup', () => {
      if (!highlighterOn) return;
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.toString().trim().length < 2) return;
      try {
        const range = selection.getRangeAt(0);
        if (!passage.contains(range.commonAncestorContainer)) return;
        const mark = document.createElement('mark');
        mark.className = 'lp-highlighted';
        range.surroundContents(mark);
        selection.removeAllRanges();
      } catch (_) { showToast('Highlight a single text run at a time.'); }
    });
  }

  function clearHighlights() {
    document.querySelectorAll('#passage mark.lp-highlighted').forEach(mark => mark.replaceWith(document.createTextNode(mark.textContent)));
  }

  function playListening() {
    const section = current();
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      showToast('This browser does not support read-aloud.'); return;
    }
    if (audioPlaying) { showToast('Read-aloud is already playing.'); return; }
    const maxReplays = mode === 'exam' ? 1 : 3;
    if (audioReplays >= maxReplays) { showToast('No read-aloud replays remain for this session.'); return; }
    audioReplays += 1;
    const replayCounter = document.getElementById('repN');
    if (replayCounter) replayCounter.textContent = String(audioReplays);
    const transcript = document.getElementById('transcript');
    if (mode === 'practice' && transcript && transcript.style.display === 'block') {
      // Transcript remains visible in practice mode by user choice.
    }
    const live = document.getElementById('liveChunks');
    if (live) live.innerHTML = section.chunks.map((chunk, index) => `<p data-ch="${index}">${esc(chunk)}</p>`).join('');
    let chunkIndex = 0;
    audioPlaying = true;
    audioPaused = false;
    const step = () => {
      if (!audioPlaying || chunkIndex >= section.chunks.length) {
        audioPlaying = false;
        if (live) live.querySelectorAll('[data-ch]').forEach(p => p.classList.remove('lp-current-chunk'));
        return;
      }
      if (live) live.querySelectorAll('[data-ch]').forEach(p => p.classList.toggle('lp-current-chunk', Number(p.dataset.ch) === chunkIndex));
      const utterance = new SpeechSynthesisUtterance(section.chunks[chunkIndex]);
      utterance.lang = 'en-US';
      utterance.rate = 0.92;
      utterance.onend = () => { chunkIndex += 1; step(); };
      utterance.onerror = () => { audioPlaying = false; showToast('Browser read-aloud stopped.'); };
      window.speechSynthesis.speak(utterance);
    };
    step();
  }

  function pauseListening() {
    if (!audioPlaying || !window.speechSynthesis) return;
    if (audioPaused) { window.speechSynthesis.resume(); audioPaused = false; }
    else { window.speechSynthesis.pause(); audioPaused = true; }
    const button = document.getElementById('pauseAudioBtn');
    if (button) button.textContent = audioPaused ? '▶ Resume' : 'Ⅱ Pause';
  }

  function stopListening() {
    audioPlaying = false;
    audioPaused = false;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const button = document.getElementById('pauseAudioBtn');
    if (button) button.textContent = 'Ⅱ Pause';
    const live = document.getElementById('liveChunks');
    if (live) live.querySelectorAll('[data-ch]').forEach(p => p.classList.remove('lp-current-chunk'));
  }

  function toggleTranscript() {
    const transcript = document.getElementById('transcript');
    if (!transcript) return;
    transcript.style.display = transcript.style.display === 'block' ? 'none' : 'block';
  }

  function renderSpeakingPart() {
    clearInterval(speakingClock);
    speakingClock = null;
    speakingClockEnd = null;
    stopListening();
    document.getElementById('srcPane').innerHTML = renderSpeakingPrompt(current());
    document.getElementById('qPane').innerHTML = renderSpeakingRecorder(current());
    refreshMicState();
  }

  function readSpeakingPrompts() {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) { showToast('Read-aloud is not supported in this browser.'); return; }
    const part = currentPart();
    const text = [part.cue || '', ...(part.questions || [])].filter(Boolean).join('. ');
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  function startSpeakingPrep() {
    const part = currentPart();
    if (!part || !part.prepSec) { showToast('This part does not have a separate preparation timer.'); return; }
    if (recording || speakingClock) { showToast('A preparation or recording timer is already running.'); return; }
    speakingClockRemaining = part.prepSec;
    const prepButton = root.querySelector('[data-action="start-speaking-prep"]');
    if (prepButton) prepButton.disabled = true;
    updateSpeakingClock('Preparation time');
    const recordButton = document.getElementById('recordBtn');
    if (recordButton) recordButton.disabled = true;
    speakingClock = setInterval(() => {
      speakingClockRemaining = Math.max(0, speakingClockRemaining - 1);
      updateSpeakingClock('Preparation time');
      if (speakingClockRemaining <= 0) {
        clearInterval(speakingClock); speakingClock = null;
        const label = document.getElementById('speakingClockLabel');
        if (label) label.textContent = 'Prep complete · click Record answer when ready';
        refreshMicState();
        showToast('Preparation finished. Start recording when ready.');
      }
    }, 1000);
  }

  function updateSpeakingClock(labelText) {
    const clock = document.getElementById('speakingClock');
    const label = document.getElementById('speakingClockLabel');
    if (clock) clock.textContent = formatTime(speakingClockRemaining);
    if (label) label.textContent = labelText;
  }

  async function startSpeakingRecording() {
    if (recording) { showToast('A recording is already running.'); return; }
    if (speakingClock !== null) { showToast('Finish the preparation timer before recording.'); return; }
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function' || typeof window.MediaRecorder === 'undefined') {
      showToast('Microphone recording needs a supported browser on HTTPS or localhost.');
      return;
    }
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      const mimeCandidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
      const mimeType = mimeCandidates.find(type => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type));
      mediaRecorder = mimeType ? new MediaRecorder(mediaStream, { mimeType }) : new MediaRecorder(mediaStream);
      mediaChunks = [];
      mediaRecorder.ondataavailable = event => { if (event.data && event.data.size) mediaChunks.push(event.data); };
      mediaRecorder.onerror = () => { showToast('Recording failed. Check your browser microphone settings.'); refreshMicState(); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(mediaChunks, { type: mediaRecorder && mediaRecorder.mimeType || 'audio/webm' });
        stopTracks();
        recording = false;
        if (blob.size) {
          const previous = recordings[activeSpeakingPart];
          if (previous && previous.url) URL.revokeObjectURL(previous.url);
          const url = URL.createObjectURL(blob);
          recordings[activeSpeakingPart] = { blob, url, type: blob.type, size: blob.size };
          const qPane = document.getElementById('qPane');
          if (qPane) qPane.innerHTML = renderSpeakingRecorder(current());
          showToast('Recording ready. Play it back or download it before finishing.');
        } else {
          refreshMicState();
          showToast('No audio data was captured. Please check microphone permission.');
        }
        if (pendingSubmit !== null) {
          const auto = pendingSubmit;
          pendingSubmit = null;
          setTimeout(() => submitSection(auto), 0);
        }
      };
      mediaRecorder.start(1000);
      recording = true;
      refreshMicState();
      const part = currentPart();
      clearInterval(speakingClock);
      speakingClockRemaining = part.answerSec || 120;
      updateSpeakingClock('Recording · time remaining');
      speakingClock = setInterval(() => {
        speakingClockRemaining = Math.max(0, speakingClockRemaining - 1);
        updateSpeakingClock('Recording · time remaining');
        if (speakingClockRemaining <= 0) stopSpeakingRecording();
      }, 1000);
    } catch (error) {
      stopTracks();
      refreshMicState();
      const message = error && error.name === 'NotAllowedError' ? 'Microphone permission was denied. Allow the microphone in browser settings.' : 'Could not start the microphone. Use HTTPS or localhost and check device access.';
      showToast(message);
    }
  }

  function stopSpeakingRecording() {
    clearInterval(speakingClock);
    speakingClock = null;
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      try { mediaRecorder.stop(); } catch (_) { recording = false; stopTracks(); refreshMicState(); }
    } else {
      recording = false;
      stopTracks();
      refreshMicState();
    }
  }

  function stopTracks() {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => { try { track.stop(); } catch (_) {} });
      mediaStream = null;
    }
  }

  function refreshMicState() {
    const status = document.getElementById('micStatus');
    const text = document.getElementById('micStatusText');
    const recordButton = document.getElementById('recordBtn');
    const stopButton = document.getElementById('stopRecordBtn');
    if (status) status.classList.toggle('is-recording', recording);
    if (text) text.textContent = recording ? 'Recording · microphone active' : (recordings[activeSpeakingPart] ? 'Recording captured in this page' : 'Microphone not started');
    if (recordButton) recordButton.disabled = recording || speakingClock !== null;
    if (stopButton) stopButton.disabled = !recording;
  }

  function submitSection(auto) {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      pendingSubmit = auto;
      stopSpeakingRecording();
      return;
    }
    clearInterval(sectionTimer);
    clearInterval(speakingClock);
    stopListening();
    const section = current();
    let score = null;
    let band = null;
    let total = 0;
    const detail = [];

    if (section.type === 'reading' || section.type === 'listening') {
      let correct = 0;
      total = section.questions.length;
      section.questions.forEach((question, index) => {
        const answer = answers[`${currentSection}-${index}`];
        let isCorrect = false;
        if (question.t === 'fib') {
          const normalize = value => String(value || '').toLowerCase().replace(/[.,!?]/g, '').trim();
          isCorrect = (question.accept || []).some(value => normalize(value) === normalize(answer));
        } else {
          isCorrect = Number(answer) === Number(question.a);
        }
        if (isCorrect) correct += 1;
        const options = optionsFor(question);
        detail.push({
          q: question.q,
          user: question.t === 'fib' ? (answer || '— skipped —') : (answer !== undefined ? options[Number(answer)] : '— skipped —'),
          correct: question.t === 'fib' ? ((question.accept || [])[0] || '') : (options[Number(question.a)] || ''),
          ok: isCorrect,
          why: question.why || ''
        });
      });
      score = correct;
      band = FE.bandFromRaw(correct, Math.max(1, total));
      objectiveResults.push({ skill: section.type, band });
    } else if (section.type === 'writing') {
      const tasks = section.tasks || [{ id: 'w2', label: 'Task 2', prompt: section.prompt }];
      tasks.forEach(task => {
        const words = countWords(answers[task.id] || '');
        const minimum = task.id === 'w1' ? 150 : 250;
        detail.push({ task: task.label || task.id, words, minimum, meetsMinimum: words >= minimum });
      });
    } else if (section.type === 'speaking') {
      const captured = Object.keys(recordings).filter(key => recordings[key] && recordings[key].size > 0).length;
      detail.push({ task: 'Recorded parts', value: `${captured} of ${(section.parts || []).length}` });
      (section.parts || []).forEach((part, index) => {
        const reflection = answers[`speaking-reflection-${index}`];
        if (reflection && reflection.trim()) detail.push({ task: `${part.label} self-review`, value: reflection.trim() });
      });
    }

    sectionResults.push({ name: section.title, type: section.type, score, total, band, detail });
    if (window.FE && typeof FE.setProgress === 'function') FE.setProgress(testId, Math.round(((currentSection + 1) / sections.length) * 100));
    if (currentSection + 1 < sections.length) {
      showToast(auto ? 'Time finished. Moving to the next section.' : 'Section submitted. Opening the next section.');
      setTimeout(() => loadSection(currentSection + 1), 450);
    } else {
      finishTest();
    }
  }

  function finishTest() {
    clearInterval(sectionTimer);
    clearInterval(speakingClock);
    stopListening();
    if (window.FE && typeof FE.setProgress === 'function') FE.setProgress(testId, 100);
    const scored = sectionResults.filter(result => Number.isFinite(result.band));
    const practiceAverage = scored.length ? Math.round(scored.reduce((sum, result) => sum + result.band, 0) / scored.length * 2) / 2 : null;
    if (scored.length && window.FE && typeof FE.addResult === 'function') {
      FE.addResult({ test: testId, name: test.name, band: practiceAverage, detail: scored.map(result => `${result.type}: ${result.band}`).join(' · ') + ' · Objective sample estimate only' });
    }
    const summaries = sectionResults.map(result => {
      if (result.type === 'reading' || result.type === 'listening') {
        return `<div class="lp-result-card"><h3>${esc(result.name)}</h3><div class="lp-result-row"><span>Correct answers</span><b>${result.score}/${result.total}</b></div><div class="lp-result-row"><span>Raw-answer practice estimate</span><span class="lp-result-badge">Band ${result.band}</span></div><p>This is a small original sample set, not a full IELTS test or official score prediction.</p></div>`;
      }
      if (result.type === 'writing') {
        return `<div class="lp-result-card"><h3>${esc(result.name)}</h3>${result.detail.map(item => `<div class="lp-result-row"><span>${esc(item.task)} word count</span><b>${item.words} / ${item.minimum} minimum ${item.meetsMinimum ? '✓' : '· below target'}</b></div>`).join('')}<p>No writing band is generated because a validated AI scoring service is not connected. Review the task response, structure, grammar and vocabulary yourself or connect a rubric-based writing service.</p></div>`;
      }
      const partRecords = result.detail.find(item => item.task === 'Recorded parts');
      const partAudio = Object.entries(recordings).map(([partIndex, record]) => `<div class="lp-result-card"><h3>Speaking Part ${Number(partIndex) + 1} recording</h3><audio class="lp-audio-preview" controls src="${record.url}"></audio><a class="lp-download-audio" href="${record.url}" download="foreign-express-speaking-part-${Number(partIndex) + 1}.${recordingExtension(record)}">Download audio ↗</a></div>`).join('');
      const reflections = result.detail.filter(item => item.task !== 'Recorded parts').map(item => `<div class="lp-result-row"><span>${esc(item.task)}</span><b>${esc(item.value)}</b></div>`).join('');
      return `<div class="lp-result-card"><h3>${esc(result.name)}</h3><div class="lp-result-row"><span>Recordings captured</span><b>${esc(partRecords ? partRecords.value : '0')}</b></div>${reflections}<p>No speaking band or transcript is produced: there is no speech-to-text or AI evaluator connected in this static build.</p></div>${partAudio}`;
    }).join('');
    const scoreBlock = practiceAverage === null ? '<div class="lp-result-note"><b>No automatic band score generated.</b> Writing and Speaking require a real scoring service; this build does not manufacture an AI score.</div>' : `<div class="lp-result-note"><b>Objective sample practice estimate: Band ${practiceAverage}.</b> This averages the bundled Reading/Listening demo samples only. It is not an official score or a reliable full-test predictor.</div>`;
    root.innerHTML = `<section class="lp-complete"><p class="lp-eyebrow">SESSION COMPLETE · ACADEMIC PRACTICE</p><h1>Your work is saved<br><span>for this browser session.</span></h1><p class="lp-intro-copy">Review your answers, task word counts and any speaking recordings below.</p>${scoreBlock}${summaries}<div class="lp-intro-actions"><a href="ielts.html#library" class="rv-btn rv-btn-dark">Return to Academic test library ↗</a><a href="tests.html" class="rv-link-arrow">View practice sets →</a><button type="button" class="lp-control-btn" data-action="clear-draft">Clear local text draft</button></div><div class="lp-disclaimer">Answers and drafts are stored locally in your browser. Guest results are not a secure account record. Speaking recordings are kept in this page's memory and can be downloaded above; they are not uploaded or persisted after the page is closed.</div></section>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'begin-test') loadSection(0);
    else if (action === 'submit-section') {
      if (window.confirm('Submit this section? You will move to the next section or the review screen.')) submitSection(false);
    } else if (action === 'toggle-pause') startTimerPause();
    else if (action === 'pick-answer') pickAnswer(button.dataset.key, button.dataset.choice);
    else if (action === 'jump-question') {
      const target = document.getElementById(`q-${currentSection}-${button.dataset.question}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (action === 'toggle-highlighter') {
      highlighterOn = !highlighterOn;
      button.textContent = `Highlight: ${highlighterOn ? 'on' : 'off'}`;
      button.classList.toggle('is-active', highlighterOn);
      button.setAttribute('aria-pressed', String(highlighterOn));
    } else if (action === 'clear-highlights') clearHighlights();
    else if (action === 'toggle-hint') {
      const hint = button.nextElementSibling;
      if (hint) { hint.hidden = !hint.hidden; button.setAttribute('aria-expanded', String(!hint.hidden)); button.textContent = hint.hidden ? 'Show practice hint' : 'Hide practice hint'; }
    } else if (action === 'play-audio') playListening();
    else if (action === 'pause-audio') pauseListening();
    else if (action === 'stop-audio') stopListening();
    else if (action === 'toggle-transcript') toggleTranscript();
    else if (action === 'select-writing-task') selectWritingTask(button.dataset.task);
    else if (action === 'select-speaking-part') {
      if (recording || speakingClock) { showToast('Stop the recording or timer before switching parts.'); return; }
      const index = Number(button.dataset.part);
      if (!Number.isInteger(index) || index < 0 || index >= current().parts.length) return;
      activeSpeakingPart = index;
      renderSpeakingPart();
    } else if (action === 'read-speaking-prompts') readSpeakingPrompts();
    else if (action === 'start-speaking-prep') startSpeakingPrep();
    else if (action === 'start-speaking-recording') startSpeakingRecording();
    else if (action === 'stop-speaking-recording') stopSpeakingRecording();
    else if (action === 'clear-draft') {
      if (window.confirm('Clear locally saved written answers and self-review notes for this test?')) {
        Object.keys(answers).forEach(key => delete answers[key]);
        try { localStorage.removeItem(keyForDraft); } catch (_) {}
        showToast('Local text draft cleared. Refresh the test page to restart.');
      }
    }
  });

  root.addEventListener('input', event => {
    const field = event.target;
    if (field.matches('[data-answer-key]')) {
      answers[field.dataset.answerKey] = field.value;
      saveDraft();
      renderQuestionNav(current());
    } else if (field.matches('[data-writing-key]')) {
      answers[field.dataset.writingKey] = field.value;
      saveDraft();
      refreshWordCount();
    } else if (field.matches('[data-reflection-key]')) {
      answers[field.dataset.reflectionKey] = field.value;
      saveDraft();
    }
  });

  window.addEventListener('beforeunload', () => {
    clearInterval(sectionTimer);
    clearInterval(speakingClock);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (mediaRecorder && mediaRecorder.state === 'recording') { try { mediaRecorder.stop(); } catch (_) {} }
    stopTracks();
    Object.values(recordings).forEach(record => { if (record.url) URL.revokeObjectURL(record.url); });
  });

  intro();
}());
