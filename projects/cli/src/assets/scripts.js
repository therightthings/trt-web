const root = document.documentElement;
const sidebar = document.querySelector('.sidebar');
const search = document.querySelector('#search');
const searchClear = document.querySelector('#search-clear');
const links = [...document.querySelectorAll('.utility-link')];
const utilities = [...document.querySelectorAll('.utility')];
const groups = [...document.querySelectorAll('.group')];
const toggleAll = document.querySelector('#toggle-all');
const savedTheme = localStorage.getItem('doc-theme');
const theme =
  savedTheme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
root.dataset.theme = theme;
function setTheme(value) {
  root.dataset.theme = value;
  localStorage.setItem('doc-theme', value);
}
function toggleTheme() {
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
}
document.querySelector('#theme-toggle').onclick = toggleTheme;
document.querySelector('#desktop-theme-toggle').onclick = toggleTheme;
document.querySelector('#menu-toggle').onclick = () => sidebar.classList.toggle('open');
function setGroupExpanded(group, expanded) {
  const content = group.querySelector('.group-utilities');
  const button = group.querySelector('.group-toggle');
  if (!content || !button) return;
  group.classList.toggle('is-expanded', expanded);
  content.classList.toggle('hidden', !expanded);
  button.setAttribute('aria-expanded', String(expanded));
  button.querySelector('span').textContent = expanded ? '−' : '+';
}
function updateToggleAll() {
  const expanded =
    groups.length > 0 &&
    groups.every((group) => !group.querySelector('.group-utilities').classList.contains('hidden'));
  toggleAll.textContent = expanded ? 'Collapse all' : 'Expand all';
}
groups.forEach((group) => {
  const title = group.querySelector('.group-title');
  const button = group.querySelector('.group-toggle');
  const toggle = () => {
    setGroupExpanded(group, button.getAttribute('aria-expanded') !== 'true');
    updateToggleAll();
  };
  title.onclick = toggle;
  button.onclick = toggle;
});
toggleAll.onclick = () => {
  const expand = toggleAll.textContent === 'Expand all';
  groups.forEach((group) => setGroupExpanded(group, expand));
  updateToggleAll();
};
links.forEach(
  (link) =>
    (link.onclick = () => {
      utilities.forEach((item) => item.classList.remove('active'));
      links.forEach((item) => item.classList.remove('active'));
      document.querySelector('#utility-' + link.dataset.utility).classList.add('active');
      link.classList.add('active');
      const group = link.closest('.group');
      if (group) {
        setGroupExpanded(group, true);
        updateToggleAll();
      }
      sidebar.classList.remove('open');
    }),
);
if (links[0]) links[0].click();
search.oninput = () => {
  const value = search.value.toLowerCase();
  searchClear.hidden = !value;
  links.forEach((link) => {
    const match = link.textContent.toLowerCase().includes(value);
    link.style.display = match ? '' : 'none';
  });
  groups.forEach((group) => {
    const hasVisibleLink = [...group.querySelectorAll('.utility-link')].some(
      (link) => link.style.display !== 'none',
    );
    group.style.display = hasVisibleLink ? '' : 'none';
    if (value && hasVisibleLink) setGroupExpanded(group, true);
  });
};
searchClear.onclick = () => {
  search.value = '';
  search.dispatchEvent(new Event('input'));
  search.focus();
};
