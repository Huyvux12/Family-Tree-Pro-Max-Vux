"use strict";

/* =========================================================
   Hằng số
   ========================================================= */
const STORAGE_KEY = "giapha-editor-state-v2";
const THEME_KEY = "giapha-theme";
const PREFS_KEY = "giapha-prefs";
const NODE_W = 236;
const NODE_H = 104;
const GAP_X = 40;
const GAP_Y = 110;
const MIN_SCALE = 0.15;
const MAX_SCALE = 2.2;
const HISTORY_LIMIT = 100;
const CURRENT_YEAR = new Date().getFullYear();
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const collator = new Intl.Collator("vi", { sensitivity: "base", numeric: true });

/* =========================================================
   Dữ liệu mẫu
   ========================================================= */
function member(id, parentId, generation, gender, name, years, branch, role, note = "", extra = {}) {
  return {
    id,
    parentId,
    x: 0,
    y: 0,
    name,
    role,
    generation,
    years,
    branch,
    note,
    gender,
    spouse: "",
    occupation: "",
    hometown: "",
    deceased: parseYears(years).death !== null,
    photo: "",
    collapsed: false,
    ...extra,
  };
}

function createDefaultState() {
  const nodes = [
    member("node-root", null, 1, "male", "Cụ Tổ Nguyễn Văn Hữu", "1858 - 1931", "Gốc tổ", "Thủy tổ dòng họ",
      "Người đặt nền nếp đầu tiên và là cột mốc tham chiếu của toàn bộ phả hệ.",
      { spouse: "Cụ bà Trần Thị Nhàn", hometown: "Nam Định", occupation: "Dạy chữ Nho" }),
    member("node-a", "node-root", 2, "male", "Nguyễn Văn Ninh", "1888 - 1956", "Nhánh Bắc", "Nhánh trưởng",
      "Phụ trách nhà thờ họ và gìn giữ nhiều gia lễ được truyền lại.", { spouse: "Lê Thị Đào" }),
    member("node-b", "node-root", 2, "male", "Nguyễn Văn Kham", "1894 - 1968", "Nhánh Trung", "Trưởng nhánh giữa",
      "Đánh dấu giai đoạn mở rộng học hành và nghề nghiệp của gia tộc.", { occupation: "Thầy thuốc" }),
    member("node-c", "node-root", 2, "male", "Nguyễn Văn Thịnh", "1898 - 1972", "Nhánh Nam", "Trưởng nhánh Nam",
      "Lập nhánh cư trú mới và kết nối hôn nhân với nhiều chi họ khác.", { hometown: "Huế" }),
    member("node-a1", "node-a", 3, "male", "Nguyễn Văn Chinh", "1918 - 1989", "Nhánh Bắc", "Người ghi phả ký",
      "Tổng hợp ghi chép, tên gọi và chuyển đời của nhiều đời hậu duệ."),
    member("node-a2", "node-a", 3, "female", "Nguyễn Thị Hoa", "1924 - 1998", "Nhánh Bắc", "Người giữ kỷ vật",
      "Lưu giữ ảnh xưa, văn tế và nhiều kỷ vật được truyền lại."),
    member("node-b1", "node-b", 3, "female", "Nguyễn Thị Lan", "1932 - 2006", "Nhánh Trung", "Người lưu ảnh tư liệu",
      "Giúp tập hợp ảnh cũ, thư từ và ký sự của dòng họ."),
    member("node-b2", "node-b", 3, "male", "Nguyễn Hữu Minh", "1940 - 2011", "Nhánh Trung", "Người số hóa gia phả",
      "Khởi xướng việc chuyển các tài liệu gia phả sang bản điện tử.", { occupation: "Kỹ sư" }),
    member("node-c1", "node-c", 3, "male", "Nguyễn Văn Quang", "1936 - 2010", "Nhánh Nam", "Người mở rộng địa bàn",
      "Liên kết các chi nhánh định cư mới với nhà thờ họ gốc."),
    member("node-c2", "node-c", 3, "female", "Nguyễn Thị Bình", "1943 - 2018", "Nhánh Nam", "Người giữ nề nếp",
      "Nối kết các dịp họp họ, giỗ tổ và truyền lại gia phong trong nhà."),
    member("node-a1a", "node-a1", 4, "male", "Nguyễn Văn Đức", "1946 - 2015", "Nhánh Bắc", "Trưởng tộc đời IV",
      "Tu bổ nhà thờ họ năm 1995.", { spouse: "Phạm Thị Thu" }),
    member("node-a1b", "node-a1", 4, "female", "Nguyễn Thị Hằng", "1952", "Nhánh Bắc", "Giáo viên",
      "", { occupation: "Giáo viên", hometown: "Hà Nội" }),
    member("node-b2a", "node-b2", 4, "male", "Nguyễn Hữu Nam", "1968", "Nhánh Trung", "Người giữ phả điện tử",
      "Tiếp tục cập nhật gia phả số.", { occupation: "Kỹ sư phần mềm", spouse: "Vũ Thị Hạnh" }),
    member("node-b2b", "node-b2", 4, "female", "Nguyễn Thị Mai", "1972", "Nhánh Trung", "Bác sĩ", "", { occupation: "Bác sĩ" }),
    member("node-c1a", "node-c1", 4, "male", "Nguyễn Văn Phúc", "1962", "Nhánh Nam", "Trưởng chi Nam", "", { hometown: "Đà Nẵng" }),
    member("node-a1a1", "node-a1a", 5, "male", "Nguyễn Văn Khôi", "1978", "Nhánh Bắc", "Trưởng tộc đời V"),
    member("node-b2a1", "node-b2a", 5, "male", "Nguyễn Hữu An", "1996", "Nhánh Trung", "Hậu duệ đời V", "", { occupation: "Sinh viên" }),
    member("node-b2a2", "node-b2a", 5, "female", "Nguyễn Ngọc Linh", "2001", "Nhánh Trung", "Hậu duệ đời V"),
  ];

  const result = computeLayout(nodes);
  nodes.forEach((node) => Object.assign(node, result.get(node.id)));
  return { nodes, view: null, meta: { title: "Gia phả họ Nguyễn", autoLayout: true } };
}

/* =========================================================
   DOM
   ========================================================= */
const $ = (selector) => document.querySelector(selector);
const app = $("#app");
const canvasShell = $("#canvas-shell");
const treeViewport = $("#tree-viewport");
const treeLayer = $("#tree-layer");
const treeLinks = $("#tree-links");
const breadcrumb = $("#breadcrumb");
const zoomIndicator = $("#zoom-indicator");
const minimap = $("#minimap");
const familyTitle = $("#family-title");
const form = $("#inspector-form");
const drawerEmpty = $("#drawer-empty");
const drawerBody = $("#drawer-body");
const toastEl = $("#toast");
const toastText = $("#toast-text");
const toastAction = $("#toast-action");
const searchModal = $("#search-modal");
const searchInput = $("#search-input");
const searchResults = $("#search-results");
const helpModal = $("#help-modal");
const contextMenu = $("#context-menu");
const moreMenu = $("#more-menu");
const moreBtn = $("#more-btn");
const autoLayoutToggle = $("#auto-layout-toggle");
const importInput = $("#import-json");
const photoInput = $("#photo-input");

/* =========================================================
   Trạng thái
   ========================================================= */
let state = loadState();
let prefs = loadPrefs();
let index = { byId: new Map(), children: new Map(), hidden: new Set() };
let selectedId = null;
let currentView = "tree";
let interaction = null;
let editSession = null;
let viewAnim = 0;
let layoutAnim = 0;
let pendingLayout = null;
let minimapQueued = false;
let minimapTransform = null;
let persistTimer = 0;
let toastTimer = 0;
let lastArrowMove = 0;
let ctxNodeId = null;
let searchActive = 0;
let searchList = [];
let listSort = { key: "generation", dir: "asc" };
let colors = {};
const filters = { gender: "", generations: new Set(), branches: new Set() };
const history = { past: [], future: [] };

init();

function init() {
  readColors();
  rebuildIndex();
  familyTitle.value = state.meta.title;
  syncTitle();
  autoLayoutToggle.checked = state.meta.autoLayout;
  if (state.meta.autoLayout) {
    const result = computeLayout(state.nodes);
    state.nodes.forEach((node) => Object.assign(node, result.get(node.id)));
    rebuildIndex();
  }
  $("#toggle-lineage").setAttribute("aria-pressed", String(prefs.lineage));
  app.classList.add("no-anim", "drawer-hidden");
  if (prefs.sidebarHidden || isCompact()) {
    app.classList.add("sidebar-hidden");
  }

  renderScene();
  if (state.view && anyNodeInView()) {
    applyViewport();
  } else {
    state.view = { x: 0, y: 0, scale: 1 };
    fitView(false);
    // Màn hình hẹp: cây rộng sẽ bị thu quá nhỏ, nên mở ở cụ tổ với mức zoom đọc được
    const root = state.nodes.find((node) => !node.parentId);
    const rect = canvasShell.getBoundingClientRect();
    if (root && state.view.scale < 0.4 && rect.width < 720) {
      const scale = 0.62;
      setView({ x: rect.width / 2 - (root.x + NODE_W / 2) * scale, y: 90 - root.y * scale, scale }, false);
    }
  }
  bindEvents();
  if (prefs.view && prefs.view !== "tree") {
    switchView(prefs.view);
  }
  setSaveStatus("ok");
  requestAnimationFrame(() => requestAnimationFrame(() => app.classList.remove("no-anim")));
}

/* =========================================================
   Sự kiện
   ========================================================= */
