const STORAGE_KEY = "giapha-editor-state-v2";
const CANVAS_WIDTH = 3200;
const CANVAS_HEIGHT = 2200;
const MIN_SCALE = 0.45;
const MAX_SCALE = 1.6;
const ZOOM_STEP = 0.12;

const defaultState = {
  nodes: [
    {
      id: "node-root",
      parentId: null,
      x: 1460,
      y: 170,
      name: "Cụ Tổ Nguyễn Văn Hữu",
      role: "Khởi nguyên dòng họ",
      generation: 1,
      years: "1858 - 1931",
      branch: "Gốc tổ",
      note: "Người đặt nền nếp đầu tiên và là cột mốc tham chiếu của toàn bộ phả hệ.",
    },
    {
      id: "node-a",
      parentId: "node-root",
      x: 860,
      y: 470,
      name: "Nguyễn Văn Ninh",
      role: "Nhánh trưởng",
      generation: 2,
      years: "1888 - 1956",
      branch: "Nhánh Bắc",
      note: "Phụ trách nhà thờ họ và gìn giữ nhiều gia lễ được truyền lại.",
    },
    {
      id: "node-b",
      parentId: "node-root",
      x: 1470,
      y: 470,
      name: "Nguyễn Văn Kham",
      role: "Nhánh giữa",
      generation: 2,
      years: "1894 - 1968",
      branch: "Nhánh Trung",
      note: "Đánh dấu giai đoạn mở rộng học hành và nghề nghiệp của gia tộc.",
    },
    {
      id: "node-c",
      parentId: "node-root",
      x: 2080,
      y: 470,
      name: "Nguyễn Văn Thịnh",
      role: "Nhánh Nam",
      generation: 2,
      years: "1898 - 1972",
      branch: "Nhánh Nam",
      note: "Lập nhánh cư trú mới và kết nối hôn nhân với nhiều chi họ khác.",
    },
    {
      id: "node-a1",
      parentId: "node-a",
      x: 720,
      y: 800,
      name: "Nguyễn Văn Chinh",
      role: "Người ghi phả ký",
      generation: 3,
      years: "1918 - 1989",
      branch: "Nhánh Bắc",
      note: "Tổng hợp ghi chép, tên gọi và chuyển đời của nhiều đời hậu duệ.",
    },
    {
      id: "node-a2",
      parentId: "node-a",
      x: 1010,
      y: 800,
      name: "Nguyễn Thị Hoa",
      role: "Người giữ kỷ vật",
      generation: 3,
      years: "1924 - 1998",
      branch: "Nhánh Bắc",
      note: "Lưu giữ ảnh xưa, văn tế và nhiều kỷ vật được truyền lại.",
    },
    {
      id: "node-b1",
      parentId: "node-b",
      x: 1320,
      y: 800,
      name: "Nguyễn Thị Lan",
      role: "Người lưu ảnh tư liệu",
      generation: 3,
      years: "1932 - 2006",
      branch: "Nhánh Trung",
      note: "Giúp tập hợp ảnh cũ, thư từ và ký sự của dòng họ.",
    },
    {
      id: "node-b2",
      parentId: "node-b",
      x: 1610,
      y: 800,
      name: "Nguyễn Hữu Minh",
      role: "Đời hậu duệ số hóa",
      generation: 3,
      years: "1940 - 2011",
      branch: "Nhánh Trung",
      note: "Khởi xướng việc chuyển các tài liệu gia phả sang bản điện tử.",
    },
    {
      id: "node-c1",
      parentId: "node-c",
      x: 1930,
      y: 800,
      name: "Nguyễn Văn Quang",
      role: "Người mở rộng địa bàn",
      generation: 3,
      years: "1936 - 2010",
      branch: "Nhánh Nam",
      note: "Liên kết các chi nhánh định cư mới với nhà thờ họ gốc.",
    },
    {
      id: "node-c2",
      parentId: "node-c",
      x: 2220,
      y: 800,
      name: "Nguyễn Thị Bình",
      role: "Người giữ nề nếp",
      generation: 3,
      years: "1943 - 2018",
      branch: "Nhánh Nam",
      note: "Nối kết các dịp họp họ, giỗ tổ và truyền lại gia phong trong nhà.",
    },
  ],
  view: null,
};

