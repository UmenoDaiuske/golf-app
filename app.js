// ゴルフログ管理アプリケーション
class GolfLogApp {
    constructor() {
        this.currentRound = null;
        this.rounds = [];
        this.shotCount = 0;
        this.clubs = [
            'DRIVER', '5w', '4u', '6i', '7i', '8i', '9i', 'pw', '50w', '56w', 'PUTTER'
        ];
        this.lies = ['tee', 'fairway', 'rough', 'bunker', 'green'];
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.updateUI();
    }

    // イベントリスナーの設定
    setupEventListeners() {
        // ナビゲーション
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.currentTarget.id));
        });

        // ラウンド入力
        document.getElementById('addShotBtn').addEventListener('click', () => this.addShotInput());
        document.getElementById('saveRoundBtn').addEventListener('click', () => this.saveRound());
        document.getElementById('clearFormBtn').addEventListener('click', () => this.clearForm());

        // AIキャディ
        document.getElementById('getAdviceBtn').addEventListener('click', () => this.getCaddieAdvice());

        // ファイル操作
        document.getElementById('importBtn').addEventListener('click', () => document.getElementById('fileInput').click());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('fileInput').addEventListener('change', (e) => this.importData(e));

        // フィルター
        document.getElementById('filterCourse').addEventListener('change', () => this.updateLogsView());
        document.getElementById('filterDate').addEventListener('change', () => this.updateLogsView());
    }

    // タブ切り替え
    switchTab(tabId) {
        // 高速な切り替えのため、即座に実行
        const startTime = performance.now();
        
        // タブのスタイル変更（高速化）
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active', 'border-green-600', 'text-green-600');
            tab.classList.add('border-transparent', 'text-gray-600');
        });
        
        const currentTab = document.getElementById(tabId);
        currentTab.classList.add('active', 'border-green-600', 'text-green-600');
        currentTab.classList.remove('border-transparent', 'text-gray-600');

        // コンテンツ表示切替（高速化）
        const sections = document.querySelectorAll('.tab-content');
        sections.forEach(section => section.classList.add('hidden'));

        const sectionMap = {
            'navInput': 'inputSection',
            'navCaddie': 'caddieSection',
            'navLogs': 'logsSection',
            'navAnalysis': 'analysisSection'
        };

        const targetSection = document.getElementById(sectionMap[tabId]);
        targetSection.classList.remove('hidden');

        // 即座にコンテンツを更新（非同期）
        setTimeout(() => {
            if (tabId === 'navAnalysis') {
                this.updateAnalysis();
            } else if (tabId === 'navLogs') {
                this.updateLogsView();
            }
        }, 0);

        const endTime = performance.now();
        console.log(`タブ切り替え完了: ${(endTime - startTime).toFixed(2)}ms`);
    }

    // ショット入力フィールドの追加
    addShotInput() {
        this.shotCount++;
        const container = document.getElementById('shotsContainer');
        const shotDiv = document.createElement('div');
        shotDiv.className = 'shot-input bg-gray-50 p-4 rounded-lg mb-4';
        shotDiv.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <h4 class="font-medium text-gray-800">ショット ${this.shotCount}</h4>
                <button type="button" onclick="app.removeShot(this)" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">クラブ</label>
                    <select class="club-select w-full px-2 py-2 border border-gray-300 rounded text-sm" onchange="app.updateShotData(this); app.checkIfHoleComplete()">
                        <option value="">選択</option>
                        ${this.clubs.map(club => `<option value="${club}">${club}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">残り距離</label>
                    <input type="number" class="distance-input w-full px-2 py-2 border border-gray-300 rounded text-sm" placeholder="ヤード" onchange="app.updateShotData(this); app.checkIfHoleComplete()">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">ライ</label>
                    <select class="lie-select w-full px-2 py-2 border border-gray-300 rounded text-sm" onchange="app.updateShotData(this); app.checkIfHoleComplete()">
                        <option value="">選択</option>
                        ${this.lies.map(lie => `<option value="${lie}">${this.getLieDisplayName(lie)}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">結果</label>
                    <select class="result-input w-full px-2 py-2 border border-gray-300 rounded text-sm" onchange="app.checkIfHoleComplete()">
                        <option value="">選択</option>
                        <option value="fairway">フェアウェイ</option>
                        <option value="rough">ラフ</option>
                        <option value="bunker">バンカー</option>
                        <option value="green">グリーン</option>
                        <option value="green_edge">グリーンエッジ</option>
                        <option value="hole_out">ホールアウト</option>
                        <option value="ob">OB</option>
                        <option value="water">池</option>
                    </select>
                </div>
            </div>
        `;
        container.appendChild(shotDiv);
    }

    // ライ表示名の取得
    getLieDisplayName(lie) {
        const displayNames = {
            'tee': 'ティー',
            'fairway': 'フェアウェイ',
            'rough': 'ラフ',
            'bunker': 'バンカー',
            'green': 'グリーン'
        };
        return displayNames[lie] || lie;
    }

    // ショットデータの更新
    updateShotData(element) {
        // 将来的な機能拡張用
    }

    // ホールが完了したかチェック
    checkIfHoleComplete() {
        const shots = document.querySelectorAll('.shot-input');
        let hasHoleOut = false;
        
        shots.forEach(shotDiv => {
            const result = shotDiv.querySelector('.result-input').value;
            if (result === 'hole_out') {
                hasHoleOut = true;
            }
        });

        const saveBtn = document.getElementById('saveRoundBtn');
        const addShotBtn = document.getElementById('addShotBtn');
        
        if (hasHoleOut) {
            saveBtn.style.display = 'inline-flex';
            addShotBtn.style.display = 'none';
        } else {
            saveBtn.style.display = 'none';
            addShotBtn.style.display = 'inline-flex';
        }
    }

    // ショット入力フィールドの削除
    removeShot(button) {
        button.closest('.shot-input').remove();
        this.shotCount--;
    }

    // ラウンドの保存
    saveRound() {
        const courseName = document.getElementById('courseName').value;
        const holeNumber = parseInt(document.getElementById('holeNumber').value);
        const par = parseInt(document.getElementById('par').value);
        const totalDistance = parseInt(document.getElementById('totalDistance').value);

        if (!courseName || !holeNumber || !par) {
            alert('コース名、ホール番号、パーは必須項目です。');
            return;
        }

        const lastShotResult = document.querySelector('.shot-input:last-child .result-input')?.value;
        if (lastShotResult !== 'hole_out') {
            alert('最後のショットで「ホールアウト」を選択してください。');
            return;
        }

        const shots = [];
        document.querySelectorAll('.shot-input').forEach((shotDiv, index) => {
            const club = shotDiv.querySelector('.club-select').value;
            const distance = shotDiv.querySelector('.distance-input').value;
            const lie = shotDiv.querySelector('.lie-select').value;
            const result = shotDiv.querySelector('.result-input').value;

            if (club) {
                shots.push({
                    shot_number: index + 1,
                    club,
                    remaining_distance: distance ? parseInt(distance) : null,
                    lie,
                    result
                });
            }
        });

        const round = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            course: courseName,
            hole: holeNumber,
            par,
            total_distance_yards: totalDistance,
            shots,
            final_score: this.calculateScore(shots, par),
            created_at: new Date().toISOString()
        };

        this.rounds.push(round);
        this.saveToStorage();
        this.updateUI();

        alert(`${courseName} ${holeNumber}番ホールを保存しました！（${shots.length}打）`);

        this.clearForm();
        this.switchTab('navLogs');
    }

    // スコア計算
    calculateScore(shots, par) {
        const shotCount = shots.length;
        const diff = shotCount - par;
        
        if (diff === 0) return 'par';
        if (diff === -1) return 'birdie';
        if (diff === 1) return 'bogey';
        if (diff === 2) return 'double_bogey';
        if (diff === 3) return 'triple_bogey';
        if (diff < -1) return 'under_par';
        return 'over_par';
    }

    // フォームのクリア
    clearForm() {
        document.getElementById('courseName').value = '';
        document.getElementById('holeNumber').value = '';
        document.getElementById('par').value = '';
        document.getElementById('totalDistance').value = '';
        document.getElementById('shotsContainer').innerHTML = '';
        this.shotCount = 0;
        
        // 保存ボタンを非表示にして、ショット追加ボタンを表示
        document.getElementById('saveRoundBtn').style.display = 'none';
        document.getElementById('addShotBtn').style.display = 'inline-flex';
    }

    // AIキャディのアドバイス
    getCaddieAdvice() {
        const distance = parseInt(document.getElementById('caddieDistance').value);
        const lie = document.getElementById('caddieLie').value;
        const slope = document.getElementById('caddieSlope').value;
        const obstacles = Array.from(document.querySelectorAll('#caddieSection input[type="checkbox"]:checked')).map(cb => cb.value);

        if (!distance || !lie) {
            alert('残り距離とライは必須項目です。');
            return;
        }

        const advice = this.generateCaddieAdvice(distance, lie, slope, obstacles);
        this.displayAdvice(advice);
    }

    // AIキャディのアドバイス生成
    generateCaddieAdvice(distance, lie, slope, obstacles) {
        let club = '';
        let intent = '';
        let risk = 'low';
        let reason = '';

        // 距離に基づくクラブ選択
        if (distance >= 200) {
            club = 'driver';
        } else if (distance >= 180) {
            club = '3w';
        } else if (distance >= 160) {
            club = '5w';
        } else if (distance >= 140) {
            club = '7i';
        } else if (distance >= 120) {
            club = '8i';
        } else if (distance >= 100) {
            club = '9i';
        } else if (distance >= 80) {
            club = 'pw';
        } else {
            club = 'sw';
        }

        // ライの調整
        if (lie === 'rough') {
            club = club === 'driver' ? '3w' : club;
            intent = 'ラフからの脱出を意識して、無理せず安全に打つ';
        } else if (lie === 'bunker') {
            club = 'sw';
            intent = 'バンカーからの脱出を確実に行う';
            risk = 'medium';
        } else if (lie === 'green') {
            club = 'putter';
            intent = '確実にホールに入れることを意識する';
        } else {
            intent = '正確なショットを心がける';
        }

        // 傾斜の調整
        if (slope === 'uphill') {
            intent += ' アップヒルを考慮して1クラブ多く使う';
        } else if (slope === 'downhill') {
            intent += ' ダウンヒルを考慮して1クラブ少なく使う';
        }

        // 障害物の考慮
        if (obstacles.includes('water')) {
            intent += ' 池を避けて安全にプレーする';
            risk = 'high';
        }
        if (obstacles.includes('ob')) {
            intent += ' OBを避けるため、無理せず安全に打つ';
            risk = 'high';
        }

        // 理由の生成
        reason = `${distance}ヤードの${this.getLieDisplayName(lie)}からは、${club.toUpperCase()}が適切です。${intent}。`;

        return { club, intent, risk, reason, distance, lie, slope, obstacles };
    }

    // アドバイスの表示
    displayAdvice(advice) {
        const resultDiv = document.getElementById('adviceResult');
        const riskColor = {
            'low': 'text-green-600',
            'medium': 'text-yellow-600',
            'high': 'text-red-600'
        };

        resultDiv.innerHTML = `
            <div class="space-y-3">
                <div class="bg-white p-3 rounded border-l-4 border-green-500">
                    <div class="font-medium text-gray-800">推奨クラブ</div>
                    <div class="text-lg font-bold text-green-600">${advice.club.toUpperCase()}</div>
                </div>
                <div class="bg-white p-3 rounded border-l-4 border-blue-500">
                    <div class="font-medium text-gray-800">意識すること</div>
                    <div class="text-sm text-gray-700">${advice.intent}</div>
                </div>
                <div class="bg-white p-3 rounded border-l-4 border-yellow-500">
                    <div class="font-medium text-gray-800">リスク評価</div>
                    <div class="text-sm ${riskColor[advice.risk]}">${this.getRiskDisplayName(advice.risk)}</div>
                </div>
                <div class="bg-white p-3 rounded border-l-4 border-gray-500">
                    <div class="font-medium text-gray-800">理由</div>
                    <div class="text-sm text-gray-700">${advice.reason}</div>
                </div>
            </div>
        `;
    }

    // リスク表示名の取得
    getRiskDisplayName(risk) {
        const names = {
            'low': '低リスク',
            'medium': '中リスク',
            'high': '高リスク'
        };
        return names[risk] || risk;
    }

    // UIの更新
    updateUI() {
        this.updateLogsView();
        this.updateCourseFilter();
    }

    // ラウンドの削除
    deleteRound(roundId) {
        if (confirm('このラウンドを削除してもよろしいですか？')) {
            this.rounds = this.rounds.filter(round => round.id != roundId);
            this.saveToStorage();
            this.updateLogsView();
            alert('ラウンドを削除しました。');
        }
    }

    // ログ表示の更新
    updateLogsView() {
        const container = document.getElementById('logsContainer');
        const filterCourse = document.getElementById('filterCourse').value;
        const filterDate = document.getElementById('filterDate').value;

        let filteredRounds = this.rounds;

        if (filterCourse) {
            filteredRounds = filteredRounds.filter(round => round.course === filterCourse);
        }

        if (filterDate) {
            filteredRounds = filteredRounds.filter(round => round.date === filterDate);
        }

        // 日付の降順でソート（新しい順）
        filteredRounds.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filteredRounds.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">ログがありません。まずはラウンドを入力してください。</p>';
            return;
        }

        // 統計情報の表示
        const totalRounds = filteredRounds.length;
        const avgScore = (filteredRounds.reduce((sum, round) => sum + round.shots.length, 0) / totalRounds).toFixed(1);
        const recentDate = filteredRounds[0].date;
        const oldestDate = filteredRounds[filteredRounds.length - 1].date;

        container.innerHTML = `
            <div class="bg-blue-50 rounded-lg p-4 mb-6">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div class="text-lg font-bold text-blue-600">${totalRounds}</div>
                        <div class="text-xs text-gray-600">ラウンド数</div>
                    </div>
                    <div>
                        <div class="text-lg font-bold text-green-600">${avgScore}</div>
                        <div class="text-xs text-gray-600">平均打数</div>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-800">${recentDate}</div>
                        <div class="text-xs text-gray-600">最新</div>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-800">${oldestDate}</div>
                        <div class="text-xs text-gray-600">最古</div>
                    </div>
                </div>
            </div>
        `;

        // 各ラウンドの詳細表示
        filteredRounds.forEach((round, index) => {
            const scoreDiff = round.shots.length - round.par;
            const scoreClass = scoreDiff === 0 ? 'text-green-600' : scoreDiff < 0 ? 'text-blue-600' : 'text-red-600';
            const scoreText = scoreDiff === 0 ? 'パー' : scoreDiff > 0 ? `+${scoreDiff}` : `${scoreDiff}`;
            
            container.innerHTML += `
                <div class="bg-white border rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex-1">
                            <div class="flex items-center mb-1">
                                <div class="font-bold text-gray-800 text-lg">${round.course}</div>
                                <div class="ml-2 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                    ${round.hole}番ホール
                                </div>
                            </div>
                            <div class="text-sm text-gray-600 mb-2">
                                ${round.date} ・ パー${round.par} ・ ${round.total_distance_yards || '---'}ヤード
                            </div>
                        </div>
                        <div class="text-right ml-4">
                            <div class="text-2xl font-bold ${scoreClass}">${scoreText}</div>
                            <div class="text-sm text-gray-600">${round.shots.length}打</div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <div class="text-xs text-gray-500 mb-2">使用クラブと結果</div>
                        <div class="flex flex-wrap gap-1">
                            ${round.shots.map((shot, shotIndex) => `
                                <div class="flex items-center bg-gray-50 px-2 py-1 rounded text-xs">
                                    <span class="font-medium">${shot.club.toUpperCase()}</span>
                                    ${shot.remaining_distance ? `<span class="ml-1 text-gray-600">${shot.remaining_distance}y</span>` : ''}
                                    ${shot.result ? `<span class="ml-1 text-green-600">${shot.result}</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center text-xs text-gray-500">
                        <div>記録日時: ${new Date(round.created_at).toLocaleString('ja-JP')}</div>
                        <button onclick="app.deleteRound('${round.id}')" class="text-red-500 hover:text-red-700">
                            <i class="fas fa-trash mr-1"></i>削除
                        </button>
                    </div>
                </div>
            `;
        });
    }

    // スコア表示の取得
    getScoreDisplay(score) {
        const displays = {
            'birdie': 'バーディ',
            'par': 'パー',
            'bogey': 'ボギー',
            'double_bogey': 'ダボ',
            'triple_bogey': 'トリプルボギー',
            'under_par': 'アンダーパー',
            'over_par': 'オーバーパー'
        };
        return displays[score] || score;
    }

    // コースフィルターの更新
    updateCourseFilter() {
        const select = document.getElementById('filterCourse');
        const courses = [...new Set(this.rounds.map(round => round.course))];
        
        select.innerHTML = '<option value="">すべてのコース</option>' +
            courses.map(course => `<option value="${course}">${course}</option>`).join('');
    }

    // 分析画面の更新
    updateAnalysis() {
        this.updateClubDistanceChart();
        this.updateScoreTrendChart();
        this.updateMissPatternChart();
        this.updateStatistics();
    }

    // クラブ別平均距離チャート
    updateClubDistanceChart() {
        const clubDistances = {};
        const clubCounts = {};

        this.rounds.forEach(round => {
            round.shots.forEach(shot => {
                if (shot.club && shot.remaining_distance) {
                    clubDistances[shot.club] = (clubDistances[shot.club] || 0) + shot.remaining_distance;
                    clubCounts[shot.club] = (clubCounts[shot.club] || 0) + 1;
                }
            });
        });

        const averages = {};
        Object.keys(clubDistances).forEach(club => {
            if (clubCounts[club] > 0) {
                averages[club] = Math.round(clubDistances[club] / clubCounts[club]);
            }
        });

        const chartDiv = document.getElementById('clubDistanceChart');
        if (Object.keys(averages).length === 0) {
            chartDiv.innerHTML = '<p class="text-gray-500 text-center">データがありません</p>';
            return;
        }

        // 簡易的な棒グラフ表示
        const maxDistance = Math.max(...Object.values(averages));
        chartDiv.innerHTML = Object.entries(averages)
            .sort((a, b) => b[1] - a[1])
            .map(([club, distance]) => `
                <div class="flex items-center mb-2">
                    <div class="w-12 text-xs font-medium">${club.toUpperCase()}</div>
                    <div class="flex-1 bg-gray-200 rounded-full h-4 mx-2">
                        <div class="golf-green h-4 rounded-full" style="width: ${(distance / maxDistance) * 100}%"></div>
                    </div>
                    <div class="w-16 text-xs text-gray-600">${distance}y</div>
                </div>
            `).join('');
    }

    // スコア推移チャート
    updateScoreTrendChart() {
        const scoreTrend = {};
        
        this.rounds.forEach(round => {
            const key = round.date;
            if (!scoreTrend[key]) {
                scoreTrend[key] = { total: 0, count: 0 };
            }
            scoreTrend[key].total += round.shots.length;
            scoreTrend[key].count += 1;
        });

        const chartDiv = document.getElementById('scoreTrendChart');
        if (Object.keys(scoreTrend).length === 0) {
            chartDiv.innerHTML = '<p class="text-gray-500 text-center">データがありません</p>';
            return;
        }

        // 簡易的な折れ線グラフ表示
        const dates = Object.keys(scoreTrend).sort();
        const averages = dates.map(date => (scoreTrend[date].total / scoreTrend[date].count).toFixed(1));
        
        chartDiv.innerHTML = `
            <div class="text-xs text-gray-600 mb-2">平均打数</div>
            ${dates.map((date, index) => `
                <div class="flex items-center mb-1">
                    <div class="w-20 text-xs">${date}</div>
                    <div class="flex-1 text-right font-medium">${averages[index]}打</div>
                </div>
            `).join('')}
        `;
    }

    // ミス傾向チャート
    updateMissPatternChart() {
        const missPatterns = {};
        
        this.rounds.forEach(round => {
            round.shots.forEach(shot => {
                if (shot.result) {
                    const patterns = ['slice', 'hook', 'top', 'fat', 'shank', 'whiff'];
                    patterns.forEach(pattern => {
                        if (shot.result.toLowerCase().includes(pattern)) {
                            missPatterns[pattern] = (missPatterns[pattern] || 0) + 1;
                        }
                    });
                }
            });
        });

        const chartDiv = document.getElementById('missPatternChart');
        if (Object.keys(missPatterns).length === 0) {
            chartDiv.innerHTML = '<p class="text-gray-500 text-center">データがありません</p>';
            return;
        }

        const total = Object.values(missPatterns).reduce((sum, count) => sum + count, 0);
        
        chartDiv.innerHTML = Object.entries(missPatterns)
            .sort((a, b) => b[1] - a[1])
            .map(([pattern, count]) => `
                <div class="flex items-center mb-2">
                    <div class="w-16 text-xs font-medium">${pattern.toUpperCase()}</div>
                    <div class="flex-1 bg-gray-200 rounded-full h-4 mx-2">
                        <div class="bg-red-500 h-4 rounded-full" style="width: ${(count / total) * 100}%"></div>
                    </div>
                    <div class="w-12 text-xs text-gray-600">${count}回</div>
                </div>
            `).join('');
    }

    // 統計情報の更新
    updateStatistics() {
        const statsDiv = document.getElementById('statistics');
        const totalRounds = this.rounds.length;
        const totalHoles = this.rounds.reduce((sum, round) => sum + 1, 0);
        const totalShots = this.rounds.reduce((sum, round) => sum + round.shots.length, 0);
        const averageScore = totalRounds > 0 ? (totalShots / totalRounds).toFixed(1) : 0;

        const parCounts = {};
        this.rounds.forEach(round => {
            parCounts[round.par] = (parCounts[round.par] || 0) + 1;
        });

        statsDiv.innerHTML = `
            <div class="flex justify-between">
                <span class="text-gray-600">総ラウンド数:</span>
                <span class="font-medium">${totalRounds}ラウンド</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">総ショット数:</span>
                <span class="font-medium">${totalShots}打</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">平均スコア:</span>
                <span class="font-medium">${averageScore}打</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">最頻パー:</span>
                <span class="font-medium">${Object.keys(parCounts).length > 0 ? Object.keys(parCounts).reduce((a, b) => parCounts[a] > parCounts[b] ? a : b) : 'N/A'}</span>
            </div>
        `;
    }

    // データのエクスポート
    exportData() {
        if (this.rounds.length === 0) {
            alert('エクスポートするデータがありません。');
            return;
        }

        // 保存されたラウンドデータをJSON形式でエクスポート
        const exportData = {
            export_date: new Date().toISOString(),
            total_rounds: this.rounds.length,
            courses: [...new Set(this.rounds.map(round => round.course))],
            date_range: {
                from: this.rounds.reduce((min, round) => round.date < min ? round.date : min, this.rounds[0].date),
                to: this.rounds.reduce((max, round) => round.date > max ? round.date : max, this.rounds[0].date)
            },
            rounds: this.rounds
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `golf_log_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        alert(`ラウンドデータをJSON形式でエクスポートしました。\n\nファイル名: ${link.download}\nラウンド数: ${this.rounds.length}`);
    }

    // データのインポート
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // データ形式の検証
                if (Array.isArray(importedData)) {
                    this.rounds = [...this.rounds, ...importedData];
                } else if (typeof importedData === 'object') {
                    this.rounds.push(importedData);
                } else {
                    throw new Error('Invalid data format');
                }

                this.saveToStorage();
                this.updateUI();
                alert('データがインポートされました！');
            } catch (error) {
                alert('ファイルの読み込みに失敗しました。JSON形式を確認してください。');
            }
        };
        reader.readAsText(file);
    }

    // ローカルストレージに保存
    saveToStorage() {
        localStorage.setItem('golfRounds', JSON.stringify(this.rounds));
    }

    // ローカルストレージから読み込み
    loadFromStorage() {
        const stored = localStorage.getItem('golfRounds');
        if (stored) {
            try {
                this.rounds = JSON.parse(stored);
            } catch (error) {
                console.error('Failed to load from storage:', error);
                this.rounds = [];
            }
        }
    }
}

// アプリケーションの初期化
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new GolfLogApp();
});