function bindEvents() {
  canvasShell.addEventListener("pointerdown", onCanvasPointerDown);
  canvasShell.addEventListener("wheel", onWheel, { passive: false });
  canvasShell.addEventListener("dblclick", onCanvasDblClick);
  canvasShell.addEventListener("contextmenu", onContextMenu);
  treeLayer.addEventListener("click", onLayerClick);
  treeLayer.addEventListener("keydown", onCardKeyDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", requestMinimap);
  window.addEventListener("beforeunload", persistNow);
  document.addEventListener("pointerdown", closeFloatingMenus, true);
  document.addEventListener("fullscreenchange", requestMinimap);

  // Top bar
  $("#sidebar-toggle").addEventListener("click", toggleSidebar);
  document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => switchView(tab.dataset.view)));
  $("#search-open").addEventListener("click", openSearch);
  $("#undo-btn").addEventListener("click", undo);
  $("#redo-btn").addEventListener("click", redo);
  $("#theme-toggle").addEventListener("click", toggleTheme);
  moreBtn.addEventListener("click", () => toggleMoreMenu());
  moreMenu.addEventListener("click", onMenuAction);
  contextMenu.addEventListener("click", onMenuAction);
  familyTitle.addEventListener("input", () => {
    state.meta.title = familyTitle.value;
    syncTitle();
    schedulePersist();
  });
  familyTitle.addEventListener("keydown", (event) => {
    if (event.key === "Enter") familyTitle.blur();
  });

  // Canvas toolbar
  $("#zoom-in").addEventListener("click", () => zoomBy(1.2));
  $("#zoom-out").addEventListener("click", () => zoomBy(1 / 1.2));
  zoomIndicator.addEventListener("click", () => zoomBy(1 / state.view.scale));
  $("#fit-view").addEventListener("click", () => fitView());
  $("#auto-layout").addEventListener("click", () => arrangeTree());
  $("#toggle-lineage").addEventListener("click", toggleLineage);
  $("#collapse-all").addEventListener("click", collapseAll);
  $("#expand-all").addEventListener("click", expandAll);
  $("#fullscreen").addEventListener("click", toggleFullscreen);
  autoLayoutToggle.addEventListener("change", () => {
    state.meta.autoLayout = autoLayoutToggle.checked;
    if (state.meta.autoLayout) {
      arrangeTree("Đã bật tự sắp xếp");
    } else {
      announce("Đã tắt tự sắp xếp — bạn có thể kéo thả tự do");
      schedulePersist();
    }
  });
  minimap.addEventListener("pointerdown", onMinimapPointer);
  // Ẩn minimap khi canvas quá hẹp để không đè lên thanh công cụ
  new ResizeObserver(([entry]) => {
    canvasShell.parentElement.classList.toggle("narrow", entry.contentRect.width < 1100);
    requestMinimap();
  }).observe(canvasShell);

  // Sidebar filters
  $("#filter-gender").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    filters.gender = button.dataset.value;
    onFiltersChanged();
  });
  $("#filter-generations").addEventListener("click", (event) => toggleFilterChip(event, filters.generations, Number));
  $("#filter-branches").addEventListener("click", (event) => toggleFilterChip(event, filters.branches, String));
  $("#clear-filters").addEventListener("click", () => {
    filters.gender = "";
    filters.generations.clear();
    filters.branches.clear();
    onFiltersChanged();
  });

  // Drawer
  form.addEventListener("input", onFormInput);
  form.addEventListener("focusout", commitEditSession);
  form.addEventListener("submit", (event) => event.preventDefault());
  $("#drawer-close").addEventListener("click", () => selectNode(null));
  $("#add-child").addEventListener("click", () => addChild(selectedId));
  $("#add-sibling").addEventListener("click", () => addSibling(selectedId));
  $("#focus-node").addEventListener("click", () => {
    switchView("tree");
    focusNode(selectedId, { zoomIn: true });
  });
  $("#delete-branch").addEventListener("click", () => deleteBranch(selectedId));
  $("#avatar-btn").addEventListener("click", () => photoInput.click());
  $("#remove-photo").addEventListener("click", () => {
    const node = findNode(selectedId);
    if (node) mutate(() => { node.photo = ""; }, { message: "Đã xóa ảnh đại diện" });
  });
  photoInput.addEventListener("change", onPhotoChosen);
  drawerBody.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-goto]");
    if (chip) goToMember(chip.dataset.goto);
  });

  // Modals
  searchInput.addEventListener("input", renderSearchResults);
  searchInput.addEventListener("keydown", onSearchKeyDown);
  searchResults.addEventListener("click", (event) => {
    const item = event.target.closest("[data-id]");
    if (item) chooseSearchResult(item.dataset.id);
  });
  searchResults.addEventListener("pointermove", (event) => {
    const item = event.target.closest("[data-index]");
    if (item && Number(item.dataset.index) !== searchActive) {
      searchActive = Number(item.dataset.index);
      highlightSearchActive();
    }
  });
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-close]")) closeModal(modal);
    });
  });

  // List view
  $("#list-query").addEventListener("input", renderList);
  document.querySelector(".member-table thead").addEventListener("click", (event) => {
    const th = event.target.closest("th[data-sort]");
    if (!th) return;
    const key = th.dataset.sort;
    listSort = { key, dir: listSort.key === key && listSort.dir === "asc" ? "desc" : "asc" };
    renderList();
  });
  $("#member-tbody").addEventListener("click", (event) => {
    const row = event.target.closest("tr[data-id]");
    if (row) selectNode(row.dataset.id);
  });
  $("#member-tbody").addEventListener("dblclick", (event) => {
    const row = event.target.closest("tr[data-id]");
    if (row) goToMember(row.dataset.id, true);
  });
  $("#stats-grid").addEventListener("click", (event) => {
    const item = event.target.closest("[data-goto]");
    if (item) goToMember(item.dataset.goto, true);
  });
  $("#timeline").addEventListener("click", (event) => {
    const item = event.target.closest("[data-goto]");
    if (item) selectNode(item.dataset.goto);
  });
  $("#timeline").addEventListener("dblclick", (event) => {
    const item = event.target.closest("[data-goto]");
    if (item) goToMember(item.dataset.goto, true);
  });

  importInput.addEventListener("change", importTree);
  initTooltips();
}

/* =========================================================
   Chỉ mục & truy vấn cây
   ========================================================= */
function rebuildIndex() {
  const byId = new Map(state.nodes.map((node) => [node.id, node]));
  const children = new Map();
  state.nodes.forEach((node) => {
    if (node.parentId && byId.has(node.parentId)) {
      if (!children.has(node.parentId)) children.set(node.parentId, []);
      children.get(node.parentId).push(node);
    }
  });
  children.forEach((list) => list.sort((a, b) => a.x - b.x));

  const hidden = new Set();
  const hide = (id) => (children.get(id) || []).forEach((child) => {
    hidden.add(child.id);
    hide(child.id);
  });
  state.nodes.forEach((node) => {
    if (node.collapsed) hide(node.id);
  });
  index = { byId, children, hidden };
}

function findNode(id) {
  return (id && index.byId.get(id)) || null;
}

function getChildren(id) {
  return index.children.get(id) || [];
}

function getParent(node) {
  return node?.parentId ? findNode(node.parentId) : null;
}

function isRoot(node) {
  return !getParent(node);
}

function visibleNodes() {
  return state.nodes.filter((node) => !index.hidden.has(node.id));
}

function ancestorsOf(id) {
  const chain = [];
  let node = findNode(id);
  while (node) {
    chain.unshift(node);
    node = getParent(node);
  }
  return chain;
}

function descendantsOf(id, bucket = new Set()) {
  bucket.add(id);
  getChildren(id).forEach((child) => descendantsOf(child.id, bucket));
  return bucket;
}

function descendantDepth(id) {
  const kids = getChildren(id);
  return kids.length ? 1 + Math.max(...kids.map((child) => descendantDepth(child.id))) : 0;
}

function lineageSet() {
  if (!prefs.lineage || !findNode(selectedId)) return null;
  const set = descendantsOf(selectedId);
  ancestorsOf(selectedId).forEach((node) => set.add(node.id));
  return set;
}

/* =========================================================
   Bố cục tự động
   ========================================================= */
function computeLayout(nodes) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const kids = new Map();
  nodes.forEach((node) => {
    if (node.parentId && byId.has(node.parentId)) {
      if (!kids.has(node.parentId)) kids.set(node.parentId, []);
      kids.get(node.parentId).push(node);
    }
  });
  kids.forEach((list) => list.sort((a, b) => a.x - b.x));

  const unit = NODE_W + GAP_X;
  const widths = new Map();
  const result = new Map();
  const visibleKids = (node) => (node.collapsed ? [] : kids.get(node.id) || []);

  const measure = (node) => {
    const list = visibleKids(node);
    const width = list.length ? Math.max(unit, list.reduce((sum, child) => sum + measure(child), 0)) : unit;
    widths.set(node.id, width);
    return width;
  };

  const place = (node, left, depth) => {
    const width = widths.get(node.id);
    const list = visibleKids(node);
    const y = depth * (NODE_H + GAP_Y);
    if (!list.length) {
      result.set(node.id, { x: left + (width - NODE_W) / 2, y });
      return;
    }
    const total = list.reduce((sum, child) => sum + widths.get(child.id), 0);
    let cursor = left + (width - total) / 2;
    list.forEach((child) => {
      place(child, cursor, depth + 1);
      cursor += widths.get(child.id);
    });
    const first = result.get(list[0].id);
    const last = result.get(list[list.length - 1].id);
    result.set(node.id, { x: (first.x + last.x) / 2, y });
  };

  const roots = nodes.filter((node) => !node.parentId || !byId.has(node.parentId)).sort((a, b) => a.x - b.x);
  let left = 0;
  roots.forEach((root) => {
    measure(root);
    place(root, left, 0);
    left += widths.get(root.id) + GAP_X * 2;
  });

  // Thành viên bị thu gọn sẽ "nằm" tại vị trí tổ tiên gần nhất đang hiển thị
  nodes.forEach((node) => {
    if (result.has(node.id)) return;
    let parent = byId.get(node.parentId);
    while (parent && !result.has(parent.id)) parent = byId.get(parent.parentId);
    result.set(node.id, parent ? { ...result.get(parent.id) } : { x: node.x, y: node.y });
  });
  return result;
}

function runAutoLayout({ fit = false } = {}) {
  const targets = computeLayout(state.nodes);
  animatePositions(targets);
  if (fit) {
    const visible = visibleNodes().map((node) => ({ ...targets.get(node.id) }));
    fitView(true, boundsOf(visible));
  }
  return targets;
}

function animatePositions(targets) {
  settleLayout();
  const starts = new Map(state.nodes.map((node) => [node.id, { x: node.x, y: node.y }]));
  const finish = () => {
    cancelAnimationFrame(layoutAnim);
    pendingLayout = null;
    state.nodes.forEach((node) => Object.assign(node, targets.get(node.id)));
    rebuildIndex();
    updatePositions();
    schedulePersist();
  };
  if (REDUCED_MOTION) {
    finish();
    return;
  }
  pendingLayout = finish;
  const t0 = performance.now();
  const duration = 560;
  const step = (now) => {
    const p = Math.min(1, (now - t0) / duration);
    if (p >= 1) {
      finish();
      return;
    }
    const e = easeInOutCubic(p);
    state.nodes.forEach((node) => {
      const from = starts.get(node.id);
      const to = targets.get(node.id);
      if (!from || !to) return;
      node.x = from.x + (to.x - from.x) * e;
      node.y = from.y + (to.y - from.y) * e;
    });
    updatePositions();
    layoutAnim = requestAnimationFrame(step);
  };
  layoutAnim = requestAnimationFrame(step);
}

// Kết thúc ngay animation bố cục đang chạy để dữ liệu luôn ở vị trí cuối cùng
function settleLayout() {
  if (pendingLayout) pendingLayout();
}

function arrangeTree(message = "Đã sắp xếp lại cây") {
  pushHistory(snapshot());
  runAutoLayout({ fit: true });
  announce(message);
}

/* =========================================================
   Render cây
   ========================================================= */
function renderScene() {
  rebuildIndex();
  renderNodes();
  renderLinks();
  renderBreadcrumb();
  syncDrawer();
  syncSidebar();
  syncHistoryButtons();
  renderActiveView();
  requestMinimap();
}

function renderNodes() {
  const fragment = document.createDocumentFragment();
  visibleNodes().forEach((node) => fragment.appendChild(createCard(node)));
  treeLayer.replaceChildren(fragment);
  applyNodeClasses();
}

