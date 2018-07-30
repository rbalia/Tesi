var lightBodyVisible = false; //Flag che indica se è stata attaccato il corpo visibile alla luce




function appendLightBody(){
    let allLightsEl = document.querySelectorAll("[light]");
    allLightsEl.forEach(function(item){
        switch(item.getAttribute("light").type){
            case "spot":
                item.appendChild(createSpotBody(item));
                break;
            case "directional":
                item.appendChild(createDirectionalBody(item));
                break;
            default:
                item.appendChild(createGenericBody());
                break;
        }
    });
}

function removeLightBody(){
    let allLightsEl = document.querySelectorAll("[light]");
    allLightsEl.forEach(function(item){
            item.removeChild(item.querySelector(".lightBody"));
        });
    if (document.querySelector("#transform") !== null) {
        document.querySelector("a-scene").removeChild(document.querySelector("#transform"));
    }
    if(lightBody !== null){
        lightBody.setAttribute('scale', '1 1 1');
        lightBody.setAttribute('class', 'selectable');
        lightBody = null;
    }
    if(targetObject.aframeEl !== null){
        targetObject.aframeEl = null;
    }
}


function createGenericBody() {
    let visibleSphere = document.createElement('a-sphere');
    visibleSphere.setAttribute('class', 'selectable');
    visibleSphere.setAttribute('geometry', {radius: '0.5'});
    visibleSphere.setAttribute('material', {color: 'blue', opacity: '0.8', shader: 'flat'});
    visibleSphere.setAttribute('selectable', "");
    visibleSphere.setAttribute('trigger-light-editor', "");
    
    let genericBody = document.createElement('a-entity');
    genericBody.setAttribute('class', "lightBody");
    genericBody.appendChild(visibleSphere);
    return genericBody;
}
function createSpotBody(target) {
    //Acquisisco i dati necessari a modellare il cono
    let spotAngle = target.getAttribute("light").angle;
    let distance = target.getAttribute("light").distance;
    if (distance === 0) { //distanza 0 per AFrame vuol dire infinito
        distance = 100;
    }

    //Variabili da impostare sul cono
    let angleRadius = Math.tan(spotAngle * Math.PI / 180); //Tangente dell'angolo

    //creo cono di luce spot
    let spotBody = document.createElement('a-cone');
    spotBody.setAttribute('id', "spotCone");
    spotBody.setAttribute('position', {x: '0', y: '0', z: -(distance / 2)});
    spotBody.setAttribute('rotation', {x: '90', y: '0', z: '0'});
    spotBody.setAttribute('scale', {x: distance, y: distance, z: distance});
    spotBody.setAttribute('geometry', {radiusBottom: angleRadius, radiusTop: 0, openEnded: 'true', //Apertura cono
        segmentsHeight: '1', segmentsRadial: '10'});
    spotBody.setAttribute('material', {color: 'white', opacity: '0.8', shader: 'flat', wireframe: 'true'});

    //attacco il cono al corpo visibile della luce
    let lightBody = createGenericBody();
    lightBody.appendChild(spotBody);
    return lightBody;
}
function createDirectionalBody(target) {

    //Creo il corpo visibile della luce
    let lightBody = createGenericBody();

    //Creo le linee con la direzione della luce
    let dfo = 2; //DistanceFromOrigin: contratto per leggibilità, controlla la distanza delle linee dal centro

    for (i = dfo; i >= -dfo; i = i - (dfo * 2)) {
        for (j = dfo; j >= -dfo; j = j - (dfo * 2)) {
            let directionLine = document.createElement('a-entity');
            directionLine.setAttribute('position', {x: i, y: 0, z: j});
            directionLine.setAttribute('line', {start: {x: 0, y: 10, z: 0},
                end: {x: 0, y: -10, z: 0},
                color: "white"});
            directionLine.setAttribute('material', {shader: 'flat'});


            let directionCone = document.createElement('a-cone');
            directionCone.setAttribute('position', {x: i, y: 0, z: j});
            directionCone.setAttribute('scale', '0.5 0.5 0.5');
            directionCone.setAttribute('rotation', '-180 0 0');
            directionCone.setAttribute('material', {color: 'white', shader: 'flat'});
            directionCone.setAttribute('geometry', {radiusBottom: '0.25'});

            lightBody.appendChild(directionLine);
            lightBody.appendChild(directionCone);
        }
    }
    //Creo una linea centrale
    let centralLine = document.createElement('a-entity');
    centralLine.setAttribute('position', {x: 0, y: 0, z: 0});
    centralLine.setAttribute('line',
            {start: {x: 0, y: 10, z: 0},
                end: {x: 0, y: -10, z: 0},
                color: "white"});
    centralLine.setAttribute('material', {shader: 'flat'});

    lightBody.appendChild(centralLine);


    return lightBody;
}


