---
title: 'Unit Testing React/Redux'
date: 2016/7/12 00:00:00
categories:
- JavaScript
---

# Unit Testing React/Redux

## Why Do We Need to Write Unit Tests?
코드베이스가 더 커지고 같이 일하게 되는 동료가 늘어남에 따라 모든 코드 베이스(함수, 모듈, 객체 등등)을 수동 혹은 사람이 직접 확인하는 일은 불가능에 가깝다. 만약, 이러한 코드베이스에 대한 개별적인 테스트를 자동화할 수 있다면 개발 시 발생하는 디버깅 소요를 크게 줄일 수 있게 된다.
![lost](http://i.imgur.com/Msb5kkd.jpg)

유닛 테스트를 작성하여 얻게 되는 이점은 바로 기능 추가/변경/수정에 대하여 일종의 이력을 남기는 효과를 발생하기 때문에 개발자들이 본인이 작성한 코드에 대하여 리팩토링에 대한 고통 혹은 걱정거리를 줄여줄 수 있게 된다. 결국, 테스트에 대한 고통스러운 소요를 줄일 수 있게 되고 이는 곧 안정적인 코드를 만드는 좋은 흐름을 제공하게 되는 것이다.

## What About React/Redux?
React & Redux 조합의 어플리케이션에서 사용하는 요소들은 아래와 같다.
- **Actions**
- **Reducers**
- **Components**
- **Middlewares**

위 네 가지가 주된 테스트의 대상이 될 수 있으며, 경우에 따라 유틸리티 성격의 코드 또한 테스트의 대상이 될 수 있다.

## Prerequisite
테스트 프레임워크는 Facebook에서 만든 [Jest](https://facebook.github.io/jest/)를 사용하며, 사용과 관련된 기본 튜토리얼은 [링크](https://facebook.github.io/jest/docs/tutorial-react.html#content)를 참고하자. 이외에 사용하는 모듈은 하단과 같고, 설치는 [NPM](https://www.npmjs.com/) 패키지 매니저를 통하여 설치한다.

- [sinon.js](http://sinonjs.org/)
  - 테스트 더블(SPY, STUB, MOCK) 객체 생성을 도와주는 라이브러리.
- [nock](https://github.com/node-nock/nock)
  - HTTP 요청 목 객체 생성.
- [redux-mock-store](https://github.com/arnaudbenard/redux-mock-store)
  - Redux Mock Store 생성
- [redux-thunk](https://github.com/gaearon/redux-thunk)
  - Redux Store 생성을 위한 미들웨어

## Action Tests
리덕스 어플리케이션 디자인에서 액션은 단지 객체를 리턴하는 함수에 불과하다. 아래 예제는 **React&Redux 어플리케이션에서 HTTP API를 호출하는 액션 기본 형태** 를 보여준다.


```javascript
// action.js
import { callApi } from './api';
import * as ActionTypes from './constants';

export function loadQuestions() {
  return {
    type: ActionTypes.LOAD_QUESTIONS,
    promise: api.loadQuestions()
  }
}
```
위 예제에서 주목해야 할 부분은 바로 <code>promise</code>프로퍼티이다. **<code>promise</code> 프로퍼티는 <code>promiseMiddleware</code>가 인터셉트하여 액션에 따른 리듀서 호출을 정하게 된다.**

```javascript
// promiseMiddleware.js
export default function promiseMiddleware() {
  return next => action => {
    const { promise, type, ...rest } = action;

    if (!promise) return next(action);

    const SUCCESS = `${type}_SUCCESS`;
    const REQUEST = `${type}_REQUEST`;
    const FAILURE = `${type}_FAILURE`;
    next({ ...rest, type: REQUEST });
    return promise
      .then(res => {
        next({ ...rest, res, type: SUCCESS });
        return true;
      })
      .catch(error => {
        next({ ...rest, error, type: FAILURE });
        return false;
      });
  };
}
```
위 프로미스 미들웨어는 <code>promise</code> 프로퍼티의 존재 유무 및 실행 결과(<code>then()</code> or <code>catch()</code>)에 따라 분기하여 <code>ACTION_NAME_SUCESS</code> -> <code>ACTION_NAME_SUCESS</code> 혹은 <code>ACTION_NAME_FAILURE</code> 액션 프로퍼티를 포함한 객체를 리턴하게 된다.

간단하게 처리 흐름에 대하여 설명했고, 이제 액션 코드에 대하여 테스트 코드를 작성해보자. 테스트는 <code>promise</code>의 구현을 어떻게 해야 할 것인지에 따라 2가지로 나뉠 수 있다.
- HTTP 목 객체를 활용한 테스트
- 단순 액션 리턴

```javascript

```


## Reducer Tests
리듀서는 State와 Action을 연결하는 함수로서 새로운 상태 값을 리턴한다. 다시 말해, 리듀서는 액션을 받고 어떤 상태 값으로 바뀌는지에 대한 명세이다.
> In Redux, a reducer acts like a function that connects a state to an action, and then returns a new state. In other words, a reducer will receive an action, and then decide how the state should be changed based on the action and the current state.

## Middleware Tests
**Redux 앱에서 미들웨어는 요청을 인터셉트하며 이를 다시 리듀서에 디스패치하는 함수** 이며 리듀서에 디스패치 하는 과정에서 **원래 액션을 변경하거나 추가적인 로직을 수행하는 역할을 한다.** 일반적인 미들웨어 형태는 아래와 같다.

```javascript
function(store) {
  return function(next) {
    return function(action) {
      // middleware behavior...
    };
  };
}
```
> In a Redux app, the middleware is responsible for intercepting an action that was dispatched to a reducer and changing the action’s original behavior before it reaches the reducer. The middleware itself is a function with a signature that looks like this:

만약, ES6 개발 환경을 갖춰져 있다면 아래와 같은 형태로 함수 전개가 가능하다.
```javascript
store => next => action => {
  // middleware behavior...
}
```

## Component Tests


## 참고
 - [Unit Testing a Redux App](https://www.codementor.io/reactjs/tutorial/redux-unit-test-mocha-mocking)
 - [Unit Testing React/Redux](https://alexzywiak.github.io/unit-testing-react-redux/)
 - [Redux Middleware](http://jonnyreeves.co.uk/2016/redux-middleware/)
