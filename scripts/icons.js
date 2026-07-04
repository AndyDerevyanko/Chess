/* ============================================================
   OFFLINE CHESS — icon library
   Small inline SVGs (currentColor fill) swapped in for any
   element written as <i class="icon" data-icon="name"></i>.
   Presentation only, no chess logic.
   ============================================================ */

const ICONS = {
	play: '<svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8V4z"/></svg>',
	arrowLeft: '<svg viewBox="0 0 24 24"><path d="M15 4l-8 8 8 8V4z"/></svg>',
	arrowRight: '<svg viewBox="0 0 24 24"><path d="M9 4l8 8-8 8V4z"/></svg>',
	chevronLeft: '<svg viewBox="0 0 24 24"><path d="M15 3L6 12l9 9 1.4-1.4-7.6-7.6L16.4 4.4 15 3z"/></svg>',

	home: '<svg viewBox="0 0 24 24"><path d="M12 2 2 10h3v11h6v-6h2v6h6V10h3L12 2z"/></svg>',
	settings: '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" fill="none"><circle cx="12" cy="12" r="3"/><g stroke-linecap="round">' +
		'<rect x="11" y="1.5" width="2" height="4" fill="currentColor" stroke="none"/>' +
		'<rect x="11" y="1.5" width="2" height="4" fill="currentColor" stroke="none" transform="rotate(45 12 12)"/>' +
		'<rect x="11" y="1.5" width="2" height="4" fill="currentColor" stroke="none" transform="rotate(90 12 12)"/>' +
		'<rect x="11" y="1.5" width="2" height="4" fill="currentColor" stroke="none" transform="rotate(135 12 12)"/>' +
		'<rect x="11" y="1.5" width="2" height="4" fill="currentColor" stroke="none" transform="rotate(180 12 12)"/>' +
		'<rect x="11" y="1.5" width="2" height="4" fill="currentColor" stroke="none" transform="rotate(225 12 12)"/>' +
		'<rect x="11" y="1.5" width="2" height="4" fill="currentColor" stroke="none" transform="rotate(270 12 12)"/>' +
		'<rect x="11" y="1.5" width="2" height="4" fill="currentColor" stroke="none" transform="rotate(315 12 12)"/>' +
		'</g></svg>',
	puzzle: '<svg viewBox="0 0 24 24"><path d="M4 4h6a2 2 0 104 0h6v6a2 2 0 100 4v6h-6a2 2 0 10-4 0H4v-6a2 2 0 100-4V4z"/></svg>',
	book: '<svg viewBox="0 0 24 24"><path d="M4 4c2.5-1 5.5-1 8 0v16c-2.5-1-5.5-1-8 0V4zm16 0c-2.5-1-5.5-1-8 0v16c2.5-1 5.5-1 8 0V4z"/></svg>',
	info: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1.2 15h-2.4v-7h2.4v7zm0-9h-2.4V6h2.4v2z"/></svg>',
	bot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
		'<line x1="12" y1="2" x2="12" y2="5"/>' +
		'<circle cx="12" cy="1.6" r="1.1" fill="currentColor" stroke="none"/>' +
		'<rect x="5" y="5" width="14" height="12" rx="3"/>' +
		'<line x1="3" y1="9.5" x2="5" y2="9.5"/>' +
		'<line x1="19" y1="9.5" x2="21" y2="9.5"/>' +
		'<circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/>' +
		'<circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/>' +
		'<line x1="9" y1="15" x2="15" y2="15"/>' +
		'</svg>',
	players: '<svg viewBox="0 0 24 24"><path d="M8 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm8 0a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM8 14c-3 0-6 1.5-6 4v2h9v-2c0-1 .4-2 1.1-2.8A9.4 9.4 0 008 14zm8 0c-.8 0-1.6.1-2.3.3A4.7 4.7 0 0115 18v2h7v-2c0-2.5-3-4-6-4z"/></svg>',
	dice: '<svg viewBox="0 0 24 24"><path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm2.3 3.3a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8zm8 0a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8zM12 10.6a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8zm-4.2 4.1a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8zm8.4 0a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8z"/></svg>',
	save: '<svg viewBox="0 0 24 24"><path d="M5 3h11l3 3v14a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1zm2 2v5h8V5H7zm1 9v5h8v-5H8z"/></svg>',
	trash: '<svg viewBox="0 0 24 24"><path d="M9 2h6l1 2h4v2H4V4h4l1-2zM5 8h14l-1.2 12.2A2 2 0 0115.8 22H8.2a2 2 0 01-2-1.8L5 8zm4 3v7h1.5v-7H9zm4.5 0v7H15v-7h-1.5z"/></svg>',
	search: '<svg viewBox="0 0 24 24"><path d="M10 3a7 7 0 015.6 11.2l4.6 4.6-1.4 1.4-4.6-4.6A7 7 0 1110 3zm0 2a5 5 0 100 10 5 5 0 000-10z"/></svg>',
	edit: '<svg viewBox="0 0 24 24"><path d="M3 17.3V21h3.7L18.8 8.9l-3.7-3.7L3 17.3zM20.7 6.3a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0L16 5l3.7 3.7 1-1.4z"/></svg>',
	undo: '<svg viewBox="0 0 24 24"><path d="M7 8H4V4H2v6h6V8zM4 10a8 8 0 1114.5 4.6l-1.8-1a6 6 0 10-10.8-3.6H8V12H2v-2h2z"/></svg>',
	flip: '<svg viewBox="0 0 24 24"><path d="M7 3h2v4H5l2-2-2-2zm10 18h-2v-4h4l-2 2 2 2zM4 12a8 8 0 0113.7-5.6l1.4-1.4A10 10 0 002 12h2zm16 0a8 8 0 01-13.7 5.6l-1.4 1.4A10 10 0 0022 12h-2z"/></svg>',
	bulb: '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 00-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0012 2zM9 19h6v1a1 1 0 01-1 1h-4a1 1 0 01-1-1v-1z"/></svg>',
	flag: '<svg viewBox="0 0 24 24"><path d="M5 2h2v20H5V2zm2 1h11l-2.5 4L18 11H7V3z"/></svg>',
	download: '<svg viewBox="0 0 24 24"><path d="M11 3h2v9.2l3.6-3.6 1.4 1.4-6 6-6-6 1.4-1.4L11 12.2V3zM4 19h16v2H4v-2z"/></svg>',
	rewind: '<svg viewBox="0 0 24 24"><path d="M11 12l8-6v12l-8-6zM3 12l8-6v12l-8-6z"/></svg>',
	forward: '<svg viewBox="0 0 24 24"><path d="M13 12l-8-6v12l8-6zm8 0l-8-6v12l8-6z"/></svg>',
	prev: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7 1.4-1.4L10.8 12l5.6-5.6L15 5z"/></svg>',
	next: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7-1.4-1.4L13.2 12 7.6 6.4 9 5z"/></svg>'
};

function renderIcons(root){
	(root || document).querySelectorAll("[data-icon]").forEach(el => {
		const name = el.getAttribute("data-icon");
		if(ICONS[name] != null)
			el.innerHTML = ICONS[name];
	});
}

document.addEventListener("DOMContentLoaded", () => renderIcons());
