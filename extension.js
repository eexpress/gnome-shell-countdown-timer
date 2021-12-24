/* extension.js
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GETTEXT_DOMAIN = 'my-indicator-extension';

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

// group icons
		//~ let box = new St.BoxLayout();
		let item0 = new PopupMenu.PopupMenuItem('');
		let icongroup = ['alarm-symbolic','software-update-urgent-symbolic','software-update-available-symbolic','appointment-soon-symbolic',
		'file:stopwatch-symbolic.svg','file:at-gui-symbolic.svg','file:alarm-symbolic.svg'];
		var icon = new Array();
		var butt = new Array();
		for (var i in icongroup) {
			icon[i] = new St.Icon({icon_name: icongroup[i], style_class: 'system-status-icon'});
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
			item0.actor.add_child(butt[i]);
		}
		this.menu.addMenuItem(item0);

		function clickchangeicon(i){
			return function() {
				stock_icon.icon_name = icongroup[i];
				if(icongroup[i].substr(0, 5) == "file:"){
					stock_icon.gicon = Gio.icon_new_for_string(
					Me.path + "/" + icongroup[i].substr(5));
				}
			};
		}

		let item1 = new PopupMenu.PopupMenuItem(_('延时几分钟后提醒'));
		item1.connect('activate', () => {
			//~ Main.notify(_('Whatʼs up, folks? '));
		});
		this.menu.addMenuItem(item1);

		let item2 = new PopupMenu.PopupMenuItem(_('定时几点几分提醒'));
		item2.connect('activate', () => {
			//~ Main.notify(_('Whatʼs up, folks? '));
		});
		this.menu.addMenuItem(item2);

		let item3 = new PopupMenu.PopupMenuItem("𝕖𝕖𝕩𝕡𝕤𝕤@𝕘𝕞𝕒𝕚𝕝.𝕔𝕠𝕞");
		this.menu.addMenuItem(item3);
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
