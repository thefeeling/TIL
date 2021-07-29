# [ES6] - default parameter / spread operator / rest parameter

## default parameter(디폴트 파라미터)
거창하게 디폴트 파라메터라고 하는데, 별건 없고 함수에서 파라미터/인자 값에 대하여 기본값을 지정하는 ES6 구현 내용이다.

```javascript
function printFriendsName(a,b){
	console.log("친구 1 : " + a);
	console.log("친구 2 : " + b); 
}
```

친구 이름을 출력하는 함수를 가지고 설명을 간단하게 할 수 있을꺼 같다. 이런 함수가 있다면 일반적으로 인자 값에 대하여 기본 값을 지정하기 위해서는 이런 코딩을 주로 해왔을꺼 같다.

```javascript
function printFriendsName(a,b){
	a = (a === undefined) ? "내가 친구가 없다니!!!!" : a;
	b = (b === undefined) ? "내가 진짜 없는거야?????" : b;
	console.log("출력을 해보자! :  " + a + " " + b);
}
printFriendsName();
```

```
[출력 결과]
출력을 해보자! :  내가 친구가 없다니!!!! 내가 진짜 없는거야?????
```

문자열을 넘기기 때문에 간단하게 보이지만, 만약 인자에서 객체나 다른 복잡한 프로퍼티를 받는 상황이라면 상황은 좀 더 복잡할 수 있을 것이다. 

ES6에서는 이런 코드를 간단하게 줄이고자 엔진 자체에서 파라미터/인자에 기본 값을 할당할 수 있도록 구현할 수 있는 문법을 추가했다. 그것이 바로 **디폴트 파라미터**라 불리는 녀석이다. 그렇다면 위 코드에 디폴트 파라미터를 지정하여 바꿔보도록 하자.

```javascript
function printFriendsName(
	a = "내가 친구가 없다니!!!!",
	b = "내가 진짜 없는거야?????"){
	console.log("출력을 해보자! :  " + a + " " + b);
}
printFriendsName();
```

```
[출력 결과]
출력을 해보자! :  내가 친구가 없다니!!!! 내가 진짜 없는거야?????
```

출력 결과도 동일하고 코드가 한결 간단해졌다. 결정적으로 인자 정합성에 대한 코드가 빠졌기 때문에 로직도 한결 간단해보인다.

기본 타입의 값뿐만 아니라, 참조 타입의 디폴트 파라미터 지정도 가능하다.

```javascript
function referencesTypeDefaultParameterTest(
	a = {},
	b = [],
	c = function(){}){
	console.log("참조 타입도 사용이 가능해요")
	console.log("인자 타입 체크 : " + typeof a);
	console.log("인자 타입 체크 : " + typeof b);
	console.log("인자 타입 체크 : " + typeof c);	
}

referencesTypeDefaultParameterTest();

function expressionDefaultParameterTest(
	a = 1+2+3){
	console.log("표현식 사용이 가능해요.")
	console.log(a);
}

expressionDefaultParameterTest();
```

```
[출력 결과]
객체 타입도 사용이 가능해요
인자 타입 체크 : object
인자 타입 체크 : object
인자 타입 체크 : function
표현식도 사용이 가능해요.
6
```

## spread operator(펼침 연산자)
**...** 으로 포기되며 객체 순회가 가능한 객체를 개별 인자나 값으로 나누는 구문 요소가 추가되었다. 
펼침 연산자는 함수의 파라미터 혹은 인자가 여러개 필요한 곳에서 사용이 가능하다.(배열이 대표적임)

```javascript
function spreadArrTestFunc(a,b){
	return a+b;
}
console.log(spreadArrTestFunc(...[1,2]));
```

```
[출력 결과]
3
```

엔진 내부적으로는 ...[1,2]를 ... 연산자가 붙으면 1,2로 치환하고 이를 함수 호출 시 인자로 넘기는 것이다. 이는 이터러블 규약으로 ES6에 정해진 일종의 PROTOCOL이라고 한다.

값이 여러개 사용되는 배열같은 곳에서도 활용이 될 수 있는데, 사용할 수 있는 경우를 여러개로 나눠서 간단하게 샘플 코드를 짜봤다.


```javascript
let arr1 = [1,2];
let arr2 = [3,4,5];
let arr3 = [...arr1, ...arr2];

console.log(arr3);

let arr4 = [1,2];
let arr5 = [3,4,5];

arr4.push(...arr5);
console.log(arr4);
```

```
[출력 결과]
[ 1, 2, 3, 4, 5 ]
[ 1, 2, 3, 4, 5 ]
```

여러 개의 값을 가지고 있는 배열을 펼치기 연산을 통하여 통합하거나 배열의 끝자리에 붙이는게 상당히 간편한 것을 확인할 수 있다.


## rest parameter(나머지 파라미터)
말 그대로 나머지 파라미터로 함수에서 사용되며 함수 인자/파라미터 마지막에 "..."을 붙여서 가변적으로 넘어올 수 있는 함수 인자/파라미터를 배열로 바인딩할 수 있다. 
물론 argument를 활용하면 비슷한 기능을 흉내낼 수 있겠지만 argument 같은 경우에는 정확하게 배열이 아닌 유사배열이기 때문에 어느 정도 차이가 존재한다.


```javascript
function printNumbers(a,b,...nums){
	console.log(Array.isArray(nums));
	console.log(a,b,nums);
}
printNumbers(1,2,3,4,5,6,7,8,9);
```

```
[출력 결과]
true
1 2 [ 3, 4, 5, 6, 7, 8, 9 ]
```

넘어온 나머지 파라미터의 타입이 배열임을 확인하고 값을 출력하는 간단한 함수를 만든 결과이다.