const canvasShell = document.querySelector("#canvas-shell");
const treeViewport = document.querySelector("#tree-viewport");
const treeLayer = document.querySelector("#tree-layer");
const treeLinks = document.querySelector("#tree-links");
const memberCount = document.querySelector("#member-count");
const generationCount = document.querySelector("#generation-count");
const storageState = document.querySelector("#storage-state");
const zoomIndicator = document.querySelector("#zoom-indicator");
const selectedNodeLabel = document.querySelector("#selected-node-label");
const inspectorForm = document.querySelector("#inspector-form");
const inspectorEmpty = document.querySelector("#inspector-empty");
const relationParent = document.querySelector("#relation-parent");
const relationChildren = document.querySelector("#relation-children");
const relationBranchSize = document.querySelector("#relation-branch-size");
const toast = document.querySelector("#toast");

const fieldName = document.querySelector("#field-name");
const fieldRole = document.querySelector("#field-role");
const fieldGeneration = document.querySelector("#field-generation");
const fieldYears = document.querySelector("#field-years");
const fieldBranch = document.querySelector("#field-branch");
const fieldNote = document.querySelector("#field-note");

const addChildButton = document.querySelector("#add-child");
const addSiblingButton = document.querySelector("#add-sibling");
const deleteBranchButton = document.querySelector("#delete-branch");
const fitViewButton = document.querySelector("#fit-view");
const resetTreeButton = document.querySelector("#reset-tree");
const exportButton = document.querySelector("#export-json");
const importInput = document.querySelector("#import-json");
const zoomInButton = document.querySelector("#zoom-in");
const zoomOutButton = document.querySelector("#zoom-out");

let state = loadState();
let selectedNodeId = state.nodes[0]?.id ?? null;
let toastTimer = null;
let interaction = null;
let lastSavedMessage = "Đang sẵn sàng";

renderScene();
if (state.view) {
  applyViewport();
} else {
  fitView({ quiet: true });
}
bindEvents();
persistState("", { quiet: true });

function bindEvents() {
  canvasShell.addEventListener("pointerdown", handleCanvasPointerDown);
  canvasShell.addEventListener("wheel", handleWheelZoom, { passive: false });
  window.addEventListener("pointermove", handleGlobalPointerMove);
  window.addEventListener("pointerup", finishInteraction);
  window.addEventListener("pointercancel", finishInteraction);
  window.addEventListener("keydown", handleKeyboardMove);

  inspectorForm.addEventListener("input", handleInspectorInput);
  addChildButton.addEventListener("click", addChildNode);
  addSiblingButton.addEventListener("click", addSiblingNode);
  deleteBranchButton.addEventListener("click", deleteBranch);
  fitViewButton.addEventListener("click", fitView);
  resetTreeButton.addEventListener("click", resetTree);
  exportButton.addEventListener("click", exportTree);
  importInput.addEventListener("change", importTree);
  zoomInButton.addEventListener("click", () => zoomAroundCenter(ZOOM_STEP));
  zoomOutButton.addEventListener("click", () => zoomAroundCenter(-ZOOM_STEP));
}

function renderScene() {
  renderNodes();
  renderLinksBetweenNodes();
  syncInspector();
  syncMetrics();
  updateActionState();
}

function renderNodes() {
  treeLayer.innerHTML = "";

  state.nodes.forEach((node) => {
    const card = document.createElement("article");
    card.className = `node-card${node.parentId ? "" : " root"}${node.id === selectedNodeId ? " selected" : ""}`;
    card.dataset.nodeId = node.id;
    card.style.left = `${node.x}px`;
    card.style.top = `${node.y}px`;
    card.tabIndex = 0;
    card.innerHTML = `
      <div class="node-meta-row">
        <span class="node-meta">Thế hệ ${toRoman(node.generation)}</span>
        <span class="node-branch">${escapeHtml(node.branch || "Chưa đặt tên nhánh")}</span>
      </div>
      <h3>${escapeHtml(node.name || "Thành viên mới")}</h3>
      <span class="node-role">${escapeHtml(node.role || "Chưa có vai trò")}</span>
      <p>${escapeHtml(node.note || "Thêm ghi chú ngắn cho thành viên này.")}</p>
      <p class="node-meta-row">
        <span class="node-meta">${escapeHtml(node.years || "Chưa rõ năm tháng")}</span>
      </p>
    `;

    card.addEventListener("pointerdown", handleNodePointerDown);
    card.addEventListener("click", () => selectNode(node.id));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectNode(node.id);
      }
    });

    treeLayer.appendChild(card);
  });
}

