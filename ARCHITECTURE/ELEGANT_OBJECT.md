## 1장 출생
---
### 1.1 -er로 끝나는 이름을 사용하지 마세요
### 1.2 생성자 하나를 주 생성자로 만드세요
### 1.3 생성자에 코드를 넣지 마세요

## 2장 학습
---
### 2.1 가능하면 적게 캡슐화하세요
### 2.2 최소한 뭔가는 캡슐화하세요
### 2.3 항상 인터페이스를 사용하세요
### 2.4 메서드 이름을 신중하게 선택하세요
### 2.5 퍼블릭 상수(public constant)를 사용하지 마세요

### 2.6 불변 객체로 만드세요
### 2.7 문서를 작성하는 대신 테스트를 만드세요
### 2.8모의 객체(Mock) 대신 페이크 객체(Fake)를 사용하세요
### 2.9인터페이스를 짧게 유지하고 스마트(smart)를 사용하세요

## 3장 취업
---
### 3.1 5개 이하의 public 메서드만 노출하세요
- 20개의 메소드를 가진 클래스를 50줄로 구현했다고 이 클래스가 작다고 말할 수 있을까?
- public 메소드가 많을수록 클래스도 거기에 비례하여 커질수 있고, 이는 곧 유지보수성을 저하시키는 요인이 될 수 있음
- public 메소드의 수를 최소로 사용. public 메소드는 객체의 진입점이며 진입점의 수가 적을수록 문제가 발생하더라도 쉽게 수정이 가능
- 클래스가 작으면 메소드와 필드가 더 가까이 있을 확률이 높기 때문에 응집도가 높아지는 효과가 있을 수 있음.
### 3.2 정적 메서드를 사용하지 마세요
- 정적 메소드를 사용하게 되면, 평가의 방법이 eager한 방식으로 처리가 될 여지가 큼
- 정적 메소드를 사용하지 않고, 이를 객체로 만들 경우, 필요한 순간에 평가를 진행할 수 있기 때문에 lazy한 평가를 수행할 수 있어 어느정도 성능적인 최적화가 가능.
- 명령형 vs 선언형, 잘짜놓은 객체지향스러운 코드는 선언형 성격이 강함. 결국 [알고리즘 - 실행]의 맥락으로 접근하는 것이 아닌 [객체 - 행동]의 관점으로 사고하는 것을 이야기함.
- 유틸리티 성격의 클래스(XXXXUtil, XXXXHeler)를 굳이 사용하는 경우엔, 해당 객체의 인스턴스화가 필요없기 때문에 private constructor를 선언하여 객체 생성을 막도록 하는 것이 좋다.
- 싱글톤의 목적은 객체의 상태를 가지는 것이 아니라, `분리 가능한 의존성`을 가지는 것이 핵심이다. 하지만, 싱글톤 역시 또 다른 의미의 전역 변수를 만드는 것과 크게 다르지 않을 수 있다.
- 이상적인 FP에서는 최소의 출구만을 만드는 것이 최선
- 더 작은 객체로 개념을 고립시키고 이를 조합하는 것이 객체지향에서는 최선이다.

### 3.3인자의 값으로 NULL을 절대 허용하지 마세요
- `null`은 죄악이다. 프로그래머들이 접근할 수 없는 메모리 값을 `0`으로 표현하고 이를 가리켜 null로 부르는 동의에서 시작된 것이다.
- `null`을 전달해야 하는 상황이라면, 차라리 빈 객체를 만들어 전달하자.
- `null`에 대한 처리를 해야 하는 상황이라면, 반드시 쉴드패턴(`shield pattern`)과 같은 구현 방식으로 예외를 호출자에게 전달하도록 유도하는 것이 좋다. JVM에서 권고하는 예외 클래스를 사용하는 것이 그 예시
```java
public Iterable<File> find(Mask mask) {
	if (mask == null) {
		throw new IllegalArgumentException("Mask can't be NULL");
	}
}
```


### 3.4 충성스러우면서 불변이거나, 아니면 상수이거나
- 많은 사람들이 상태(`state`)와 데이터(`data`)를 오해하고 있음
- 객체란 디스크에 있는 파일, 웹 페이지 혹은 메모리에 존재하는 바이트 배열, 해시맵 등과 같은 실제 엔티티의 대표자이다.
```java
// 아래 코드에서 File 객체는 실제 파일의 대표자 역할을 수행
public void echo() {
	File f = new File("/tmp/test.txt");
	System.out.println("File size : %d", f.length());
}
```
- 일반적인 객체는 식별자(identity), 상태(state), 행동(behavior)를 포함. 

