export const formatDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
export const formatTime = (t) => (t ? String(t).slice(0,5) : '-');
export const formatDateTime = (d) => (d ? new Date(d).toLocaleString('fr-FR') : '-');
