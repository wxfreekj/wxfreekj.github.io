'use strict';
const OUTLINE='https://www.isc2.org/certifications/csslp/csslp-certification-exam-outline';
const DOMAINS=[
{name:'Secure Software Concepts',weight:12,focus:'CIA, identity, least privilege, separation of duties, defense in depth',lesson:[['Security outcomes vs. controls','Confidentiality, integrity, availability, accountability and nonrepudiation describe outcomes. Encryption, access controls, logging and signatures are ways to achieve them.'],['Principles over products','Choose least privilege, fail secure, complete mediation and defense in depth before choosing a tool.'],['Manager lens','When answers are all technically plausible, prefer the one that addresses root risk and organizational requirements.']]},
{name:'Secure Software Lifecycle Management',weight:11,focus:'Governance, security gates, risk acceptance, metrics, end-of-life',lesson:[['Security across delivery','Build security acceptance criteria into planning, development, release and retirement—not just a final penetration test.'],['Accountability','Product and business risk owners accept residual risk; engineering teams identify and treat it.'],['Useful metrics','Track meaningful outcomes such as time to remediate high-risk issues and coverage of security requirements.']]},
{name:'Secure Software Requirements',weight:13,focus:'Abuse cases, privacy, classification, traceability, compliance',lesson:[['Make requirements testable','Replace vague goals like “secure login” with measurable requirements for authentication, session expiration and logging.'],['Threat-driven requirements','Derive misuse and abuse cases from assets, actors and trust boundaries.'],['Traceability','Connect each requirement to a design control, test and owner so gaps can be found before release.']]},
{name:'Secure Software Architecture and Design',weight:15,focus:'Threat modeling, trust boundaries, STRIDE, security patterns',lesson:[['Design before code','Identify assets, trust boundaries, data flows and threats before selecting mitigations.'],['STRIDE','Spoofing, Tampering, Repudiation, Information disclosure, Denial of service and Elevation of privilege help organize threats.'],['Review trade-offs','Prefer designs that reduce attack surface and enforce authorization centrally.']]},
{name:'Secure Software Implementation',weight:14,focus:'Secure coding, validation, sessions, cryptography, concurrency',lesson:[['Input vs. output','Validate input to expected forms and encode output for its destination context; neither substitutes for parameterized queries.'],['Secure defaults','Fail closed, minimize privileges, manage secrets outside source and avoid custom cryptography.'],['Code review','Look for trust-boundary violations, unsafe dependencies, authorization bypasses and poor error handling.']]},
{name:'Secure Software Testing',weight:14,focus:'SAST, DAST, IAST, fuzzing, abuse tests, test-data protection',lesson:[['Match test to failure','SAST examines code, DAST probes running applications, IAST instruments execution and fuzzing varies inputs.'],['Prove controls work','Test negative paths and abuse cases, not just intended workflows.'],['Prioritize findings','Use exploitability, exposure and business impact; severity scores alone do not decide remediation order.']]},
{name:'Secure Software Deployment, Operations, Maintenance',weight:11,focus:'CI/CD, secrets, change control, monitoring, response, recovery',lesson:[['Protect the pipeline','Secure build identities, sign artifacts, limit deployment permissions and verify provenance.'],['Operations are part of SDLC','Patch, monitor, respond to incidents and verify recovery procedures after deployment.'],['Risk sign-off','Obtain approval from authorized risk owners before accepting exceptions.']]},
{name:'Secure Software Supply Chain',weight:10,focus:'SBOM, provenance, supplier due diligence, signed artifacts',lesson:[['Know your components','Maintain an SBOM and track direct and transitive dependencies.'],['Verify provenance','Assess source, build environment, signing and artifact integrity before deployment.'],['Contracts matter','Set supplier notification, audit, remediation and support expectations before acquisition.']]}
];
const BASE_QUESTIONS=[
[0,'A team needs proof that a software release was approved by a specific signer and not altered. Which control BEST addresses both needs?',['Digital signature verified against a trusted certificate','Disk encryption on the build server','Network segmentation of the repository','Availability monitoring'],0,'A digital signature binds a signer identity to a hash of the artifact, supporting integrity, authenticity and nonrepudiation.'],
[0,'An API checks authorization only when a user first logs in. What principle is MOST directly violated?',['Complete mediation','Open design','Economy of mechanism','Redundancy'],0,'Complete mediation requires authorization on each access to a protected resource.'],
[0,'Two employees must independently approve a production secret export. Which principle is illustrated?',['Separation of duties','Security through obscurity','Least common mechanism','Availability'],0,'Splitting a sensitive operation across roles limits unilateral misuse.'],
[1,'A critical vulnerability is found shortly before release. What should the security lead do FIRST?',['Evaluate risk against release criteria and escalate to the authorized risk owner','Ship because the release date is committed','Disable the scanner','Let any developer accept the risk'],0,'Security gates and risk ownership govern the release decision; a developer cannot unilaterally accept business risk.'],
[1,'Which metric BEST indicates whether a remediation process is improving?',['Time to remediate high-risk findings, tracked over time','Total number of lines of code','Number of meetings about security','Number of security tools purchased'],0,'Outcome-oriented metrics connect the program to risk reduction.'],
[1,'An application is being retired. What is MOST important?',['Execute a documented retirement plan for data, accounts, secrets and dependencies','Delete the source repository immediately','Keep all accounts active indefinitely','Stop patching without notifying stakeholders'],0,'Secure decommissioning includes retention, disposal, access removal and dependency management.'],
[2,'A requirement says “the app must be secure.” What is the BEST improvement?',['Define measurable authentication, authorization and audit requirements with acceptance tests','Add more developers','Buy a web application firewall','Move the app to the cloud'],0,'Testable security requirements allow traceability through design and validation.'],
[2,'A team identifies a scenario in which an insider exports restricted records. What should they create NEXT?',['An abuse case with mitigating requirements and verification criteria','A performance benchmark only','A new UI color scheme','A final release note'],0,'Abuse cases translate adversarial behavior into controls and tests.'],
[2,'What artifact BEST connects a privacy requirement to implementation and verification?',['Requirements traceability matrix','Network topology diagram only','Sprint velocity chart','License inventory'],0,'Traceability shows where each requirement is designed, implemented and tested.'],
[3,'A new service crosses several trust boundaries. What should happen BEFORE choosing security products?',['Model data flows, assets and threats','Install every available scanner','Assume the cloud provider handles all threats','Remove audit logging'],0,'Threat modeling clarifies risks and drives proportionate architecture decisions.'],
[3,'A service trusts an unsigned client claim that the user is an administrator. Which STRIDE category BEST fits?',['Elevation of privilege','Denial of service','Repudiation','Availability'],0,'The claim enables access above the user’s authorized privileges.'],
[3,'Which design MOST directly reduces blast radius if a microservice is compromised?',['Separate identities and least-privilege service permissions','Use a shared administrator account','Store all secrets in source code','Disable network policies'],0,'Isolation and least privilege constrain lateral movement and privilege abuse.'],
[4,'A developer concatenates untrusted input into a SQL query. What is the BEST defense?',['Parameterized queries','HTML escaping alone','A longer password policy','Client-side input checks only'],0,'Parameterization separates SQL structure from untrusted values.'],
[4,'An application writes access tokens to logs for troubleshooting. What is the BEST response?',['Remove or redact secrets and restrict logging to necessary data','Encrypt only the web page','Make the logs public','Disable all audit events'],0,'Sensitive credentials must not be exposed through observability systems.'],
[4,'A service needs to store passwords. Which approach is BEST?',['Use an established adaptive password hashing algorithm with unique salts','Encrypt passwords with a hardcoded key','Store unsalted SHA-256 hashes','Base64-encode passwords'],0,'Password hashing uses specialized slow/adaptive algorithms and per-password salts.'],
[5,'Which test method MOST directly evaluates a running web app from the outside?',['DAST','SAST','Source-code peer review','SBOM inventory'],0,'Dynamic application security testing exercises the running system.'],
[5,'A team wants to see how a parser behaves with malformed inputs. Which technique BEST fits?',['Fuzz testing','Usability survey','Static architecture diagram','Version tagging'],0,'Fuzzing exercises unexpected, mutated or generated inputs to find robustness failures.'],
[5,'A tester uses real production customer records in a shared test environment. What should happen FIRST?',['Apply approved data minimization, masking or synthetic-data practices','Proceed if testing is urgent','Email a copy to the team','Turn off access controls'],0,'Test environments must protect sensitive data and comply with handling requirements.'],
[6,'A CI/CD system publishes a release artifact. Which practice BEST strengthens artifact integrity?',['Sign artifacts and verify signatures before deployment','Share one permanent admin token','Skip reproducible builds and audit logs','Store credentials in pipeline YAML'],0,'Provenance and signature verification help ensure only authorized artifacts are deployed.'],
[6,'Who should approve acceptance of a material residual security risk?',['The designated business or risk owner','Any developer who fixed a bug','The external scanner vendor','The newest team member'],0,'Risk acceptance is a governance decision made by authorized accountable owners.'],
[6,'A production incident reveals a recurring configuration error. What BEST prevents recurrence?',['Root cause analysis followed by controlled baseline and pipeline changes','Restart the service without documentation','Remove monitoring','Ignore the incident after recovery'],0,'Corrective action should address systemic causes and be verified through change control.'],
[7,'Why maintain a software bill of materials (SBOM)?',['To identify components and assess exposure when vulnerabilities emerge','To replace threat modeling','To prove all components are vulnerability-free','To eliminate vendor contracts'],0,'An SBOM enables inventory and vulnerability response; it does not guarantee security.'],
[7,'A vendor provides a library with an unclear build origin. What is the BEST next step?',['Verify provenance and evaluate supplier and artifact risk before adoption','Assume the download is trustworthy','Disable integrity checks','Copy the library into production immediately'],0,'Provenance, integrity and supplier assurance support software supply chain risk management.'],
[7,'Which acquisition requirement BEST supports supply-chain incident response?',['Defined vulnerability disclosure and incident notification timelines','A vendor logo on the website','Unlimited shared administrative access','No right to assess suppliers'],0,'Supplier notification and response obligations should be established contractually.']
];
// Keep the original 88 questions indexed for previously saved practice history, but
// use only the revised 800-question bank for every NEW practice or mock session.
const LEGACY_QUESTIONS=BASE_QUESTIONS.concat(window.CSSLP_EXPANSION.questions);
const QUESTIONS=LEGACY_QUESTIONS.concat(window.CSSLP_BANK.map(q=>[q.domain,q.stem,q.choices,q.answer,q.explanation]));
const ACTIVE_QUESTION_IDS=window.CSSLP_BANK.map((_,i)=>LEGACY_QUESTIONS.length+i);
let page='home',domain=0,quiz=[],index=0,selected=null,revealed=false,mode='practice',answerOrders=[],sessionStart=0,sessionLimit=0,sessionRecords=[];
let flashIndex=0,flashBack=false,flashMode='due';
function save(){saveCourseProgress(state)}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function navTo(p,d){page=p;if(typeof d==='number')domain=d;render();finishCourseNavigation()}
function actionAttrs(action, args = []) {
  return 'data-action="' + esc(action) + '" data-args="' + esc(JSON.stringify(args)) + '"';
}
function button(label, action, args = [], secondary = false) {
  return '<button type="button" class="btn ' + (secondary ? '' : 'primary') + '" ' +
    actionAttrs(action, args) + '>' + esc(label) + '</button>';
}
function layout(t){document.getElementById('app').innerHTML=t;addCourseContext();renderNav()}
function home(){layout('<div class="hero"><span class="eyebrow">Your CSSLP learning journey</span><h1>Build understanding.<br>Practice sound security decisions.</h1><p>Work through one domain at a time: read the foundations, study the guided lessons, then deepen and apply your knowledge. Use practice results to choose what to revisit.</p><div class="actions">'+button('Start with Foundations', 'openChapter', [0])+button('How to use the course', 'navTo', ['guide'], true)+'</div></div>'+learningJourney()+'<div class="grid section"><div class="card"><h2>Returning to study?</h2><p>Your saved work stays in this browser. Check completed activities and recent results to choose your next domain.</p>'+button('View my readiness', 'navTo', ['readiness'], true)+'</div><div class="card"><h2>Already know the basics?</h2><p>Take an optional domain pretest to find gaps, then use the recommended lessons. You can read first if the vocabulary is new.</p>'+button('Choose a domain pretest', 'navTo', ['pretests'], true)+'</div></div><div class="actions">'+button('Set a study schedule', 'navTo', ['plan'], true)+button('Explore all 8 domains', 'navTo', ['domains'], true)+'</div>')}
function domains(){layout('<span class="eyebrow">Official blueprint · Eight domains</span><h1>Study by exam domain</h1><p>Every domain contains focused explanations, an applied workplace scenario, and related practice questions. Review the higher-weighted domains thoroughly without neglecting any domain.</p><div class="grid">'+DOMAINS.map(function(d,i){return '<div class="card"><div class="domain"><h3>'+(i+1)+'. '+esc(d.name)+'</h3><span class="tag">'+d.weight+'%</span></div><p>'+esc(d.focus)+'</p><p class="small">'+(state.done[i]?'✓ Marked reviewed':'Not yet marked reviewed')+'</p>'+button('Open lessons', 'navTo', ['lesson', i])+'</div>'}).join('')+'</div>')}
function lesson(){let d=DOMAINS[domain];layout('<span class="eyebrow">Domain '+(domain+1)+' · '+d.weight+'% of blueprint</span><h1>'+esc(d.name)+'</h1><p>'+esc(d.focus)+'</p><div class="card section"><h2>What an experienced technologist should know</h2>'+d.lesson.map(function(l){return '<div class="lesson"><strong>'+esc(l[0])+'</strong><p>'+esc(l[1])+'</p></div>'}).join('')+'<div class="focus"><strong>How to reason on the exam</strong><p>Identify the phase of the lifecycle, the actual risk, the accountable decision-maker, and whether the question asks for the FIRST, BEST or MOST effective action. Prefer risk-based, repeatable controls over a quick tool-only fix.</p></div><div class="actions">'+button('8-question pretest', 'startPretest', [domain])+button('Practice this domain', 'startQuiz', ['domain', domain])+button(state.done[domain]?'✓ Reviewed':'Mark domain reviewed', 'markDone', [domain], true)+'</div></div><p class="source">Aligned to the <a href="'+OUTLINE+'" target="_blank" rel="noopener">official CSSLP outline</a>; these are independently written summaries, not official ISC2 training materials.</p>')}
function markDone(i){state.done[i]=!state.done[i];save();render()}
const STUDY_BLOCKS=[
 {title:'Baseline and foundations',summary:'Diagnostic; concepts, lifecycle, requirements',domains:[0,1,2],tasks:['Complete the diagnostic to identify unfamiliar security vocabulary.','Review core principles and security governance.','Work through software requirements and abuse cases.','Practice the three related domains and revisit missed questions.']},
 {title:'Design and implementation',summary:'Threat modeling, secure patterns, coding and identity',domains:[3,4],tasks:['Map assets, data flows and trust boundaries in a familiar application.','Review STRIDE, least privilege and authorization design.','Study secure coding, cryptography and secrets management.','Complete architecture and implementation practice questions.']},
 {title:'Validation and operations',summary:'Testing, secure delivery, incident response and supply chain',domains:[5,6,7],tasks:['Compare SAST, DAST, fuzzing and negative testing.','Review CI/CD controls, secure deployment and incident response.','Study SBOMs, software provenance and supplier risk.','Practice testing, operations and supply-chain questions.']},
 {title:'Exam decision-making',summary:'Mixed questions, error log, timed practice and targeted review',domains:[],tasks:['Review the personal error log and weakest domains.','Complete a mixed question session and explain the distractors.','Attempt the timed 60-question timed practice.','Revisit weak concepts with flashcards and domain lessons.']}
];

