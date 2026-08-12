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

    const hero = document.createElement('div');
    hero.className = 'hero';
    hero.innerHTML = `
      <h1>探索 <span>未来</span> 的可能性</h1>
      <p>多层级深挖：每个话题不是给你一个结论，而是让你选择判断、一层层往深挖</p>
    `;
    container.appendChild(hero);

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

    if (activeScenarioId) {
      const activeScenario = this.scenarios.find(s => s.id === activeScenarioId);
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

      const grid = document.createElement('div');
      grid.className = 'scenario-grid';
      this.scenarios.filter(s => s.id === activeScenarioId).forEach(s => {
        const card = document.createElement('div');
        card.className = 'scenario-card';
        card.style.borderColor = s.color;
        card.innerHTML = `
          <div class="icon">${s.icon}</div>
          <div class="name">${s.name}</div>
          <div class="desc">${s.description}</div>
        `;
        card.addEventListener('click', () => this.showTopicList(s));
        grid.appendChild(card);
      });
      container.appendChild(grid);

      const topicSection = document.createElement('div');
      topicSection.id = 'scenarioTopicList';
      container.appendChild(topicSection);
      this.showTopicList(activeScenario);
    } else {
      title.textContent = '🗂️ 所有场景';
      container.appendChild(title);

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
        card.addEventListener('click', () => this.showTopicList(s));
        grid.appendChild(card);
      });
      container.appendChild(grid);
    }
  },

  async showTopicList(scenario) {
    const listDiv = document.getElementById('scenarioTopicList');
    if (!listDiv) return;
    listDiv.innerHTML = '';

    const title = document.createElement('h3');
    title.className = 'section-title';
    title.textContent = `${scenario.icon} ${scenario.name} 话题`;
    listDiv.appendChild(title);

    const topicList = document.createElement('div');
    topicList.className = 'topic-list';

    const topicMap = {
      'tech': ['ai-unemployment-consumption'],
      'finance': ['inflation-or-deflation'],
      'society': ['war-and-civilians', 'extreme-disaster-survival']
    };

    try {
      let topics = [];
      const topicIds = topicMap[scenario.id] || [];
      for (const tid of topicIds) {
        const t = await DataLoader.loadTopic(tid);
        topics.push(t);
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
              <span>👥 ${t.participants || 0} 人参与</span>
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

      // Path indicator
      const pathDiv = document.createElement('div');
      pathDiv.className = 'deep-path';
      pathDiv.id = 'deepPath';
      pathDiv.innerHTML = `<span class="path-item">${topic.title}</span>`;
      container.appendChild(pathDiv);

      // Layer container — all dynamic content goes here
      const layerSection = document.createElement('div');
      layerSection.id = 'layerContainer';
      container.appendChild(layerSection);

      // Render layer 1
      this.renderLayer(topic.predictions, topic.id, 1, topic);

      // Observation section
      const allBranches = this.collectAllBranches(topic);
      const obsSection = document.createElement('div');
      obsSection.className = 'observation-section';
      obsSection.innerHTML = `
        <h3>✍️ 我的观察</h3>
        <div class="obs-input-area">
          <textarea id="obsInput" placeholder="补充你的观察或判断…"></textarea>
          <div class="obs-controls">
            <select id="obsBranch">
              <option value="">选择关联分支</option>
              ${allBranches.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
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

      this.renderObservations(topic, allBranches);

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
        this.renderObservations(topic, allBranches);
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

  /* ===== Collect all branch names across all layers (for observation dropdown) ===== */
  collectAllBranches(topic) {
    const branches = [];
    const walk = (predictions) => {
      if (!predictions) return;
      predictions.forEach(p => {
        branches.push({ id: p.id, name: p.branchName });
        if (p.subQuestions) {
          p.subQuestions.forEach(sq => {
            walk(sq.predictions);
          });
        }
      });
    };
    walk(topic.predictions);
    return branches;
  },

  /* ===== Render layer 1 branch cards ===== */
  renderLayer(predictions, parentId, layerNum, topic) {
    const container = document.getElementById('layerContainer');
    const userChoices = Storage.getChoices();
    const selectedId = userChoices[parentId];

    // Layer label
    const layerTitle = document.createElement('div');
    layerTitle.style.cssText = 'margin:16px 0 8px;display:flex;align-items:center;gap:8px;';
    layerTitle.innerHTML = `<span style="font-size:0.75rem;font-weight:700;color:var(--primary);background:var(--primary-light);padding:4px 10px;border-radius:10px;">第 ${layerNum} 层</span><span style="font-size:0.875rem;color:var(--text-secondary);">选择你倾向的分支，继续深挖</span>`;
    container.appendChild(layerTitle);

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
        <div class="reasoning-inline" id="reasoning-${p.id}" style="display:none;"></div>
      `;

      card.querySelector('.select-btn').addEventListener('click', () => {
        this.selectBranch(parentId, p.id, topic, layerNum);
      });

      container.appendChild(card);

      // Auto-expand if already selected
      if (isSelected) {
        setTimeout(() => {
          this.showInlineReasoning(p);
          this.updatePath(topic);
          if (p.subQuestions && p.subQuestions.length > 0) {
            this.renderSubQuestions(p.subQuestions, p.id, layerNum + 1, topic);
          }
        }, 0);
      }
    });
  },

  /* ===== Select a layer-1 branch ===== */
  selectBranch(topicId, predictionId, topic, layerNum) {
    Storage.saveChoice(topicId, predictionId);
    Interaction.showToast('已选择该分支');

    // Update card UI
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

    // Find the selected prediction
    const p = topic.predictions.find(pred => pred.id === predictionId);
    if (!p) return;

    // Remove all deeper layers (layer 2+)
    const container = document.getElementById('layerContainer');
    container.querySelectorAll('[data-layer]').forEach(el => el.remove());
    // Also remove old reasoning sections
    container.querySelectorAll('.reasoning-inline').forEach(el => {
      if (el.id !== 'reasoning-' + predictionId) el.style.display = 'none';
    });

    // Show reasoning inline
    this.showInlineReasoning(p);
    this.updatePath(topic);

    // Show sub-questions
    if (p.subQuestions && p.subQuestions.length > 0) {
      this.renderSubQuestions(p.subQuestions, p.id, layerNum + 1, topic);
    }
  },

  /* ===== Show reasoning inline within a branch card ===== */
  showInlineReasoning(prediction) {
    const el = document.getElementById('reasoning-' + prediction.id);
    if (!el) return;

    if (!prediction.reasoning || prediction.reasoning.length === 0) {
      el.style.display = 'none';
      return;
    }

    el.style.display = 'block';
    el.innerHTML = `
      <div class="reasoning-section" style="margin-top:12px;">
        <h3 style="font-size:0.875rem;margin-bottom:8px;">🔍 推理链路 <span style="font-weight:400;font-size:0.75rem;color:var(--text-muted)">（${prediction.branchName}）</span></h3>
        ${prediction.reasoning.map(r => `
          <div class="reasoning-step">
            <div class="step-num">${r.step}</div>
            <div class="step-content">
              <div class="step-desc">${r.description}</div>
              <div class="step-ref">📊 ${r.dataRef}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  /* ===== Render single sub-question (no tabs) ===== */
  renderSingleSubQuestion(sq, layerNum, topic) {
    const container = document.getElementById('layerContainer');
    const userChoices = Storage.getChoices();
    const selectedSubId = userChoices[sq.id];

    const sqDiv = document.createElement('div');
    sqDiv.className = 'sub-question-container';
    sqDiv.dataset.layer = layerNum;

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
        <button class="select-btn ${isSubSelected ? 'selected' : 'select'}">
          ${isSubSelected ? '✓ 已选择' : '选择此方向'}
        </button>
        <div class="reasoning-inline" id="reasoning-${sp.id}" style="display:none;"></div>
      `;

      subCard.querySelector('.select-btn').addEventListener('click', () => {
        Storage.saveChoice(sq.id, sp.id);
        Interaction.showToast('已选择，继续深挖');

        subGrid.querySelectorAll('.sub-branch-card').forEach(c => {
          c.classList.remove('selected');
          const btn = c.querySelector('.select-btn');
          btn.className = 'select-btn select';
          btn.textContent = '选择此方向';
        });
        subCard.classList.add('selected');
        subCard.querySelector('.select-btn').className = 'select-btn selected';
        subCard.querySelector('.select-btn').textContent = '✓ 已选择';

        // Remove deeper layers
        container.querySelectorAll(`[data-layer="${layerNum + 1}"]`).forEach(el => el.remove());

        // Show reasoning inline
        this.showInlineReasoning(sp);
        this.updatePath(topic);

        // Show next layer
        if (sp.subQuestions && sp.subQuestions.length > 0) {
          this.renderSubQuestions(sp.subQuestions, sp.id, layerNum + 1, topic);
        }
      });

      // Auto-expand if already selected
      if (isSubSelected) {
        setTimeout(() => {
          this.showInlineReasoning(sp);
          this.updatePath(topic);
          if (sp.subQuestions && sp.subQuestions.length > 0) {
            this.renderSubQuestions(sp.subQuestions, sp.id, layerNum + 1, topic);
          }
        }, 0);
      }

      subGrid.appendChild(subCard);
    });
  },

  /* ===== Render sub-questions (with tabs if multiple) ===== */
  renderSubQuestions(subQuestions, parentId, layerNum, topic) {
    // Single sub-question: no tabs
    if (subQuestions.length === 1) {
      this.renderSingleSubQuestion(subQuestions[0], layerNum, topic);
      return;
    }

    // Multiple sub-questions: tabbed interface
    const container = document.getElementById('layerContainer');
    const userChoices = Storage.getChoices();

    const tabWrapper = document.createElement('div');
    tabWrapper.className = 'sub-question-tabs';
    tabWrapper.dataset.layer = layerNum;

    const tabBar = document.createElement('div');
    tabBar.className = 'sq-tab-bar';

    const contentArea = document.createElement('div');
    contentArea.className = 'sq-content-area';

    let hasPreSelected = false;

    subQuestions.forEach(sq => {
      const tabBtn = document.createElement('button');
      tabBtn.className = 'sq-tab-btn';
      const selectedSubId = userChoices[sq.id];
      const hasSelection = selectedSubId && sq.predictions.some(p => p.id === selectedSubId);
      if (hasSelection) {
        tabBtn.classList.add('has-selection');
        hasPreSelected = true;
      }
      tabBtn.textContent = sq.title;

      const panel = document.createElement('div');
      panel.className = 'sq-panel';
      panel.style.display = 'none';

      panel.innerHTML = `
        <div class="sub-question-header">
          <span class="layer-badge">第 ${layerNum} 层</span>
          <span class="title">🔍 ${sq.title}</span>
        </div>
        <div class="sub-question-body">
          ${sq.description ? `<div class="sub-question-desc">${sq.description}</div>` : ''}
          <div class="sub-branch-grid" id="sub-branches-${sq.id}"></div>
        </div>
      `;

      tabBtn.addEventListener('click', () => {
        tabBar.querySelectorAll('.sq-tab-btn').forEach(b => b.classList.remove('active'));
        contentArea.querySelectorAll('.sq-panel').forEach(p => p.style.display = 'none');
        tabBtn.classList.add('active');
        panel.style.display = 'block';
      });

      tabBar.appendChild(tabBtn);
      contentArea.appendChild(panel);

      const subGrid = panel.querySelector(`#sub-branches-${sq.id}`);

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
          <button class="select-btn ${isSubSelected ? 'selected' : 'select'}">
            ${isSubSelected ? '✓ 已选择' : '选择此方向'}
          </button>
          <div class="reasoning-inline" id="reasoning-${sp.id}" style="display:none;"></div>
        `;

        subCard.querySelector('.select-btn').addEventListener('click', () => {
          Storage.saveChoice(sq.id, sp.id);
          Interaction.showToast('已选择，继续深挖');

          subGrid.querySelectorAll('.sub-branch-card').forEach(c => {
            c.classList.remove('selected');
            const btn = c.querySelector('.select-btn');
            btn.className = 'select-btn select';
            btn.textContent = '选择此方向';
          });
          subCard.classList.add('selected');
          subCard.querySelector('.select-btn').className = 'select-btn selected';
          subCard.querySelector('.select-btn').textContent = '✓ 已选择';

          tabBtn.classList.add('has-selection');

          container.querySelectorAll(`[data-layer="${layerNum + 1}"]`).forEach(el => el.remove());

          this.showInlineReasoning(sp);
          this.updatePath(topic);

          if (sp.subQuestions && sp.subQuestions.length > 0) {
            this.renderSubQuestions(sp.subQuestions, sp.id, layerNum + 1, topic);
          }
        });

        if (isSubSelected && !hasPreSelected) {
          hasPreSelected = true;
          setTimeout(() => {
            tabBar.querySelectorAll('.sq-tab-btn').forEach(b => b.classList.remove('active'));
            contentArea.querySelectorAll('.sq-panel').forEach(p => p.style.display = 'none');
            tabBtn.classList.add('active');
            panel.style.display = 'block';
            this.showInlineReasoning(sp);
            this.updatePath(topic);
            if (sp.subQuestions && sp.subQuestions.length > 0) {
              this.renderSubQuestions(sp.subQuestions, sp.id, layerNum + 1, topic);
            }
          }, 0);
        }

        subGrid.appendChild(subCard);
      });
    });

    if (!hasPreSelected) {
      const firstBtn = tabBar.querySelector('.sq-tab-btn');
      if (firstBtn) firstBtn.classList.add('active');
      const firstPanel = contentArea.querySelector('.sq-panel');
      if (firstPanel) firstPanel.style.display = 'block';
    }

    tabWrapper.appendChild(tabBar);
    tabWrapper.appendChild(contentArea);
    container.appendChild(tabWrapper);
  },

  /* ===== Update path indicator (recursive) ===== */
  updatePath(topic) {
    const pathDiv = document.getElementById('deepPath');
    if (!pathDiv) return;

    const choices = Storage.getChoices();
    let pathHTML = `<span class="path-item">${topic.title}</span>`;

    const walkPredictions = (predictions, depth) => {
      if (!predictions) return;
      predictions.forEach(p => {
        // Check if this prediction was selected by any sub-question
        const parentKey = Object.keys(choices).find(k => choices[k] === p.id);
        if (!parentKey) return;

        pathHTML += `<span class="path-arrow">→</span><span class="path-item">${p.branchName}</span>`;

        if (p.subQuestions) {
          p.subQuestions.forEach(sq => {
            if (choices[sq.id]) {
              walkPredictions(sq.predictions, depth + 1);
            }
          });
        }
      });
    };

    // Start with layer 1
    const layer1Choice = choices[topic.id];
    if (layer1Choice) {
      const p = topic.predictions.find(pred => pred.id === layer1Choice);
      if (p) {
        pathHTML += `<span class="path-arrow">→</span><span class="path-item">${p.branchName}</span>`;
        if (p.subQuestions) {
          p.subQuestions.forEach(sq => {
            if (choices[sq.id]) {
              const sp = sq.predictions.find(pred => pred.id === choices[sq.id]);
              if (sp) {
                pathHTML += `<span class="path-arrow">→</span><span class="path-item">${sp.branchName}</span>`;
                if (sp.subQuestions) {
                  sp.subQuestions.forEach(sq2 => {
                    if (choices[sq2.id]) {
                      const sp2 = sq2.predictions.find(pred => pred.id === choices[sq2.id]);
                      if (sp2) {
                        pathHTML += `<span class="path-arrow">→</span><span class="path-item">${sp2.branchName}</span>`;
                        if (sp2.subQuestions) {
                          sp2.subQuestions.forEach(sq3 => {
                            if (choices[sq3.id]) {
                              const sp3 = sq3.predictions.find(pred => pred.id === choices[sq3.id]);
                              if (sp3) {
                                pathHTML += `<span class="path-arrow">→</span><span class="path-item">${sp3.branchName}</span>`;
                              }
                            }
                          });
                        }
                      }
                    }
                  });
                }
              }
            }
          });
        }
      }
    }

    pathDiv.innerHTML = pathHTML;
  },

  /* ===== Render observations ===== */
  renderObservations(topic, allBranches) {
    const obsList = document.getElementById('obsList');
    if (!obsList) return;

    const allObservations = [
      ...Storage.getObservations().filter(o => {
        return topic.predictions.some(p => p.id === o.relatedPrediction) || !o.relatedPrediction;
      }),
      ...(topic.observations || [])
    ];

    if (allObservations.length === 0) {
      obsList.innerHTML = '<div class="empty-state" style="padding:20px"><div class="text">还没有观察，来发表第一条吧</div></div>';
      return;
    }

    obsList.innerHTML = allObservations.map(o => {
      const branchName = allBranches.find(b => b.id === o.relatedPrediction)?.name || '';
      return `
        <div class="obs-item">
          <div class="obs-header">
            <span class="obs-author">${o.author}</span>
            <span class="obs-type obs-type-${o.type}">${o.type === 'fact' ? '事实' : o.type === 'opinion' ? '观点' : '疑问'}</span>
          </div>
          <div class="obs-content">${o.content}</div>
          <div class="obs-footer">
            <span>🕐 ${new Date(o.timestamp).toLocaleDateString()}</span>
            ${branchName ? `<span>🔗 ${branchName}</span>` : ''}
            <span class="obs-likes" onclick="Interaction.showToast('👍 已点赞')">❤️ ${o.likes}</span>
          </div>
        </div>
      `;
    }).join('');
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

    const results = Storage.getResults();
    const topicLabels = {
      'ai-unemployment-consumption': '🚀 AI引发大规模失业后，消费会崩盘吗？',
      'inflation-or-deflation': '💰 未来3年：物价会飞涨还是通缩崩盘？',
      'war-and-civilians': '🌍 大规模战争离普通人有多远？',
      'extreme-disaster-survival': '🆘 如果极端灾难明天发生，你能活几天？'
    };

    recordsDiv.innerHTML = Object.entries(choices).map(([topicId, choice]) => {
      const result = results[topicId];
      const resultLabel = result === undefined ? '待验证' : result.correct ? '✓ 正确' : '✗ 错误';
      const resultClass = result === undefined ? 'result-pending' : result.correct ? 'result-correct' : 'result-wrong';
      return `
        <div class="record-item">
          <div class="record-title">${topicLabels[topicId] || topicId}</div>
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
