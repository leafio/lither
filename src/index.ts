export type LitherConfig = {
    query?:
    | Record<
        string,
        string | number | boolean | string[] | number[] | null | undefined
    >
    | URLSearchParams;
    params?: Record<string, string | number>;
    responseHandler?: "arrayBuffer" | "blob" | "formData" | "json" | "text";
    timeout?: number;
    /////
    signal?: AbortSignal;
    method?:
    | "get"
    | "GET"
    | "delete"
    | "DELETE"
    | "head"
    | "HEAD"
    | "options"
    | "OPTIONS"
    | "post"
    | "POST"
    | "put"
    | "PUT"
    | "patch"
    | "PATCH"
    | "purge"
    | "PURGE"
    | "link"
    | "LINK"
    | "unlink"
    | "UNLINK";

    mode?: "cors" | "no-cors" | "same-origin"; // no-cors, *cors, same-origin
    cache?:
    | "default"
    | "no-cache"
    | "reload"
    | "force-cache"
    | "only-if-cached"; // *default, no-cache, reload, force-cache, only-if-cached
    credentials?: "include" | "same-origin" | "omit"; // include, *same-origin, omit
    headers?: Headers;
    redirect?: "manual" | "follow" | "error"; // manual, *follow, error
    referrerPolicy?:
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url"; // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body?: any; // body data type must match "Content-Type" header
    integrity?: string;
};

export type litherResponse = {
    ok?: boolean;
    headers?: Headers;
    redirected?: boolean;
    status?: number;
    statusText?: string;
    type?: string;
    url?: string;
    body?: any;
    isTimeout: boolean;
    error?: any;
};

