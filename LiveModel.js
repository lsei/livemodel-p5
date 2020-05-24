/**
 * LiveModel
 * A helper class that wraps p5.js's loadModel in order to provide live updates to the client when the local file is updated.
 *
 * Usage:
 *
 * let myLiveModel;
 *
 * function preload() {
 *      myLiveModel = new LiveModel("model.obj");
 * }
 *
 * function draw() {
 *      const myModel = myLiveModel.getModel();
 *      // ...
 *      model(myModel);
 * }
 */
class LiveModel {
    // TODO: websocket host parameter
    constructor(file, options) {
        this.ws = null;
        options = options || {};
        this.options = {
            debug: options.debug,
            baseDir: options.baseDir || "models",
        };

        console.log(this.options);

        this.filePath = this.options.baseDir + "/" + file;
        this.model = loadModel(this.filePath);

        this._parseFilename(this.filePath);

        // Connect to websocket server
        this._listen(file);
    }

    _log() {
        if (this.options.debug) {
            const args = Array.prototype.concat.apply(["[LiveModel]"], arguments);
            // args.unshift("[LiveModel]");
            console.log.apply(this, args);
        }
    }

    // Validate the file name and type
    _parseFilename(filePath) {
        const parts = filePath.split(".");
        this.extension = parts[parts.length - 1];
        this._log("File extension:", this.extension);
    }

    _listen(filePath) {
        this._log("Starting websocket.");
        // TODO: disconnect handler (try to reconnect?)
        try {
            this.ws = new WebSocket("ws://localhost:5001/" + filePath);
        } catch (e) {
            console.error("Could not connect to websocket host");
            console.error(e);
        }

        if (!this.ws) {
            return;
        }

        const that = this;
        this.ws.addEventListener("message", (e) => {
            if (e.type == "message" && e.data.indexOf(`"fileupdated"`) > -1) {
                that._handleMessage(e.data);
            }
        });
    }

    // Handle the websocket message
    _handleMessage(msg) {
        let data = {};
        try {
            data = JSON.parse(msg);
        } catch (e) {
            console.log("[LiveModel] message was not json: ", msg);
        }

        // TODO: if fileupdated ...

        // Trigger a reload of the mode. We have to add the nocache query parameter so that p5 will refetch the file from source. We also need to make sure the filename ends in .obj so that loadModel will accept it.
        this.model = loadModel(this.filePath + "?nocache=" + Date.now() + "." + this.extension);
    }

    // getModel returns the most recent instance of the p5.Model. We cache the model in the class instance so that it can be called in each render cycle without any performance overhead
    getModel() {
        return this.model;
    }
}
