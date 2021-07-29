# Kotlin With Spring

현재 재직중인 회사에서 코틀린을 주력으로 사용하고 있는데, 지난 1년 정도 코틀린과 스프링부트를 사용해보면서 겪었던 삽질이나 좋았던 점을 스터디를 통하여 한 번 정리하면 좋겠다하는 마음에서 정리하게 됬다. 

- 시작하기 어렵지 않다. Spring Intializer에서 Kotlin 프로젝트를 쉽게 생성 할 수 있으며, 물론 버젼의 제약이 있긴 하겠지만 기존 자바 기반으로 운영하고 있더라도 쉽게 Koltin을 통한 추가 기능 개발이 가능하다.
- 현재 코틀린은 1.3.21 버젼까지 사용할 수 있으며 SpringFramework 5.X, SpringBoot 2.X부터는 공식적으로 코틀린에 대한 지원을 시작했다. 
- SpringFramework 5.2 부터는 코틀린의 협력적 멀티테스킹을 수행할 수 있는 `코루틴`에 대한 지원이 들어갈 예정.
  * [Reference Document](https://docs.spring.io/spring/docs/5.2.0.BUILD-SNAPSHOT/spring-framework-reference/languages.html#coroutines)
  * [example](https://github.com/Kotlin/kotlin-coroutines-examples)

기존 자바로 개발을 하던 사람이라면 누구나 쉽게 코틀린에 접근을 할 수 있다고 생각한다. 필자 역시 작년 4월부터 코틀린으로 개발을 시작했을 때, 생각보다 시작할 때의 러닝 커브가 높지 않았고 기존 자바 + 스프링에 대한 경험이 있었던 덕분인지 큰 어려움까지는 없었다.


## 코틀린을 쓰면서 편리하거나 좋은 점
### Null에 대한 편리한 판단, Null 안정성
```kotlin
person.name ?: "Daniel"
person.name ?: throw IllegalArgumentException()
person.name?.toUpperCase() ?: "UPPERCASE"
person.name?.let {
    println("Null이 아닐때 실행되요")
} ?: "Null이면 여기에요"

```
엘비스 연산자(`?:`)와 안전한 호출 연산(`?`)를 활용하면 Null이 될 수 있는 값에 대한 기본 값 지정 및 별도의 표현식을 지정 할 수 있다.

### data class
```kotlin
data class AddressDto(
	val street: String, 
	val zipCode: String,
	val city: String
)
```
자동으로 구현해주는 equals와 hashCode가 있어서 기존 자바에서 구현 시 직접 구현해주거나 autoValue 혹은 lombok과 같은 별도의 구현체를 사용하지 않아서 편리하다. 
### 다양한 확장 함수
기본으로 제공해주는 다양한 확장 함수가 존재한다. 기존 자바로 개발했을 때는 Array를 Collection으로 변환하여 필터 혹은 Map을 하는 등 복잡한 단계가 필요했었는데, 코틀린에서는 이를 확장 함수 형태로 호출 할 수 있도록 기본 API를 제공해주고 있어서 편리하다.

### 편리한 람다 사용 & 중위 연산자
- 람다에 대한 선언을 변수에 편리하게 지정 할 수 있고 람다를 넘길 수 있는 고차 함수에 편리하게 해당 선언을 넘길 수 있다. 또한 람다에 대한 성능이 걱정된다면 `inline` 함수를 사용하여 이를 최적화 할 수도 있다. 코틀린에서 제공해주는 기본 함수 중 상당수가 `inline` 함수의 형태로 선언되어 있다.

- 중위 연산자(`infix`)를 활용하면 코드가 깔끔하게 표현할 수 있다. 아래는 Pair 선언을 하는 중위 연산자 표현이다.
```kotlin
val pair = 10 to 10
val pairList = listOf(
	10 to 10,
	10 to 10,
	10 to 10
)
```
- 람다와 중위 연산자를 잘 활용하면 간단한 DSL을 쉽게 작성 할 수 있다. 아래는 kotlinx에서 제공해주는 html dsl 관련 예제 코드이다.
```kotlin
body {
	div {
        a("https://kotlinlang.org") {
            target = ATarget.blank
            +"Main site"
        }
	}
}
```



## 겪었던 삽질에 대한 공유 혹은 알아야 하는 내용은?
### Null이 아니지만 Null인 경우가 있다.
```java
public class Bus {
    private final int no;
    private final String title;

    private Bus(int no, String title) {
        this.no = no;
        this.title = title;
    }

    public int getNo() {
        return no;
    }

    public String getTitle() {
        return title;
    }

    public static Bus getNullObject() {
        return new Bus(10, null);
    }
}
```

```kotlin
val busTitle: String = Bus.getNullObject().title
println(busTitle.toUpperCase()) // throw Runtime Exception
```

- Java로 정의 · 선언된 참조 타입을 Kotlin에서는 Platform Type 타입이라고 부른다.
- 특히 JPA를 사용하면서 null값이 들어가 있는 멤버 변수를 활용하다가 삽질을 겪었던 경험도 있다. 아무튼 상호운용과 관련하여 각별한 주의가 필요한 부분이다.
- 이를 피하기 위해서는 @Nullable 혹은 @NotNull 어노테이션을 자바 코드에 명시 해줘야 코틀린쪽 컴파일러에서 이를 인지하여 처리할 수 있다. 아래는 비슷한 효과를 내는 어노테이션들 목록이다.
	- `@Nullable`
		- org.jetbrains.annotations.Nullable
		- android.support.annotation.Nullable
		- com.android.annotations.Nullable
		- org.eclipse.jdt.annotation.Nullable
		- org.checkerframework.checker.nullness.qual.Nullable
		- javax.annotation.Nullable
		- javax.annotation.CheckForNull
		- edu.umd.cs.findbugs.annotations.CheckForNull
		- edu.umd.cs.findbugs.annotations.Nullable
		- edu.umd.cs.findbugs.annotations.PossiblyNull
	- `@NotNull`
		- org.jetbrains.annotations.NotNull
		- edu.umd.cs.findbugs.annotations.NonNull
		- android.support.annotation.NonNull
		- com.android.annotations.NonNull
		- org.eclipse.jdt.annotation.NonNull
		- org.checkerframework.checker.nullness.qual.NonNull
		- lombok.NonNull	


### With JPA
기존 자바에서 JPA를 경험했던 개발자라면 크게 사용상 어려움은 없으리라 생각한다. 하지만 아래에서 설명하는 기본 설정 관련된 부분에 대해 초기에는 신경 쓸 부분이 존재한다. 아래 내용은 JPA 사용 관련하여 알고 있어야 하는 내용 몇개를 정리해봤다.

- 엔티티의 클래스의 경우 인자가 없는 생성자가 필수이기 때문에 이를 코드로 직접 생성해줘야 하는 번거로움이 있다.(자바할때는 당연한거였는데...) 이를 피하기 위해서는 빌드 경로에 kotlin-noarg 컴파일러 플러그인을 넣으면 Hibernate 엔티티에 대해 인수가 없는 생성자가 생성된다.
```gradle
buildscript {
    dependencies {
        classpath "org.jetbrains.kotlin:kotlin-noarg:$kotlin_version"
    }
}

apply plugin: "kotlin-jpa"
```

- **Kotlin 클래스는 기본적으로 Final 클래스이다.** 엔티티의 지연로드를 사용하는 경우 엔티티 클래스는 Final로 선언되어 있으면 안된다. `kotlin-allopen` 플러그인을 사용하여 아래와 같이 엔티티 타입의 클래스에 대해서는 final이 아닌 open 형태로 선언되도록 해야 한다.
```gradle
buildscript {
    dependencies {
        classpath("org.jetbrains.kotlin:kotlin-allopen:${kotlinVersion}")
    }
}
allOpen {
    annotation("javax.persistence.Entity")
    annotation("javax.persistence.MappedSuperclass")
    annotation("javax.persistence.Embeddable")
} 
```

- JPA에 한정된 내용은 아니지만 AnnotationProcessor 사용 시 `kotlin-kapt` 플러그인을 사용하면 된다. 특히 회사에서 `queryDsl`을 공통으로 사용하고 있었기 때문에 해당 설정을 해줬어야 했다.

```
apply plugin: 'kotlin-kapt'
idea {
    module {
        def kaptMain = file('build/generated/source/kapt/main')
        sourceDirs += kaptMain
        generatedSourceDirs += kaptMain
    }
}
....
dependencies {
	...
    implementation("com.querydsl:querydsl-jpa:${queryDslVersion}")
    kapt("com.querydsl:querydsl-apt:${queryDslVersion}:jpa")
	
}
```

기존 node.js를 주력으로 서버 어플리케이션 개발을 많이 해왔던 나로서는 코틀린의 유연하고 편리한 구문과 문법은 큰 매력적으로 다가왔고 지금도 이를 잘 알고 활용하고 싶은 마음이 크다. 우스게 소리로 팀원들과 이제 자바로 못돌아가겠다라는 이야기를 자주 하곤 한다. 이 만큼 코틀린으로 개발하는 것이 주는 재미와 더불어 걍력한 생산성이 매력적이라는 이야기이다. 

> 코틀린과 관련된 생태계나 관련 구현체를 찾을 때는 [awesome Kotlin](https://github.com/KotlinBy/awesome-kotlin)을 참고하면 많은 도움이 된다. 그리고 주 단위로 발행해주는 [Kotlin-Weekly](https://us12.campaign-archive.com/home/?u=f39692e245b94f7fb693b6d82&id=93b2272cb6)의 기사를 참고하는 것도 역시 많은 도움이 된다.