function createColorEditor(target) {
    //Converto
    let colorStr = target.getAttribute('light').color;
    if (colorStr.indexOf("hsl") !== 0){
        hsl = {hue: 0, saturation: 100, lightness: 100};
        target.setAttribute('light', {color: "hsl(0, 100%, 100%)"});
    }
    else
        hsl = {hue: colorStr.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g).map(function (v) {return +v;})[0],
            saturation: colorStr.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g).map(function (v) {return +v;})[1],
            lightness: colorStr.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g).map(function (v) {return +v;})[2]};

    //Anello Colori
    let colorRing = document.createElement('a-ring');
    colorRing.setAttribute('id', 'colorRing');
    colorRing.setAttribute('class', 'selectable');
    colorRing.setAttribute('rotation', {z: hsl.hue});
    colorRing.setAttribute('material', {src: '#colorWheel', shader: 'flat', color: '#888'/*, depthTest: false*/}); //Visibile anche se collide con altri oggetti
    colorRing.setAttribute('geometry', {radiusInner: '1.3', radiusOuter: '1.45'});
    colorRing.setAttribute('holdable-light', '');
    colorRing.setAttribute('mousecontrol-light', '');

    //Anello luminosità (non intensità)
    let lightnessRing = document.createElement('a-ring');
    lightnessRing.setAttribute('id', 'lightnessRing');
    lightnessRing.setAttribute('class', 'selectable');
    lightnessRing.setAttribute('rotation', {z: hsl.lightness * 3.6});
    lightnessRing.setAttribute('material', {src: '#lightnessWheel', shader: 'flat', color: '#888'/*, depthTest: false*/}); //Visibile anche se collide con altri oggetti
    lightnessRing.setAttribute('geometry', {radiusInner: '0.8', radiusOuter: '0.95'});
    lightnessRing.setAttribute('holdable-light', "");
    lightnessRing.setAttribute('mousecontrol-light', "");
    
    //Indicatore
    let selector = document.createElement('a-triangle');
    selector.setAttribute('position', {x: '1.6', z: '0.01'});
    selector.setAttribute('rotation', {z: '90'});
    selector.setAttribute('scale', "0.3, 0.3, 0.3");
    selector.setAttribute('material', {color: 'white', shader: 'flat'});
    
    let selectorLine = document.createElement('a-entity');
    selectorLine.setAttribute('position', {z: '-0.01'});
    selectorLine.setAttribute('line', {start: {x: 0.9, y: 0, z: 0}, end: {x: 1.7, y: 0, z: 0}, color: 'white'});
    selectorLine.setAttribute('material', {shader: 'flat'});

    //Contenitore componenti Color
    let colorEditor = document.createElement('a-entity');
    colorEditor.setAttribute('id', 'transform');
    colorEditor.setAttribute('position', target.getAttribute('position'));
    colorEditor.setAttribute('look-at', "[camera]");
    colorEditor.appendChild(colorRing);
    colorEditor.appendChild(lightnessRing);
    colorEditor.appendChild(selector);
    colorEditor.appendChild(selectorLine);

    //Restituisci Editor Colori
    return colorEditor;
}