### 3.5 절대 getter와 setter를 사용하지 마세요
- 클래스는 다르다. 어떤 식으로든 맴버에게 접근하는 것을 허용하지 않으며, 노출을 하지도 않는다. 할 수 있는 일은 오직 객체에게 `요청`하는 것 뿐이다.
- 자료구조는 `glass box`, 객체는 `black box`
- ***프로그래밍에서 가시성의 범위를 줄이는 것은 사물을 단순화시키는 것이며 이해의 범위가 작을수록 유지보수성과 코드의 대한 이해/수정이 쉬워진다.***
- `Getter/Setter`는 클래스를 자료구조로 사용하는 목적에서 도입이 되었다. 이는 곧, 발가벗겨진 데이터가 그대로 노출이 되며 절차적인 프로그래밍 스타일을 사용하도록 부추기게 된다.
- `Getter/Setter`는 데이터가 무방비로 `public`하게 노출되어 있는 것과 마찬가지이다. 결국 이러한 형태의 객체는 하나의 데이터로서 역할만을 수행할 수 밖에 없다.

### 3.6 부 ctor 밖에서는 new를 사용하지 마세요
- 클래스가 작고 단순하며 네트워크나 디스크, 데이터베이스 등의 값비싼 자원을 사용하지 않는다면 전혀 문제가 되지 않을 것이다.
```java
public class Cash {
	private final int dollars;

	public int euro() {
		return new Exchange().rate("USD", "EUR") * this.dollars;
	}
}
```
- `euro()` 메소드를 사용할때마다 원격지와 통신을 하게 될 경우에 이 객체를 사용하는 사용자 입장에서는 매번 원격지와의 통신을 강요받을 수 밖에 없다. 이러한 결합을 피하기 위해서는 코드 자체를 수정할 수 밖에 없는데 이런식의 수정은 테스트와 유지보수성을 급격하게 낮출 수 밖에 없다. 다시 말해, 의존성에 대한 제어를 `Cash` 클래스 자신이 하고 있는 상황이다.

```java
public class Cash {
	private final int dollars;
	private final Exchange exchange;

	Cash(int value, Exchange exchange) {
		this.dollars = value;
		this.exchange = exchange;
	}

	public int euro() {
		return this.rate("USD", "EUR") * this.dollars;
	}
}
```
- 위와 같이 코드를 수정하게 될 경우, 생성자를 통하여 제공받은 `Exchange`와 협력을 할 수 있게 된다.
- 의존성에 대한 제어 주체가 `Cash` 클래스가 아닌 외부 혹은 사용하는 쪽에서 제어할 수 있도록 수정이 되었다.
- 객체가 필요한 의존성을 직접 생성하는 대신, 생성자를 통해 **의존성을 주입** 받으며 `Exchange` 타입의 의존성 즉 직접 작성한 코드 혹은 다른 객체를 주입하여 해당 객체가 호출이 되도록 **제어의 역전**을 수행하게 된다.


### 3.7 인트로스펙션과 캐스팅을 피하세요
```java
public <T> int size(Iterable<T> items) {
	if (items instanceof Collection) {
		return Collection.class.cast(items).size()
	}
	int size = 0;
	for (T item: items) {
		++size;
	}
	return size;
}
```
- 런타임에 객체 타입을 조사하는 것은 클래스 사이의 결합도가 높아지기 때문에 기술적인 관점에서 좋지 않음
- 위 예제에서는 `Iterable`과 `Collection` 인터페이스에 의존을 하고 있으며, 대상이 많아질수록 별도의 분기와 코드가 생겨나기 때문에 유지보수성이 좋아질 수가 없을 것이다.
- 취급하는 타입에 따라 객체를 차별하기 때문에 자율성이라는 객체지향의 기본적인 베이스 정신을 훼손하는 코드라고 한다.
- 타입 체킹 혹은 캐스팅을 하려거든 차라리 `메소드 오버로딩(method overloading)`을 활용하자.
```java
public <T> int size(Iterable<T> items) {
	int size = 0;
	for (T item: items) {
		++size;
	}
	return size;
}

public <T> int size(Collection<T> items) {
	return items.size();
}

```
## 4장 은퇴
---
### 4.1 절대 NULL을 반환하지 마세요
- 객체를 장애를 가진 존재로 취급해서는 안된다
- 항상 `NullPointerException` 예외가 던져질지 모른다는 사실은 기술적인 불편함을 넘어서서 해당 객체에 대한 `신뢰`가 무너졌다는 사실이다. 결국, ***객체에게 작업을 요청한 후 안심하고 결과에 의지할 수 없다.*** 또한,  이는 곧 유지보수성의 심각한 손실로 이어진다.
- **객체라는 사상에는 우리가 신뢰하는 엔티티라는 개념이 담겨져 있다.**
- 객체는 자신이 맡은 일을 수행하는 방법을 스스로 결정한다. 
```java
void list(File dir) {
	File[] files = dir.listFiles();
	// 매번 아래와 같은 체크를 해야 한다면, 장황한 코드의 추가와 더불어 매번 반환값을 확인해야 한다.
	if (files == null) {
		throw new IOException("Directory is absent");
	}
	for (File file : files) {
		System.out.println(file.getName());
	}
}
```
- `빠르게 실패하기 원칙(fail fast principle)`, `null`을 리턴하는 대신 예외를 던져 빠르게 실패하는 것.
- `빠르게 실패하기 원칙` vs `안전하게 실패하기`
  - 안전하게 실패하기는 버그, 입출력 문제, 메모리 오버플로우 등이 발생한 상황에서도 소프트웨어가 계속 실행될 수 있도록 최대한 많은 노력을 기울이는 것
  - 빠르게 실패하기는 일반 문제가 발생하면 곧바로 실행을 중단하고 빠르게 예외를 던짐. 실패를 감추는 대신 강조.
