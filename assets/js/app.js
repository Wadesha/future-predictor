/**
 * App - Main application logic
 */
const App = {
  scenarios: [],
  currentTopic: null,

  async init() {
    try {
      this.scenarios = await DataLoader.loadScenarios();
      this.renderHome();
      Interaction.initNav();
      this.initSearch();
    } catch (e) {
      console.error('Init error:', e);
    }
  },

  initSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        const q = input.value.trim().toLowerCase();
        const found = this.scenarios.find(s =>
          s.name.includes(q) || s.description.includes(q)
        );
        if (found) {
          App.renderScenarios(found.id);
          Interaction.showPage('scenarios');
        } else {
          Interaction.showToast('未找到匹配的场景，试试其他关键词');
        }
      }
    });
  },

  /* ===== Home Page ===== */
  async renderHome() {
    const container = document.getElementById('homeContent');
    container.innerHTML = '';

    // Hero
    const hero = document.createElement('div');
    hero.className = 'hero-urgent';
    hero.innerHTML = `
      <h1>未来正在 <span>加速到来</span></h1>
      <p>AI失业潮 · 物价崩还是涨 · 战争离你多远 · 灾难来了你能活几天</p>
      <button class="cta-btn" onclick="document.getElementById('survivalQuiz').scrollIntoView({behavior:'smooth'})">
        ⚡ 先测测你的生存指数
      </button>
    `;
    container.appendChild(hero);

    // Threat Dashboard
    const threatTitle = document.createElement('h2');
    threatTitle.className = 'section-title';
    threatTitle.innerHTML = '🔴 全球风险实时面板';
    container.appendChild(threatTitle);

    const dashboard = document.createElement('div');
    dashboard.className = 'threat-dashboard';
    const threats = [
      { icon: '🤖', name: 'AI失业潮', level: 'critical', prob: '55%', label: '高危' },
      { icon: '💸', name: '滞胀风险', level: 'high', prob: '45%', label: '升高' },
      { icon: '⚔️', name: '台海冲突', level: 'high', prob: '30%', label: '升高' },
      { icon: '📦', name: '供应链断裂', level: 'high', prob: '70%', label: '升高' },
      { icon: '🌐', name: '新冷战', level: 'moderate', prob: '15%', label: '中等' },
      { icon: '🏚️', name: '房价下跌', level: 'moderate', prob: '45%', label: '中等' }
    ];
    threats.forEach(t => {
      const card = document.createElement('div');
      card.className = 'threat-card';
      card.dataset.level = t.level;
      card.innerHTML = `
        <div class="threat-icon">${t.icon}</div>
        <div class="threat-name">${t.name}</div>
        <span class="threat-level">${t.label}</span>
        <div class="threat-prob">${t.prob}</div>
      `;
      dashboard.appendChild(card);
    });
    container.appendChild(dashboard);

    // Survival Quiz
    this.renderSurvivalQuiz(container);

    // Scenarios
    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'section-title';
    sectionTitle.innerHTML = '📍 选择一个场景开始探索';
    container.appendChild(sectionTitle);

    const grid = document.createElement('div');
    grid.className = 'scenario-grid';
    this.scenarios.forEach(s => {
      const card = document.createElement('div');
      card.className = 'scenario-card';
      card.innerHTML = `
        <div class="icon">${s.icon}</div>
        <div class="name">${s.name}</div>
        <div class="desc">${s.description}</div>
      `;
      card.addEventListener('click', () => {
        App.renderScenarios(s.id);
        Interaction.showPage('scenarios');
      });
      grid.appendChild(card);
    });
    container.appendChild(grid);

    // Hot topics
    try {
      const hotTopics = await DataLoader.loadHotTopics();
      const hotTitle = document.createElement('h2');
      hotTitle.className = 'section-title';
      hotTitle.innerHTML = '🔥 今日热预测';
      container.appendChild(hotTitle);

      const topicList = document.createElement('div');
      topicList.className = 'topic-list';
      hotTopics.forEach(t => {
        const card = document.createElement('div');
        card.className = 'topic-card';
        const scenario = this.scenarios.find(s => s.id === t.scenario);
        card.innerHTML = `
          <div class="left">
            <div class="title">${t.title}</div>
            <div class="meta">
              <span>${scenario ? scenario.icon + ' ' + scenario.name : ''}</span>
              <span>📊 ${t.probability}% 概率</span>
              <span>👥 ${t.participants} 人参与</span>
              <span>🕐 ${t.updated}</span>
            </div>
          </div>
          <span style="color:var(--text-muted)">→</span>
        `;
        card.addEventListener('click', () => App.renderTopic(t.id));
        topicList.appendChild(card);
      });
      container.appendChild(topicList);
    } catch {}
  },

  /* ===== Survival Quiz ===== */
  renderSurvivalQuiz(container) {
    const quizDiv = document.createElement('div');
    quizDiv.className = 'survival-quiz';
    quizDiv.id = 'survivalQuiz';
    quizDiv.innerHTML = `
      <h2>🧪 生存准备指数测试</h2>
      <p class="subtitle">5个问题，测出你能在极端场景中撑多久。别骗自己，如实回答。</p>
      <div id="quizQuestions"></div>
      <div class="quiz-result" id="quizResult"></div>
    `;
    container.appendChild(quizDiv);

    const questions = [
      {
        id: 'q1',
        text: '你家有几天的不易腐食物储备（米面、罐头、压缩饼干）？',
        options: [
          { label: '3天以内', score: 0 },
          { label: '3-7天', score: 1 },
          { label: '1-2周', score: 2 },
          { label: '2周以上', score: 3 }
        ]
      },
      {
        id: 'q2',
        text: '如果现在断水，你知道家附近哪里有自然水源吗？',
        options: [
          { label: '完全不知道', score: 0 },
          { label: '大概知道方向', score: 1 },
          { label: '知道具体位置', score: 2 },
          { label: '知道位置+会净化', score: 3 }
        ]
      },
      {
        id: 'q3',
        text: '你家有应急物资吗？（手电、收音机、急救包、现金）',
        options: [
          { label: '什么都没有', score: 0 },
          { label: '有手电和电池', score: 1 },
          { label: '有手电+急救包', score: 2 },
          { label: '全套应急包+现金', score: 3 }
        ]
      },
      {
        id: 'q4',
        text: '你有慢性病需要长期服药吗？备用药量够多久？',
        options: [
          { label: '需要药但没备用', score: 0 },
          { label: '够1-2周', score: 1 },
          { label: '够1个月', score: 2 },
          { label: '够3个月以上/不需要药', score: 3 }
        ]
      },
      {
        id: 'q5',
        text: '你和家人约定过灾难集合点吗？有逃生路线吗？',
        options: [
          { label: '从没讨论过', score: 0 },
          { label: '口头提过', score: 1 },
          { label: '有1个集合点', score: 2 },
          { label: '有3个集合点+路线', score: 3 }
        ]
      }
    ];

    const answers = {};
    const questionsContainer = quizDiv.querySelector('#quizQuestions');

    questions.forEach((q, qi) => {
      const qDiv = document.createElement('div');
      qDiv.className = 'quiz-question';
      qDiv.innerHTML = `
        <div class="q-text"><span class="q-num">${qi + 1}</span>${q.text}</div>
        <div class="quiz-options">
          ${q.options.map((opt, oi) => `
            <div class="quiz-option" data-q="${qi}" data-score="${opt.score}">
              <span>${opt.label}</span>
              <span class="check">✓</span>
            </div>
          `).join('')}
        </div>
      `;

      qDiv.querySelectorAll('.quiz-option').forEach(opt => {
        opt.addEventListener('click', () => {
          const qIndex = parseInt(opt.dataset.q);
          const score = parseInt(opt.dataset.score);
          answers[qIndex] = score;

          qDiv.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');

          this.updateQuizResult(answers, questions.length);
        });
      });

      questionsContainer.appendChild(qDiv);
    });
  },

  updateQuizResult(answers, totalQs) {
    const answered = Object.keys(answers).length;
    if (answered < totalQs) return;

    const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
    const maxScore = totalQs * 3;
    const percent = Math.round((totalScore / maxScore) * 100);

    let days, desc, tips;
    if (totalScore <= 4) {
      days = '3-5天';
      desc = '极度危险。你的准备几乎为零。';
      tips = [
        '这周末买14天的水和食物（成本不到500块）',
        '打开地图标记家附近3个水源',
        '买一个手摇收音机和急救包',
        '如果有慢性病，多开1个月药量',
        '今晚就和家人讨论灾难集合点'
      ];
    } else if (totalScore <= 8) {
      days = '7-14天';
      desc = '勉强能活，但很被动。';
      tips = [
        '食物和水储备加倍到2周以上',
        '增加现金储备（至少5000元小面额纸币）',
        '学习基础净水技能',
        '准备一个安全房间和逃生路线'
      ];
    } else if (totalScore <= 12) {
      days = '2-4周';
      desc = '有基本准备，但还有缺口。';
      tips = [
        '储备扩展到1个月',
        '和邻居建立互助网络',
        '准备自卫和加固住所的工具',
        '下载离线地图+打印纸质地图'
      ];
    } else {
      days = '1个月+';
      desc = '你的准备超过95%的人。';
      tips = [
        '考虑地理对冲：在不同地点存放物资',
        '学习野外生存和急救技能',
        '帮助身边的人做好准备——灾难中独活很难',
        '定期检查和轮换储备物资'
      ];
    }

    const resultDiv = document.getElementById('quizResult');
    resultDiv.classList.add('show');
    resultDiv.innerHTML = `
      <div class="score-label">你的生存指数</div>
      <div class="score-value">${percent}<span class="score-unit">/100</span></div>
      <div class="score-desc">预计能撑：${days}　${desc}</div>
      <ul class="score-tips">
        ${tips.map(t => `<li>${t}</li>`).join('')}
      </ul>
      <button class="quiz-retake-btn" onclick="location.reload()">重新测试</button>
    `;
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  /* ===== Scenarios Page ===== */
  renderScenarios(activeScenarioId) {
    const container = document.getElementById('scenariosContent');
    container.innerHTML = '';

    const backBtn = document.createElement('button');
    backBtn.className = 'back-link';
    backBtn.innerHTML = '← 返回首页';
    backBtn.addEventListener('click', () => {
      document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
      document.querySelector('.nav-links a[data-page="home"]')?.classList.add('active');
      App.renderHome();
      Interaction.showPage('home');
    });
    container.appendChild(backBtn);

    const title = document.createElement('h2');
    title.className = 'section-title';
    let activeScenario = null;

    if (activeScenarioId) {
      activeScenario = this.scenarios.find(s => s.id === activeScenarioId);
      title.innerHTML = `${activeScenario ? activeScenario.icon + ' ' : ''} 场景筛选`;
      container.appendChild(title);

      const filterChips = document.createElement('div');
      filterChips.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin:12px 0;';
      ['全部', '天气出行', '科技趋势', '投资理财', '健康生活'].forEach((f, i) => {
        const chip = document.createElement('span');
        chip.style.cssText = 'padding:6px 14px;border-radius:20px;font-size:0.813rem;background:#f1f5f9;color:#64748b;cursor:pointer;' + (i === 0 ? 'background:#EFF6FF;color:#3B82F6;font-weight:600;' : '');
        chip.textContent = f;
        filterChips.appendChild(chip);
      });
      container.appendChild(filterChips);
    } else {
      title.textContent = '🗂️ 所有场景';
      container.appendChild(title);
    }

    const grid = document.createElement('div');
    grid.className = 'scenario-grid';

    const scenariosToRender = activeScenarioId
      ? this.scenarios.filter(s => s.id === activeScenarioId)
      : this.scenarios;

    scenariosToRender.forEach(s => {
      const card = document.createElement('div');
      card.className = 'scenario-card';
      card.style.borderColor = activeScenarioId ? s.color : undefined;
      card.innerHTML = `
        <div class="icon">${s.icon}</div>
        <div class="name">${s.name}</div>
        <div class="desc">${s.description}</div>
      `;
      card.addEventListener('click', () => this.showTopicList(s));
      grid.appendChild(card);
    });
    container.appendChild(grid);

    if (activeScenarioId) {
      const topicSection = document.createElement('div');
      topicSection.id = 'scenarioTopicList';
      container.appendChild(topicSection);
      this.showTopicList(activeScenario || scenariosToRender[0]);
    }
  },

  async showTopicList(scenario) {
    const container = document.getElementById('scenarioTopicList') ||
      document.getElementById('scenariosContent');
    const listDiv = document.getElementById('scenarioTopicList') ||
      (() => {
        const div = document.createElement('div');
        div.id = 'scenarioTopicList';
        container.appendChild(div);
        return div;
      })();

    listDiv.innerHTML = '';

    const title = document.createElement('h3');
    title.className = 'section-title';
    title.textContent = `${scenario.icon} ${scenario.name} 话题`;
    listDiv.appendChild(title);

    // Load topics for this scenario - show all topics or filter by scenario
    const topicList = document.createElement('div');
    topicList.className = 'topic-list';

    const topicMap = {
      'tech': 'ai-unemployment-consumption',
      'finance': 'inflation-or-deflation',
      'society': 'war-and-civilians'
    };
    // Disaster topic shows for multiple scenarios
    const disasterScenarios = ['society', 'weather', 'health'];

    try {
      let topics = [];
      const topicId = topicMap[scenario.id];
      if (topicId) {
        const t = await DataLoader.loadTopic(topicId);
        topics.push(t);
      }
      // Add disaster topic for relevant scenarios
      if (disasterScenarios.includes(scenario.id)) {
        const dt = await DataLoader.loadTopic('extreme-disaster-survival');
        topics.push(dt);
      }

      if (topics.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = `<div class="icon">📭</div><div class="text">该场景下暂时没有话题，敬请期待</div>`;
        listDiv.appendChild(empty);
        return;
      }

      topics.forEach(t => {
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.innerHTML = `
          <div class="left">
            <div class="title">${t.title}</div>
            <div class="meta">
              <span>👥 ${t.participants || t.predictions[0]?.userChoiceCount || 0} 人参与</span>
              <span>🕐 ${new Date(t.updated).toLocaleDateString()} 更新</span>
              <span>🏷️ ${t.tags.slice(0, 3).join(' · ')}</span>
            </div>
          </div>
          <span style="color:var(--text-muted)">→</span>
        `;
        card.addEventListener('click', () => this.renderTopic(t.id));
        topicList.appendChild(card);
      });
    } catch {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = `<div class="icon">⚠️</div><div class="text">加载失败，请稍后再试</div>`;
      listDiv.appendChild(empty);
    }

    listDiv.appendChild(topicList);
  },

  /* ===== Topic Page ===== */
  async renderTopic(topicId) {
    try {
      const topic = await DataLoader.loadTopic(topicId);
      this.currentTopic = topic;
      const container = document.getElementById('topicContent');
      container.innerHTML = '';

      const scenario = this.scenarios.find(s => s.id === topic.scenario);

      // Header
      const header = document.createElement('div');
      header.className = 'prediction-header';
      header.innerHTML = `
        <button class="back-link" id="topicBackBtn">← 返回</button>
        <h1>${topic.title}</h1>
        <div class="meta">
          <span>${scenario ? scenario.icon + ' ' + scenario.name : ''}</span>
          <span>👥 ${topic.participants} 人参与</span>
          <span>🕐 ${new Date(topic.updated).toLocaleDateString()} 更新</span>
          <span>🏷️ ${topic.tags.join(' · ')}</span>
        </div>
        ${topic.description ? `<p style="color:var(--text-secondary);font-size:0.875rem;margin-top:8px;">${topic.description}</p>` : ''}
      `;
      container.appendChild(header);

      // Deep dive path indicator
      const pathDiv = document.createElement('div');
      pathDiv.className = 'deep-path';
      pathDiv.id = 'deepPath';
      pathDiv.innerHTML = `<span class="path-item">${topic.title}</span>`;
      container.appendChild(pathDiv);

      // Layer 1: Branch cards
      const layerSection = document.createElement('div');
      layerSection.id = 'layerContainer';
      container.appendChild(layerSection);

      // Render first layer
      this.renderLayer(topic.predictions, topic.id, 1, topic);

      // Observation section
      const obsSection = document.createElement('div');
      obsSection.className = 'observation-section';
      obsSection.innerHTML = `
        <h3>✍️ 我的观察</h3>
        <div class="obs-input-area">
          <textarea id="obsInput" placeholder="补充你的观察或判断…"></textarea>
          <div class="obs-controls">
            <select id="obsBranch">
              <option value="">选择关联分支</option>
              ${topic.predictions.map(p => `<option value="${p.id}">${p.branchName}</option>`).join('')}
            </select>
            <select id="obsType">
              <option value="fact">事实补充</option>
              <option value="opinion">主观判断</option>
              <option value="question">疑问提出</option>
            </select>
            <button class="publish-btn" id="publishObs">发布观察</button>
          </div>
        </div>
        <div id="obsList" class="obs-list"></div>
      `;
      container.appendChild(obsSection);

      this.renderObservations(topic);

      document.getElementById('publishObs').addEventListener('click', () => {
        const input = document.getElementById('obsInput');
        const branch = document.getElementById('obsBranch');
        const type = document.getElementById('obsType');
        const content = input.value.trim();
        if (!content) { Interaction.showToast('请输入观察内容'); return; }

        const obs = {
          id: 'u-' + Date.now(),
          author: '我',
          content,
          type: type.value,
          timestamp: new Date().toISOString(),
          likes: 0,
          relatedPrediction: branch.value || undefined
        };
        Storage.addObservation(obs);
        this.renderObservations(topic);
        input.value = '';
        Interaction.showToast('观察已发布');
      });

      document.getElementById('topicBackBtn').addEventListener('click', () => {
        Interaction.showPage('home');
        App.renderHome();
      });

      Interaction.showPage('topic');
    } catch (e) {
      console.error('Topic load error:', e);
      Interaction.showToast('加载话题失败');
    }
  },

  /* ===== Render a layer of predictions (recursive) ===== */
  renderLayer(predictions, parentId, layerNum, topic) {
    const container = document.getElementById('layerContainer');
    const userChoices = Storage.getChoices();
    const selectedId = userChoices[parentId];

    // Layer title
    const layerTitle = document.createElement('div');
    layerTitle.style.cssText = 'margin:16px 0 8px;display:flex;align-items:center;gap:8px;';
    layerTitle.innerHTML = `<span style="font-size:0.75rem;font-weight:700;color:var(--primary);background:var(--primary-light);padding:4px 10px;border-radius:10px;">第 ${layerNum} 层</span><span style="font-size:0.875rem;color:var(--text-secondary);">选择你倾向的分支，继续深挖</span>`;
    container.appendChild(layerTitle);

    // Branch cards
    predictions.forEach(p => {
      const isSelected = p.id === selectedId;
      const probClass = p.probability >= 60 ? 'prob-high' : p.probability >= 30 ? 'prob-mid' : 'prob-low';

      const card = document.createElement('div');
      card.className = 'branch-card' + (isSelected ? ' selected' : '');
      card.id = 'card-' + p.id;

      card.innerHTML = `
        <div class="branch-header">
          <div class="branch-name">${p.branchName}</div>
          <div class="probability ${probClass}">${p.probability}%</div>
        </div>
        <div class="conclusion">${p.conclusion}</div>
        <ul class="evidence-list">
          ${(p.evidence || []).slice(0, 3).map(e => `<li>${e.title}</li>`).join('')}
        </ul>
        ${p.impact ? `<div class="impact">📌 ${p.impact}</div>` : ''}
        <button class="select-btn ${isSelected ? 'selected' : 'select'}" data-prediction-id="${p.id}">
          ${isSelected ? '✓ 已选择此分支' : '选择此分支'}
        </button>
        <div class="user-count">👥 ${p.userChoiceCount || 0} 人已选择</div>
      `;

      card.querySelector('.select-btn').addEventListener('click', () => {
        this.selectBranch(parentId, p.id);
        this.updatePath(topic, p, layerNum);

        // Remove deeper layers
        const deeperLayers = container.querySelectorAll(`[data-layer="${layerNum + 1}"]`);
        deeperLayers.forEach(el => el.remove());

        // Show reasoning for this branch
        this.showReasoning(p);

        // Show sub-questions if any
        if (p.subQuestions && p.subQuestions.length > 0) {
          this.renderSubQuestions(p.subQuestions, p.id, layerNum + 1, topic, p);
        }
      });

      // Auto-expand if already selected
      if (isSelected) {
        setTimeout(() => {
          this.updatePath(topic, p, layerNum);
          this.showReasoning(p);
          if (p.subQuestions && p.subQuestions.length > 0) {
            this.renderSubQuestions(p.subQuestions, p.id, layerNum + 1, topic, p);
          }
        }, 0);
      }

      container.appendChild(card);
    });
  },

  /* ===== Render sub-questions (next layer deep dive) ===== */
  renderSubQuestions(subQuestions, parentId, layerNum, topic, parentPrediction) {
    const container = document.getElementById('layerContainer');

    subQuestions.forEach(sq => {
      const sqDiv = document.createElement('div');
      sqDiv.className = 'sub-question-container';
      sqDiv.dataset.layer = layerNum;
      sqDiv.id = 'subq-' + sq.id;

      sqDiv.innerHTML = `
        <div class="sub-question-header">
          <span class="layer-badge">第 ${layerNum} 层</span>
          <span class="title">🔍 ${sq.title}</span>
        </div>
        <div class="sub-question-body">
          ${sq.description ? `<div class="sub-question-desc">${sq.description}</div>` : ''}
          <div class="sub-branch-grid" id="sub-branches-${sq.id}"></div>
        </div>
      `;

      container.appendChild(sqDiv);

      const subGrid = sqDiv.querySelector(`#sub-branches-${sq.id}`);
      const userChoices = Storage.getChoices();
      const selectedSubId = userChoices[sq.id];

      sq.predictions.forEach(sp => {
        const isSubSelected = sp.id === selectedSubId;
        const probClass = sp.probability >= 60 ? 'prob-high' : sp.probability >= 30 ? 'prob-mid' : 'prob-low';

        const subCard = document.createElement('div');
        subCard.className = 'sub-branch-card' + (isSubSelected ? ' selected' : '');

        subCard.innerHTML = `
          <div class="branch-header">
            <div class="branch-name">${sp.branchName}</div>
            <div class="probability ${probClass}">${sp.probability}%</div>
          </div>
          <div class="conclusion">${sp.conclusion}</div>
          ${sp.impact ? `<div class="impact">📌 ${sp.impact}</div>` : ''}
          <button class="select-btn ${isSubSelected ? 'selected' : 'select'}" data-sub-prediction-id="${sp.id}" data-sub-question-id="${sq.id}">
            ${isSubSelected ? '✓ 已选择' : '选择此方向'}
          </button>
        `;

        subCard.querySelector('.select-btn').addEventListener('click', () => {
          // Save choice
          Storage.saveChoice(sq.id, sp.id);
          Interaction.showToast('已选择，继续深挖');

          // Update UI
          subGrid.querySelectorAll('.sub-branch-card').forEach(c => {
            c.classList.remove('selected');
            const btn = c.querySelector('.select-btn');
            btn.className = 'select-btn select';
            btn.textContent = '选择此方向';
          });
          subCard.classList.add('selected');
          subCard.querySelector('.select-btn').className = 'select-btn selected';
          subCard.querySelector('.select-btn').textContent = '✓ 已选择';

          // Update path
          this.updatePath(topic, sp, layerNum, sq.title);

          // Remove deeper layers
          const deeper = container.querySelectorAll(`[data-layer="${layerNum + 1}"]`);
          deeper.forEach(el => el.remove());

          // Show reasoning
          if (sp.reasoning) {
            this.showReasoning(sp);
          }

          // Recurse: show sub-questions of this sub-prediction
          if (sp.subQuestions && sp.subQuestions.length > 0) {
            this.renderSubQuestions(sp.subQuestions, sp.id, layerNum + 1, topic, sp);
          }
        });

        // Auto-expand if already selected
        if (isSubSelected) {
          setTimeout(() => {
            this.updatePath(topic, sp, layerNum, sq.title);
            if (sp.reasoning) this.showReasoning(sp);
            if (sp.subQuestions && sp.subQuestions.length > 0) {
              this.renderSubQuestions(sp.subQuestions, sp.id, layerNum + 1, topic, sp);
            }
          }, 0);
        }

        subGrid.appendChild(subCard);
      });
    });
  },

  /* ===== Show reasoning section ===== */
  showReasoning(prediction) {
    let reasoningEl = document.getElementById('reasoningSection');
    if (!reasoningEl) {
      reasoningEl = document.createElement('div');
      reasoningEl.id = 'reasoningSection';
      reasoningEl.className = 'reasoning-section';
      const container = document.getElementById('layerContainer');
      container.appendChild(reasoningEl);
    }

    if (!prediction.reasoning || prediction.reasoning.length === 0) {
      reasoningEl.style.display = 'none';
      return;
    }

    reasoningEl.style.display = 'block';
    reasoningEl.innerHTML = `
      <h3>🔍 推理链路 <span style="font-weight:400;font-size:0.813rem;color:var(--text-muted)">（${prediction.branchName}）</span></h3>
      ${prediction.reasoning.map(r => `
        <div class="reasoning-step">
          <div class="step-num">${r.step}</div>
          <div class="step-content">
            <div class="step-desc">${r.description}</div>
            <div class="step-ref">📊 ${r.dataRef}</div>
          </div>
        </div>
      `).join('')}
    `;
  },

  /* ===== Update deep dive path ===== */
  updatePath(topic, prediction, layerNum, subQuestionTitle) {
    const pathDiv = document.getElementById('deepPath');
    if (!pathDiv) return;

    // Rebuild path up to current layer
    const choices = Storage.getChoices();
    let pathHTML = `<span class="path-item">${topic.title}</span>`;

    // Walk through layers to build path
    topic.predictions.forEach(p => {
      if (choices[topic.id] === p.id) {
        pathHTML += `<span class="path-arrow">→</span><span class="path-item">${p.branchName}</span>`;
        if (p.subQuestions) {
          p.subQuestions.forEach(sq => {
            if (choices[sq.id]) {
              pathHTML += `<span class="path-arrow">→</span><span class="path-item">${sq.title}</span>`;
              sq.predictions.forEach(sp => {
                if (choices[sq.id] === sp.id) {
                  pathHTML += `<span class="path-arrow">→</span><span class="path-item">${sp.branchName}</span>`;
                  if (sp.subQuestions) {
                    sp.subQuestions.forEach(sq2 => {
                      if (choices[sq2.id]) {
                        pathHTML += `<span class="path-arrow">→</span><span class="path-item">${sq2.title}</span>`;
                        sq2.predictions.forEach(sp2 => {
                          if (choices[sq2.id] === sp2.id) {
                            pathHTML += `<span class="path-arrow">→</span><span class="path-item">${sp2.branchName}</span>`;
                          }
                        });
                      }
                    });
                  }
                }
              });
            }
          });
        }
      }
    });

    pathDiv.innerHTML = pathHTML;
  },

  renderObservations(topic) {
    const obsList = document.getElementById('obsList');
    if (!obsList) return;

    const allObservations = [
      ...Storage.getObservations().filter(o => {
        // Show observations related to this topic or all user observations
        const relatedToTopic = topic.predictions.some(p => p.id === o.relatedPrediction);
        return relatedToTopic || !o.relatedPrediction;
      }),
      ...topic.observations
    ];

    if (allObservations.length === 0) {
      obsList.innerHTML = '<div class="empty-state" style="padding:20px"><div class="text">还没有观察，来发表第一条吧</div></div>';
      return;
    }

    obsList.innerHTML = allObservations.map(o => `
      <div class="obs-item">
        <div class="obs-header">
          <span class="obs-author">${o.author}</span>
          <span class="obs-type obs-type-${o.type}">${o.type === 'fact' ? '事实' : o.type === 'opinion' ? '观点' : '疑问'}</span>
        </div>
        <div class="obs-content">${o.content}</div>
        <div class="obs-footer">
          <span>🕐 ${new Date(o.timestamp).toLocaleDateString()}</span>
          ${o.relatedPrediction ? `<span>🔗 ${topic.predictions.find(p => p.id === o.relatedPrediction)?.branchName || ''}</span>` : ''}
          <span class="obs-likes" onclick="Interaction.showToast('👍 已点赞')">❤️ ${o.likes}</span>
        </div>
      </div>
    `).join('');
  },

  selectBranch(topicId, predictionId) {
    Storage.saveChoice(topicId, predictionId);
    Interaction.showToast('已选择该分支，预测结果将纳入你的个人评分');

    // Update UI
    document.querySelectorAll('.branch-card').forEach(card => {
      card.classList.remove('selected');
      const btn = card.querySelector('.select-btn');
      if (btn.dataset.predictionId === predictionId) {
        card.classList.add('selected');
        btn.className = 'select-btn selected';
        btn.textContent = '✓ 已选择此分支';
      } else {
        btn.className = 'select-btn select';
        btn.textContent = '选择此分支';
      }
    });
  },

  /* ===== Profile Page ===== */
  renderProfile() {
    const container = document.getElementById('profileContent');
    const score = Storage.getScore();
    const choices = Storage.getChoices();
    const userObs = Storage.getObservations();

    container.innerHTML = `
      <div class="profile-header">
        <div class="avatar">🧑</div>
        <div class="name">${Storage.getProfile().name}</div>
        <div class="score">
          <div class="score-item">
            <div class="num">${score.rate}</div>
            <div class="label">准确率</div>
          </div>
          <div class="score-item">
            <div class="num">${score.correct}</div>
            <div class="label">预测正确</div>
          </div>
          <div class="score-item">
            <div class="num">${score.total}</div>
            <div class="label">总预测</div>
          </div>
          <div class="score-item">
            <div class="num">${Object.keys(choices).length}</div>
            <div class="label">参与话题</div>
          </div>
        </div>
      </div>

      <div class="record-tabs">
        <span class="record-tab active">我参与的</span>
        <span class="record-tab">我的观察 (${userObs.length})</span>
      </div>

      <div id="profileRecords" class="record-list"></div>
    `;

    const recordsDiv = document.getElementById('profileRecords');

    if (Object.keys(choices).length === 0) {
      recordsDiv.innerHTML = '<div class="empty-state"><div class="icon">📋</div><div class="text">还没有参与任何预测，去首页探索吧</div></div>';
      return;
    }

    // Show user's choices
    const results = Storage.getResults();
    recordsDiv.innerHTML = Object.entries(choices).map(([topicId, choice]) => {
      const result = results[topicId];
      const resultLabel = result === undefined ? '待验证' : result.correct ? '✓ 正确' : '✗ 错误';
      const resultClass = result === undefined ? 'result-pending' : result.correct ? 'result-correct' : 'result-wrong';
      return `
        <div class="record-item">
          <div class="record-title">${({
            'ai-unemployment-consumption': '🚀 AI引发大规模失业后，消费会崩盘吗？',
            'inflation-or-deflation': '💰 未来3年：物价会飞涨还是通缩崩盘？',
            'war-and-civilians': '🌍 大规模战争离普通人有多远？',
            'which-jobs-safe': '🔍 哪些岗位最先被冲击？',
            'chain-reaction': '⚡ 消费崩盘的链式反应',
            'can-ubi-save': '💵 UBI能救命吗？',
            'what-new-jobs': '🆕 AI时代会出现什么新岗位？',
            'how-to-survive-transition': '🛡️ 怎么扛过动荡期？',
            'what-to-hold': '📊 滞胀环境下该持有什么？',
            'gold-vs-crypto': '🥇 黄金还是比特币？',
            'japan-repeat': '🇨🇳 中国会重演日本失去的三十年吗？',
            'which-currency-dies-first': '💱 哪个货币先出问题？',
            'economic-war-impact': '💹 经济战对钱包的影响',
            'what-happens-economy': '📉 台海冲突后全球经济会怎样？',
            'civilian-survival': '🎒 普通人该准备什么？',
            'which-side': '🤔 该选哪一边？',
            'extreme-disaster-survival': '🆘 如果极端灾难明天发生，你能活几天？',
            'water-crisis': '💧 断水了你怎么活？',
            'food-collapse': '🍽️ 超市空了你能撑几天？',
            'no-communication': '📱 手机没信号了你怎么办？',
            'purify-water': '🚰 4种净水方法你会几种？',
            'medicine-shortage': '💊 你的药断了怎么办？',
            'self-defense': '🛡️ 灾难中怎么保护自己？'
          })[topicId] || topicId}</div>
          <div>
            <span class="record-result ${resultClass}">${resultLabel}</span>
          </div>
        </div>
      `;
    }).join('');
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());