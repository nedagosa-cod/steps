/* ─────────────────────────────────────────────────────────────
   SimuBuild — Standalone Player Logic (app.js)
   Mirrors PreviewMode.jsx 1:1
   ───────────────────────────────────────────────────────────── */

(function () {
    "use strict";

    // ── Trigger color palette (mirrors triggers.js) ──────────
    const TRIGGER_COLORS = {
        click: { bg: 'rgba(124,92,252,0.15)', bgActive: 'rgba(124,92,252,0.28)', border: 'rgba(124,92,252,0.35)', borderActive: 'rgba(124,92,252,0.9)', label: '#7c5cfc' },
        double_click: { bg: 'rgba(255,152,0,0.15)', bgActive: 'rgba(255,152,0,0.28)', border: 'rgba(255,152,0,0.35)', borderActive: 'rgba(255,152,0,0.9)', label: '#ff9800' },
        input: { bg: 'rgba(56,139,253,0.12)', bgActive: 'rgba(56,139,253,0.25)', border: 'rgba(56,139,253,0.35)', borderActive: 'rgba(56,139,253,0.9)', label: '#388bfd' },
        dropdown: { bg: 'rgba(56,139,253,0.12)', bgActive: 'rgba(56,139,253,0.25)', border: 'rgba(56,139,253,0.35)', borderActive: 'rgba(56,139,253,0.9)', label: '#388bfd' },
        dependent_dropdown: { bg: 'rgba(56,139,253,0.12)', bgActive: 'rgba(56,139,253,0.25)', border: 'rgba(56,139,253,0.35)', borderActive: 'rgba(56,139,253,0.9)', label: '#388bfd' },
        keypress: { bg: 'rgba(232,62,140,0.15)', bgActive: 'rgba(232,62,140,0.28)', border: 'rgba(232,62,140,0.35)', borderActive: 'rgba(232,62,140,0.9)', label: '#e83e8c' },
        scroll_area: { bg: 'rgba(16,185,129,0.10)', bgActive: 'rgba(16,185,129,0.18)', border: 'rgba(16,185,129,0.35)', borderActive: 'rgba(16,185,129,0.9)', label: '#10b981' },
        radio: { bg: 'rgba(251,146,60,0.10)', bgActive: 'rgba(251,146,60,0.18)', border: 'rgba(251,146,60,0.35)', borderActive: 'rgba(251,146,60,0.9)', label: '#fb923c' },
        checkbox: { bg: 'rgba(6,182,212,0.10)', bgActive: 'rgba(6,182,212,0.18)', border: 'rgba(6,182,212,0.35)', borderActive: 'rgba(6,182,212,0.9)', label: '#06b6d4' },
    };

    // ── Data ──────────────────────────────────────────────────
    const { nodes, edges, globalConfig = {} } = window.SIM_DATA;
    const getNode = (id) => nodes.find(n => n.id === id);

    // ── Apply Transition Config CSS ─────────────────────────
    (function applyTransitionConfig() {
        const effect = globalConfig.transitionEffect || 'fade';
        const style = document.createElement('style');

        let transCss = `
            #image-wrapper { transition: opacity 250ms ease-out, transform 250ms ease-out, filter 250ms ease-out !important; }
            #image-wrapper.transitioning { opacity: 0 !important; }
            .auth-backdrop { transition: opacity 250ms ease-out, transform 250ms ease-out, filter 250ms ease-out !important; }
            .auth-backdrop.transitioning { opacity: 0 !important; }
        `;

        if (effect === 'none') {
            transCss = `
                #image-wrapper { transition: none !important; }
                #image-wrapper.transitioning { opacity: 0 !important; }
                .auth-backdrop { transition: none !important; }
                .auth-backdrop.transitioning { opacity: 0 !important; }
            `;
        } else if (effect === 'zoom') {
            transCss += `#image-wrapper.transitioning, .auth-backdrop.transitioning { transform: scale(0.95) !important; filter: blur(4px) !important; }`;
        } else if (effect === 'slide-left') {
            transCss += `#image-wrapper.transitioning, .auth-backdrop.transitioning { transform: translateX(30px) !important; filter: blur(2px) !important; }`;
        } else if (effect === 'slide-right') {
            transCss += `#image-wrapper.transitioning, .auth-backdrop.transitioning { transform: translateX(-30px) !important; filter: blur(2px) !important; }`;
        } else if (effect === 'slide-up') {
            transCss += `#image-wrapper.transitioning, .auth-backdrop.transitioning { transform: translateY(30px) !important; filter: blur(2px) !important; }`;
        } else {
            transCss += `#image-wrapper.transitioning, .auth-backdrop.transitioning { transform: none !important; filter: none !important; }`;
        }

        style.textContent = transCss;
        document.head.appendChild(style);
    })();

    // ── Compute node traversal order ─────────────────────────
    const startNode = nodes.find(n => n.data?.isStartNode) || nodes.find(n => !edges.some(e => e.target === n.id)) || nodes[0];
    const order = [];
    {
        let cursor = startNode?.id; const visited = new Set();
        while (cursor && !visited.has(cursor)) { order.push(cursor); visited.add(cursor); cursor = edges.find(e => e.source === cursor)?.target; }
    }

    const getNextNodeId = () => edges.find(e => e.source === currentNodeId)?.target;

    // ── State ────────────────────────────────────────────────
    let currentNodeId = startNode?.id;
    let completedTriggers = new Set();
    let inputValues = {};
    let isTransitioning = false;
    let timeRemaining = null;
    let timerRef = null;
    let hasTimerStarted = false;

    // ── DOM refs ─────────────────────────────────────────────
    const elScreenName = document.getElementById("ui-screen-name");
    const elStepIndicator = document.getElementById("ui-step-indicator");
    const elProgressRow = document.getElementById("ui-progress-row");
    const elError = document.getElementById("ui-error");
    const elErrorText = document.getElementById("ui-error-text");
    const elSuccess = document.getElementById("ui-success");
    const elImageWrapper = document.getElementById("image-wrapper");
    const elPracticeGuide = document.getElementById("ui-practice-guide");
    const elPracticeContent = document.getElementById("ui-practice-guide-content");
    const elHud = document.getElementById("hud");
    const elTimer = document.getElementById("ui-timer");
    const elTimerValue = document.getElementById("ui-timer-value");
    const elBtnFullscreen = document.getElementById("btn-fullscreen");
    const elBtnExit = document.getElementById("btn-exit");

    // ── Helpers ──────────────────────────────────────────────
    function normalizeTriggers(data) {
        if (data.triggers && data.triggers.length) return data.triggers;
        if (data.hotspot) return [{ id: 'legacy', type: 'click', hotspot: data.hotspot }];
        return [];
    }

    function showError(msg) {
        elErrorText.textContent = msg || "Texto incorrecto. Intenta de nuevo.";
        elError.style.display = "flex";
        setTimeout(() => { elError.style.display = "none"; }, 2200);
    }

    function showSuccess() {
        elSuccess.style.display = "flex";
    }

    /** Create an SVG chevron-down icon using createElementNS (no innerHTML!) */
    function createChevronSVG(color) {
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg");
        svg.setAttribute("width", "14");
        svg.setAttribute("height", "14");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", color);
        svg.setAttribute("stroke-width", "2");
        svg.setAttribute("stroke-linecap", "round");
        svg.setAttribute("stroke-linejoin", "round");
        const path = document.createElementNS(ns, "path");
        path.setAttribute("d", "m6 9 6 6 6-6");
        svg.appendChild(path);
        return svg;
    }

    // ── Draggable HUD ────────────────────────────────────────
    (function initDrag() {
        const handle = document.getElementById("hud-drag");
        let dragging = false, startX, startY, origX, origY;
        handle.addEventListener("pointerdown", (e) => {
            dragging = true; handle.setPointerCapture(e.pointerId);
            const rect = elHud.getBoundingClientRect();
            startX = e.clientX; startY = e.clientY;
            origX = rect.left; origY = rect.top;
        });
        window.addEventListener("pointermove", (e) => {
            if (!dragging) return;
            elHud.style.left = (origX + e.clientX - startX) + "px";
            elHud.style.top = (origY + e.clientY - startY) + "px";
        });
        window.addEventListener("pointerup", () => { dragging = false; });
    })();

    // ── Fullscreen ───────────────────────────────────────────
    elBtnFullscreen.addEventListener("click", () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
        } else {
            document.exitFullscreen();
        }
    });

    // ── Exit button — just reload ────────────────────────────
    elBtnExit.addEventListener("click", () => { location.reload(); });

    // ── Navigation ───────────────────────────────────────────
    function navigate(targetId) {
        if (isTransitioning || !targetId) return;
        isTransitioning = true;
        elImageWrapper.classList.add("transitioning");
        elProgressRow.classList.add("transitioning");
        elError.style.display = "none";
        elSuccess.style.display = "none";
        completedTriggers = new Set();
        const preservedAuthName = inputValues["auth_name"] || "";
        inputValues = { "auth_name": preservedAuthName };

        const effect = globalConfig.transitionEffect || 'fade';
        const delay = effect === 'none' ? 0 : 280;

        setTimeout(() => {
            currentNodeId = targetId;
            render();
            elImageWrapper.classList.remove("transitioning");
            elProgressRow.classList.remove("transitioning");
            isTransitioning = false;
        }, delay);
    }

    // ── Trigger completion ───────────────────────────────────
    function handleTriggerComplete(tId, triggers, silent) {
        completedTriggers.add(tId);

        // If completing a correct radio, also mark all siblings in the group as done
        if (!silent) {
            const t = triggers.find(tr => tr.id === tId);
            if (t && t.type === "radio" && t.radioGroup) {
                triggers.forEach(tr => {
                    if (tr.type === "radio" && tr.radioGroup === t.radioGroup && tr.id !== tId) {
                        completedTriggers.add(tr.id);
                    }
                });
            }
        }

        render();

        // Silent mode: just mark as done, no navigation (used for radio group siblings)
        if (silent) return;

        const effect = globalConfig.transitionEffect || 'fade';
        const delay = effect === 'none' ? 10 : 350;

        // Check for explicit navigation branching
        const t = triggers.find(tr => tr.id === tId);
        if (t && t.navigateTarget) {
            setTimeout(() => navigate(t.navigateTarget), delay);
            return;
        }

        // Normal: all non-optional done?
        const allDone = triggers.every(tr => tr.isOptional || completedTriggers.has(tr.id));
        if (allDone) {
            const nextId = getNextNodeId();
            if (nextId) {
                setTimeout(() => navigate(nextId), delay);
            } else {
                showSuccess();
            }
        }
    }

    // ── Practice Guide ───────────────────────────────────────
    function renderPracticeGuide(triggers) {
        const isPractice = sessionStorage.getItem("isPracticeMode") === "true";
        const node = getNode(currentNodeId);
        if (isPractice && node?.type !== "authNode") {
            elPracticeGuide.style.display = "flex";
            const guideTriggers = triggers.filter(t => !t.isOptional);

            if (guideTriggers.length === 0) {
                elPracticeContent.innerHTML = "";
                const msg = document.createElement("div");
                msg.style.cssText = "font-size:11px;color:var(--color-text-muted);font-style:italic";
                msg.textContent = "No hay acciones obligatorias en esta pantalla.";
                elPracticeContent.appendChild(msg);
                return;
            }

            elPracticeContent.innerHTML = "";
            guideTriggers.forEach((t, index) => {
                const done = completedTriggers.has(t.id);
                const depsArray = Array.isArray(t.dependsOn) ? t.dependsOn : (t.dependsOn ? [t.dependsOn] : []);
                const isBlocked = depsArray.length > 0 && depsArray.some(depId => !completedTriggers.has(depId));
                let hint = t.hint;
                if (!hint) {
                    switch (t.type) {
                        case "click": hint = "Haz clic en la zona indicada."; break;
                        case "double_click": hint = "Haz doble clic en la zona indicada."; break;
                        case "input": hint = "Completa el campo de texto."; break;
                        case "dropdown": hint = "Selecciona la opción correcta en la lista."; break;
                        case "dependent_dropdown": hint = "Selecciona la subcategoría correcta."; break;
                        case "keypress": hint = "Presiona la tecla " + (t.keyCode || "?") + "."; break;
                        case "scroll_area": hint = "Desplaza el contenido hacia abajo."; break;
                        case "radio": hint = "Selecciona la opción correcta."; break;
                        case "checkbox": hint = "Marca la casilla correcta."; break;
                        default: hint = "Realiza la acción requerida.";
                    }
                }

                const row = document.createElement("div");
                row.style.cssText = "display:flex;align-items:flex-start;gap:8px;opacity:" + (done ? "0.4" : (isBlocked ? "0.6" : "1")) + ";transition:all 300ms ease";

                const circle = document.createElement("div");
                circle.style.cssText = "margin-top:2px;width:14px;height:14px;border-radius:50%;border:1px solid " + (done ? "#5ac98a" : "var(--color-border-strong)") + ";background:" + (done ? "rgba(90,201,138,0.2)" : "transparent") + ";display:flex;align-items:center;justify-content:center;flex-shrink:0";
                if (done) { const ck = document.createElement("span"); ck.textContent = "✓"; ck.style.cssText = "color:#5ac98a;font-size:10px"; circle.appendChild(ck); }

                const text = document.createElement("div");
                text.style.cssText = "font-size:12px;color:" + (done ? "var(--color-text-muted)" : "var(--color-text-primary)") + ";text-decoration:" + (done ? "line-through" : "none") + ";line-height:1.4;flex:1";
                const stepLabel = document.createElement("span");
                stepLabel.style.cssText = "font-weight:600;margin-right:4px";
                stepLabel.textContent = "Paso " + (index + 1) + ":";
                text.appendChild(stepLabel);
                text.appendChild(document.createTextNode(" " + hint));

                row.appendChild(circle);
                row.appendChild(text);

                if (!done && !isBlocked) {
                    const btn = document.createElement("button");
                    btn.title = "Ver dónde hacer clic";
                    btn.style.cssText = "background:transparent;border:none;cursor:pointer;color:var(--color-text-muted);display:flex;align-items:center;justify-content:center;padding:4px;border-radius:4px;flex-shrink:0";
                    btn.onmouseenter = (e) => { e.currentTarget.style.color = "var(--color-brand)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; };
                    btn.onmouseleave = (e) => { e.currentTarget.style.color = "var(--color-text-muted)"; e.currentTarget.style.background = "transparent"; };
                    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>';
                    btn.onclick = () => {
                        const el = document.getElementById("trigger-" + t.id);
                        if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            const oldBoxShadow = el.style.boxShadow;
                            let cycle = 0;
                            const interval = setInterval(() => {
                                el.style.boxShadow = cycle % 2 === 0 ? "0 0 0 4px var(--color-brand), 0 0 20px var(--color-brand)" : oldBoxShadow;
                                cycle++;
                                if (cycle > 5) {
                                    clearInterval(interval);
                                    el.style.boxShadow = oldBoxShadow;
                                }
                            }, 300);
                        }
                    };
                    row.appendChild(btn);
                }

                elPracticeContent.appendChild(row);
            });
        } else {
            elPracticeGuide.style.display = "none";
        }
    }

    // ── Build a single trigger DOM element ────────────────────
    function buildTriggerElement(t, triggers) {
        const hs = t.hotspot || { x: 30, y: 40, w: 20, h: 10 };
        const colors = TRIGGER_COLORS[t.type] || TRIGGER_COLORS.click;
        const isDone = completedTriggers.has(t.id);
        const depsArray = Array.isArray(t.dependsOn) ? t.dependsOn : (t.dependsOn ? [t.dependsOn] : []);
        const isBlocked = depsArray.length > 0 && depsArray.some(depId => !completedTriggers.has(depId));

        const el = document.createElement("div");
        el.className = "trigger";
        el.id = "trigger-" + t.id;
        el.style.left = hs.x + "%"; el.style.top = hs.y + "%";
        el.style.width = hs.w + "%"; el.style.height = hs.h + "%";
        el.style.pointerEvents = isBlocked ? "none" : "auto";
        el.style.opacity = isBlocked ? "0.35" : "1";

        if (isDone && !t.hidden) {
            el.style.background = "var(--color-success-bg)";
            el.style.border = "1.5px solid var(--color-success-border)";
            el.style.cursor = "default"; el.style.pointerEvents = "none";
        }

        // ── Click / Double Click ─────────────────────────────
        if (t.type === "click" || t.type === "double_click") {
            if (!isDone) {
                el.style.border = t.hidden ? "none" : "1.5px solid " + colors.borderActive;
                el.style.background = t.hidden ? "transparent" : colors.bgActive;
                el.style.cursor = "pointer";
            }
            const handler = t.type === "click" ? "click" : "dblclick";
            el.addEventListener(handler, () => {
                if (!isDone && !isBlocked) handleTriggerComplete(t.id, triggers);
            });
            if (isDone && !t.hidden) {
                const ck = document.createElement("span");
                ck.textContent = "✓"; ck.style.cssText = "font-size:14px;color:#5ac98a";
                el.appendChild(ck);
            }
        }

        // ── Input ────────────────────────────────────────────
        else if (t.type === "input") {
            el.style.overflow = "hidden"; el.style.display = "flex"; el.style.alignItems = "center";
            if (!isDone) {
                el.style.border = t.hidden ? "none" : "1.5px solid " + colors.borderActive;
            }
            const wrap = document.createElement("div");
            wrap.style.cssText = "position:relative;width:100%;height:100%";

            const inp = document.createElement("input");
            inp.type = t.isPassword ? "password" : "text";
            inp.value = inputValues[t.id] || "";
            inp.placeholder = t.placeholderText || (t.isPassword ? "••••••" : "Escribe aquí...");
            inp.disabled = isBlocked || isDone;
            inp.style.cssText = "width:100%;height:100%;border:none;outline:none;padding:0 6px;font-family:inherit;caret-color:" + colors.label;
            inp.style.background = t.hidden ? "transparent" : (isDone ? "rgba(46,165,103,0.15)" : "rgba(10,13,18,0.75)");
            inp.style.color = t.hidden ? "var(--color-text-primary)" : (isDone ? "#5ac98a" : "#e2eaf4");
            inp.style.fontSize = t.fontSize ? t.fontSize + "px" : "clamp(11px, 1.3vw, 18px)";

            inp.addEventListener("input", () => {
                const val = inp.value;
                inputValues[t.id] = val;
                if (!isBlocked && !isDone) {
                    const expected = (t.validationValue || "").trim();
                    if (expected && val.trim() === expected) {
                        handleTriggerComplete(t.id, triggers);
                    }
                }
            });
            inp.addEventListener("keydown", (e) => {
                if (e.key === "Enter" && !isBlocked && !isDone) {
                    const val = (inp.value || "").trim();
                    const expected = (t.validationValue || "").trim();
                    if (!expected || val === expected) {
                        handleTriggerComplete(t.id, triggers);
                    } else {
                        showError();
                    }
                }
            });
            wrap.appendChild(inp);

            if (isDone && !t.hidden) {
                const ck = document.createElement("div");
                ck.style.cssText = "position:absolute;right:8px;top:50%;transform:translateY(-50%);display:flex;pointer-events:none";
                const sp = document.createElement("span");
                sp.textContent = "✓"; sp.style.cssText = "font-size:14px;color:#5ac98a";
                ck.appendChild(sp); wrap.appendChild(ck);
            }
            el.appendChild(wrap);
        }

        // ── Input Date (Calendar) ────────────────────────────
        else if (t.type === "input_date") {
            el.style.overflow = "hidden";
            if (!isDone) el.style.border = t.hidden ? "none" : ("1.5px solid " + colors.borderActive);

            const wrap = document.createElement("div");
            wrap.style.cssText = "position:relative;width:100%;height:100%";

            const input = document.createElement("input");
            input.type = "date";
            input.value = inputValues[t.id] || "";
            input.disabled = isBlocked;

            input.style.cssText = `
                width:100%; height:100%; border:none; outline:none;
                background:${t.hidden ? 'transparent' : (isDone ? 'rgba(46,165,103,0.15)' : 'rgba(10,13,18,0.75)')};
                color:${t.hidden ? 'var(--color-text-primary)' : (isDone ? '#5ac98a' : '#e2eaf4')};
                font-size:${t.fontSize ? t.fontSize + 'px' : 'clamp(11px, 1.3vw, 16px)'};
                padding:0 6px; font-family:inherit; color-scheme:dark;
            `;

            input.addEventListener("change", (e) => {
                const val = e.target.value;
                inputValues[t.id] = val;
                if (!isBlocked && !isDone) {
                    if (!t.validationValue || val === t.validationValue) {
                        handleTriggerComplete(t.id, triggers);
                    } else if (t.validationValue && val !== t.validationValue) {
                        showError();
                    }
                }
            });

            wrap.appendChild(input);

            if (isDone && !t.hidden) {
                const check = document.createElement("div");
                check.style.cssText = "position:absolute;right:28px;top:50%;transform:translateY(-50%);font-size:14px;color:#5ac98a;pointer-events:none;";
                check.textContent = "✓";
                wrap.appendChild(check);
            }
            el.appendChild(wrap);
        }

        // ── Dropdown ─────────────────────────────────────────
        else if (t.type === "dropdown") {
            const useNative = t.nativeStyles && !t.hidden;
            el.style.overflow = "hidden"; el.style.display = "flex"; el.style.alignItems = "center";
            if (!isDone) {
                el.style.border = t.hidden ? "none" : (useNative ? "none" : "1.5px solid " + colors.borderActive);
            }
            const wrap = document.createElement("div");
            wrap.style.cssText = "position:relative;width:100%;height:100%";

            const sel = document.createElement("select");
            sel.style.cssText = "width:100%;height:100%;outline:none";
            applySelectStyles(sel, t, isDone, useNative);
            sel.disabled = isBlocked;

            const defaultOpt = document.createElement("option");
            defaultOpt.value = ""; defaultOpt.disabled = true;
            defaultOpt.textContent = "Selecciona...";
            if (!inputValues[t.id]) defaultOpt.selected = true;
            sel.appendChild(defaultOpt);

            const options = [...new Set((t.optionsText || "").split("\n").map(o => o.trim()).filter(Boolean))];
            options.forEach(opt => {
                const o = document.createElement("option");
                o.value = opt; o.textContent = opt;
                if (opt === inputValues[t.id]) o.selected = true;
                sel.appendChild(o);
            });

            sel.addEventListener("change", () => {
                const val = sel.value;
                inputValues[t.id] = val;
                render(); // re-render for dependent dropdowns
                if (!isBlocked && !isDone) {
                    if (!t.validationValue || val === t.validationValue) {
                        handleTriggerComplete(t.id, triggers);
                    } else if (t.validationValue && val !== t.validationValue) {
                        showError();
                    }
                }
            });
            wrap.appendChild(sel);
            appendDropdownIcon(wrap, t, isDone, useNative);
            el.appendChild(wrap);
        }

        // ── Dependent Dropdown ───────────────────────────────
        else if (t.type === "dependent_dropdown") {
            const useNative = t.nativeStyles && !t.hidden;
            el.style.overflow = "hidden"; el.style.display = "flex"; el.style.alignItems = "center";
            if (!isDone) {
                el.style.border = t.hidden ? "none" : (useNative ? "none" : "1.5px solid " + colors.borderActive);
            }

            // Parse category map
            const rows = (t.optionsText || "").split("\n").filter(Boolean);
            const cMap = {};
            rows.forEach(r => {
                let parts = r.split(/\t/);
                if (parts.length < 2) parts = r.split(/ - /);
                if (parts.length < 2) parts = r.split(/;/);
                if (parts.length < 2) parts = r.split(/,/);
                if (parts.length < 2) parts = r.split(/ {2,}/);
                if (parts.length < 2 && r.includes("-")) { const idx = r.indexOf("-"); parts = [r.substring(0, idx), r.substring(idx + 1)]; }
                if (parts.length < 2 && r.includes(":")) { const idx = r.indexOf(":"); parts = [r.substring(0, idx), r.substring(idx + 1)]; }
                parts = parts.map(s => s.trim()).filter(Boolean);
                const colIdx = t.dataColumnIndex ? Math.max(2, parseInt(t.dataColumnIndex)) : 2;
                let parentColIdx = colIdx - 2, childColIdx = colIdx - 1;
                if (parts.length === 2 && colIdx > 2) { parentColIdx = 0; childColIdx = 1; }
                if (parts.length > parentColIdx && parts.length > childColIdx) {
                    const cat = parts[parentColIdx].toLowerCase();
                    const sub = parts[childColIdx];
                    if (!cMap[cat]) cMap[cat] = [];
                    if (!cMap[cat].includes(sub)) cMap[cat].push(sub);
                }
            });

            const rawParentVal = inputValues[t.dependsOnTriggerId] || "";
            const parentVal = rawParentVal.toLowerCase().trim();
            const subcategories = cMap[parentVal] || [];

            if (!parentVal) { el.style.opacity = "0.35"; el.style.pointerEvents = "none"; }

            const wrap = document.createElement("div");
            wrap.style.cssText = "position:relative;width:100%;height:100%";

            const sel = document.createElement("select");
            sel.style.cssText = "width:100%;height:100%;outline:none;flex:1";
            applySelectStyles(sel, t, isDone, useNative);
            sel.disabled = isBlocked || !parentVal;

            const emptyOpt = document.createElement("option");
            emptyOpt.value = ""; emptyOpt.disabled = true; emptyOpt.textContent = "Selecciona...";
            if (!inputValues[t.id]) emptyOpt.selected = true;
            sel.appendChild(emptyOpt);

            subcategories.forEach(opt => {
                const o = document.createElement("option");
                o.value = opt; o.textContent = opt;
                if (opt === inputValues[t.id]) o.selected = true;
                sel.appendChild(o);
            });

            sel.addEventListener("change", () => {
                const val = sel.value;
                inputValues[t.id] = val;
                render();
                if (!isBlocked && !isDone) {
                    if (!t.validationValue || val === t.validationValue) {
                        handleTriggerComplete(t.id, triggers);
                    } else if (t.validationValue && val !== t.validationValue) {
                        showError();
                    }
                }
            });
            wrap.appendChild(sel);
            appendDropdownIcon(wrap, t, isDone, useNative);
            el.appendChild(wrap);
        }

        // ── Keypress ─────────────────────────────────────────
        else if (t.type === "keypress") {
            el.style.pointerEvents = "none"; // visual only
            if (!isDone) {
                el.style.border = t.hidden ? "none" : "1.5px solid " + colors.borderActive;
                el.style.background = t.hidden ? "transparent" : colors.bgActive;
            }
            if (!t.hidden) {
                if (isDone) {
                    const ck = document.createElement("span");
                    ck.textContent = "✓"; ck.style.cssText = "font-size:14px;color:#5ac98a";
                    el.appendChild(ck);
                } else {
                    const badge = document.createElement("span");
                    badge.textContent = t.keyCode || "?";
                    badge.style.cssText = "font-size:clamp(10px,1vw,14px);font-weight:700;color:" + colors.label + ";background:rgba(10,13,18,0.5);padding:2px 6px;border-radius:4px;text-transform:uppercase;letter-spacing:0.05em";
                    el.appendChild(badge);
                }
            }
        }

        // ── Scroll Area ──────────────────────────────────────
        else if (t.type === "scroll_area") {
            el.style.border = t.hidden ? "none" : "1px dashed " + colors.borderActive;
            el.style.overflowY = "auto"; el.style.overflowX = "hidden";
            el.style.background = "transparent"; el.style.display = "block";
            if (t.contentImage) {
                const img = document.createElement("img");
                img.src = t.contentImage; img.alt = "Contenido scroll";
                img.draggable = false;
                img.style.cssText = "width:100%;height:auto;display:block";
                el.appendChild(img);
            } else if (!t.hidden) {
                const placeholder = document.createElement("div");
                placeholder.textContent = "[Área de Scroll sin imagen]";
                placeholder.style.cssText = "padding:10px;text-align:center;color:" + colors.label + ";font-size:11px;background:rgba(10,13,18,0.8);min-height:100%";
                el.appendChild(placeholder);
            }
        }

        // ── Radio ─────────────────────────────────────────────
        else if (t.type === "radio") {
            const groupName = t.radioGroup || t.id;
            const groupKey = "_radioGroup_" + groupName;
            const isSelectedInGroup = inputValues[groupKey] === t.id;

            el.style.borderRadius = "4px";
            el.style.display = "flex";
            el.style.alignItems = "center";
            el.style.gap = "6px";
            el.style.padding = "0 8px";
            el.style.cursor = isDone ? "default" : "pointer";

            if (!isDone) {
                el.style.border = t.hidden ? "none" : "1.5px solid " + colors.borderActive;
                el.style.background = t.hidden ? "transparent" : "rgba(10,13,18,0.75)";
            }

            // Radio circle
            const circle = document.createElement("span");
            circle.style.cssText = "width:14px;height:14px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 150ms;border:2px solid " + (isSelectedInGroup ? (isDone ? "#5ac98a" : colors.label) : "rgba(255,255,255,0.3)") + ";background:" + (isSelectedInGroup ? (isDone ? "#5ac98a" : colors.label) : "transparent");
            if (isSelectedInGroup) {
                const dot = document.createElement("span");
                dot.style.cssText = "width:6px;height:6px;border-radius:50%;background:#fff";
                circle.appendChild(dot);
            }
            el.appendChild(circle);

            // Label text
            const labelSpan = document.createElement("span");
            labelSpan.textContent = t.radioLabel || "Opción";
            labelSpan.style.cssText = "font-size:" + (t.fontSize ? t.fontSize + "px" : "clamp(10px, 1.2vw, 14px)") + ";color:" + (t.hidden ? "var(--color-text-primary)" : (isDone ? "#5ac98a" : "#e2eaf4"));
            el.appendChild(labelSpan);

            el.addEventListener("click", () => {
                if (isDone || isBlocked) return;
                inputValues[groupKey] = t.id;
                if (t.isCorrectOption) {
                    handleTriggerComplete(t.id, triggers);
                } else {
                    render(); // re-render to show selection
                }
            });
        }

        // ── Checkbox ─────────────────────────────────────────
        else if (t.type === "checkbox") {
            const checkKey = "_checkbox_" + t.id;
            const isChecked = !!inputValues[checkKey];

            el.style.borderRadius = "4px";
            el.style.display = "flex";
            el.style.alignItems = "center";
            el.style.gap = "6px";
            el.style.padding = "0 8px";
            el.style.cursor = isDone ? "default" : "pointer";

            if (!isDone) {
                el.style.border = t.hidden ? "none" : "1.5px solid " + colors.borderActive;
                el.style.background = t.hidden ? "transparent" : "rgba(10,13,18,0.75)";
            }

            // Checkbox square
            const box = document.createElement("span");
            box.style.cssText = "width:14px;height:14px;border-radius:3px;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 150ms;font-size:10px;color:#fff;font-weight:700;border:2px solid " + ((isChecked || isDone) ? (isDone ? "#5ac98a" : colors.label) : "rgba(255,255,255,0.3)") + ";background:" + ((isChecked || isDone) ? (isDone ? "#5ac98a" : colors.label) : "transparent");
            if (isChecked || isDone) box.textContent = "✓";
            el.appendChild(box);

            // Label text
            const labelSpan = document.createElement("span");
            labelSpan.textContent = t.checkboxLabel || "Opción";
            labelSpan.style.cssText = "font-size:" + (t.fontSize ? t.fontSize + "px" : "clamp(10px, 1.2vw, 14px)") + ";color:" + (t.hidden ? "var(--color-text-primary)" : (isDone ? "#5ac98a" : "#e2eaf4"));
            el.appendChild(labelSpan);

            el.addEventListener("click", () => {
                if (isDone || isBlocked) return;
                const newChecked = !isChecked;
                inputValues[checkKey] = newChecked;
                if (newChecked && t.isCorrectOption) {
                    handleTriggerComplete(t.id, triggers);
                } else {
                    render();
                }
            });
        }

        return el;
    }

    // ── Dropdown styling helper ──────────────────────────────
    function applySelectStyles(sel, t, isDone, useNative) {
        if (t.hidden) {
            sel.style.background = "transparent";
            sel.style.color = "var(--color-text-primary)";
            sel.style.border = "none";
        } else {
            sel.style.background = t.bgColor ? t.bgColor : (isDone && !useNative ? "rgba(46,165,103,0.15)" : (useNative ? "#ffffff" : "rgba(10,13,18,0.75)"));
            sel.style.color = t.textColor ? t.textColor : (isDone && !useNative ? "#5ac98a" : (useNative ? "#000000" : "#e2eaf4"));
            sel.style.border = useNative ? (isDone ? "2px solid #5ac98a" : "1px solid #ccc") : "none";
            sel.style.borderRadius = useNative ? "4px" : "0";
        }
        sel.style.fontSize = t.fontSize ? t.fontSize + "px" : (useNative ? "14px" : "clamp(11px, 1.3vw, 18px)");
        sel.style.fontFamily = useNative ? "system-ui, sans-serif" : "inherit";
        sel.style.padding = useNative ? "0 8px" : "0 6px";
        sel.style.appearance = useNative ? "auto" : "none";
    }

    /** Append chevron or checkmark icon to dropdown wrapper */
    function appendDropdownIcon(wrap, t, isDone, useNative) {
        if (useNative) return;
        const icon = document.createElement("span");
        icon.style.cssText = "position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;display:flex;align-items:center;justify-content:center";
        if (isDone && !t.hidden) {
            icon.textContent = "✓";
            icon.style.fontSize = "14px";
            icon.style.color = t.textColor || "#5ac98a";
        } else if (!t.hidden) {
            icon.appendChild(createChevronSVG(t.textColor || "#e2eaf4"));
        }
        wrap.appendChild(icon);
    }

    // ── Main render ──────────────────────────────────────────
    function render() {
        const node = getNode(currentNodeId);
        if (!node) return;
        const data = node.data;
        const triggers = normalizeTriggers(data);
        const stepIndex = order.indexOf(currentNodeId);

        // Practice Guide
        renderPracticeGuide(triggers);

        // Header
        elScreenName.textContent = data.label || "Sin nombre";

        // Step pills
        let pillsHtml = "";
        order.forEach((id, i) => {
            let cls = "step-pill";
            if (id === currentNodeId) cls += " active";
            else if (i <= stepIndex) cls += " done";
            pillsHtml += '<div class="' + cls + '"></div>';
        });
        pillsHtml += '<span class="step-counter">' + (stepIndex + 1) + '/' + order.length + '</span>';
        elStepIndicator.innerHTML = pillsHtml;

        // ── Lógica del Temporizador ──────────────────────────
        const min = globalConfig.timerMin;
        const max = globalConfig.timerMax;

        if ((!min || min <= 0) && (!max || max <= 0)) {
            if (timerRef) clearInterval(timerRef);
            timerRef = null;
            elTimer.style.display = "none";
            hasTimerStarted = false;
        } else if (node.type === "authNode" || elSuccess.style.display === "flex") {
            elTimer.style.display = "none";
        } else {
            if (node.data?.timerEnd) {
                if (timerRef) {
                    clearInterval(timerRef);
                    timerRef = null;
                }
            } else if (node.data?.timerStart && !hasTimerStarted) {
                hasTimerStarted = true;
                let timeToSet = 0;
                if (min > 0 && max > 0 && max >= min) {
                    timeToSet = Math.floor(Math.random() * (max - min + 1)) + min;
                } else if (max > 0) {
                    timeToSet = max;
                } else if (min > 0) {
                    timeToSet = min;
                }

                timeRemaining = timeToSet;
                if (timeToSet > 0) {
                    if (timerRef) clearInterval(timerRef);
                    timerRef = setInterval(() => {
                        timeRemaining--;
                        if (timeRemaining <= 0) {
                            clearInterval(timerRef);
                            timerRef = null;
                            timeRemaining = 0;
                            elTimerValue.textContent = 0;
                            elTimer.className = "hud-timer danger";
                        } else {
                            elTimerValue.textContent = timeRemaining;
                            elTimer.className = timeRemaining <= 5 ? "hud-timer danger" : "hud-timer";
                        }
                    }, 1000);
                }
            }

            if (hasTimerStarted && timeRemaining !== null) {
                elTimer.style.display = "flex";
                elTimerValue.textContent = timeRemaining;
                elTimer.className = timeRemaining <= 5 ? "hud-timer danger" : "hud-timer";
            }
        }

        // ── Canvas content ───────────────────────────────────
        elImageWrapper.innerHTML = "";

        if (node.type === "authNode") {
            renderAuthNode(data);
            return;
        }

        if (node.type === "resultNode") {
            renderResultNode(data);
            return;
        }

        if (data.image) {
            if (data.mediaType === "video") {
                const videoSrc = Array.isArray(data.image) ? data.image[0] : data.image;
                const video = document.createElement("video");
                video.src = videoSrc; video.autoplay = true; video.playsInline = true; video.muted = true;
                video.className = "scene-image";
                video.style.cssText = "object-fit:cover;width:100vw;height:100dvh;display:block;flex-shrink:0";
                video.onended = () => { const nxt = getNextNodeId(); if (nxt) navigate(nxt); else showSuccess(); };
                elImageWrapper.appendChild(video);
                video.play().catch(e => console.warn("Autoplay prevented:", e));

                // Triggers on top of video
                const triggerLayer = document.createElement("div");
                triggerLayer.style.cssText = "position:absolute;inset:0";
                triggers.forEach(t => triggerLayer.appendChild(buildTriggerElement(t, triggers)));
                elImageWrapper.appendChild(triggerLayer);
            } else {
                // Image stack
                const imgArray = Array.isArray(data.image) ? data.image : [data.image];
                const outerWrap = document.createElement("div");
                outerWrap.style.cssText = "position:relative;width:100%;margin:auto 0;display:flex;flex-direction:column;align-items:center";

                const imgCol = document.createElement("div");
                imgCol.style.cssText = "display:flex;flex-direction:column;width:100%";
                imgArray.forEach(src => {
                    const img = document.createElement("img");
                    img.src = src; img.draggable = false; img.className = "scene-image";
                    img.style.cssText = "width:100%;height:auto;display:block";
                    imgCol.appendChild(img);
                });
                outerWrap.appendChild(imgCol);

                const triggerContainer = document.createElement("div");
                triggerContainer.id = "ui-triggers-container";
                triggerContainer.style.cssText = "position:absolute;inset:0";
                triggers.forEach(t => triggerContainer.appendChild(buildTriggerElement(t, triggers)));
                outerWrap.appendChild(triggerContainer);

                elImageWrapper.appendChild(outerWrap);
            }
        } else {
            // No image
            const noImg = document.createElement("div");
            noImg.style.cssText = "display:flex;align-items:center;justify-content:center;width:100vw;height:100dvh";
            const span = document.createElement("span");
            span.className = "no-image-text"; span.textContent = "Sin imagen en este nodo";
            noImg.appendChild(span);
            triggers.forEach(t => noImg.appendChild(buildTriggerElement(t, triggers)));
            elImageWrapper.appendChild(noImg);
        }

        // ── Progress Badges ──────────────────────────────────
        elProgressRow.innerHTML = "";
        if (triggers.length > 1) {
            triggers.forEach(t => {
                const done = completedTriggers.has(t.id);
                const c = TRIGGER_COLORS[t.type] || TRIGGER_COLORS.click;

                const badge = document.createElement("div");
                badge.className = "trigger-badge" + (done ? " done" : "");
                badge.style.border = "1px solid " + (done ? "rgba(46,165,103,0.35)" : c.border);
                badge.style.background = done ? "rgba(46,165,103,0.08)" : c.bg;

                const icon = document.createElement("span");
                icon.className = "badge-icon"; icon.textContent = done ? "✓" : "○";
                icon.style.color = done ? "#5ac98a" : c.label;

                const label = document.createElement("span");
                label.className = "badge-label"; label.textContent = t.type;
                label.style.color = done ? "#5ac98a" : c.label;

                badge.appendChild(icon); badge.appendChild(label);
                elProgressRow.appendChild(badge);
            });

            const reqTriggers = triggers.filter(t => !t.isOptional);
            const reqCompleted = reqTriggers.filter(t => completedTriggers.has(t.id)).length;
            if (reqCompleted < reqTriggers.length) {
                const rem = document.createElement("span");
                rem.className = "remaining-text";
                const remaining = reqTriggers.length - reqCompleted;
                rem.textContent = remaining + " restante" + (remaining !== 1 ? "s" : "");
                elProgressRow.appendChild(rem);
            }
        }
    }

    // ── Auth Node renderer ───────────────────────────────────
    function renderAuthNode(data) {
        const title = data.title || "Control de Accesos";
        const objective = data.objective || "Bienvenido al simulador. Ingresa tus datos para continuar.";
        const showPractice = data.showPractice !== false;
        const showScores = data.showScores !== false;

        const backdrop = document.createElement("div");
        backdrop.className = "auth-backdrop";

        const card = document.createElement("div");
        card.className = "auth-card";

        // Title + description
        const headerDiv = document.createElement("div");
        const h = document.createElement("div"); h.className = "auth-title"; h.textContent = title;
        const d = document.createElement("div"); d.className = "auth-desc"; d.textContent = objective;
        headerDiv.appendChild(h); headerDiv.appendChild(d);
        card.appendChild(headerDiv);

        // Form area
        const formDiv = document.createElement("div");
        formDiv.style.cssText = "display:flex;flex-direction:column;gap:16px";

        const inputWrap = document.createElement("div");
        inputWrap.style.position = "relative";

        const inp = document.createElement("input");
        inp.type = "text"; inp.placeholder = "Tu Nombre...";
        inp.className = "auth-input";

        const errMsg = document.createElement("div");
        errMsg.className = "auth-error";
        errMsg.textContent = "Por favor, ingresa tu nombre para continuar.";

        inputWrap.appendChild(inp);
        inputWrap.appendChild(errMsg);
        formDiv.appendChild(inputWrap);

        const btnsDiv = document.createElement("div");
        btnsDiv.style.cssText = "display:flex;flex-direction:column;gap:10px";

        const validateAndGo = (isPractice) => {
            const val = inp.value.trim();
            if (!val) {
                errMsg.style.display = "block";
                inp.classList.add("error");
                return;
            }
            sessionStorage.setItem("isPracticeMode", isPractice ? "true" : "false");
            setTimeout(() => navigate(getNextNodeId()), 100);
        };

        if (showPractice) {
            const btnP = document.createElement("button");
            btnP.className = "auth-btn auth-btn-practice"; btnP.textContent = "MODO PRÁCTICA";
            btnP.addEventListener("click", () => validateAndGo(true));
            btnsDiv.appendChild(btnP);
        }

        const btnE = document.createElement("button");
        btnE.className = "auth-btn auth-btn-eval"; btnE.textContent = "EVALUACIÓN";
        btnE.addEventListener("click", () => validateAndGo(false));
        btnsDiv.appendChild(btnE);

        if (showScores) {
            const btnS = document.createElement("button");
            btnS.className = "auth-btn auth-btn-scores"; btnS.textContent = "PUNTAJES"; btnS.disabled = true;
            btnsDiv.appendChild(btnS);
        }

        formDiv.appendChild(btnsDiv);
        card.appendChild(formDiv);
        backdrop.appendChild(card);
        elImageWrapper.appendChild(backdrop);
    }

    // ── Result Node renderer (Certificado) ───────────────────
    function renderResultNode(data) {
        const participantName = inputValues["auth_name"] ? inputValues["auth_name"].trim() : "Nombre del Participante";

        const wrap = document.createElement("div");
        wrap.style.cssText = "position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(10,13,18,0.85);backdrop-filter:blur(12px);animation:fadeIn 0.5s ease-out";

        const isPractice = sessionStorage.getItem("isPracticeMode") === "true";
        let htmlContent = "";

        if (isPractice) {
            htmlContent = `
                <div style="background: #ffffff; border-radius: 12px; padding: 40px 60px; max-width: 500px; width: 90%; text-align: center; box-shadow: 0 25px 80px rgba(0,0,0,0.6); display: flex; flex-direction: column; align-items: center; gap: 16px;">
                    <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(46,165,103,0.1); color: #2ea567; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #111;">Práctica Completada</h2>
                    <p style="margin: 0; font-size: 15px; color: #555; line-height: 1.5;">
                        Has finalizado este escenario en Modo Práctica. Esta sesión es formativa y no genera evaluación ni certificado.
                    </p>
                    <button id="cert-finish-btn" style="margin-top: 20px; padding: 10px 24px; border-radius: 8px; background: #111; color: white; font-weight: 600; font-size: 14px; border: none; cursor: pointer; transition: transform 150ms;">
                        Finalizar y Volver
                    </button>
                </div>
            `;
        } else {
            // Card structure using string HTML for easier maintenance of complex SVG SVG
            htmlContent = `
            <div style="background: #ffffff; border-radius: 12px; padding: 30px 60px; width: 94%; max-width: 900px; min-height: min(90vh, 600px); text-align: center; margin: auto; box-shadow: 0 25px 80px rgba(0,0,0,0.6); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; position: relative; overflow: hidden; color: #1a1a1a;">
                <!-- Corners -->
                <svg style="position: absolute; top: 0; left: 0; width: 250px; height: 250px; pointer-events: none;" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 0 L100 0 C50 20 20 50 0 100 Z" fill="${data.certColorAccent ?? '#EAB308'}" opacity="0.9" />
                    <path d="M0 0 L80 0 C40 15 15 40 0 80 Z" fill="${data.certColorPrimary ?? '#1E3A8A'}" />
                </svg>
                <svg style="position: absolute; bottom: 0; right: 0; width: 250px; height: 250px; pointer-events: none;" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M100 100 L0 100 C50 80 80 50 100 0 Z" fill="${data.certColorAccent ?? '#EAB308'}" opacity="0.9" />
                    <path d="M100 100 L20 100 C60 85 85 60 100 20 Z" fill="${data.certColorPrimary ?? '#1E3A8A'}" />
                </svg>
                <!-- Ribbon -->
                <svg style="position: absolute; top: 0; right: 40px; width: 50px; height: 80px; pointer-events: none;" viewBox="0 0 50 80" preserveAspectRatio="none">
                    <path d="M0 0 L50 0 L50 80 L25 60 L0 80 Z" fill="${data.certColorAccent ?? '#EAB308'}" />
                </svg>

                <!-- Seal -->
                <div style="position: absolute; right: 60px; top: 45%; transform: translateY(-50%); width: 110px; height: 110px; border-radius: 50%; background: ${data.certColorPrimary ?? '#1E3A8A'}; display: none; border: 3px solid ${data.certColorAccent ?? '#EAB308'}; color: ${data.certColorAccent ?? '#EAB308'}; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" class="cert-seal">
                    <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; padding: 12px; box-sizing: border-box;">
                        <path id="curve-seal" d="M 20 50 A 30 30 0 1 1 80 50 A 30 30 0 1 1 20 50" fill="transparent" />
                        <text font-size="10" font-weight="bold" fill="${data.certColorAccent ?? '#EAB308'}" letter-spacing="2">
                            <textPath href="#curve-seal" startOffset="50%" text-anchor="middle">SELLO DE EXCELENCIA</textPath>
                        </text>
                        <polygon points="50,30 55,40 65,42 58,50 60,60 50,55 40,60 42,50 35,42 45,40" fill="${data.certColorAccent ?? '#EAB308'}" />
                    </svg>
                </div>

                <div style="z-index: 1; display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
                    <h1 style="margin: 0; font-size: clamp(32px, 5vw, 42px); font-weight: 900; color: #000000; letter-spacing: 0.05em; text-transform: uppercase;">
                        ${data.certTitle ?? 'CERTIFICADO'}
                    </h1>
                    <h2 style="margin: 0; font-size: clamp(16px, 2.5vw, 22px); font-weight: 700; color: ${data.certColorPrimary ?? '#1E3A8A'}; letter-spacing: 0.1em; text-transform: uppercase;">
                        ${data.certSubtitle ?? 'DE RECONOCIMIENTO'}
                    </h2>
                </div>

                <div style="z-index: 1; margin-top: 20px;">
                    <p style="margin: 0; font-size: 16px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em;">
                        ${data.certPreName ?? 'OTORGADO A:'}
                    </p>
                </div>

                <div style="z-index: 1; width: 85%; padding: 5px 0; border-bottom: 2px solid #1a1a1a; margin: 0 0 10px 0;">
                    <!-- Requires font Great Vibes -->
                    <h3 style="margin: 0; font-size: clamp(36px, 6vw, 64px); font-weight: 400; color: #000000; font-family: 'Great Vibes', 'Brush Script MT', 'Alex Brush', cursive; line-height: 1.2;">
                        ${participantName}
                    </h3>
                </div>

                <div style="z-index: 1; max-width: 700px;">
                    <p style="margin: 0; font-size: clamp(15px, 2vw, 18px); color: #374151; line-height: 1.6; font-weight: 500;">
                        ${data.certDescription ?? 'Por haber completado satisfactoriamente 120 horas del Diplomado...'}
                    </p>
                </div>

                <!-- Signatures -->
                <div style="z-index: 1; display: flex; justify-content: space-between; width: 100%; margin-top: 20px; gap: 20px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                        <div style="width: 70%; height: 1px; background: #1a1a1a;"></div>
                        <p style="margin: 0; font-size: 13px; font-weight: 700; color: #000; text-transform: uppercase;">${data.signature1Name ?? 'LIC. HORACIO OLIVO'}</p>
                        <p style="margin: 0; font-size: 12px; font-weight: 500; color: #4b5563; font-style: italic;">${data.signature1Title ?? 'Director de Administración'}</p>
                    </div>
                    <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                        <div style="width: 70%; height: 1px; background: #1a1a1a;"></div>
                        <p style="margin: 0; font-size: 13px; font-weight: 700; color: #000; text-transform: uppercase;">${data.signature2Name ?? 'LIC. CARLA RODRÍGUEZ'}</p>
                        <p style="margin: 0; font-size: 12px; font-weight: 500; color: #4b5563; font-style: italic;">${data.signature2Title ?? 'Directora de Negocios'}</p>
                    </div>
                </div>

                <button id="cert-finish-btn" style="margin-top: 20px; padding: 12px 32px; border-radius: 8px; background: ${data.certColorPrimary ?? '#1E3A8A'}; color: white; font-weight: 600; font-size: 15px; border: none; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.4); transition: transform 150ms, box-shadow 150ms; z-index: 1;">
                    Finalizar y Volver
                </button>
            </div>
            `;
        }

        wrap.innerHTML = htmlContent;

        const btn = wrap.querySelector("#cert-finish-btn");
        btn.onmouseenter = () => { btn.style.transform = "translateY(-2px)"; btn.style.boxShadow = "0 6px 20px rgba(0,0,0,0.6)"; };
        btn.onmouseleave = () => { btn.style.transform = "translateY(0)"; btn.style.boxShadow = "0 4px 14px rgba(0,0,0,0.4)"; };
        btn.onclick = () => {
            showSuccess("El simulador ha terminado exitosamente.");
        };

        // Inject animation and fonts if not exists
        if (!document.getElementById("cert-styles")) {
            const style = document.createElement("style");
            style.id = "cert-styles";
            style.textContent = `
                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @media (min-width: 768px) {
                    .cert-seal { display: flex !important; }
                }
            `;
            document.head.appendChild(style);
        }

        elImageWrapper.innerHTML = "";
        elImageWrapper.appendChild(wrap);
    }

    // ── Global Keydown Listener ──────────────────────────────
    document.addEventListener("keydown", (e) => {
        if (isTransitioning) return;
        const node = getNode(currentNodeId);
        if (!node) return;
        const triggers = normalizeTriggers(node.data);

        triggers.forEach(t => {
            if (t.type !== "keypress") return;
            if (completedTriggers.has(t.id)) return;
            const depsArray = Array.isArray(t.dependsOn) ? t.dependsOn : (t.dependsOn ? [t.dependsOn] : []);
            const isBlocked = depsArray.length > 0 && depsArray.some(depId => !completedTriggers.has(depId));
            if (isBlocked) return;

            const expectedKey = t.keyCode || "";
            const pressedKey = e.key === " " ? "Space" : e.key;
            if (pressedKey.toLowerCase() === expectedKey.toLowerCase()) {
                if (["Space", "Enter", "ArrowUp", "ArrowDown"].includes(pressedKey)) e.preventDefault();
                handleTriggerComplete(t.id, triggers);
            }
        });
    });

    // ── Boot ─────────────────────────────────────────────────

    // Inyectar el estilo de fondo dinámico si lo hay
    if (globalConfig.bgType) {
        if (globalConfig.bgType === 'color' && globalConfig.bgValue) {
            elImageWrapper.style.backgroundColor = globalConfig.bgValue;
        } else if (globalConfig.bgType === 'image' && globalConfig.bgValue) {
            elImageWrapper.style.backgroundImage = `url('${globalConfig.bgValue}')`;
            elImageWrapper.style.backgroundSize = 'cover';
            elImageWrapper.style.backgroundPosition = 'center';
            elImageWrapper.style.backgroundColor = 'transparent';
        } else if (globalConfig.bgType === 'transparent') {
            elImageWrapper.style.backgroundColor = 'transparent';
        }
    }

    render();

})();