- 어떤 버그는 명확하지만, 또 그렇지 않고 조용히 숨어 있는 경우가 있다.
  > 버그가 존재하는 사실을 숨기는 것은 스스로에게 죄를 짓고 있는 것이며 상처를 드러내어 치료하는 대신, 상처를 숨기고 모든 일이 순조롭게 진행되고 있다고 환자에게 거짓말을 하는 행위이다. 
- NULL의 대안은?
  - 메소드를 분리
  ```java
  // 아래의 경우, DB IO가 두번 발생하여 비효율적이다.
  public boolean exists(String name) {
	  if (/*DB에 없다면*/) {
		  return false;
	  }
	  return true;
  }
  
  public User user(String name) {
	  return /* From DB */
  }
  ```
  - NULL을 반환하는 대신 기본값을 반환
  ```java
  public Collection<User> users(String name) {
	if (/*DB에 없다면*/) {
		return emptyList();
	}
	return Collections.singleton(/* From DB */)
  }
  ```
  - `Optional`과 같은 클래스를 활용
  - `Null` Object를 만드는 방법
  ```java
  public class NullUser implements User {
	private final String label;
	NullUser(String name) {
		this.label = name;
	}

	@Override
	public String name() {
		return this.label;
	}

	@Override
	public void raise() {
		throw new IllegalStateException("인상 못해유~")
	}
  }
  ```
### 4.2 체크 예외(checked exception)만 던지세요
- Checked Exception은 메소드를 호출하는 쪽에 예외를 처리하도록 강제할 수 있다. 
Method에 명시적으로 예외의 타입이 노출이 되기 때문에 어떤 종류의 예외가 발생할지 예측할 수 있다. 다시 말해, 책임을 클라이언트에 전달하면서 제 자신이 안전하지 않다라고 선언하는 샘이다.
- UnChecked Exception의 경우, 별도로 예외를 처리하지 않으면 최상위로 전달~ 전달~
- 꼭 필요한 경우가 아니라면 예외는 안잡는 것이 최선이다. 예외를 처리할때는 반드시 그 이유가 존재해야 한다. 만약 제어 흐름을 위해 예외를 사용하는 것이라면 이는 예외라는 것의 처리 목적과 전혀 부합하지 않게된다.
- 예외는 반드시(항상) 체이닝하세요. 
절대 원래 예외를 무시하지 말고 체이닝하여 낮은 수준의 근본 원인을 소프트웨어의 상위 레이어로 이동시킬 수 있게 된다. 또한, 문제에 대한 가치 있는 정보를 포함하기 때문에 빠르게 실수에 대응할 수 있게 된다.
- 예외는 복구가 될 수 있다. 하지만, 무분별한 예외 복구보다는 분명한 이유가 있는 예외 복구와 진입로/출구로 가는 접점에 이를 배치하는 것이 좀 더 효율적이라고 할 수 있다.
```java
public static void main(String[] args) {
	try {
		System.out.println(new App().run())
	} catch(Exception ex) {
		System.err.println("죄송하지만 문제가 발생했어요:" + ex.getLocalizedMessage() )
	}
}
```
- main에서 예외를 잡지 않게 되면 런타임 환경으로 예외가 전달되고 결국 JVM이 이를 처리하게 될 것이다. 이는 곧 사용자에게 노출을 시키지 말아야 할 메세지를 노출하게 될수도 있다. 위와 같은 장소가 예외를 복구하기 좋은 장소라고 할 수 있다.

### 4.3 final이거나 abstract이거나
### 4.4 RAII를 사용하세요

## 후기
