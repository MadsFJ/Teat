// settingsView.js

import { getSettings, saveSettings, clearAllData } from './storage.js';

export function initSettingsView(section) {
  const soundToggle = section.querySelector('#settings-sound');
  const clearBtn = section.querySelector('#settings-clear-all');

  const settings = getSettings();
  soundToggle.checked = settings.soundEnabled !== false;
  soundToggle.addEventListener('change', () => {
    saveSettings({ ...getSettings(), soundEnabled: soundToggle.checked });
  });

  clearBtn.addEventListener('click', () => {
    if (confirm('Slet ALT gemt data (historik + rekorder + indstillinger)? Dette kan ikke fortrydes.')) {
      clearAllData();
      location.reload();
    }
  });
}
