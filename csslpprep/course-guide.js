'use strict';
// Navigation is presentation only: retain all existing routes and progress keys.
const COURSE_NAV = [
  ['Start here', [
    ['home', 'Learning journey', 'Find your next step, whether you are new or returning.'],
    ['guide', 'How to use the course', 'Understand the learning materials, suggested order and saved progress.'],
    ['plan', 'Study plan', 'Choose a schedule and work through saved study checklists.'],
    ['domains', 'Explore 8 domains', 'See the security topics and open lessons for a domain.']]],
  ['1 · Learn', [
    ['textbook', 'Foundations Textbook', 'Start here for plain-language concepts and real-world examples.'],
    ['curriculum', 'Course Lessons', 'Build on the textbook with guided decisions and concept practice.'],
    ['deep', 'Deep-Dive Academy', 'Extend the lessons with advanced distinctions and written exercises.']]],
  ['2 · Apply and reinforce', [
    ['labs', 'Practical labs', 'Apply a domain to a written case study and compare with a model answer.'],
    ['quiz', 'Practice questions', 'Choose diagnostic, domain, mixed or timed question practice.'],
    ['flash', 'Flashcards', 'Recall key ideas and schedule difficult cards for another review.']]],
  ['3 · Check and revisit', [
    ['pretests', 'Domain pretests', 'Optional 8-question diagnostics identify which lessons to prioritize.'],
    ['review', 'Weak areas', 'Revisit missed practice questions and compare results by domain.'],
    ['readiness', 'Readiness dashboard', 'Review completion and practice evidence to plan further study.'],
    ['exam', 'Exam strategy', 'Review exam-day reasoning and connect to the official exam outline.']]]
];
function courseNavPage(){
  return ({chapter:'textbook', lesson:'curriculum', studyUnit:'curriculum', deepModule:'deep', lab:'labs', block:'plan', pretest:'pretests', pretestResults:'pretests', pretestReview:'pretests', topicPractice:'curriculum', mockReview:'quiz'})[page] || page;
}
function renderNav(){
  const nav=document.getElementById('nav'), active=courseNavPage();
  if(!nav.children.length){
    nav.innerHTML=COURSE_NAV.map((group,g)=>'<section class="nav-group" aria-labelledby="navGroup'+g+'"><h2 id="navGroup'+g+'">'+group[0]+'</h2>'+group[1].map(x=>'<button type="button" data-page="'+x[0]+'" aria-describedby="help-'+x[0]+'" title="'+esc(x[2])+'" '+actionAttrs('navTo', [x[0]])+'><span>'+x[1]+'</span><span class="nav-description" id="help-'+x[0]+'">'+x[2]+'</span></button>').join('')+'</section>').join('');
    nav.addEventListener('mouseover',showNavHelp);
    nav.addEventListener('focusin',showNavHelp);
    nav.addEventListener('mouseleave',resetNavHelp);
    nav.addEventListener('focusout',event=>{if(!nav.contains(event.relatedTarget))resetNavHelp()});
  }
  nav.querySelectorAll('[data-page]').forEach(el=>{
    const current=el.dataset.page===active;
    el.classList.toggle('active',current);
    if(current)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
  });
  const item=COURSE_NAV.flatMap(g=>g[1]).find(x=>x[0]===active);
  document.getElementById('currentPage').textContent=item?'· '+item[1]:'';
  resetNavHelp();
}
function showNavHelp(event){const el=event.target.closest('[data-page]');if(el)document.getElementById('navHelp').textContent=el.querySelector('.nav-description').textContent}
function resetNavHelp(){const el=document.querySelector('#nav [aria-current] .nav-description');document.getElementById('navHelp').textContent=el?el.textContent:'Choose a course activity.'}
function toggleCourseMenu(){const el=document.getElementById('courseMenu'),open=el.classList.toggle('menu-open');document.getElementById('menuToggle').setAttribute('aria-expanded',String(open))}
function closeCourseMenu(){document.getElementById('courseMenu').classList.remove('menu-open');document.getElementById('menuToggle').setAttribute('aria-expanded','false')}
function finishCourseNavigation(){closeCourseMenu();window.scrollTo(0,0);focusCourseHeading()}
function focusCourseHeading(){const h=document.querySelector('#app h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true})}}
document.getElementById('courseMenu').addEventListener('keydown',event=>{if(event.key==='Escape'){closeCourseMenu();document.getElementById('menuToggle').focus()}});
function learningJourney(){
  return '<section class="section" aria-labelledby="journeyTitle"><h2 id="journeyTitle">One domain, four connected steps</h2><p>The same eight domains connect all three teaching layers. They complement each other; you do not need to finish every textbook chapter before opening a lesson.</p><ol class="journey-grid">'+[
    ['Read the foundations','Foundations Textbook','Learn what a concept means, why it matters and how it works.','textbook'],
    ['Study the decisions','Course Lessons','Use guided examples, reasoning steps and focused questions to apply the concepts.','curriculum'],
    ['Deepen your reasoning','Deep-Dive Academy','Explore nuanced distinctions and write recommendations before seeing model answers.','deep'],
    ['Apply, check and revisit','Labs and practice','Complete a case study, answer questions, then revisit gaps using your results.','labs']
  ].map((s,i)=>'<li class="card"><span class="eyebrow">Step '+(i+1)+'</span><h3>'+s[0]+'</h3><strong>'+s[1]+'</strong><p>'+s[2]+'</p>'+button('Open '+s[1], 'navTo', [s[3]], true)+'</li>').join('')+'</ol></section>';
}
function courseGuide(){
  layout('<span class="eyebrow">Start here · Keep this guide handy</span><h1>How to use the course</h1><p>Begin with Domain 1 and repeat the learning loop for each domain. If you have relevant experience, use an optional pretest first to prioritize your study.</p>'+learningJourney()+'<section class="card section"><h2>Choose a starting point</h2><div class="actions">'+button('New to the material: read Chapter 1', 'openChapter', [0])+button('Experienced: choose a pretest', 'navTo', ['pretests'], true)+button('Returning: view my readiness', 'navTo', ['readiness'], true)+'</div><p>For each domain: Foundations → Course Lessons → Deep-Dive Academy → practical lab → practice and review. Use Flashcards between sessions. After covering all domains, try mixed and timed practice and review your reasoning.</p></section><section class="section guide-faq" aria-labelledby="faqTitle"><h2 id="faqTitle">Frequently asked questions</h2>'+[
    ['Are the textbook, lessons and academy separate courses?','No. They cover the same eight domains at different levels. Foundations supplies background; Course Lessons guides you through decisions; Deep-Dive Academy adds distinctions and written reasoning. Follow a domain across these layers, then apply it in its lab.'],
    ['Do I have to take a pretest before reading?','No. Domain pretests are optional diagnostics. Each has eight questions and shows answers after submission. Results prioritize guided lessons by concept. If the terminology is unfamiliar, read the foundations first.'],
    ['How do I complete a written exercise?','Read the assignment, write your recommendation, then select Submit and see model answer. Compare the security objective, risk, controls and reasoning with the model. These exercises are self-assessed. You can revise a submitted answer and mark the module or lab complete separately.'],
    ['What is saved, and where?','Lesson and module completion, lab completion, submitted written responses, study checklists, pretest results, practice records and flashcard schedules are stored locally in this browser. Submit written answers before leaving; unsubmitted drafts are not saved. Progress does not sync to another browser or device. Clearing site data or using a private session can remove it.'],
    ['Does reading a chapter mark it complete?','Textbook reading is not automatically tracked. Use Mark lesson complete, Mark module complete or Mark lab complete where offered. Domain reviewed and study-plan checklists are separate manual records. Readiness summarizes these different kinds of evidence.'],
    ['What is the difference between pretests and practice?','Pretests diagnose one domain and withhold explanations until the end. Practice questions offer diagnostic, domain, mixed and timed sessions. Timed practice withholds feedback until the attempt ends. Focused practice inside lessons targets one concept. Weak areas tracks missed practice questions; use pretest results for pretest-specific study priorities. Finish a question session before switching activities; in-progress sessions are not saved.'],
    ['How should I use the readiness dashboard?','Review completed learning activities and recent practice evidence, then return to gaps. A completion percentage or short practice score is not a prediction of passing. Use the official ISC2 outline to check current exam requirements.'],
    ['How do I find help on a phone or with a keyboard?','On a phone, open Course menu to see every activity with its description. On desktop, hover or focus a menu item for a short explanation. Use Tab to move, Enter to select, and Escape to close the mobile menu. These FAQ questions open with a tap, click or keyboard.']
  ].map(x=>'<details class="detail"><summary>'+x[0]+'</summary><p>'+x[1]+'</p></details>').join('')+'</section>');
}
function addCourseContext(){
  const app=document.getElementById('app');
  const intros={
    textbook:'Step 1 · Build understanding. Read a chapter, then open Course Lessons for the same domain to practice decisions.',
    curriculum:'Step 2 · Apply the foundations. These guided lessons add worked decisions and focused practice. Continue to Deep-Dive Academy for nuanced reasoning.',
    deep:'Step 3 · Deepen your reasoning. Build on Foundations and Course Lessons in the same domain, then apply what you learned in its practical lab.',
    labs:'Step 4 · Apply your learning. These written case studies bring together the textbook, lessons and advanced modules. Follow with practice and review.'
  };
  if(intros[page]){
    const note=document.createElement('div');note.className='focus section';
    note.innerHTML='<p>'+intros[page]+'</p>'+button('How these materials fit together', 'navTo', ['guide'], true);
    const h=app.querySelector('h1');if(h)h.insertAdjacentElement('afterend',note);
  }
  const d=({chapter:chapterDomain,lesson:domain,studyUnit:unitDomain,deepModule:advancedDomain,lab:labDomain})[page];
  if(typeof d==='number'){
    const context=document.createElement('section');context.className='domain-journey section';context.setAttribute('aria-label','Continue in this domain');
    context.innerHTML='<h2>Continue in Domain '+(d+1)+'</h2><p class="small">'+esc(DOMAINS[d].name)+' · Follow the same topic across the course.</p><div class="actions">'+button('1 · Foundations', 'openChapter', [d], true)+button('2 · Course Lessons', 'navTo', ['lesson', d], true)+button('3 · Deep-Dive Academy', 'openDeep', [d, 0], true)+button('4 · Practical lab', 'openLab', [d], true)+button('Practice this domain', 'startQuiz', ['domain', d], true)+'</div>';
    app.appendChild(context);
  }
}