function renderLinksBetweenNodes() {
  treeLinks.innerHTML = "";
  treeLinks.setAttribute("viewBox", `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`);
  treeLinks.setAttribute("width", String(CANVAS_WIDTH));
  treeLinks.setAttribute("height", String(CANVAS_HEIGHT));

  state.nodes.forEach((node) => {
    if (!node.parentId) {
      return;
    }

    const parent = findNode(node.parentId);
    const parentCard = getNodeCard(parent?.id);
    const childCard = getNodeCard(node.id);

    if (!parent || !parentCard || !childCard) {
      return;
    }

    const startX = parent.x + parentCard.offsetWidth / 2;
    const startY = parent.y + parentCard.offsetHeight;
    const endX = node.x + childCard.offsetWidth / 2;
    const endY = node.y;
    const curveY = startY + (endY - startY) * 0.45;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${startX} ${startY} C ${startX} ${curveY}, ${endX} ${curveY}, ${endX} ${endY}`);

    const marker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    marker.setAttribute("cx", String(endX));
    marker.setAttribute("cy", String(endY));
    marker.setAttribute("r", "3.8");

    treeLinks.appendChild(path);
    treeLinks.appendChild(marker);
  });
}

function syncInspector() {
  const node = findNode(selectedNodeId);

  if (!node) {
    inspectorForm.hidden = true;
    inspectorEmpty.hidden = false;
    selectedNodeLabel.textContent = "Chưa chọn";
    relationParent.textContent = "-";
    relationChildren.textContent = "0";
    relationBranchSize.textContent = "0";
    return;
  }

  inspectorForm.hidden = false;
  inspectorEmpty.hidden = true;
  selectedNodeLabel.textContent = node.name || "Thành viên mới";

  fieldName.value = node.name || "";
  fieldRole.value = node.role || "";
  fieldGeneration.value = String(node.generation || 1);
  fieldYears.value = node.years || "";
  fieldBranch.value = node.branch || "";
  fieldNote.value = node.note || "";

  updateRelationshipPanel(node);
}

function updateRelationshipPanel(node) {
  const parent = node.parentId ? findNode(node.parentId) : null;
  relationParent.textContent = parent?.name || "Gốc tổ";
  relationChildren.textContent = String(getChildrenOf(node.id).length);
  relationBranchSize.textContent = String(countBranchMembers(node.id));
}

function syncMetrics() {
  const generationSet = new Set(state.nodes.map((node) => node.generation));
  memberCount.textContent = String(state.nodes.length);
  generationCount.textContent = String(generationSet.size);
  storageState.textContent = lastSavedMessage;
  zoomIndicator.textContent = `${Math.round((state.view?.scale ?? 1) * 100)}%`;
}

function updateActionState() {
  const node = findNode(selectedNodeId);
  const isRoot = !node?.parentId;

  addChildButton.disabled = !node;
  addSiblingButton.disabled = !node || isRoot;
  deleteBranchButton.disabled = !node || isRoot;
}

function handleNodePointerDown(event) {
  if (event.button !== 0) {
    return;
  }

  const nodeId = event.currentTarget.dataset.nodeId;
  const node = findNode(nodeId);
  if (!node) {
    return;
  }

  selectNode(nodeId);
  interaction = {
    type: "drag-node",
    nodeId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startX: node.x,
    startY: node.y,
    pointerId: event.pointerId,
  };
  canvasShell.classList.add("dragging-node");
  event.preventDefault();
}

function handleCanvasPointerDown(event) {
  if (event.button !== 0) {
    return;
  }

  if (event.target.closest(".node-card")) {
    return;
  }

  interaction = {
    type: "pan",
    startClientX: event.clientX,
    startClientY: event.clientY,
    startViewX: state.view?.x ?? 0,
    startViewY: state.view?.y ?? 0,
  };
  canvasShell.classList.add("panning");
}

function handleGlobalPointerMove(event) {
  if (!interaction) {
    return;
  }

  if (interaction.type === "drag-node") {
    const node = findNode(interaction.nodeId);
    if (!node) {
      return;
    }

    const scale = state.view?.scale ?? 1;
    const dx = (event.clientX - interaction.startClientX) / scale;
    const dy = (event.clientY - interaction.startClientY) / scale;
    node.x = clamp(interaction.startX + dx, 40, CANVAS_WIDTH - 300);
    node.y = clamp(interaction.startY + dy, 40, CANVAS_HEIGHT - 240);
    renderNodes();
    renderLinksBetweenNodes();
    return;
  }

  if (interaction.type === "pan") {
    state.view.x = interaction.startViewX + (event.clientX - interaction.startClientX);
    state.view.y = interaction.startViewY + (event.clientY - interaction.startClientY);
    applyViewport();
  }
}

function finishInteraction() {
  if (!interaction) {
    return;
  }

  const interactionType = interaction.type;
  interaction = null;
  canvasShell.classList.remove("panning", "dragging-node");

  if (interactionType === "drag-node") {
    persistState("Đã lưu bố cục thành viên");
  }

  if (interactionType === "pan") {
    persistState("Đã lưu khung nhìn");
  }
}

function handleWheelZoom(event) {
  event.preventDefault();

  const direction = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
  const rect = canvasShell.getBoundingClientRect();
  const pointerX = event.clientX - rect.left;
  const pointerY = event.clientY - rect.top;
  zoomAtPoint(direction, pointerX, pointerY);
}

function zoomAroundCenter(delta) {
  const rect = canvasShell.getBoundingClientRect();
  zoomAtPoint(delta, rect.width / 2, rect.height / 2);
}

function zoomAtPoint(delta, pointX, pointY) {
  const currentScale = state.view?.scale ?? 1;
  const nextScale = clamp(currentScale + delta, MIN_SCALE, MAX_SCALE);
  if (currentScale === nextScale) {
    return;
  }

  const currentView = state.view ?? { x: 0, y: 0, scale: 1 };
  const worldX = (pointX - currentView.x) / currentScale;
  const worldY = (pointY - currentView.y) / currentScale;

  state.view = {
    x: pointX - worldX * nextScale,
    y: pointY - worldY * nextScale,
    scale: nextScale,
  };

  applyViewport();
  persistState("", { quiet: true });
}

function applyViewport() {
  const view = state.view ?? { x: 0, y: 0, scale: 1 };
  treeViewport.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
  zoomIndicator.textContent = `${Math.round(view.scale * 100)}%`;
}

function fitView(options = {}) {
  const { quiet = false } = options;

  if (!state.nodes.length) {
    return;
  }

  const bounds = getNodeBounds();
  const rect = canvasShell.getBoundingClientRect();
  const paddedWidth = bounds.width + 180;
  const paddedHeight = bounds.height + 180;
  const scaleX = rect.width / paddedWidth;
  const scaleY = rect.height / paddedHeight;
  const scale = clamp(Math.min(scaleX, scaleY, 1), MIN_SCALE, 1.08);
  const x = rect.width / 2 - (bounds.x + bounds.width / 2) * scale;
  const y = rect.height / 2 - (bounds.y + bounds.height / 2) * scale;

  state.view = { x, y, scale };
  applyViewport();
  persistState(quiet ? "" : "Đã căn giữa cây", { quiet });
}

function handleInspectorInput(event) {
  const node = findNode(selectedNodeId);
  if (!node) {
    return;
  }

  const field = event.target.name;
  const value = event.target.value;

  if (field === "generation") {
    const numeric = Number.parseInt(value, 10);
    node.generation = Number.isFinite(numeric) ? clamp(numeric, 1, 12) : 1;
  } else {
    node[field] = value;
  }

  renderNodes();
  renderLinksBetweenNodes();
  syncMetrics();
  selectedNodeLabel.textContent = node.name || "Thành viên mới";
  updateRelationshipPanel(node);
  updateActionState();
  persistState("", { quiet: true });
}

function selectNode(nodeId) {
  selectedNodeId = nodeId;
  renderNodes();
  renderLinksBetweenNodes();
  syncInspector();
  updateActionState();
}

function addChildNode() {
  const parent = findNode(selectedNodeId);
  if (!parent) {
    return;
  }

  const children = getChildrenOf(parent.id);
  const offsetIndex = children.length;
  const newNode = {
    id: createNodeId(),
    parentId: parent.id,
    x: clamp(parent.x - 180 + offsetIndex * 280, 50, CANVAS_WIDTH - 320),
    y: clamp(parent.y + 300, 50, CANVAS_HEIGHT - 260),
    name: "Thành viên mới",
    role: "Cập nhật vai trò",
    generation: clamp(parent.generation + 1, 1, 12),
    years: "",
    branch: parent.branch || "Nhánh mới",
    note: "Thêm ghi chú ngắn cho thành viên vừa tạo.",
  };

  state.nodes.push(newNode);
  selectedNodeId = newNode.id;
  renderScene();
  persistState("Đã thêm thành viên con mới");
}

function addSiblingNode() {
  const current = findNode(selectedNodeId);
  if (!current || !current.parentId) {
    return;
  }

  const siblings = getChildrenOf(current.parentId);
  const newNode = {
    id: createNodeId(),
    parentId: current.parentId,
    x: clamp(current.x + 290, 50, CANVAS_WIDTH - 320),
    y: current.y,
    name: "Thành viên cùng thế hệ",
    role: "Cập nhật vai trò",
    generation: current.generation,
    years: "",
    branch: current.branch || "",
    note: "Thành viên mới được tạo cùng cấp với thành viên đang chọn.",
  };

  if (siblings.length > 1) {
    newNode.x = clamp(Math.max(...siblings.map((node) => node.x)) + 290, 50, CANVAS_WIDTH - 320);
  }

  state.nodes.push(newNode);
  selectedNodeId = newNode.id;
  renderScene();
  persistState("Đã thêm thành viên cùng thế hệ");
}

function deleteBranch() {
  const node = findNode(selectedNodeId);
  if (!node || !node.parentId) {
    return;
  }

  const branchSize = countBranchMembers(node.id);
  const shouldDelete = window.confirm(`Xóa toàn bộ nhánh này? (${branchSize} thành viên sẽ bị xóa)`);
  if (!shouldDelete) {
    return;
  }

  const idsToRemove = collectBranchIds(node.id);
  state.nodes = state.nodes.filter((item) => !idsToRemove.has(item.id));
  selectedNodeId = node.parentId;
  renderScene();
  persistState("Đã xóa một nhánh gia phả");
}

function resetTree() {
  const shouldReset = window.confirm("Khôi phục mẫu mặc định? Mọi dữ liệu đang sửa trong trình duyệt sẽ bị thay thế.");
  if (!shouldReset) {
    return;
  }

  state = cloneState(defaultState);
  selectedNodeId = state.nodes[0]?.id ?? null;
  renderScene();
  fitView({ quiet: true });
  persistState("Đã khôi phục dữ liệu mẫu");
}

function exportTree() {
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `gia-pha-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  announce("Đã xuất tệp JSON.");
}

async function importTree(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const nextState = normalizeImportedState(parsed);
    state = nextState;
    selectedNodeId = state.nodes[0]?.id ?? null;
    renderScene();
    if (state.view) {
      applyViewport();
    } else {
      fitView({ quiet: true });
    }
    persistState("Đã nhập dữ liệu JSON");
  } catch (error) {
    announce("Tệp JSON không hợp lệ.");
  } finally {
    event.target.value = "";
  }
}

function handleKeyboardMove(event) {
  const targetTag = event.target.tagName;
  if (targetTag === "INPUT" || targetTag === "TEXTAREA") {
    return;
  }

  const node = findNode(selectedNodeId);
  if (!node) {
    return;
  }

  const step = event.shiftKey ? 28 : 12;
  let moved = false;

  if (event.key === "ArrowLeft") {
    node.x = clamp(node.x - step, 40, CANVAS_WIDTH - 300);
    moved = true;
  } else if (event.key === "ArrowRight") {
    node.x = clamp(node.x + step, 40, CANVAS_WIDTH - 300);
    moved = true;
  } else if (event.key === "ArrowUp") {
    node.y = clamp(node.y - step, 40, CANVAS_HEIGHT - 240);
    moved = true;
  } else if (event.key === "ArrowDown") {
    node.y = clamp(node.y + step, 40, CANVAS_HEIGHT - 240);
    moved = true;
  }

  if (!moved) {
    return;
  }

  event.preventDefault();
  renderNodes();
  renderLinksBetweenNodes();
  persistState("Đã di chuyển thành viên bằng bàn phím");
}

function persistState(message, options = {}) {
  const { quiet = false } = options;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    lastSavedMessage = "Đã lưu tự động";
  } catch (error) {
    lastSavedMessage = "Không thể ghi localStorage";
  }

  storageState.textContent = lastSavedMessage;
  if (message && !quiet) {
    announce(message);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return cloneState(defaultState);
    }

    return normalizeImportedState(JSON.parse(raw));
  } catch (error) {
    return cloneState(defaultState);
  }
}