function createSpotEditor(target) {
    let distance = target.getAttribute("light").distance;
    let lineLength = 1;
    //0.25 nella funzione considera la lunghezza del cono 

    //Rende il cono chiuso
    target.querySelector('#spotCone').setAttribute('geometry', {openEnded: 'false'});

    let distanceHandle = document.createElement('a-cone');
    distanceHandle.setAttribute('id', "distanceSpot");
    distanceHandle.setAttribute('class', 'selectable');
    distanceHandle.setAttribute('position', {x: 0, y: 0, z: -(0.25 + lineLength)});
    distanceHandle.setAttribute('scale', '0.5 0.5 0.5');
    distanceHandle.setAttribute('rotation', '-90 0 0');
    distanceHandle.setAttribute('material', {color: 'red', shader: 'flat'});
    distanceHandle.setAttribute('geometry', {radiusBottom: '0.25'});
    distanceHandle.setAttribute('holdable-light', "");
    distanceHandle.setAttribute('mousecontrol-light', "");

    let distanceLine = document.createElement('a-entity');
    distanceLine.setAttribute('id', "distanceSpotLine");
    distanceLine.setAttribute('line', {start: {x: 0, y: 0, z: 0}, end: {x: 0, y: 0, z: -(lineLength)}, color: 'red'});
    distanceLine.setAttribute('material', {shader: 'flat'});

    let angleHandle = document.createElement('a-cone');
    angleHandle.setAttribute('id', "angleSpot");
    angleHandle.setAttribute('class', 'selectable');
    angleHandle.setAttribute('position', {x: (-(0.25 + lineLength)), y: 0, z: 0});
    angleHandle.setAttribute('scale', '0.5 0.5 0.5');
    angleHandle.setAttribute('rotation', '-90 0 90');
    angleHandle.setAttribute('material', {color: 'blue', shader: 'flat'});
    angleHandle.setAttribute('geometry', {radiusBottom: '0.25'});
    angleHandle.setAttribute('holdable-light', "");
    angleHandle.setAttribute('mousecontrol-light', "");

    let angleLine = document.createElement('a-entity');
    angleLine.setAttribute('id', "angleSpotLine");
    angleLine.setAttribute('line', {start: {x: 0, y: 0, z: 0}, end: {x: -lineLength, y: 0, z: 0}, color: 'blue'});
    angleLine.setAttribute('material', {shader: 'flat'});

    let controlsContainer = document.createElement('a-entity');
    controlsContainer.setAttribute('id', "controlsContainer");
    controlsContainer.setAttribute('position', {z: -distance});
    
    //contenitore delle maniglie
    let spotEditor = document.createElement('a-entity');
    spotEditor.setAttribute('id', 'transform');
    spotEditor.setAttribute('position', target.getAttribute('position'));
    spotEditor.setAttribute('rotation', target.getAttribute('rotation'));
    controlsContainer.appendChild(distanceHandle);
    controlsContainer.appendChild(distanceLine);
    controlsContainer.appendChild(angleHandle);
    controlsContainer.appendChild(angleLine);
    spotEditor.appendChild(controlsContainer);

    return spotEditor;
}


//creazione transform (popolamento valori da usare per creare il controllo)
function createTransform(transformType) {
    if (document.querySelector("#transform") !== null) {
        document.querySelector("a-scene").removeChild(document.querySelector("#transform"));
    }

    if (transformType !== 'spot' && transformType !== 'color') {
        let values = null;
        let transform = document.createElement('a-entity');
        transform.setAttribute('id', 'transform');
        document.querySelector('a-scene').appendChild(transform);
        transform.setAttribute('position', targetObject.aframeEl.getAttribute('position'));
        
        createControl(transform, values);
        
    } else if (transformType === 'color') {
        currentControl = 0;
        document.querySelector("a-scene").appendChild(createColorEditor(targetObject.aframeEl));
        transformCreated = true;
        
    } else if (transformType === 'spot' && targetObject.aframeEl.getAttribute("light").type === "spot") {
        currentControl = 1;
        document.querySelector("a-scene").appendChild(createSpotEditor(targetObject.aframeEl));
        transformCreated = true;
    }
}