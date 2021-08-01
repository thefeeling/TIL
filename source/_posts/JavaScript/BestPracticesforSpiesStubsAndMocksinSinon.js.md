---
title: Best Practices for Spies, Stubs and Mocks in Sinon.js
date: 2021/7/28 00:00:00
categories:
- JavaScript
---

# Best Practices for Spies, Stubs and Mocks in Sinon.js

### Introduction
Ajax 호출, 네트워킹, 데이터베이스 혹은 다른 의존성(함수,모듈)와 관련된 코드를 테스트하는 것은 매우 어렵다. 만약 Ajax 호출이나 네트워킹 호출이 필요한 코드를 테스트한다면, 기본적으로 당신의 코드의 요청에 응답할 수 있는 서버가 필요하다. 마찬가지로 데이터베이스 관련 코드를 테스트할때도 테스트에 필요한 데이터를 셋팅하는 등 사전 작업이 필요하다.

위에서 언급한 모든 것이 바로 테스트를 어렵게 하는 것들인데, 왜냐하면 테스트에 필요한 환경을 셋팅하는 등의 부수적인 작업이 필요하기 떄문이다.

고맙게도 <code>Sinon.js</code>를 이용하면 이런 일련의 복잡한 작업을 피할 수 있으며, 우리는 단순히 이것의 좋은 특징을 사용하여 여러가지 번거로운 작업을 단순화할 수 있다.

<code>Sinon.js</code>를 시작하는 것은 어렵지만, <code>Sinon.js</code>가 제공하고 호출하는 Spies, Stubs, Mocks 등을 이용하면 테스트에 필요한 상당한 기능성을 얻을 수 있다. 하지만, 이 세가지를 구분하고 선택하여 사용하는 것은 어려움이 존재한다. 아래 글을 통하여 SPY, STUB, MOCK의 차이점을 파악하고 최적의 사용 방법을 파악해보자.



### 예제 코드
```javascript
function setupNewUser(info, callback) {
  var user = {
    name: info.name,
    nameLowercase: info.name.toLowerCase()
  };

  try {
    Database.save(user, callback);
  }
  catch(err) {
    callback(err);
  }
}
```

위 함수는 두개의 인자를 받을 수 있다. 첫 번째 인자의 경우, 저장하고자 하는 데이터를 담은 객체이며 두 번째 인자의 경우 콜백 함수이다. 우리는 첫 번째 인자의 데이터를 <code>info</code> 객체에서 <code>user</code> 객체 변수로 할당할 것이며, 이를 저장하는 연산을 수행할 것이다.
> <code>Database.save()</code>는 웹 환경이라면 ajax호출을 통한 통신이 될 수도 있으며, Node 관련 환경이라면 파일이나 데이터베이스에 직접 저장하는 코드가 될 수 있다. 예제 코드는 이런 상황을 가정하여 작성한 것이다.</code>


### Spies, Stubs and Mocks
**SPY, STUB** 그리고 **MOCK** 을 가리켜서 **테스트 더블(TEST DOUBLES)** 이라고 하며, 영화에서 스턴트 더블이 위험한 일을 하듯이, 우리는 **테스트 더블** 을 활용하여 문제가 되는 코드를 대체하여 테스트를 쉽게할 수 있다.


### When Do You Need ***Test Doubles***?
- Functions **without side effects**
- Functions **with side effects**

우리는 함수가 부정적인 영향이나 부작용을 가지고 있을 때, 테스트 더블을 이용한 테스트가 필요하다. 부작용을 가지고 있는 함수 뿐만 아니라, 경우에 따라서 외부 통신이나 연산이 필요한 함수(잠재적으로 테스트를 느려지게 할 수 있는 연산 모두를 포함한다.)에서도 테스트 더블을 이용한 테스트를 진행할 수 있다.

다시 말해, 외부 환경과 관련이 있는 코드 혹은 함수 호출이 주된 테스트 더블의 대상이 되며 이를 가리켜 ***Functions with side effects*** 라고 표현한다.

### When to Use SPY
**SPY** 는 함수 호출과 관련된 정보를 얻는데에 사용된다.
- **함수가 얼마나 많이 호출되었는지**
- **어떤 인자가 함수로 전달되었는지**
- **어떤 값이 리턴 되는지**
- **어떤 예외가 발생하는지**

가장 일반적인 시나리오는 바로 **함수 호출 횟수 및 어떤 인자를 함수에 넘겼는지에 관련된 부분이다.**


**함수 호출 횟수** 는 <code>sinon.assert.callCount</code>, <code>sinon.assert.calledOnce</code>, <code>sinon.assert.notCalled</code> 등의 메소드를 활용하면 확인할 수 있다.
```javascript
it('should call save once', function() {
  var save = sinon.spy(Database, 'save');

  setupNewUser({ name: 'test' }, function() { });

  save.restore();

  // save 함수가 정확하게 한 번만 호출되었는지 확인.
  // if spy was called once and only once.
  sinon.assert.calledOnce(save);
});
```


