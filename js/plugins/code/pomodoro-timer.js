import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class PomodoroTimerElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0;
            padding: 0;
            user-select: none;
        }
        :host {
            display: block;
            position: relative;
            height: 100%;
            overflow: hidden;
        }
        .container {
            position: relative;
            height: 100%;
            width: 100%;
        }
        .content-area {
            padding: var(--padding-4);
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
            overflow: hidden;
        }
        .header {
            display: flex;
            flex-direction: row;
            color: var(--fg-1);
            gap: var(--gap-2);
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
        }
        .header-wrapper {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            width: 100%;
        }
        .header-controls {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .header-title {
            font-size: 30px;
            font-weight: 500;
        }
        .icon {
            cursor: pointer;
            transition: transform 0.2s ease;
            width: 22px;
        }
        .timer-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--gap-3);
            flex: 1;
            padding-top: 30px;
            padding-bottom: 30px;
        }
        .timer-display-container {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--bg-2);
            border-radius: var(--radius-large);
            padding: var(--padding-4);
            width: 100%;
            max-width: 300px;
            box-shadow: var(--drop-shadow);
        }
        .timer-display {
            font-family: var(--font-mono);
            font-size: 3rem;
            text-align: center;
            color: var(--fg-1);
        }
        .controls {
            display: flex;
            gap: var(--gap-2);
            margin-top: var(--gap-2);
        }
        .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            background-color: var(--bg-2);
            color: var(--fg-1);
            border-radius: var(--radius);
            cursor: pointer;
            padding: var(--padding-3);
            transition: background-color 0.2s;
            min-width: 50px;
            height: 50px;
        }
        .btn:hover {
            background-color: var(--bg-3);
        }
        .btn-primary {
            background-color: var(--bg-accent);
            color: var(--fg-accent);
        }
        .btn-primary img {
            filter: var(--accent-svg);
        }
        .btn-primary:hover {
            filter: brightness(1.1);
        }
        .timer-modes {
            display: flex;
            gap: var(--gap-2);
            margin-bottom: var(--gap-3);
        }
        .mode-btn {
            padding: var(--padding-w2);
            border-radius: var(--radius);
            background-color: var(--bg-2);
            border: none;
            color: var(--fg-1);
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .mode-btn:hover {
            background-color: var(--bg-3);
        }
        .mode-btn.active {
            background-color: var(--fg-1);
            color: var(--bg-1);
        }
        .settings-section {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
            margin-top: var(--gap-3);
            overflow: auto;
        }
        .settings-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--padding-3);
            border-bottom: 1px solid var(--bg-2);
        }
        .settings-row:last-child {
            border-bottom: none;
        }
        .settings-label {
            color: var(--fg-1);
            font-weight: 500;
        }
        .time-input {
            display: flex;
            align-items: center;
            gap: var(--gap-1);
        }
        .time-input input {
            width: 60px;
            padding: var(--padding-2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            background-color: var(--bg-2);
            color: var(--fg-1);
            text-align: center;
        }
        .sessions-counter {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: var(--gap-2);
            color: var(--fg-2);
            font-size: 0.9rem;
        }
        .progress-container {
            width: 100%;
            max-width: 300px;
            height: 8px;
            background-color: var(--bg-2);
            border-radius: var(--radius);
            overflow: hidden;
            margin-top: var(--gap-2);
        }
        .progress-bar {
            height: 100%;
            background-color: var(--fg-blue);
            transition: width 1s linear;
        }

        /* Media queries */
        @media (max-width: 900px) {
            .header-title {
                width: 100%;
                text-align: center;
                margin-top: 20px;
                font-size: 20px;
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
            }
            .timer-display {
                font-size: 2.5rem;
            }
        }

        img {
            filter: var(--themed-svg);
        }

        img[src*='/a7/forget/dialog-x.svg'] {
            width: unset;
        }
        @media (max-width: 900px) {
            img[src*='/a7/forget/dialog-x.svg'] {
                display: none;
            }
        }
    `;

    static properties = {
        isRunning: { type: Boolean, reflect: true },
        timeLeft: { type: Number },
        totalSeconds: { type: Number },
        currentMode: { type: String },
        sessions: { type: Number },
        pomodoroMinutes: { type: Number },
        shortBreakMinutes: { type: Number },
        longBreakMinutes: { type: Number },
        showSettings: { type: Boolean },
        pomodorosUntilLongBreak: { type: Number },
        autoStartBreaks: { type: Boolean },
        autoStartPomodoros: { type: Boolean },
    };

    constructor() {
        super();
        this.isRunning = false;
        this.currentMode = 'pomodoro';
        this.sessions = 0;

        // Timer settings
        this.pomodoroMinutes = 25;
        this.shortBreakMinutes = 5;
        this.longBreakMinutes = 15;
        this.pomodorosUntilLongBreak = 4;

        // Auto-start options
        this.autoStartBreaks = false;
        this.autoStartPomodoros = false;

        // UI state
        this.showSettings = false;

        // Set initial time based on current mode
        this.setTimerForCurrentMode();

        this.intervalId = null;
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
        this.isBeeping = false;
    }

    setTimerForCurrentMode() {
        switch (this.currentMode) {
            case 'pomodoro':
                this.totalSeconds = this.pomodoroMinutes * 60;
                break;
            case 'shortBreak':
                this.totalSeconds = this.shortBreakMinutes * 60;
                break;
            case 'longBreak':
                this.totalSeconds = this.longBreakMinutes * 60;
                break;
        }
        this.timeLeft = this.totalSeconds;
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = 0;
        }
    }

    startBeeping() {
        if (this.isBeeping) return;

        this.initAudio();
        this.isBeeping = true;

        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = 'sine';
        this.oscillator.frequency.value = 800;
        this.oscillator.connect(this.gainNode);

        const beepDuration = 0.2;
        const beepInterval = 0.5;
        const now = this.audioContext.currentTime;

        this.oscillator.start(now);

        const scheduleBeeps = startTime => {
            for (let i = 0; i < 5; i++) {
                const beepTime = startTime + i * beepInterval;
                this.gainNode.gain.setValueAtTime(0, beepTime);
                this.gainNode.gain.linearRampToValueAtTime(0.5, beepTime + 0.01);
                this.gainNode.gain.linearRampToValueAtTime(0, beepTime + beepDuration);
            }
        };

        scheduleBeeps(now);

        // Stop beeping after 3 seconds
        setTimeout(() => {
            this.stopBeeping();
        }, 3000);
    }

    stopBeeping() {
        this.isBeeping = false;
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator.disconnect();
            this.oscillator = null;
        }
        if (this.gainNode) {
            this.gainNode.gain.value = 0;
        }
    }

    toggleTimer() {
        if (!this.isRunning) {
            this.startTimer();
        } else {
            this.pauseTimer();
        }
    }

    startTimer() {
        if (this.timeLeft === 0) return;

        this.isRunning = true;
        this.intervalId = setInterval(() => {
            this.timeLeft--;

            if (this.timeLeft === 0) {
                this.pauseTimer();
                this.startBeeping();
                this.handleTimerComplete();
            }

            this.requestUpdate();
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    resetTimer() {
        this.pauseTimer();
        this.stopBeeping();
        this.timeLeft = this.totalSeconds;
        this.requestUpdate();
    }

    handleTimerComplete() {
        if (this.currentMode === 'pomodoro') {
            // Increment session count when pomodoro is completed
            this.sessions++;

            // Determine which break to take
            if (this.sessions % this.pomodorosUntilLongBreak === 0) {
                this.switchMode('longBreak');
                // Desktop notification for long break
                this.showNotification(
                    'Time for a long break!',
                    'You completed ' + this.pomodorosUntilLongBreak + ' pomodoros. Take a well-deserved long break.'
                );
            } else {
                this.switchMode('shortBreak');
                // Desktop notification for short break
                this.showNotification('Time for a short break!', 'Pomodoro completed. Take a short break to refresh.');
            }

            // Auto-start break if option is enabled
            if (this.autoStartBreaks) {
                setTimeout(() => this.startTimer(), 1000);
            }
        } else {
            // When break is completed, switch back to pomodoro
            this.switchMode('pomodoro');

            // Desktop notification for pomodoro
            this.showNotification('Break complete!', 'Time to focus again. Start your next pomodoro.');

            // Auto-start pomodoro if option is enabled
            if (this.autoStartPomodoros) {
                setTimeout(() => this.startTimer(), 1000);
            }
        }
    }

    showNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, { body });
                }
            });
        }
    }

    switchMode(mode) {
        this.pauseTimer();
        this.stopBeeping();
        this.currentMode = mode;
        this.setTimerForCurrentMode();
        this.requestUpdate();
    }

    toggleSettings() {
        this.showSettings = !this.showSettings;
    }

    handleSettingChange(setting, event) {
        const value = event.target.value;

        if (setting === 'pomodoroMinutes') {
            this.pomodoroMinutes = parseInt(value) || 25;
        } else if (setting === 'shortBreakMinutes') {
            this.shortBreakMinutes = parseInt(value) || 5;
        } else if (setting === 'longBreakMinutes') {
            this.longBreakMinutes = parseInt(value) || 15;
        } else if (setting === 'pomodorosUntilLongBreak') {
            this.pomodorosUntilLongBreak = parseInt(value) || 4;
        }

        // Update timer if we're in the changed mode
        this.setTimerForCurrentMode();
        this.requestUpdate();
    }

    toggleAutoStart(setting) {
        if (setting === 'breaks') {
            this.autoStartBreaks = !this.autoStartBreaks;
        } else if (setting === 'pomodoros') {
            this.autoStartPomodoros = !this.autoStartPomodoros;
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    render() {
        const progressPercentage = ((this.totalSeconds - this.timeLeft) / this.totalSeconds) * 100;

        return html`
            <div class="container">
                <div class="content-area">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <label class="header-title">Pomodoro Timer</label>
                                <img
                                    src="/a7/forget/dialog-x.svg"
                                    alt="Close"
                                    @click="${() => {
                                        wisk.editor.hideMiniDialog();
                                    }}"
                                    class="icon"
                                    draggable="false"
                                    style="padding: var(--padding-3);"
                                />
                            </div>
                        </div>
                    </div>

                    <div class="timer-container">
                        <!-- Timer modes selector -->
                        <div class="timer-modes">
                            <button class="mode-btn ${this.currentMode === 'pomodoro' ? 'active' : ''}" @click="${() => this.switchMode('pomodoro')}">
                                Pomodoro
                            </button>
                            <button
                                class="mode-btn ${this.currentMode === 'shortBreak' ? 'active' : ''}"
                                @click="${() => this.switchMode('shortBreak')}"
                            >
                                Short Break
                            </button>
                            <button
                                class="mode-btn ${this.currentMode === 'longBreak' ? 'active' : ''}"
                                @click="${() => this.switchMode('longBreak')}"
                            >
                                Long Break
                            </button>
                        </div>

                        <!-- Timer display -->
                        <div class="timer-display-container">
                            <div class="timer-display">${this.formatTime(this.timeLeft)}</div>
                        </div>

                        <!-- Progress bar -->
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                        </div>

                        <!-- Controls -->
                        <div class="controls">
                            <button class="btn btn-primary" @click="${this.toggleTimer}" aria-label="${this.isRunning ? 'Pause' : 'Start'}">
                                ${this.isRunning
                                    ? html`<img src="/a7/plugins/nightwave-plaza/pause.svg" alt="Pause" />`
                                    : html`<img src="/a7/plugins/nightwave-plaza/play.svg" alt="Play" />`}
                            </button>
                            <button class="btn" @click="${this.resetTimer}" aria-label="Reset">
                                <img src="/a7/plugins/nightwave-plaza/refresh.svg" alt="Reset" />
                            </button>
                            <button class="btn" @click="${this.toggleSettings}" aria-label="Settings">
                                <img src="/a7/plugins/options-element/settings.svg" alt="Settings" />
                            </button>
                        </div>

                        <!-- Session counter -->
                        <div class="sessions-counter">
                            <span>Sessions completed: ${this.sessions}</span>
                            ${this.currentMode === 'pomodoro'
                                ? html`<span
                                      >Next long break in ${this.pomodorosUntilLongBreak - (this.sessions % this.pomodorosUntilLongBreak)}
                                      pomodoro${this.pomodorosUntilLongBreak - (this.sessions % this.pomodorosUntilLongBreak) !== 1 ? 's' : ''}</span
                                  >`
                                : ''}
                        </div>
                    </div>

                    <!-- Settings panel -->
                    ${this.showSettings
                        ? html`
                              <div class="settings-section">
                                  <div class="settings-row">
                                      <span class="settings-label">Pomodoro Length</span>
                                      <div class="time-input">
                                          <input
                                              type="number"
                                              min="1"
                                              max="60"
                                              .value="${this.pomodoroMinutes}"
                                              @change="${e => this.handleSettingChange('pomodoroMinutes', e)}"
                                          />
                                          <span>minutes</span>
                                      </div>
                                  </div>

                                  <div class="settings-row">
                                      <span class="settings-label">Short Break Length</span>
                                      <div class="time-input">
                                          <input
                                              type="number"
                                              min="1"
                                              max="30"
                                              .value="${this.shortBreakMinutes}"
                                              @change="${e => this.handleSettingChange('shortBreakMinutes', e)}"
                                          />
                                          <span>minutes</span>
                                      </div>
                                  </div>

                                  <div class="settings-row">
                                      <span class="settings-label">Long Break Length</span>
                                      <div class="time-input">
                                          <input
                                              type="number"
                                              min="1"
                                              max="60"
                                              .value="${this.longBreakMinutes}"
                                              @change="${e => this.handleSettingChange('longBreakMinutes', e)}"
                                          />
                                          <span>minutes</span>
                                      </div>
                                  </div>

                                  <div class="settings-row">
                                      <span class="settings-label">Pomodoros until long break</span>
                                      <div class="time-input">
                                          <input
                                              type="number"
                                              min="1"
                                              max="10"
                                              .value="${this.pomodorosUntilLongBreak}"
                                              @change="${e => this.handleSettingChange('pomodorosUntilLongBreak', e)}"
                                          />
                                          <span>pomodoros</span>
                                      </div>
                                  </div>

                                  <div class="settings-row">
                                      <span class="settings-label">Auto-start breaks</span>
                                      <jalebi-toggle ?checked="${this.autoStartBreaks}" @valuechange="${() => this.toggleAutoStart('breaks')}">
                                      </jalebi-toggle>
                                  </div>

                                  <div class="settings-row">
                                      <span class="settings-label">Auto-start pomodoros</span>
                                      <jalebi-toggle ?checked="${this.autoStartPomodoros}" @valuechange="${() => this.toggleAutoStart('pomodoros')}">
                                      </jalebi-toggle>
                                  </div>
                              </div>
                          `
                        : ''}
                </div>
            </div>
        `;
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.pauseTimer();
        this.stopBeeping();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

customElements.define('pomodoro-timer', PomodoroTimerElement);