function normalizeImportedState(data) {
  const candidateNodes = Array.isArray(data) ? data : data?.nodes;
  if (!Array.isArray(candidateNodes) || !candidateNodes.length) {
    throw new Error("Invalid node list");
  }

  const nodes = candidateNodes.map((node, index) => ({
    id: String(node.id || `imported-${index + 1}`),
    parentId: node.parentId ? String(node.parentId) : null,
    x: Number.isFinite(node.x) ? clamp(node.x, 40, CANVAS_WIDTH - 300) : 140 + index * 60,
    y: Number.isFinite(node.y) ? clamp(node.y, 40, CANVAS_HEIGHT - 240) : 160 + index * 40,
    name: String(node.name || "Thành viên"),
    role: String(node.role || "Cập nhật vai trò"),
    generation: Number.isFinite(node.generation) ? clamp(node.generation, 1, 12) : 1,
    years: String(node.years || ""),
    branch: String(node.branch || ""),
    note: String(node.note || ""),
  }));

  const idSet = new Set(nodes.map((node) => node.id));
  nodes.forEach((node) => {
    if (node.parentId && !idSet.has(node.parentId)) {
      node.parentId = null;
    }
  });

  return {
    nodes,
    view:
      data?.view &&
      Number.isFinite(data.view.x) &&
      Number.isFinite(data.view.y) &&
      Number.isFinite(data.view.scale)
        ? {
            x: data.view.x,
            y: data.view.y,
            scale: clamp(data.view.scale, MIN_SCALE, MAX_SCALE),
          }
        : null,
  };
}

