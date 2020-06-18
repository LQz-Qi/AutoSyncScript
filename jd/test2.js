const $hammer = (() => {
    const isRequest = "undefined" != typeof $request,
        isSurge = "undefined" != typeof $httpClient,
        isQuanX = "undefined" != typeof $task;

    const log = (...n) => { for (let i in n) console.log(n[i]) };
    const alert = (title, body = "", subtitle = "", link = "") => {
        if (isSurge) return $notification.post(title, subtitle, body, link);
        if (isQuanX) return $notify(title, subtitle, (link&&!body ? link : body));
        log('==============📣系统通知📣==============');
        log("title:", title, "subtitle:", subtitle, "body:", body, "link:", link);
    };
    const read = key => {
        if (isSurge) return $persistentStore.read(key);
        if (isQuanX) return $prefs.valueForKey(key);
    },
        write = (key, val) => {
            if (isSurge) return $persistentStore.write(key, val);
            if (isQuanX) return $prefs.setValueForKey(key, val);
        };
    const request = (method, params, callback) => {
        /**
         * callback(
         *      error, 
         *      {status: <int>, headers: <object>, body: <string>} | ""
         * )
         */
        if (typeof params == "string") {
            params = { url: params };
        }
        const options = {
            url: params.url,
            body: params.data
        };
        method = method.toUpperCase();
        
        const errlog = err => {
            log("-s- Catch the request error -s-");
            log(method + " " + options.url, err);
            log("-e- Catch the request error -e-");
        };

        if (isSurge) {
            if (params.header) {
                options.header = params.header;
            }
            const _runner = method == "GET" ? $httpClient.get : $httpClient.post;
            return _runner(options, (error, response, body) => {
                if(error == null || error == ""){
                    response.body = body;
                    callback("", response);
                }else{
                    errlog(error);
                    callback(error, "");
                }
            });
        }
        if (isQuanX) {
            options.method = method;
            if (params.header) {
                options.headers = params.header;
            }
            if (options.method == "GET" && typeof options == "string") {
                options = {
                    url: options
                };
            }
            $task.fetch(options).then(
                response => {
                    log("run in then.response");// drop
                    response.code = response.statusCode;
                    delete response.statusCode;
                    callback("", response);
                }, 
                reason => {
                    log("run in then.reason");// drop
                    errlog(reason.error);
                    callback(reason.error, "");
                }
            );
        }
    };
    const done = (value = {}) => {
        if (isQuanX) return isRequest ? $done(value) : null;
        if (isSurge) return isRequest ? $done(value) : $done();
    };
    return { isRequest, isSurge, isQuanX, log, alert, read, write, request, done };
})();




const options = {
    url: `https://www.baidu.com/s?wd=loon`,
    header: {
        Cookie: "cookie",
        UserAgent: `Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1`,
    },
    data: ""
};

$hammer.request('GET', options, (error, response) => {
    console.log("env:" + ($hammer.isQuanX ? "Quanx" : "Loon"))
    $hammer.log("resp:", response, "err:", error)
})

$hammer.done();