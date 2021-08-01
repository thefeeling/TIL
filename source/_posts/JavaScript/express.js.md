---
title: 'Express.js'
date: 2021/7/28 00:00:00
categories:
- JavaScript
---

# Express.js
HTTP 요청에 대하여 **라우팅** 및 **미들웨어** 기능을 제공하는 웹 프레임워크
- **라우팅(routing)** 은 기본적으로 어플리케이션 서버에서 경로를 제어하는 목적
  > 목적지까지 갈 수 있는 여러 경로 중 한 가지 경로를 설정해 주는 과정.

- **미들웨어(middleware)** 는 중간에 껴넣는다는 의미로 부가적인 기능이나 처리를 제공하는 목적
  > 이기종의 환경을 연결해주는 소프트웨어를 가리킴

  ▶ Express.js에서 사용할 수 있는 **중간처리** 목적의 소프트웨어/모듈

  ▶ 최종 요청 핸들러 이전의 **Express 라우팅 계층에 의해 호출되는 함수**

## 설치
```bash
npm init
npm install express --save
```

## Express Generator
```bash
npm install express-generator -g
```
```bash
express -h
```


![express_generator](http://i.imgur.com/8b7CLJe.png)

- **기본적인 어플리케이션 골격 생성**
- handlebars, hogan, jade 등 템플릿 엔진 추가 가능
- css, .gitignore 등 옵션 추가 가능

## 기본 라우팅 & 핸들러
라우팅(Routing) 이란 URL(URI) 요청에 따라 어플리케이션이 응답하는 방법을 결정.

```javascript
var express = require('express');
var app = express();

/**
 * METHOD : Http Method(GET, POST, PUT, DELETE, PATCH 등)
 * PATH : [경로]
 * HANDLER : [경로 접근 시, 처리 핸들러]
 */
app.METHOD(PATH, HANDLER)
```

### 라우팅 형태
라우팅 URL 패스는 기본적으로 문자열뿐만 아니라 문자열 패턴 혹은 정규식으로 표현이 가능하다.(path-to-regexp)

```javascript
// Sample
app.get('/home', function(req, res){
      res.send("Hello World");
})

// abcd, abbcd 및 abbbcd
app.get('/ab+cd', function(req, res) {
      res.send('ab+cd');
});

// abcd, abxcd, abRABDOMcd
app.get('/ab*cd', function(req, res) {
      res.send('ab*cd');
});

// abe 및 abcde
app.get('/ab(cd)?e', function(req, res) {
      res.send('ab(cd)?e');
});
```

라우팅 핸들러(콜백 함수)는 하나 이상으로 설정이 가능하다.(next 인자를 반드시 설정해야 한다.) 라우팅에 대한 핸들링을 2개 이상을 등록하여 사용할 수 있기 때문에 굳이 하나의 핸들러에 모든 로직이나 코드를 넣어서 처리할 이유가 전혀 없다.
```javascript
var cb0 = function (req, res, next) {
      console.log('CB0');
      next();
}

var cb1 = function (req, res, next) {
      console.log('CB1');
      next();
}

app.get('/example/a', [cb0, cb1], function (req, res, next) {
      console.log('the response will be sent by the next function ...');
      next();
}, function (req, res) {
      res.send('Hello from A!');
});

app.get('/example/b',
function (req, res, next) {
      console.log('first handler');
      next();
},
function (req, res) {
      console.log('second handler');
      res.send('Hello from B!');
});
```

모듈식으로 등록하는 개념으로 express.Router 매소드를 활용하여 파일 단위로 모듈화를 시켜서 라우팅을 등록할 수 있다.

```javascript
// [birds.js]
var express = require('express');
var router = express.Router();

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
      console.log('Time: ', Date.now());
      next();
});
// define the home page route
router.get('/', function(req, res) {
      res.send('Birds home page');
});
// define the about route
router.get('/about', function(req, res) {
      res.send('About birds');
});

module.exports = router;
```

위에서 작성된 bird.js을 하단과 같이 로드하면 /birds/, /birds/about 으로 라우팅이 등록되어 사용할 수 있다. 모듈 단위(파일)로 작성하여 등록하는 방식이기 때문에, 라우팅 관리가 편하며 추후에 라우팅을 추가한다고 해도 확장성이 있어 보인다.
```javascript
var birds = require('./birds');
app.use('/birds', birds);
```

## 미들웨어
- **Application**
  - **어플리케이션 전체 영역** 에서 처리 가능. 앱에 대한 Request가 발생할 떄 마다 실행
- **Router**
  - **라우터 단위** 로 Request가 발생하면 실행
      ```javascript
      var app = express();
      var router = express.Router();

      router.use(function (req, res, next) {
            console.log('Time:', Date.now());
            next();
      });
      ```
      > 위에서 설명했던 라우팅 방식 중 모듈 단위(파일) 라우팅 시 사용하면 유용

- **Error Handling**
  - 기본적으로 4개의 인자가 필요(인자의 숫자로 오류 처리 미들웨어 판별)
      ```javascript
      app.use(function(err, req, res, next) {
            console.error(err.stack);
            res.status(500).send('Something broke!');
      });
      ```  
- **Basic(Default)**
  - express.static(root, [options])
     - 어플리케이션 정적 자원 설정(CSS,HTML,JS) 등
     - 2개 이상의 정적 디렉토리 설정 가능
      ```javascript
      var options = {
        dotfiles: 'ignore',
        etag: false,
        extensions: ['htm', 'html'],
        index: false,
        maxAge: '1d',
        redirect: false,
        setHeaders: function (res, path, stat) {
          res.set('x-timestamp', Date.now());
        }
      }

      app.use(express.static('public'));
      app.use(express.static('uploads'));
      app.use(express.static('files'));
      ```
- **Third-Party**
  - Application Level 및 Router Level에 서트파티 미들웨어 설정이 가능하다
  - [대표적인 미들웨어 종류](http://expressjs.com/ko/resources/middleware.html)를 참고하여 설정하자.
  - Express의 경우, 초기버젼과 다르게 대부분 서드파티 미들웨어 사용을 권고하고 있다. 그렇기 때문에, 자주 사용하는 조합을 찾아놓고 사용하는 것이 개발 속도면에서나 안정성면에서나 유리하다.

## Request & Response
### **Express 어플리케이션 처리 흐름**
- 미들웨어를 선 처리
- 개별 라우팅 주소 값에 맞는 라우팅 핸들러를 실행
- HTTP 요청에 대한 응답을 실행


![express-diagram](http://i.imgur.com/oGUSkq8.png)

기본적으로, Request 및 Response는 객체이며 HTTP 요청과 응답과 관련된 매서드와 프로퍼티(상태값 등)을 가지고 있다. **Query String, Parameter, Body, HTTP Header 기타 등등** 심지어 xhr 요청 유무까지 확인 가능한 프로퍼티가 있다. 너무 많기에 관련된 내용은 하단 링크를 통하여 확인하도록 하자
### [요청 프로퍼티 & 매소드](http://expressjs.com/ko/4x/api.html#req)
### [응답 프로퍼티 & 매소드](http://expressjs.com/ko/4x/api.html#res)

## Template Engine
```javascript
// Setting
app.set('view engine', 'jade');
```
```javascript
// Router
app.get('/', function (req, res) {
      res.render('main', {msg : "HelloWorld!"});
});
```


express에서 자주 사용하는 뷰 템플릿 엔진은 하단과 같다.
- [jade(pug)](https://github.com/pugjs/pug)
- [ejs](https://www.npmjs.com/package/ejs)
- [handlebars](http://handlebarsjs.com/)

React같이 View만을 전문적으로 처리하는 라이브러리가 유행이고, 동형(Isomorphic) 처리라고 하여 서버 사이드에서도 클라이언트 사이드(브라우저)와 같이 뷰를 렌더링하자 라는 테마가 요즘 유행이다.(하지만 나에게는 너무 어렵다...어려워....) 마지막으로 배우고 익혔던 AngularJS도 좋지만 이 녀석은 사용해야 할 성격이 분명히 존재하는거 같다(SEO가 필요한 사이트에서는 쥐약인듯)


아무튼 express에서 뷰 렌더링이 필요하다면 위 3개정도가 가장 현실적으로 사용할만한 템플릿 엔진인것은 분명하다. 만약 뷰단까지 같이 셋팅이 되어 있는 프로젝트가 필요하다면 [Yeoman](http://yeoman.io/)이나 [Mega Boilerplate](http://megaboilerplate.com/)에서 필요한 리소스를 확보하면 된다.


## 참고
- [Express.js](http://expressjs.com/)
- [Express.js Github page](https://github.com/expressjs)
