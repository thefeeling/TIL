# JavaScript_Prototype & Prototype Chainning
자바스크립트는 **프로토타입** 기반의 객체지향 언어로 일반적인 객체 지향 언어와 다른 특성을 가지고 있다.

특히, 자바스크립트는 기본적으로는 원시타입과 참조타입으로 데이터 타입을 나눌 수 있지만, 엔진 내부에서는 원시타입 역시 객체로 **오토박싱(AutoBoxing)** 을 시켜서 객체형으로 변환하여 변수를 관리한다.(즉, 원시타입도 어떤 생성자 함수의 인스턴스이다.)

## 암묵적인 프로토타입 링크(implicit prototype link)
자바스크립트의 모든 객체는 프로토타입 (링크)객체를 가지고 있다. 프로토타입 객체란, 자신을 생성한 생성자 함수의 프로토타입 객체를 가리키는 일종의 링크 객체로 자바스크립트에서 상속을 구현하는 핵심 메카니즘이라고 할 수 있다.
- ECMA 표준에서는 이를 **암묵적인 프로토타입 링크** 라고 명칭한다.

```javascript
function Person(name){
    this.name = name;
}
var foo = new Person('Choi');

foo.__proto__ === Person.prototype
```

위 코드에서 foo 객체(인스턴스)의 프로토타입 링크는 foo 객체의 생성자인 Person 함수 객체의 **[프로토타입]** 영역을 가리키가 된다. 즉, 생성자 함수의 프로토타입 영역이 인스턴스의 프로토타입 링크가 가리키게 되는 객체가 되는 것이다.
> Chrome에서는 _proto_ 라는 프로퍼티가 프로토타입 링크 역할을 하는 객체 프로퍼티가 된다.
즉, 숨겨진 프로토타입 링크 역할을 수행하게 되는 것이다.

생성자 함수로 생성된 객체뿐만 아니라, 객체 리터럴도 프로토타입 링크를 가지게 되는데 왜냐하면 객체 리터럴 역시 내부적으로는 Object() 생성자 함수의 객체(인스턴스)이기 때문에, Object.Prototype 영역을 가리키는 암묵적인 프로토타입 링크를 가지게 된다.

```javascript
// 객체 리터럴 생성
var obj = {};

// 객체 리터럴도 Object 생성자 함수의 인스턴스이기 때문에 가리키는 프로토타입 링크와 프로토타입 영역은 동일한 객체를 바라보게 된다.
obj.__proto__ === Object.prototype
```

> 결과적으로, 기억해야 할 부분은 바로 **객체리터럴 역시 Object() 생성자 함수의 인스턴스** 라는 점이다.


## 프로토타입 체인(Prototype Chainning)
자바스크립트에서 객체의 속성이나 매소드를 참조할 때, 객체에 해당 속성과 매소드가 없을 경우 **프로토타입 링크** 를 따라 프로토타입 객체의 프로퍼티를 차례대로 찾아가는 것을 **프로토타입 체인** 이라고 한다.

> 객체의 속성을 읽거나 매소드를 호출(실행)할 때 프로토타입 체인이 작동한다

```javascript
var myObj = {};
myObj.name = "Choi";

myObj.hasOwnProperty('name'); // true
myObj.hasOwnProperty('age'); // false
```

위 코드에서 hasOwnProperty() 매소드를 사용할 수 있는 근거도 위에서 말한대로 객체 리터럴 역시 Object() 생성자 함수의 인스턴스이기 때문에, 객체의 프로토타입 링크는 Object() 생성자 함수 객체의 프로토타입 영역을 참조하게 된다. 그래서 기존 Object() 생성자 함수의 프로토타입 영역에 정의되어 있는 매소드인 hasOwnProperty(Native 영역의 함수)를 사용할 수 있는 것이다.


```javascript
String.prototype.__proto__ === Object.prototype
Number.prototype.__proto__ === Object.prototype
```


이 밖에도, Number, String, Function 등의 생성자 함수들도 각자 프로토타입 영역을 가지고 있는데 **프로토타입 영역은 곧 객체** 이기 때문에 객체의 프로토타입 링크를 가지고 있게 된다. 이때 프로토타입 링크가 바라보게 되는 곳이 바로 Object()의 프로토타입 영역이기 때문에 실질적으로 모든 객체(인스턴스)에서 Object.prototype에 정의한 매서드들을 사용할 수 있는 것이 된다.


