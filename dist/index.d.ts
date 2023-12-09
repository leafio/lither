type LitherConfig = {
    query?: Record<string, string | number | boolean | string[] | number[] | null | undefined> | URLSearchParams;
    params?: Record<string, string | number>;
    responseHandler?: "arrayBuffer" | "blob" | "formData" | "json" | "text";
    timeout?: number;
    signal?: AbortSignal;
    method?: "get" | "GET" | "delete" | "DELETE" | "head" | "HEAD" | "options" | "OPTIONS" | "post" | "POST" | "put" | "PUT" | "patch" | "PATCH" | "purge" | "PURGE" | "link" | "LINK" | "unlink" | "UNLINK";
    mode?: "cors" | "no-cors" | "same-origin";
    cache?: "default" | "no-cache" | "reload" | "force-cache" | "only-if-cached";
    credentials?: "include" | "same-origin" | "omit";
    headers?: Headers;
    redirect?: "manual" | "follow" | "error";
    referrerPolicy?: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
    body?: any;
    integrity?: string;
};
type litherResponse = {
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
declare function litherFetch<T>(url: string, config?: LitherConfig, litherInit?: LitherInit): Promise<T>;
export type LitherInit = {
    baseURL?: string;
    timeout?: number;
    auth?: (() => string) | (() => Headers);
    beforeRequest?: (config: LitherConfig) => LitherConfig;
    afterResponse?: (response: litherResponse, { resolve, reject, }: {
        resolve: (value: any) => void;
        reject: (reason?: any) => void;
    }) => void;
};
declare function createLither(litherInit?: LitherInit): {
    <T>(url: string, config?: LitherConfig): Promise<T>;
    baseInit: LitherInit;
    request: <T>(url: string, config?: LitherConfig) => Promise<T>;
    get: <T>(url: string, query?: Record<string, string | number | boolean | string[] | number[] | null | undefined> | URLSearchParams, config?: LitherConfig) => Promise<T>;
    post: <T>(url: string, body?: any, config?: LitherConfig) => Promise<T>;
    put: <T>(url: string, body?: any, config?: LitherConfig) => Promise<T>;
    patch: <T>(url: string, body?: any, config?: LitherConfig) => Promise<T>;
    delete: <T>(url: string, body?: any, config?: LitherConfig) => Promise<T>;
    options: <T>(url: string, config?: LitherConfig) => Promise<T>;
    head: <T>(url: string, config?: LitherConfig) => Promise<T>;
    API: <Url extends string>(url: Url) => {
        GET: <Req = undefined, Res = unknown>() => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionQuery<Req>]) => Promise<Res>;
        POST: <Req = undefined, Res = unknown>() => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionBody<Req>]) => Promise<Res>;
        PATCH: <Req = undefined, Res = unknown>() => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionBody<Req>]) => Promise<Res>;
        DELETE: <Req = undefined, Res = unknown>() => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionBody<Req>]) => Promise<Res>;
        PUT: <Req = undefined, Res = unknown>() => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionBody<Req>]) => Promise<Res>;
    };
};
declare const lither: {
    <T>(url: string, config?: LitherConfig): Promise<T>;
    baseInit: LitherInit;
    request: <T>(url: string, config?: LitherConfig) => Promise<T>;
    get: <T>(url: string, query?: Record<string, string | number | boolean | string[] | number[] | null | undefined> | URLSearchParams, config?: LitherConfig) => Promise<T>;
    post: <T>(url: string, body?: any, config?: LitherConfig) => Promise<T>;
    put: <T>(url: string, body?: any, config?: LitherConfig) => Promise<T>;
    patch: <T>(url: string, body?: any, config?: LitherConfig) => Promise<T>;
    delete: <T>(url: string, body?: any, config?: LitherConfig) => Promise<T>;
    options: <T>(url: string, config?: LitherConfig) => Promise<T>;
    head: <T>(url: string, config?: LitherConfig) => Promise<T>;
    API: <Url extends string>(url: Url) => {
        GET: <Req = undefined, Res = unknown>() => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionQuery<Req>]) => Promise<Res>;
        POST: <Req = undefined, Res = unknown>() => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionBody<Req>]) => Promise<Res>;
        PATCH: <Req = undefined, Res = unknown>() => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionBody<Req>]) => Promise<Res>;
        DELETE: <Req = undefined, Res = unknown>() => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionBody<Req>]) => Promise<Res>;
        PUT: <Req = undefined, Res = unknown>() => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionBody<Req>]) => Promise<Res>;
    };
};
type GetUrlKey<Url> = Url extends `${string}/:${infer Key}/${infer Right}` ? `${Key}` | GetUrlKey<`/${Right}`> : Url extends `${string}/:${infer Key}` ? `${Key}` : never;
type OptionParams<Args> = Args extends undefined ? [] : keyof Args extends never ? [] : Partial<Args> extends Args ? [params?: Args] : NonNullable<Args> | undefined extends Args ? [params?: Args] : [params: Args];
type OptionQuery<Args> = Args extends undefined ? [] : keyof Args extends never ? [] : Partial<Args> extends Args ? [query?: Args] : NonNullable<Args> | undefined extends Args ? [query?: Args] : [query: Args];
type OptionBody<Args> = Args extends undefined ? [] : keyof Args extends never ? [] : Partial<Args> extends Args ? [body?: Args] : NonNullable<Args> | undefined extends Args ? [body?: Args] : [body: Args];

export { LitherConfig, createLither, lither, litherFetch, litherResponse };
