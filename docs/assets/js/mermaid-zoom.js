/**
 * Mermaid pan/zoom overlay – wraps each rendered mermaid SVG with zoom controls.
 * Lightweight (~80 lines), no dependencies, works with mousewheel + buttons + drag.
 */
(function () {
  'use strict';

  var MIN_SCALE = 0.3;
  var MAX_SCALE = 4;
  var STEP = 0.2;

  function wrapDiagram(svg) {
    // Skip if already wrapped
    if (svg.closest('.mermaid-zoom-wrap')) return;

    var wrap = document.createElement('div');
    wrap.className = 'mermaid-zoom-wrap';

    var controls = document.createElement('div');
    controls.className = 'mermaid-zoom-controls';
    controls.innerHTML =
      '<button data-zoom="in" title="Zoom in" aria-label="Zoom in">+</button>' +
      '<button data-zoom="out" title="Zoom out" aria-label="Zoom out">&minus;</button>' +
      '<button data-zoom="reset" title="Reset zoom" aria-label="Reset zoom">⊙</button>';

    var inner = document.createElement('div');
    inner.className = 'mermaid-zoom-inner';

    // Insert wrapper where the code block was
    var parent = svg.parentNode;
    parent.parentNode.insertBefore(wrap, parent);
    inner.appendChild(svg);
    wrap.appendChild(controls);
    wrap.appendChild(inner);

    // Remove the now-empty code block container
    if (parent !== wrap && parent.children.length === 0) {
      parent.remove();
    }

    var scale = 1;
    var panX = 0;
    var panY = 0;
    var dragging = false;
    var startX = 0;
    var startY = 0;

    function applyTransform() {
      inner.style.transform = 'translate(' + panX + 'px,' + panY + 'px) scale(' + scale + ')';
    }

    function zoom(delta) {
      scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta));
      applyTransform();
    }

    controls.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var action = btn.getAttribute('data-zoom');
      if (action === 'in') zoom(STEP);
      else if (action === 'out') zoom(-STEP);
      else if (action === 'reset') { scale = 1; panX = 0; panY = 0; applyTransform(); }
    });

    wrap.addEventListener('wheel', function (e) {
      e.preventDefault();
      zoom(e.deltaY < 0 ? STEP : -STEP);
    }, { passive: false });

    wrap.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      dragging = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
    });

    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      applyTransform();
    });

    window.addEventListener('mouseup', function () {
      dragging = false;
    });
  }

  function init() {
    var svgs = document.querySelectorAll('.language-mermaid svg, pre.mermaid svg');
    if (svgs.length === 0) return false;
    svgs.forEach(wrapDiagram);
    return true;
  }

  // Mermaid renders asynchronously; poll briefly then fall back to observer
  var attempts = 0;
  var timer = setInterval(function () {
    if (init() || ++attempts > 20) clearInterval(timer);
  }, 250);
})();
