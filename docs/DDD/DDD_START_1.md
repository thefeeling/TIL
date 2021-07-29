# DDD Start - 1장

> DDD Start의 1장 내용을 정리

## 도메인
*소프트웨어로 해결하려고 하는 문제의 영역.*

- 하나의 도메인은 다시 하위 도메인으로 나눌 수 있는데, 이렇게 나눠놓은 하위 도메인끼리 연동하여 완전한 기능을 제공하게 된다. 
- 이렇게 문제의 영역을 해결하는 과정에서 꼭 모든 기능을 소프트웨어로 구현해야 할 필요는 없다. 즉, 해당 도메인에서 필요한 기능을 외부 업체 또는 기능을 활용하여 연동 할 수도 있다.

## 도메인 모델
*문제 영역을 개념적으로 표현*

- 도메인에 대한 모델을 여러 이해 당사자가 이해할 수 있는 개념적 모델링을 할 수 있다.
  - 단순히 구현 수준에서의 모델이 아닌, 여러 이해 당사자가 이해할 수 있는 모델로서 작성하는 것이 의미가 있다.
- 표현하는 방법은 해당 도메인에 따라, 달라질 수 있다
  - UML, 그래프 등 가장 상황에 알맞는 표현을 사용하는 것이 좋다.
- 구현 모델은 개념 모델과 달라질 수 있는데, 개념 모델을 최대한 따르도록 작성하는 것이 좋다.

> *도메인은 여러 하위 도메인으로 구성 될 수 있는데, 하위 도메인이 다루는 영역별로 같은 혹시 비슷한 용어도 다르게 해석될 수 있다. 다시 말해, 여러 하위 도메인을 하나의 표현 모델로 모델링하면 혼선이 발생할 수 있기 때문에 좋지 않은 방법이라고 할 수 있다.*
## 도메인 모델 패턴

- 표현(Presentation)
사용자의 요청을 처리, 여기서 사용자는 실 사용자 혹은 외부 시스템이 될 수도 있다.
- 응용(Application)
요청 받은 기능을 실행, 업무 로직을 직접 구현하지 않으며, 도메인 계층을 조합하여 기능을 실행
- 도메인(Domain)
도메인을 규칙을 실행
- 인프라스트럭쳐(Infrastructure)
저수준에서의 즉, 데이터베이스 혹은 메시징과 같은 시스템 종속적인 부분을 처리

## 엔티티/벨류
엔티티와 벨류를 제대로 구분해야 도메인을 올바르게 설계하고 구현할 수 있기 때문에 구분하여 사용하는 것은 매우 중요하다. 

### 엔티티
```kotlin
class Order(
	val orderNumber: String, // 식별자
	...
)
```
- 고유의 식별자를 가진다.
  - 식별자를 위한 고유의 벨류 값을 만들어서 사용 할수도 있다.
- 엔티티의 식별자를 생성하는 시점은 도메인의 특징 혹은 사용하는 기술에 따라 달라질 수 있다.
  - 도메인의 유의미한 규칙을 사용
    - 비슷한 도메인 상황이더라도, 사용하는 식별자 생성 규칙이 달라질 수 있다.
  - UUID
  - 값을 직접 입력
    - 회원가입에서 사용하는 이메일 혹은 아이디일 경우
  - 일련번호 사용
    - 데이터베이스의 시퀀스(오라클 등) 혹은 자동증가 값을 사용하는 경우

### 벨류
```kotlin
class OrderLine(
	var product: Product,
	var price: Int,
	var quantity: Int,
	var amounts: Int
)
```
- 값을 표현하는 클래스/객체로서 개념적으로 완전한 하나를 표현할 떄 사용
- *일반적으로 하나 이상의 필드/멤버 값을 포함하는 경우가 많으나, 반드시 하나 이상을 포함해야 하는 것은 아니다. 의미를 좀 더 명확하게 사용하기 위해 사용하는 경우도 있다. 또한, 벨류 타입을 위한 기능을 추가할 수 도 있다.*
- 벨류 객체의 데이터를 변경 할때는 기존 데이터를 변경하는 방식(세터를 이용하는 방식 등)보다는 새로운 벨류 객체를 생성하는 방식을 선호한다.(Immutable한 접근)
  > 세터를 이용하는 방식을 사용할 경우, 참조 투명성과 관련된 문제가 생길 수 있다. 즉, 참조 값이 바뀌지 않은 상태에서 상태 값에 대한 변경이 의도하지 않은 상황에서 생길 수 있다.


### 도메인 모델에 세터를 사용하지 않기
- 세터를 사용하는 방식은 `도메인의 핵심 개념이나 의도를 명확하게 표현하기 힘들게 한다`
- 도메인 객체를 생성하는 시점에 완벽한 상태가 아닐 수 있게 되므로, 잠정적인 에러 가능성을 가질 수 밖에 없다.
- 이를 막기 위해서는, **객체를 생성하는 시점에 완벽한 상태 값을 주입해주는 것이다.** 즉, `생성자` 혹은 `팩토리 매소드` 등을 활용하여 필요한 객체 혹은 데이터를 모두 받아야 한다. 
```kotlin
class Order private constructor (
	val orderNumber: OrderNo,
	val totalAmount: Money,
	val shippingInfo: ShippingInfo
	val orderLine: List<OrderLine>,
	val orderState: OrderState = OrderState.PAYMENT_WAITING,
	val createdAt: LocalDateTime = LocalDateTime.now(),
	val updatedAt: LocalDateTime = LocalDateTime.now()
) {
	companion object {
		fun create(
			orderNumber: OrderNo,
			totalAmount: Money,
			shippingInfo: ShippingInfo
			orderLine: List<OrderLine>
		) = Order(
			orderNumber = orderNumber,
			totalAmount = totalAmount,
			shippingInfo = shippingInfo,
			orderLine = orderLine,
			orderState = OrderState.PAYMENT_WAITING,
			createdAt = LocalDateTime.now(),
			updatedAt = LocalDateTime.now()			
		)
	}
}
```
> Kotlin의 기본값 할당(Default Value Assignment)을 활용하면 필수 값과 옵션 값을 나눠서 할당 받을 수 있어서 편리하다.

## 도메인 용어
- 도메인의 용어를 코드에서 충분하게 반영하지 않으면, 개발자들은 코드에 대한 의미 해석에 부담을 주게 된다.
```kotlin
// 이게 뭔말이야...
emum class OrderState {
	STEP1, STPE2, STEP3 ...
}
```
- 실제 도메인에 맞는 유의미한 단어 선택을 통하여, 코드를 해석하는 과정을 줄이는 것이 중요하다. 이를 위해서는 적절한 단어 선택을 위한 이해 관계자들의 노력이 필요하다.
```kotlin
emum class OrderState(val statement: String) {
	PAYMENT_WAITING("입금대기"),
	PREPARING("배송준비"), 
	SHIPPED("출고"), 
	DELIVERING("배송중"), 
	DELIVERY_COMPLETED("배송완료")
}
``` 