function createCard(node) {
  const card = document.createElement("article");
  const childCount = getChildren(node.id).length;
  card.className = [
    "node",
    node.gender,
    isRoot(node) ? "root" : "",
    node.deceased ? "deceased" : "",
    node.collapsed ? "collapsed" : "",
  ].filter(Boolean).join(" ");
  card.dataset.nodeId = node.id;
  card.style.left = `${node.x}px`;
  card.style.top = `${node.y}px`;
  card.tabIndex = 0;
  card.setAttribute("aria-label", `${node.name}, đời ${node.generation}`);

  const toggle = childCount
    ? `<button class="node-toggle" type="button" data-toggle title="${node.collapsed ? "Mở rộng nhánh" : "Thu gọn nhánh"}">${
        node.collapsed ? `+${descendantsOf(node.id).size - 1}` : "−"
      }</button>`
    : "";

  card.innerHTML = `
    <div class="avatar">${avatarInner(node)}</div>
    <div class="node-body">
      <div class="node-top">
        <span class="node-gen">Đời ${toRoman(node.generation)}</span>
        ${node.deceased ? '<span class="node-dead">Đã mất</span>' : ""}
      </div>
      <h3 class="node-name" title="${esc(node.name)}">${esc(node.name || "Thành viên mới")}</h3>
      <p class="node-years">${esc(displayYears(node))}</p>
      <span class="node-role">${esc(node.role || node.branch || "—")}</span>
    </div>
    ${toggle}`;
  return card;
}

function refreshCard(id) {
  const old = getCard(id);
  const node = findNode(id);
  if (!old || !node) return;
  old.replaceWith(createCard(node));
  applyNodeClasses();
}

function applyNodeClasses() {
  const lineage = lineageSet();
  const filtering = filtersActive();
  treeLayer.querySelectorAll(".node").forEach((card) => {
    const id = card.dataset.nodeId;
    card.classList.toggle("selected", id === selectedId);
    card.classList.toggle("lineage-fade", Boolean(lineage) && !lineage.has(id));
    card.classList.toggle("filtered-out", filtering && !matchesFilter(findNode(id)));
  });
}

function updatePositions() {
  treeLayer.querySelectorAll(".node").forEach((card) => {
    const node = findNode(card.dataset.nodeId);
    if (!node) return;
    card.style.left = `${node.x}px`;
    card.style.top = `${node.y}px`;
  });
  renderLinks();
  requestMinimap();
}

function renderLinks() {
  const visible = visibleNodes();
  const lineage = lineageSet();
  const normal = [];
  const highlighted = [];

  visible.forEach((node) => {
    const parent = getParent(node);
    if (!parent || index.hidden.has(parent.id)) return;
    const d = linkPath(parent.x, parent.y, node.x, node.y);
    if (lineage && lineage.has(parent.id) && lineage.has(node.id)) {
      highlighted.push(`<path class="link hl" d="${d}"/>`);
    } else {
      normal.push(`<path class="link${lineage ? " faded" : ""}" d="${d}"/>`);
    }
  });

  treeLinks.innerHTML = generationGuides(visible) + normal.join("") + highlighted.join("");
}

function generationGuides(visible) {
  if (!visible.length) return "";
  const rows = new Map();
  visible.forEach((node) => {
    if (!rows.has(node.generation)) rows.set(node.generation, []);
    rows.get(node.generation).push(node.y);
  });
  const minX = Math.min(...visible.map((node) => node.x));
  const maxX = Math.max(...visible.map((node) => node.x)) + NODE_W;
  let out = "";
  rows.forEach((ys, generation) => {
    ys.sort((a, b) => a - b);
    const cy = r1(ys[Math.floor(ys.length / 2)] + NODE_H / 2);
    out += `<line class="gen-line" x1="${r1(minX - 40)}" x2="${r1(maxX + 40)}" y1="${cy}" y2="${cy}"/>`;
    out += `<text class="gen-label-sub" x="${r1(minX - 60)}" y="${cy - 14}" text-anchor="end">ĐỜI</text>`;
    out += `<text class="gen-label" x="${r1(minX - 60)}" y="${cy + 14}" text-anchor="end">${toRoman(generation)}</text>`;
  });
  return out;
}

function linkPath(px, py, cx, cy) {
  const sx = r1(px + NODE_W / 2);
  const sy = r1(py + NODE_H);
  const ex = r1(cx + NODE_W / 2);
  const ey = r1(cy);

  if (ey - sy < 30) {
    const dy = Math.max(60, Math.abs(ey - sy) / 2);
    return `M${sx} ${sy} C${sx} ${r1(sy + dy)} ${ex} ${r1(ey - dy)} ${ex} ${ey}`;
  }
  const my = r1(sy + (ey - sy) / 2);
  const dx = ex - sx;
  if (Math.abs(dx) < 1) return `M${sx} ${sy} V${ey}`;
  const r = Math.min(16, Math.abs(dx) / 2, (ey - sy) / 2);
  const s = Math.sign(dx);
  return `M${sx} ${sy} V${r1(my - r)} Q${sx} ${my} ${r1(sx + s * r)} ${my} H${r1(ex - s * r)} Q${ex} ${my} ${ex} ${r1(my + r)} V${ey}`;
}

function renderBreadcrumb() {
  const chain = ancestorsOf(selectedId);
  if (!chain.length) {
    breadcrumb.innerHTML = `<div class="crumb-wrap"><span class="crumb-hint">Chọn một thành viên để xem dòng dõi · Giữ <kbd>Shift</kbd> khi kéo để di chuyển cả nhánh</span></div>`;
    return;
  }
  const sep = '<svg class="ico crumb-sep"><use href="#i-chevron"/></svg>';
  breadcrumb.innerHTML = `<div class="crumb-wrap">${chain
    .map((node, i) => `<button class="crumb${i === chain.length - 1 ? " current" : ""}" type="button" data-crumb="${esc(node.id)}">${esc(shortName(node.name))}</button>`)
    .join(sep)}</div>`;
  breadcrumb.querySelectorAll("[data-crumb]").forEach((button) => {
    button.addEventListener("click", () => {
      selectNode(button.dataset.crumb);
      focusNode(button.dataset.crumb);
    });
  });
}

/* =========================================================
   Khung nhìn (pan / zoom)
   ========================================================= */
function applyViewport() {
  const { x, y, scale } = state.view;
  treeViewport.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  zoomIndicator.textContent = `${Math.round(scale * 100)}%`;
  requestMinimap();
}

function setView(view, animate = true) {
  cancelAnimationFrame(viewAnim);
  if (!animate || REDUCED_MOTION) {
    state.view = view;
    applyViewport();
    schedulePersist();
    return;
  }
  const from = { ...state.view };
  const t0 = performance.now();
  const duration = 480;
  const step = (now) => {
    const p = Math.min(1, (now - t0) / duration);
    const e = easeOutCubic(p);
    state.view = {
      x: from.x + (view.x - from.x) * e,
      y: from.y + (view.y - from.y) * e,
      scale: from.scale + (view.scale - from.scale) * e,
    };
    applyViewport();
    if (p < 1) viewAnim = requestAnimationFrame(step);
    else schedulePersist();
  };
  viewAnim = requestAnimationFrame(step);
}

function zoomAt(nextScale, px, py, animate = false) {
  const scale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
  const view = state.view;
  const wx = (px - view.x) / view.scale;
  const wy = (py - view.y) / view.scale;
  setView({ x: px - wx * scale, y: py - wy * scale, scale }, animate);
}

function zoomBy(factor) {
  const rect = canvasShell.getBoundingClientRect();
  zoomAt(state.view.scale * factor, rect.width / 2, rect.height / 2, true);
}

function onWheel(event) {
  event.preventDefault();
  const rect = canvasShell.getBoundingClientRect();
  const delta = event.deltaY * (event.deltaMode === 1 ? 33 : 1);
  const factor = Math.exp(-delta * (event.ctrlKey ? 0.01 : 0.0016));
  cancelAnimationFrame(viewAnim);
  zoomAt(state.view.scale * factor, event.clientX - rect.left, event.clientY - rect.top);
}

function boundsOf(rects) {
  if (!rects.length) return { x: 0, y: 0, width: NODE_W, height: NODE_H };
  const minX = Math.min(...rects.map((r) => r.x));
  const minY = Math.min(...rects.map((r) => r.y));
  const maxX = Math.max(...rects.map((r) => r.x + NODE_W));
  const maxY = Math.max(...rects.map((r) => r.y + NODE_H));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function fitView(animate = true, bounds = boundsOf(visibleNodes())) {
  const rect = canvasShell.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const b = { x: bounds.x - 110, y: bounds.y, width: bounds.width + 110, height: bounds.height };
  const scale = clamp(Math.min((rect.width - 80) / b.width, (rect.height - 170) / b.height), MIN_SCALE, 1.1);
  setView(
    {
      x: rect.width / 2 - (b.x + b.width / 2) * scale,
      y: rect.height / 2 - (b.y + b.height / 2) * scale + 6,
      scale,
    },
    animate
  );
}

function anyNodeInView() {
  const rect = canvasShell.getBoundingClientRect();
  const { x, y, scale } = state.view;
  return visibleNodes().some((node) => {
    const left = node.x * scale + x;
    const top = node.y * scale + y;
    return left < rect.width && top < rect.height && left + NODE_W * scale > 0 && top + NODE_H * scale > 0;
  });
}

function focusNode(id, { zoomIn = false } = {}) {
  const node = findNode(id);
  if (!node) return;
  if (index.hidden.has(id)) {
    expandAncestors(id);
    return;
  }
  const rect = canvasShell.getBoundingClientRect();
  const scale = zoomIn ? Math.max(state.view.scale, 0.9) : state.view.scale;
  setView({
    x: rect.width / 2 - (node.x + NODE_W / 2) * scale,
    y: rect.height / 2 - (node.y + NODE_H / 2) * scale,
    scale,
  });
  const card = getCard(id);
  if (card) {
    card.classList.remove("search-hit");
    void card.offsetWidth;
    card.classList.add("search-hit");
  }
}

function ensureVisible(id) {
  const node = findNode(id);
  if (!node || currentView !== "tree") return;
  const rect = canvasShell.getBoundingClientRect();
  const { x, y, scale } = state.view;
  const left = node.x * scale + x;
  const top = node.y * scale + y;
  const margin = 40;
  if (left < margin || top < 70 || left + NODE_W * scale > rect.width - margin || top + NODE_H * scale > rect.height - 90) {
    focusNode(id);
  }
}

function expandAncestors(id) {
  const toOpen = ancestorsOf(id).filter((node) => node.collapsed && node.id !== id);
  if (!toOpen.length) return;
  mutate(() => toOpen.forEach((node) => { node.collapsed = false; }), { layout: true });
  setTimeout(() => focusNode(id), REDUCED_MOTION ? 0 : 580);
}

/* =========================================================
   Tương tác chuột trên canvas
   ========================================================= */
function onCanvasPointerDown(event) {
  if (event.button !== 0) return;
  if (isCompact() && !app.classList.contains("sidebar-hidden")) {
    app.classList.add("sidebar-hidden");
  }
  if (event.target.closest("[data-toggle]")) return;

  const card = event.target.closest(".node");
  cancelAnimationFrame(viewAnim);

  if (card) {
    const node = findNode(card.dataset.nodeId);
    if (!node) return;
    const branchIds = event.shiftKey ? [...descendantsOf(node.id)] : [node.id];
    interaction = {
      type: "node",
      id: node.id,
      card,
      startX: event.clientX,
      startY: event.clientY,
      origins: branchIds.map((id) => ({ id, x: findNode(id).x, y: findNode(id).y })),
      moved: false,
      before: snapshot(),
    };
    return;
  }

  interaction = {
    type: "pan",
    startX: event.clientX,
    startY: event.clientY,
    viewX: state.view.x,
    viewY: state.view.y,
    moved: false,
  };
  canvasShell.classList.add("panning");
}

function onPointerMove(event) {
  if (!interaction) return;
  const dx = event.clientX - interaction.startX;
  const dy = event.clientY - interaction.startY;
  if (!interaction.moved && Math.hypot(dx, dy) < 4) return;
  interaction.moved = true;

  if (interaction.type === "node") {
    const scale = state.view.scale;
    interaction.origins.forEach((origin) => {
      const node = findNode(origin.id);
      node.x = origin.x + dx / scale;
      node.y = origin.y + dy / scale;
      const card = getCard(origin.id);
      if (card) {
        card.style.left = `${node.x}px`;
        card.style.top = `${node.y}px`;
      }
    });
    interaction.card.classList.add("dragging");
    renderLinks();
    requestMinimap();
  } else if (interaction.type === "pan") {
    state.view.x = interaction.viewX + dx;
    state.view.y = interaction.viewY + dy;
    applyViewport();
  }
}

function onPointerUp() {
  if (!interaction) return;
  const current = interaction;
  interaction = null;
  canvasShell.classList.remove("panning");

  if (current.type === "node") {
    current.card.classList.remove("dragging");
    if (current.moved) {
      pushHistory(current.before);
      rebuildIndex();
      schedulePersist();
    } else {
      selectNode(current.id);
    }
  } else if (current.type === "pan") {
    if (current.moved) schedulePersist();
    else if (selectedId) selectNode(null);
  }
}

function onCanvasDblClick(event) {
  const card = event.target.closest(".node");
  if (event.target.closest("[data-toggle]")) return;
  if (card) {
    selectNode(card.dataset.nodeId);
    const input = form.elements.name;
    input.focus();
    input.select();
    return;
  }
  fitView();
}

function onLayerClick(event) {
  const toggle = event.target.closest("[data-toggle]");
  if (!toggle) return;
  event.stopPropagation();
  toggleCollapse(toggle.closest(".node").dataset.nodeId);
}

function onCardKeyDown(event) {
  const card = event.target.closest(".node");
  if (!card || event.target !== card) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    selectNode(card.dataset.nodeId);
  }
}

