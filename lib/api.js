const fetch = require("node-fetch-commonjs");
const path = require("path");
const { Storage } = require("./storage.js");

function Api(options) {
    if (options) {
        Api.root = options.root || "./data";
        Api.base = options.base;
        let uid = Math.random().toString(16).slice(2);

        const metaStorage = Storage.getInstance(path.join(Api.root, "api"), "meta_api");
        if (metaStorage.data) {
            let meta = metaStorage.data;
            if (!Array.isArray(meta)) meta = [];
            let api = null;
            for (let _api of meta) {
                if (_api.base === Api.base) {
                    if (_api.expire && new Date() >= new Date(_api.expire)) continue;
                    api = _api;
                    break;
                }
            }

            if (api) {
                uid = api.uid;
            } else {
                meta.push({
                    uid,
                    base: Api.base,
                    expire: options.expire || false
                })
                metaStorage.flush(meta);
            }
        }

        Api.uid = uid;
        Api.storage = Storage.getInstance(path.join(Api.root, "api"), Api.uid);
        Api.cache = Api.storage.data || {};
        
        return Api;
    }
}

Api.cacheHandler = function() {};
Api.cacheHandler.save = function() {
    let item = Api.cache;
    if (arguments && arguments.length > 1) {
        for (let i = 0; i < arguments.length; i++) {
            const arg = arguments[i];
            if(i === arguments.length - 2) {
                item[arg] = arguments[i + 1];
                break;
            }
            if (!item.hasOwnProperty(arg)) {
                item[arg] = {};
            }
            item = item[arg];
        }
        Api.storage.flush(Api.cache);
        return item
    } else {
        throw new Error("cacheHandler.save: Function: expects 2 or more arguments")
    }
};

Api.cacheHandler.get = function() {
    if (arguments && arguments.length > 0) {
        let item = Api.cache;
        for (let i = 0; i < arguments.length; i++) {
            const arg = arguments[i];
            if(i === arguments.length - 1) {
                if(!item || !item.hasOwnProperty(arg)) return null;
                return item[arg]

            }
            if (!item) return item;
            if(!item.hasOwnProperty(arg)) return null;
            item = item[arg];
        }
        return item;
    }
    return null;
}

Api.get = async function(url) {
    const url = Api.base + url;
    const cached = Api.cacheHandler.get(url);
    if (cached) return cached;
    if(!Number.isNaN(Number.parseInt(id))) {
        try {
            const item = await fetch(url);
            console.log("API has fetched !")
            if(item) {
                Api.cacheHandler.save(url, await item.json());
            }
            return Api.cacheHandler.get(url);
        } catch(e) {
            throw new Error(e);
        }
    }
}
exports.Api = Api;