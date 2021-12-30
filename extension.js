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
			hint_text: _('输入 数字 按分钟延时，或 HH:MM 格式定时，回车生效。'),
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
			const d = Number.parseInt(input.text);
			if (Number.isNaN(d) || d < 1) return;
			let text = _('  倒计时还剩余 ') + d + _(' 分钟，目标：') + d;
			const item = new PopupMenu.PopupImageMenuItem(text, stock_icon.icon_name);
			item.count = d;
			item.left = d;
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
//~ http://textconverter.net/
//~ 🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉 ❿⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴
//~ 🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩 ⓿❶❷❸❹❺❻❼❽❾
//~ 𝒆𝒆𝒙𝒑𝒔𝒔@𝒈𝒎𝒂𝒊𝒍.𝒄𝒐𝒎 🅴🅴🆇🅿🆂🆂@🅶🅼🅰🅸🅻.🅲🅾🅼 🅔🅔🅧🅟🅢🅢@🅖🅜🅐🅘🅛.🅒🅞🅜
//~ 🅲🅾🆄🅽🆃🅳🅾🆆🅽 / 🆃🅸🅼🅴🆁 𝕖𝕖𝕩𝕡𝕤𝕤@𝕘𝕞𝕒𝕚𝕝.𝕔𝕠𝕞
//~ ---------------------------------------------------------
class Extension {
	constructor(uuid) {
		this._uuid = uuid;

		ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
	}

	enable() {
		this._indicator = new Indicator();
		Main.panel.addToStatusArea(this._uuid, this._indicator);
		sourceId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 5, () => {
			log("======"+list.length+"======");
			list.forEach((i)=>{
				log(i.text +': '+ i.count+' <--- '+i.left);
			})
			return GLib.SOURCE_CONTINUE;	//true
			//~ return GLib.SOURCE_REMOVE;		//false
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