function getNodeBounds() {
  const cards = state.nodes
    .map((node) => ({
      node,
      card: getNodeCard(node.id),
    }))
    .filter((item) => item.card);

  const minX = Math.min(...cards.map((item) => item.node.x));
  const minY = Math.min(...cards.map((item) => item.node.y));
  const maxX = Math.max(...cards.map((item) => item.node.x + item.card.offsetWidth));
  const maxY = Math.max(...cards.map((item) => item.node.y + item.card.offsetHeight));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function findNode(nodeId) {
  return state.nodes.find((node) => node.id === nodeId) || null;
}

function getChildrenOf(nodeId) {
  return state.nodes.filter((node) => node.parentId === nodeId);
}

function countBranchMembers(nodeId) {
  return collectBranchIds(nodeId).size;
}

function collectBranchIds(nodeId, bucket = new Set()) {
  bucket.add(nodeId);
  getChildrenOf(nodeId).forEach((child) => collectBranchIds(child.id, bucket));
  return bucket;
}

function getNodeCard(nodeId) {
  return treeLayer.querySelector(`[data-node-id="${CSS.escape(nodeId)}"]`);
}

function createNodeId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `node-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function announce(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 1800);
}

function cloneState(source) {
  return JSON.parse(JSON.stringify(source));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toRoman(value) {
  const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return romans[Math.max(0, Math.min(romans.length - 1, (value || 1) - 1))];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
