'use strict';

const PROGRESS_KEY = 'csslpprep_progress_v1';
const PRACTICE_MODES = new Set(['practice', 'domain', 'diagnostic', 'mixed', 'mock']);

function progressObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function progressArray(value) {
  return Array.isArray(value) ? value : [];
}

function progressIndex(value, count) {
  return Number.isInteger(value) && value >= 0 && value < count;
}

function progressNumber(value) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function progressFlags(value, keys) {
  const record = progressObject(value);
  return Object.fromEntries(keys.filter(key => record[key] === true).map(key => [key, true]));
}

function progressKeys(counts) {
  return counts.flatMap((count, group) =>
    Array.from({length: count}, (_, item) => group + '-' + item));
}

function summarizePretest(bank, ids, answers) {
  const topics = Array.from({length: 8}, () => ({right: 0, total: 0, wrong: []}));
  let correct = 0;
  ids.forEach((id, index) => {
    const question = bank[id];
    const topic = topics[question.topic];
    const choice = answers[index];
    topic.total++;
    if (choice === question.answer) {
      correct++;
      topic.right++;
    } else {
      topic.wrong.push({id, choice});
    }
  });
  return {correct, total: ids.length, topics};
}

function normalizeCourseProgress(value, schema) {
  const saved = progressObject(value);
  const domains = schema.lessonCounts.map((_, i) => i);
  const labs = Array.from({length: schema.labCount}, (_, i) => i);
  const advancedKeys = progressKeys(schema.advancedCounts);
  const responseKeys = advancedKeys.map(key => 'deep-' + key)
    .concat(labs.map(i => 'lab-' + i + '-0'));
  const state = {
    plan: [14, 28, 42].includes(saved.plan) ? saved.plan : 28,
    done: progressFlags(saved.done, domains),
    lessonDone: progressFlags(saved.lessonDone, progressKeys(schema.lessonCounts)),
    advancedDone: progressFlags(saved.advancedDone, advancedKeys),
    labDone: progressFlags(saved.labDone, labs),
    blockTasks: progressFlags(saved.blockTasks, progressKeys(schema.blockCounts)),
    history: progressArray(saved.history)
      .filter(record => record && progressIndex(record.id, schema.questions.length) &&
        typeof record.correct === 'boolean')
      .map(({id, correct, when, mode}) => ({
        id, correct, when: progressNumber(when), mode: PRACTICE_MODES.has(mode) ? mode : 'practice'
      })),
    wrong: [...new Set(progressArray(saved.wrong).filter(id => progressIndex(id, schema.questions.length)))],
    sessions: progressArray(saved.sessions)
      .filter(session => session && Number.isSafeInteger(session.total) && session.total > 0 &&
        progressIndex(session.correct, session.total + 1) && PRACTICE_MODES.has(session.mode))
      .map(({when, mode, correct, total, elapsed}) => ({
        when: progressNumber(when), mode, correct, total, elapsed: progressNumber(elapsed)
      })),
    flash: {},
    pretests: {},
    writtenResponses: {},
  };

  for (let i = 0; i < schema.flashCount; i++) {
    const flash = progressObject(saved.flash)[i];
    if (flash && Number.isFinite(flash.next) && Number.isFinite(flash.interval) &&
        Number.isFinite(flash.ease)) {
      state.flash[i] = {
        next: progressNumber(flash.next),
        interval: progressNumber(flash.interval),
        ease: Math.max(1.3, flash.ease),
      };
    }
  }

  for (const domain of domains) {
    const record = progressObject(saved.pretests)[domain];
    if (!record) continue;
    const ids = progressArray(record.ids);
    const answers = progressArray(record.answers);
    if (!ids.length || ids.length > 25 || new Set(ids).size !== ids.length ||
        ids.length !== answers.length ||
        !ids.every(id => progressIndex(id, schema.bank.length) && schema.bank[id].domain === domain) ||
        !answers.every((answer, i) => progressIndex(answer, schema.bank[ids[i]].choices.length))) {
      continue;
    }
    state.pretests[domain] = {
      ...summarizePretest(schema.bank, ids, answers),
      ids: ids.slice(),
      answers: answers.slice(),
      when: progressNumber(record.when),
      elapsed: progressNumber(record.elapsed),
    };
  }

  for (const key of responseKeys) {
    const record = progressObject(saved.writtenResponses)[key];
    if (record && typeof record.answer === 'string') {
      state.writtenResponses[key] = {answer: record.answer, submitted: record.submitted === true};
    }
  }
  return state;
}

function setProgressNotice(message) {
  const notice = document.getElementById('progressNotice');
  notice.textContent = message;
  notice.hidden = !message;
}

function loadCourseProgress(schema) {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return normalizeCourseProgress(raw === null ? {} : JSON.parse(raw), schema);
  } catch {
    setProgressNotice('Saved progress could not be loaded. Check that browser storage is available before starting an activity.');
    return normalizeCourseProgress({}, schema);
  }
}

function saveCourseProgress(state) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
    setProgressNotice('');
  } catch {
    setProgressNotice('Progress could not be saved in this browser. Keep this tab open to retain your work for this session.');
  }
}
