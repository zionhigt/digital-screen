const fs = require("fs");
const path = require("path");

class Storage {
    static cache = {};
    static getInstance(root, name, ext=".json") {
        if (!Storage.cache.hasOwnProperty(root)) {
            Storage.cache[root] = {};
        }
        const directory = Storage.cache[root];
        if (directory.hasOwnProperty(name)) return directory[name];
        const instance = new Storage(root, name, ext);
        directory[name] = instance;
        return directory[name];
    }

    constructor(root, name, ext) {
        this.root = root;
        if (!this.initRoot()) {
            throw new Error("Data root directory cannot be initializing !")
        }
        this.name = name;
        this.ext = ext;
        this.path = path.join(root, name + ext);
        if (!this.prepareFile()) {
            throw new Error("Data file cannot be initializing !")
        }
        this.load();
    }

    initRoot() {
        if(!this.root) {
            this.root = "./";
        }
        this.root = path.join(__dirname, "../", this.root);
        if (!fs.existsSync(this.root)) {
            try {
                fs.mkdirSync(this.root, { recursive: true });
                console.log("New created '" + this.root + "'");
                return true;

            } catch(err) {
                console.error(err);
                return false;
            }
        }else {
            console.log("Already initialized");
            return true;
        }
    }

    prepareFile() {
        if(this.path) {
            if(!fs.existsSync(this.path)) {
                const defaultContent = this.ext === ".json" ? JSON.stringify({}) : "";
                fs.writeFileSync(this.path, defaultContent);
            }
        } else {
            return false;
        }
        return fs.existsSync(this.path);

    }

    load() {
        try {
            const content = fs.readFileSync(this.path);
            if (this.ext === ".json") {
                this.data = JSON.parse(content);
            } else {
                this.data = content;
            }
            this.ready = true;
        } catch(err) {
            console.error("Load ERROR !");
            console.error(err);
            this.ready = false;
        }
    }

    flush(data) {
        if (!data) data = this.data;
        if (this.ready && this.data && this.path) {
            try {
                data = this.ext === ".json" ? JSON.stringify(data) : data;
                fs.writeFileSync(this.path, data);
            } catch(err) {
                console.error("Flush ERROR !");
                console.error(err);
            }
        }
        return this.load();
    }
}



exports.Storage = Storage;