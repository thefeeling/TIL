

----
## 10장
#### 레시피 10.1 - use로 리소스 관리하기
- 코틀린에서는 자바의 `try-with-resources` 구조를 지원하지 않음
- 대신, `Closeable` 인터페이스의 확장함수 `use`를 제공하며, `Reader`와 `File`에는 `useLine` 확장함수를 추가
-`useLine`의 경우, `BufferedReader.use`에게 처리를 위임하며, 해당 확장함수는 `try-catch-finally`로 예외처리를 하는 전형적인 구조를 확장함수로 만들어놓았음
```kotlin
@InlineOnly
@RequireKotlin("1.2", versionKind = RequireKotlinVersionKind.COMPILER_VERSION, message = "Requires newer compiler version to be inlined correctly.")
public inline fun <T : Closeable?, R> T.use(block: (T) -> R): R {
    var exception: Throwable? = null
    try {
        return block(this)
    } catch (e: Throwable) {
        exception = e
        throw e
    } finally {
        when {
            apiVersionIsAtLeast(1, 1, 0) -> this.closeFinally(exception)
            this == null -> {}
            exception == null -> close()
            else ->
                try {
                    close()
                } catch (closeException: Throwable) {
                    // cause.addSuppressed(closeException) // ignored here
                }
        }
    }
}
```

```kotlin
fun get10LongestWordsInDictionary() = File("/usr/share/dict/words").useLines { line ->
    // line type Kotlin Sequence
    line.filter { it.length > 20 }
        .sortedByDescending { it.length }
        .take(10)
        .toList()
}
```

#### 레시피 10.2 - 파일에 기록하기
- 본문 전체를 다시 쓰고 싶다면 `writeText`, 붙여쓰고 싶다면 `appendText`
- 위 확장함수도 역시, `FileOutputStream(this).use { it.write(array) }` 확장함수에게 처리를 위임
```kotlin
val file = File("./myfile.txt")
file.writeText("Data")
file.appendText("\nHello")
file.appendText("\nWorld")
```

----
## 11장
#### 레시피 11.1 - 코틀린 버전 알아내기
- `KotlinVersion.CURRENT`을 참조하면 시멘틱버져닝 형태의 코틀린 버젼 값을 알아낼 수 있음.
- `KotlinVersion`의 구현을 살펴보면 쉽게 알 수 있지만, Comparable 인터페이스를 구현하고 있으므로 비교가 가능
```kotlin
println("version = ${KotlinVersion.CURRENT}")
println("${KotlinVersion.CURRENT < KotlinVersion(major = 1, minor = 2)}")
println("${KotlinVersion.CURRENT < KotlinVersion(major = 1, minor = 2, patch = 41)}")
```

#### 레시피 11.2 - 반복적으로 람다 실행하기
- `repeat` 확장함수를 사용하면, 인자로 넘어가는 람다 구문이 지정한 횟수만큼 실행됨.
- `contract`: 컴파일러에게 함수의 호출횟수와 타입캐스팅을 도와주기위해 도입
- `@InlineOnly`: 자바 상호 운용을 할때, 자바쪽에서 해당 구현을 참조하지 못하도록 마킹 역할 수행

```kotlin
@kotlin.internal.InlineOnly
public inline fun repeat(times: Int, action: (Int) -> Unit) {
    contract { callsInPlace(action) }

    for (index in 0 until times) {
        action(index)
    }
}
```

#### 레시피 11.3 - 완벽한 When 강제하기
- 코틀린에서의 `When`절은 문과 식의 역할을 모두 할 수 있다.
- 식으로 사용하는 경우, `else`까지 붙여 완벽한 형태로 사용해야 함.
- 문으로 사용할 경우, 완벽하게 else까지 붙여서 사용할 수 있도록 강제도 할 수 있음. `exhaustive` 확장 속성을 추가하면 가능하다.
  * *TODO: Kotlin 1.3.72 환경에서 구문 에러가 발생.*