function toggleBlockTask(block,task){const key=block+'-'+task;state.blockTasks[key]=!state.blockTasks[key];save();planBlock(block)}
function plan(){let days=state.plan;layout('<span class="eyebrow">Focused preparation</span><h1>Your study roadmap</h1><p>Choose a block to open its study checklist, lessons and practice activities. Your checklist is saved in this browser.</p><div class="card"><label for="duration">Study schedule: </label><select class="field" id="duration" data-action="changeStudyPlan"><option value="14" '+(days===14?'selected':'')+'>2 weeks · intensive</option><option value="28" '+(days===28?'selected':'')+'>4 weeks · balanced</option><option value="42" '+(days===42?'selected':'')+'>6 weeks · steady</option></select></div><div class="grid section">'+STUDY_BLOCKS.map(function(x,i){const done=x.tasks.filter((t,j)=>state.blockTasks[i+'-'+j]).length;return '<button class="card study-block" style="text-align:left;color:inherit;width:100%;cursor:pointer" '+actionAttrs('navTo', ['block', i])+'><span class="eyebrow">Block '+(i+1)+' · approximately '+Math.round(days/4)+' days</span><h3 style="margin-top:12px">'+x.title+'</h3><p>'+x.summary+'</p><div class="meter"><div style="width:'+(done/x.tasks.length*100)+'%"></div></div><span class="small">'+done+' of '+x.tasks.length+' tasks completed · Open block →</span></button>'}).join('')+'</div><div class="focus"><strong>Daily routine</strong><p>10 min recall → 20 min domain concepts → 15 min scenario questions → 5 min error log. Spend extra time where your reasoning is uncertain.</p></div>')}
function planBlock(i){i=Number(i);const b=STUDY_BLOCKS[i];if(!b){navTo('plan');return}page='block';domain=i;const completed=b.tasks.filter((t,j)=>state.blockTasks[i+'-'+j]).length;layout('<span class="eyebrow">Study plan · Block '+(i+1)+' of 4</span><h1>'+b.title+'</h1><p>'+b.summary+'</p><div class="card section"><div class="review"><h2>Action checklist</h2><span class="tag">'+completed+' / '+b.tasks.length+' complete</span></div><div class="meter"><div style="width:'+(completed/b.tasks.length*100)+'%"></div></div>'+b.tasks.map((t,j)=>'<label style="display:flex;gap:12px;align-items:flex-start;padding:14px 0;border-bottom:1px solid #43485B;cursor:pointer"><input type="checkbox" style="width:20px;height:20px;accent-color:#FEB500;flex-shrink:0" '+(state.blockTasks[i+'-'+j]?'checked':'')+' '+actionAttrs('toggleBlockTask', [i, j])+'><span>'+esc(t)+'</span></label>').join('')+'</div><div class="section"><h2>Open learning activities</h2><div class="grid">'+(b.domains.length?b.domains.map(d=>'<div class="card"><span class="eyebrow">Domain '+(d+1)+'</span><h3 style="margin-top:10px">'+esc(DOMAINS[d].name)+'</h3><p>'+esc(DOMAINS[d].focus)+'</p><div class="actions">'+button('Pretest', 'startPretest', [d])+button('Study lessons', 'navTo', ['lesson', d])+button('Practice', 'startQuiz', ['domain', d], true)+'</div></div>').join(''):'<div class="card"><h3>Exam practice and review</h3><p>Use timed practice, missed-question analysis and active recall to strengthen decision-making.</p><div class="actions">'+button('Timed practice', 'startQuiz', ['mock'])+button('Review weak areas', 'navTo', ['review'], true)+button('Flashcards', 'navTo', ['flash'], true)+'</div></div>')+'</div></div><div class="actions">'+button('← Back to study plan', 'navTo', ['plan'], true)+(i<3?button('Next block →', 'navTo', ['block', (i+1)], true):'')+'</div>')}
function shuffled(a){let b=a.slice();for(let i=b.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));let x=b[i];b[i]=b[j];b[j]=x}return b}
const MOCK_COUNTS = [7, 7, 8, 9, 8, 8, 7, 6];
let mockAnswers = [];

