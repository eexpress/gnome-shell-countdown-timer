//~ π²πΎππ½ππ³πΎππ½ / ππΈπΌπ΄π πππ©π‘π€π€@πππππ.ππ π

const { GObject, GLib, Gio, Clutter, St } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

const debug = false;
function lg(s) {
	if (debug) log("===" + Me.metadata['gettext-domain'] + "===>" + s);
}

let timeoutId = null;
const list = [];

const Indicator = GObject.registerClass(
	class Indicator extends PanelMenu.Button {
		_init() {
			var that = this; // ζ³ηΌε­οΌε¨ι­εδΈ­οΌδ»£ζΏθ°η¨thisγ
			super._init(0.0, _(Me.metadata['name']));
			let last_gicon = '';
			//~ -------------------  ι’ζΏδΈ»εΎζ  ---------------------------
			const stock_icon = new St.Icon({ icon_name : 'alarm-symbolic', style_class : 'system-status-icon' });
			this.add_child(stock_icon);
			//~ ----------------  η¬¬δΈθ‘ε―ιεΎζ η» -------------------------
			const item_icons = new PopupMenu.PopupMenuItem('');
			['alarm-symbolic', 'call-start-symbolic', 'go-home-symbolic', 'media-view-subtitles-symbolic', 'airplane-mode-symbolic', 'system-users-symbolic', 'applications-games-symbolic', 'emoji-food-symbolic', 'face-devilish-symbolic', 'emblem-favorite-symbolic', 'file:stopwatch-symbolic.svg', 'file:countdown-symbolic.svg', 'file:timer-symbolic.svg'].forEach(showicon);
			function showicon(item) {
				//~ const icon = new St.Icon({ style_class : 'cdt-icon' });
				const icon = new St.Icon({ icon_size : 40 });
				set_icon(icon, item); // icon δΈθ½η΄ζ₯ button-press-event οΌοΌοΌ
				const butt = new St.Button({ can_focus : true, child : icon });
				butt.connect('button-press-event', () => { set_icon(stock_icon, item); });
				item_icons.actor.add_child(butt);
			};
			function set_icon(icon, str) {
				if (str.substr(0, 5) == "file:") {
					last_gicon = str.substr(5);
					icon.gicon = local_gicon(last_gicon);
				} else {
					icon.icon_name = str;
					last_gicon = '';
				}
			}
			this.menu.addMenuItem(item_icons);
			//~ ---------------------------------------------------------
			//~ ------------------- η¬¬δΊθ‘θΎε₯ζ  --------------------------
			const item_input = new PopupMenu.PopupBaseMenuItem({
				reactive : false,
				can_focus : false
			});
			const input = new St.Entry({
				name : 'searchEntry',
				style_class : 'cdt-text',
				primary_icon : new St.Icon({ gicon : local_gicon("countdown-symbolic.svg"), icon_size : 36 }),
				secondary_icon : new St.Icon({ gicon : local_gicon("stopwatch-symbolic.svg"), icon_size : 36 }),
				can_focus : true,
				//~ hint_text: _('θΎε₯ ζ°ε­ ζειε»ΆζΆοΌζ HH:MM ζ ΌεΌε?ζΆοΌεθ½¦ηζγ'),
				hint_text : _('Input DIGIT to countdown, or HH:MM to set timer. Then press ENTER.'),
				x_expand : true,
			});
			// ιθ¦ιεΆθΎε₯ηε­η¬¦οΌζ°ε­εεε·
			input.connect('primary-icon-clicked', () => { add_timer(); });
			input.connect('secondary-icon-clicked', () => { add_timer(); });
			input.clutter_text.connect('activate', (actor) => { add_timer(); });
			item_input.add(input);
			this.menu.addMenuItem(item_input);
			//~ ---------------------------------------------------------
			function add_timer() {
				let s = input.text;
				let m = 0;
				let isCntDwn = false;
				let s0;
				if (/\d{1,2}:\d{1,2}/.test(s)) { // HH:MM Timer
					const hhmm = s.match(/(\d{1,2}):(\d{1,2})/);
					let h1 = parseInt(hhmm[1]);
					const m1 = parseInt(hhmm[2]);
					const d0 = new Date();
					const h0 = d0.getHours();
					const m0 = d0.getMinutes();
					s0 = d0.getSeconds();
					if (h1 < h0) {
						h1 += 12;
					} else {
						if (h1 == h0 && m1 <= m0) { h1 += 12; }
					}
					if (h1 < h0) {
						h1 += 12;
					} else {
						if (h1 == h0 && m1 <= m0) { h1 += 12; }
					}
					m = (h1 - h0) * 60 + m1 - m0;
					s = input.text;
				} else { // Countdown by Minutes
					m = Number.parseInt(s);
					if (Number.isNaN(m) || m < 1) return;
					s = m + _(' minutes');
					isCntDwn = true;
				}

				const item = new PopupMenu.PopupImageMenuItem('xx', stock_icon.icon_name);
				if (!stock_icon.icon_name && last_gicon) {
					item.setIcon(local_gicon(last_gicon));
					item.Gicon = 'file:' + last_gicon;
				} else
					item.Gicon = stock_icon.icon_name;
				// ε’ε 3δΈͺεζ°
				item.TargetStr = s;
				item.secondLeft = m * 60;
				if (!isCntDwn) item.secondLeft -= Math.round(s0 / 10) * 10;

				updatelabel(item); // η«ε»ε·ζ°labelγε¦εδΌζΎη€ΊεΊxxγ
				item.style_class = 'cdt-text';
				item.can_focus = true;
				item.connect('activate', (actor) => {
					list.splice(list.indexOf(actor), 1);
					actor.destroy();
				});
				that.menu.addMenuItem(item);
				list.push(item);
				input.text = '';
			}
			//~ -------------------- εε²ζ δ»₯δΈδΈΊε?ζΆεθ‘¨ -------------------
			this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
		}
	});
