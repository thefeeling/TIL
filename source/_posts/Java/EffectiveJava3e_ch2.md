---
title: Effective Java - 2장
date: 2021/7/28 00:00:00
categories:
- Java
---

# Effective Java - 2장

# [2장] 모든 객체의 공통 메서드
- Objects는 객체를 만들 수 있는 구체 클래스면서 기본적으로 상속하여 사용이 가능
- equals, hashCode, toString, clone, finalize 모두 재정의를 염두로 두고 설계
- 일반 규약에 맞도록 재정의(overriding)해야 하며, 잘못 구현하면 오작동을 발생 시킬 수 있음

## ITEM 10 - equals는 일반 규약을 지켜 재정의하라
* 일반 규약에 맞도록 재정의 하지 않을꺼면 재정의를 안하는 것이 최선. 

* 아래 항목이 해당하는 경우 재정의를 하는 것이 크게 의미가 없을 수 있음.
  * 각 인스턴스는 본질적으로 고유
  * 인스턴스의 `논리적 동치성`을 검사할 일이 없는 경우
  * 상위 클래스에서 정의한 `equals`가 하위 클래스에 딱 들어맞는 경우
  * 클래스가 `private`이거나 `package-private`일 경우, equals를 호출할 일이 없음

* 그럼 언제 재정의 해야 할까?
  * 객체 간 `논리적 동치성`을 확인해야 하는데 상위 클래스의 `equals`가 이를 비교하도록 정의되지 않았을 경우에 재정의 해야 함.
  * 주로 값 클래스일 경우가 해당 함.

* `equals`의 일반 규약은 아래와 같다.
  * 반사성: 자기 자신과 같아야 함.
  * 대칭성: x가 y와 같다면, y도 x와 같아야 한다.
  * 추이성: x가 y와 같고, y가 z와 같다면, x는 z와 같아야 한다.
  * 일관성: x와 y가 같다면, 영원히 같아야 함.
  * null-아님: null과 비교하는 것은 의미가 없음.

* 구체 클래스를 확장해 새로운 값을 추가하면서 equals 규약을 만족 시킬 방법은 존재하지 않음.
  * Point 클래스를 상속한 ColorPoint클래스와 Point클래스의 인스턴스를 비교할 수 없음, Why?
  * 객체의 동등성 비교 시, 한쪽만 true인 결과를 얻을 수 있기 때문. equals의 대칭성 규약을 지킬 수 없다.
* 상속이 아닌 컴포지션을 사용하면 우회하여 값을 비교하는 equals를 재정의 하는 것이 가능하다.

* `equals` 메서드를 구현하는 일반적인 방법은 아래와 같다.
  1. `==` 연산자를 사용하여 자기 자신의 참조 확인
  2. instanceof 연산자로 올바른 타입인지 체크
  3. 2번 단계에서 확인한 타입으로 타입 캐스팅
  4. 입력 객체와 자기 자신의 대응되는 핵심 필드들이 모두 일치하는지 검사

* 값 혹은 참조를 비교하는 방법은?
  - float, double을 제외한 기본 타입의 필드는 `==` 연산자로 비교
    - float, double은 `Float.compare(float, float)`, `Double.compare(double, double)`로 비교
    - Float.equals 및 Double.equals는 오토박싱을 수반하므로 성능상 좋지 않음
  - 참조 타입 필드는 해당 타입의 `equals`를 이용하여 비교
  - 배열 전체를 비교 할 경우, `Arrays.equals`를 사용

```java
public final class PhoneNumber {
    private final short areaCode, prefix, lineNum;

    public PhoneNumber(short areaCode, short prefix, short lineNum) {
        this.areaCode = areaCode;
        this.prefix = prefix;
        this.lineNum = lineNum;
    }

    private static short rangeCheck(int val, int max, String arg) {
        if (val < 0 || val > max) throw new IllegalArgumentException(arg + ": " + val);
        return (short) val;
    }

    @Override
    // 인자의 타입은 `Object` 타입을 사용하도록 하자
    public boolean equals(Object o) {
        // 1. 자기 자신과 같은지 확인
        if (o == this) return true;
        // 2. 타입이 같은 체크
        if (!(o instanceof PhoneNumber)) return false;
        // 3. 타입 캐스팅
        PhoneNumber pn = (PhoneNumber)o;
        // 4. 주요 필드 값에 대해 비교 연산 수행
        return pn.lineNum == lineNum && pn.areaCode == areaCode && pn.prefix == prefix;
    }
}
```

