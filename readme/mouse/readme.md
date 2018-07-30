#Mouse controls system
A-Frame VR components to allow users to select lights in scene with a pose recognition, and manipulate them using transform controls.

# mouse-control component
[A-Frame VR](https://aframe.io/) component to select the light bodies in scene and manipulate light properties.

This component uses [A-Frame raycaster](https://github.com/aframevr/aframe/blob/master/docs/components/raycaster.md)
which originates from the cursor, and allow users to select with mouse click a light body and manipulate light properties.

![Example1](https://github.com/Frac7/Tirocinio/blob/master/readme/intersect-and-manipulate/gif1.gif)
 
![Example2](https://github.com/Frac7/Tirocinio/blob/master/readme/intersect-and-manipulate/gif.gif)

## Leap-Motion controls system Usage
```html
<head>
    <title>Hello, WebVR! - A-Frame</title>
    <script src="https://aframe.io/releases/0.8.0/aframe.min.js"></script>
    <script src="script/mousecontrol-light.js"></script>

    <!--Other required components-->
    <script src="script/bodies-and-editors.js"></script>
    <script src="https://unpkg.com/aframe-look-at-component@0.5.1/dist/aframe-look-at-component.min.js"></script>
</head>
<body>
    <a-scene inspector leap="vr: false" cursor="rayOrigin: mouse" raycaster="objects: .selectable">
    <!-- Set hands and control as children of camera !-->
        <a-camera>
        </a-camera>
    </a-scene>
</body>
```
### More...
[More examples on Glitch](https://mycomponent-examples.glitch.me/)


