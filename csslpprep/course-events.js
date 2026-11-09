'use strict';

const courseActions = new Map(Object.entries({
  checkAnswer,
  checkTopicAnswer,
  choose,
  choosePretest,
  flipFlash,
  markDone,
  markStudyUnit,
  moveMock,
  navTo,
  nextPretest,
  nextQuestion,
  nextTopicQuestion,
  openChapter,
  openDeep,
  openLab,
  openMockQuestion,
  openStudyUnit,
  pickTopicAnswer,
  previousPretest,
  quizFinish,
  rateFlash,
  reviewMock,
  reviewPretestAnswers,
  reviseWritten,
  setFlashMode,
  showPretestResults,
  startPretest,
  startQuiz,
  startTopicPractice,
  submitWritten,
  toggleAdvanced,
  toggleCourseMenu,
  toggleLab,
}));

function actionArguments(control) {
  try {
    const args = JSON.parse(control.dataset.args ?? '[]');
    return Array.isArray(args) ? args : null;
  } catch {
    return null;
  }
}

document.addEventListener('click', event => {
  const control = event.target.closest('button[data-action]');
  if (!control || control.disabled) return;
  const action = courseActions.get(control.dataset.action);
  const args = actionArguments(control);
  if (action && args) action(...args);
});

document.addEventListener('change', event => {
  const control = event.target;
  if (control.dataset.action === 'changeStudyPlan') {
    changeStudyPlan(control.value);
  } else if (control.dataset.action === 'toggleBlockTask') {
    const args = actionArguments(control);
    if (args) toggleBlockTask(...args);
  }
});

render();