function startQuiz(kind, selectedDomain) {
  mode = kind;
  const ids = ACTIVE_QUESTION_IDS.slice();
  const domainPool = d => ids.filter(id => QUESTIONS[id][0] === d);
  if (kind === 'mock' || kind === 'diagnostic') {
    const quotas = kind === 'mock' ? MOCK_COUNTS : DOMAINS.map(() => 2);
    quiz = shuffled(quotas.flatMap((count, d) => shuffled(domainPool(d)).slice(0, count)));
  } else {
    quiz = shuffled(kind === 'domain' ? domainPool(selectedDomain) : ids)
      .slice(0, kind === 'domain' ? 11 : 25);
  }
  answerOrders = quiz.map(() => shuffled([0, 1, 2, 3]));
  mockAnswers = Array(quiz.length).fill(null);
  sessionStart = Date.now();
  sessionLimit = kind === 'mock' ? Math.round(180 * 60 * quiz.length / 125) : 0;
  sessionRecords = [];
  index = 0;
  selected = null;
  revealed = false;
  page = 'quiz';
  render();
  finishCourseNavigation();
}

function quizHome() {
  layout('<span class="eyebrow">Scenario-based practice</span><h1>Practice security decisions</h1>' +
    '<p>Use these course-authored exercises to explain your decision and compare it with the rationale.</p>' +
    '<div class="grid"><div class="card"><h2>Quick diagnostic</h2>' +
    '<p>16 questions, two from each domain, with feedback after each answer.</p>' +
    button('Start diagnostic', 'startQuiz', ['diagnostic']) +
    '</div><div class="card"><h2>Mixed practice</h2><p>25 questions with immediate feedback.</p>' +
    button('Start mixed practice', 'startQuiz', ['mixed']) + '</div></div>' +
    '<section class="card section"><span class="eyebrow">Pacing practice</span>' +
    '<h2>60-question timed practice</h2><p>86 minutes across eight domains, with counts close to the exam weights. ' +
    'You can skip and revisit questions. Feedback appears after submission or when time runs out. ' +
    'This uses the same pool as practice, so some questions may be familiar.</p>' +
    button('Start timed practice', 'startQuiz', ['mock']) + '</section>' +
    '<p class="source">Practice pool: ' + ACTIVE_QUESTION_IDS.length + ' revised questions. Earlier practice results remain available in your history.</p>');
}

function quizPage() {
  if (!quiz.length) {
    quizHome();
    return;
  }
  const timed = mode === 'mock';
  const question = QUESTIONS[quiz[index]];
  const order = answerOrders[index];
  const picked = timed ? mockAnswers[index] : selected;
  const choices = order.map((choice, i) => {
    const selectedClass = picked === i ? ' selected' : '';
    const feedbackClass = revealed ? (choice === question[3] ? ' correct' : picked === i ? ' wrong' : '') : '';
    return '<button type="button" class="option' + selectedClass + feedbackClass + '" aria-pressed="' +
      (picked === i) + '" ' + (revealed ? 'disabled ' : '') + actionAttrs('choose', [i]) + '>' +
      '<span>' + String.fromCharCode(65 + i) + '.</span><span>' + esc(question[2][choice]) + '</span></button>';
  }).join('');
  const progress = timed ? mockAnswers.filter(answer => answer !== null).length : index;
  let controls;
  if (timed) {
    controls = (index ? button('← Previous', 'moveMock', [-1], true) : '') +
      (index < quiz.length - 1 ? button('Next question', 'moveMock', [1], true) : '') +
      button('Review and submit', 'reviewMock');
  } else {
    controls = revealed
      ? button(index === quiz.length - 1 ? 'Finish session' : 'Next question', 'nextQuestion')
      : button('Check answer', 'checkAnswer');
  }
  layout('<h1>' + (timed ? 'Timed practice' : 'Practice questions') + '</h1>' +
    (timed ? '<p id="mockTimer" class="timer"></p>' : '') +
    '<div class="review"><span class="eyebrow">Question ' + (index + 1) + ' of ' + quiz.length +
    '</span><span class="tag">Domain ' + (question[0] + 1) + '</span></div>' +
    (timed ? '<p class="small">' + progress + ' of ' + quiz.length + ' answered</p>' : '') +
    '<div class="meter"><div style="width:' + Math.round(progress / quiz.length * 100) + '%"></div></div>' +
    '<div class="card section"><h2>' + esc(question[1]) + '</h2><div class="options">' + choices + '</div>' +
    (revealed ? '<div class="explain"><strong>' + (order[picked] === question[3] ? 'Correct' : 'Review this decision') +
      '</strong><p>' + esc(question[4]) + '</p></div>' : '') +
    '<div class="actions">' + controls + '</div></div>');
  if (timed) tickMock();
}

