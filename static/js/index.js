document.addEventListener('DOMContentLoaded', function () {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach((link) => {
    link.addEventListener('click', function (event) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') {
        return;
      }
      const target = document.querySelector(targetId);
      if (!target) {
        return;
      }
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const form = document.getElementById('submissionForm');
  const generateBtn = document.getElementById('generateSubmissionBtn');
  const copyBtn = document.getElementById('copySubmissionBtn');
  const preview = document.getElementById('submissionPreview');
  const status = document.getElementById('submissionStatus');
  const submissionModal = document.getElementById('submissionModal');
  const openModalBtn = document.getElementById('openSubmissionModalBtn');
  const closeModalBtn = document.getElementById('closeSubmissionModalBtn');
  const closeBackdrop = document.getElementById('closeSubmissionModalBackdrop');

  function openSubmissionModal() {
    if (!submissionModal) {
      return;
    }
    submissionModal.classList.add('is-open');
    submissionModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeSubmissionModal() {
    if (!submissionModal) {
      return;
    }
    submissionModal.classList.remove('is-open');
    submissionModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (openModalBtn) {
    openModalBtn.addEventListener('click', openSubmissionModal);
  }
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeSubmissionModal);
  }
  if (closeBackdrop) {
    closeBackdrop.addEventListener('click', closeSubmissionModal);
  }
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeSubmissionModal();
    }
  });

  // Frontal entrance page (index only)
  const frontalGate = document.getElementById('frontalGate');
  const exploreSiteBtn = document.getElementById('exploreSiteBtn');
  const copyContactBtn = document.getElementById('copyContactBtn');
  const frontalContactStatus = document.getElementById('frontalContactStatus');

  function closeFrontalGateWithTransition() {
    if (!frontalGate) {
      return;
    }
    frontalGate.classList.add('is-leaving');
    window.setTimeout(function () {
      frontalGate.classList.add('is-hidden');
      document.body.style.overflow = '';
    }, 520);
  }

  if (frontalGate) {
    document.body.style.overflow = 'hidden';
  }

  if (exploreSiteBtn) {
    exploreSiteBtn.addEventListener('click', closeFrontalGateWithTransition);
  }

  if (copyContactBtn) {
    copyContactBtn.addEventListener('click', async function () {
      const emails = 'sy-cui@thu.edu.cn; 250010166@slai.edu.cn';
      try {
        await navigator.clipboard.writeText(emails);
        if (frontalContactStatus) {
          frontalContactStatus.textContent = 'Copied: ' + emails;
        }
      } catch (err) {
        if (frontalContactStatus) {
          frontalContactStatus.textContent = 'Contact: ' + emails;
        }
      }
    });
  }

  if (!form || !generateBtn || !copyBtn || !preview || !status) {
    return;
  }

  function getSubmissionPayload() {
    const modelName = document.getElementById('modelName').value.trim();
    const affiliation = document.getElementById('affiliation').value.trim();
    const protocol = document.getElementById('protocol').value;
    const fileInput = document.getElementById('resultFile');

    const l1 = Number(document.getElementById('l1Score').value);
    const l2 = Number(document.getElementById('l2Score').value);
    const l3 = Number(document.getElementById('l3Score').value);
    const overall = Number(document.getElementById('overallScore').value);

    if (!modelName || Number.isNaN(l1) || Number.isNaN(l2) || Number.isNaN(l3) || Number.isNaN(overall)) {
      return null;
    }

    return {
      benchmark: 'VidNum-1.4K',
      submitted_at_utc: new Date().toISOString(),
      model_name: modelName,
      affiliation: affiliation || '',
      protocol: protocol,
      scores: {
        level_1_avg: l1,
        level_2_avg: l2,
        level_3_avg: l3,
        overall: overall
      },
      result_file_name: fileInput.files && fileInput.files[0] ? fileInput.files[0].name : ''
    };
  }

  function renderPayload(payload) {
    preview.textContent = JSON.stringify(payload, null, 2);
  }

  function setStatus(text) {
    status.textContent = text;
  }

  generateBtn.addEventListener('click', function () {
    const payload = getSubmissionPayload();
    if (!payload) {
      setStatus('Please complete required fields before generating submission JSON.');
      return;
    }

    renderPayload(payload);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = payload.model_name.replace(/[^a-zA-Z0-9._-]/g, '_');
    a.href = url;
    a.download = 'vidnum_submission_' + safeName + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setStatus('Submission JSON generated and downloaded.');
  });

  copyBtn.addEventListener('click', async function () {
    const payload = getSubmissionPayload();
    if (!payload) {
      setStatus('Please complete required fields before copying submission text.');
      return;
    }

    renderPayload(payload);

    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setStatus('Submission text copied to clipboard.');
    } catch (err) {
      setStatus('Clipboard copy failed. Please copy manually from the preview box.');
    }
  });
});