function onContextMenu(event) {
  const card = event.target.closest(".node");
  if (!card) return;
  event.preventDefault();
  const id = card.dataset.nodeId;
  const node = findNode(id);
  selectNode(id);
  ctxNodeId = id;

  const hasKids = getChildren(id).length > 0;
  contextMenu.querySelector('[data-action="ctx-collapse"] span').textContent = node.collapsed ? "Mở rộng nhánh" : "Thu gọn nhánh";
  contextMenu.querySelector('[data-action="ctx-collapse"]').disabled = !hasKids;
  contextMenu.querySelector('[data-action="ctx-sibling"]').disabled = isRoot(node);
  contextMenu.querySelector('[data-action="ctx-delete"]').disabled = isRoot(node);

  contextMenu.hidden = false;
  const { innerWidth, innerHeight } = window;
  const rect = contextMenu.getBoundingClientRect();
  contextMenu.style.left = `${Math.min(event.clientX, innerWidth - rect.width - 8)}px`;
  contextMenu.style.top = `${Math.min(event.clientY, innerHeight - rect.height - 8)}px`;
}

/* =========================================================
   Minimap
   ========================================================= */
function requestMinimap() {
  if (minimapQueued) return;
  minimapQueued = true;
  requestAnimationFrame(() => {
    minimapQueued = false;
    drawMinimap();
  });
}

function drawMinimap() {
  if (currentView !== "tree" || minimap.offsetParent === null) return;
  const W = 200;
  const H = 132;
  const dpr = window.devicePixelRatio || 1;
  if (minimap.width !== W * dpr) {
    minimap.width = W * dpr;
    minimap.height = H * dpr;
  }
  const ctx = minimap.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = colors.canvas;
  ctx.fillRect(0, 0, W, H);

  const visible = visibleNodes();
  const b = boundsOf(visible);
  const pad = 120;
  const bw = b.width + pad * 2;
  const bh = b.height + pad * 2;
  const s = Math.min(W / bw, H / bh);
  const ox = (W - bw * s) / 2 - (b.x - pad) * s;
  const oy = (H - bh * s) / 2 - (b.y - pad) * s;
  minimapTransform = { s, ox, oy };

  ctx.strokeStyle = colors.link;
  ctx.lineWidth = 1;
  ctx.beginPath();
  visible.forEach((node) => {
    const parent = getParent(node);
    if (!parent || index.hidden.has(parent.id)) return;
    ctx.moveTo(ox + (parent.x + NODE_W / 2) * s, oy + (parent.y + NODE_H) * s);
    ctx.lineTo(ox + (node.x + NODE_W / 2) * s, oy + node.y * s);
  });
  ctx.stroke();

  visible.forEach((node) => {
    ctx.fillStyle = node.id === selectedId ? colors.primary : colors[node.gender] || colors.unknown;
    ctx.globalAlpha = filtersActive() && !matchesFilter(node) ? 0.25 : 0.9;
    ctx.fillRect(ox + node.x * s, oy + node.y * s, Math.max(2, NODE_W * s), Math.max(2, NODE_H * s));
  });
  ctx.globalAlpha = 1;

  const rect = canvasShell.getBoundingClientRect();
  const v = state.view;
  const vx = ox + (-v.x / v.scale) * s;
  const vy = oy + (-v.y / v.scale) * s;
  const vw = (rect.width / v.scale) * s;
  const vh = (rect.height / v.scale) * s;
  ctx.fillStyle = hexAlpha(colors.primary, 0.08);
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 1.5;
  ctx.fillRect(vx, vy, vw, vh);
  ctx.strokeRect(vx, vy, vw, vh);
}

function onMinimapPointer(event) {
  event.preventDefault();
  minimap.setPointerCapture(event.pointerId);
  const move = (e) => {
    if (!minimapTransform) return;
    const r = minimap.getBoundingClientRect();
    const { s, ox, oy } = minimapTransform;
    const wx = (e.clientX - r.left - ox) / s;
    const wy = (e.clientY - r.top - oy) / s;
    const rect = canvasShell.getBoundingClientRect();
    cancelAnimationFrame(viewAnim);
    state.view = { ...state.view, x: rect.width / 2 - wx * state.view.scale, y: rect.height / 2 - wy * state.view.scale };
    applyViewport();
  };
  const up = () => {
    minimap.removeEventListener("pointermove", move);
    minimap.removeEventListener("pointerup", up);
    schedulePersist();
  };
  move(event);
  minimap.addEventListener("pointermove", move);
  minimap.addEventListener("pointerup", up);
}

/* =========================================================
   Chọn thành viên & bảng thông tin
   ========================================================= */
function selectNode(id, { openDrawer = true } = {}) {
  commitEditSession();
  selectedId = id && findNode(id) ? id : null;
  if (selectedId && openDrawer) {
    const wasHidden = app.classList.contains("drawer-hidden");
    setDrawer(true);
    if (wasHidden && !isCompact()) setTimeout(() => ensureVisible(selectedId), 300);
  } else if (!selectedId) {
    setDrawer(false);
  }
  applyNodeClasses();
  renderLinks();
  renderBreadcrumb();
  syncDrawer();
  if (currentView !== "tree") renderActiveView();
  requestMinimap();
}

function goToMember(id, toTree = false) {
  if (!findNode(id)) return;
  if (toTree) switchView("tree");
  selectNode(id);
  if (currentView === "tree") {
    if (index.hidden.has(id)) expandAncestors(id);
    else focusNode(id);
  }
}

function setDrawer(open) {
  app.classList.toggle("drawer-hidden", !open);
  setTimeout(requestMinimap, 300);
}

function syncDrawer() {
  const node = findNode(selectedId);
  drawerEmpty.hidden = Boolean(node);
  drawerBody.hidden = !node;
  if (!node) return;

  const el = form.elements;
  el.name.value = node.name || "";
  el.role.value = node.role || "";
  el.generation.value = String(node.generation || 1);
  el.years.value = node.years || "";
  el.branch.value = node.branch || "";
  el.note.value = node.note || "";
  el.spouse.value = node.spouse || "";
  el.occupation.value = node.occupation || "";
  el.hometown.value = node.hometown || "";
  el.deceased.checked = Boolean(node.deceased);
  form.querySelectorAll('input[name="gender"]').forEach((radio) => {
    radio.checked = radio.value === (node.gender || "");
  });

  syncProfile(node);
  syncFamily(node);

  const root = isRoot(node);
  $("#add-sibling").disabled = root;
  $("#delete-branch").disabled = root;
}

function syncProfile(node) {
  const avatar = $("#avatar-btn");
  avatar.className = `avatar-xl ${node.gender || ""}`;
  $("#avatar-content").innerHTML = avatarInner(node);
  $("#profile-name").textContent = node.name || "Thành viên mới";
  $("#profile-sub").textContent = [`Đời ${toRoman(node.generation)}`, node.branch || "Chưa rõ nhánh", displayYears(node)].join(" · ");
  $("#remove-photo").hidden = !node.photo;
}

function syncFamily(node) {
  const parent = getParent(node);
  const siblings = parent ? getChildren(parent.id).filter((item) => item.id !== node.id) : [];
  const kids = getChildren(node.id);
  $("#rel-parent").innerHTML = parent ? personChip(parent) : '<span class="none">Thủy tổ — gốc của phả hệ</span>';
  $("#rel-siblings").innerHTML = siblings.length ? siblings.map(personChip).join("") : '<span class="none">Không có</span>';
  $("#rel-children").innerHTML = kids.length ? kids.map(personChip).join("") : '<span class="none">Chưa có</span>';
  $("#rel-branch-size").textContent = String(descendantsOf(node.id).size);
  $("#rel-depth").textContent = String(descendantDepth(node.id));

  const { birth, death } = parseYears(node.years);
  let age = "–";
  let label = "tuổi";
  if (birth && death) {
    age = String(death - birth);
    label = "hưởng thọ";
  } else if (birth && !node.deceased) {
    age = String(CURRENT_YEAR - birth);
  }
  $("#rel-age").textContent = age;
  $("#rel-age-label").textContent = label;
}