function choose(i) {
  if (revealed || !quiz.length || !progressIndex(i, 4)) return;
  if (mode === 'mock') {
    if (mockExpired()) return;
    mockAnswers[index] = i;
  } else {
    selected = i;
  }
  render();
  document.querySelector('.option.selected')?.focus();
}

function recordPracticeAnswer(id, correct) {
  const record = {id, correct, when: Date.now(), mode};
  state.history.push(record);
  sessionRecords.push(record);
  if (correct) state.wrong = state.wrong.filter(item => item !== id);
  else if (!state.wrong.includes(id)) state.wrong.push(id);
}

function checkAnswer() {
  if (revealed || !quiz.length || mode === 'mock') return;
  if (selected === null) {
    alert('Select an answer first.');
    return;
  }
  const id = quiz[index];
  recordPracticeAnswer(id, answerOrders[index][selected] === QUESTIONS[id][3]);
  save();
  revealed = true;
  render();
  document.querySelector('#app .actions button')?.focus();
}

function nextQuestion() {
  if (!revealed || !quiz.length || mode === 'mock') return;
  if (index === quiz.length - 1) {
    quizFinish();
    return;
  }
  index++;
  selected = null;
  revealed = false;
  render();
  focusCourseHeading();
}

function mockExpired() {
  if (Date.now() - sessionStart < sessionLimit * 1000) return false;
  quizFinish(true);
  return true;
}

function openMockQuestion(i) {
  if (mockExpired() || !progressIndex(i, quiz.length)) return;
  page = 'quiz';
  index = i;
  render();
  focusCourseHeading();
}

function moveMock(offset) {
  openMockQuestion(index + offset);
}

function reviewMock() {
  if (mockExpired()) return;
  page = 'mockReview';
  const answered = mockAnswers.filter(answer => answer !== null).length;
  layout('<h1>Review timed attempt</h1><p id="mockTimer" class="timer"></p><p>' +
    answered + ' of ' + quiz.length + ' answered. Unanswered questions count toward the total.</p>' +
    '<div class="actions">' + mockAnswers.map((answer, i) =>
      button('Question ' + (i + 1) + (answer === null ? ' · Unanswered' : ' · Answered'),
        'openMockQuestion', [i], true)).join('') + '</div><div class="actions">' +
    button('Submit attempt', 'quizFinish') + '</div>');
  tickMock();
  focusCourseHeading();
}

function quizFinish(timedOut = false) {
  if (!quiz.length) return;
  const timed = mode === 'mock';
  if (timed) timedOut = timedOut || Date.now() - sessionStart >= sessionLimit * 1000;
  let answerReview = '';
  if (timed) {
    answerReview = '<section class="section"><h2>Answer review</h2>' + quiz.map((id, i) => {
      const question = QUESTIONS[id];
      const choice = answerOrders[i][mockAnswers[i]];
      const correct = choice === question[3];
      if (choice !== undefined) recordPracticeAnswer(id, correct);
      return '<details class="detail"><summary>Question ' + (i + 1) + ' · ' +
        (choice === undefined ? 'Unanswered' : correct ? 'Correct' : 'Review') + '</summary><h3>' +
        esc(question[1]) + '</h3><p>Your answer: ' + esc(question[2][choice] ?? 'Unanswered') +
        '</p><p>Best answer: ' + esc(question[2][question[3]]) + '</p><p>' +
        esc(question[4]) + '</p></details>';
    }).join('') + '</section>';
  }
  const total = quiz.length;
  const correct = sessionRecords.filter(record => record.correct).length;
  const elapsed = Math.round((Date.now() - sessionStart) / 1000);
  state.sessions.push({
    when: Date.now(), mode, correct, total, elapsed: timed ? Math.min(elapsed, sessionLimit) : elapsed
  });
  save();
  quiz = [];
  sessionLimit = 0;
  page = 'quiz';
  layout('<div class="hero"><span class="eyebrow">' + (timedOut ? 'Time expired' : 'Session complete') +
    '</span><h1>' + correct + ' / ' + total + ' correct</h1><p>' + sessionRecords.length +
    ' of ' + total + ' answered. Review your decisions to choose what to study next.</p><div class="actions">' +
    button('Review weak areas', 'navTo', ['review']) +
    button('Practice again', 'startQuiz', ['mixed'], true) + '</div></div>' + answerReview);
  finishCourseNavigation();
}

function tickMock() {
  if (mode !== 'mock' || !['quiz', 'mockReview'].includes(page) || !quiz.length || !sessionLimit) return;
  if (mockExpired()) return;
  const remaining = sessionLimit - Math.floor((Date.now() - sessionStart) / 1000);
  const timer = document.getElementById('mockTimer');
  if (timer) timer.textContent = 'Time remaining: ' + Math.floor(remaining / 60) + ':' +
    String(remaining % 60).padStart(2, '0');
}

function review(){let missed=state.wrong.slice();let by=DOMAINS.map(function(d,i){let a=state.history.filter(function(x){return QUESTIONS[x.id][0]===i}),c=a.filter(function(x){return x.correct}).length;return {name:d.name,n:a.length,rate:a.length?Math.round(100*c/a.length):null}});layout('<span class="eyebrow">Your personal error log</span><h1>Focus where it matters</h1><p>Answers and progress are stored only in this browser. An unanswered domain is not the same as a mastered one.</p><div class="card"><h2>Performance by domain</h2>'+by.map(function(x,i){return '<div class="barrow"><span class="small" style="width:42%">'+(i+1)+'. '+esc(x.name)+'</span><div class="meter"><div style="width:'+(x.rate===null?0:x.rate)+'%"></div></div><span class="small">'+(x.rate===null?'Not tested':x.rate+'% · '+x.n+' tries')+'</span></div>'}).join('')+'</div><div class="section"><h2>Questions to revisit ('+missed.length+')</h2>'+(missed.length?missed.map(function(id){let q=QUESTIONS[id];return '<div class="card" style="margin-bottom:10px"><span class="tag">Domain '+(q[0]+1)+'</span><h3 style="margin-top:10px">'+esc(q[1])+'</h3><p>'+esc(q[4])+'</p>'+button('Study this domain', 'navTo', ['lesson', q[0]], true)+'</div>'}).join(''):'<div class="focus">No outstanding missed questions yet. Take a diagnostic or mixed practice session to populate this review.</div>')+'</div>')}
function exam(){layout('<span class="eyebrow">The final mile</span><h1>Exam strategy</h1><div class="grid"><div class="card"><h3>Read the qualifier</h3><p>“FIRST” often asks for the prerequisite action. “BEST” asks for the most appropriate risk-based choice. “MOST effective” asks which action addresses the root cause.</p></div><div class="card"><h3>Think lifecycle-wide</h3><p>Security belongs in requirements, architecture, implementation, testing, release, operations and supplier decisions. Avoid choosing a late-stage fix when an earlier control is possible.</p></div><div class="card"><h3>Know who owns risk</h3><p>Technical teams recommend controls; authorized business and risk owners make risk-acceptance decisions.</p></div><div class="card"><h3>Practice timed judgment</h3><p>The official exam lists 125 items in 180 minutes—an average of about 86 seconds per item. Practice reading scenarios efficiently without rushing the qualifier.</p></div></div><div class="warning section">This independent learning site does not guarantee a pass. It is not an ISC2 endorsement or an official question bank. Verify current exam format, eligibility and policies with ISC2 before registration.</div><div class="actions"><a class="btn primary" target="_blank" rel="noopener" href="'+OUTLINE+'">Official exam outline ↗</a><a class="btn" target="_blank" rel="noopener" href="https://www.isc2.org/certifications/csslp">ISC2 CSSLP overview ↗</a></div>')}
function render(){renderNav();if(page==='guide')courseGuide();else if(page==='home')home();else if(page==='domains')domains();else if(page==='lesson')lesson();else if(page==='plan')plan();else if(page==='block')planBlock(domain);else if(page==='quiz')quizPage();else if(page==='mockReview')reviewMock();else if(page==='review')review();else if(page==='flash')flashPage();else if(page==='pretests')pretestsHome();else if(page==='pretest')pretestPage();else if(page==='pretestResults')pretestResults();else if(page==='topicPractice')topicPracticePage();else if(page==='pretestReview')pretestReviewPage();else if(page==='curriculum')curriculumHome();else if(page==='textbook')textbookHome();else if(page==='chapter')chapterPage();else if(page==='deep')deepHome();else if(page==='deepModule')deepModulePage();else if(page==='labs')labsHome();else if(page==='lab')labPage();else if(page==='readiness')readinessPage();else if(page==='studyUnit')studyUnitPage();else exam()}

