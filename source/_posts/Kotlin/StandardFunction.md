---
title: '표준함수'
date: 2019/7/16 00:00:00
categories:
- Kotlin
---

# 표준함수
### 개요
코틀린 코드를 보다보면 람다를 인자로 받는 `표준함수`를 사용하여 작성한 코드를 심심찮게 구경할 수 있게 된다. 표준함수를 잘 활용하면 중복으로 발생할 수 있는 코드를 많이 줄일 수 있고 여러모로 편한 부분이 존재한다. 표준함수로 널리 사용하는 `run`, `apply`, `let`, `also`, `with`, `takeIf`에 대해서 내용 정리를 해보려고 한다.

위에 나열한 함수들은 코틀린의 대표적인 `확장함수`이며 확장함수를 실행하는 주체를 가리켜서 `수신자` 혹은 `수신객체`라고 한다. 수신자는 확장함수 호출 시 람다에 참조가 전달된다. 

### apply
수신자 객체를 구성하는 목적으로 사용하며, 람다 내부에서 수신자에 속한 함수들을 연속적으로 호출할 수도 있다. 주로 반복되는 코드의 양을 줄이기 위해서 사용된다.

```kotlin
val menuFile = File("menu-file.txt")
menuFile.setReadable(true)
menuFile.setWritable(true)
menuFile.setExecutable(false)
```
위와 같은 코드가 있다고 할때, apply를 사용하면 아래와 같이 반복되는 참조인 menuFile을 생략하여 사용할 수 있다.
```kotlin
val menuFile = File("menu-file.txt").apply {
	setReadable(true)
	setWritable(true)
	setExecutable(false)
}
```
인자로 전달하는 람다 내부에서의 모든 함수 호출이 수신자 객체와 관련되는데, 이를 가리켜서 연관 범위 혹은 암시적 호출이라고 한다.

### let
let 함수의 인자로 전달되는 람다를 실행한 결과를 반환한다. 이전 apply 함수와 다른 점은 apply의 경우 수신자 객체를 그대로 반환하지만 let의 경우 람다의 마지막 혹은 명시적으로 리턴한 값을 반환하게 된다.

```kotlin
val firstItemSquared = listOf(1,2,3).first().let {
	it * it
}
```
만약 위 코드와 같이 리스트에서 첫 번째 값을 제곱해야 하는 코드가 있다고 하면 let을 사용하면 간단하게 라인 수를 줄여볼 수 있다. 만약 이러한 코드를 let을 사용안하고 사용하면 아래와 같이 작성해볼 수 있다.
```kotlin
val firstElement = listOf(1,2,3).first()
val firstItemSquared = firstElement * firstElement
```
라인 수는 줄지 않았지만 변수 선언이 하나 늘어난 것을 볼 수 있다. 사실 let의 강력함은 null에 제어를 해야 할 상황에 있다.

```kotlin
fun formatGreeting(vipGuest: String?): String {
	return vipGuest?.let {
		"Hello $it, We Ready"
	} ?: "We Ready"
}
```
널이 가능한 변수에 대해서 엘비스 연산자와 함께 사용하는 예제인데, vipGuest의 값이 만약 null로 호출된다면 엘비스 연산자 이후 부분이 반환될것이며, 그렇지않고 문자열 값이 잘 들어온다면 let 이하의 람수 함수의 마지막 줄이 반환될 것이다.

만약 let과 엘비스 연산자를 사용안하는 코드라면 아래와 if/else의 구성으로 작성해볼 수 있는데 코드의 indent가 늘어나기도 하고 다소 장황해보인다.
```kotlin
fun formatGreeting(vipGuest: String?): String {
	return if (vipGuest != null) {
		"Hello $it, We Ready"
	} else "We Ready"
}
```

let은 어떤 종류/타입의 수신자 객체에서도 호출할 수 있으며, 위에서 설명한대로 람다의 실행 결과(리턴/마지막 라인)를 반환한다. apply와의 차이점을 다시 말하자면, apply의 경우 호출하는 수신자 객체를 전달하지 않지만, let의 경우 호출하는 수신자 객체를 참조로 전달하게 된다. 

```kotlin
"OLD".let {
	it = "NEW" // 변경 불가능
}
```
또한, let이 람다에 전달하는 수신자 객체의 인자 값은 불변으로 변경이 불가능하다.