function onFormInput(event) {
  const node = findNode(selectedId);
  if (!node) return;
  if (!editSession) editSession = snapshot();

  const { name, value, type, checked } = event.target;
  if (name === "generation") {
    const numeric = Number.parseInt(value, 10);
    node.generation = Number.isFinite(numeric) ? clamp(numeric, 1, 40) : 1;
  } else if (name === "deceased") {
    node.deceased = checked;
  } else if (name === "gender") {
    node.gender = value;
  } else if (name in node) {
    node[name] = value;
  }

  if (name === "years" && !node.deceased && parseYears(value).death !== null) {
    node.deceased = true;
    form.elements.deceased.checked = true;
  }

  refreshCard(node.id);
  renderLinks();
  syncProfile(node);
  if (name === "name") renderBreadcrumb();
  syncSidebar();
  if (currentView !== "tree") renderActiveView();
  requestMinimap();
  schedulePersist();

  if (type === "radio" || type === "checkbox") commitEditSession();
}

function commitEditSession() {
  if (editSession && editSession !== snapshot()) {
    pushHistory(editSession);
  }
  editSession = null;
}

async function onPhotoChosen(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  const node = findNode(selectedId);
  if (!file || !node) return;
  try {
    const dataUrl = await resizeImage(file, 192);
    mutate(() => { node.photo = dataUrl; }, { message: "Đã cập nhật ảnh đại diện" });
  } catch (error) {
    announce("Không đọc được ảnh này");
  }
}

/* =========================================================
   Thao tác dữ liệu (có hoàn tác)
   ========================================================= */
function snapshot() {
  settleLayout();
  return JSON.stringify({ nodes: state.nodes, meta: state.meta });
}

function pushHistory(snap) {
  history.past.push(snap);
  if (history.past.length > HISTORY_LIMIT) history.past.shift();
  history.future.length = 0;
  syncHistoryButtons();
}

function mutate(fn, { message = "", layout = false, undoAction = false } = {}) {
  commitEditSession();
  const before = snapshot();
  if (fn() === false) return false;
  pushHistory(before);
  renderScene();
  if (layout && state.meta.autoLayout) runAutoLayout();
  schedulePersist();
  if (message) announce(message, undoAction ? { label: "Hoàn tác", fn: undo } : null);
  return true;
}

function restore(snap) {
  cancelAnimationFrame(layoutAnim);
  pendingLayout = null;
  const data = JSON.parse(snap);
  state.nodes = data.nodes;
  state.meta = data.meta;
  if (selectedId && !state.nodes.some((node) => node.id === selectedId)) selectedId = null;
  familyTitle.value = state.meta.title;
  autoLayoutToggle.checked = state.meta.autoLayout;
  syncTitle();
  renderScene();
  if (!selectedId) setDrawer(false);
  schedulePersist();
}

function undo() {
  commitEditSession();
  if (!history.past.length) {
    announce("Không còn thao tác để hoàn tác");
    return;
  }
  history.future.push(snapshot());
  restore(history.past.pop());
  announce("Đã hoàn tác");
}

function redo() {
  if (!history.future.length) {
    announce("Không còn thao tác để làm lại");
    return;
  }
  history.past.push(snapshot());
  restore(history.future.pop());
  announce("Đã làm lại");
}

function syncHistoryButtons() {
  $("#undo-btn").disabled = !history.past.length;
  $("#redo-btn").disabled = !history.future.length;
}

function blankMember(overrides) {
  return {
    id: createId(),
    parentId: null,
    x: 0,
    y: 0,
    name: "Thành viên mới",
    role: "",
    generation: 1,
    years: "",
    branch: "",
    note: "",
    gender: "",
    spouse: "",
    occupation: "",
    hometown: "",
    deceased: false,
    photo: "",
    collapsed: false,
    ...overrides,
  };
}

function addChild(parentId) {
  const parent = findNode(parentId);
  if (!parent) return;
  const kids = getChildren(parent.id);
  const child = blankMember({
    parentId: parent.id,
    generation: clamp((parent.generation || 1) + 1, 1, 40),
    branch: parent.branch === "Gốc tổ" ? "" : parent.branch,
    x: kids.length ? Math.max(...kids.map((kid) => kid.x)) + 1 : parent.x,
    y: parent.y,
  });
  if (!state.meta.autoLayout) {
    child.x = kids.length ? Math.max(...kids.map((kid) => kid.x)) + NODE_W + GAP_X : parent.x;
    child.y = parent.y + NODE_H + GAP_Y;
  }
  mutate(() => {
    parent.collapsed = false;
    state.nodes.push(child);
    selectedId = child.id;
  }, { message: `Đã thêm con cho ${shortName(parent.name)}`, layout: true });
  afterAdd(child.id);
}

function addSibling(id) {
  const current = findNode(id);
  const parent = getParent(current);
  if (!current || !parent) return;
  const sibling = blankMember({
    parentId: parent.id,
    generation: current.generation,
    branch: current.branch,
    x: current.x + 1,
    y: current.y,
  });
  if (!state.meta.autoLayout) {
    sibling.x = Math.max(...getChildren(parent.id).map((kid) => kid.x)) + NODE_W + GAP_X;
  }
  mutate(() => {
    state.nodes.push(sibling);
    selectedId = sibling.id;
  }, { message: "Đã thêm anh/chị/em", layout: true });
  afterAdd(sibling.id);
}

function afterAdd(id) {
  setDrawer(true);
  switchView("tree");
  setTimeout(() => {
    ensureVisible(id);
    const input = form.elements.name;
    input.focus();
    input.select();
  }, REDUCED_MOTION ? 0 : 600);
}

function deleteBranch(id) {
  const node = findNode(id);
  if (!node) return;
  if (isRoot(node)) {
    announce("Không thể xóa thủy tổ của cây");
    return;
  }
  const ids = descendantsOf(node.id);
  mutate(() => {
    state.nodes = state.nodes.filter((item) => !ids.has(item.id));
    selectedId = node.parentId;
  }, {
    message: ids.size > 1 ? `Đã xóa nhánh ${shortName(node.name)} (${ids.size} người)` : `Đã xóa ${shortName(node.name)}`,
    layout: true,
    undoAction: true,
  });
}

function toggleCollapse(id) {
  const node = findNode(id);
  if (!node || !getChildren(id).length) return;
  mutate(() => {
    node.collapsed = !node.collapsed;
    if (node.collapsed && selectedId && selectedId !== id && descendantsOf(id).has(selectedId)) selectedId = id;
  }, { layout: true });
}

function collapseAll() {
  const targets = state.nodes.filter((node) => !isRoot(node) && getChildren(node.id).length && !node.collapsed);
  if (!targets.length) return announce("Các nhánh đã được thu gọn");
  mutate(() => targets.forEach((node) => { node.collapsed = true; }), { message: "Đã thu gọn tất cả các nhánh", layout: true });
  if (selectedId && index.hidden.has(selectedId)) selectNode(null);
  setTimeout(() => fitView(), REDUCED_MOTION ? 0 : 580);
}

function expandAll() {
  const targets = state.nodes.filter((node) => node.collapsed);
  if (!targets.length) return announce("Tất cả các nhánh đang mở");
  mutate(() => targets.forEach((node) => { node.collapsed = false; }), { message: "Đã mở rộng tất cả", layout: true });
  setTimeout(() => fitView(), REDUCED_MOTION ? 0 : 580);
}

function resetTree() {
  mutate(() => {
    const fresh = createDefaultState();
    state.nodes = fresh.nodes;
    state.meta = fresh.meta;
    selectedId = null;
  }, { message: "Đã khôi phục dữ liệu mẫu", undoAction: true });
  familyTitle.value = state.meta.title;
  autoLayoutToggle.checked = state.meta.autoLayout;
  syncTitle();
  setDrawer(false);
  fitView();
}

function moveSelectedBy(dx, dy) {
  const node = findNode(selectedId);
  if (!node || index.hidden.has(node.id)) return;
  const now = performance.now();
  if (now - lastArrowMove > 700) pushHistory(snapshot());
  lastArrowMove = now;
  node.x += dx;
  node.y += dy;
  updatePositions();
  schedulePersist();
}

/* =========================================================
   Bộ lọc
   ========================================================= */
function filtersActive() {
  return Boolean(filters.gender || filters.generations.size || filters.branches.size);
}

function matchesFilter(node) {
  if (!node) return false;
  if (filters.gender && node.gender !== filters.gender) return false;
  if (filters.generations.size && !filters.generations.has(node.generation)) return false;
  if (filters.branches.size && !filters.branches.has(node.branch || "")) return false;
  return true;
}

function toggleFilterChip(event, set, cast) {
  const chip = event.target.closest(".chip");
  if (!chip) return;
  const value = cast(chip.dataset.value);
  if (set.has(value)) set.delete(value);
  else set.add(value);
  onFiltersChanged();
}

function onFiltersChanged() {
  applyNodeClasses();
  syncSidebar();
  requestMinimap();
  if (currentView !== "tree") renderActiveView();
}

function syncSidebar() {
  const nodes = state.nodes;
  const generations = [...new Set(nodes.map((node) => node.generation))].sort((a, b) => a - b);
  const branchCounts = new Map();
  nodes.forEach((node) => {
    const key = node.branch || "";
    branchCounts.set(key, (branchCounts.get(key) || 0) + 1);
  });

  $("#kpi-members").textContent = String(nodes.length);
  $("#kpi-generations").textContent = String(generations.length);
  $("#kpi-living").textContent = String(nodes.filter((node) => !node.deceased).length);
  $("#kpi-branches").textContent = String([...branchCounts.keys()].filter(Boolean).length);

  $("#filter-gender").querySelectorAll("button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.value === filters.gender));
  });

  $("#filter-generations").innerHTML = generations
    .map((g) => {
      const count = nodes.filter((node) => node.generation === g).length;
      return `<button class="chip" type="button" data-value="${g}" aria-pressed="${filters.generations.has(g)}">Đời ${toRoman(g)} <small>${count}</small></button>`;
    })
    .join("");

  $("#filter-branches").innerHTML = [...branchCounts.entries()]
    .sort((a, b) => collator.compare(a[0] || "~", b[0] || "~"))
    .map(([branch, count]) => `<button class="chip" type="button" data-value="${esc(branch)}" aria-pressed="${filters.branches.has(branch)}">${esc(branch || "Chưa rõ")} <small>${count}</small></button>`)
    .join("");

  $("#branch-options").innerHTML = [...branchCounts.keys()].filter(Boolean).map((branch) => `<option value="${esc(branch)}">`).join("");

  const active = filtersActive();
  $("#clear-filters").hidden = !active;
  $("#filter-result").textContent = active ? `Khớp ${nodes.filter(matchesFilter).length}/${nodes.length} thành viên` : "";
}

/* =========================================================
   Các chế độ xem khác
   ========================================================= */
function switchView(view) {
  if (!["tree", "list", "stats", "timeline"].includes(view)) return;
  currentView = view;
  document.querySelectorAll(".tab").forEach((tab) => tab.setAttribute("aria-selected", String(tab.dataset.view === view)));
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.panel !== view;
  });
  prefs.view = view;
  savePrefs();
  renderActiveView();
  if (view === "tree") requestMinimap();
}

function renderActiveView() {
  if (currentView === "list") renderList();
  else if (currentView === "stats") renderStats();
  else if (currentView === "timeline") renderTimeline();
}

