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
    hero.className = 'hero';
    hero.innerHTML = `
      <h1>探索 <span>未来</span> 的可能性</h1>
      <p>从你身边关切的日常场景出发，一步步探索不同分支下的预测与判断</p>
    `;
    container.appendChild(hero);

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

    try {
      let topics = [];
      const topicId = topicMap[scenario.id];
      if (topicId) {
        const t = await DataLoader.loadTopic(topicId);
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
            'which-side': '🤔 该选哪一边？'
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