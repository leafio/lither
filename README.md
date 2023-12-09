[English](#lither-is-a-lightweight-wrapper-of-native-fetch-with-typescript) | [中文](#lither-是用ts对原生fetch的轻量封装) | [安装 Installation](#安装-installation)

##### lither is a lightweight wrapper of native fetch with Typescript

- 🌐 [automatic parse restful api url parameters](#restful-url-params)
- ⭐ [shortcut for rapid define an request api](#rapid-define-apis)
- ⌛ timeout disconnect
- 🔤 automatic parse or serialization of JSON
- 📏 .min size less than 3K , smaller after zip
- 💡 smart type tips with Typescript

### Difference from Fetch

##### Request

Request data can choose `query` `params` `body` for easy specification

```typescript
    lither(url, options);  //fetch(url,options)
    /*****  added props compare to fetch options *****/
    /** url search params like  `api/info?name=yes`  {name:yes} passed here*/
    query?: Record< string,string | number | boolean | string[] | number[] | null | undefined>| URLSearchParams;
    /** url rest params like `api/info/:id`  {id:1} passed here*/
    params?: Record<string, string | number>;
    /** default 'text',if response content-type has json,then use json */
    responseHandler?: "arrayBuffer" | "blob" | "formData" | "json" | "text";
    /** unit ms */
    timeout?: number;

    /*****   vanilla fetch props  *****/
    method?: "get" | "GET" | "delete" | "DELETE" | "head" | "HEAD" | "options" | "OPTIONS" | "post" | "POST" | "put" | "PUT" | "patch" | "PATCH" | "purge" | "PURGE" | "link" | "LINK" | "unlink" | "UNLINK";
    mode?: "cors" | "no-cors" | "same-origin";
    cache?: "default" | "no-cache" | "reload" | "force-cache" | "only-if-cached";
    credentials?: "include" | "same-origin" | "omit";
    headers?: Headers;
    redirect?: "manual" | "follow" | "error";
    referrerPolicy?: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
    body?: any;
    integrity?: string;
```

##### Response

```typescript
type litherResponse = {
  ok?: boolean;
  headers?: Headers;
  redirected?: boolean;
  status?: number;
  statusText?: string;
  type?: string;
  url?: string;
  /** body been handled by the option responseHandler */
  body?: any;
  // ********************************
  isTimeout: boolean;
  error?: any;
};
```

### Futures

##### Shortcut

```typescript
lither.request(url, options);
lither.get(url, query, options);
lither.post(url, body, options);
lither.put(url, body, options);
lither.patch(url, body, options);
lither.delete(url, body, options);
```

##### Restful Url Params

url like /:key , will handle the key

```typescript
lither("/api/user/:id", { params: { id: 1 } });
// api/user/1
lither("/api/:job/:year", { params: { job: "engineer", year: 5 } });
//api/engineer/5
```

##### Rapid Define APIs

```typescript
  //can be GET POST PATCH PUT DELETE
  //GET data=>query,other method data=>body
  lither.API(url:string).POST<RequestType,ResponseType>()

  //define an api
 export const getUserInfo=lither.API('/user/:id').GET()
  //then use in any where
  getUserInfo({id:2})
    .then(res=>console.log(res))
    .catch(err=>console.log(err))

  //with typescript,
 export const login=lither.API('/user/login')
    .POST<{username:string,password:string},{token:string}>()
 //the develop tools will have type tips for request and response
  login({username:'admin',password:'123'}).then(res=>{
    localStorage.setItem('token', res.token);
  })
```

##### Default Options Config

```typescript
lither.baseInit: LitherInit;

type LitherInit = {
    //**url prefix */
    baseURL?: string;
    //**unit ms */
    timeout?: number;
    /** string =>{"Authorization":string} or other Headers  */
    auth?: (() => string) | (() => Headers);
    beforeRequest?: (config: LitherConfig) => LitherConfig;
      afterResponse?: (response: litherResponse, { resolve, reject, }: {
        resolve: (value: any) => void;
        reject: (reason?: any) => void;
    }) => void;
};

```

##### Instance Usage

```typescript
import { createLither } from "lither";
export const myLither = createLither(litherInit);
//then use it
myLither(url, options);
myLither.get(url, query, options);
export const getInfo = myLither.API("user/:id").GET();
```

### Usage Demo

```typescript
import { lither } from "lither";
//set default config
const litherInit = {
  baseURL: "api",
  auth: () => localStorage.getItem("token"),
  timeout: 20 * 1000,
  afterResponse: async (res, {resolve, reject}) => {
    if (res.ok) {
      if (res.body.errCode === 0) {
        resolve(res.body.data);
      } else {
        toast.error(res.body.errMsg);
        reject(res.body);
      }
    } else if (res.status === 401) {
      localStorage.removeItem("token");
      location.href = "/login";
    }
    if (res.isTimeout) {
      toast.error("timeout");
    }
    reject(res.error || res.body);
  },
};
lither.baseInit = litherInit;

//get
lither("/user", { query: { id: 123 } }).then((res) => {
  console.log(res.username); // test
});

//post
lither("/login", {
  method: "POST",
  body: { username: "test", password: "123" },
}).then((res) => {
  console.log(res.token); // token
});

//with typescript
lither<{ username: string }>("/user?id=123").then((res) => {
  console.log(res.username); // test
});
//define api
export const login = lither
  .API("/user/login")
  .POST<{ username: string; password: string }, { token: string }>();

login({ username: "admin", password: "123" }).then((res) => {
  localStorage.setItem("token", res.token);
});
//abort
const abortController = new AbortController();
const { signal } = abortController;
const getUser = lither("/user?id=123", { signal }).then((res) => {
  console.log(res.username); // test
});
abortController.abort("reason cancel this request");
```

[English](#lither-is-a-lightweight-wrapper-of-native-fetch-with-typescript) | [中文](#lither-是用ts对原生fetch的轻量封装) | [安装 Installation](#安装-installation)

##### lither 是用 ts 对原生 fetch 的轻量封装

- 🌐 [ 自动解析 rest Url 的参数](#restful-url-参数自动处理)
- ⭐ [快捷定义请求 api](#快速定义api)
- ⌛ 超时断开
- 🔤 自动处理 JSON
- 📏 不到 3K , zip 后会更小
- 💡 用 typescript 有智能类型提醒

### 与 Fetch 的不同

##### 请求

请求数据可以选择 _`query`_  _`params`_  _`body`_ ，易于传递。

```typescript
    lither(url, options);  //fetch(url,options)
    /**   ***增加了选项** */

    /** url ？后的参数  `api/info?name=yes` 传递 {name:yes}*/
    query?: Record< string,string | number | boolean | string[] | number[] | null | undefined>| URLSearchParams;
    /** rest风格url的请求参数 `api/info/:id` 传递 {id:1}*/
    params?: Record<string, string | number>;
    /** 默认 'text',若响应 content-type 有 json,便用 json */
    responseHandler?: "arrayBuffer" | "blob" | "formData" | "json" | "text";
    /** unit 毫秒 */
    timeout?: number;

    /*** 原生fetch 参数*/
    method?: "get" | "GET" | "delete" | "DELETE" | "head" | "HEAD" | "options" | "OPTIONS" | "post" | "POST" | "put" | "PUT" | "patch" | "PATCH" | "purge" | "PURGE" | "link" | "LINK" | "unlink" | "UNLINK";
    mode?: "cors" | "no-cors" | "same-origin";
    cache?: "default" | "no-cache" | "reload" | "force-cache" | "only-if-cached";
    credentials?: "include" | "same-origin" | "omit";
    headers?: Headers;
    redirect?: "manual" | "follow" | "error";
    referrerPolicy?: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
    body?: any;
    integrity?: string;
```

##### 响应

```typescript
type litherResponse = {
  ok?: boolean;
  headers?: Headers;
  redirected?: boolean;
  status?: number;
  statusText?: string;
  type?: string;
  url?: string;
  /** body已根据 responseHandler选项处理过 */
  body?: any;
  // ********************************
  isTimeout: boolean;
  error?: any;
};
```

### 特别功能

##### 快捷方法

```typescript
lither.request(url, options);
lither.get(url, query, options);
lither.post(url, body, options);
lither.put(url, body, options);
lither.patch(url, body, options);
lither.delete(url, body, options);
```

###### Restful Url 参数自动处理

url 包含 /:key 会解析匹配 key

```typescript
lither("/api/user/:id", { params: { id: 1 } });
// api/user/1
lither("/api/:job/:year", { params: { job: "engineer", year: 5 } });
//api/engineer/5
```

##### 快速定义 API

```typescript
  //可以是 GET POST PATCH PUT DELETE
  //GET 请求数据传递至query,其他方法请求数据传递至body
  lither.API(url:string).POST<RequestType,ResponseType>()

  //定义一个api
 export const getUserInfo=lither.API('/user/:id').GET()
  //使用
  getUserInfo({id:2})
    .then(res=>console.log(res))
    .catch(err=>console.log(err))

  //用typescript,
 export const login=lither.API('/user/login')
    .POST<{username:string,password:string},{token:string}>()
 //开发工具会有请求和响应的智能提醒
  login({username:'admin',password:'123'}).then(res=>{
    localStorage.setItem('token', res.token);
  })
```

##### 默认配置

```typescript
lither.baseInit: LitherInit;

type LitherInit = {
    //**url prefix */
    baseURL?: string;
    //**unit ms */
    timeout?: number;
    /** string =>{"Authorization":string} or other Headers  */
    auth?: (() => string) | (() => Headers);
    beforeRequest?: (config: LitherConfig) => LitherConfig;
    afterResponse?: (response: litherResponse, { resolve, reject, }: {
        resolve: (value: any) => void;
        reject: (reason?: any) => void;
    }) => void;
};

```

##### 实例用法

```typescript
import { createLither } from "lither";
export const myLither = createLither(litherInit);
//then use it
myLither(url, options);
myLither.get(url, query, options);
export const getInfo = myLither.API("user/:id").GET();
```

### 使用代码示例

```typescript
import { lither } from "lither";
//设置默认配置
const litherInit = {
  baseURL: "api",
  auth: () => localStorage.getItem("token"),
  timeout: 20 * 1000,
  afterResponse: async (res, {resolve, reject}) => {
    if (res.ok) {
      if (res.body.errCode === 0) {
        resolve(res.body.data);
      } else {
        toast.error(res.body.errMsg);
        reject(res.body);
      }
    } else if (res.status === 401) {
      localStorage.removeItem("token");
      location.href = "/login";
    }
    if (res.isTimeout) {
      toast.error("timeout");
    }
    reject(res.error || res.body);
  },
};
lither.baseInit = litherInit;

//get
lither("/user", { query: { id: 123 } }).then((res) => {
  console.log(res.username); // test
});

//post
lither("/login", {
  method: "POST",
  body: { username: "test", password: "123" },
}).then((res) => {
  console.log(res.token); // token
});

//with typescript
lither<{ username: string }>("/user?id=123").then((res) => {
  console.log(res.username); // test
});
//define api
export const login = lither
  .API("/user/login")
  .POST<{ username: string; password: string }, { token: string }>();

login({ username: "admin", password: "123" }).then((res) => {
  localStorage.setItem("token", res.token);
});

//abort
const abortController = new AbortController();
const { signal } = abortController;
const getUser = lither("/user?id=123", { signal }).then((res) => {
  console.log(res.username); // test
});
abortController.abort("reason cancel this request");
```

[English](#lither-is-a-lightweight-wrapper-of-native-fetch-with-typescript) | [中文](#lither-是用ts对原生fetch的轻量封装) | [安装 Installation](#安装-installation)

##### 安装 Installation

```bash
    npm install lither
```
