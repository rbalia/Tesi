let startMovement = null;
let stop = null;
let mouseDistance = null;
let flagMouse = false;
let flagEnter = false;
let mouseAxis = null;
let controlElement = null;
let targetElement = null;
let targetElementOriginalValue = null;
let oldElementTransformPosition = null;
let ready = false;
var newDistance;
//Variabili per il salvataggio dei parametri della luce
let oldDistance = null;
let oldAngle = null;
let oldLightColor = null;


function oldColorMouse() {
    if (mouseAxis === 'distanceSpot')
        return '#ff0000';
    else if (mouseAxis === 'angleSpot')
        return '#0000ff';
    else if (mouseAxis === 'colorRing' || mouseAxis === 'lightnessRing')
        return '#888';
}

AFRAME.registerComponent('trigger-light-bodies', {
    init: function () {
        this.el.addEventListener('click', function (evt) {
            if(!lightBodyVisible){
                appendLightBody();
                lightBodyVisible = true;
            } else {
                removeLightBody();
                lightBodyVisible = false;
            }
        });
    }
});

AFRAME.registerComponent('trigger-light-editor', {
    init: function () {
        this.el.addEventListener('click', function (evt) {
            let targetLightBody = evt.target;
            while (targetLightBody.getAttribute("light") === null) {
                    targetLightBody = targetLightBody.parentEl;
                }
            if (targetObject.aframeEl === null || targetObject.aframeEl !== targetLightBody) {
                targetObject.aframeEl = targetLightBody;
                if(lightBody !== null){
                    if (lightBody !== evt.target){
                        lightBody.setAttribute('scale', '1 1 1');
                        lightBody.setAttribute('class', 'selectable');
                        lightBody = evt.target;
                        lightBody.removeAttribute('class');
                    }
                }else {
                    lightBody = evt.target;
                    lightBody.removeAttribute('class');
                }
                
                createTransform(controls[0]);
            }
        });
    }
});

