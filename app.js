(() => {
  'use strict';
  const anchor = window.location.hash;
  const contactAnchor = "#contact";

  const generationForm = document.getElementById('generation-form')
  const contactForm = document.getElementById('contact-form')

  const contactBtn = document.getElementById('contactBtn');
  const showContactForm = () => {
    window.location.hash = contactAnchor
    generationForm.classList.add('hidden');
    contactForm.classList.remove('hidden');
    contactBtn.innerHTML = `<span class='material-symbols-outlined'>build</span><span style='vertical-align: super'>&nbsp;Generate App</span>`;
  }

  if (anchor === contactAnchor) {
    showContactForm()
  }

  const apiServerUrl = 'android-app-generator-7c4c2b5118c7.herokuapp.com';
  const useHttpsForApiCall = true;
  const entityListEl = document.getElementById('entityList');
  const entityTemplate = document.getElementById('entityTemplate');
  const fieldRowTemplate = document.getElementById('fieldRowTemplate');
  const extraScreenChips = document.getElementById('extraScreenChips');

  const sdkListEl = document.getElementById('sdkList');
  const sdkTemplate = document.getElementById('sdkTemplate');
  const interfaceTemplate = document.getElementById('interfaceTemplate');
  const methodTemplate = document.getElementById('methodTemplate');
  const paramRowTemplate = document.getElementById('paramRowTemplate');

  let entityCounter = 0;
  const extraScreens = [];

  function addEntity(name = '') {
    entityCounter += 1;
    const node = entityTemplate.content.cloneNode(true);
    const card = node.querySelector('.entity-card');
    card.dataset.id = entityCounter;

    const nameInput = card.querySelector('.entity-name');
    nameInput.value = name || `Entity${entityCounter}`;
    nameInput.addEventListener('input', refreshAll);

    card.querySelectorAll('.screen-toggles input').forEach((cb) => cb.addEventListener('change', refreshAll));

    card.querySelector('.remove-entity').addEventListener('click', () => {
      card.remove();
      refreshAll();
    });

    card.querySelector('.add-field').addEventListener('click', () => {
      addFieldRow(card.querySelector('.fields-rows'));
      refreshAll();
    });

    entityListEl.appendChild(card);

    // Seed with a couple of starter fields so the form isn't empty.
    const rows = card.querySelector('.fields-rows');
    addFieldRow(rows, 'title', 'String');
    addFieldRow(rows, 'isDone', 'Boolean');

    refreshAll();
  }

  function addFieldRow(rowsContainer, name = '', type = 'String', nullable = false) {
    const node = fieldRowTemplate.content.cloneNode(true);
    const row = node.querySelector('.field-row-item');
    row.querySelector('.field-name').value = name;
    row.querySelector('.field-type').value = type;
    row.querySelector('.field-nullable').checked = nullable;

    row.querySelector('.field-name').addEventListener('input', refreshAll);
    row.querySelector('.field-type').addEventListener('change', refreshAll);
    row.querySelector('.field-nullable').addEventListener('change', refreshAll);
    row.querySelector('.remove-field').addEventListener('click', () => {
      row.remove();
      refreshAll();
    });

    rowsContainer.appendChild(row);
  }

  /** Lightweight client-side preview only — normalizeSpec.js on the server is the source of truth. */
  function previewModuleName(rawName) {
    const cleaned = String(rawName || '').trim().replace(/\s+/g, '-').replace(/[^A-Za-z0-9_-]/g, '');
    return cleaned || 'external-sdk';
  }

  function addSdk(name = '') {
    const node = sdkTemplate.content.cloneNode(true);
    const card = node.querySelector('.sdk-card');
    const nameInput = card.querySelector('.sdk-name');
    const preview = card.querySelector('.sdk-module-preview');

    function updatePreview() {
      const m = previewModuleName(nameInput.value);
      preview.innerHTML = `→ contracts: <span class="accent">${m}</span> · implementation: <span class="accent">${m}-implementation</span>`;
    }

    nameInput.value = name;
    nameInput.addEventListener('input', () => {
      updatePreview();
      refreshAll();
    });
    updatePreview();

    card.querySelector('.remove-sdk').addEventListener('click', () => {
      card.remove();
      refreshAll();
    });

    const interfacesContainer = card.querySelector('.interfaces-container');
    card.querySelector('.add-interface').addEventListener('click', () => {
      addInterface(interfacesContainer);
      refreshAll();
    });

    sdkListEl.appendChild(card);
    addInterface(interfacesContainer, 'MyContract');
    refreshAll();
  }

  function addInterface(container, name = '') {
    const node = interfaceTemplate.content.cloneNode(true);
    const card = node.querySelector('.interface-card');
    card.querySelector('.interface-name').value = name;
    card.querySelector('.interface-name').addEventListener('input', refreshAll);

    card.querySelector('.remove-interface').addEventListener('click', () => {
      card.remove();
      refreshAll();
    });

    const methodsContainer = card.querySelector('.methods-container');
    card.querySelector('.add-method').addEventListener('click', () => {
      addMethod(methodsContainer);
      refreshAll();
    });

    container.appendChild(card);
    addMethod(methodsContainer, 'doSomething', 'Boolean');
  }

  function addMethod(container, name = '', returnType = '') {
    const node = methodTemplate.content.cloneNode(true);
    const card = node.querySelector('.method-card');
    card.querySelector('.method-name').value = name;
    card.querySelector('.method-return-type').value = returnType;

    card.querySelector('.method-name').addEventListener('input', refreshAll);
    card.querySelector('.method-return-type').addEventListener('input', refreshAll);
    card.querySelector('.method-suspend').addEventListener('change', refreshAll);

    card.querySelector('.remove-method').addEventListener('click', () => {
      card.remove();
      refreshAll();
    });

    const paramsContainer = card.querySelector('.params-container');
    card.querySelector('.add-param').addEventListener('click', () => {
      addParamRow(paramsContainer);
      refreshAll();
    });

    container.appendChild(card);
  }

  function addParamRow(container, name = '', type = '') {
    const node = paramRowTemplate.content.cloneNode(true);
    const row = node.querySelector('.param-row-item');
    row.querySelector('.param-name').value = name;
    row.querySelector('.param-type').value = type;

    row.querySelector('.param-name').addEventListener('input', refreshAll);
    row.querySelector('.param-type').addEventListener('input', refreshAll);
    row.querySelector('.remove-param').addEventListener('click', () => {
      row.remove();
      refreshAll();
    });

    container.appendChild(row);
  }

  function collectSpec() {
    const project = {
      appName: document.getElementById('appName').value.trim() || 'MyApp',
      packageName: document.getElementById('packageName').value.trim() || 'com.example.myapp',
      minSdk: Number(document.getElementById('minSdk').value) || 24,
      targetSdk: Number(document.getElementById('targetSdk').value) || 34,
      compileSdk: Number(document.getElementById('compileSdk').value) || 34,
      includeLogin: document.getElementById('includeLogin').checked,
      includeFirebase: document.getElementById('includeFirebase').checked,
      includeGoogleMaps: document.getElementById('includeGoogleMaps').checked,
      includeAzureMaps: document.getElementById('includeAzureMaps').checked,
      includeSqlConnectVariant: document.getElementById('includeSqlConnectVariant').checked,
      includeFirestore: document.getElementById('includeFirestore').checked,
      includeLottie: document.getElementById('includeLottie').checked,
      baseUrl: document.getElementById('baseUrl').value.trim() || 'https://api.example.com/',
      sync: {
        maxRetries: Number(document.getElementById('maxRetries').value) || 0,
        periodicSyncEnabled: document.getElementById('periodicSyncEnabled').checked,
        periodicSyncIntervalMinutes: Number(document.getElementById('periodicSyncIntervalMinutes').value) || 15,
      },
      imageCache: {
        syncEnabled: document.getElementById('imageCacheSyncEnabled').checked,
        syncIntervalMinutes: Number(document.getElementById('imageCacheSyncIntervalMinutes').value) || 60,
      },
      imageBackend: document.getElementById('imageBackend').value,
    };

    const signing = {
      storeFilename: `${document.getElementById('storeFilename').value.trim()}.keystore` || "release.keystore",
      storePassword: document.getElementById('storePassword').value.trim() || "123456",
      keyAlias: document.getElementById('keyAlias').value.trim() || "test",
      keyPassword: document.getElementById('keyPassword').value.trim() || "123456",
    };

    const googleSecrets = {
      apiKey: document.getElementById('googleMapsApiKey').value.trim() || "abcdefg",
    };

    const azureSecrets = {
      apiKey: document.getElementById('azureMapsApiKey').value.trim() || "abcdefg",
    };

    const entities = Array.from(entityListEl.querySelectorAll('.entity-card')).map((card) => {
      const name = card.querySelector('.entity-name').value.trim() || 'Entity';
      const fields = Array.from(card.querySelectorAll('.field-row-item'))
        .map((row) => ({
          name: row.querySelector('.field-name').value.trim(),
          type: row.querySelector('.field-type').value,
          nullable: row.querySelector('.field-nullable').checked,
        }))
        .filter((f) => f.name.length > 0);

      return {
        name,
        fields,
        screens: {
          list: card.querySelector('.screen-list').checked,
          detail: card.querySelector('.screen-detail').checked,
          form: card.querySelector('.screen-form').checked,
        },
      };
    });

    const externalSdks = Array.from(sdkListEl.querySelectorAll('.sdk-card')).map((sdkCard) => {
      const sdkName = sdkCard.querySelector('.sdk-name').value.trim();
      const interfaces = Array.from(sdkCard.querySelectorAll(':scope > .interfaces-container > .interface-card')).map((ifaceCard) => {
        const ifaceName = ifaceCard.querySelector(':scope > .entity-card-head > .interface-name').value.trim();
        const methods = Array.from(ifaceCard.querySelectorAll(':scope > .methods-container > .method-card')).map((methodCard) => {
          const parameters = Array.from(methodCard.querySelectorAll(':scope > .params-container > .param-row-item'))
            .map((row) => ({
              name: row.querySelector('.param-name').value.trim(),
              type: row.querySelector('.param-type').value.trim(),
            }))
            .filter((p) => p.name.length > 0);
          return {
            name: methodCard.querySelector('.method-name').value.trim(),
            returnType: methodCard.querySelector('.method-return-type').value.trim(),
            suspend: methodCard.querySelector('.method-suspend').checked,
            parameters,
          };
        }).filter((m) => m.name.length > 0);
        return { name: ifaceName, methods };
      }).filter((i) => i.name.length > 0);
      return { name: sdkName, interfaces };
    }).filter((sdk) => sdk.name.length > 0);

    return { project, entities, extraScreens: extraScreens.slice(), externalSdks, signing, googleSecrets, azureSecrets };
  }

  /** Client-side mirror of the server's usesImages check (entities with an Image field, or SDK
   *  methods using RemoteImage) — used only for the live stats/graph preview. */
  function specUsesImages(spec) {
    const entityHasImage = spec.entities.some((e) => e.fields.some((f) => f.type === 'Image'));
    const sdkHasImage = spec.externalSdks.some((sdk) =>
      sdk.interfaces.some((i) =>
        i.methods.some((m) => m.returnType === 'RemoteImage' || m.parameters.some((p) => p.type === 'RemoteImage'))
      )
    );
    return entityHasImage || sdkHasImage;
  }

  function refreshStats(spec) {
    document.getElementById('statEntities').textContent = spec.entities.length;
    const screenCount = spec.entities.reduce((sum, e) => {
      return sum + Object.values(e.screens).filter(Boolean).length;
    }, spec.extraScreens.length + (spec.project.includeLogin ? 1 : 0));
    document.getElementById('statScreens').textContent = screenCount;
    let baseModules = spec.project.includeLogin ? 6 : 5; // app + core-common/ui/database/network(+auth)
    if (specUsesImages(spec)) baseModules += 1; // core-image
    if (spec.project.includeFirebase) baseModules += 1; // core-firebase
    if (spec.project.includeFirestore) baseModules += 1; // core-firestore
    document.getElementById('statModules').textContent = baseModules + spec.entities.length + spec.externalSdks.length * 2;
  }

  function centerGraphScroll(positions) {
    const panel = document.querySelector('.graph-panel');
    const svg = document.getElementById('moduleGraph');
    if (!panel || !svg || !positions.app) return;

    const svgWidth = svg.width.baseVal.value;
    const viewBoxWidth = svg.viewBox.baseVal.width;
    const viewBoxMinX = svg.viewBox.baseVal.x;

    // px-per-viewBox-unit scale factor (in case width attr != viewBox width)
    const scale = svgWidth / viewBoxWidth;

    const appCenterX = positions.app.x + positions.app.w / 2;
    const appCenterPx = (appCenterX - viewBoxMinX) * scale;

    panel.scrollLeft = Math.max(0, appCenterPx / 2);
  }

  function drawModuleGraph(spec) {
    const svg = document.getElementById('moduleGraph');
    svg.innerHTML = '';
    const ns = 'http://www.w3.org/2000/svg';

    const width = 340;
    const coreModules = ['core-common', 'core-ui', 'core-database', 'core-network'];
    if (spec.project.includeLogin) coreModules.push('core-auth');
    if (specUsesImages(spec)) coreModules.push('core-image');
    if (spec.project.includeFirebase) coreModules.push('core-firebase');
    if (spec.project.includeFirestore) coreModules.push('core-firestore');
    if (spec.project.includeLottie) coreModules.push('core-lottie');
    if (spec.project.includeGoogleMaps) coreModules.push('google-maps');
    if (spec.project.includeAzureMaps) coreModules.push('azure-maps');
    if (spec.project.includeGoogleMaps || spec.project.includeAzureMaps) coreModules.push('core-maps');
    const features = spec.entities.map((e) => `feature-${(e.name || 'entity').toLowerCase()}`);
    const sdkModules = spec.externalSdks.flatMap((sdk) => {
      const m = previewModuleName(sdk.name);
      return [m, `${m}-impl`];
    });

    const rows = [
      { y: 20, boxes: [{ label: 'app', cls: 'app' }] },
      { y: 90, boxes: features.map((f) => ({ label: f, cls: 'feature' })) },
      { y: 90 + Math.max(1, Math.ceil(features.length / 2)) * 46 + 20, boxes: coreModules.map((c) => ({ label: c, cls: 'core' })) },
    ];
    if (sdkModules.length > 0) {
      rows.push({ y: rows[2].y + 56, boxes: sdkModules.map((s) => ({ label: s, cls: 'sdk' })) });
    }

    const height = rows[rows.length - 1].y + 60;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // --- text measuring helper -------------------------------------------
    // Uses a hidden <text> node appended to the real SVG so getComputedTextLength()
    // reflects the actual font/class styling (CSS-accurate, unlike guessing metrics).
    const measurer = document.createElementNS(ns, 'text');
    measurer.setAttribute('class', 'node-label');
    measurer.style.visibility = 'hidden';
    svg.appendChild(measurer);

    function measureTextWidth(str) {
      measurer.textContent = str;
      return measurer.getComputedTextLength();
    }

    const PAD_X = 16;   // horizontal padding inside the box (8px each side)
    const MIN_W = 50;
    const MAX_W = 140;

    function displayLabelFor(label, cls) {
      const base = cls === 'core' ? label.replace('core-', '') : label;
      return base.length > 14 ? base.slice(0, 13) + '…' : base;
    }

    // --- layout: size each box to its own text, then lay out the row -----
    const positions = {};
    rows.forEach((row) => {
      const gap = 10;

      // First pass: compute each box's display label + natural width.
      const sized = row.boxes.map((box) => {
        const displayLabel = displayLabelFor(box.label, box.cls);
        const textW = measureTextWidth(displayLabel);
        const boxW = Math.min(MAX_W, Math.max(MIN_W, textW + PAD_X));
        return { ...box, displayLabel, w: boxW };
      });

      const totalW = sized.reduce((sum, b) => sum + b.w, 0) + (sized.length - 1) * gap;
      let x = (width - totalW) / 2;

      sized.forEach((box) => {
        positions[box.label] = {
          x,
          y: row.y,
          w: box.w,
          h: 30,
          cls: box.cls,
          displayLabel: box.displayLabel,
        };
        x += box.w + gap;
      });
    });

    measurer.remove();

    // Edges: app -> each feature, each feature -> each core module
    const edges = [];
    features.forEach((f) => edges.push(['app', f]));
    features.forEach((f) => coreModules.forEach((c) => edges.push([f, c])));
    if (features.length === 0) coreModules.forEach((c) => edges.push(['app', c]));

    edges.forEach(([from, to]) => {
      const a = positions[from];
      const b = positions[to];
      if (!a || !b) return;
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', a.x + a.w / 2);
      line.setAttribute('y1', a.y + a.h);
      line.setAttribute('x2', b.x + b.w / 2);
      line.setAttribute('y2', b.y);
      line.setAttribute('class', 'edge-line');
      svg.appendChild(line);
    });

    Object.entries(positions).forEach(([label, pos]) => {
      const cls = pos.cls;
      const rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('x', pos.x);
      rect.setAttribute('y', pos.y);
      rect.setAttribute('width', pos.w);
      rect.setAttribute('height', pos.h);
      rect.setAttribute('rx', 3);
      rect.setAttribute('class', `node-box ${cls}`);
      svg.appendChild(rect);

      const text = document.createElementNS(ns, 'text');
      text.setAttribute('x', pos.x + pos.w / 2);
      text.setAttribute('y', pos.y + pos.h / 2);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('class', 'node-label');
      text.textContent = pos.displayLabel;
      svg.appendChild(text);
    });

    // after computing `positions`...
    const allX = Object.values(positions).flatMap((p) => [p.x, p.x + p.w]);
    const minX = Math.min(0, ...allX);
    const maxX = Math.max(width, ...allX);
    const contentWidth = maxX - minX;

    svg.setAttribute('viewBox', `${minX} 0 ${contentWidth} ${height}`);
    svg.setAttribute('width', contentWidth);   // real px width so the panel can scroll to it
    svg.setAttribute('height', height);

    centerGraphScroll(positions);
  }

  function refreshAll() {
    const spec = collectSpec();
    refreshStats(spec);
    drawModuleGraph(spec);
  }

  function renderChips() {
    extraScreenChips.innerHTML = '';
    extraScreens.forEach((name, idx) => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.innerHTML = `${name} <button type="button">✕</button>`;
      chip.querySelector('button').addEventListener('click', () => {
        extraScreens.splice(idx, 1);
        renderChips();
        refreshAll();
      });
      extraScreenChips.appendChild(chip);
    });
  }

  document.getElementById('addEntityBtn').addEventListener('click', () => addEntity());
  document.getElementById('addSdkBtn').addEventListener('click', () => addSdk());

  document.getElementById('addExtraScreenBtn').addEventListener('click', () => {
    const input = document.getElementById('extraScreenInput');
    const value = input.value.trim();
    if (value) {
      extraScreens.push(value);
      input.value = '';
      renderChips();
      refreshAll();
    }
  });

  ['appName', 'packageName', 'minSdk', 'targetSdk', 'compileSdk', 'baseUrl', 'maxRetries', 'periodicSyncIntervalMinutes', 'imageCacheSyncIntervalMinutes'].forEach((id) => {
    document.getElementById(id).addEventListener('input', refreshAll);
  });

  document.getElementById('includeLogin').addEventListener('change', refreshAll);
  document.getElementById('includeLottie').addEventListener('change', refreshAll);
  document.getElementById('includeGoogleMaps').addEventListener('change', refreshAll);
  document.getElementById('includeAzureMaps').addEventListener('change', refreshAll);
  const includeFirebaseCheckbox = document.getElementById('includeFirebase');
  const imageBackendSelect = document.getElementById('imageBackend');
  const firebaseStorageOption = imageBackendSelect.querySelector('option[value="firebase-storage"]');
  const sqlConnectCheckbox = document.getElementById('includeSqlConnectVariant');
  const firestoreCheckbox = document.getElementById('includeFirestore');

  function syncFirebaseDependents() {
    const firebaseOn = includeFirebaseCheckbox.checked;

    firebaseStorageOption.disabled = !firebaseOn;
    if (!firebaseOn && imageBackendSelect.value === 'firebase-storage') {
      imageBackendSelect.value = 'rest';
    }

    sqlConnectCheckbox.disabled = !firebaseOn;
    if (!firebaseOn) sqlConnectCheckbox.checked = false;

    firestoreCheckbox.disabled = !firebaseOn;
    if (!firebaseOn) firestoreCheckbox.checked = false;
  }

  includeFirebaseCheckbox.addEventListener('change', () => {
    syncFirebaseDependents();
    refreshAll();
  });
  imageBackendSelect.addEventListener('change', refreshAll);
  sqlConnectCheckbox.addEventListener('change', refreshAll);
  firestoreCheckbox.addEventListener('change', refreshAll);
  syncFirebaseDependents();

  const periodicToggle = document.getElementById('periodicSyncEnabled');
  const periodicInterval = document.getElementById('periodicSyncIntervalMinutes');
  periodicToggle.addEventListener('change', () => {
    periodicInterval.disabled = !periodicToggle.checked;
    refreshAll();
  });

  const imageSyncToggle = document.getElementById('imageCacheSyncEnabled');
  const imageSyncInterval = document.getElementById('imageCacheSyncIntervalMinutes');
  imageSyncToggle.addEventListener('change', () => {
    imageSyncInterval.disabled = !imageSyncToggle.checked;
    refreshAll();
  });

  const togglers = document.getElementsByClassName('toggler')
  for (let i = 0; i < togglers.length; i++) {
    const toggler = togglers[i];
    toggler.addEventListener('click', async () => {
      const passwordChildren = toggler.closest("div.password-field").children
      for (let c = 0; c < passwordChildren.length; c++) {
        const password = passwordChildren[c];
        if (!Array.of("password".toUpperCase(), "text".toUpperCase()).includes((password.type || '').toUpperCase())) {
          return
        }
        if (password.type === 'password') {
          password.type = 'text';
          toggler.innerHTML = 'visibility_off'; // Change icon to indicate visibility
        } else {
          password.type = 'password';
          toggler.innerHTML = 'visibility'; // Change icon back
        }
      }
    })
  }

  document.getElementById('generateBtn').addEventListener('click', async () => {
    const btn = document.getElementById('generateBtn');
    const previewBtn = document.getElementById('previewBtn');
    const statusMsg = document.getElementById('statusMsg');
    const spec = collectSpec();

    if (spec.entities.length === 0) {
      statusMsg.textContent = 'Add at least one entity before generating.';
      statusMsg.className = 'status error';
      return;
    }

    btn.disabled = true;
    previewBtn.disabled = true;
    statusMsg.textContent = 'Generating project…';
    statusMsg.className = 'status';

    try {
      const response = await fetch(
        `${useHttpsForApiCall ? 'https' : 'http'}://${apiServerUrl}/api/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(spec),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Generation failed.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${spec.project.appName.replace(/\s+/g, '')}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      statusMsg.textContent = 'Downloaded. Unzip and open in Android Studio.';
      statusMsg.className = 'status success';
    } catch (err) {
      statusMsg.textContent = err.message || 'Something went wrong.';
      statusMsg.className = 'status error';
    } finally {
      btn.disabled = false;
      previewBtn.disabled = false;
    }
  });

  document.getElementById('cleanPreview').addEventListener('click', async () => {
    const statusMsg = document.getElementById('statusMsg');
    const previewContent = document.getElementById('previewContent');

    statusMsg.textContent = '';
    statusMsg.className = 'status';
    previewContent.innerHTML = '-';
  });

  document.getElementById('includeGoogleMaps').addEventListener('change', () => {
    const googleMapsApiKeyInput = document.getElementById("googleMapsApiKey");

    googleMapsApiKeyInput.disabled = !googleMapsApiKeyInput.disabled;
  });

  document.getElementById('includeAzureMaps').addEventListener('change', () => {
    const azureMapsApiKeyInput = document.getElementById("azureMapsApiKey");

    azureMapsApiKeyInput.disabled = !azureMapsApiKeyInput.disabled;
  });

  document.getElementById('contactBtn').addEventListener('click', async () => {
    const generationFormHidden = generationForm.classList.contains("hidden");
    const contactFormHidden = contactForm.classList.contains("hidden");

    if (generationFormHidden) {
      window.location.hash = ""
      contactForm.classList.add("hidden");
      generationForm.classList.remove("hidden");
      contactBtn.innerHTML = '<span class="material-symbols-outlined">mail</span><span style="vertical-align: super">&nbsp;Contact me</span>';
    } else if (contactFormHidden) {
      showContactForm()
    }
  });

  document.getElementById('previewBtn').addEventListener('click', async () => {
    const btn = document.getElementById('previewBtn');
    const generateBtn = document.getElementById('generateBtn');
    const statusMsg = document.getElementById('statusMsg');
    const previewContent = document.getElementById('previewContent');
    const spec = collectSpec();

    if (spec.entities.length === 0) {
      statusMsg.textContent = 'Add at least one entity before generating.';
      statusMsg.className = 'status error';
      return;
    }

    btn.disabled = true;
    generateBtn.disabled = true;
    statusMsg.textContent = 'Previewing project…';
    statusMsg.className = 'status';

    try {
      const response = await fetch(
        `${useHttpsForApiCall ? 'https' : 'http'}://${apiServerUrl}/api/preview`, {
          method: 'POST',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(spec),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Preview failed.');
      }

      const json = JSON.stringify(
          await response.json(), null, 4
      );

      previewContent.innerHTML = json;

      statusMsg.textContent = 'Preview loaded successfully.';
      statusMsg.className = 'status success';
    } catch (err) {
      statusMsg.textContent = err.message || 'Something went wrong.';
      statusMsg.className = 'status error';
    } finally {
      btn.disabled = false;
      generateBtn.disabled = false;
    }
  });

  document.getElementById("contactForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const response = await fetch(
        `${useHttpsForApiCall ? 'https' : 'http'}://${apiServerUrl}/api/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            message: document.getElementById("message").value
          })
        }
    );

    const data = await response.json();
    const messageSent = data.success

    Swal.fire({
      title: messageSent ? "Message sent!" : "Sorry, message not sent :(",
      text: messageSent ? "Thanks, I will contact you back as soon as possible :)" : "Please, try again later",
      footer: !messageSent ? data.error || "Unknown error" : null,
      icon:  messageSent ? "success" : "error",
    })
  });

  // Seed with one example entity so the graph and form aren't empty on load.
  addEntity('Task');
  renderChips();
})();
