## ITEM 15 - 클래스와 멤버의 접근 권한을 최소화하라

> 접근성은 가능한 최소한으로 유지하자. 그리고 공개API로 필요한 최소한을 선정하여 공개하도록 하자. 의도하지 않은 공개가 발생하지 않도록 주의해야 하며, 상수용 필드를 노출 할때에도 기본 타입 혹은 불변 타입만을 공개하도록 해야 한다.

* **잘 설계된 컴포넌트는 내부 구현과 데이터를 외부로부터 잘 숨겼는지 여부에 달려있다.** 다시 말해, 구현과 공개하는 API를 깔끔하게 분리한다는 이야기이다. API를 통해서만 외부의 컴포넌트 혹인 API와 소통하며 서로 내부 동작은 전혀 개의치 않게 되는 것이다.
* 접근 제어 메커니즘을 잘 활용하면 위에서 설명한 내용 즉, **정보 은닉**에 해당하는 내용을 충실하게 구현 할 수 있다.
* 기본 원칙은 **모든 클래스와 멤버의 접근성을 가능한 한 좁혀야 한다**
  * 패키지 외부에서 사용 할 일이 없다면 `package-private`으로 선언하자.
  * 한 클래스에서만 사용하는 클래스 혹은 인터페이스는 private static으로 중첩 시켜서 사용해보자.
  * public일 필요 없으면 package-private으로 좁혀보자. 즉, public이 아닌 경우 내부 구현에 해당하므로 이에 대한 접근 범위를 좁히라는 이야기이다.
* **다시 보는 접근 제어자**
  * **private**: 클래스 내부에서만 접근 가능
  * **package-private**: 같은 패키지에서는 접근 가능
  * **protected**: 같은 패키지 접근 + 멤버가 만약 protected로 선언 되어 있을 경우 상속 시 접근 가능
  * **public**: 외부 공개
* **클래스를 디자인하거나 설계 할때, 공개 API를 설계한 후 그 외의 멤버에 대해서는 private으로 만들어놓고 시작해보자. 그리고 나서 패키지의 다른 클래스가 접근해야 하는 멤버에 한하여 package-private으로 풀어주도록 하자.** 
  * 만약 package-private으로 풀어주는 멤버가 많아진다면 컴포넌트/클래스를 더 분해해야 하는지 고민해봐야 한다.
* **protected 멤버의 경우, 멤버에 접근 할 수 있는 대상 범위가 엄청 넓어진다.**
  * 사실상 공개 멤버이므로, 영원히 지원이 되어야 하며. 이를 위한 충분한 문서화를 통하여 외부에 공개 할 수 있어야 한다.
* 테스트를 위해서 클래스 혹은 인터페이스의 멤버를 공개API로 변경하는 일은 없어야 한다.
* **public 클래스의 인스턴스 필드는 public으로 두지 말자**
  * 가변 필드의 경우, 값을 제어 할 수 없을 뿐만 아니라 스레드 세이프 하지 않으므로 잠재적인 위험요소이다.
  * 상수 개념으로 사용한다면 공개해도 괜찮지만, 기본 타입의 값 혹은 불변 객체를 대상으로 하자
  * 길이가 0이 아닌 배열의 경우. 변경이 가능하니 주의하자.
  
  > 배열을 사용한다면 이를 수정 불가능한 리스트로 변경 후 공개하도록 하자
  ```java
  public class PublicConstant {
        private static final Thing[] thingsArr = { new Thing() };
        public static final List<Thing> thingsList = Collections.unmodifiableList(Arrays.asList(thingsArr));
  }
  ```
  > 복사본을 만들어서 활용하는 방법도 있다.
  ```java
  public class PublicConstant {
        private static final Thing[] thingsArr = { new Thing() };
        public static final Thing[] getThings() {
              return thingsArr.clone();
        }
  }
  ```  


## ITEM 16 - public 클래스에서는 public 필드가 아닌 접근자 메서드를 사용하라
> public 클래스에서 절대 가변 필드를 노출 시키지 말자. 불변 필드를 노출시키는 것은 나쁘진 않지만 완전히 안심할 수 없는 일이다.

* public 클래스의 필드가 public이면 이를 사용하는 클라이언트가 생길것이며, 이는 곧 내부 표현을 쉽게 변경할 수 없음을 뜻한다.
* 필드에 대한 직접 접근은 지양하고 **접근자**를 사용하자.
  ```java
  public class Point {
      private double x;
      private double y;
  
      public Point(double x, double y) {
          this.x = x;
          this.y = y;
      }
  
      public double getX() {
          return x;
      }
  
      public void setX(double x) {
          this.x = x;
      }
  
      public double getY() {
          return y;
      }
  
      public void setY(double y) {
          this.y = y;
      }
  }  
  ```
* public 클래스의 필드가 **불변**이면 노출 시 단점을 줄어들지만 여전히 좋은 생각은 아니다. API를 변경하지 않고는 표현 방식을 바꿀 수 없으며 필드를 읽을 때 부수 작업을 수행할 수 없다는 단점은 여전하다.

## ITEM 16 - public 클래스에서는 public 필드가 아닌 접근자 메서드를 사용하라
### 불변 클래스란?
  ```java
  public class Point {
      private final double x;
      private final double y;
  
      public Point(double x, double y) {
          this.x = x;
          this.y = y;
      }
  
      public double getX() {
          return x;
      }
  
      public double getY() {
          return y;
      }
  }  
  ```
내부 값을 수정 할 수 없는 클래스. 간직된 데이터는 객체가 파괴되는 순간까지 달라지지 않는다. 가변 클래스보다 설계 및 구현이 쉬우며 오류 발생 여지가 확실히 적다.

### 구현 규칙은?
* 객체 상태를 변경하는 설정자 메서드를 제공하지 않음
* 확장이 안되도록 한다.
* 모든 필드는 private final로 선언한다.
* 클래스 자신을 외에는 내부 구현에 접근하지 않도록 한다.