const X=window.CSSLP_EXPANSION;
const STUDY=window.CSSLP_STUDY||[];
const TEXTBOOK=window.CSSLP_TEXTBOOK||[];
const ADVANCED=window.CSSLP_ADVANCED||[];
const LABS=window.CSSLP_LABS||[];
let advancedDomain=0,advancedModule=0,labDomain=0,labReveal=false;let unitDomain=0,unitIndex=0;
const BANK=window.CSSLP_BANK||[];
let pretestDomain=0,pretestIds=[],pretestAnswers=[],pretestAt=0,pretestStart=0,pretestOrder=[];
function flashPage(){const items=X.flash.map((c,i)=>({c,i,r:state.flash[i]||{next:0,interval:0,ease:2.3}})).filter(x=>flashMode==='all'||x.r.next<=Date.now());const due=X.flash.filter((c,i)=>!state.flash[i]||state.flash[i].next<=Date.now()).length;flashIndex=Math.min(flashIndex,Math.max(0,items.length-1));const x=items[flashIndex];layout('<span class="eyebrow">Spaced repetition</span><h1>Active recall cards</h1><p>Explain the idea before revealing it. Difficult concepts return sooner. Your schedule is stored locally.</p><div class="grid"><div class="card"><div class="stat">'+due+'</div><p>Due now</p></div><div class="card"><div class="stat">'+Object.keys(state.flash).length+' / '+X.flash.length+'</div><p>Reviewed at least once</p></div></div><div class="actions">'+button('Due cards', 'setFlashMode', ['due'])+button('All cards', 'setFlashMode', ['all'], true)+'</div>'+(x?'<div class="section"><p class="small">Card '+(flashIndex+1)+' of '+items.length+' · Domain '+(x.c.domain+1)+'</p><button type="button" class="flashcard" data-action="flipFlash"><span><span class="eyebrow">'+(flashBack?'Explanation':'Recall this concept')+'</span><strong class="flashcard-text">'+esc(flashBack?x.c.back:x.c.front)+'</strong><span class="small">Select to flip</span></span></button><div class="actions">'+(flashBack?button('Again · 10 min', 'rateFlash', [x.i, 0])+button('Good · 2+ days', 'rateFlash', [x.i, 1], true)+button('Easy · 5+ days', 'rateFlash', [x.i, 2], true):button('Reveal answer', 'flipFlash'))+'</div></div>':'<div class="card section"><h2>All caught up!</h2><p>No cards are due now. Return later or switch to All cards for extra practice.</p></div>'))}
function rateFlash(i,rating){let x=state.flash[i]||{interval:0,ease:2.3,next:0};let minutes=rating===0?10:rating===1?(x.interval>=2?Math.max(2,Math.round(x.interval*x.ease)):2)*1440:(x.interval>=5?Math.round(x.interval*x.ease*1.3):5)*1440;x.interval=minutes/1440;x.ease=Math.max(1.3,x.ease+(rating===0?-.18:rating===2?.12:0));x.next=Date.now()+minutes*60000;state.flash[i]=x;save();flashBack=false;flashPage()}



let chapterDomain=0;


function readinessPage(){
 const advancedTotal=ADVANCED.reduce((n,x)=>n+x.length,0),advancedDone=Object.values(state.advancedDone).filter(Boolean).length,labsDone=Object.values(state.labDone).filter(Boolean).length,lessonsDone=Object.values(state.lessonDone).filter(Boolean).length,pretests=Object.keys(state.pretests).length;
 const domainScores=DOMAINS.map((d,i)=>{const latest=new Map(state.history.filter(x=>QUESTIONS[x.id][0]===i).map(x=>[x.id,x]));return {name:d.name,n:latest.size,correct:[...latest.values()].filter(x=>x.correct).length,available:QUESTIONS.filter(q=>q[0]===i).length}});
 const checks=[['All eight domain pretests attempted',pretests===8,pretests+'/8'],['Foundational guided lessons completed',lessonsDone>=64,lessonsDone+'/64'],['Advanced modules completed',advancedDone===advancedTotal,advancedDone+'/'+advancedTotal],['Applied labs completed',labsDone===8,labsDone+'/8']];
 layout('<span class="eyebrow">Evidence of learning, not a pass guarantee</span><h1>Course readiness dashboard</h1><p>Track course milestones and practice coverage. Each question contributes its latest answer, so repeated attempts cannot inflate the number of distinct questions attempted.</p><div class="card section"><h2>Learning milestones</h2>'+checks.map(x=>'<div class="review" style="padding:12px 0;border-bottom:1px solid #43485B"><span>'+(x[1]?'✓ ':'○ ')+x[0]+'</span><span class="tag">'+x[2]+'</span></div>').join('')+'</div><div class="card section"><h2>Practice coverage by domain</h2>'+domainScores.map((x,i)=>'<div class="review" style="padding:10px 0;border-bottom:1px solid #43485B"><div><strong>Domain '+(i+1)+'</strong><p class="small">'+esc(x.name)+'</p></div><span class="tag">'+(x.n===0?'No practice yet':x.correct+' correct of '+x.n+' attempted · '+x.available+' available')+'</span></div>').join('')+'</div><div class="focus section"><h3>Before scheduling the certification exam</h3><p>Demonstrate independent understanding of all eight domains, explain why competing answers are wrong, complete the practical labs without viewing solutions, and use independently authored, reputable assessment material to confirm performance. Review the official ISC2 exam outline before choosing what to study next.</p></div><div class="actions">'+button('Read textbook', 'navTo', ['textbook'])+button('Advanced modules', 'navTo', ['deep'], true)+button('Practical labs', 'navTo', ['labs'], true)+button('Domain pretests', 'navTo', ['pretests'], true)+'</div>');
}
function deepHome(){
 layout('<span class="eyebrow">Advanced academic preparation</span><h1>Deep-dive academy</h1><p>Move beyond memorized definitions. These modules teach distinctions, architectural reasoning, common traps and structured exercises. Use your pretest to identify weak domains, then read the full module and complete its practice task.</p><div class="grid">'+ADVANCED.map((mods,d)=>{let done=mods.filter((m,i)=>state.advancedDone[d+'-'+i]).length;return '<div class="card"><span class="eyebrow">Domain '+(d+1)+' · '+done+' / '+mods.length+' modules complete</span><h3>'+esc(DOMAINS[d].name)+'</h3><div class="meter"><div style="width:'+(100*done/mods.length)+'%"></div></div>'+mods.map((m,i)=>'<div class="lesson"><h4>'+esc(m[0])+'</h4>'+button('Read deep dive', 'openDeep', [d, i], true)+'</div>').join('')+'<div class="actions">'+button('Apply in practical lab', 'openLab', [d], true)+'</div></div>'}).join('')+'</div>');
}
function openDeep(d,i){advancedDomain=d;advancedModule=i;page='deepModule';render();finishCourseNavigation()}