## 프로토타입 && this
프로토타입 객체의 속성(프로퍼티)가 매서드인 경우, 결과적으로 **this 키워드는 매서드를 호출한 객체를 바라보게 된다.** 말이 어려운데 아래 예제를 살펴보면 쉽게 이해할 수 있을 것이다.
```javascript
function Animal(name){
    this.name = name;
}

Animal.prototype.sayHello = function(msg){
    return alert(this.name + "이 말합니다. " + msg);
}

var tiger = new Animal('타이거');
tiger.sayHello('난 호랭이야!'); // 타이거가 말합니다. 난 호랭이야!
```

sayHello를 호출한 객체는 바로 tiger 객체이기 때문에, sayHello 매서드 내부의 this 키워드가 가리키는 것은 바로 tiger 객체 자체를 참조하게 된다.(이것은 일종의 자바스크립트의 법칙과도 같다.) 즉, 호출한 객체의 자체를 바라보게 되는 것인데 살짝 예제를 틀어서보면 재밌는 부분을 발견할 수 있다.

```javascript
Animal.prototype.name = "강아지";
// 강아지가 말합니다. 난 강아지인데?!!!
Animal.prototype.sayHello('난 강아지인데?!!!');
```

첫 번쨰 예제와 두 번쨰 예제의 차이점은 sayHello() 매서도를 호출한 객체가 달라졌다는 부분이다. 다시 말해, 첫 번째 예제에서 sayHello()를 호출한 객체는 tiger 객체이기 때문에 this 키워드가 가리키는 객체는 tiger 객체가 되는 것이고, 두 번째 예제에서 sayHello()를 호출한 객체가 Animal.prototype 객체이기 때문에 this가 가리키는 녀석이 바로 Animal.prototype이 되는 것이다.
> 정리해서, **객체의 속성(프로퍼티)가 매소드일 경우 이를 호출한 this는 호출한 객체에 바인딩된다** 가 결론이다.


## 디플트 프로토타입 링크
함수를 작성하면 기본적으로 디폴트 프로토타입 영역이 생성이 된다. 이 디폴트 프로토타입 영역은 constructor 라는 속성을 가지는데 constructor 단어 그 자체의 의미처럼 작성한 함수 객체를 참조하는 프로퍼티이다. 그런데 재밌는 부분은 이 디폴트 프로토타입 객체는 개발자에 의해서 변경이 가능하다는 점이다. 그렇기 때문에 프로토타입 객체의 참조 관계를 임의로 개발자가 변경하여 사용하는 것이 가능하다.

```javascript
function Weapon(name){
    this.name = name;
}
var machineGun = new Weapon('머신건');

// 1번 문제
machineGun.__proto__.constructor === Weapon.prototype.constructor

Weapon.prototype = {
    sayWeaponName : function(){
        return this.name;
    }
}

var newGun = new Weapon('뉴건');

// 2번 문제
machineGun.__proto__ === newGun.__proto__
```

첫 번째 문제의 경우, Weapon 생성자 함수의 인스턴스인 machineGun의 프로토타입 링크는 Weapon 생성자 함수 객체의 프로토타입 영역을 가리키고 있기 때문에 두 객체의 constructor 는 동일한 녀석인 Weapon 생성자 함수를 가리키게 된다.


두 번째 문제의 경우, machineGun의 프로토타입 링크가 끊어지지 않은 상태에서 Weapon 함수 객체의 프로토타입 영역을 다른 객체로 대체했다. 이렇게 되면 기존 machineGun의 프로토타입 링크는 그대로 유지되는 반면에 새롭게 생성되는 newGun 객체의 프로토타입 링크는 새롭게 정의된 프로토타입 객체를 바라보게 되면서 2번 문제의 경우 다른 객체를 바라보게 됨에 따라 "false"인 결과가 나오게 된다.

## 참고
- [인사이드 자바스크립트](http://book.naver.com/bookdb/book_detail.nhn?bid=7400243)
- [자바스크립트 객체지향 프로그래밍](http://book.naver.com/bookdb/book_detail.nhn?bid=6960939)
