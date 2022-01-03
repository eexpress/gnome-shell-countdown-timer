/* extension.js
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

//~ 🅲🅾🆄🅽🆃🅳🅾🆆🅽 / 🆃🅸🅼🅴🆁 𝕖𝕖𝕩𝕡𝕤𝕤@𝕘𝕞𝕒𝕚𝕝.𝕔𝕠𝕞
//~ const Cairo = imports.cairo;
//~ ⭕ cp ~/project/gnome-shell-countdown-timer/extension.js ~/.local/share/gnome-shell/extensions/countdown-timer@eexpss.gmail.com/; killall -3 gnome-shell

const GETTEXT_DOMAIN = 'countdown-timer';	//这行说指向翻译的 mo 文件名的关键
const _ = imports.gettext.domain(GETTEXT_DOMAIN).gettext;

const { GObject, GLib, Gio, Clutter, St } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

	let timeoutId = null;
	const list = [];

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
	_init() {
		var that = this;	// 想缓存，在闭包中，代替调用this。
		super._init(0.0, _('Countdown Indicator'));
		let last_gicon = '';
//~ -------------------  面板主图标 ---------------------------
		var stock_icon = new St.Icon({ icon_name: 'alarm-symbolic', icon_size: 30 });
		this.add_child(stock_icon);
//~ ----------------  第一行可选图标组 -------------------------
		let item_icons = new PopupMenu.PopupMenuItem('');
		['alarm-symbolic','call-start-symbolic','go-home-symbolic','media-view-subtitles-symbolic','airplane-mode-symbolic','system-users-symbolic','applications-games-symbolic','emoji-food-symbolic','face-devilish-symbolic','emblem-favorite-symbolic','file:stopwatch-symbolic.svg','file:countdown-symbolic.svg','file:timer-symbolic.svg'].forEach(showicon);
		function showicon(item){
			let icon = new St.Icon({ style_class: 'iconlist' });
			set_icon(icon, item);	// icon 不能直接 button-press-event ？？？
			let butt = new St.Button({ can_focus: true, child: icon });
			butt.connect('button-press-event', () => { set_icon(stock_icon, item); });
			item_icons.actor.add_child(butt);
		};
		function set_icon(icon, str){
			if(str.substr(0, 5) == "file:"){
				last_gicon = str.substr(5);
				icon.gicon = local_gicon(last_gicon);
			} else { icon.icon_name = str; last_gicon = ''; }
		}
		this.menu.addMenuItem(item_icons);
//~ ---------------------------------------------------------
//~ ------------------- 第二行输入栏 --------------------------
		let item_input = new PopupMenu.PopupBaseMenuItem({
                reactive: false, can_focus: false });
		let input = new St.Entry({
			name: 'searchEntry',
			style_class: 'big_text',
			primary_icon: new St.Icon({ gicon: local_gicon("countdown-symbolic.svg") }),
			secondary_icon: new St.Icon({ gicon: local_gicon("stopwatch-symbolic.svg") }),
			can_focus: true,
			//~ hint_text: _('输入 数字 按分钟延时，或 HH:MM 格式定时，回车生效。'),
			hint_text: _('Input DIGIT to countdown, or HH:MM to set timer. Then press ENTER.'),
			track_hover: true,
			x_expand: true,
		});
		// 需要限制输入的字符：数字和冒号
		input.connect('primary-icon-clicked', ()=>{add_timer();});
		input.connect('secondary-icon-clicked', ()=>{add_timer();});
		input.clutter_text.connect('activate', (actor) => { add_timer(); });
		item_input.add(input);
		this.menu.addMenuItem(item_input);
//~ ---------------------------------------------------------
		function add_timer (){
			let s = input.text;
			let m = 0;
			let isCntDwn = false;
			if(/\d{1,2}:\d{1,2}/.test(s)){	// HH:MM Timer
				let hhmm = s.match(/(\d{1,2}):(\d{1,2})/);
				let h1 = parseInt(hhmm[1]);
				const m1 = parseInt(hhmm[2]);
				const d0 = new Date();
				const h0 = d0.getHours();
				const m0 = d0.getMinutes();
				if(h1<h0){h1+=12;}else{
					if(h1==h0 && m1<=m0){h1+=12;}
				}
				if(h1<h0){h1+=12;}else{
					if(h1==h0 && m1<=m0){h1+=12;}
				}
				m = (h1-h0)*60+m1-m0;
				s = input.text;
			}else{	// Countdown by Minutes
				m = Number.parseInt(s);
				if (Number.isNaN(m) || m < 1) return;
				s = m + _(' minutes');
				isCntDwn = true;
			}

			const item = new PopupMenu.PopupImageMenuItem('xx', stock_icon.icon_name);
			if(!stock_icon.icon_name && last_gicon){
				item.setIcon(local_gicon(last_gicon));
				item.Gicon = 'file:'+last_gicon;
			}else item.Gicon = stock_icon.icon_name;
			// 增加3个参数
			item.TargetStr = s;
			item.secondLeft = m*60;

			updatelabel(item);	// 立刻刷新label。否则会显示出xx。
			item.style_class = 'large_text';
			item.can_focus = true;
			item.connect('activate', (actor) => {
				list.splice(list.indexOf(actor), 1);
				actor.destroy();
			});
			that.menu.addMenuItem(item);
			list.push(item);
			input.text = '';
		}
//~ -------------------- 分割栏以下为定时列表 -------------------
		this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
	}
});
//~ ---------------------------------------------------------
		function local_gicon(str){
			return Gio.icon_new_for_string(
			ExtensionUtils.getCurrentExtension().path+"/img/"+str);
		}
		function updatelabel(item){
			const m = Math.floor(item.secondLeft/60);
			const s = Math.floor(item.secondLeft%60);
			const ss = (s==0) ? '00' : s.toString();
			if(item.type){
				item.label.text = _('  Countdown left %s, Target: %s.').format(digit2unicode(m+"'"+ss), item.TargetStr);
			}else{
				item.label.text = _('  Timer left %s, Target: %s.').format(digit2unicode(m+"'"+ss), item.TargetStr);
			}
		};

		function digit2unicode(str){
			const n = "⓿❶❷❸❹❺❻❼❽❾";
			for(let i = 0; i<10; i++){
				str = str.replace(new RegExp(i.toString(),'g'),n.substr(i,1));
			}
			return str;
		};

//~ ---------------------------------------------------------
//~ https://github.com/GNOME/gnome-shell/blob/main/js/ui/messageTray.js
let notify_on = false;
const MessageTray = imports.ui.messageTray;
function mmmsg(icon, title, text) {	//支持本地图标
    let source = new MessageTray.Source('Countdown & Timer', icon);
    source.connect('destroy', () => notify_on = false);
    Main.messageTray.add(source);
    let params = {};
    if(icon.substr(0, 5) === "file:"){	// 使用 gicon 可以覆盖 icon
		params = {bannerMarkup: true, gicon: local_gicon(icon.substr(5))};
	}
    let notif = new MessageTray.Notification(source, title, text, params);
	notif.setUrgency(MessageTray.Urgency.CRITICAL);	// 一直显示
	notify_on = true;
    source.showNotification(notif);
}
//~ ---------------------------------------------------------
class Extension {
	constructor(uuid) {
		this._uuid = uuid;
		ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
	}

	enable() {
		this._indicator = new Indicator();
		Main.panel.addToStatusArea(this._uuid, this._indicator);
		timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 10, () => {
			if(notify_on){	//Meta.SoundPlayer
				let player = global.display.get_sound_player();
				player.play_from_theme('complete', 'countdown', null);
			}
// -------------------------------------------
			for (const item of list){ 	//~ list.forEach((item)=>{})
				item.secondLeft-=10;
				updatelabel(item);
				if(item.secondLeft <= 0){
					mmmsg(item.Gicon, _("Time is UP"), digit2unicode(item.TargetStr.toString()));
					list.splice(list.indexOf(item), 1);
					item.destroy();
					//~ GLib.spawn_command_line_async('canberra-gtk-play -l 3 -i complete');
// -------------------------------------------
				}
			}
			return GLib.SOURCE_CONTINUE;	//true GLib.SOURCE_REMOVE==>false
		});
	}

	disable() {
		this._indicator.destroy();
		this._indicator = null;
		if (timeoutId) {
			GLib.Source.remove(timeoutId);
			timeoutId = null;
		}
	}
}

function init(meta) {
	return new Extension(meta.uuid);
}
