//true se si è verificato l'evento "intersezione"
var intersection = false;
var transformCreated = false; //flag creazione transform (evita che venga creato più di una volta)
var targetObject = {
    aframeEl: null
}; //oggetto puntato
var controls = ['color', 'spot'];
var currentControl = 0;
var lightBody = null; //corpo visibile della luce in manipolazione

//mano selezionata tramite componente
function selectedHand(hand) {
    let hands = document.querySelectorAll('[leap-hand]');
    if (hands) {
        for (let i = 0; i < hands.length; i++)
            if (hands[i].components['leap-hand'] && hands[i].components['leap-hand'].attrValue.hand === hand)
                return hands[i];
    }
}

//riconoscimento posa
function gestureRecognizer(hand) {
    //palmo verso l'alto, due dita estese e tre no (pollice, indice estese)
    return (hand && hand.palmNormal[1] >= 0 && hand.pointables[0].extended && hand.pointables[1].extended && (!hand.pointables[2].extended) && (!hand.pointables[3].extended) && (!hand.pointables[4].extended));
}

//mano valida con l'array delle dita popolato
function validHand(hand) {
    return (hand && hand.pointables.length !== 0);
}

AFRAME.registerComponent('intersect-light', {
    //raycaster (dipendenza dal componente a-frame)
    dependencies: ['raycaster'],
    schema: {
        //mano da utilizzare per il raggio
        hand: {type: 'string', default: 'right', oneOf: ['left', 'right']},
        //controllo da gestire per l'oggetto selezionato
        control: {type: 'string', default: 'color', oneOf: ['color', 'spot']},
        tag: {type: 'string', default: 'selectable'}
    },

    init: function () {
        switch (this.data.control) {
            case 'color':
                currentControl = 0;
                break;
            case 'spot':
                currentControl = 1;
                break;
        }
        this.el.setAttribute('raycaster', {
            showLine: false,
            //evitare collisioni con la camera o con il raggio stesso
            near: 0.05,
            //lunghezza del raggio
            far: 0.05
        });
        //event listener: il raggio ha intersecato qualcosa
        //nel momento in cui un oggetto viene intersecato dal raggio, viene creato un percorso che parte dalla posizione
        //dell'oggetto e arriva alla posizione della camera (posizione dell'utente) e l'oggetto intersecato segue questo
        //percorso
        this.el.addEventListener('raycaster-intersection', this.raycasterIntersection.bind(this));
        this.el.addEventListener('raycaster-intersection-cleared', function () {
            intersection = false;
        });
    },

    tick: function () {
        let cameraPosition = document.querySelector('[camera]').getAttribute('position');
        let aframeHand = selectedHand(this.data.hand);
        let hand = null;
        if (aframeHand)
            hand = aframeHand.components['leap-hand'].getHand();
        //informazioni LeapMotion SDK
        if (validHand(hand)) {
            //posizione del palmo e riconoscimento gesto
            if (gestureRecognizer(hand)) {
                //hand raycaster
                let origin = aframeHand.components['leap-hand'].intersector.raycaster.ray.origin;
                let relativeOriginPosition = origin.clone();
                //document.querySelector('[camera]').components['camera'].el.object3D.updateMatrixWorld();
                document.querySelector('[camera]').components['camera'].el.object3D.worldToLocal(relativeOriginPosition);
                //modifica del raycaster del componente con posizione della mano (coincide con la mesh)
                this.el.setAttribute('raycaster', {
                    showLine: false,
                    origin: relativeOriginPosition,
                    far: 5
                });
                //percorso meshline relativo
                let path = relativeOriginPosition.x + ' ' + relativeOriginPosition.y + ' ' + relativeOriginPosition.z + ', ' + relativeOriginPosition.x + ' ' + relativeOriginPosition.y + ' ' + (relativeOriginPosition.z - 5);
                if (intersection) {
                    this.el.setAttribute('meshline', {
                        lineWidth: 20,
                        path: path,
                        color: '#74BEC1',
                        lineWidthStyler: '1 - p'
                    });
                } else {
                    this.el.setAttribute('meshline', {
                        lineWidth: 20,
                        path: path,
                        color: '#FFFFFF',
                        lineWidthStyler: '1 - p'
                    });
                }
            } else {
                this.el.removeAttribute('meshline');
                this.el.setAttribute('raycaster', {
                    showLine: false,
                    origin: 0.05,
                    far: 0.05
                });
            }
        }
        //RESPONSABILE DELLA SCALATURA
        let transform = document.querySelector('#transform');
        if (transform !== null) { //non vale per editor Spot
            //scala il transform in base alla distanza
            let transformPosition = transform.object3D.position;
            
            if (controls[currentControl] === "color"){
                let distance = new THREE.Vector3(cameraPosition.x, cameraPosition.y, cameraPosition.z).distanceTo(new THREE.Vector3(transformPosition.x, transformPosition.y, (transformPosition.z)));
                //transform.setAttribute('scale', { x:(distance/3), y: (distance/3), z: (distance/3)}); 
                transform.object3D.scale.set((distance/3), (distance/3), (distance/3));
            } else if(controls[currentControl] === "spot"){
                //posizione assoluta dei controlli alla fine del cono di luce
                let controlsPosition = document.querySelector('#controlsContainer').object3D.getWorldPosition();
                let lightDistance = targetObject.aframeEl.getAttribute('light').distance;
                let distance = new THREE.Vector3(cameraPosition.x, cameraPosition.y, cameraPosition.z).distanceTo(new THREE.Vector3(controlsPosition.x, controlsPosition.y, controlsPosition.z));
                transform.setAttribute('scale', { x:(distance/3), y: (distance/3), z: (distance/3)});
                //document.querySelector('#controlsContainer').setAttribute("position" , {z: -lightDistance/(distance/3)});  
                document.querySelector('#controlsContainer').object3D.position.z = -lightDistance/(distance/3);
            }
            if(lightBody !== null){
                let distance = new THREE.Vector3(cameraPosition.x, cameraPosition.y, cameraPosition.z).distanceTo(new THREE.Vector3(transformPosition.x, transformPosition.y, (transformPosition.z)));
                lightBody.setAttribute('scale', { x:(distance/3), y: (distance/3), z: (distance/3)});
            }
        }   // SCALATURA //

    },

    raycasterIntersection: function (event) {
        //oggetto intersecato
        let intersectedObject = event.detail.els[0];
         
        if(intersectedObject !== lightBody || lightBody === null){
        //mano visibile
        let isVisible = selectedHand(event.target.components['intersect-light'].data.hand).components['leap-hand'].isVisible;
        if (isVisible) {
            if (intersectedObject.getAttribute(this.data.tag) !== null) {
                intersection = true;

                if(lightBody !== null){
                    if (lightBody !== intersectedObject){
                        lightBody.setAttribute('scale', '1 1 1');
                        lightBody.setAttribute('class', 'selectable');
                        lightBody = intersectedObject;
                        lightBody.removeAttribute('class');
                    }
                }else {
                    lightBody = intersectedObject;
                    lightBody.removeAttribute("class");
                }
                
                targetObject.aframeEl = intersectedObject.parentEl.parentEl; 
                createTransform(controls[currentControl]);
                transformCreated = true;
                
            } else
                intersection = false;
        }
    }
    }
});
