/* extension.js
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GETTEXT_DOMAIN = 'my-indicator-extension';
//~ const Cairo = imports.cairo;
const { GObject, Gio, Clutter, St } = imports.gi;
const Me = imports.misc.extensionUtils.getCurrentExtension();
//~ const Mainloop = imports.mainloop;
//~ Mainloop.timeout_add(3000, function () { text.destroy(); });
const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

//~ const myicon = Gio.icon_new_for_string;

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
	_init() {
		var that = this;	// 想缓存，在闭包中，代替调用this。
		super._init(0.0, _('Countdown / Timer Indicator'));

		let stock_icon = new St.Icon({
		icon_name: 'alarm-symbolic',
		style_class: 'system-status-icon',
		});
		this.add_child(stock_icon);
//~ -------------------------------------------------------------------
// group icons of notify.
		let item_icons = new PopupMenu.PopupMenuItem('');
		//~ let icongroup = ['alarm-symbolic','software-update-urgent-symbolic','software-update-available-symbolic','appointment-soon-symbolic',		'file:stopwatch-symbolic.svg','file:at-gui-symbolic.svg',		'file:alarm-symbolic.svg'];
		let icongroup = ['alarm-symbolic','call-start-symbolic','go-home-symbolic','media-view-subtitles-symbolic','airplane-mode-symbolic',	'system-users-symbolic','applications-games-symbolic','emoji-food-symbolic','face-devilish-symbolic','emblem-favorite-symbolic'];
		var icon = new Array();
		var butt = new Array();
		for (var i in icongroup) {
			//~ icon[i] = new St.Icon({icon_name: icongroup[i], style_class: 'iconlist', icon_size: 48 });
			icon[i] = new St.Icon({icon_name: icongroup[i], style_class: 'iconlist' });
			if(icongroup[i].substr(0, 5) == "file:"){
				icon[i].gicon = local_icon(icongroup[i].substr(5));
			}

			butt[i] = new St.Button({
				can_focus: true,
				child: icon[i],
				//~ x_align: Clutter.ActorAlign.END, x_expand: true, y_expand: true
				});
			//~ butt[i].connect('button-press-event', () => { stock_icon.icon_name = icongroup[i]; });
			butt[i].connect('button-press-event', clickchangeicon(i));
			item_icons.actor.add_child(butt[i]);
		}
// 需要增加说明文字？
		//~ let box = new St.BoxLayout({style_class: "expression-box", vertical: true });
		//~ box.add_child(new St.Label({ text: _('选择提醒图标') }));
		//~ box.add_child(item_icons);
		//~ let item_icons0 = new PopupMenu.PopupMenuItem('');
		//~ item_icons0.actor.add_child(box);
		//~ this.menu.addMenuItem(item_icons0);
		this.menu.addMenuItem(item_icons);

		function clickchangeicon(i){
			return function() {
				stock_icon.icon_name = icongroup[i];
				if(icongroup[i].substr(0, 5) == "file:"){
					stock_icon.gicon = local_icon(icongroup[i].substr(5));
				}
			}
		}

		function local_icon(str){
			return Gio.icon_new_for_string(Me.path+"/"+str);
		}
//~ -------------------------------------------------------------------
		let item_input = new PopupMenu.PopupBaseMenuItem({
                reactive: false,
                can_focus: false
            });
		let input = new St.Entry({
			name: 'searchEntry',
			style_class: 'big_text',
			//~ primary_icon: new St.Icon({ gicon: local_icon("countdown-symbolic.svg"), style_class: 'system-status-icon', icon_size: 32}),
			primary_icon: new St.Icon({ gicon: local_icon("countdown-symbolic.svg") }),
			secondary_icon: new St.Icon({ gicon: local_icon("stopwatch-symbolic.svg") }),
			can_focus: true,
			hint_text: _('输入 数字 按分钟延时，或 HH:MM 格式定时，回车生效。'),
			track_hover: true,
			x_expand: true,
		});
		input.connect( 'primary-icon-clicked', addtimer(input.text) );
		input.connect( 'secondary-icon-clicked', addtimer1(input.text) );
		item_input.add(input);
		this.menu.addMenuItem(item_input);
		this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
//~ -------------------------------------------------------------------
// In progress item
		//~ addtimer('99999');
		//~ var list = new Object({current: 0, total: 5, str: '5'});
		//~ var list = new Object({current: 0, total: 105, str: '5:30'});
		//~ var run = new Array();
		//~ this.menu.addMenuItem(addtimer('2'));
		//~ this.menu.addMenuItem(addtimer('2sw'));
		//~ this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
		//~ let item9 = new PopupMenu.PopupMenuItem("𝕖𝕖𝕩𝕡𝕤𝕤@𝕘𝕞𝕒𝕚𝕝.𝕔𝕠𝕞");
		//~ this.menu.addMenuItem(item9);
		function addtimer1 (str0){
			return function() {
				//~ let icon0 =  new St.Icon({ icon_name: stock_icon.icon_name,
				//~ style_class: 'system-status-icon', icon_size: 32});
				//~ let lb0 = new St.Label({ style_class: 'big_text' });
				//~ lb0.text = (str0 == "2") ? '  倒计时还剩余 x 分钟' : '  还有 x 分钟到 HH:MM' ;
				let item0 = new PopupMenu.PopupImageMenuItem('xxxx', stock_icon.icon_name);
				//~ let item0 = new PopupMenu.PopupImageMenuItem({text: 'xxxx', icon_name: stock_icon.icon_name, style_class: 'big_text', icon_size: 32});
				that.menu.addMenuItem(item0);
			}
		}
		function addtimer (str0){
			return function() {
			let box0 = new St.BoxLayout({ style_class: "expression-box" });
			let icon0 =  new St.Icon({ icon_name: stock_icon.icon_name,
				style_class: 'system-status-icon', icon_size: 32});
			//~ let lb0 = new St.Label({style_class: 'big_text', x_align: Clutter.ActorAlign.CENTER});
			let lb0 = new St.Label({ style_class: 'big_text' });
			//~ lb0.x_align = Clutter.ActorAlign.END;
			lb0.text = (str0 == "2") ? '  倒计时还剩余 x 分钟' : '  还有 x 分钟到 HH:MM' ;
			box0.add_child(icon0);
			box0.add_child(lb0);
			let item0 = new PopupMenu.PopupMenuItem('');
			item0.add_child(box0);
			//~ Main.notify(_('item0 added.'));
			that.menu.addMenuItem(item0);
			//~ item0.connect( 'button-press-event', msg(_('item0 clicked.')));
			//~ return item0;
// stock_icon, countdown-symbolic.svg, 倒计时还剩余 x 分钟
// stock_icon, stopwatch-symbolic.svg, 倒计时还剩余 x 分钟
// stock_icon, timer-symbolic.svg, 还有 x 分钟到 HH:MM
			}
		}
//~ -------------------------------------------------------------------
		//~ function msg(str){ return function(){ Main.notify(str); }}
		function msg(str){  Main.notify(str); }
//~ -------------------------------------------------------------------
		let area = new St.DrawingArea({ width: 500,	height: 100	});

		area.connect('repaint', ondraw(area));

		let item_cairo = new PopupMenu.PopupMenuItem('');
		item_cairo.actor.add_child(area);
		//~ this.menu.addMenuItem(item_cairo);

		function ondraw(area){
			return function() {
				// Get the cairo context
				let cr = area.get_context();
				// Do some drawing with cairo
				cr.set_font_size(64);
				cr.set_source_rgba (1, 0, 0, 1);
				cr.move_to(10,10);
				cr.show_text('Samole');
				cr.move_to(30,40);
				cr.arc(0,0,50,0,2*Math.PI);
				cr.fill();
				area.queue_repaint();
				// Explicitly tell Cairo to free the context memory
				cr.$dispose();
			}
		}
//~ -------------------------------------------------------------------
	}
});

//~ http://textconverter.net/
//~ 🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉 ❿⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴
//~ 🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩 ⓿❶❷❸❹❺❻❼❽❾
//~ 𝒆𝒆𝒙𝒑𝒔𝒔@𝒈𝒎𝒂𝒊𝒍.𝒄𝒐𝒎 🅴🅴🆇🅿🆂🆂@🅶🅼🅰🅸🅻.🅲🅾🅼 🅔🅔🅧🅟🅢🅢@🅖🅜🅐🅘🅛.🅒🅞🅜
//~ 🅲🅾🆄🅽🆃🅳🅾🆆🅽 / 🆃🅸🅼🅴🆁 𝕖𝕖𝕩𝕡𝕤𝕤@𝕘𝕞𝕒𝕚𝕝.𝕔𝕠𝕞

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
