

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
- `contract`: 컴파일에게 함수의 호출횟수와 타입캐스팅을 도와주기위해 도입
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
  *TODO: Kotlin 1.3.72 환경에서 구문 에러가 발생.*
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