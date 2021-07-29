
> 본 글은 [How to make sense of Kotlin coroutines](https://proandroiddev.com/how-to-make-sense-of-kotlin-coroutines-b666c7151b93)을 읽고 발번역(?)한 내용입니다. 영어에 유창한 분들은 링크를 참고해주세요.

코루틴은 완벽하게 읽고 유지 보수가 가능한 비동기 코드를 작성하는 좋은 방법이다. Kotlin은 단일 언어 구문으로 비동기 프로그래밍의 기본 요소를 제공하는데, 바로 `suspend` 키워드이다. 이 키워드와 함께 라이브러리 함수가 빛을 발합니다.

## What is a coroutine?
Kotlin팀은 `Coroutine`을 `경량 스레드: Light-Weighted-Thread`로 정의했습니다. **그것들은 실제 스레드가 실행 할 수 있는 일종의 작업입니다.** [Kotlinlang.org](https://kotlinlang.org/)의 배너는 다음과 같습니다.

![](https://cdn-images-1.medium.com/max/1600/1*OEX52nKgM1SHGO4l1mvV1A.gif)

가장 흥미로운 점은 스레드가 특정 "정지 지점"에서 코루틴 실행을 중지하고 다른 작업을 수행 할 수 있다는 것이다. 나중에 코루틴을 다시 시작하거나 다른 스레드가 처리 할 수 ​​있습니다.

따라서 정확성을 높이기 위해 하나의 코 루틴은 정확하게 하나의 "작업"이 아니라 오히려 특정 보장 된 순서로 실행되는 "하위 작업"의 순서입니다. 코드가 하나의 순차 블록에 있는 것처럼 보이더라도 정지 기능에 대한 각 호출은 동시 루틴 내의 새로운 "하위 작업"의 시작을 제한합니다.

이는 우리에게 `suspending functions`에 관련된 주제를 다시 던져준다.

## Suspending functions
당신은 어쩌면 kotlinx의 `delay` 또는 Ktor의 `HttpClient.post`와 같은 함수를 발견 했을 수도 있는데, 이 함수들은 반환되기 전에 무언가를 기다리거나 집중적으로 작업해야하며 suspend 키워드로 표시되어있을 수 있습니다.

```kotlin
suspend fun delay(timeMillis: Long) {...}
suspend fun someNetworkCallReturningValue(): SomeType {
 ...
}
```
우리가 위에서 본 것처럼 이를 `suspending function`이라고 합니다.

> 일시 중단 함수는 현재 스레드를 차단하지 않고 현재 코루틴의 실행을 일시 중단 할 수 있습니다.

다시 말해, 당신이 보고 있는 코드가 `suspending function`을 호출하는 순간에 실행을 중지 할 수 있으며 나중에 다시 시작 될 수도 있다는 이야기이다. **그러나, 그 동안 현재 쓰레드가 무엇을 할 지에 대해서는 아무 말도 하지 않는다.**

그 시점에서 또 다른 coroutine을 실행하는 것으로 돌아갈 수 있으며, 나중에 우리가 남긴 coroutine을 다시 실행할 수 있습니다. 이 모든 것은 일시 중지되지 않는 함수 세계에서 일시 중지 함수를 호출하는 방법에 의해 제어되지만 함수 일시 중단에 대해 본질적으로 비동기는 없습니다.

> 일시 중단 기능은 명시 적으로 사용되는 경우에만 비동기식입니다.

우리는 나중에 이것을 보게 될 것이다. 그러나 지금 당장은 함수를 일시 정지하는 것으로 생각하면 잠시 시간을내어 선언하는 특수 함수로 간주 할 수 있습니다. 그리고 그들은 암시적으로 스레드의 복잡성과 파견에 대해 걱정할 필요없이 함수를 하위 작업으로 암시 적으로 분할한다는 점을 명심하십시오. 그것이 실제로 그들이 훌륭한 이유입니다. 여러분이 내부에있을 때 걱정할 필요가 없습니다.

### The suspending world is nicely sequential
아마 `suspending function`에 특별한 반환 유형이 없는 것을 알아차렸을 수 있다. Java의 `Future` 또는 JavaScript의 `Promise`과 같은 래퍼가 필요하지 않습니다. 이것은 `Promise`을 반환하는 JavaScript의 비동기 함수와 달리 일시 중단 함수가 비동기 적이라는 사실을 강조합니다.

> 내부 정지 함수로부터, 함수 호출에 대해 순차적으로 추론 할 수 있습니다.

이것이 바로 비동기식 소재를 Kotlin에서 쉽게 추론 할 수 있게 하는 이유이다. `suspending function` 내에서 다른 `suspending function`에 대한 호출은 일반 함수 호출과 같이 작동합니다. 우리는 반환 값을 얻고 나머지 코드를 실행하기 전에 호출 된 함수의 실행을 기다릴 필요가 있다.

```kotlin
suspend fun someNetworkCallReturningSomething(): Something {
    // some networking operations making use of the suspending mechanism
}

suspend fun someBusyFunction(): Unit {
    delay(1000L)
    println("Printed after 1 second")
    val something: Something = someNetworkCallReturningSomething()
    println("Received $something from network")
}
```

이것이 나중에 복잡한 비동기 코드를 간단한 방법으로 작성할 수 있게 해줍니다.

### Bridging the normal world and the suspending world
일반 함수에서 `suspending function`을 직접 호출하면 컴파일 할 수 없다. 이에 대한 일반적인 설명은 *`coroutines` 만 일시 중단 될 수 있기 때문에* 이라고 설명하고 있다. 이런 설명을 통해 우리는 `suspending function`을 수행 할 `coroutine`을 생성해야 한다는 결론을 내릴 수 있다.

개념적으로 함수를 일시 중단하는 것은 선언에서 "실행하는 데 약간의 시간이 걸릴"수 있습니다. 자신이 일시 중지 기능이 아니라면 다음 두 가지 중 하나를 명시 적으로 수행해야합니다.

- 기다리는 동안 실제로 스레드를 차단합니다 (일반적인 함수 호출과 같이).
- 비동기로 시작하여 즉시 수행하고 (여러 가지 가능한 방법으로 수행 할 수 있음)

선택을 표현하는 방법으로 코 루틴 (coroutine)을 생성하는 것을 볼 수 있습니다. 명시 적이어야합니다 (그리고 이것은 대단합니다!) 이것은 coroutine 빌더라고하는 함수를 사용하여 수행됩니다.

## Coroutine builders
`Coroutine Builder`는 주어진 `suspending function`을 실행하는 새로운 `Coroutine`을 작성하는 간단한 함수입니다. 이러한 `Coroutine Builder`는 `suspending function`이 아닌 일반 함수에서 호출될 수 있는데, 왜냐하면 이러한 빌더 함수들은 `suspending function`이 아니기 때문입니다. 마치 일반 함수와 `suspending function` 함수 세계와의 가교 역할을 수행한다고 생각하시면 편합니다.


Kotlin 표준 라이브러리에는 여러 가지 `Coroutine Builder`가 포함되어있어 다양한 작업을 수행 할 수 있습니다. 다음 하위 절에서 몇 가지를 볼 것입니다.

### Block the current thread with “runBlocking”
코틀린의 일반 함수에서 `suspending function`을 다루는 가장 간단한 방법은 현제 실행 중인 스레드를 블록하고 기다리는 방법입니다. 현재 스레드를 블록하는 `Coroutine Builder` 함수는 바로 `runBlocking`입니다. 

```kotlin
fun main() { 
    println("Hello,")
    
    // 주어진 suspending lambda function을 실행하는 코루틴을 만들 수 있으며
    // 그리고 현재 실행중인 스레드를 해당 함수의 실행이 마무리 될떄까지 블락합니다.
    runBlocking {
        // coroutine 함수 내부, 함수는 2초동안 정지상태로 유지됨.
        delay(2000L)
    }
    
    // 아래 코드는 2초 뒤에 실행됨
    println("World!")
}
```

`runBlocking`의 컨텍스트에서 주어진 `suspending function`과 호출 계층 구조에 있는 자식은 실행이 끝날 때까지 현재 스레드를 효과적으로 차단합니다. `runBlocking`에 전달 된 함수는 서명에서 알 수 있듯이 runBlocking 자체가 일시 중지되지 않고 (스레드 블로킹 인 경우에도) 일시 중단 함수입니다.

![](https://i.imgur.com/i5aj0dj.png)

`main()` 함수에서 일종의 최상위 코루틴을 제공하고 JVM을 활성 상태로 유지하는 데 종종 사용됩니다 (구조화 된 동시성에 대한 섹션에서 볼 수 있습니다).

### Fire-and-forget with “launch”
일반적으로 `coroutine`의 핵심은 스레드를 블록하는 것이 아니라 비동기 작업을 시작하는 것입니다. `launch`이라는 `Coroutine Builder`는 백그라운드에서 `coroutine`을 시작하고 그동안 계속 작업 할 수 있게 합니다.

Kotlin 문서를 통해 아래와 같은 예제를 확인 할 수 있다.

```kotlin
fun main() { 
    GlobalScope.launch { // 새로운 코루틴을 백그라운드에서 실행하고 이후 단계를 진행한다.
        delay(1000L)
        println("World!")
    }
    println("Hello,") // main thread continues here immediately    
    runBlocking {     // 그러나 이 표현식은 현제 실행중인 스레드를 블락한다.
        delay(2000L)  // 우리가 2초 가량 대기하는 동안에도 JVM은 살이 있는 상태를 유지한다.        
    } 
}
```

의견은 스스로에 대해 말해야합니다. 그러면 "Hello"가 즉시 인쇄되고 두 번째 후에 "World!"가 추가됩니다. 이 예제의 목적을 위해라도 어찌되었던간에 메인 함수를 블록해야 `launch`에서 무슨 일이 발생하는지 확인 할 수 있습니다. 그래서 JVM을 계속 유지하기 위해 `runBlocking`을 여기에서 다시 사용하고 있습니다.

### Get a result asynchronously with “async”
다음은 값을 반환하는 비동기 작업을 수행 할 수 있는 `async`라는 또 다른 `Coroutine Builder`입니다.

```kotlin
fun main() {
    val deferredResult: Deferred<String> = GlobalScope.async {
        delay(1000L)
        "World!"
    }
    
    runBlocking {
        println("Hello, ${deferredResult.await()}")
    }
}
```

지연 값의 결과를 얻으려면 async가 편리한 Deferred 객체를 반환합니다. 이는 자바의 `Future` 또는 자바스크립트의 `Promise`와 같습니다. 지연 값에 대해 `await`를 호출함으로써 결과를 기다리고 획득 할 수 있습니다.

`await`는 일반적인 블록킹 함수가 아닌 `suspending function`입니다. 이말인 즉슨, 메인 함수에서 호출 할 수 없다는 것을 의미합니다. 결과를 기다리기 위해 실제 main 함수를 블록해야 해야 되며 그래서 여기서 `runBlocking`을 사용하여 호출을 대기시킵니다.

날카로운 눈빛을 가진 사람들은 GlobalScope를 다시 보았을 수 있습니다. 그래서 이제 GlobalScope에 대해 이야기 하려고 합니다.
GlobalScope란 coroutines의 계층을 만들 수 있는 도구라고 볼 수 있습니다. Kotlin팀은 이를 구조화 된 동시성([structured concurrency](https://kotlinlang.org/docs/reference/coroutines/basics.html#structured-concurrency))이라 부르고 있습니다.

## Structured concurrency
만약 위에서 봤던 예제들을 잘 따라왔다면, 고전적인 "블록을 완료하고 내 코루틴이 끝날 때까지 기다리는" 패턴을 알아야 할 필요가 있음을 눈치 챘을 것이다.

Java에서는 위에서와 같은 패턴을 구현하는 방법으로 대개 스레드에 대한 참조를 유지하고 모든 스레드를 기다리는 동안 주 스레드를 블록하기 위해 스레드에 대한 참조를 유지하고 모든 스레드에 대한 join을 호출하여 결과를 얻습니다. 우리는 Kotlin의 coroutine을 이용하여 비슷한 일을 할 수 있습니다. 그러나 이것은 전혀 관용적이지 않습니다.

Kotlin에서는 `coroutines`을 계층 구조로도 생성 할 수 있습니다. 이 계층 구조를 사용하면 부모 coroutine이 자동으로 자식 coroutines의 수명주기를 관리 할 수 ​​있습니다. 예를 들어, 하위 코루틴의 실행이 완료 할 때까지 기다리는 일도, 그 중 하나에서 예외가 발생하는 경우 모든 하위 코루틴의 실행을 취소 할 수 있습니다.


### Creating a hierarchy of coroutines
`coroutine`에서 호출하면 안되는 `runBlocking`을 제외하고 모든 `Coroutine Builder`는 `CoroutineScope` 클래스의 확장 함수 형태로 선언되어 있는데, `coroutine`을 구조화하도록 권장합니다.

```kotlin
fun <T> runBlocking(...): T {...}
fun <T> CoroutineScope.async(...): Deferred<T> {...}
fun <T> CoroutineScope.launch(...): Job {...}
fun <E> CoroutineScope.produce(...): ReceiveChannel<E> {...}
...
```

Coroutine을 생성하려면 GlobalScope (최상위 수준, Top-Level Coroutine) 또는 이미 존재하는 `CoroutineScope` (해당 범위의 자식 Coroutine)에서 이러한 빌더를 호출해야합니다.


In fact, if you write a function that creates coroutines, you should declare it as an extension of the CoroutineScope class too
사실, `coroutine`을 만드는 함수를 작성한다면 `CoroutineScope` 클래스의 확장으로 선언해야합니다. 이는 관례적으로 `Coroutine Builder`를 쉽게 호출 할 수 있게 해주는데, 왜냐하면 `Coroutine Scope`에 대한 참조를 `this`를 통하여 할 수 있기 때문입니다.

`Coroutine Builder`의 매소드 시그니처를 살펴보면 매개 변수로 사용하는 `suspending function`이 `CoroutineScope` 클래스의 확장 기능으로 정의되어 있음을 알 수 있습니다.

```kotlin
fun <T> CoroutineScope.async(
    ...
    block: suspend CoroutineScope.() -> T
): Deferred<T> {
    ...
}
```

이는 수신자를 지정하지 않고도 그 함수의 내부에서 다른 `Coroutine Builder`를 호출 할 수 있음을 의미합니다. 그리고, 암시적인 수신자는 현재 코루틴의 자식 스코프가 될 수 있습니다. 이때 현재 코루틴은 부모로서의 역할을 수행하게 됩니다.

이전 예제를 보다 관용적인 방식으로 구조화 하는 방법은 아래와 같습니다.
```kotlin
fun main() = runBlocking {
    val deferredResult = async {
        delay(1000L)
        "World!"
    }
    println("Hello, ${deferredResult.await()}")
}

fun main() = runBlocking { 
    launch {
        delay(1000L)
        println("World!")
    }
    println("Hello,")
}

fun main() = runBlocking {
    delay(1000L)
    println("Hello, World!")
}
```

범위가 wrapping runBlocking 호출에 의해 제공되기 때문에 더 이상 GlobalScope가 필요하지 않습니다. 또한 자식 `Coroutine`이 끝날 때까지 기다릴 필요가 없습니다. `runBlocking`은 모든 자식이 자신의 실행을 완료하기 전에 완료 될 때까지 기다릴 것이므로 주 스레드는 `runBlocking`에 의해 블록 상태를 유지합니다.


### The coroutineScope builder
`runBlocking`을 사용하는 것은 `coroutine` 내부에서 권장하지 않을 수 있음을 알 수 있을 것이다. 이는 Kotlin팀이 `coroutine` 내부에서 현재 스레드가 블록되지 않길 원하기도 했고, 대신 `suspending function`을 사용하길 권하고 있습니다. runBlocking에 해당하는 중단은 coroutineScope 빌더입니다.

`coroutineScope`는 모든 자식 코루틴이 실행을 완료 할 때까지 현재의 coroutine을 일시 중단합니다. 다음은 Kotlin 문서에서 직접 취한 예제입니다:

```kotlin
fun main() = runBlocking { // this: CoroutineScope
    launch { 
        delay(200L)
        println("Task from runBlocking")
    }
    
    coroutineScope { // Creates a new coroutine scope
        launch {
            delay(500L) 
            println("Task from nested launch")
        }
    
        delay(100L)
        println("Task from coroutine scope") // This line will be printed before nested launch
    }
    
    println("Coroutine scope is over") // This line is not printed until nested launch completes
}
```

## Beyond the basics
여기에서 설명하는 기본 구성 요소는 실제로 코 틀린의 coroutines 개념의 가장 큰 측면이 아닙니다. 우리는 `channel`, `producer` 및 `consumer` 등을 사용하여 동시성이 필요한 것을 정말 멋지게 표현하기 위해 `coroutine`을 사용할 수 있습니다. 그러나 우리는 먼저 이러한 빌딩 블록을 이해해야하며 그 위에 더 높은 추상화를 만들기 시작해야한다고 생각합니다.

`coroutine`에 관해서는 많은 이야기가 있습니다.이 기사는 물론 표면적인 내용이 많긴 하지만, 이 글이 코루틴과 `suspending function`을 더 잘 이해하는데 도움이 되기를 바랍니다.

특정 부분에 대해 더 궁금하거나 이 글이 도움이 된다면 저에게 알려주시면 좋을꺼 같습니다. 만약 자잘한 실수가 보이면 망설이지 말고 알려주시구요.


## Very helpful resources
조금 시간을 할애 할 수 있다면, Kotlin Conf에서 Roman Elizarov가 발표했던 코루틴 관련 영상을 보시길 추천합니다. 

### Coroutines in practice
이 강연에서 Roman은 코루틴에 대해 아주 빠르게 요약하고 이어서 `channels`, `actors` 등을 사용하여 코루틴을 아주 잘 사용하는 방법을 설명하고 있습니다.

- [KotlinConf 2018 - Kotlin Coroutines in Practice by Roman Elizarov](https://www.youtube.com/watch?v=a3agLJQ6vt8)


### Kotlin conf 2017
2017 Kotlin conf에서 발표했던 내용 역시 여전히 유용합니다.
- Introduction to Coroutines : 이것은 기본적으로 내 기사의 내용이지만 보다 정확하고 나은 설명이 포함되어 있습니다
- Deep Dive into Coroutines : 함수 및 coroutine을 실제로 중단시키는 방법에 대한 세부 정보를 설명합니다. 매우 계몽적인