AFRAME.registerComponent('mousecontrol-light', {
    init: function () {
        let self = this;
        this.el.addEventListener('mouseenter', function (event) {
            if (!flagMouse) {
                flagEnter = true;
                controlElement = event.target;
                mouseAxis = controlElement.id;
                if (mouseAxis !== "colorRing" && mouseAxis !== 'lightnessRing'){
                    document.querySelector('#' + mouseAxis + 'Line').setAttribute('line', {color: '#ffff00'});
                    controlElement.setAttribute('material', 'color: #ffff00');
                } else {
                    //document.querySelector('#' + mouseAxis).object3D.scale.set(1.05 , 1.05 , 1.05);
                    controlElement.setAttribute('material', {color: '#FFF'});
                }
            }
        });
        this.el.addEventListener('mouseleave', function (event) {
            if (!flagMouse && flagEnter) {
                flagEnter = false;
                controlElement.setAttribute('material', 'color: ' + oldColorMouse());
                if (mouseAxis !== "colorRing" && mouseAxis !== 'lightnessRing')
                    document.querySelector('#' + mouseAxis + 'Line').setAttribute('line', {color: oldColorMouse()});
                else {
                    controlElement.setAttribute('material', {color: oldColorMouse()});
                }
                mouseAxis = null;
            }
        });
        this.el.addEventListener('mousedown', function (event) {
            document.querySelector('[camera]').removeAttribute('look-controls');
            //inizio click
            flagMouse = true;
            controlElement = event.target;
            mouseAxis = controlElement.id;                   
            targetElement = targetObject.aframeEl;
            
            if (mouseAxis !== 'colorRing' && mouseAxis !== 'lightnessRing'){
                document.querySelector('#' + mouseAxis + 'Line').setAttribute('line', {color: '#ffff00'});
                controlElement.setAttribute('material', 'color: #ffff00');
            } else {
                    //controlElement.object3D.scale.set(1.05 , 1.05 , 1.05);
                    controlElement.setAttribute('material', {color: '#FFF'});
                }
            ready = true;
            //salvataggio posizione precedente
            if (controls[currentControl] === 'spot') {
                targetElementOriginalValue = {
                    scale: targetElement.getAttribute('scale'),
                    distance: targetElement.getAttribute('light').distance,
                    angle: targetElement.getAttribute('light').angle};
            } else if (controls[currentControl] === 'color') {
                //Per la luce uso lo standard: hsl(hue, saturation, lightness).
                let colorStr = targetElement.getAttribute('light').color;
                targetElementOriginalValue = {
                    hue: colorStr.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g).map(function (v) {return +v;})[0],
                    saturation: colorStr.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g).map(function (v) {return +v;})[1],
                    lightness: colorStr.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g).map(function (v) {return +v;})[2]};
            }
        });
        document.addEventListener('mousemove', function (event) {
            if (flagMouse) {
                if (ready) {
                    ready = false;
                    switch (mouseAxis) {
                        case 'distanceSpot':
                        case 'angleSpot':
                            startMovement = (event.clientX / window.innerWidth) * 2 - 1;
                            break;
                        case 'colorRing':
                        case 'lightnessRing':
                            startMovement = -(event.clientY / window.innerHeight) * 2 + 1;
                            break;
                        
                    }
                }
                switch (mouseAxis) {
                    case 'distanceSpot':
                    case 'angleSpot':
                        stop = (event.clientX / window.innerWidth) * 2 - 1;
                        mouseDistance = -startMovement + stop;
                        break;
                    case 'colorRing':
                    case 'lightnessRing':
                        stop = -(event.clientY / window.innerHeight) * 2 + 1;
                        mouseDistance = -startMovement + stop;
                        break;
                }
            } else
                mouseDistance = null;
        });
        document.addEventListener('mouseup', function (event) {
            //fine click
            if (flagMouse) {
                document.querySelector('[camera]').setAttribute('look-controls', {reverseMouseDrag: true});
                controlElement.setAttribute('material', 'color: ' + oldColorMouse());
                if (mouseAxis !== 'colorRing' && mouseAxis !== 'lightnessRing')
                    document.querySelector('#' + mouseAxis + 'Line').setAttribute('line', {color: oldColorMouse()});
                else {
                    document.querySelector('#' + mouseAxis).object3D.scale.set(1 , 1 , 1);
                    controlElement.setAttribute('material', {color: oldColorMouse()});
                }    
                flagMouse = false;
                mouseDistance = null;
                targetElementOriginalValue = null;
            }
        });
    },
    tick: function () {
        document.getElementsByTagName('body')[0].onkeyup = function (event) {
            if (targetObject.aframeEl !== null) {
                switch (event.which) {
                    case 90: //z: switch control
                        if(targetObject.aframeEl.getAttribute("light").type === "spot")
                            createTransform(controls[(currentControl + 1) % controls.length]);
                        else 
                            createTransform(controls[(currentControl + 1) % (controls.length - 1)]);
                        break;
                }
            }
        };
        if (flagMouse) {
            switch (mouseAxis) {
                case 'distanceSpot':
                    if (controls[currentControl] === 'spot') {
                        newDistance = targetElementOriginalValue.distance + (mouseDistance * 100);
                        if (newDistance < 0) 
                            newDistance = 0.01;                

                        //Modifica parametri luce
                        targetElement.setAttribute('light', {distance: newDistance});
                        
                        targetObject.aframeEl.querySelector("#spotCone").object3D.position.z = -(newDistance / 2);
                        targetObject.aframeEl.querySelector("#spotCone").object3D.scale.set(newDistance, newDistance, newDistance);
                    }
                    break;
                case 'angleSpot':
                    if (controls[currentControl] === 'spot') {
                        let newAngle = targetElementOriginalValue.angle + (mouseDistance * 100);
                        if (newAngle > 89.9) 
                            newAngle = 89.9;
                        if (newAngle < 0) 
                            newAngle = 0.1;
                        //Modifica parametri luce
                        targetElement.setAttribute('light', {angle: newAngle});
                        //Modifica corpo visibile della luce
                        targetObject.aframeEl.querySelector("#spotCone").setAttribute("geometry", {radiusBottom: Math.tan(newAngle * Math.PI / 180)});
                    }
                    break;
                case 'colorRing':
                    if (controls[currentControl] === 'color') {
                        let newColor = (targetElementOriginalValue.hue + (mouseDistance * 100)) % 360;
                        if (newColor < 0)
                            newColor = 360 + newColor;
                        newColor = parseInt(newColor);

                        //Modifica parametri luce
                        targetElement.setAttribute('light', {color: "hsl(" + newColor + ", 100%, " + targetElementOriginalValue.lightness + "%)"});
                        //Modifica corpo visibile della luce
                        document.querySelector("#colorRing").setAttribute("rotation", {z: newColor});
                    }   
                    break;
                case 'lightnessRing':
                    if (controls[currentControl] === 'color') {
                        let newLightness = (targetElementOriginalValue.lightness + (mouseDistance * 100)) % 100;
                        if (newLightness < 0)
                            newLightness = 100 + newLightness;
                        newLightness = parseInt(newLightness);
                        
                        //Modifica parametri luce
                        targetElement.setAttribute('light', {color: "hsl(" + targetElementOriginalValue.hue + ", 100%, " + newLightness + "%)"});
                        //Modifica corpo visibile della luce
                        document.querySelector("#lightnessRing").setAttribute("rotation", {z: (newLightness * 3.6)});
                    }
                    break;
            }
        }
    }


});

