var firstHandPosition = null; //posizione della mano nel momento in cui viene chiamato l'evento leap-holdstart
var holdStart = false; //indica se l'evento sia stato emesso o meno
var target = null; //oggetto da trasformare
var hand = null; //mano che innesca l'evento
var targetOriginalValue = null; //valore iniziale del target per somma (posizione, scala, rotazione)
var axis = null; //asse scelto per la modifica
//var oldTransformPosition = null; //posizione precedente transform per spostamento
var handTick = null; //posizione della mano al tick della scena (da cui viene sottratta la posizione iniziale del pollice)

//riprinstina il colore degli assi in hold stop
function oldColor() {
    if (axis === 'distanceSpot')
        return '#ff0000';
    else if (axis === 'angleSpot')
        return '#0000ff';
    else if (axis === 'colorRing' || axis === 'lightnessRing')
        return '#888';
}

//mano che innesca l'evento hold start da cui recuperare la posizione delle dita
function selectHand() {
    let hands = document.querySelectorAll('[leap-hand]');
    for (let j = 0; j < hands.length; j++) {
        if (hands[j].components['leap-hand'].getHand() !== undefined && hands[j].components['leap-hand'].getHand().type === hand.type) {
                handTick = hands[j].components['leap-hand'].getHand().pointables[0].tipPosition;
        }
    }
}

AFRAME.registerComponent('holdable-light', {

    init: function () {
        this.el.addEventListener('leap-holdstart', this.onHoldStart.bind(this));
        this.el.addEventListener('leap-holdstop', this.onHoldStop.bind(this));
    },

    tick: function () {
        if (holdStart) {
            if (axis !== null) {
                //selezione posizione mano in base all'asse
                selectHand();
                if (handTick !== null && handTick !== undefined) {
                    //modifica del parametro in base all'asse scelto, var i
                    //(differenza tra posizione pollice in holdstart e ad ogni tick)
                    switch (axis) {
                        case 'distanceSpot':
                            if (controls[currentControl] === 'spot') {
                                newDistance = targetOriginalValue.distance + ((handTick[0] - firstHandPosition[0]) * 100) ;
                                if (newDistance < 0)
                                    newDistance = 0.01;

                                //Modifica parametri luce
                                target.setAttribute('light', {distance: newDistance});

                                //Modifica corpo visibile della luce
                                targetObject.aframeEl.querySelector("#spotCone").object3D.position.z = -(newDistance / 2);
                                targetObject.aframeEl.querySelector("#spotCone").object3D.scale.set(newDistance, newDistance, newDistance);
                            }
                            break;
                        case 'angleSpot':
                            if (controls[currentControl] === 'spot') {
                                let newAngle = targetOriginalValue.angle + ((handTick[0] - firstHandPosition[0]) * 100);
                                if (newAngle > 89.9)
                                    newAngle = 89.9;
                                if (newAngle < 0)
                                    newAngle = 0.1;
                                //Modifica parametri luce
                                target.setAttribute('light', {angle: newAngle});
                                //Modifica corpo visibile della luce
                                targetObject.aframeEl.querySelector("#spotCone").setAttribute("geometry", {radiusBottom: Math.tan(newAngle * Math.PI / 180)});
                            }
                            break;
                        case 'colorRing':
                            if (controls[currentControl] === 'color') {
                                let newColor = (targetOriginalValue.hue + ((handTick[1] - firstHandPosition[1]) * 360)) % 360;
                                if (newColor < 0)
                                    newColor = 360 + newColor;
                                newColor = parseInt(newColor);

                                //Modifica parametri luce
                                target.setAttribute('light', {color: "hsl(" + newColor + ", 100%, " + targetOriginalValue.lightness + "%)"});
                                //Modifica corpo visibile della luce
                                document.querySelector("#colorRing").setAttribute("rotation", {z: newColor});
                            }
                            break;
                        case 'lightnessRing':
                            if (controls[currentControl] === 'color') {
                                let newLightness = (targetOriginalValue.lightness + ((handTick[1] - firstHandPosition[1]) * 100)) % 100;
                                if (newLightness < 0)
                                    newLightness = 100 + newLightness;
                                newLightness = parseInt(newLightness);

                                //Modifica parametri luce
                                target.setAttribute('light', {color: "hsl(" + targetOriginalValue.hue + ", 100%, " + newLightness + "%)"});
                                //Modifica corpo visibile della luce
                                document.querySelector("#lightnessRing").setAttribute("rotation", {z: (newLightness * 3.6)});
                            }
                            break;
                    }
                } else
                //emette l'evento stop perché la mano non è più visibile
                    this.el.emit('leap-holdstop');
            }
        } else
            axis = targetOriginalValue = hand = target = null;
    },

    onHoldStart: function (e) {

        target = targetObject.aframeEl;
        axis = e.target.id;
        if (e.detail.hand !== null && e.detail !== undefined && e.detail.hand) {
            //assegnamento mano che innescato l'evento
            hand = e.detail.hand;
            firstHandPosition = e.detail.hand.pointables[0].tipPosition;
            //assegnato target dallo script componente
            holdStart = true;
            //Cambio del colore se l'oggeto è selezionato
            if (axis !== 'colorRing' && axis !== 'lightnessRing'){
                document.querySelector('#' + axis + 'Line').setAttribute('line', {color: '#ffff00'});
                document.querySelector('#' + axis).setAttribute('material', {color: '#ffff00'});
            } else {
                    document.querySelector('#' + axis).setAttribute('material', {color: '#FFF'});
            }
            
            //Salvataggio parametri precedenti
            if (controls[currentControl] === 'spot') {
                targetOriginalValue = {
                    scale: target.getAttribute('scale'),
                    distance: target.getAttribute('light').distance,
                    angle: target.getAttribute('light').angle};
            } else if (controls[currentControl] === 'color') {
                //Per la luce uso lo standard: hsl(hue, saturation, lightness).
                let colorStr = target.getAttribute('light').color;
                targetOriginalValue = {
                    hue: colorStr.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g).map(function (v) {return +v;})[0],
                    saturation: colorStr.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g).map(function (v) {return +v;})[1],
                    lightness: colorStr.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g).map(function (v) {return +v;})[2]};
            }
        }
    },

    onHoldStop: function () {
        //l'evento emesso è stato "stoppato"
        holdStart = false;
        //assegnamento colore precedente
        document.querySelector('#' + axis).setAttribute('material', {color: oldColor()});
        if (axis !== "colorRing" && axis !== 'lightnessRing')
            document.querySelector('#' + axis + 'Line').setAttribute('line', {color: oldColor()});

    }
});
