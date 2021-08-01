---
title: 'JavaScript_this 바인딩(함수/객체)'
date: 2021/7/28 00:00:00
categories:
- JavaScript
---

# JavaScript_this 바인딩(함수/객체)
자바스크립트에서 this는 함수/객체 실행에 따라서 바라보는(참조)하는 객체가 달라지게 된다.


## 객체
객체 프로퍼티가 함수인 경우, 함수 내부에서 this는 객체를 가리키게 된다.

다시 말해서, this는 그 매서드를 호출한 객체를 바라보게 된다.
```javascript
var myObject = {
  value : 100,
  getValue : function(){
    console.log(this.value) // 100;
  }
}
```
프로퍼티가 함수인 경우, 간단하게 this가 가리키는 것이 객체가 된다고 생각할 수 있다. 하지만 함수 내부에서 다시 내부 함수를 사용할 경우, 그 내부함수에서 가리키게 되는 this는 일반 함수에서의 this가 가리키는 것과 동일하게 전역객체를 가리키게 된다. 그렇기 때문에 코드상에서 객체를 가리킬 수 있도록 임의로 객체를 참조하는 변수를 만들어서 사용하기도 한다.
```javascript
var myObject = {
  value : 100,
  getValue : function(){
    var that = this; // 일반적으로 that으로 참조 변수명을 정하는게 관례
    console.log(this.value) // 100;
    var func1 = function(){
      console.log(that.value) // 100;
    }

  }
}
```

## 함수
기본적으로, 함수를 실행하게되면 this는 전역객체인 window(브라우저) / global(Node)를 가리키게 된다. 결과적으로 함수를 그냥 실행하느냐와 생성자 함수로 실행하느냐의 차이는 엄청나게 다르다.
```javascript
function A(){
  this.value = 100; // window.value = 100;
  this.name = "kschoi"; // window.name = "kschoi"
}
```
## 생성자 함수
생성자 함수의 경우, 아래의 순서대로 인스턴스를 생성하게 된다.
- 빈 객체를 생성하여, 빈 객체에 this를 바인딩하게 된다.
- 빈 객체에 this를 바인딩하기 앞서, 객체의 __proto__ 프로퍼티를 생성하여 함수 객체의 prototype 영역을 참조하게 한다
- 이후 함수 내부 코드에서 this를 사용하여 객체에 속성 혹은 매소드를 생성하게 된다.
```javascript
function Test(){
    this.name = "kschoi"
    this.age = 20;
}
var obj = {};
obj.__proto__ = Test.prototype;
Test.call(obj);
console.log(obj);
```

하나 눈여겨 볼 부분은 함수의 리턴값에 관련된 부분이다. 만약 함수에 리턴값이 없으면 'undefined'가 리턴되지만, 생성자 함수의 경우 생성된 객체를 리턴하게 된다. 하지만, 만약 생성자 함수에서 임의적으로 리턴하는 객체가 존재하게 되면 this를 사용하여 속성값 혹은 매소드를 생성한 객체를 리턴하는 것이 아닌 임의로 지정한 리턴 객체를 반환하게 된다.