function submitWritten(kind,d,i){
 const key=kind+'-'+d+'-'+i,el=document.getElementById('writtenAnswer');
 if(!el)return;
 const answer=el.value.trim();
 if(!answer){alert('Write your response before submitting.');el.focus();return}
 state.writtenResponses[key]={answer,submitted:true};save();render();
}
function reviseWritten(kind,d,i){
 const key=kind+'-'+d+'-'+i;
 if(!state.writtenResponses[key])return;
 state.writtenResponses[key].submitted=false;save();render();
}
function writtenExercise(kind,d,i,instructions,model){
 const key=kind+'-'+d+'-'+i,r=state.writtenResponses[key],submitted=!!r?.submitted;
 return '<div class="card section"><h3>Written application exercise</h3><p><strong>Instructions:</strong> '+esc(instructions)+'</p><label for="writtenAnswer" style="display:block;margin:12px 0 6px">Your response</label><textarea id="writtenAnswer" class="field" style="width:100%;min-height:160px" '+(submitted?'readonly':'')+' placeholder="Explain your decision and supporting reasoning.">'+esc(r?.answer||'')+'</textarea><p class="small">Your answer is saved locally when submitted. This exercise is self-assessed, not automatically graded.</p><div class="actions">'+(submitted?button('Revise my answer', 'reviseWritten', [kind, d, i], true):button('Submit and see model answer', 'submitWritten', [kind, d, i]))+'</div>'+(submitted?'<div class="focus"><h3>Model answer and explanation</h3><p style="line-height:1.85">'+esc(model)+'</p><p><strong>Self-check:</strong> Compare your answer with the model. Identify any missing security objective, control, rationale, verification method or risk decision. A differently worded answer can also be correct if it addresses the same issues.</p></div>':'')+'</div>';
}

function deepModulePage(){
 const m=ADVANCED[advancedDomain]?.[advancedModule];if(!m){navTo('deep');return}
 const done=!!state.advancedDone[advancedDomain+'-'+advancedModule];
 const model='A strong response should identify the security objective, explain the relevant distinctions, and propose a defensible control. '+m[1]+' Applied to the scenario: '+m[2]+' Common incorrect assumption to avoid: '+m[4];
 layout('<span class="eyebrow">Advanced module · Domain '+(advancedDomain+1)+' · '+(advancedModule+1)+' / 3</span><h1>'+esc(m[0])+'</h1><div class="card section"><h2>Conceptual foundations and distinctions</h2><p style="line-height:1.95">'+esc(m[1])+'</p><div class="focus"><h2>Worked professional scenario</h2><p style="line-height:1.85">'+esc(m[2])+'</p></div><h3>Common exam misconception</h3><p>'+esc(m[4])+'</p></div>'+writtenExercise('deep',advancedDomain,advancedModule,m[3]+' Write a short recommendation identifying the risk, your chosen control and why it is appropriate.',model)+'<div class="actions">'+button(done?'✓ Completed · undo':'Mark module complete', 'toggleAdvanced', [advancedDomain, advancedModule])+button('Domain lab', 'openLab', [advancedDomain], true)+(advancedModule<2?button('Next module', 'openDeep', [advancedDomain, (advancedModule+1)], true):button('All modules', 'navTo', ['deep'], true))+'</div>');
}
function labsHome(){layout('<span class="eyebrow">Practice making security decisions</span><h1>Hands-on scenario labs</h1><p>Work through a professional case, write your answer before opening the worked solution, and mark completion. These are paper-based design exercises, not executable software labs.</p><div class="grid">'+LABS.map((l,d)=>'<div class="card"><span class="eyebrow">Domain '+(d+1)+(state.labDone[d]?' · ✓ Completed':'')+'</span><h3>'+esc(l.title)+'</h3><p>'+esc(l.brief)+'</p>'+button('Start case study', 'openLab', [d])+'</div>').join('')+'</div>')}
function openLab(d){labDomain=d;labReveal=false;page='lab';render();finishCourseNavigation()}

function labPage(){
 const l=LABS[labDomain];if(!l){navTo('labs');return}
 const instructions='Address all '+l.tasks.length+' tasks in the assignment. Use the rubric to check that your recommendation includes evidence for each decision. Submit your response to compare it with the model answer.';
 layout('<span class="eyebrow">Applied case study · Domain '+(labDomain+1)+'</span><h1>'+esc(l.title)+'</h1><div class="card section"><h2>Situation</h2><p style="line-height:1.85">'+esc(l.brief)+'</p><h2>Your assignment</h2><ol>'+l.tasks.map(x=>'<li style="margin:12px 0">'+esc(x)+'</li>').join('')+'</ol>'+labRubric()+'</div>'+writtenExercise('lab',labDomain,0,instructions,l.answer)+'<div class="actions">'+button(state.labDone[labDomain]?'✓ Completed · undo':'Mark lab complete', 'toggleLab', [labDomain])+button('Next domain lab', 'openLab', [((labDomain+1)%8)], true)+button('All labs', 'navTo', ['labs'], true)+'</div>');
}
function labRubric() {
  return '<details class="detail"><summary>How to assess your lab response</summary>' +
    '<p>Give yourself one point for each criterion you can support with a sentence from your response.</p>' +
    '<ol><li><strong>Risk:</strong> Name the asset, the failure or abuse path, and its impact.</li>' +
    '<li><strong>Control:</strong> Describe where the control operates and how it addresses the failure.</li>' +
    '<li><strong>Verification:</strong> Specify a test or artifact and the result you expect to see.</li>' +
    '<li><strong>Ownership:</strong> Identify who implements the control and who decides what to do about remaining risk.</li></ol>' +
    '<p>After comparing with the model answer, revise the first criterion you could not support.</p></details>';
}
function textbookHome(){layout('<span class="eyebrow">Read · Understand · Apply</span><h1>CSSLP foundations textbook</h1><p>Start here if the course assumes knowledge you have not yet learned. Each chapter explains essential concepts in plain language, then demonstrates realistic workplace decisions. Read before relying on practice questions.</p><div class="grid">'+TEXTBOOK.map((c,d)=>'<div class="card"><span class="eyebrow">Chapter '+(d+1)+' of '+TEXTBOOK.length+'</span><h3>'+esc(c.title)+'</h3><p class="small">'+c.sections.length+' lessons in this chapter</p><p>'+esc(c.sections[0][1].slice(0,190))+'…</p><div class="actions">'+button('Read chapter', 'openChapter', [d])+button('Take pretest', 'startPretest', [d], true)+'</div></div>').join('')+'</div>')}
function openChapter(d){chapterDomain=d;page='chapter';render();finishCourseNavigation()}
function chapterPage() {
  const chapter = TEXTBOOK[chapterDomain];
  if (!chapter) {
    navTo('textbook');
    return;
  }
  layout('<span class="eyebrow">Foundations textbook · Chapter ' + (chapterDomain + 1) +
    '</span><h1>' + esc(chapter.title) + '</h1><p>Read the concept, work through the example, and note the decision rule. ' +
    'Use the guided lessons for practice matched to the pretest concepts.</p><div class="actions">' +
    button('← All chapters', 'navTo', ['textbook'], true) +
    button('Domain pretest', 'startPretest', [chapterDomain], true) +
    button('Guided lessons', 'navTo', ['lesson', chapterDomain], true) + '</div>' +
    chapter.sections.map(([title, concept, example, decision], i) =>
      '<section class="card section"><span class="eyebrow">Section ' + (i + 1) + '</span><h2>' +
      esc(title) + '</h2><h3>Understand the concept</h3><p>' + esc(concept) +
      '</p><div class="focus"><h3>Real-world example</h3><p>' + esc(example) +
      '</p></div><h3>How to approach exam questions</h3><p>' + esc(decision) +
      '</p></section>').join('') + '<div class="actions">' +
    button('Review guided lessons', 'navTo', ['lesson', chapterDomain]) +
    button('Back to chapters', 'navTo', ['textbook'], true) + '</div>');
}

