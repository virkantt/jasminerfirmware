(function () {
  const baseRequestTemplate = "Machine SN: Z16...\nModel: X16-Q";
  const copyButton = document.querySelector("[data-copy-request]");
  const requestTemplate = document.querySelector("[data-request-template]");
  const copyStatus = document.querySelector("[data-copy-status]");
  const notesInput = document.querySelector("[data-notes-input]");
  const machineSnChoices = document.querySelectorAll("[data-machine-sn-choice]");
  const machineSnField = document.querySelector("[data-machine-sn-field]");
  const machineSnInput = document.querySelector("[data-machine-sn-input]");
  const macField = document.querySelector("[data-mac-field]");
  const macInput = document.querySelector("[data-mac-input]");
  const mac2Input = document.querySelector("[data-mac2-input]");
  const sourceSelect = document.querySelector("[data-source-select]");
  const sourceOther = document.querySelector("[data-source-other]");
  const contactModal = document.querySelector("[data-contact-modal]");
  const openContactButtons = document.querySelectorAll("[data-open-contact]");
  const closeContactButton = document.querySelector("[data-close-contact]");
  const scrollLinks = document.querySelectorAll("[data-scroll-target]");
  let lastFocusedElement = null;

  function syncOtherSource() {
    if (!sourceSelect || !sourceOther) return;
    const isOther = sourceSelect.value === "other";
    sourceOther.hidden = !isOther;
    if (isOther) {
      sourceOther.focus();
    } else {
      sourceOther.value = "";
    }
  }

  function machineSnChoice() {
    const selected = Array.from(machineSnChoices).find(function (choice) {
      return choice.checked;
    });
    return selected?.value || "";
  }

  function syncMachineIdField() {
    if (!machineSnField || !machineSnInput || !macField || !macInput || !mac2Input) return;

    const selectedChoice = machineSnChoice();
    const showMachineSn = selectedChoice === "yes";
    const showMac = selectedChoice === "no";
    machineSnField.hidden = !showMachineSn;
    machineSnInput.disabled = !showMachineSn;
    macField.hidden = !showMac;
    macInput.disabled = !showMac;
    mac2Input.disabled = !showMac;

    if (showMachineSn) {
      macInput.value = "";
      mac2Input.value = "";
    } else if (showMac) {
      machineSnInput.value = "";
    }
  }

  function requestText() {
    const base = requestTemplate?.textContent?.trim() || baseRequestTemplate;
    if (!base) return "";

    let request = base;
    if (machineSnChoice() === "yes") {
      const machineSn = machineSnInput?.value?.trim();
      if (machineSn) {
        request = request.replace("Machine SN: Z16...", `Machine SN: ${machineSn}`);
      }
    } else {
      const mac = macInput?.value?.trim() || "";
      const mac2 = mac2Input?.value?.trim();
      const macLines = [`MAC: ${mac}`];
      if (mac2) macLines.push(`MAC2: ${mac2}`);
      request = request.replace("Machine SN: Z16...", macLines.join("\n"));
    }

    const selected = sourceSelect?.value || "";
    const source = selected === "other" ? sourceOther?.value?.trim() : selected;
    const notes = notesInput?.value?.trim() || "";
    return `${request}\n\nNotes: ${notes}\n\nWhere did you hear about us: ${source || ""}`;
  }

  function openContactModal() {
    if (!contactModal) return;
    lastFocusedElement = document.activeElement;
    contactModal.hidden = false;
    closeContactButton?.focus();
  }

  function closeContactModal() {
    if (!contactModal) return;
    contactModal.hidden = true;
    if (lastFocusedElement?.focus) {
      lastFocusedElement.focus();
    }
  }

  function scrollToSection(selector, smooth) {
    const target = selector ? document.querySelector(selector) : null;
    if (!target) return false;

    const top = target.offsetTop;

    if (smooth && "scrollBehavior" in document.documentElement.style) {
      window.scrollTo({ top, behavior: "smooth" });
    } else {
      window.scrollTo(0, top);
    }

    document.documentElement.scrollTop = top;
    document.body.scrollTop = top;
    return true;
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        // Fall back to the selection-based copy path.
      }
    }

    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "-1000px";
    field.style.left = "-1000px";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(field);
    return copied;
  }

  copyButton?.addEventListener("click", async function () {
    const text = requestText();
    if (!text) return;

    try {
      const copied = await copyText(text);
      if (!copied) throw new Error("Copy command failed");
      if (copyStatus) copyStatus.textContent = "Copied.";
      window.setTimeout(function () {
        if (copyStatus) copyStatus.textContent = "";
      }, 1800);
    } catch (error) {
      if (copyStatus) copyStatus.textContent = "Copy failed. Select the text manually.";
    }
  });

  openContactButtons.forEach(function (button) {
    button.addEventListener("click", openContactModal);
  });

  closeContactButton?.addEventListener("click", closeContactModal);

  contactModal?.addEventListener("click", function (event) {
    if (event.target === contactModal) {
      closeContactModal();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && contactModal && !contactModal.hidden) {
      closeContactModal();
    }
  });

  sourceSelect?.addEventListener("change", syncOtherSource);
  syncOtherSource();

  machineSnChoices.forEach(function (choice) {
    choice.addEventListener("change", syncMachineIdField);
  });
  syncMachineIdField();

  scrollLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      const targetSelector = link.getAttribute("data-scroll-target");
      if (!scrollToSection(targetSelector, true)) return;

      event.preventDefault();
      history.pushState(null, "", targetSelector);
    });
  });

  window.addEventListener("hashchange", function () {
    scrollToSection(window.location.hash, true);
  });

  if (window.location.hash) {
    window.setTimeout(function () {
      scrollToSection(window.location.hash, false);
    }, 0);
    window.setTimeout(function () {
      scrollToSection(window.location.hash, false);
    }, 120);
  }
})();
