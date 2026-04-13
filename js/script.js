function formatDate(str) {
    if (!str) return 'Actualidad';
    const [y, m] = str.split('-');
    if (!m) return y;
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${months[parseInt(m, 10) - 1]} ${y}`;
}

function renderTags(arr) {
    return arr.map(t => `<span class="tag">${t}</span>`).join('');
}

async function loadCV() {
    const res = await fetch('data/cv.json');
    const cv = await res.json();

    // Hero
    const h1 = document.getElementById('hero-name');  
    h1.innerHTML = `Hola, soy<br><div class="clip-wrap"><span class="clip-inner" id="hero-name-inner"><span>${cv.personal.name}</span></span></div>`;
    const bio = document.getElementById('hero-bio');
    bio.textContent = cv.personal.bio;
    document.title = `${cv.personal.name} · ${cv.personal.title}`;

    const links = document.getElementById('hero-links');
    links.innerHTML = `
        <a class="btn btn-accent" href="mailto:${cv.contact.email}">Contactar</a>
        <a class="btn" href="${cv.contact.github}" target="_blank">GitHub</a>
        <a class="btn" href="${cv.contact.linkedin}" target="_blank">LinkedIn</a>
      `;

    // Experience
    const expList = document.getElementById('exp-list');
    expList.innerHTML = cv.experience.map(e => `
        <div class="exp-item">
          <div class="exp-meta">
            <div class="exp-dates">${formatDate(e.startDate)} — ${e.current ? 'Actualidad' : formatDate(e.endDate)}</div>
            <div class="exp-location">${e.location}</div>
          </div>
          <div>
            <div class="exp-role">${e.role}</div>
            <div class="exp-company">${e.company}</div>
            <div class="exp-desc">${e.description}</div>
            <div class="tags">${renderTags(e.technologies)}</div>
          </div>
        </div>
      `).join('');

    // Projects
    const grid = document.getElementById('project-grid');
    grid.innerHTML = cv.projects.map(p => {
        const urlLink = p.url ? `<a class="project-link" href="${p.url}" target="_blank">↗ repo</a>` : '';
        const demoLink = p.demo ? `<a class="project-link" href="${p.demo}" target="_blank">↗ demo</a>` : '';
        return `
          <div class="project-card">
            <div class="project-header">
              <span class="project-name">${p.name}</span>
              ${p.status ? `<span class="project-status">${p.status}</span>` : ''}
            </div>
            <div class="project-desc">${p.description}</div>
            <div class="tags">${renderTags(p.technologies)}</div>
            ${urlLink || demoLink ? `<div class="project-links">${urlLink}${demoLink}</div>` : ''}
          </div>
        `;
    }).join('');

    // Skills
    const skillsGrid = document.getElementById('skills-grid');
    const skillLabels = { languages: 'Lenguajes', frameworks: 'Frameworks', tools: 'Herramientas', other: 'Otros' };
    skillsGrid.innerHTML = Object.entries(cv.skills).map(([key, vals]) => `
        <div class="skill-group">
          <div class="skill-group-label">${skillLabels[key] || key}</div>
          <div class="skill-list">${renderTags(vals)}</div>
        </div>
      `).join('');

    // Education
    const eduList = document.getElementById('edu-list');
    eduList.innerHTML = cv.education.map(e => `
        <div class="edu-item">
          <div class="edu-dates">${formatDate(e.startDate)} — ${e.current ? 'Actualidad' : formatDate(e.endDate)}</div>
          <div>
            <div class="edu-degree">
              ${e.degree}
              ${e.current ? '<span class="current-badge">cursando</span>' : ''}
            </div>
            <div class="edu-institution">${e.institution}</div>
          </div>
        </div>
      `).join('');

    // Contact
    const contactGrid = document.getElementById('contact-grid');
    const contactItems = [
        { label: 'email', value: cv.contact.email, href: `mailto:${cv.contact.email}` },
        { label: 'teléfono', value: cv.contact.phone, href: `tel:${cv.contact.phone}` },
        { label: 'github', value: '@jmontesv', href: cv.contact.github },
        { label: 'linkedin', value: 'javier-montes-villamarin', href: cv.contact.linkedin },
    ];
    contactGrid.innerHTML = contactItems.map(c => `
        <a class="contact-item" href="${c.href}" target="_blank">
          <span class="contact-item-label">// ${c.label}</span>
          <span class="contact-item-value">${c.value}</span>
        </a>
      `).join('');

    // Footer
    document.getElementById('last-updated').textContent = cv.meta.lastUpdated;
    
    function playHeroAnim() {
      const label = document.querySelector('.hero-label');
      const name  = document.getElementById('hero-name-inner');
      const bio   = document.getElementById('hero-bio');
      const links = document.getElementById('hero-links');
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => label.classList.add('go'), 100);
          setTimeout(() => name.classList.add('go'),  300);
          setTimeout(() => bio.classList.add('go'),   600);
          setTimeout(() => links.classList.add('go'), 900);
        });
      });
    }
    playHeroAnim();
}

loadCV().catch(err => console.error('Error cargando cv.json:', err));