function curriculumHome(){
 layout('<span class="eyebrow">Complete study curriculum</span><h1>Learn the material, not just the answers</h1><p>Study the concepts, work through practical cases, test your reasoning and verify mastery. Start with the pretest in each domain to prioritize the lessons that need the most attention.</p><div class="grid">'+STUDY.map((d,i)=>{const n=d.units.filter((u,j)=>state.lessonDone[i+'-'+j]).length;const p=state.pretests[i];return '<div class="card"><span class="eyebrow">Domain '+(i+1)+' · '+DOMAINS[i].weight+'% exam weight</span><h3>'+esc(DOMAINS[i].name)+'</h3><p>'+esc(d.overview)+'</p><div class="meter"><div style="width:'+(100*n/d.units.length)+'%"></div></div><p class="small">'+n+' / '+d.units.length+' lessons complete'+(p?' · Pretest '+Math.round(p.correct/p.total*100)+'%':' · Pretest not taken')+'</p><div class="actions">'+button('Study lessons', 'navTo', ['lesson', i])+button('Pretest', 'startPretest', [i], true)+'</div></div>'}).join('')+'</div>');
}
function openStudyUnit(d,i){unitDomain=d;unitIndex=i;page='studyUnit';render();finishCourseNavigation()}
function markStudyUnit(d,i){state.lessonDone[d+'-'+i]=!state.lessonDone[d+'-'+i];save();render()}
function studyUnitPage(){
 const d=STUDY[unitDomain],u=d?.units[unitIndex];if(!u){navTo('curriculum');return}
 const pre=state.pretests[unitDomain],t=pre?.topics?.[unitIndex];const progress=d.units.filter((x,j)=>state.lessonDone[unitDomain+'-'+j]).length;
 layout('<span class="eyebrow">Domain '+(unitDomain+1)+' · Lesson '+(unitIndex+1)+' of '+d.units.length+'</span><h1>'+esc(u.title)+'</h1><p>'+esc(d.overview)+'</p><div class="card section"><span class="eyebrow">Learning objective</span><h2>Explain the principle and apply it to a security decision</h2><p>'+esc(u.concept)+'</p><div class="focus"><strong>Worked example</strong><p>'+esc(u.case)+'</p><p><strong>Best response:</strong> '+esc(u.decision)+'</p></div><h2>How to reason through it</h2><ol>'+u.steps.map(step=>'<li style="margin:10px 0;color:#C3C9D9">'+esc(step)+'</li>').join('')+'</ol><h3>Common trap</h3><p>'+esc(u.pitfall)+'</p><h3>Self-check</h3><p>'+esc(u.check)+'</p><details class="detail"><summary style="cursor:pointer;color:#FEB500">Show exam decision principle</summary><p>'+esc(d.exam)+'</p></details></div>'+(t?'<div class="focus section"><strong>Your pretest evidence:</strong> '+t.right+' / '+t.total+' correct on this concept. '+(t.right<t.total?'Prioritize this lesson and focused practice.':'Reinforce with retrieval practice.')+'</div>':'<div class="focus section">No pretest result for this concept yet. Take the domain pretest to personalize lesson order.</div>')+'<div class="actions">'+button(state.lessonDone[unitDomain+'-'+unitIndex]?'✓ Marked complete · undo':'Mark lesson complete', 'markStudyUnit', [unitDomain, unitIndex])+button('Practice this concept', 'startTopicPractice', [unitDomain, unitIndex], true)+(unitIndex<d.units.length-1?button('Next lesson →', 'openStudyUnit', [unitDomain, (unitIndex+1)], true):button('Back to domain', 'navTo', ['lesson', unitDomain], true))+'</div><p class="small">'+progress+' of '+d.units.length+' lessons completed in this domain.</p>');
}
function pretestsHome(){
 layout('<span class="eyebrow">Baseline assessment · Eight domains</span><h1>Domain pretests</h1><p>Take a short baseline in each domain with one question per concept. Use the results to decide which lessons to study first.</p><div class="grid">'+DOMAINS.map((d,i)=>{const last=state.pretests[i];return '<div class="card"><div class="domain"><h3>Domain '+(i+1)+': '+esc(d.name)+'</h3><span class="tag">8 concepts</span></div><p>'+esc(d.focus)+'</p>'+(last?'<p class="small">Latest: '+last.correct+' / '+last.total+' · '+Math.round(100*last.correct/last.total)+'%</p>':'<p class="small">Not assessed yet</p>')+'<div class="actions">'+button(last?'Retake 8-question pretest':'Start 8-question pretest', 'startPretest', [i])+(last?button('View study priorities', 'showPretestResults', [i], true):'')+'</div></div>'}).join('')+'</div><div class="warning section">Each domain samples eight scenario families. Retakes vary the scenario context and can repeat familiar decisions. Treat the result as a study signal.</div>');
}
function startPretest(d) {
  pretestDomain = d;
  const previous = new Set(state.pretests[d]?.ids);
  const families = new Map();
  BANK.forEach((question, id) => {
    if (question.domain !== d) return;
    if (!families.has(question.sourceFamily)) families.set(question.sourceFamily, []);
    families.get(question.sourceFamily).push(id);
  });
  pretestIds = shuffled([...families.values()].map(ids => {
    const fresh = ids.filter(id => !previous.has(id));
    return shuffled(fresh.length ? fresh : ids)[0];
  }));
  pretestAnswers = Array(pretestIds.length).fill(null);
  pretestOrder = pretestIds.map(() => shuffled([0, 1, 2, 3]));
  pretestAt = 0;
  pretestStart = Date.now();
  page = 'pretest';
  render();
  finishCourseNavigation();
}

function pretestPage(){
 if(!pretestIds.length){navTo('pretests');return}
 const q=BANK[pretestIds[pretestAt]],order=pretestOrder[pretestAt],selected=pretestAnswers[pretestAt];
 layout('<div class="review"><span class="eyebrow">Domain '+(pretestDomain+1)+' pretest</span><span class="tag">Question '+(pretestAt+1)+' of '+pretestIds.length+'</span></div><div class="meter"><div style="width:'+Math.round(100*(pretestAt+1)/pretestIds.length)+'%"></div></div><div class="card section"><h2>'+esc(q.stem)+'</h2><div class="options">'+order.map((idx,i)=>'<button class="option '+(selected===idx?'selected':'')+'" '+actionAttrs('choosePretest', [idx])+'><span style="font-weight:800">'+String.fromCharCode(65+i)+'.</span><span>'+esc(q.choices[idx])+'</span></button>').join('')+'</div><p class="small">Answers and explanations are withheld until the assessment ends to better measure your starting knowledge.</p><div class="actions">'+(pretestAt?button('← Previous', 'previousPretest', [], true):'')+button(pretestAt===pretestIds.length-1?'Submit pretest':'Next →', 'nextPretest')+'</div></div>');
}
function choosePretest(i){pretestAnswers[pretestAt]=i;render()}
function nextPretest(){if(pretestAnswers[pretestAt]===null){alert('Choose an answer before continuing.');return}if(pretestAt<pretestIds.length-1){pretestAt++;render();return}finishPretest()}
function finishPretest() {
  state.pretests[pretestDomain] = {
    ...summarizePretest(BANK, pretestIds, pretestAnswers),
    when: Date.now(),
    ids: pretestIds.slice(),
    answers: pretestAnswers.slice(),
    elapsed: Math.round((Date.now() - pretestStart) / 1000),
  };
  save();
  showPretestResults(pretestDomain);
  finishCourseNavigation();
}