function renderList() {
  const query = normalizeText($("#list-query").value.trim());
  const rows = state.nodes.filter((node) => matchesFilter(node) && (!query || searchHaystack(node).includes(query)));
  const getters = {
    name: (n) => n.name,
    generation: (n) => n.generation,
    branch: (n) => n.branch || "~",
    birth: (n) => parseYears(n.years).birth ?? 99999,
    role: (n) => n.role || "~",
    parent: (n) => getParent(n)?.name || "",
    children: (n) => getChildren(n.id).length,
  };
  const get = getters[listSort.key];
  const dir = listSort.dir === "asc" ? 1 : -1;
  rows.sort((a, b) => {
    const va = get(a);
    const vb = get(b);
    const cmp = typeof va === "number" ? va - vb : collator.compare(va, vb);
    return (cmp || collator.compare(a.name, b.name)) * dir;
  });

  document.querySelectorAll(".member-table th").forEach((th) => {
    if (th.dataset.sort === listSort.key) th.dataset.dir = listSort.dir;
    else delete th.dataset.dir;
  });

  $("#list-count").textContent = `${rows.length} / ${state.nodes.length} thành viên${filtersActive() ? " (đang lọc)" : ""} · Nhấp đúp để xem trên cây`;
  $("#member-tbody").innerHTML = rows.length
    ? rows
        .map((node) => {
          const parent = getParent(node);
          return `<tr data-id="${esc(node.id)}" class="${node.id === selectedId ? "selected" : ""}">
            <td><div class="cell-person"><span class="mini-av ${node.gender}">${avatarInner(node)}</span><div>${esc(node.name)}${
              node.spouse ? `<div class="muted" style="font-weight:400;font-size:12px">Vợ/chồng: ${esc(node.spouse)}</div>` : ""
            }</div></div></td>
            <td><span class="gen-pill">${toRoman(node.generation)}</span></td>
            <td>${esc(node.branch || "—")}</td>
            <td>${esc(displayYears(node))}</td>
            <td class="muted">${esc(node.role || "—")}</td>
            <td>${parent ? esc(parent.name) : '<span class="muted">Thủy tổ</span>'}</td>
            <td class="num">${getChildren(node.id).length}</td>
          </tr>`;
        })
        .join("")
    : `<tr class="empty-row"><td colspan="7">Không có thành viên nào khớp.</td></tr>`;
}

function renderStats() {
  const nodes = state.nodes;
  const total = nodes.length;
  const male = nodes.filter((n) => n.gender === "male").length;
  const female = nodes.filter((n) => n.gender === "female").length;
  const unknown = total - male - female;
  const living = nodes.filter((n) => !n.deceased).length;
  const lifespans = nodes
    .map((n) => ({ node: n, ...parseYears(n.years) }))
    .filter((item) => item.birth && item.death)
    .map((item) => ({ node: item.node, value: item.death - item.birth }));
  const avgLife = lifespans.length ? Math.round(lifespans.reduce((s, i) => s + i.value, 0) / lifespans.length) : null;

  const genMap = new Map();
  nodes.forEach((n) => genMap.set(n.generation, (genMap.get(n.generation) || 0) + 1));
  const genRows = [...genMap.entries()].sort((a, b) => a[0] - b[0]).map(([g, c]) => ({ label: `Đời ${toRoman(g)}`, value: c }));

  const branchMap = new Map();
  nodes.forEach((n) => branchMap.set(n.branch || "Chưa rõ", (branchMap.get(n.branch || "Chưa rõ") || 0) + 1));
  const branchRows = [...branchMap.entries()].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }));

  const decadeMap = new Map();
  nodes.forEach((n) => {
    const { birth } = parseYears(n.years);
    if (!birth) return;
    const decade = Math.floor(birth / 10) * 10;
    decadeMap.set(decade, (decadeMap.get(decade) || 0) + 1);
  });
  const decadeRows = [...decadeMap.entries()].sort((a, b) => a[0] - b[0]).map(([d, value]) => ({ label: `${d} – ${d + 9}`, value }));

  const mostKids = nodes
    .map((n) => ({ node: n, value: getChildren(n.id).length }))
    .filter((i) => i.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const longest = lifespans.sort((a, b) => b.value - a.value).slice(0, 5);

  const tile = (label, value, note = "") =>
    `<div class="card tile"><span class="tile-label">${label}</span><strong class="tile-value">${value}</strong>${note ? `<span class="tile-note">${note}</span>` : ""}</div>`;

  $("#stats-grid").innerHTML = `
    ${tile("Thành viên", total, `${genMap.size} đời`)}
    ${tile("Còn sống", living, `${total ? Math.round((living / total) * 100) : 0}% tổng số`)}
    ${tile("Đã mất", total - living)}
    ${tile("Tuổi thọ TB", avgLife ?? "–", lifespans.length ? `từ ${lifespans.length} người có đủ năm` : "chưa đủ dữ liệu")}
    ${tile("Nhánh", [...branchMap.keys()].filter((b) => b !== "Chưa rõ").length)}
    ${tile("Đời sâu nhất", toRoman(Math.max(...nodes.map((n) => n.generation))))}

    <div class="card"><h3>Thành viên theo đời</h3>${barChart(genRows, "", "người")}</div>
    <div class="card"><h3>Tỷ lệ giới tính</h3>${donut([
      { label: "Nam", value: male, color: "var(--male)" },
      { label: "Nữ", value: female, color: "var(--female)" },
      { label: "Chưa rõ", value: unknown, color: "var(--unknown)" },
    ], total)}</div>
    <div class="card"><h3>Thành viên theo nhánh</h3>${barChart(branchRows, "gold", "người")}</div>

    <div class="card"><h3>Đông con nhất</h3>${rankList(mostKids, (v) => `${v} con`)}</div>
    <div class="card"><h3>Sống thọ nhất</h3>${rankList(longest, (v) => `${v} tuổi`)}</div>
    <div class="card"><h3>Năm sinh theo thập niên</h3>${barChart(decadeRows, "", "người sinh ra")}</div>
  `;
}

function barChart(rows, tone, unit) {
  if (!rows.length) return '<p class="muted">Chưa có dữ liệu.</p>';
  const max = Math.max(...rows.map((r) => r.value));
  return `<div class="bars">${rows
    .map(
      (r, i) => `<div class="bar-row" data-tip="${esc(r.label)}\n${r.value} ${unit}">
        <span class="bar-label">${esc(r.label)}</span>
        <div class="bar-track"><div class="bar-fill ${tone}" style="width:${(r.value / max) * 100}%;animation-delay:${i * 40}ms"></div></div>
        <span class="bar-value">${r.value}</span>
      </div>`
    )
    .join("")}</div>`;
}

function donut(segments, total) {
  const live = segments.filter((s) => s.value > 0);
  const gap = live.length > 1 ? 2 : 0;
  let angle = 0;
  const stops = [];
  live.forEach((s) => {
    const sweep = (s.value / total) * 360;
    stops.push(`${s.color} ${angle}deg ${angle + sweep - gap}deg`, `var(--surface) ${angle + sweep - gap}deg ${angle + sweep}deg`);
    angle += sweep;
  });
  return `<div class="donut-wrap">
    <div class="donut" style="background:conic-gradient(${stops.join(",") || "var(--surface-3) 0 360deg"})">
      <div class="donut-center"><strong>${total}</strong><span>người</span></div>
    </div>
    <ul class="donut-legend">${segments
      .map((s) => `<li><i style="background:${s.color}"></i><span>${s.label}</span><b>${s.value} · ${total ? Math.round((s.value / total) * 100) : 0}%</b></li>`)
      .join("")}</ul>
  </div>`;
}

function rankList(items, format) {
  if (!items.length) return '<p class="muted">Chưa có dữ liệu.</p>';
  return `<ol class="rank">${items
    .map(
      (item, i) => `<li data-goto="${esc(item.node.id)}" title="Xem trên cây">
        <span class="rank-n">${i + 1}</span>
        <span class="rank-name">${esc(item.node.name)}</span>
        <span class="rank-v">${format(item.value)}</span>
      </li>`
    )
    .join("")}</ol>`;
}

function renderTimeline() {
  const items = state.nodes
    .filter(matchesFilter)
    .map((node) => ({ node, ...parseYears(node.years) }));
  const dated = items.filter((i) => i.birth).sort((a, b) => a.birth - b.birth || collator.compare(a.node.name, b.node.name));
  const undated = items.filter((i) => !i.birth);
  const container = $("#timeline");

  if (!dated.length) {
    container.innerHTML = `<p class="tl-section">Chưa có thành viên nào ghi năm sinh.</p>`;
    return;
  }

  const minYear = Math.floor(dated[0].birth / 10) * 10;
  const maxYear = Math.max(CURRENT_YEAR, ...dated.map((i) => i.death || 0));
  const span = Math.max(1, maxYear - minYear);
  const pct = (year) => ((year - minYear) / span) * 100;
  const stepCandidates = [5, 10, 20, 25, 50];
  const tickStep = stepCandidates.find((s) => span / s <= 9) || 100;
  const ticks = [];
  for (let y = Math.ceil(minYear / tickStep) * tickStep; y <= maxYear; y += tickStep) ticks.push(y);

  const rows = dated
    .map((item, i) => {
      const { node, birth, death } = item;
      const end = death ?? (node.deceased ? birth : CURRENT_YEAR);
      const left = pct(birth);
      const width = Math.max(0.6, pct(end) - left);
      const alive = !node.deceased;
      const label = `${birth} – ${death ?? (alive ? "nay" : "?")}${death ? ` · ${death - birth} tuổi` : alive ? ` · ${CURRENT_YEAR - birth} tuổi` : ""}`;
      const nearEnd = left + width > 78;
      const labelStyle = nearEnd ? `right:${100 - left}%;padding:0 8px 0 0` : `left:${left + width}%`;
      const tip = `${node.name}\nĐời ${toRoman(node.generation)} · ${node.branch || "Chưa rõ nhánh"}\n${label}`;
      return `<div class="tl-row${node.id === selectedId ? " selected" : ""}" data-goto="${esc(node.id)}" data-tip="${esc(tip)}">
        <div class="tl-name"><span class="mini-av ${node.gender}" style="width:24px;height:24px;font-size:11px">${avatarInner(node)}</span><span>${esc(node.name)}</span><small>${toRoman(node.generation)}</small></div>
        <div class="tl-track">
          <div class="tl-bar ${node.gender}${alive ? " alive" : ""}" style="left:${left}%;width:${width}%;animation-delay:${Math.min(i * 25, 600)}ms"></div>
          <span class="tl-bar-label" style="${labelStyle}">${esc(label)}</span>
        </div>
      </div>`;
    })
    .join("");

  container.innerHTML = `<div class="tl-inner">
    <div class="tl-axis"><div></div><div class="tl-ticks">${ticks.map((y) => `<span class="tl-tick" style="left:${pct(y)}%">${y}</span>`).join("")}</div></div>
    <div class="tl-grid">${ticks.map((y) => `<i style="left:${pct(y)}%"></i>`).join("")}<i class="now" style="left:${pct(CURRENT_YEAR)}%" title="Năm ${CURRENT_YEAR}"></i></div>
    ${rows}
    ${
      undated.length
        ? `<p class="tl-section">Chưa rõ năm sinh (${undated.length})</p><div class="tl-unknown">${undated.map((i) => personChip(i.node)).join("")}</div>`
        : ""
    }
  </div>`;
}

