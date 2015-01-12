var GAME_PRODUCTION_SERVER_URL = "http://idiomland.com";
var GAME_PRODUCTION_SERVER_URL_REGEX =
    /https?:\/\/(www\.)?idiomland\.com.*/;

function RunWebInitScriptReleaseConf() {
    // === Yandex.Metrika counter ===
    (function (d, w, c) {
        (w[c] = w[c] || []).push(function() {
            try {
                w.yaCounter25287059 = new Ya.Metrika({id:25287059,
                    webvisor:true,
                    clickmap:true,
                    trackLinks:true,
                    accurateTrackBounce:true
                });
            } catch(e) { }
        });

        var n = d.getElementsByTagName("script")[0],
    s = d.createElement("script"),
    f = function () { n.parentNode.insertBefore(s, n); };
    s.type = "text/javascript";
    s.async = true;
    s.src = (d.location.protocol == "https:" ? "https:" : "http:") + "//mc.yandex.ru/metrika/watch.js";

    if (w.opera == "[object Opera]") {
        d.addEventListener("DOMContentLoaded", f, false);
    } else { f(); }
    })(document, window, "yandex_metrika_callbacks");
}

function RunWebInitScriptsDebugConf() {}

(function RunWebInitScripts() {
    if (document.URL.match(GAME_PRODUCTION_SERVER_URL_REGEX)) {
        RunWebInitScriptsReleaseConf();
    } else {
        RunWebInitScriptsDebugConf();
    }   
})();