function showPretestResults(d){pretestDomain=d;page='pretestResults';render()}
function pretestResults(){
 const r=state.pretests[pretestDomain];if(!r){navTo('pretests');return}
 const topics=X.lessonSections[pretestDomain]||[];
 const ranked=r.topics.map((t,i)=>({...t,i,rate:t.total?t.right/t.total:0})).sort((a,b)=>Number(!a.total)-Number(!b.total)||a.rate-b.rate||b.total-a.total);
 const weak=ranked.filter(t=>t.right<t.total);
 layout('<span class="eyebrow">Personalized learning pathway</span><h1>Domain '+(pretestDomain+1)+' · '+esc(DOMAINS[pretestDomain].name)+'</h1><div class="grid"><div class="card"><div class="eyebrow">Pretest score</div><div class="stat">'+r.correct+' / '+r.total+'</div><p>'+Math.round(r.correct/r.total*100)+'% correct · diagnostic only</p></div><div class="card"><div class="eyebrow">Priority concepts</div><div class="stat">'+weak.length+'</div><p>Concepts with at least one missed answer</p></div></div><div class="section"><h2>Your recommended study sequence</h2><p>Start with lower-scoring concepts. Each topic links to an applied explanation and practice. Use the counts to guide review. Each concept has a small sample.</p>'+ranked.map((t,rank)=>'<div class="card" style="margin-bottom:12px"><div class="domain"><div><span class="eyebrow">Priority '+(rank+1)+' · '+t.right+' / '+t.total+' correct</span><h3>'+esc(topics[t.i]?.title||'Topic '+(t.i+1))+'</h3></div><span class="tag">'+(t.total ? t.right + ' / ' + t.total : 'Unsampled')+'</span></div><p>'+esc(topics[t.i]?.body||'Review the relevant control and its rationale.')+'</p><div class="actions">'+button('Advanced modules', 'navTo', ['deep'])+button('Read textbook chapter', 'openChapter', [pretestDomain])+button('Study full lesson', 'openStudyUnit', [pretestDomain, t.i])+button('Practice this topic', 'startTopicPractice', [pretestDomain, t.i], true)+'</div></div>').join('')+'</div><div class="actions">'+button('Review answers', 'reviewPretestAnswers', [pretestDomain])+button('Retake domain pretest', 'startPretest', [pretestDomain], true)+button('All domain pretests', 'navTo', ['pretests'], true)+'</div>');
}
function openTopic(d,t){domain=d;page='lesson';render();const all=document.querySelectorAll('#app .lesson');const match=Array.from(all).find(el=>el.textContent.includes(X.lessonSections[d][t].title));if(match)match.scrollIntoView({behavior:'smooth',block:'center'})}
function startTopicPractice(d,t){const pool=BANK.map((q,i)=>q.domain===d&&q.topic===t?i:-1).filter(i=>i>=0);const sampled=shuffled(pool).slice(0,3);topicPractice={domain:d,topic:t,ids:sampled,at:0,answers:[],orders:sampled.map(()=>shuffled([0,1,2,3]))};page='topicPractice';render()}
let topicPractice=null;
function topicPracticePage(){
 if(!topicPractice){navTo('pretests');return}
 const p=topicPractice,q=BANK[p.ids[p.at]],picked=p.answers[p.at],show=p.show===true,order=p.orders[p.at];
 layout('<span class="eyebrow">Concept rehearsal · '+(p.at+1)+' of '+p.ids.length+'</span><h1>'+esc(X.lessonSections[q.domain][q.topic].title)+'</h1><p>Work through variations of the same decision. Explain the principle before selecting an answer.</p><div class="card"><h2>'+esc(q.stem)+'</h2><div class="options">'+order.map((idx,i)=>'<button class="option '+(picked===idx?'selected':'')+(show&&idx===q.answer?' correct':'')+'" '+(show?'disabled':'')+' '+actionAttrs('pickTopicAnswer', [idx])+'>'+String.fromCharCode(65+i)+'. '+esc(q.choices[idx])+'</button>').join('')+'</div>'+(show?'<div class="explain">'+esc(q.explanation)+'</div>':'')+'<div class="actions">'+(show?button(p.at===p.ids.length-1?'Finish practice':'Next question', 'nextTopicQuestion'):button('Check answer', 'checkTopicAnswer'))+'</div></div>');
}
function pickTopicAnswer(i){if(topicPractice.show)return;topicPractice.answers[topicPractice.at]=i;render()}
function checkTopicAnswer(){if(topicPractice.answers[topicPractice.at]===undefined){alert('Choose an answer.');return}topicPractice.show=true;render()}
function nextTopicQuestion(){if(topicPractice.at===topicPractice.ids.length-1){openStudyUnit(topicPractice.domain,topicPractice.topic);return}topicPractice.at++;topicPractice.show=false;render()}
function reviewPretestAnswers(d){if(!state.pretests[d])return;pretestDomain=d;page='pretestReview';render();finishCourseNavigation()}
function pretestReviewPage(){
 const r=state.pretests[pretestDomain];if(!r){navTo('pretests');return}
 layout('<span class="eyebrow">Assessment answer review</span><h1>Domain '+(pretestDomain+1)+' · Review all '+r.total+' answers</h1><p>Review the decision and its underlying principle. These are explanations of the intended answers, not official ISC2 answer rationales.</p>'+r.ids.map((id,i)=>{const q=BANK[id],ok=r.answers[i]===q.answer;return '<div class="card" style="margin-bottom:12px"><span class="tag">Question '+(i+1)+' · '+(ok?'Correct':'Needs review')+'</span><h3 style="margin-top:12px">'+esc(q.stem)+'</h3><p><strong>Your answer:</strong> '+esc(q.choices[r.answers[i]]||'No answer')+'</p><p><strong>Intended answer:</strong> '+esc(q.choices[q.answer])+'</p><div class="explain">'+esc(q.explanation)+'</div></div>'}).join('')+button('Back to study priorities', 'showPretestResults', [pretestDomain]));
}
const oldLesson=lesson;
lesson=function(){oldLesson();const study=STUDY[domain];const priority=state.pretests[domain];const units=study.units.map((u,i)=>({u,i,score:priority?.topics?.[i],done:!!state.lessonDone[domain+'-'+i]})).sort((a,b)=>priority?(a.score?.total?(a.score.right/a.score.total):1)-(b.score?.total?(b.score.right/b.score.total):1):a.i-b.i);const panel=document.createElement('section');panel.className='card section';panel.innerHTML='<span class="eyebrow">Structured curriculum · '+study.units.length+' lessons</span><h2>Your learning sequence</h2><p>'+esc(study.overview)+'</p><div class="actions">'+button('Practical lab', 'openLab', [domain])+button('Read foundational chapter', 'openChapter', [domain])+button(priority?'Retake domain pretest':'Start domain pretest', 'startPretest', [domain])+'</div>'+units.map(x=>'<div class="lesson"><span class="eyebrow">Lesson '+(x.i+1)+(x.score?' · Pretest '+x.score.right+'/'+x.score.total:'')+(x.done?' · ✓ Completed':'')+'</span><h3>'+esc(x.u.title)+'</h3><p>'+esc(x.u.concept)+'</p>'+button('Open complete lesson', 'openStudyUnit', [domain, x.i], true)+'</div>').join('');document.getElementById('app').appendChild(panel);const d=X.lessonSections[domain]||[];const el=document.createElement('section');el.className='card section';el.innerHTML='<span class="eyebrow">Applied decision lab</span><h2>'+d.length+' guided workplace scenarios</h2><p>Choose your answer before opening the suggested decision and explanation.</p>'+d.map((x,i)=>'<div class="lesson"><h3>'+(i+1)+'. '+esc(x.title)+'</h3><p>'+esc(x.scenario)+'</p><details><summary>Show best decision and reasoning</summary><p><strong>'+esc(x.decision)+'</strong></p><p>'+esc(x.body)+'</p></details></div>').join('');document.getElementById('app').appendChild(el)};
setInterval(tickMock, 1000);

function changeStudyPlan(value) {
  const days = Number(value);
  if (![14, 28, 42].includes(days)) return;
  state.plan = days;
  save();
  render();
}
function setFlashMode(value) {
  flashMode = value;
  flashIndex = 0;
  flashBack = false;
  flashPage();
}
function flipFlash() {
  flashBack = !flashBack;
  flashPage();
  document.querySelector('.flashcard')?.focus();
}
function toggleAdvanced(d, i) {
  const key = d + '-' + i;
  state.advancedDone[key] = !state.advancedDone[key];
  save();
  render();
}
function toggleLab(d) {
  state.labDone[d] = !state.labDone[d];
  save();
  render();
}
function previousPretest() {
  if (pretestAt > 0) pretestAt--;
  render();
}

const state = loadCourseProgress({
  questions: QUESTIONS,
  bank: BANK,
  lessonCounts: STUDY.map(domain => domain.units.length),
  advancedCounts: ADVANCED.map(modules => modules.length),
  blockCounts: STUDY_BLOCKS.map(block => block.tasks.length),
  labCount: LABS.length,
  flashCount: X.flash.length,
});