/* =========================================================
   Tìm kiếm (Ctrl + K)
   ========================================================= */
function openSearch() {
  closeFloatingMenus();
  searchModal.hidden = false;
  searchInput.value = "";
  renderSearchResults();
  requestAnimationFrame(() => searchInput.focus());
}

function closeModal(modal) {
  modal.hidden = true;
}

function searchHaystack(node) {
  return normalizeText(
    [node.name, node.role, node.branch, node.years, node.note, node.spouse, node.occupation, node.hometown, `doi ${node.generation}`, `doi ${toRoman(node.generation)}`]
      .filter(Boolean)
      .join(" ")
  );
}

function renderSearchResults() {
  const query = normalizeText(searchInput.value.trim());
  searchList = query
    ? state.nodes
        .filter((node) => searchHaystack(node).includes(query))
        .sort((a, b) => {
          const an = normalizeText(a.name).includes(query) ? 0 : 1;
          const bn = normalizeText(b.name).includes(query) ? 0 : 1;
          return an - bn || a.generation - b.generation;
        })
    : [...state.nodes].sort((a, b) => a.generation - b.generation || collator.compare(a.name, b.name));
  searchList = searchList.slice(0, 60);
  searchActive = 0;

  if (!searchList.length) {
    searchResults.innerHTML = `<li class="r-empty">Không tìm thấy “${esc(searchInput.value.trim())}”</li>`;
    return;
  }
  searchResults.innerHTML = searchList
    .map(
      (node, i) => `<li role="option" data-id="${esc(node.id)}" data-index="${i}" aria-selected="${i === 0}">
        <span class="mini-av ${node.gender}">${avatarInner(node)}</span>
        <div><div class="r-name">${highlightMatch(node.name, query)}</div><div class="r-sub">${esc(
          [node.role, node.branch, displayYears(node)].filter(Boolean).join(" · ")
        )}</div></div>
        <span class="r-gen">Đời ${toRoman(node.generation)}</span>
      </li>`
    )
    .join("");
}

function highlightSearchActive() {
  searchResults.querySelectorAll("li[data-index]").forEach((li) => {
    const active = Number(li.dataset.index) === searchActive;
    li.setAttribute("aria-selected", String(active));
    if (active) li.scrollIntoView({ block: "nearest" });
  });
}

function onSearchKeyDown(event) {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    if (!searchList.length) return;
    const delta = event.key === "ArrowDown" ? 1 : -1;
    searchActive = (searchActive + delta + searchList.length) % searchList.length;
    highlightSearchActive();
  } else if (event.key === "Enter") {
    event.preventDefault();
    const node = searchList[searchActive];
    if (node) chooseSearchResult(node.id);
  }
}

function chooseSearchResult(id) {
  closeModal(searchModal);
  goToMember(id, currentView === "tree" || currentView === "stats");
}

function highlightMatch(text, query) {
  if (!query) return esc(text);
  const chars = Array.from(text);
  const normalized = chars.map((ch) => normalizeText(ch));
  if (normalized.some((ch) => ch.length !== 1)) return esc(text);
  const start = normalized.join("").indexOf(query);
  if (start < 0) return esc(text);
  const end = start + query.length;
  return `${esc(chars.slice(0, start).join(""))}<mark>${esc(chars.slice(start, end).join(""))}</mark>${esc(chars.slice(end).join(""))}`;
}

/* =========================================================
   Menu, phím tắt, giao diện
   ========================================================= */
function toggleMoreMenu(force) {
  const open = force ?? moreMenu.hidden;
  moreMenu.hidden = !open;
  moreBtn.setAttribute("aria-expanded", String(open));
}

function closeFloatingMenus(event) {
  if (event && (event.target.closest?.("#more-menu, #more-btn, #context-menu"))) return;
  toggleMoreMenu(false);
  contextMenu.hidden = true;
}

function onMenuAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  toggleMoreMenu(false);
  contextMenu.hidden = true;

  switch (action) {
    case "export-json": return exportJson();
    case "import-json": return importInput.click();
    case "export-png": return exportPng();
    case "shortcuts": helpModal.hidden = false; return;
    case "reset": return resetTree();
    case "ctx-child": return addChild(ctxNodeId);
    case "ctx-sibling": return addSibling(ctxNodeId);
    case "ctx-collapse": return toggleCollapse(ctxNodeId);
    case "ctx-focus": return focusNode(ctxNodeId, { zoomIn: true });
    case "ctx-delete": return deleteBranch(ctxNodeId);
    default:
  }
}

function onKeyDown(event) {
  const typing = event.target.closest?.("input, textarea, select, [contenteditable]");
  const mod = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();

  if (mod && key === "k") {
    event.preventDefault();
    openSearch();
    return;
  }

  if (event.key === "Escape") {
    const openModal = document.querySelector(".modal:not([hidden])");
    if (openModal) return closeModal(openModal);
    if (!contextMenu.hidden || !moreMenu.hidden) return closeFloatingMenus();
    if (typing) return event.target.blur();
    if (selectedId) return selectNode(null);
    return;
  }

  if (typing || document.querySelector(".modal:not([hidden])")) return;

  if (mod && key === "z") {
    event.preventDefault();
    return event.shiftKey ? redo() : undo();
  }
  if (mod && key === "y") {
    event.preventDefault();
    return redo();
  }
  if (mod || event.altKey) return;

  const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  if (arrows[event.key] && currentView === "tree" && selectedId) {
    event.preventDefault();
    const step = event.shiftKey ? 40 : 10;
    moveSelectedBy(arrows[event.key][0] * step, arrows[event.key][1] * step);
    return;
  }

  const views = { 1: "tree", 2: "list", 3: "stats", 4: "timeline" };
  if (views[event.key]) return switchView(views[event.key]);

  switch (event.key) {
    case "?": helpModal.hidden = false; break;
    case "n": case "N": if (selectedId) addChild(selectedId); break;
    case "s": case "S": if (selectedId) addSibling(selectedId); break;
    case "Delete": case "Backspace": if (selectedId) deleteBranch(selectedId); break;
    case "c": case "C": if (selectedId) toggleCollapse(selectedId); break;
    case "l": case "L": switchView("tree"); arrangeTree(); break;
    case "f": case "F": switchView("tree"); fitView(); break;
    case "+": case "=": zoomBy(1.2); break;
    case "-": case "_": zoomBy(1 / 1.2); break;
    case "t": case "T": toggleTheme(); break;
    default: return;
  }
  event.preventDefault();
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* bỏ qua */ }
  readColors();
  requestMinimap();
}

function toggleSidebar() {
  app.classList.toggle("sidebar-hidden");
  prefs.sidebarHidden = app.classList.contains("sidebar-hidden");
  savePrefs();
  setTimeout(requestMinimap, 300);
}

function toggleLineage() {
  prefs.lineage = !prefs.lineage;
  $("#toggle-lineage").setAttribute("aria-pressed", String(prefs.lineage));
  savePrefs();
  applyNodeClasses();
  renderLinks();
  announce(prefs.lineage ? "Bật làm nổi bật dòng dõi" : "Tắt làm nổi bật dòng dõi");
}

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen?.();
  else document.documentElement.requestFullscreen?.().catch(() => announce("Trình duyệt không cho phép toàn màn hình"));
}

function syncTitle() {
  const title = state.meta.title.trim() || "Gia phả dòng họ";
  document.title = title;
  familyTitle.style.width = `${clamp(Array.from(familyTitle.value).length + 2, 8, 28)}ch`;
}

function readColors() {
  const css = getComputedStyle(document.documentElement);
  ["canvas", "link", "primary", "male", "female", "unknown", "surface", "surface-2", "ink", "ink-2", "muted", "line", "gold", "gold-soft", "male-soft", "female-soft", "unknown-soft", "link-hl"].forEach((name) => {
    colors[name] = css.getPropertyValue(`--${name}`).trim();
  });
}

/* =========================================================
   Tooltip
   ========================================================= */
function initTooltips() {
  const tip = document.createElement("div");
  tip.className = "tooltip";
  tip.hidden = true;
  document.body.appendChild(tip);
  let current = null;

  document.addEventListener("pointerover", (event) => {
    const target = event.target.closest?.("[data-tip]");
    if (target === current) return;
    current = target;
    if (!target) {
      tip.hidden = true;
      return;
    }
    const [first, ...rest] = target.dataset.tip.split("\n");
    tip.replaceChildren();
    const bold = document.createElement("b");
    bold.textContent = first;
    tip.appendChild(bold);
    rest.forEach((line) => {
      const div = document.createElement("div");
      div.textContent = line;
      tip.appendChild(div);
    });
    tip.hidden = false;
  });
  document.addEventListener("pointermove", (event) => {
    if (tip.hidden) return;
    const rect = tip.getBoundingClientRect();
    const x = Math.min(event.clientX + 14, window.innerWidth - rect.width - 8);
    const y = event.clientY + 16 + rect.height > window.innerHeight ? event.clientY - rect.height - 12 : event.clientY + 16;
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
  });
}

/* =========================================================
   Xuất / nhập
   ========================================================= */
function exportJson() {
  const payload = JSON.stringify({ version: 3, meta: state.meta, nodes: state.nodes, view: state.view }, null, 2);
  download(new Blob([payload], { type: "application/json" }), `gia-pha-${today()}.json`);
  announce("Đã xuất tệp JSON");
}

async function importTree(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const next = normalizeImportedState(parsed);
    mutate(() => {
      state.nodes = next.nodes;
      state.meta = next.meta;
      selectedId = null;
    }, { message: `Đã nhập ${next.nodes.length} thành viên`, undoAction: true });
    familyTitle.value = state.meta.title;
    autoLayoutToggle.checked = state.meta.autoLayout;
    syncTitle();
    setDrawer(false);
    switchView("tree");
    fitView();
  } catch (error) {
    console.error("Không thể nhập cây gia phả:", error);
    announce(error instanceof SyntaxError ? "Tệp JSON không hợp lệ" : error.message || "Tệp JSON không hợp lệ");
  }
}

