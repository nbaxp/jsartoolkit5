window.ARThree = function (video, canvas, config) {
    this.video = video;
    this.canvas = canvas;
    this.config = config || {
        maxSize: 320,
        hdConstraints: {
            audio: false,
            video: {
                facingMode: "environment"
            }
        }
    };
    this.log('version', ARThree.version);
}
//version
ARThree.version = "0.1";
//debug
ARThree.debug = false;
//
ARThree.log = function (k, v) {
    if (ARThree.debug) {
        console.log(k + (v ? (':' + v) : ''));
    }
};
ARThree.prototype.log = ARThree.log;
//isMobile
ARThree.prototype.isMobile = function () {
    return /Android|mobile|iPad|iPhone/i.test(navigator.userAgent);
}
//resize
ARThree.prototype.resize = function () {
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    var videoWidth = this.video.width;
    var videoHeight = this.video.height;
    if (!this.isMobile()) {
        if (screenWidth / screenHeight > videoWidth / videoHeight) {
            canvas.width = videoWidth / videoHeight * screenHeight;
        }
        else {
            canvas.height = videoHeight / videoWidth * screenWidth;
        }
    }
    else {
        if (screenWidth / screenHeight > videoWidth / videoHeight) {//portrait
            if (videoWidth > videoHeight) {//landscape start
                canvas.width = videoWidth / videoHeight * screenHeight;
            }
            else {//portrait start
                canvas.width = videoHeight / videoWidth * screenHeight;
            }
        }
        else {//landscape
            if (videoWidth > videoHeight) {//landscape start 
                canvas.height = videoWidth / videoHeight * screenWidth;
            }
            else {//portrait start
                canvas.height = videoHeight / videoWidth * screenWidth;
            }
        }
    }
    if (screenWidth / screenHeight > videoWidth / videoHeight) {
        canvas.height = screenHeight;
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
        canvas.style.top = 0;
        canvas.style.left = (screenWidth - canvas.clientWidth) / 2 + 'px';
    }
    else {
        canvas.width = screenWidth;
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
        canvas.style.top = (screenHeight - canvas.clientHeight) / 2 + 'px';
        canvas.style.left = 0;
    }
}
//orientationchange
ARThree.prototype.orientationchange = function () {
    document.body.className = window.orientation === 0 ? 'portrait' : 'landscape';
    if (window.artoolkit && this.arController) {
        if (window.orientation === 0) {
            this.arController.orientation = 'portrait';
            this.arController.videoWidth = video.height;
            this.arController.videoHeight = video.width;
        }
        else {
            this.arController.orientation = 'landscape';
            this.arController.videoWidth = video.videoWidthStart;
            this.arController.videoHeight = video.videoHeightStart;
        }
    }
    if (window.THREE) {
        if (this.renderer) {
            if (window.orientation === 0) {
                this.renderer.setSize(this.canvas.height, this.canvas.width);
            }
            else {
                this.renderer.setSize(this.canvas.width, this.canvas.height);
            }
        }
        if (this.plane) {
            this.plane.rotation.z = window.orientation === 0 ? Math.PI / 2 : 0;
        }
    }
}
//onloadedmetadata
ARThree.prototype.onloadedmetadata = function (e) {
    video.width = e.srcElement.videoWidth;
    video.height = e.srcElement.videoHeight;
    parent.videoWidthStart = e.srcElement.videoWidth;
    parent.videoHeightStart = e.srcElement.videoHeight;
    window.addEventListener("orientationchange", this.orientationchange.bind(this), false);
    this.orientationchange();
    window.addEventListener("resize", this.resize.bind(this), false);
    this.resize();
}
//getUserMediaSuccessCallback
ARThree.prototype.getUserMediaSuccessCallback = function (stream) {
    video.srcObject = stream;
    video.onloadedmetadata = this.onloadedmetadata.bind(this);
    video.play().then(this.loadAR());
}
//start
ARThree.prototype.start = function () {
    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;
    if (navigator.getUserMedia) {
        navigator.getUserMedia(this.config.hdConstraints, this.getUserMediaSuccessCallback.bind(this), function () {
            ARThree.log("The following error occurred", err.name);
        });
    } else {
        ARThree.log("getUserMedia not supported");
    }
};
//AR
//loadAR
ARThree.prototype.loadAR = function () {
    if (!window.artoolkit) {
        this.log('not found window.artoolkit');
        return;
    }
    var parent = this;
    var profile = "/examples/Data/camera_para-iPhone 5 rear 640x480 1.0m.dat";
    var cameraParam = new ARCameraParam(profile, function () {
        parent.arCameraParamOnLoad(this)
    }, function (e) {
        ARController._teardownVideo(parent.video);
        parent.log(e);
    });
}
//ARCameraParamOnLoad
ARThree.prototype.arCameraParamOnLoad = function (cameraParam) {
    var maxSize = this.config.maxSize;
    var f = maxSize / Math.max(this.video.videoWidth, this.video.videoHeight);
    var w = f * this.video.videoWidth;
    var h = f * this.video.videoHeight;
    if (this.video.videoWidth < this.video.videoHeight) {
        var tmp = w;
        w = h;
        h = tmp;
    }
    this.arController = new ARController(w, h, cameraParam);
    this.arController.image = video;
    this.orientationchange();
    this.arControllerSetup();
    this.createThreeScene();
    this.startRenderer();
}
//arControllerSetup.
ARThree.prototype.arControllerSetup = function (cameraParam) {
    this.arController.addEventListener('getMarker', function (ev) {
        var marker = ev.data.marker;
        var obj;
        if (ev.data.type === artoolkit.PATTERN_MARKER) {
            obj = this.threePatternMarkers[marker.idPatt];

        } else if (ev.data.type === artoolkit.BARCODE_MARKER) {
            obj = this.threeBarcodeMarkers[marker.idMatrix];

        }
        if (obj) {
            setProjectionMatrix(obj.matrix, ev.data.matrixGL_RH);
            obj.visible = true;
        }
        model = obj;
    });
    this.arController.addEventListener('getNFTMarker', function (ev) {
        var marker = ev.data.marker;
        var obj;

        console.log('Found NFT marker', marker, obj);

        obj = this.threeNFTMarkers[marker.id];

        if (obj) {
            obj.matrix.fromArray(ev.data.matrixGL_RH);
            obj.visible = true;
        }
    });
    this.arController.addEventListener('lostNFTMarker', function (ev) {
        var marker = ev.data.marker;
        var obj;

        console.log('Lost NFT marker', marker, obj);

        obj = this.threeNFTMarkers[marker.id];

        if (obj) {
            obj.matrix.fromArray(ev.data.matrixGL_RH);

            // TODO make it maybe more stable, making the object not visible
            // only after some ms of lost tracking?
            obj.visible = false;
        }
    });
    this.arController.addEventListener('getMultiMarker', function (ev) {
        var obj = this.threeMultiMarkers[ev.data.multiMarkerId];
        if (obj) {
            obj.matrix.fromArray(ev.data.matrixGL_RH);
            obj.visible = true;
        }
    });
    this.arController.addEventListener('getMultiMarkerSub', function (ev) {
        var marker = ev.data.multiMarkerId;
        var subMarkerID = ev.data.markerIndex;
        var subMarker = ev.data.marker;
        var obj = this.threeMultiMarkers[marker];
        if (obj && obj.markers && obj.markers[subMarkerID]) {
            var sub = obj.markers[subMarkerID];
            sub.matrix.fromArray(ev.data.matrixGL_RH);
            sub.visible = (subMarker.visible >= 0);
        }
    });
    this.arController.threePatternMarkers = {};
    this.arController.threeNFTMarkers = {};
    this.arController.threeBarcodeMarkers = {};
    this.arController.threeMultiMarkers = {};

    for (var i in self.threePatternMarkers) {
        self.threePatternMarkers[i].visible = false;
    }
    for (var i in self.threeNFTMarkers) {
        self.threeNFTMarkers[i].visible = false;
    }
    for (var i in self.threeBarcodeMarkers) {
        self.threeBarcodeMarkers[i].visible = false;
    }
    for (var i in self.threeMultiMarkers) {
        self.threeMultiMarkers[i].visible = false;
        for (var j = 0; j < self.threeMultiMarkers[i].markers.length; j++) {
            if (self.threeMultiMarkers[i].markers[j]) {
                self.threeMultiMarkers[i].markers[j].visible = false;
            }
        }
    }
    this.arController.process(this.video);
    this.log('arController.process');
}
////Three
ARThree.prototype.createThreeScene = function () {
    var videoTex = new THREE.Texture(this.video);

    videoTex.minFilter = THREE.LinearFilter;
    videoTex.flipY = false;

    // Then create a plane textured with the video.
    this.plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2, 2),
        new THREE.MeshBasicMaterial({ map: videoTex, side: THREE.DoubleSide })
    );

    // The video plane shouldn't care about the z-buffer.
    this.plane.material.depthTest = false;
    this.plane.material.depthWrite = false;

    // Create a camera and a scene for the video plane and
    // add the camera and the video plane to the scene.
    var videoCamera = new THREE.OrthographicCamera(-1, 1, -1, 1, -1, 1);
    var videoScene = new THREE.Scene();
    videoScene.add(this.plane);
    videoScene.add(videoCamera);

    if (this.arController.orientation === 'portrait') {
        plane.rotation.z = Math.PI / 2;
    }

    this.scene = new THREE.Scene();
    var camera = new THREE.Camera();
    camera.matrixAutoUpdate = false;
    this.setProjectionMatrix(camera.projectionMatrix, this.arController.getCameraMatrix());
    this.scene.add(camera);
}
//setProjectionMatrix
ARThree.prototype.setProjectionMatrix = function (projectionMatrix, value) {
    if (typeof projectionMatrix.elements.set === "function") {
        projectionMatrix.elements.set(value);
    } else {
        projectionMatrix.elements = [].slice.call(value);
    }
};
ARThree.prototype.startRenderer = function () {
    this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);

    var w = this.canvas.width;
    var h = this.canvas.height;
    if (window.orientation === 0) {
        this.renderer.setSize(h, w);
    } else {
        this.renderer.setSize(w, h);
        if (this.isMobile()) {
            this.renderer.setSize(w, h);
        }
    }
    this.loadMarker();
    var parent = this;
    var tick = function () {
        parent.scene.process();
        parent.scene.renderOn(this.renderer);
        requestAnimationFrame(tick);
    };
    tick();
}