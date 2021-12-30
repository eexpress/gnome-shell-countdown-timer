/* extension.js
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

//~ const Cairo = imports.cairo;
//~ const Mainloop = imports.mainloop;
//~ Mainloop.timeout_add(3000, function () { text.destroy(); });

imports.gi.versions.Gtk = '3.0';	//GLib need version.

const GETTEXT_DOMAIN = 'countdown-indicator-extension';
const _ = imports.gettext.domain(GETTEXT_DOMAIN).gettext;

const { GObject, GLib, Gio, Clutter, St } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const msg = Main.notify;
//~ const MessageTray = imports.ui.messageTray;

	let sourceId = null;
	const list = [];

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
	_init() {
		var that = this;	// 想缓存，在闭包中，代替调用this。
		super._init(0.0, _('Countdown Indicator'));
//~ -------------------  面板主图标 ---------------------------
		var stock_icon = new St.Icon({ icon_name: 'alarm-symbolic', icon_size: 30 });
		this.add_child(stock_icon);
//~ ----------------  第一行可选图标组 -------------------------
		let item_icons = new PopupMenu.PopupMenuItem('');
		['alarm-symbolic','call-start-symbolic','go-home-symbolic','media-view-subtitles-symbolic','airplane-mode-symbolic','system-users-symbolic','applications-games-symbolic','emoji-food-symbolic','face-devilish-symbolic','emblem-favorite-symbolic','file:stopwatch-symbolic.svg'].forEach(showicon);
		function showicon(item){
			let icon = new St.Icon({ style_class: 'iconlist' });
			set_icon(icon, item);	// icon 不能直接 button-press-event ？？？
			//~ St.Icon Signals Inherited: Clutter.Container (3), GObject.Object (1), Clutter.Actor (25), St.Widget (2)
			let butt = new St.Button({ can_focus: true, child: icon });
			butt.connect('button-press-event', () => { set_icon(stock_icon, item); });
			item_icons.actor.add_child(butt);
		};
		function set_icon(icon, str){
		// 使用本地图标文件'file:stopwatch-symbolic.svg'，PopupImageMenuItem 无法设置gicon了。
			if(str.substr(0, 5) == "file:"){
				icon.gicon = local_icon(str.substr(5));
			} else { icon.icon_name = str; }
		}
		this.menu.addMenuItem(item_icons);
//~ ---------------------------------------------------------
		function local_icon(str){
			return Gio.icon_new_for_string(
			ExtensionUtils.getCurrentExtension().path+"/"+str);
		}
//~ ------------------- 第二行输入栏 --------------------------
		let item_input = new PopupMenu.PopupBaseMenuItem({
                reactive: false, can_focus: false });
		let input = new St.Entry({
			name: 'searchEntry',
			style_class: 'big_text',
			primary_icon: new St.Icon({ gicon: local_icon("countdown-symbolic.svg") }),
			secondary_icon: new St.Icon({ gicon: local_icon("stopwatch-symbolic.svg") }),
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
				//~ const unixTime = Date.parse(input.text);
				//~ if(unixTime == NaN) return;
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
				//~ log(`${s} :  <${hhmm}> : <${h1}>:<${m1}> -- ${h0}:${m0}`);
				m = (h1-h0)*60+m1-m0;
				s = input.text;
			}else{	// Countdown by Minutes
				m = Number.parseInt(s);
				if (Number.isNaN(m) || m < 1) return;
				s = m + _(' minutes');
				isCntDwn = true;
			}

			const item = new PopupMenu.PopupImageMenuItem('xx', stock_icon.icon_name);
			item.TargetStr = s;
			item.secondLeft = m*60;
			item.type = isCntDwn;
			updatelabel(item);
			// 无法判断并提取gicon了。只能使用icon_name的stock图标？
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
		//~ let item_sign = new PopupMenu.PopupMenuItem("𝕖𝕖𝕩𝕡𝕤𝕤@𝕘𝕞𝕒𝕚𝕝.𝕔𝕠𝕞"); this.menu.addMenuItem(item_sign);
//~ ---------------------------------------------------------
//~ ---------------------------------------------------------
	}
});
//~ ---------------------------------------------------------
 //~ 🄌 U+24FF U+1F10C ❶ U+2776 ❾ U+277E
 //~ 𝟘 U+1D7D8 𝟙 U+1D7D9 𝟡 U+1D7E1
 //~ 𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡𝟘
//~ http://textconverter.net/
//~ 🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉 ❿⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴
//~ 🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩 ⓿❶❷❸❹❺❻❼❽❾
//~ 𝒆𝒆𝒙𝒑𝒔𝒔@𝒈𝒎𝒂𝒊𝒍.𝒄𝒐𝒎 🅴🅴🆇🅿🆂🆂@🅶🅼🅰🅸🅻.🅲🅾🅼 🅔🅔🅧🅟🅢🅢@🅖🅜🅐🅘🅛.🅒🅞🅜
//~ 🅲🅾🆄🅽🆃🅳🅾🆆🅽 / 🆃🅸🅼🅴🆁 𝕖𝕖𝕩𝕡𝕤𝕤@𝕘𝕞𝕒𝕚𝕝.𝕔𝕠𝕞
		function updatelabel(item){
			const m = Math.floor(item.secondLeft/60);
			const s = Math.floor(item.secondLeft%60);
			const ss = (s==0) ? '00' : s.toString();
			if(item.type){
				item.label.text = _('  Countdown left ') + digit2unicode(m+"'"+ss) + _(', Target: ') + item.TargetStr + '.';
			}else{
				item.label.text = _('  Timer left ') + digit2unicode(m+"'"+ss) + _(', Target: ') + item.TargetStr + '.';
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
class Extension {
	constructor(uuid) {
		this._uuid = uuid;
		ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
	}

	enable() {
		this._indicator = new Indicator();
		Main.panel.addToStatusArea(this._uuid, this._indicator);
	//~ function notify(msg, details, icon) {
		//~ let source = new MessageTray.Source("MyApp Information", icon);
		//~ Main.messageTray.add(source);
		//~ let notification = new MessageTray.Notification(source, msg, details);
		//~ notification.setTransient(true);
		//~ source.notify(notification);
	//~ }
	//~ let notification = new MessageTray.Notification(source, msg, details, {gicon: my_g_icon});
		sourceId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 10, () => {
			for (const item of list){ 	//~ list.forEach((item)=>{})
				item.secondLeft-=10;
				updatelabel(item);
				if(item.secondLeft <= 0){
					msg(_("Time is UP"), digit2unicode(item.TargetStr.toString()),item._icon.icon_name);
//需要调用当前图标来显示。item._icon.icon_name
					//~ notify("MyApp", "Test", 'folder-symbolic');
					list.splice(list.indexOf(item), 1);
					item.destroy();
				}
			}
			return GLib.SOURCE_CONTINUE;	//true GLib.SOURCE_REMOVE==>false
		});
	}

	disable() {
		this._indicator.destroy();
		this._indicator = null;
		if (sourceId) {
			GLib.Source.remove(sourceId);
			sourceId = null;
		}
	}
}

function init(meta) {
	return new Extension(meta.uuid);
}