**함수에 어떤 인자를 넘겼는지 확인할 수 있다.** 확인은 <code>sinon.assert.calledWith</code> 매소드를 호출하거나, or <code>spy.lastCall</code> or <code>spy.getCall</code> 매소드 등을 통하여 직접 접근하여 확인할 수 있다.

아래 예제는 <code>setupNewUser</code>에서 호출하는 <code>Database.save()</code>가 <code>expectedUser</code> 객체의 내용과 동일하게 인자를 넘기지는지 유무를 확인한다.
```javascript
it('should pass object with correct values to save', function() {
  var save = sinon.spy(Database, 'save');
  var info = { name: 'test' };
  var expectedUser = {
    name: info.name,
    nameLowercase: info.name.toLowerCase()
  };

  setupNewUser(info, function() { });

  save.restore();
  sinon.assert.calledWith(save, expectedUser);
});
```


### When to Use Stubs
SPY 객체와 하는 일은 비슷하지만, STUB 객체는 함수(모듈/매소드)의 자체를 대체할 수 있다. 즉, 커스텀 행위를 수행할 수 있다는 뜻이다.(값을 리턴하거나 예외를 발생시키는 등) 또한, 주어진 인자를 통하여 콜백 함수를 호출할 수 있다. 즉, 테스트에 어려움이 많은 외부 종속적인 코드(네트워크, 데이터베이스 등)를 쉽게 테스트할 수 있는 것이다.

- 문제가 될 수 있는 코드 블록을 대체할 수 있다.
- 특정 코드 경로를 호출하는 경우(예외 발생 등).
- 비동기 코드를 쉽게 테스트할 수 있다.

**문제가 될 수 있는 코드 블록을 대체할 수 있다.**,
테스트하기 어려운 코드(외부 환경에 종속적인 혹은 DB 혹은 네트워킹이 필요한)에 대하여 코드 블럭 대체를 통하여 테스트를 좀 더 쉽게 할 수 있도록 할 수 있다.
```javascript
it('should pass object with correct values to save', function() {
  var save = sinon.stub(Database, 'save');
  var info = { name: 'test' };
  var expectedUser = {
    name: info.name,
    nameLowercase: info.name.toLowerCase()
  };

  setupNewUser(info, function() { });

  save.restore();
  sinon.assert.calledWith(save, expectedUser);
});
```

**특정 코드 경로를 호출하는 경우(예외 발생 등).**
우리가 테스트하고 있는 코드에서 만약 특정 함수를 호출하고 이 특정 함수가 만약 예외를 발생시킬 수도 있다. 이럴 경우 STUB 객체를 활용하여 예외를 발생시키는 코드를 쉽게 테스트할 수 있다.

```javascript
it('should pass the error into the callback if save fails', function() {
  var expectedError = new Error('oops');
  var save = sinon.stub(Database, 'save');
  save.throws(expectedError);
  var callback = sinon.spy();

  setupNewUser({ name: 'foo' }, callback);

  save.restore();
  sinon.assert.calledWith(callback, expectedError);
});
```

**비동기 코드를 쉽게 테스트할 수 있다.**
만약 비동기 함수를 STUB 객체로 대체한다면, 이에 대한 호출과 동시에 바로 콜백을 실행시킬수도 있으며 또한 테스트 하기 어려운 비동기 코드를 동기 코드처럼 다룰 수 있게 한다.

```javascript
it('should pass the database result into the callback', function() {
  var expectedResult = { success: true };
  var save = sinon.stub(Database, 'save');
  save.yields(null, expectedResult);
  var callback = sinon.spy();

  setupNewUser({ name: 'foo' }, callback);

  save.restore();
  sinon.assert.calledWith(callback, null, expectedResult);
});
```


### When to Use Mocks
MOCK 객체 사용 시 세심한 주의가 필요하다. **주의! MOCK 객체는 SPY 및 STUB 객체하는 하는 모든 일을 대체할 수 있는데, 이는 곧 테스트 자체를 복잡하게 만들거나 자칫하면 부서지기 쉬운(불안정한) 테스트 케이스를 만들어 낼 수 있다.**

MOCK 객체는 STUB 객체를 사용할 때, 연쇄적인 액션이 필요한 경우 STUB 객체를 대신하여 사용할 떄 주요하다.

```javascript
it('should pass object with correct values to save only once', function() {
  var info = { name: 'test' };
  var expectedUser = {
    name: info.name,
    nameLowercase: info.name.toLowerCase()
  };
  var database = sinon.mock(Database);
  database.expects('save').once().withArgs(expectedUser);

  setupNewUser(info, function() { });

  database.verify();
  database.restore();
});
```


### 참고
- [Sinon.JS](http://sinonjs.org/docs/)