### run
```kotlin
val menuFile = File("menu-file.txt")
val servesDragonBreath = menuFile.run {
	readText().contains("Dragon's Beath)
}
```
run의 경우 apply와 마찬가지로 람다 내부에서 같은 접근 범위를 가진다. 차이점은 run의 경우 let과 마찬가지로 람다 본문의 마지막 라인/리턴 구문에 의하여 값이 반환된다는 점이다. 

```kotlin
fun nameIsLong(name: String) = name.length >= 20

"Object".run(::nameIsLong)
```
함수에 대한 참조 연산자(::)를 사용하여 인자로 전달하는 코드이다. run을 유용하게 사용할 수 있는 케이스는 아래와 같이 연속적인 함수 호출의 경우이다. 

```kotlin
fun nameIsLong(name: String) = name.length >= 20
fun playerCreateMessage(nameTooLong: Boolean): String {
	return if (nameTooLong) {
		"Too Long"
	} else "Short"
}

"Object"
.run(::nameIsLong)
.run(::playerCreateMessage)
.run(::println)
```
run을 사용하지 않고 함수 호출을 연속적으로 해야 한다면 아래와 같이 작성해야 할 것이다.

```kotlin
println(playerCreateMessage(nameIsLong("Object")))
```

중첩 함수 호출의 경우 코드의 가독성적인 측면에서 이해하기 어렵다고 할 수 있다. 왜냐하면 최초 호출 함수가 가장 안쪽부터 시작하기 때문에도 그렇고 호출 연산자를 중첩하여 사용하기 때문에 코드를 바로 보고 이해하기 어려울 수 있기 때문이다.

### with
with의 경우 run과 비슷하지만, 수신 객체를 지정하여 사용한다는 차이점이 있다.
```kotlin
with("Object") {
	length >= 20
}
```
run과 마찬가지로 람다 마지막 라인/명시적인 리턴으로 값이 반환한다.

### also
also의 경우 let과 유사하게 작동한다. 하지만 also의 경우 람다의 결과를 반환하지 않고 수신객체 자신을 반환한다. 그렇기 때문에 also를 연속적으로 사용할 경우, 연속적으로 같은 수신객체를 참조하는 람다를 실행할 수도 있다.
```kotlin
var fileContents: List<String>
File("file.txt)
.also { println(it.name) }
.also { fileContents = it.readLines() }
```

### takeIf
개인적으로 아마 가장 유용하게 사용할 수 있는 확장함수라고 생각하는 `takeIf`이다. 람다에 제공된 조건식(predicate)를 실행한 후 결과에 따라 true 또는 false를 반환한다. 결과가 true이면 수신 객체가 반환되며, false일 경우 null을 반환한다. 

```kotlin
val fileContents = File("myFile.txt")
		.takeIf { it.canRead() && it.canWrite() }
		?.readText() ?: ""
```
위 코드에서 볼 수 있듯이, 변수에 값을 지정하는 데 어떤 조건, 또는 처리를 계속하기 전에 만족되어야 하는 조건을 검사하는 데 유용하다. if와 비슷한 개념이지만 참조변수가 필요없고 특정 객체의 함수를 직접 호출할 수 있다는 장점이 있다.

### takeUnless
`takeIf`와 반대로 실행한 결과가 `takeUnless`이다. 지정한 predicate가 false일 경우 원래 객체를 반환하며 true일 경우 null을 반환하게 된다. 코드를 이해하기 힘들 수 있으므로 `takeIf`를 사용하는 것이 차라리 나을거 같다.

|함수     |수신자를 람다의 인자로 전달  |연관 범위 유무  |반환         |
|--------|----------------------|-------------|-----------|
| `let`    | O(it 참조)            | X           | 람다의 결과  |
| `apply`  | X(this 참조, 생략가능)  | O           | 수신객체     |
| `run`    | X(this 참조, 생략가능)  | O           | 람다의 결과  |
| `with`   | X(this 참조, 생략가능)  | O           | 람다의 결과  |
| `also`   | O(it 참조)            | X           | 수신객체    |
| `takeIf` | O(it 참조)            | X           | 수신객체의 nullable 형태  |