async function exportPng() {
  const visible = visibleNodes();
  if (!visible.length) return;
  announce("Đang tạo ảnh…");
  try {
    await document.fonts?.ready;
    const b = boundsOf(visible);
    const pad = 60;
    const header = 96;
    const W = b.width + pad * 2;
    const H = b.height + pad * 2 + header;
    let scale = 2;
    while (scale > 0.5 && (W * scale > 16000 || H * scale > 16000 || W * H * scale * scale > 100e6)) scale -= 0.25;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(W * scale);
    canvas.height = Math.round(H * scale);
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    ctx.fillStyle = colors.canvas;
    ctx.fillRect(0, 0, W, H);

    const generations = new Set(state.nodes.map((n) => n.generation)).size;
    ctx.fillStyle = colors.ink;
    ctx.font = '700 30px "Playfair Display", Georgia, serif';
    ctx.fillText(state.meta.title || "Gia phả", pad, 58);
    ctx.fillStyle = colors.muted;
    ctx.font = '500 14px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`${state.nodes.length} thành viên · ${generations} đời · xuất ngày ${new Date().toLocaleDateString("vi-VN")}`, pad, 82);

    ctx.translate(pad - b.x, pad + header - b.y);
    ctx.strokeStyle = colors.link;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    visible.forEach((node) => {
      const parent = getParent(node);
      if (!parent || index.hidden.has(parent.id)) return;
      ctx.stroke(new Path2D(linkPath(parent.x, parent.y, node.x, node.y)));
    });

    const images = new Map();
    await Promise.all(
      visible.filter((n) => n.photo).map((n) => loadImage(n.photo).then((img) => images.set(n.id, img)).catch(() => {}))
    );

    visible.forEach((node) => drawCardOnCanvas(ctx, node, images.get(node.id)));

    canvas.toBlob((blob) => {
      if (!blob) return announce("Không tạo được ảnh");
      download(blob, `gia-pha-${today()}.png`);
      announce("Đã xuất ảnh PNG");
    }, "image/png");
  } catch (error) {
    console.error(error);
    announce("Không tạo được ảnh");
  }
}

function drawCardOnCanvas(ctx, node, image) {
  const { x, y } = node;
  const accent = colors[node.gender] || colors.unknown;
  const accentSoft = colors[`${node.gender || "unknown"}-soft`] || colors["unknown-soft"];
  const root = isRoot(node);

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.08)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  roundRect(ctx, x, y, NODE_W, NODE_H, 14);
  ctx.fillStyle = root ? colors["gold-soft"] : colors.surface;
  ctx.fill();
  ctx.restore();
  roundRect(ctx, x, y, NODE_W, NODE_H, 14);
  ctx.strokeStyle = root ? colors.gold : colors.line;
  ctx.lineWidth = root ? 2 : 1;
  ctx.stroke();

  ctx.fillStyle = accent;
  roundRect(ctx, x, y + 12, 4, NODE_H - 24, 2);
  ctx.fill();

  const cx = x + 16 + 25;
  const cy = y + NODE_H / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 25, 0, Math.PI * 2);
  ctx.fillStyle = accentSoft;
  ctx.fill();
  if (image) {
    ctx.save();
    ctx.clip();
    ctx.drawImage(image, cx - 25, cy - 25, 50, 50);
    ctx.restore();
  } else {
    ctx.fillStyle = accent;
    ctx.font = '700 21px "Playfair Display", Georgia, serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials(node.name), cx, cy + 1);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  const tx = x + 78;
  const maxW = NODE_W - 78 - 12;
  ctx.fillStyle = root ? colors.gold : accent;
  ctx.font = '700 10.5px "Be Vietnam Pro", sans-serif';
  ctx.fillText(`ĐỜI ${toRoman(node.generation)}${node.deceased ? "  ·  ĐÃ MẤT" : ""}`, tx, y + 30);
  ctx.fillStyle = colors.ink;
  ctx.font = '700 15px "Be Vietnam Pro", sans-serif';
  ctx.fillText(fitText(ctx, node.name || "Thành viên", maxW), tx, y + 51);
  ctx.fillStyle = colors["ink-2"];
  ctx.font = '400 12.5px "Be Vietnam Pro", sans-serif';
  ctx.fillText(fitText(ctx, displayYears(node), maxW), tx, y + 71);
  ctx.fillStyle = colors.muted;
  ctx.font = '400 12px "Be Vietnam Pro", sans-serif';
  ctx.fillText(fitText(ctx, node.role || node.branch || "", maxW), tx, y + 89);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && ctx.measureText(`${out}…`).width > maxWidth) out = out.slice(0, -1);
  return `${out}…`;
}

/* =========================================================
   Lưu trữ
   ========================================================= */
function schedulePersist() {
  setSaveStatus("saving");
  clearTimeout(persistTimer);
  persistTimer = setTimeout(persistNow, 350);
}

function persistNow() {
  clearTimeout(persistTimer);
  settleLayout();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSaveStatus("ok");
  } catch (error) {
    setSaveStatus("error");
  }
}

function setSaveStatus(status) {
  const dot = $("#save-dot");
  const text = $("#save-status");
  dot.className = `save-dot${status === "ok" ? "" : ` ${status}`}`;
  if (status === "saving") text.textContent = "Đang lưu…";
  else if (status === "error") text.textContent = "Không lưu được (bộ nhớ trình duyệt đầy?)";
  else text.textContent = `Đã lưu tự động · ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeImportedState(JSON.parse(raw));
  } catch (error) {
    console.warn("Dữ liệu lưu cũ không hợp lệ, dùng dữ liệu mẫu.", error);
  }
  return createDefaultState();
}

function loadPrefs() {
  const defaults = { lineage: true, sidebarHidden: false, view: "tree" };
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") };
  } catch (error) {
    return defaults;
  }
}

function savePrefs() {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (error) {
    /* bỏ qua */
  }
}

function normalizeImportedState(data) {
  const candidateNodes = Array.isArray(data) ? data : data?.nodes;
  if (!Array.isArray(candidateNodes) || !candidateNodes.length) {
    throw new Error("Tệp không có danh sách thành viên hợp lệ.");
  }

  let needsLayout = !data?.meta;
  const str = (value) => (value === undefined || value === null ? "" : String(value));
  const nodes = candidateNodes.map((raw, i) => {
    const years = str(raw.years);
    const generation = Number(raw.generation);
    if (!Number.isFinite(raw.x) || !Number.isFinite(raw.y)) needsLayout = true;
    return {
      id: str(raw.id || `imported-${i + 1}`).trim(),
      parentId: raw.parentId ? String(raw.parentId).trim() : null,
      x: Number.isFinite(raw.x) ? raw.x : i * 10,
      y: Number.isFinite(raw.y) ? raw.y : 0,
      name: str(raw.name) || "Thành viên",
      role: str(raw.role),
      generation: Number.isFinite(generation) && generation > 0 ? clamp(Math.round(generation), 1, 40) : 1,
      years,
      branch: str(raw.branch),
      note: str(raw.note),
      gender: raw.gender === "male" || raw.gender === "female" ? raw.gender : inferGender(str(raw.name)),
      spouse: str(raw.spouse),
      occupation: str(raw.occupation),
      hometown: str(raw.hometown),
      deceased: typeof raw.deceased === "boolean" ? raw.deceased : parseYears(years).death !== null,
      photo: typeof raw.photo === "string" && raw.photo.startsWith("data:image/") ? raw.photo : "",
      collapsed: raw.collapsed === true,
    };
  });

  validateImportedNodes(nodes);

  if (needsLayout) {
    const result = computeLayout(nodes);
    nodes.forEach((node) => Object.assign(node, result.get(node.id)));
  }

  const view = data?.view;
  return {
    nodes,
    view:
      !needsLayout && view && Number.isFinite(view.x) && Number.isFinite(view.y) && Number.isFinite(view.scale)
        ? { x: view.x, y: view.y, scale: clamp(view.scale, MIN_SCALE, MAX_SCALE) }
        : null,
    meta: {
      title: typeof data?.meta?.title === "string" && data.meta.title.trim() ? data.meta.title : "Gia phả dòng họ",
      autoLayout: typeof data?.meta?.autoLayout === "boolean" ? data.meta.autoLayout : true,
    },
  };
}

function validateImportedNodes(nodes) {
  const ids = new Set();
  nodes.forEach((node) => {
    if (!node.id) throw new Error("Mỗi thành viên phải có ID hợp lệ.");
    if (ids.has(node.id)) throw new Error(`ID bị trùng: ${node.id}`);
    ids.add(node.id);
  });
  nodes.forEach((node) => {
    if (node.parentId === node.id) throw new Error(`Thành viên ${node.id} không thể là cha/mẹ của chính mình.`);
    if (node.parentId && !ids.has(node.parentId)) throw new Error(`Không tìm thấy parentId ${node.parentId} cho ${node.id}.`);
  });
  const parentOf = new Map(nodes.map((node) => [node.id, node.parentId]));
  nodes.forEach((node) => {
    const seen = new Set([node.id]);
    let parentId = node.parentId;
    while (parentId) {
      if (seen.has(parentId)) throw new Error(`Phát hiện quan hệ vòng tại ${node.id}.`);
      seen.add(parentId);
      parentId = parentOf.get(parentId) || null;
    }
  });
}

/* =========================================================
   Thông báo
   ========================================================= */
function announce(message, action = null) {
  toastText.textContent = message;
  toastAction.hidden = !action;
  toastAction.onclick = null;
  if (action) {
    toastAction.textContent = action.label;
    toastAction.onclick = () => {
      toastEl.classList.remove("visible");
      action.fn();
    };
  }
  toastEl.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("visible"), action ? 5000 : 2000);
}

/* =========================================================
   Tiện ích
   ========================================================= */
function parseYears(text) {
  const years = String(text || "").match(/\d{4}/g) || [];
  return { birth: years[0] ? Number(years[0]) : null, death: years[1] ? Number(years[1]) : null };
}

function displayYears(node) {
  const text = (node.years || "").trim();
  if (!text) return "Chưa rõ năm";
  const { birth, death } = parseYears(text);
  if (birth && !death && /^\d{4}\s*[-–]?\s*$/.test(text)) {
    return node.deceased ? `${birth} – ?` : `${birth} – nay`;
  }
  return text.replace(/\s*-\s*/g, " – ");
}

function inferGender(name) {
  const padded = ` ${normalizeText(name)} `;
  if (padded.includes(" thi ")) return "female";
  if (padded.includes(" van ")) return "male";
  return "";
}

function initials(name) {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  return words.length ? Array.from(words[words.length - 1])[0].toUpperCase() : "?";
}

function shortName(name) {
  const words = String(name || "").trim().split(/\s+/);
  return words.length > 3 ? words.slice(-3).join(" ") : name;
}

function avatarInner(node) {
  return node.photo ? `<img src="${esc(node.photo)}" alt="" />` : esc(initials(node.name));
}

function personChip(node) {
  return `<button class="person-chip" type="button" data-goto="${esc(node.id)}"><span class="mini-av ${node.gender}">${avatarInner(node)}</span><span>${esc(node.name)}</span></button>`;
}

function normalizeText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase("vi-VN");
}

function getCard(id) {
  return treeLayer.querySelector(`[data-node-id="${CSS.escape(id)}"]`);
}

function createId() {
  return window.crypto?.randomUUID ? window.crypto.randomUUID() : `node-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function isCompact() {
  return window.matchMedia("(max-width: 1080px)").matches;
}

function toRoman(value) {
  let n = clamp(Math.round(value || 1), 1, 3999);
  const map = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  map.forEach(([v, s]) => {
    while (n >= v) {
      out += s;
      n -= v;
    }
  });
  return out;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function r1(value) {
  return Math.round(value * 10) / 10;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function hexAlpha(hex, alpha) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return `rgba(168, 50, 43, ${alpha})`;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function resizeImage(file, size) {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const side = Math.min(img.width, img.height);
    canvas.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
