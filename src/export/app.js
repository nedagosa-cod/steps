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
    };

    // ── Data ──────────────────────────────────────────────────
    const { nodes, edges } = window.SIM_DATA;
    const getNode = (id) => nodes.find(n => n.id === id);

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
        inputValues = {};

        setTimeout(() => {
            currentNodeId = targetId;
            render();
            elImageWrapper.classList.remove("transitioning");
            elProgressRow.classList.remove("transitioning");
            isTransitioning = false;
        }, 280);
    }

    // ── Trigger completion ───────────────────────────────────
    function handleTriggerComplete(tId, triggers) {
        completedTriggers.add(tId);
        render();

        // Check for explicit navigation branching
        const t = triggers.find(tr => tr.id === tId);
        if (t && t.navigateTarget) {
            setTimeout(() => navigate(t.navigateTarget), 350);
            return;
        }

        // Normal: all non-optional done?
        const allDone = triggers.every(tr => tr.isOptional || completedTriggers.has(tr.id));
        if (allDone) {
            const nextId = getNextNodeId();
            if (nextId) setTimeout(() => navigate(nextId), 350);
            else showSuccess();
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
                        default: hint = "Realiza la acción requerida.";
                    }
                }

                const row = document.createElement("div");
                row.style.cssText = "display:flex;align-items:flex-start;gap:8px;opacity:" + (done ? "0.4" : "1") + ";transition:all 300ms ease";

                const circle = document.createElement("div");
                circle.style.cssText = "margin-top:2px;width:14px;height:14px;border-radius:50%;border:1px solid " + (done ? "#5ac98a" : "var(--color-border-strong)") + ";background:" + (done ? "rgba(90,201,138,0.2)" : "transparent") + ";display:flex;align-items:center;justify-content:center;flex-shrink:0";
                if (done) { const ck = document.createElement("span"); ck.textContent = "✓"; ck.style.cssText = "color:#5ac98a;font-size:10px"; circle.appendChild(ck); }

                const text = document.createElement("div");
                text.style.cssText = "font-size:12px;color:" + (done ? "var(--color-text-muted)" : "var(--color-text-primary)") + ";text-decoration:" + (done ? "line-through" : "none") + ";line-height:1.4";
                const stepLabel = document.createElement("span");
                stepLabel.style.cssText = "font-weight:600;margin-right:4px";
                stepLabel.textContent = "Paso " + (index + 1) + ":";
                text.appendChild(stepLabel);
                text.appendChild(document.createTextNode(" " + hint));

                row.appendChild(circle);
                row.appendChild(text);
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

        // ── Canvas content ───────────────────────────────────
        elImageWrapper.innerHTML = "";

        if (node.type === "authNode") {
            renderAuthNode(data);
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
                outerWrap.style.cssText = "position:relative;width:100%;max-width:100%;margin:0 auto";

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
    render();

})();
