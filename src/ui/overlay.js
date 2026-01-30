const overlays = {
  skill: document.getElementById("overlay-skill"),
  ascend: document.getElementById("overlay-ascend"),
};

function show(id) {
  const el = overlays[id];
  if (el) el.style.display = "flex";
}

function hide(id) {
  const el = overlays[id];
  if (el) el.style.display = "none";
}

export function wireOverlays() {
  const skillBtn = document.getElementById("btn-skill-tree");
  const ascendBtn = document.getElementById("btn-ascend");
  if (skillBtn) skillBtn.addEventListener("click", () => show("skill"));
  if (ascendBtn) ascendBtn.addEventListener("click", () => show("ascend"));

  document.querySelectorAll(".overlay-close").forEach((btn) => {
    const target = btn.getAttribute("data-close");
    btn.addEventListener("click", () => target && hide(target.replace("#overlay-", "")));
  });
  Object.values(overlays).forEach((el) => {
    if (!el) return;
    el.addEventListener("click", (ev) => {
      if (ev.target === el) hide(el.id.replace("overlay-", ""));
    });
  });
}
