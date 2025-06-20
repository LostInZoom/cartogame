import device from "current-device";

import Application from "./game/application.js";
import { ajaxGet, ajaxPost } from "./utils/ajax.js";

async function register(callback) {
    callback = callback || function() {};

    function getInformation() {
        return {
            userAgent: navigator.userAgent,
            device: device.type,
            orientation: device.orientation,
            os: device.os,
            width: window.innerWidth,
            height: window.innerHeight,
        }
    }

    let sessionId = localStorage.getItem('session');
    if (sessionId) {
        ajaxPost('verification/', { sessionId: sessionId }, (data) => {
            if (data.isPresent) {
                callback(sessionId);
            } else {
                ajaxPost('registration/', getInformation(), (data) => {
                    localStorage.setItem('session', data.sessionId);
                    callback(data.sessionId);
                });
            }
        });
    } else {
        ajaxPost('registration/', getInformation(), (data) => {
            localStorage.setItem('session', data.sessionId);
            callback(data.sessionId);
        });
    }
}

window.addEventListener("DOMContentLoaded", () => {
    async function activatePersistence() {
        if (navigator.storage && navigator.storage.persist) {
            await navigator.storage.persist();
        }
    }
    activatePersistence();

    register((sessionId) => {
        ajaxGet('configuration/', (params) => {
            params.session = sessionId;
            new Application(params);
        });
    });
});