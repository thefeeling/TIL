### 개요
JVM에서의 코틀린 코드는 자바 바이트코드로 컴파일이 된다. 이 말인 즉슨, 기존 자바 프로젝트와 같이 공존할 수 있다는 이야기이며, 또한 기존 자바 코드를 코틀린으로 서서히 이전할 수도 있다는 이야기이다. 상호운용 시, 기존 자바 대비 향상된 코틀린의 기능을 포기해야 되는 상황을 우려 할 수 있는데, 코틀린은 상호운용이 가능하도록 언어가 만들어졌기 때문에 이에 대한 걱정은 할 필요가 없다고 할 수 있다. 

상호운용 시, 각 언어의 차이점을 이해하고 이를 극복할 수 있는 메타 어노테이션을 잘 활용하면 충분히 가능한 일이다. 어노테이션은 클래스, 인터페이스, 함수, 매개변수, 속성, 생성자, 표현식 등에 상태 혹은 메타 데이터를 표현하는 목적으로 사용되며 특히 코틀린 그리고 자바 상호운용 관련된 어노테이션의 경우 코틀린 컴파일러가 컴파일 시 사용하게 된다. 이에 대한 적절한 학습 그리고 차이점을 이해한다면 상호운용도 어렵지 않게 해낼 수 있다.

### null 관련 처리
자바의 모든 객체는 null이 될 수 있다. 하지만, 코틀린에서 자바 코드를 사용하게 될때 이에 대한 정보를 알 수 없기 때문에 각별한 주의가 필요한 부분이다. 다시 말해, 자바에서 반환되는 null에 대한 정보를 코틀린 컴파일러가 알 수 없다. 상호 운용을 하게 된다면 이에 대한 적절한 조치가 필요해보인다. 이처럼, 코틀린에서 사용하는 자바의 변수의 null 상태를 알 수 없을때 이를 가리켜서 플랫폼 변수라고 부른다. String을 예로 들어 살펴보자면, 코틀린에서는 String이 크게 String, String?으로 나뉠 수 있는데, 자바에서 넘어오게 되는 변수에 대해서 null에 대한 정보가 없다면 이를 String!로 나타내게 된다. 여기서 String!가 바로 플랫폼 변수이다. 

```java
public class Jhava {
	public String utterGreeting() {
		return "BLARGH";
	}

	public String determineFriendShipLevel() {
		return null;
	}
}
```

```kotlin
fun main(args: Array<String>) {
	val adversary = Jhava()
	println(adversary.utterGreeting())

	val friendshipLevel = adversary.determineFriendShipLevel()
	println(friendshipLevel.toLowerCase())
}
```

위와 같이 상호운용하는 상황이 있다면, 자바 코드를 호출하는 코틀린 코드의 결과는 아래와 같다.
```
Exception in thread "main"
java.lang.IllegalStateException: friendshipLevel must not be null
```

위에서 설명한것처럼 자바 코드에서 발생하는 null에 대한 정보를 코틀린 컴파일러가 알수 없기 때문에 발생한 것이다. 이를 막기 위해서는 자바 코드에 null과 관련된 정보를 심어줘어하는데, 이때 사용하는 것이 바로 `@Nullable`이다. 해당 어노테이션을 지정하게 되면 코틀린 컴파일러는 null 값을 반환할 수 있다는 정보를 알 수 있게 되어 반환 타입을 `String?`으로 간주하게 된다.

```java
public class Jhava {
	public String utterGreeting() {
		return "BLARGH";
	}

	@Nullable
	public String determineFriendShipLevel() {
		return null;
	}
}
```

```kotlin
fun main(args: Array<String>) {
	val adversary = Jhava()
	println(adversary.utterGreeting())

	val friendshipLevel = adversary.determineFriendShipLevel()
	println(friendshipLevel?.toLowerCase() ?: "Null 처리")
}
```

`@Nullable`과 반대로 `@NotNull`을 사용하게 되면 절대로 null 값을 반환하지 않는다는 것을 알려줄 수 있다.

```java
public class Jhava {
	@NotNull
	public String utterGreeting() {
		return "BLARGH";
	}
}
```

Null 관련 어노테이션은 함수/메서드의 반환값, 매개변수, 필드에 사용될 수 있다.

### 타입 매핑
코틀린의 타입은 자바 타입과 일대일로 매핑된다. 하지만, 코틀린과 자바 간에 일대일로 매핑되지 않는 타입들도 존재하는데, 기본 타입의 경우 자바에서는 내장 키워드를 통하여 기본 데이터 타입을 가리키는데 이헤 반해 코틀린은 기본 타입을 포함하여 모든 타입이 객체이다. 코틀린 컴파일러가 자바 기본 타입을 가장 유사한 코틀린 타입으로 매핑시켜 준다. 

```java
public class Jhava {
	public int hitPoints = 52489112;
}
```

```kotlin
fun main(args: Array<String>) {
	val adversary = Jhava()
	val adversaryHitPoints: Int = adversary.hitPoints
}
```
자바에서는 int로 정의 되어 있지만, 코틀린 코드에서는 Int 타입으로 참조해도 아무 문제가 없는 것을 확인 할 수 있다.(타입 추론 가능하다.) 자바에서는 기본 타입에 대하여 메소드 호출을 할 수 없지만, 코틀린에서는 Int로 변환이 되기 때문에 Int 클래스에 정의되어 있는 메서드를 사용할 수 있다. 이 밖에도 실제 자바 바이트코드로 변환 시, 성능 향상을 위해 상황에 따라 자동으로 자바 기본 타입으로 매핑시켜준다.

