"use strict"

var $notifyCheckboxes = $('.notify-checkbox');
var $notifySelectbox = $('.notify-selector select');
var notifyAudio = new Audio('/static/notify.mp3');
var notifyPokemon;
var pokemonRarity = {
	"common":["13","16","19","41","133"],
	"uncommon":["1","7","10","17","21","23","25","29","32","35","43","46","48","58","60","69","84","92","96","98","120","127","129","147"],
	"rare":["2","4","8","11","14","15","18","20","22","27","37","39","42","47","49","50","52","54","56","61","63","66","70","72","74","77","79","81","86","90","93","95","97","100","102","104","107","108","109","111","114","116","118","123","124","125","126","128","138","140","143"],
	"very_rare":["3","5","6","9","12","24","30","31","33","34","36","44","53","55","57","59","64","67","73","75","78","80","85","88","99","103","105","106","110","112","113","117","119","121","122","131","134","135","137","142","148","149"],
	"ultra_rare":["26","28","38","40","45","51","62","65","68","71","76","82","83","87","89","91","94","101","115","130","132","136","139","141","144","145","146","150","151"]
}
function saveNotifyList() {
	localStorage.notifyPokemon = JSON.stringify(notifyPokemon)
}

function getNotifyList() {
	if(!notifyPokemon){
		try {
			notifyPokemon = JSON.parse(localStorage.notifyPokemon);
			console.log(notifyPokemon);
		} catch(e) {
			console.log("Error reading notifiations list from storage, starting with default list");
			notifyPokemon = {};
		}
		if(!Object.keys(notifyPokemon).length){
			pokemonRarity.very_rare.forEach(addToNotify, true);
			pokemonRarity.ultra_rare.forEach(addToNotify, true);
		}
	}
	return notifyPokemon;
}

function shouldNotify(pokemonIndex) {
	return !!notifyPokemon[pokemonIndex];
}

function updateNotifyCheckbox(index, value){
	$('#notify-'+index).prop('checked', value);
}
function addToNotify(pokemonIndex, update) {
	notifyPokemon[pokemonIndex] = true;
	update && updateNotifyCheckbox(pokemonIndex, true)
	saveNotifyList();
}

function removeFromNotify(pokemonIndex, update) {
	notifyPokemon[pokemonIndex] = false;
	update && updateNotifyCheckbox(pokemonIndex, true)
	saveNotifyList();
}

function notify(item) {
	if(shouldNotify(item.pokemon_id)){
		notifyAudio.play();
		desktopNotification(item);
		// webhookNotification(item);
	}
}

function desktopNotification(item){
	var title = 'A wild '+item.pokemon_name+' has appeared';
	var icon = window.location.origin+ '/static/icons/'+item.pokemon_id+'.png';
	var text = 'Disappears in ' + formatTimeDiff((item.disappear_time - Date.now())/1000);

	if (Notification.permission !== "granted") {
		window.alert(title + '\n' + '\text');
	} else {
		var notification = new Notification(title, {
			icon: icon,
			body: text,
		});

		notification.onclick = function () {
			window.open("http://127.0.0.1:5000");      
		};

	}
}

function webhookNotification(item){

}

function initNotifications(){
	$notifyCheckboxes.change(function(){
		if(this.checked) {
			addToNotify($(this).val());
		}else {
			removeFromNotify($(this).val());
		}
	})

	$notifySelectbox.change(function(){
		var value = $(this).val();
		if(value && pokemonRarity[value]){
			pokemonRarity[value].forEach(addToNotify, true);
			$(this).val('');
		}
	});

	if (!Notification) {
		alert('Desktop notifications are not available in your browser. Try Chrome.');
		$notifyCheckboxes.disable(); 
		return;
	}

	if (Notification.permission !== "granted") {
		Notification.requestPermission();
	}

	getNotifyList();

	Object.keys(notifyPokemon).forEach(function(index){
		updateNotifyCheckbox(index, notifyPokemon[index]);
	});
}

initNotifications();
