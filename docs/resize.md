# Widget Resize and Reposition

How to resize and reposition widgets via mouse interaction in Seelen UI.

---

## 1. Window Behavior Presets

The `preset` field in `metadata.yml` determines how the widget window behaves:

| Preset | Resize | Reposition | Title Bar |
|---|---|---|---|
| `None` | Full manual control | Full manual control | None (frameless) |
| `Desktop` | ✅ Yes | ✅ Yes | No |
| `Overlay` | ❌ No | ❌ No | No |
| `Popup` | ❌ No | ❌ No | No |

Only `None` and `Desktop` presets support mouse resize and reposition. `Overlay` and `Popup` are fixed-position by design.

---

## 2. Enabling Mouse Drag (Reposition)

For `Desktop` preset widgets, Seelen UI handles repositioning automatically — the user can click and drag the widget window to move it.

For `None` preset widgets (full manual control), you need to enable drag using CSS:

```css
/* Make an entire region draggable */
.my-widget-header {
  -webkit-app-region: drag;
}
```

**Key rule:** Any element with `-webkit-app-region: drag` intercepts all mouse events. You must mark interactive elements (buttons, links, inputs) as `no-drag` so they remain usable:

```css
.my-widget-btn {
  -webkit-app-region: no-drag;
}
```

### Common Pattern

```html
<div class="widget-drag-area">
  <div class="widget-header">
    <span>Title</span>
    <button class="widget-btn">Close</button>
  </div>
  <div class="widget-content">
    <!-- Widget content -->
  </div>
</div>
```

```css
.widget-drag-area {
  -webkit-app-region: drag;
}
.widget-btn {
  -webkit-app-region: no-drag;
}
```

---

## 3. Enabling Mouse Resize

### Built-in Resize Handles (Desktop Preset)

When using the `Desktop` preset, Seelen UI provides native resize handles on the window edges. The user can drag any edge or corner to resize.

### Custom Resize Handles (None Preset)

For `None` preset widgets, you must implement custom resize handles using CSS and JS:

```css
.resize-handle {
  position: absolute;
  /* Edge handles */
  width: 8px;
  height: 100%;
  /* Corner handles */
  width: 12px;
  height: 12px;
}
.resize-handle.right { right: 0; cursor: ew-resize; }
.resize-handle.bottom { bottom: 0; cursor: ns-resize; }
.resize-handle.bottom-right {
  right: 0; bottom: 0; cursor: nwse-resize;
}
```

```javascript
// Example resize handler
let isResizing = false;
let startX, startY, startWidth, startHeight;

element.addEventListener('mousedown', (e) => {
  isResizing = true;
  startX = e.clientX;
  startY = e.clientY;
  startWidth = element.offsetWidth;
  startHeight = element.offsetHeight;
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

function onMouseMove(e) {
  if (!isResizing) return;
  const newWidth = startWidth + (e.clientX - startX);
  const newHeight = startHeight + (e.clientY - startY);
  element.style.width = `${newWidth}px`;
  element.style.height = `${newHeight}px`;
}

function onMouseUp() {
  isResizing = false;
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}
```

### Widget API for Size Control

The Seelen UI `Widget` API provides programmatic size control:

```javascript
const widget = Widget.getCurrent();

// Set size
await widget.setSize({ width: 400, height: 300 });

// Set position
await widget.setPosition({ x: 100, y: 200 });

// Set both
await widget.setBounds({ x: 100, y: 200, width: 400, height: 300 });

// Auto-size to content
await widget.init({
  autoSizeByContent: document.querySelector('.hw-root'),
  autoSizeFitOnScreen: true,
});
```

---

## 4. Preset-Specific Behavior

### Desktop Preset

- Remembers position and size between sessions
- Resize handles on all edges
- Drag anywhere on the window to reposition
- No title bar — use a custom header if needed

### None Preset

- No automatic resize or reposition
- Full control via CSS `-webkit-app-region` and Widget API
- Useful for custom UI patterns (e.g., floating panels)

### Overlay Preset

- Always on top
- No resize or reposition
- Fixed position set at creation time

### Popup Preset

- Auto-hides on focus loss
- No resize or reposition
- Shown/hidden by triggers only

---

## 5. Known Issues and Gotchas

### Window Manager Stuck on Set Size

**Issue #924:** When the window manager is enabled, widgets can get stuck at a set size and refuse to resize. Workaround: disable the window manager or adjust its size settings.

### Fancy Toolbar Resize Bug

**Issue #1394:** If the fancy toolbar's size is set smaller than its default (30), widgets won't resize properly. Setting it back to 30 doesn't fix the issue — a restart is required.

### Position Resets on Restart

**Issue #1014:** Widget position may reset on restart even after being moved and saved. This is a known bug in the position persistence layer. Workaround: ensure the widget is properly saved before closing.

### `-webkit-app-region: drag` Intercepts All Events

Any element with `drag` region intercepts all mouse events including clicks. Always mark interactive elements as `no-drag`. This is a common source of "buttons don't work" bugs.

### Cursor Changes on Drag Regions

When using `-webkit-app-region: drag`, the cursor changes to the default arrow (not the resize cursor) even when hovering over resize handles. Set `cursor` explicitly on resize handles to fix this.

---

## 6. Best Practices

1. **Use `Desktop` preset when possible** — it handles resize/reposition natively.
2. **Keep `-webkit-app-region` regions simple** — one large draggable parent, with `no-drag` children for interactive elements.
3. **Set minimum sizes** — use `min-width`/`min-height` to prevent widgets from becoming unusable.
4. **Handle multi-monitor setups** — widget position/size should be monitor-aware.
5. **Test with window manager enabled** — the window manager can interfere with resize/reposition.
6. **Persist position/size** — save widget state so the user's layout is preserved across restarts.

---

## References

1. [Seelen UI — Widget Guidelines](https://raw.githubusercontent.com/eythaann/Seelen-UI/refs/heads/master/documentation/widget_guidelines.md)
2. [Seelen UI — Resource Guidelines](https://github.com/eythaann/Seelen-UI/blob/master/documentation/resource_guidelines.md)
3. [Seelen UI — Window Manager Issue #924](https://github.com/eythaann/Seelen-UI/issues/924)
4. [Seelen UI — Fancy Toolbar Resize Issue #1394](https://github.com/eythaann/Seelen-UI/issues/1394)
5. [Seelen UI — Position Reset Issue #1014](https://github.com/eythaann/Seelen-UI/issues/1014)
6. [Electron — `-webkit-app-region` Documentation](https://www.electronjs.org/docs/latest/api/struct-web-content-view-options#webkitappregion)
