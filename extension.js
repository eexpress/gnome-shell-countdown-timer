/* extension.js
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

//~ const Cairo = imports.cairo;
//~ const Mainloop = imports.mainloop;
//~ Mainloop.timeout_add(3000, function () { text.destroy(); });

const GETTEXT_DOMAIN = 'countdown-indicator-extension';
const _ = imports.gettext.domain(GETTEXT_DOMAIN).gettext;

const { GObject, Gio, Clutter, St } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const msg = Main.notify;

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
	_init() {
		var that = this;	// 想缓存，在闭包中，代替调用this。
		super._init(0.0, _('Countdown Indicator'));
//~ -------------------  面板主图标 ---------------------------
		var stock_icon = new St.Icon({ icon_name: 'alarm-symbolic', icon_size: 36 });
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
		//~ input.clutter_text.set_input_purpose(Clutter.DIGITS|Clutter.DATETIME);
		input.connect('primary-icon-clicked', ()=>{add_timer();});
		input.connect('secondary-icon-clicked', ()=>{add_timer();});
		//~ input.clutter_text.connect('activate', (actor) => { log(`Activated: ${actor.text}`); });
		input.clutter_text.connect('activate', (actor) => { add_timer(); });
		//~ input.connect('key-press-event', (self, event)=>{
			//~ let [success, keyval] = event.get_keyval();
			//~ let keyname = Gdk.keyval_name(keyval);
			//~ if (keyname === "Control_L"){add_timer();}
			//~ const symbol = event.get_key_symbol();
			//~ if (symbol === Clutter.KEY_KP_Enter) {add_timer(); return true;}
			//~ if (event.get_key_symbol() === Clutter.KEY_Enter){add_timer();}
			//~ if(event.keyval == Clutter.KEY_Enter){add_timer();} Clutter.KEY_Escape KEY_ISO_Enter KEY_KP_Enter KEY_3270_Enter KEY_equal
		//~ });
		item_input.add(input);
		function add_timer (){
			let d = parseInt(input.text);
			if(isNaN(d) || d < 1){return;}
			let text = _('  倒计时还剩余 xxxx 分钟，目标：') + d;
			//~ let text = _('  倒计时还剩余 xxxx 分钟，目标：') + input.text;
			let item = new PopupMenu.PopupImageMenuItem(text, stock_icon.icon_name);
			// 无法判断并提取gicon了。只能使用icon_name的stock图标？
			item.style_class = 'large_text';
			item.can_focus = true;
			item.connect('button-press-event', ()=> {delete_item(item);});
			//~ item.prototype.START = 0;
			//~ item.prototype.END = d;
			//~ item.text += item.START +"-x-"+ item.END;
			that.menu.addMenuItem(item);
		}
		function delete_item(item){
			//~ const GLib = imports.gi.GLib;
			//~ let stuff = GLib.spawn_command_line_sync("zenity --question xxx; echo $?")[1].toString();	//能卡死shell
			//~ log(stuff);
			item.destroy();
			// clipboard-indicator 自己带的一个 confirmDialog.js
		}
		this.menu.addMenuItem(item_input);
//~ -------------------- 分割栏以下为定时列表 -------------------
		this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
		//~ let item_sign = new PopupMenu.PopupMenuItem("𝕖𝕖𝕩𝕡𝕤𝕤@𝕘𝕞𝕒𝕚𝕝.𝕔𝕠𝕞");
		//~ this.menu.addMenuItem(item_sign);
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
	}

	disable() {
		this._indicator.destroy();
		this._indicator = null;
	}
}

function init(meta) {
	return new Extension(meta.uuid);
}