const getUrlPathParams = (url: string) => {
    const urlKeys: string[] = [];
    url.match(/\:([^:\/\d]+)\/?/g)?.forEach((str) => {
        urlKeys.push(str.replace(/\//g, "").replace(/:/g, ""));
    });
    return urlKeys;
};

export function litherFetch<T>(
    url: string,
    config: LitherConfig = {},
    litherInit?: LitherInit
) {
    const CONTENT_TYPE = "Content-Type";
    let parsed_response: litherResponse = { isTimeout: false };

    //初始化 config
    let timeout = litherInit?.timeout;
    let _config: LitherConfig = { ...config, timeout };
    const { beforeRequest, afterResponse } = litherInit || {};
    if (beforeRequest) {
        _config = beforeRequest(_config);
    }
    //abort
    const abortController = new AbortController();
    let outSignal = _config.signal; //外部的signal
    _config.signal = abortController.signal;

    const abortListener = (reason: any) => {
        abortController.abort(reason);
    };
    outSignal?.addEventListener("abort", abortListener);
    //timeout
    let timeoutHandle: number | undefined;
    timeout = _config.timeout;
    if (timeout) {
        timeoutHandle = setTimeout(() => {
            parsed_response.isTimeout = true;
            abortController.abort("timeout");
        }, timeout) as unknown as number;
    }
    const removeTimeout = () => {
        if (timeoutHandle) {
            clearTimeout(timeoutHandle);
            timeoutHandle = undefined;
        }
    };
    const clearEffects = () => {
        removeTimeout();
        outSignal?.removeEventListener("abort", abortListener);
    };

    const handleResponse = (
        response: litherResponse,
        resolve: (value: T | PromiseLike<T>) => void,
        reject: (reason?: any) => void
    ) => {
        if (afterResponse) {
            afterResponse(response, {resolve, reject});
        } else {
            if (response.ok) {
                resolve(response.body);
            }
            reject(response);
        }
    };
    return new Promise<T>((resolve, reject) => {
        //和 url
        let _url = url;
        //处理path params解析类似:id参数
        const urlKeys = getUrlPathParams(url);
        urlKeys.forEach((key) => {
            if (_config.params && _config.params[key]) {
                _url = _url.replace(":" + key, "" + _config.params[key]);
            } else {
                parsed_response.error = "need url path params key:" + key;
                handleResponse(parsed_response, resolve, reject);
            }
        });
        //处理queryString
        if (_config.query) {
            const queryData: string[][] = [];
            Object.entries(_config.query).forEach(([queryKey, queryVal]) => {
                if (Array.isArray(queryVal)) {
                    queryVal.forEach((val) => {
                        queryData.push([queryKey, val]);
                    });
                } else {
                    if (queryVal !== undefined)
                        queryData.push([queryKey, queryVal]);
                }
            });
            const querystring = new URLSearchParams(queryData);
            _url = _url + (_url.includes("?") ? "&" : "?") + querystring;
            _url.replace("&&", "&");
        }

        let baseURL = litherInit?.baseURL;
        if (baseURL && _url.trim().indexOf("http") !== 0) {
            _url =
                baseURL +
                (baseURL[baseURL.length - 1] === "/" ? "" : "/") +
                (_url[0] === "/" ? _url.slice(1) : _url);
        }
        //处理body
        let is_body_Json = false;
        const _body = _config.body;
        if (_body) {
            if (
                !(
                    _body instanceof Blob ||
                    _body instanceof ArrayBuffer ||
                    _body instanceof FormData ||
                    typeof _body === "string"
                )
            ) {
                is_body_Json = true;
                _config.body = JSON.stringify(_body);
            }
        }

        //处理请求头
        const headers = _config.headers || new Headers();
        //处理Authorization
        let auth = litherInit?.auth ? litherInit.auth() : undefined;
        if (auth) {
            if (typeof auth === "string") {
                headers.set("Authorization", auth);
            } else {
                for (const [headerKey, headerVal] of auth.entries()) {
                    headers.set(headerKey, headerVal);
                }
            }
        }
        // //处理json数据
        if (is_body_Json) {
            headers.set(CONTENT_TYPE, "application/json");
        }
        _config.headers = headers;

        //*********************开始Fetch */
        fetch(_url, _config)
            .then((response) => {
                parsed_response = {
                    // bodyUsed: response.bodyUsed,
                    ok: response.ok,
                    headers: response.headers,
                    redirected: response.redirected,
                    status: response.status,
                    statusText: response.statusText,
                    type: response.type,
                    url: response.url,
                    body: "",
                    isTimeout: false,
                };

                if (_config.responseHandler) {
                    return response[_config.responseHandler]();
                } else {
                    let contentType = response.headers.get(CONTENT_TYPE);
                    if (contentType?.includes("json")) {
                        return response.json();
                    }
                    return response.text();
                }
            })
            .then((body) => {
                clearEffects();
                parsed_response = { ...parsed_response, body };
                handleResponse(parsed_response, resolve, reject);
            })
            .catch((error) => {
                clearEffects();
                handleResponse({ ...parsed_response, error }, resolve, reject);
            });
    });
}

export type LitherInit = {
    baseURL?: string;
    timeout?: number;
    auth?: (() => string) | (() => Headers);
    beforeRequest?: (config: LitherConfig) => LitherConfig;
    afterResponse?: (
        response: litherResponse,
        {
			resolve,
			reject,
		}: {
			resolve: (value: any) => void
			reject: (reason?: any) => void
		}
    ) => void;
};

export function createLither(litherInit: LitherInit = {}) {
    const _lither: any = <T>(url: string, config?: LitherConfig) => {
        return litherFetch<T>(url, config, _lither.baseInit ?? litherInit);
    };
    _lither.baseInit = litherInit;
    const request = <T>(url: string, config?: LitherConfig) => {
        return litherFetch<T>(url, config, _lither.baseInit);
    };
    const methods = ["get", "post", "put", "delete", "patch"] as const;
    methods.forEach((method) => {
        _lither[method] = <T>(
            url: string,
            data?: any,
            config?: LitherConfig
        ) => {
            const dataKey = method === "get" ? "query" : "body";
            return request<T>(url, {
                [dataKey]: data,
                method,
                ...config,
            });
        };
    });
    _lither.request = request;
    // _lither.get = <T>(url: string, query?: any, config?: LitherConfig) => {
    //     return request<T>(url, { query: query, ...config });
    // };
    _lither.API = <Url extends string>(url: Url) => {
        // console.log('url', url)
        const _API = {} as any;
        const hasParams = !!getUrlPathParams(url).length;
        methods.forEach((method) => {
            const _method = method.toUpperCase();

            _API[_method] =
                () =>
                    (...args: any) => {
                        let [arg1, arg2] = args;
                        // return request(url, {
                        //     method,
                        //     [dataKey]: !hasParams ? arg1 : arg2,
                        //     params: hasParams ? arg1 : undefined,
                        // });
                        return lither[method](url, !hasParams ? arg1 : arg2, {
                            params: hasParams ? arg1 : undefined,
                        });
                    };
        });
        return _API;
    };

    return _lither as {
        <T>(url: string, config?: LitherConfig): Promise<T>;
        baseInit: LitherInit;
        request: <T>(url: string, config?: LitherConfig) => Promise<T>;
        get: <T>(
            url: string,
            query?:
                | Record<
                    string,
                    | string
                    | number
                    | boolean
                    | string[]
                    | number[]
                    | null
                    | undefined
                >
                | URLSearchParams,
            config?: LitherConfig
        ) => Promise<T>;
        post: <T>(url: string, body?: any, config?: LitherConfig) => Promise<T>;
        put: <T>(url: string, body?: any, config?: LitherConfig) => Promise<T>;
        patch: <T>(
            url: string,
            body?: any,
            config?: LitherConfig
        ) => Promise<T>;
        delete: <T>(
            url: string,
            body?: any,
            config?: LitherConfig
        ) => Promise<T>;
        options: <T>(url: string, config?: LitherConfig) => Promise<T>;
        head: <T>(url: string, config?: LitherConfig) => Promise<T>;
        API: <Url extends string>(
            url: Url
        ) => {
            GET: <Req = undefined, Res = unknown>() => (
                ...arg: [
                    ...OptionParams<{
                        [key in GetUrlKey<Url>]: string | number;
                    }>,
                    ...OptionQuery<Req>
                ]
            ) => Promise<Res>;
            POST: <Req = undefined, Res = unknown>() => (
                ...arg: [
                    ...OptionParams<{
                        [key in GetUrlKey<Url>]: string | number;
                    }>,

                    ...OptionBody<Req>
                ]
            ) => Promise<Res>;
            PATCH: <Req = undefined, Res = unknown>() => (
                ...arg: [
                    ...OptionParams<{
                        [key in GetUrlKey<Url>]: string | number;
                    }>,

                    ...OptionBody<Req>
                ]
            ) => Promise<Res>;
            DELETE: <Req = undefined, Res = unknown>() => (
                ...arg: [
                    ...OptionParams<{
                        [key in GetUrlKey<Url>]: string | number;
                    }>,

                    ...OptionBody<Req>
                ]
            ) => Promise<Res>;
            PUT: <Req = undefined, Res = unknown>() => (
                ...arg: [
                    ...OptionParams<{
                        [key in GetUrlKey<Url>]: string | number;
                    }>,

                    ...OptionBody<Req>
                ]
            ) => Promise<Res>;
        };
    };
}

export const lither = createLither();
type GetUrlKey<Url> = Url extends `${string}/:${infer Key}/${infer Right}`
    ? `${Key}` | GetUrlKey<`/${Right}`>
    : Url extends `${string}/:${infer Key}`
    ? `${Key}`
    : never;
type OptionParams<Args> = Args extends undefined
    ? []
    : keyof Args extends never
    ? []
    : Partial<Args> extends Args
    ? [params?: Args]
    : NonNullable<Args> | undefined extends Args
    ? [params?: Args]
    : [params: Args];

type OptionQuery<Args> = Args extends undefined
    ? []
    : keyof Args extends never
    ? []
    : Partial<Args> extends Args
    ? [query?: Args]
    : NonNullable<Args> | undefined extends Args
    ? [query?: Args]
    : [query: Args];
type OptionBody<Args> = Args extends undefined
    ? []
    : keyof Args extends never
    ? []
    : Partial<Args> extends Args
    ? [body?: Args]
    : NonNullable<Args> | undefined extends Args
    ? [body?: Args]
    : [body: Args];

// type LitherUrlQuery =
//     | URLSearchParams
//     | Record<
//         string,
//         null | undefined | string | number | boolean | string[] | number[]
//     >
//     | undefined;
// const xxx = lither.API("http://ll.com:8080/user/:id/").POST<{ name: string }>();
// const xx33 = lither.API("http://user/:name/:id/").GET<{ name: string }>();
// const xx333 = lither.API("http://user/:id").GET<{ name: string[] }>();
// lither.get("/api");
// const fun = <Req, Res, S extends string>(
//     url: S,
//     data: { [key in GetUrlKey<S>]: string | number }
// ) => {
//     return {} as Res;
// };
// fun("http://user/:id/", { id: 2 });

// type GetUrlKeyLast<Url> = Url extends `/:${infer Key}`
//     ? `${Key}`
//     : never
// type GetUrlKey2<Url> = Url extends `${string}/:${infer Key}/${infer Right}` ?
//     `${Key}` | GetUrlKey2<`/${Right}`>
//     : (Url extends `${string}/:${infer Key}`
//         ? `${Key}`
//         : never)

// type xxxs = GetUrlKey2<'http://user/:id'>

// const Post = (url: any) => {
//     return (<const Url extends string>(_url: Url) => {
//         return (body: any, val: Url) => lither.post(url, { body });
//     })(url )
// };
// type Str2Key<Param extends string> = Param extends `${infer Key}`
//     ? Key
//     : "value";

// let x = Post("http://localhost" as const);
// x();

// const x = lither.API("sss").POST<{ data: string }, { name: string }>();
// lither.API('ddd').GET<{id: string}>()
