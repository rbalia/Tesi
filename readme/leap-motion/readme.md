#Leap-Motion controls system
A-Frame VR components to allow users to select lights in scene with a pose recognition, and manipulate them using transform controls.

# intersect-light component
[A-Frame VR](https://aframe.io/) component to select the light bodies in scene and open the light editor.

This component uses [A-Frame raycaster](https://github.com/aframevr/aframe/blob/master/docs/components/raycaster.md)
and [aframe-leap-hands](https://github.com/openleap/aframe-leap-hands/blob/master/README.md)
 to allow users to select, with a pose recognition, marked objects in scene and attach transform controls.

The recognized pose is thumb and index extended with palm upwards.
 
When the pose is detected, this component draws a ray using [aframe-meshline](https://github.com/andreasplesch/aframe-meshline-component)
that intersects the pointed object.

![Example1](https://github.com/Frac7/Tirocinio/blob/master/readme/intersect-and-manipulate/gif1.gif)
 
![Example2](https://github.com/Frac7/Tirocinio/blob/master/readme/intersect-and-manipulate/gif.gif)
 
## intersect-light properties
| Property | Default    | Description                                                                     |
|----------|------------|---------------------------------------------------------------------------------|
| hand     | right      | Hand that triggers pose recognition, one of `left`, `right`                     |
| control  | color      | Control type attached to the selected object, one of `color`, `spot`            |
| tag      | selectable | Tag used to mark selectable objects                                             |

# holdable-light component
[A-Frame VR](https://aframe.io/) component to select editor handles.

This component uses [aframe-leap-hands](https://github.com/openleap/aframe-leap-hands/blob/master/README.md)
 to allow users to select the editor handles closing the hand around them, and manipulate the light properties.
To work properly is necessary to specify on leap-hand component which marked objects are selectable using the property "holdSelector: [holdable-light]". 

## Leap-Motion controls system Usage
```html
<head>
    <title>Hello, WebVR! - A-Frame</title>
    <script src="https://aframe.io/releases/0.8.0/aframe.min.js"></script>
    <script src="script/intersect-light.js"></script>
    <script src="script/holdable-light.js"></script>

    <!--Other required components-->
    <script src="script/bodies-and-editors.js"></script>
    <script src="https://unpkg.com/aframe-look-at-component@0.5.1/dist/aframe-look-at-component.min.js"></script>
</head>
<body>
    <a-scene>
    <!-- Set hands and control as children of camera !-->
        <a-entity camera="near: 0.01" look-controls position="0 1.5 0">
            <a-entity leap-hand="hand: left; holdDistance: 0.5; holdSelector: [holdable-light]"></a-entity>
            <a-entity leap-hand="hand: right; holdDistance: 0.5; holdSelector: [holdable-light]"></a-entity>
            <a-entity intersect-light></a-entity>
        </a-entity>
    </a-scene>
</body>
```
### More infos
1 - Main methods are on bodies-and-editors.js file, which are used by all the components. The file includes the methods to
create the editor, light bodies, append and remove entities in scene