* `equals`를 구현하고 체크해야 할 세가지
  - 대칭적인지?, 추이성을 만족하는지?, 일관적인지?
  - equals를 재정의할 경우 반드시 hashCode도 재정의하자
  - 인자의 타입은 `Object` 타입을 사용하도록 하자. 만약 구체 타입으로 인자를 받을 경우 아래 그림과 컴파일이 되지 않는다. `@Override` 어노테이션을 일관되게 사용하면 이런 일련의 실수를 예방할 수 있다.
    ![인자의 타입은 `Object`](https://i.imgur.com/MVYfZTY.png)

## ITEM 11 - equals를 재정의하려거든 hashCode도 재정의하라
- equals를 재정의 할 경우 반드시 hashCode도 재정의 해야 한다. 
  - 그러지 않으면, HashSet 혹은 HashMap과 같은 콜랙션 구현체에서 사용 시 문제가 발생한다.
- 아래는 Object 명세의 일부이다.
  * equals 비교에 사용되는 필드 값이 변경되지 않았다면, 매번 같은 hashCode를 반환해야 한다.
  * **[중요] equals에서 두 객체가 같다고 판단했다면, hashCode도 같은 값을 반환해야 한다.**
  * equals에서 두 객체가 다르다고 판단했더라도, 두 객체가 다른 hashCode값을 반환할 필요는 없다. 
  * **[중요] 하지만, 다른 객체에 대해서는 다른 hashCode 값을 반환해야 해시테이블의 성능이 좋아진다.**
- 해시코드 반환을 올바르게 하지 않을 경우, 수행 시간의 계산이 최대 O(n)까지 늘어날 수 있다.아래는 O(n)까지 늘어나는 사용 금지 해시 코드 구현이다.
	```java
	@Override
	public int hashCode() { return 42; }
	```

- 좋은 해시 함수는 결국 서로 다른 객체 혹은 인스턴스에 대해 다른 해시코드를 반환해야 한다. 이상적인 해시 함수는 인스턴스들을 32비트 정수 범위에 균일하게 분배해야 한다.

- `hashCode`를 작성하는 요령은?
  1. 첫 번째 핵심 필드에 대해 hashCode를 생성. 이를 변수 `result`에 할당.
  2. 나머지 필드에 대해 아래와 같이 해시코드를 구하도록 하자.
    - 해시코드 c를 아래와 같은 원칙으로 구해보자.
      - 기본 타입 필드일 경우, 해당 타입의 박싱 클래스 타입의 Type.hashCode(f)를 수행 
      - 참조 타입 필드일 경우, 해당 클래스의 필드 값들에 대해 hashCode를 재귀적으로 호출하고 복잡해질꺼 같으면 필드의 표준형을 만들어 호출하자. 필드 값이 null이면 0을 사용한다.
      - 필드가 배열일 경우, 핵심 원소에 대해 각각 필드와 같이 다뤄준다. 핵심 원소가 없을 경우 0으로 다뤄주자.
    - 첫 번째 단계에서 구한 해시코드 값을 아래와 같이 갱신하도록 하자.
    ```java
    result = 31 * result + c
    ```
  3. hashCode의 반환 값으로 result를 반환.
  4. 작성 후 동치 인스턴스에 대해 같은 해시코드 값을 반환하는지 테스트 코드를 작성하도록 하자.
  ```java
  @Override
  public int hashCode() {
  	int result = Short.hashCode(areaCode);
  	result = 31 * result + Short.hashCode(prefix);
  	result = 31 * result + Short.hashCode(lineNum);
  	return result;
  }
  ```
  ```java
  // with Junit
  @Test
  public void hashCodeTest() {
      short areaCode = 10, prefix = 5, lineNum = 1;
      PhoneNumber p1 = new PhoneNumber(areaCode, prefix, lineNum);
      PhoneNumber p2 = new PhoneNumber(areaCode, prefix, lineNum);
      assertEquals(p1.hashCode(), p2.hashCode());
  }
  ```

- 해시 충돌이 더 적은 구현을 원한다면 `guava`의 `Hashing` 구현을 참고하자.
- `Objects` 클래스의 hash 메서드를 이용하면 해쉬 값을 쉽게 구할 수 있으나, 안타깝게도 해당 메서드는 박싱과 언박싱의 과정이 길어서 속도가 더 느리다고 한다. 
- 만약 클래스가 불변인 상황에서 해시코드를 구하는 과정이 길거나 오래걸린다면 캐싱하는 방식을 고려해보면 좋다.
- 성능 고려한다고 해시코드 계산 시 핵심 필드를 생략하면 안된다. 해당 필드를 생략할 경우 해시 품질이 나빠져 특정 영역으로 몰릴 수 있기 때문이다.
- 해시코드 생성 규칙을 외부 사용자(API 사용하는)에게 알리지 않아야 추후에 변경이 발생했을 경우에 유연하게 변경이 가능하다.


## ITEM 12 - toString을 항상 재정의하라
별도로 `toString()`을 재정의하지 않으면 `클래스명@16진수의 해시코드`가 반환된다. toString의 일반 규약에서는 `간결하고 읽기 쉬운 형식의 정보를 반환해라`라고 명세되어 있다고 한다. 또한, 모든 하위 클래스에서 toString을 재정의 하라고 말하고 있다.
쉽게 접할 수 있는 디버깅을 하는 상황이라고 생각해봐도 toString()을 재정의하여 유의미한 정보를 보면서 디버깅 하는 것과 그렇지 않은 경우는 많이 다르다. 결국 유의미한 정보를 반환하는 것이 관례이자 규약이라고 하면 이를 지키는 것이 좋을 것이다.

* 객체가 가지고 있는 정보는 가급적 전부 반환하는 것이 좋다.
* 반환하는 포맷에 대한 고민도 해봐야 한다.
  - 포맷의 고정 유무와 상관 없이 `유의미한` 정보를 반환하고 의미를 분명하게 하는 것은 중요하다.

책의 예제에서는 앞의 PhoneNumber 클래스에서 toString()을 재정의한 예시를 보여주고 있는데, 참고하기 좋은 주석과 내용을 담고 있는 듯 하다.
```java
    /**
     * 이 전화번호의 문자열 표현을 반환한다.
     * 이 문자열은 "XXX-YYY-ZZZZ" 형태의 12글자로 구성된다.
     * XXX는 지역 코드, YYY는 Prefix, ZZZZ는 가입자 번호다.
     * 각각의 대문자는 10진수 숫자 하나를 나타낸다.
     *
     * 전화번호의 각 부분의 값이 너무 작아서 자릿수를 채울 수 없다면,
     * 앞에서부터 0으로 채워나간다. 예컨대 가입자 번호가 123이라면
     * 전화번호의 마지막 네 문자는 "0123"이 된다.
     * @return
     */
    @Override
    public String toString() {
        return String.format("%03d-%03d-%04d", areaCode, prefix, lineNum);
    }
```

`Google.AutoValue` 프레임워크에서는 toString을 생성해준다고 하는데, Lombok을 사용했을 때랑 어떻게 차이가 나는지는 직접 해보지 않아서 잘 모르겠다.

## ITEM 13 - clone 재정의는 주의해서 진행하라
* `Cloneable`는 `마커 인터페이스`로 **이를 구현한 객체는 복제가 가능한 객체**임을 명시하는 용도로 사용한다.
* `Cloneable` 인터페이스를 구현한 클래스의 인스턴스에서 `clone`을 호출하면 필드 전체를 복사한 객체를 반환한다. 만약 인터페이스를 구현하지 않을 경우 CloneNotSupportedException을 반환한다.
* **[중요] 메서드 하나 없는 `Cloneable`은 실상 `Object.clone`의 동작 방식을 결정하는데, 이례적인 사용으로 보이는 것이 인터페이스를 구현한 것만으로 상위 클래스 메서드 행위의 변경을 가하고 있기 때문이다.**
* `Cloneable` 인터페이스를 구현함으로써, 해당 객체를 사용하는 사용자 측에서는 `clone()` 메서드가 public으로 제공되며 이를 통해 복제를 할 수 있으리라 판단할 수 있다.
* 클래스의 계층 구조를 가지는 상황에서 하위 클래스가 만약 final 클래스라면 더 이상의 하위 클래스 상속은 발생하지 않기 때문에 관례는 무시해도 되겠지만, 만약 final 클래스의 clone 구현이 super.clone()을 호출하지 않는다면 Cloneable 인터페이스를 구현할 이유가 없다. 왜냐하면, 이는 위에서도 설명한대로 `Cloneable` 인터페이스가 Object.clone의 동작 방식을 결정하기 때문이고 이런 동작 방식 자체에 기댈 필요가 없기 때문이다.
```java
    @Override
    public PhoneNumber clone() {
        try {
            return (PhoneNumber) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new AssertionError();
        }
    }
```
* 위 예제에서는 상위 타입에서 반환하는 `Object`타입이 아닌 `PhoneNumber`타입을 반환하고 있다. 이는 `공변 반환 타이핑(covariant return typing)`을 나타내고 있다. 다시 말해, 재정의한 메서드의 반환 타입은 상위 클래스의 메서드가 반환하는 타입의 하위 타입일 수 있다는 이야기이다.
* `clone()` 메서드는 사실상 생성자와 같은 효과를 나타낸다. `clone()` 재정의 시 주의해야 하는 부분은 원본 객체에 변경이나 사이드 이펙트가 전달되지 않도록 복제된 객체의 불변성을 보장해야 한다.
* clone() 재정의 시, 클래스에 배열 필드가 있다면 clone()을 호출해도 런타임 타입과 컴파일타임 타입 모두가 원본 배열과 똑같은 타입의 배열을 반환한다. 하지만, 깊은 복사가 진행되는 것이 아니기 때문에 주의해야 한다. 
```java
    @Test
    public void cloneTest() {
        short areaCode = 10, prefix = 5, lineNum = 1;
        PhoneNumber[] arr = new PhoneNumber[]{
            new PhoneNumber(areaCode, prefix, lineNum),
            new PhoneNumber(areaCode, prefix, lineNum)
        };
        PhoneNumber[] cloneArr = arr.clone();
        // Reference Check
        assertSame(arr[0], cloneArr[0]);
    }
```

* 위의 예제와 같이, 깊은 복사가 필요할 경우 재귀호출을 통하거나 혹은 배열의 요소를 일일이 순회/반복하여 복제하는 작업이 필요하다. 
* 생성자에서는 일반적으로 하위 클래스에서 재정의 가능한 매서드를 호출하지 않는 것이 일반적인데, clone도 마찬가지이다. 재정의 시 변경되는 내용에 의해 원본 객체의 상태가 달라질 가능성이 크기 때문이다.
* clone을 사용하는 것보다 복사 목적으로 사용하는 정잭 팩토리 메서드 혹은 복사 생성자를 사용하는 방법도 있다. 복사 생성자와 팩토리 메서드는 인터페이스 타입의 인자를 받을 수 있기 때문에, 객체 복사 시 유연한 타입 변경이 가능해진다.
* **[결론] clone()의 객체 생성 메카니즘은 위험천만하다. 차라리 복사 정적 팩토리 메서드 혹은 복사 목적의 생성자를 사용하자.**
## ITEM 14 - Comparable을 구현할지 고려하라
- `Comparable.compareTo()`는 동치성 비교 및 순서까지 비교 가능하다.
- `Object.equals()`와 마찬가지로 반사성, 대칭성, 추이성을 충족해야 한다. 또한, 해당 원칙을 제대로 지키지 않으면 equals와 마찬가지로 해당 구현을 이용하는 다른 클래스에서 예상하지 못한 결과를 반환할 수 있다.
- `Comparable`을 구현하지 않은 필드나 표준이 아닌 순서로 비교하고 있는 상황이라면, `Comparator`를 대신 사용하자.
- `compareTo()`에서 기본 타입을 비교 할때, 해당 기본 타입의 래퍼 타입의 `compare()`를 사용하여 비교하자. <, > 등의 연산자는 거추장스럽고 오류를 유발할 수 있다.
- 필드가 여러개 있는 클래스의 경우, 핵심 필드부터 차례대로 비교하도록 하자
```java
    @Override
    public int compareTo(PhoneNumber o) {
        // 첫 번째 핵심 필드
        int result = Short.compare(areaCode, o.areaCode);
        if (result == 0) {
            // 두 번째 핵심 필드
            result = Short.compare(prefix, o.prefix);
            if (result == 0) {
                // 세 번째 핵심 필드
                result = Short.compare(lineNum, o.lineNum);
            }
        }
        return result;
    }
```
- `Comparator`를 사용하는 방식은 FluentAPI 형식을 사용할 수 있어서 코드 자체가 우아하게 전개되지만, 성능 로스가 있다고 한다.
- `Comparator`는 보조 메서드를 여러개 제공하고 있다. int보다 작은 타입의 경우 comparingInt를 사용하면 되고 float의 경우는 comparingDouble을 이용하면 된다.