//~ ---------------------------------------------------------
function local_gicon(str) {
	return Gio.icon_new_for_string(
		ExtensionUtils.getCurrentExtension().path + "/img/" + str);
}
function updatelabel(item) {
	const m = Math.floor(item.secondLeft / 60);
	const s = Math.floor(item.secondLeft % 60);
	const ss = (s == 0) ? '00' : s.toString();
	if (item.type) {
		item.label.text = _('  Countdown left %s, Target: %s.').format(digit2unicode(m + "'" + ss), item.TargetStr);
	} else {
		item.label.text = _('  Timer left %s, Target: %s.').format(digit2unicode(m + "'" + ss), item.TargetStr);
	}
};

function digit2unicode(str) {
	const n = "βΏβΆβ·βΈβΉβΊβ»βΌβ½βΎ";
	for (let i = 0; i < 10; i++) {
		str = str.replace(new RegExp(i.toString(), 'g'), n.substr(i, 1));
	}
	return str;
};

//~ ---------------------------------------------------------
//~ https://github.com/GNOME/gnome-shell/blob/main/js/ui/messageTray.js
let notify_on = false;
const MessageTray = imports.ui.messageTray;
function mmmsg(icon, title, text) { //ζ―ζζ¬ε°εΎζ 
	const source = new MessageTray.Source('Countdown & Timer', icon);
	source.connect('destroy', () => notify_on = false);
	Main.messageTray.add(source);
	let params = {};
	if (icon.substr(0, 5) === "file:") { // δ½Ώη¨ gicon ε―δ»₯θ¦η icon
		params = { bannerMarkup : true, gicon : local_gicon(icon.substr(5)) };
	}
	const notif = new MessageTray.Notification(source, title, text, params);
	notif.setUrgency(MessageTray.Urgency.CRITICAL); // δΈη΄ζΎη€Ί
	notify_on = true;
	source.showNotification(notif);
}
//~ ---------------------------------------------------------
class Extension {
	constructor(uuid) {
		this._uuid = uuid;
		ExtensionUtils.initTranslations();
	}

	enable() {
		this._indicator = new Indicator();
		Main.panel.addToStatusArea(this._uuid, this._indicator);
		lg("start");
		timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 10, () => {
			if (notify_on) { // Meta.SoundPlayer
				const player = global.display.get_sound_player();
				player.play_from_theme('complete', 'countdown', null);
			}
			// -------------------------------------------
			for (const item of list) { //~ list.forEach((item)=>{})
				item.secondLeft -= 10;
				updatelabel(item);
				if (item.secondLeft <= 0) {
					mmmsg(item.Gicon, _("Time is UP"), digit2unicode(item.TargetStr.toString()));
					list.splice(list.indexOf(item), 1);
					item.destroy();
					//~ GLib.spawn_command_line_async('canberra-gtk-play -l 3 -i complete');
					// -------------------------------------------
				}
			}
			return GLib.SOURCE_CONTINUE; // true GLib.SOURCE_REMOVE==>false
		});
	}

	disable() {
		this._indicator.destroy();
		this._indicator = null;
		if (timeoutId) {
			GLib.Source.remove(timeoutId);
			timeoutId = null;
		}
		lg("stop");
	}
}

function init(meta) {
	return new Extension(meta.uuid);
}