```kotlin
fun printMod3(n: Int) {
    when (n % 3) {
        1 -> println("$n % 3 = 0")
        2 -> println("$n % 3 = 1")
        3 -> println("$n % 3 = 2")
    }
}

fun printMod3SingleStatement(n: Int) = when (n % 3) {
    1 -> println("$n % 3 = 0")
    2 -> println("$n % 3 = 1")
    3 -> println("$n % 3 = 2")
    else -> println("problems")
}
```


#### 레시피 11.4 - 정규표현식과 함께 replace 함수 사용하기
- 문자열 중 부분 문자열을 수정하고 싶을 경우 `replace`함수를 사용.
```kotlin
// 1)
fun String.replace(
    oldValue: String,
    newValue: String,
    ignroeCase: Boolean = false
): String


// 2)
fun CharSequence.replace(
    regex: Regex,
    replacement: String
): String
```

- 1)의 `replace`의 경우 자바의 replaceAll과 동일
- 2)의 `replace`의 경우 첫 번째 인자의 타입의 Regex를 받기 때문에 1)과는 전혀 다른 메소드
- 아래는 간단한 회문(Palindrome) 예제
```kotlin
fun isPal(string: String): Boolean {
    val testString = string
            .toLowerCase()
            .replace("""[\W+]""".toRegex(), "")
    return testString == testString.reversed()
}

fun String.isPalindrome() = this.toLowerCase()
        .replace("""[\W+]""".toRegex(), "")
        .let { it == it.reversed() }
```

#### 레시피 11.5 - 바이너리 문자열로 변환하고 되돌리기
- 숫자를 바이너리 문자열로, 바이너리 문자열을 다시 숫자로 파싱할때 `toString(radix = 2)`, `toInt(radix = 2)`와 같은 함수를 사용하면 쉽게 가능
```kotlin
    @Test
    internal fun `paddedBinaryString`() {
        val strings = (0..15)
                .map { it.toString(radix = 2)
                .padStart(4, '0') }
        assertEquals(strings, listOf(
                "0000", "0001", "0010", "0011", "0100", "0101", "0110", "0111", "1000", "1001", "1010", "1011", "1100", "1101", "1110", "1111"
        ))

        assertEquals(strings.map { it.toInt(2) }, listOf(
                0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15
        ))
    }
```

