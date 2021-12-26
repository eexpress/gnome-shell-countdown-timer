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

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
	_init() {
		super._init(0.0, _('My Shiny Indicator'));

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
			icon[i] = new St.Icon({icon_name: icongroup[i], style_class: 'system-status-icon', icon_size: 64});
			if(icongroup[i].substr(0, 5) == "file:"){
				icon[i].gicon = Gio.icon_new_for_string(
				Me.path + "/" + icongroup[i].substr(5));
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
					stock_icon.gicon = Gio.icon_new_for_string(
					Me.path + "/" + icongroup[i].substr(5));
				}
			};
		}
//~ -------------------------------------------------------------------
		let item_input = new PopupMenu.PopupBaseMenuItem({
                reactive: false,
                can_focus: false
            });
		let input = new St.Entry({
			name: 'searchEntry',
			//~ style_class: 'search-entry big_text',
			style_class: 'big_text',
			//~ primary_icon: new St.Icon({ icon_name: stock_icon.icon_name,
			primary_icon: new St.Icon({ gicon: Gio.icon_new_for_string(
				Me.path + "/countdown-symbolic.svg"),
				style_class: 'system-status-icon', icon_size: 32}),
			secondary_icon: new St.Icon({ gicon: Gio.icon_new_for_string(
				Me.path + "/stopwatch-symbolic.svg"),
				style_class: 'system-status-icon', icon_size: 32}),
			//~ secondary_icon: stock_icon,
			can_focus: true,
			hint_text: _('输入所需的延时分钟数，回车生效。'),
			track_hover: true,
			x_expand: true,
			//~ y_expand: true
		});
		item_input.add(input);
		this.menu.addMenuItem(item_input);
		this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
//~ -------------------------------------------------------------------
// In progress item
		//~ var run = new Array();
		this.menu.addMenuItem(addrun('2'));
		this.menu.addMenuItem(addrun('2sw'));
		//~ this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
		//~ let item9 = new PopupMenu.PopupMenuItem("𝕖𝕖𝕩𝕡𝕤𝕤@𝕘𝕞𝕒𝕚𝕝.𝕔𝕠𝕞");
		//~ this.menu.addMenuItem(item9);
		function addrun (str0){
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
			return item0;
// stock_icon, countdown-symbolic.svg, 倒计时还剩余 x 分钟
// stock_icon, stopwatch-symbolic.svg, 倒计时还剩余 x 分钟
// stock_icon, timer-symbolic.svg, 还有 x 分钟到 HH:MM
		}
//~ -------------------------------------------------------------------
		let area = new St.DrawingArea({ width: 128,	height: 128	});

		area.connect('repaint', ondraw(area));

		let item_cairo = new PopupMenu.PopupMenuItem('');
		item_cairo.actor.add_child(area);
		this.menu.addMenuItem(item_cairo);

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
				// Explicitly tell Cairo to free the context memory
				cr.$dispose();
			};
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