#### 레시피 11.6 - 실행 가능한 클래스 만들기
- 클래스에서 `invoke` 연산자를 오버로딩 한다.
- 코틀린은 연산자 오버로딩을 기본으로 지원하고 있으며, 지원하는 [링크](https://kotlinlang.org/docs/reference/operator-overloading.html) 참고하면 된다.
- 아래는 오픈 API를 호출하여 JSON 응답을 Gson을 통하여 역직렬화 하는 예제이며, 이에 대한 실행은 `invoke` 연산자를 통하여 실행한다.
- 아래 코드를 보면 잘 알겠지만, 클래스를 인스턴스화하면 invoke 함수를 바로 호출하는 것이 가능하며, 필요하다면 메소드에 인자를 추가하는 것도 가능하다.

```kotlin
data class AstroResult (
    val message: String,
    val number: Number,
    val people: List<Assignment>
)

data class Assignment(
    val craft: String,
    val name: String
)

class AstroRequest {
    private val gson = Gson()

    operator fun invoke(): AstroResult = (
        gson.fromJson(URL("http://api.open-notify.org/astros.json")
            .readText(), AstroResult::class.java)
    )
}

@Test
internal fun `AstroRequest Test`() {
    val result = AstroRequest()()
    assertThat(result.message, `is`("success"))
    assertThat(result.number.toInt(), greaterThanOrEqualTo(0))
    assertThat(result.people.size, `is`(result.number.toInt()))
}
```

#### 레시피 11.7 - 경과 시간 측정하기
- `measureTimeMills` 혹은 `measureNanoTime`를 사용한다.
- 위 함수들은 람다를 인자로 받기 때문에 고차 함수이며 `inline`으로 선언 되어 있다. 실제 실행은 `System.currentTimeMillis` 메소드에게 위임한다.
```kotlin
public inline fun measureTimeMillis(block: () -> Unit): Long {
    val start = System.currentTimeMillis()
    block()
    return System.currentTimeMillis() - start
}
```

```kotlin
fun doubleIt(x: Int): Int {
    Thread.sleep(100L)
    println("doubling $x with on thread ${Thread.currentThread().name}")
    return x * 2;
}


fun exec() {
    println("${Runtime.getRuntime().availableProcessors()} processors")
    var time = measureTimeMillis {
        IntStream.rangeClosed(1, 6)
                .map { doubleIt(it) }
                .sum()
    }
    println("Sequential stream took ${time}ms")

    time = measureTimeMillis {
        IntStream.rangeClosed(1, 6)
                .parallel()
                .map { doubleIt(it) }
                .sum()
    }
    println("Parallel stream took ${time}ms")
}
```

- `IntStream`을 사용하여 sum을 구하는 예제이며, Parallel로 돌렸을때와 Sequential로 돌렸을 때의 경과 시간 측정을 위해 작성했다.


#### 레시피 11.8 - 스레드 시작하기
```kotlin
public fun thread(
    start: Boolean = true,
    isDaemon: Boolean = false,
    contextClassLoader: ClassLoader? = null,
    name: String? = null,
    priority: Int = -1,
    block: () -> Unit
): Thread
```

- 코틀린은 스레드를 쉽게 생성하고 시작할 수 있도록 확장 함수를 제공함.
- 잔여 스레드가 모두 데몬 스레드일 경우, 어플리케이션은 종료된다.

```kotlin
fun threadStart(isDaemon: Boolean = false, isJoin: Boolean = false) = (0..5).forEach {
    val sleepTime = Random.nextLong(0..1000L)
    val thread = thread(isDaemon = isDaemon) {
        Thread.sleep(sleepTime)
        println("${Thread.currentThread().name} for $it after $sleepTime")
    }
    if (isJoin) thread.join()
}
```
- 5개의 스레드를 생성하는 예제이며, 데몬스레드 유무에 따라 바로 종료될수도 아닐수도 있는 코드이다.
- 순차 실행을 원한다면 `join()` 메소드를 사용

#### 레시피 11.9 - TODO로 완성 강제하기
- 함수 구현을 완성하지 않으면 예외를 던지는 TODO 함수를 사용하면 된다.
```kotlin
@kotlin.internal.InlineOnly
public inline fun TODO(): Nothing = throw NotImplementedError()

@kotlin.internal.InlineOnly
public inline fun TODO(reason: String): Nothing = throw NotImplementedError("An operation is not implemented: $reason")
```
- 함수의 시그니처는 위와 같으며, `reason`에는 미구현에 대한 사유를 넣어주면 되고, 발생하는 예외는 `NotImplementedError`가 발생하며 해당 클래스의 상위 클래스와 인터페이스는 `Error - Throwable` 이다.


#### 레시피 11.10 - Random의 무작위 동작 이해하기
- 난수 생성은 자바와 같이 Random 클래스를 활용
```kotlin
@Test
fun `nextInt with no args gives any int`() {
    val value = Random.nextInt()
    assertTrue(value in Int.MIN_VALUE..Int.MAX_VALUE)
}

@Test
fun `nextInt with range gives value between 0 and limit`() {
    val value = Random.nextInt(10)
    assertTrue(value in 0..10)
}

@Test
fun `nextInt with min and max gives value between them`() {
    val value = Random.nextInt(5, 10)
    assertTrue(value in 5..10)
}

@Test
fun `nextInt with range returns value in range`() {
    val value = Random.nextInt(7..12)
    assertTrue(value in 7..12)
}
```
- `nextInt()`의 구현 부분을 살펴보면, 동반 객체에서 추상 클래스에 선언된 모든 메서드를 defaultPlatformRandom에 위임하고 있으며, 해당 defaultPlatformRandom은 internal로 선언되어 있음을 확인할 수 있다. 
- [코틀린 문서](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.random/-random/-default/)를 확인해보면 `On JVM this generator is thread-safe, its methods can be invoked from multiple threads.` 난수 생성 시 스레드 세이프한 성격을 보장한다고 나와 있다.

#### 레시피 11.11 - 함수 이름에 특수 문자 사용하기
- 작명하기 아주 어려운 상황 혹은 테스트에서만 사용하는 것을 권한다.
- 함수명을 백틱(``)으로 감싸 놓으면 특수 문자 등을 활용할 수 있다.
```kotlin
class TestClass {
    @Test
    fun `nextInt with min and max gives value between them`() { ... }
}
```

#### 레시피 11.12 - 자바에게 예외 알리기
- 코틀린의 모든 예외는 기본적으로 Unchecked Exception이다. 코틀린 컴파일러가 예외를 강제하지 않으며 굳이 잡는다면 try catch finally로 잡는 방법도 있지만 강제 사항은 아니다.
- 자바에서처럼 `throws`키워드를 사용하여 예외가 발생할 수 있음을 알릴 수 없기 때문에 자바에서 만약 코틀린 코드를 사용한다면 이를 알릴 수 있는 장치가 필요하게 된다. `@Throws` 어노테이션을 활용하면 이것이 가능하다.
```kotlin
@Throws(IOException::class)
fun houstonWeHaveAProblem() {
    throw IOException("File or resource not found")
}
```
- 위와 같이 어노테이션을 사용하게 되면, 자바 컴파일러는 IOException에 대비해야 하는 내용을 알게 된다.
- 어노테이션을 명시하지 않고, 만약 자바코드에서 예외를 캐치하려고 한다면 컴파일이 실패하거나 불필요한 코드가 존재한다는 컴파일러 워닝을 만나게 될 것이다.
- `@Throws` 어노테이션의 역할을 다시 정리하자면, 자바/코틀린의 통합을 위해 그리고 코틀린 코드에서 발생하는 예외를 자바 코드에서 대비하기 위해 존재하는 것이다.


----
## 12장
#### 레시피 12.1 - 확장을 위해 스프링 관리 빈 클래스 오픈하기
- 스프링에서는 빈으로 관리되는 클래스들 대부분이 프록시 기반으로 작동하게 된다.
- 코틀린 클래스는 기본적으로 `final` 식별자를 달고 나오기 때문에 프록시를 동작이 안되게 된다. 이를 해결하기 위해서는 별도로 `kotlin-spring` 빌드 플러그인을 사용하여 스프링에서 관리하는 `@Component`, 
 `@Service`으로 마킹된 클래스들이 확장 가능한 클래스 식별자인 `open`로 컴파일리 되도록 설정해줘야 한다.
   * `all-open` 플러그인을 사용해도 되지만, 대부분 `kotlin-spring`플러그인이 커버한다.
- 프록시는 실제 컴포넌트 메소드 호출을 가로채 호출 전후로 많은 일을 수행하게 된다. 인자에 대한 유효값 체크와 트랜잭션 등이 아주 대표적인 케이스이다. 

```kotlin
@org.springframework.stereotype.Service 
public open class UserService public constructor() {
    public open fun join(): kotlin.Unit { /* compiled code */ }
}
```
- 플러그인을 적용하여 코드를 컴파일 결과이다.
- @Component, @Async, @Transactional, @Cacheable, @SpringBootTest 들이 open이 되는 마킹 어노테이션들이며 사실상 대부분을 커버한다고 보면 된다. @Component의 경우 이를 사용하는 하위 어노테이션중에 친숙한 @Configuration, @Controller, @RestController, @Service, @Repository 들이 있다.

