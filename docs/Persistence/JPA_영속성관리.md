# JPA 영속성 관리

> 자바 ORM 표준 JPA 프로그래밍 13장 내용을 정리

스프링과 같은 컨테이너 환경에서 JPA를 사용하게 되면, 컨테이너 레벨에서 트랜잭션과 영속성 컨텍스트를 관리해주므로 어플리케이션 개발이 쉬워지게 되는데, 문제가 되는 부분은 내부 동작에 대한 정확한 이해가 없을 때 생기는 트러블 슈팅이 어려워 지는 부분이다. 내부동작에 대한 이해, 스프링 컨테이너에서의 기본 전략, 지연로딩, OSIV에 대한 내용을 가볍게 정리하고자 한다.

## 트랜잭션 범위의 영속성 컨텍스트
### 스프링 컨테이너의 기본 전략
![트랜잭션_범위_영속성_컨텍스트](https://i.imgur.com/lgR6GfA.png)
- 스프링은 트랜잭션 범위의 영속성 컨텍스트를 기본 전략으로 사용한다. 
- 트랜잭션 범위와 영속성 컨텍스트의 생존 범위가 동일하며, 트랜잭션 종료 시, 영속성 컨텍스트도 동일하게 종료하게 된다.

![트랜잭션_범위_영속성_컨텍스트_AOP](https://i.imgur.com/vZtbhUl.png)
- 스프링 어플리케이션에서는 `@Transactional`을 사용하여 트랜잭션을 시작하게 되는데, 단순 호출처럼 보이는 부분도 사실 스프링의 트랜잭션 AOP가 먼저 작동하게 된다.
  * 스프링 트랜잭션 AOP는 대상 메소드를 호출하기 직전에 트랜잭션을 시작하며, 호출이 정상적으로 종료되면 트랜잭션을 커밋하고 종료하게 된다.
  * 트랜잭션 커밋 시, JPA는 영속성 컨텍스트를 플러시하여 변경 내용을 DB에 반영한 후 트랜잭션을 커밋하게 된다.
  * 예외가 발생하게 되면, 트랜잭션을 롤백하고 종료하게 되는데, 이때는 영속성 컨텍스트를 플러시하지 않게 된다.

![트랜잭션_영속성컨텍스트](https://i.imgur.com/t9RFewK.png)
- **트랜잭션이 같을 경우, 같은 영속성 컨텍스트를 사용한다.**
  * 다양한 위치에서 엔티티 매니저(EntityManager)를 주입받아 사용해도 트랜잭션이 같으면 항상 같은 영속성 컨텍스트를 사용하게 된다.

![스레드_영속성컨텍스트](https://i.imgur.com/al1qaZQ.png)
- **트랜잭션이 다를 경우, 다른 영속성 컨텍스트를 사용한다.**
  * **여러 스레드에서 동시에 요청에 올 경우, 같은 엔티티 매니저를 사용한다고 하더라도 트랜잭션에 따라 접근하는 영속성 컨텍스트가 달라진다.** 
  * 다시 말해, **스프링 컨테이너에서는 스레드별로 각기 다른 트랜잭션을 할당하게 되는데**, 따라서 같은 엔티티 매니저를 호출해도 접근하는 영속성 컨텍스트가 다르기 때문에 멀티스레드 환경에서도 안전하다.


## 준영속/지연 로딩
- 조회한 엔티티가 트랜잭션 범위인 서비스, 레파지토리 레이어에서는 영속성 컨텍스트에 의해 관리가 되기 때문에 영속 상태를 유지하지만, 이 밖의 레이어에서는 준영속 상태가 된다.
- 영속성 컨텍스트의 관리 밖에서는 `지연 로딩` 및 `변경 감지`가 동작하지 않는다.
  * 따라서, 비지니스 혹은 요구사항을 기반으로 한 변경에 대해서는 반드시 서비스/도메인 레이어에서 수행을 해야한다. 컨트롤러와 같은 영역에서 이를 수행하게 되면 레이어별로 책임이 모호해지고 어플리케이션의 유지보수성이 급격하게 떨어지게 된다.
  * 지연 로딩 기능이 동작하지 않기 때문에, 생기는 이슈는 생각보다 크다. 만약 컨트롤러와 같은 레이어에서 지연 로딩 상태의 연관 엔티티나 밸류를 조회하게 될 경우, `LazyIntializationException` 예외가 발생하게 된다.
- 지연 로딩을 해결할 수 있는 방법은 아래와 같다.
  * 필요한 엔티티를 미리 로딩
    1. 글로벌 페치 전략 수정
    2. JPQL 페치 조인
    3. 강제로 초기화
  * OSIV(Open Sessin in View)를 사용하여 엔티티를 항상 영속 상태로 유지

OSIV의 경우 별도로 정리하는걸로 하고, 먼저 필요 엔티티를 미리 로딩하는 방법에 대해 정리하고자 한다. 말 그대로, 뷰 혹은 컨트롤러 레이어에서 필요한 데이터를 영속성 컨텍스트 범위 내에서 미리 로딩을 하는 방법을 가리키며 위에서 정리한대로 3가지 방법이 존재한다.

### 글로벌 페치 전략 수정 - 즉시 로딩
주문 엔티티에서 주문 상품 벨류 목록을 담고 있는 예제로 주문 상품 벨류의 경우 별도의 식별자가 필요하지 않기 때문에 `@ElementCollection`을 이용하여 주문 엔티티에 매핑을 했으며 글로벌 페치 전략은 즉시 로딩으로 설정해주었다.

```kotlin
@Entity
@Table(name = "orders")
class Order protected constructor() {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	var id: Long = 0L
		protected set

	@Column(nullable = false, updatable = false)
	var memberId: Long = 0L
		protected set

	@Enumerated(value = EnumType.STRING)
	@Column(length = 20, nullable = false)
	var status: OrderStatus = OrderStatus.PAYMENT_WAITING
		protected set

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(
		name = "order_products",
		joinColumns = [
			JoinColumn(name = "id")
		]
	)
	@AttributeOverrides(
		value = [
			AttributeOverride(name = "productId", column = Column(name = "product_id")),
			AttributeOverride(name = "price", column = Column(name = "price")),
			AttributeOverride(name = "quantity", column = Column(name = "quantity")),
			AttributeOverride(name = "amounts", column = Column(name = "amounts")),
			AttributeOverride(name = "line_idx", column = Column(name = "line_idx"))
		]
	)
	@OrderBy(value = "line_idx")
	var orderProducts: MutableList<OrderProduct> = mutableListOf()
		protected set

	@CreationTimestamp
	@Column(nullable = false)
	var createdAt: LocalDateTime = LocalDateTime.now()
		protected set

	@UpdateTimestamp
	@Column(nullable = false)
	var updatedAt: LocalDateTime = LocalDateTime.now()
		protected set

	companion object {
		fun doOrder(
			memberId: Long,
			status: OrderStatus,
			products: List<OrderProduct>
		): Order {
			if (status !in listOf(OrderStatus.PAYMENT_WAITING, OrderStatus.PATMENT_COMPLETED)) throw IllegalArgumentException("올바른 주문 상태 값이 아닙니다.")
			if (products.isEmpty()) throw IllegalArgumentException("최소 한개 이상의 구매 상품을 포함해야 합니다.")
			return Order().also {
				it.memberId = memberId
				it.status = status
				it.orderProducts = products.toMutableList()
			}
		}
	}
}
```

```kotlin
@Service
@Transactional(read)
class OrderService(
	private val orderRepository: OrderRepository
) {
	fun getList(pageable: Pageable): Page<Order> {
		val list = orderRepository.findAll(pageable)
		return list
	}

	fun get(id: Long): Order {
		return orderRepository.findByIdOrNull(id)
				?: throw NotExistsOrderException("존재하지 않은 주문입니다.")
	}
}
```

서비스 레이어에서 주문 엔티티에 대한 조회를 목록/단건 조회할 수 있도록 가벼운 코드를 작성했다. 주문ID 기준의 단건 조회의 경우, 연관 콜렉션에 매핑 되어 있는 `order_products`테이블을 LEFT OUTER JOIN을 사용하여 바로 조회하는 것을 확인 할 수 있다.
![EAGER_LEFT_OUTER_JOIN](https://i.imgur.com/4N4g15c.png)


여기까지는 문제가 없다고 생각할 수 있다. 하지만, 문제는 목록 조회 부분에서 생기게 되는데, 바로 `N+1` 문제이다. 
![EAGER_N+1](https://i.imgur.com/oWSQpfD.png)

단건만 조회하는 엔티티라면 문제가 없겠지만, 대부분의 어플리케이션에서 목록 조회는 기본으로 하기 때문에 즉시 로딩을 사용함으로써 아래와 같은 단점이 생길 수 밖에 없다.
- **불필요한 벨류/엔티티 조회**
주문 엔티티에서 목록이 필요하지 않은 경우에도 매번 목록 데이터를 조회하기 때문에 DB 레벨에서의 오버헤드가 발생한다.
- **N+1 문제 발생**
  * 위 이미지를 통하여 볼 수 있듯이, 디비에 질의하는 쿼리 개수가 목록에서 반환하는 데이터 개수만큼의 IO가 발생하게 된다. 불필요한 IO 발생은 서버 어플리케이션에서는 당연히 지양해야 한다. 
  * JPQL을 사용하게 될 경우(ex. JpaRepository.findAll()), JPA는 SQL을 생성할 때 글로벌 페치 전략을 참고하지 않고 오직 JPQL 자체만 사용하게 된다. 아래는 SQL문을 생성하는 과정을 설명하고 있다.
    1. `select o from Order o` JPQL을 분석하여 `select * from Order` SQL을 실행
    2. 데이터베이스에서 결과를 받아 `Order`엔티티 목록을 생성
    3. `Order.orderProducts`의 글로벌 페치 전략이 즉시 로딩이므로 연관 벨류 콜렉션을 로딩해야 한다.
    4. 연관 벨류/엔티티를 영속성 컨텍스트에서 찾는다.
    5. 영속성 컨텍스트에 저장되어 있는 1차 캐싱 데이터가 없을 경우, DB에 질의하여 데이터를 가져온다. 이때, `Order`엔티티 목록의 개수만큼 DB에 질의를 하게 된다.

### 글로벌 페치 전략 수정 - 지연 로딩
- 위에서 겪었던 N+1 문제의 경우, 연관 벨류 콜렉션의 글로벌 페치 전략을 지연 로딩으로 변경하고, 이를 영속성 컨텍스트 범위 내에서 호출해주면 해결할 수 있다. 
```kotlin
@Service
@Transactional(readOnly = true)
class OrderService(
	private val orderRepository: OrderRepository
) {
	fun getList(pageable: Pageable): Page<Order> {
		val list = orderRepository.findAll(pageable)
		for (order in list) {
			// 실제 값을 사용할 때 프록시 객체가 초기화 된다.
			order.orderProducts.forEach { it.amounts }
		}
		return list
	}

	fun get(id: Long): Order {
		val order = (orderRepository.findByIdOrNull(id)
				?: throw NotExistsOrderException("존재하지 않은 주문입니다."))
		// 실제 값을 사용할 때 프록시 객체가 초기화 된다.
		order.orderProducts.forEach { it.amounts }
		return order
	}
}
```
- **글로벌 페치 전략을 지연 로딩으로 변경하게 될 경우, 연관 벨류/엔티티를 실제가 아닌 프록시 객체를 대상으로 조회하게 된다.** 
프록시의 경우 실제 사용할 때 초기화가 진행되기 때문에, 위 코드처럼 **실제 값을 호출하는 코드를 넣어줘야지 초기화가 진행된다.**
- 위 예제 코드의 경우, ID 기준의 조회 메소드인 get에서는 지연 로딩의 이점을 충분히 잘 살려냈다고 할 수 있지만, 목록 조회에서의 경우, 강제 초기화를 진행하더라도 즉시 로딩에서처럼 초기화 시 매번 매핑한 벨류 콜렉션을 조회하는 또 다른 의미의 `N+1`이 발생하게 된다.
- 이와 같은 형태의 `N+1`을 피하기 위해서 사용할 수 있는 방법으로는 아래와 같다. 
  * 하이버네이트의 `@BatchSize`가 있다. `@BatchSize`를 사용할 경우, 프록시를 통하여 초기화 대상이 되는 연관 벨류/엔티티의 실제 값을 가져오는 DB 질의를 in절로 수정하여 N번의 DB 질의가 발생하지 않도록 해준다. 하지만, `@BatchSize`를 사용하더라도 실제 연관 벨류/엔티티를 초기화 해줘야 하는건 동일하기 때문에, 아래와 같이 기준을 나눠서 매핑하는 전략을 생각해볼 수 있다.
  * JPQL fetch 조인을 사용하면 조회하면 시점에 SQL 조인을 사용하여 함께 로딩할 벨류/엔티티를 로딩할 수 있다. 하지만, JPQL의 페치 조인을 사용하게 되면 프레젠테이션 영역에 필요한 데이터에 맞춘 레파지토리 메소드가 늘어날 수 있다는 단점이 분명히 존재한다.
  > 트레이드오프가 필요한 지점이다. 성능적인 최적화 혹은 높은 TPS를 처리해야 하는 어플리케이션에서 불필요한 IO는 병목지점이 될 수 밖에 없다. 연관 엔티티를 모두 조회하더라도 Cache를 적용하여 불필요하게 DB IO가 발생하지 않도록 하는 방법도 좋고, 필요한 DB IO만 발생하도록 JPQL을 사용하는 방법 모두 상황에 따라 맞는 방법이라고 생각한다.

### 그래서 최선의 방법은?
- 결국, **트랜잭션 경계 밖에서의 준영속 상태가 문제의 핵심이다.** 
이를 해결하기 위해서는 경계 밖에서도 영속성 컨텍스트가 살아있도록 해주는 방법을 사용하면 자연스럽게 지연로딩에서 발생할 수 있는 문제를 해결할 수 있다. 그것이 바로 `OSIV`이다.

## OSIV
- Open Session In View
- 영속성 컨텍스트를 프레젠테이션 레이어까지 열어둔다는 뜻이다.
- 하이버네이트에서는 `OSIV` 스프링에서는 `OEIV`라고 부르며, 관례상으로 OSIV라고 통칭하는 듯 하다.
- 하이버네이트의 OSIV와 스프링에서의 OEIV는 비슷하지만 차이점이 분명하게 존재한다. 쉽게 생각하여 하이버네이트에서의 OSIV의 단점을 개선한 것이 OEIV라고 봐도 좋다.

### 과거 OSIV: 요청 당 트랜잭션
- 초창기 OSIV는 요청 당 트랜잭션을 지원했는데 아래 그림을 참고하자
![OSIV_요청당트랜잭션](https://i.imgur.com/sFEvc8g.png)
- 서블릿 필터 혹은 스프링 인터셉터에서 영속성 컨텍스트를 생성하며 이때부터 트랜잭션을 시작하고 요청이 끝날 때 트랜잭션과 영속성 컨텍스트를 함께 종료하게 된다.
- 프레젠테이션 레이어도 트랜잭션 경계내에 존재하게 됨에 따라, 지연로딩을 처리하기 위해 프록시 객체를 초기화해야 하는 과정이 필요없게 된다. 하지만, 트랜잭션의 경계가 비즈니스 레이어가 아닌 프레젠테이션 레이어부터 시작함에 따라 **트랜잭션의 경계가 모호해지며 비즈니스 레이어가 아닌 곳에서 데이터 변경이 발생하는 문제가 생길 수 있다.**

#### 요청 당 트랜잭션 모델의 문제점
- JDBC 커넥션 보유 시간 증가
  * JDBC 커넥션은 뷰의 렌더링이 모두 완료된 후에야 커넥션 풀로 반환된다. 따라서 뷰의 렌더링 시간이 길어지면 길어질수록 개별 요청을 처리하기 위한 스레드가 JDBC 커넥션을 보유하는 시간이 길어진다.
- 모호한 트랜잭션 경계
  * 예를 들어, 특정 컨트롤러에서 뷰에 표현하고자 하는 목적으로 엔티티를 변경한다면 요청에 마무리되는 시점에 해당 변경 사항이 영속성 컨텍스트에 변경 감지에 의해 반영이 되고 플러쉬됨에 따라 디비에 반영까지 되는 사이드 이펙트가 생기게 된다. 데이터의 변경이 도메인 계층이 아닌 이외 계층에서 이뤄진다면 유지보수성은 급격히 떨어지게 된다.
    - 뷰/프레젠테이션 레이어에서 엔티티를 변경하지 못하도록 하는 방법을 생각해볼 수 있다.
      * DTO 객체 반환
      * 세터 지양
      * 읽기 전용 인터페이스/메서드 제공
  * 일반적으로 애플리케이션의 트랜잭션 경계는 애플리케이션 레이어 SERVICE 를 경계로 한다. 즉, SERVICE 메서드 호출 전에 바로 트랜잭션이 시작되고 SERVICE 메서드 호출이 종료될 때 트랜잭션이 커밋되거나 롤백되는 것이 일반적이다. 이에 비해 과거 OSIV 서블릿 필터의 트랜잭션 경계는 HTTP 요청 처리 시간의 거의 대부분을 아우른다. 결국 트랜잭션 경계에 대한 일관성 있는 뷰를 유지할 수 없으며 이로 인해 다양한 문제가 발생할 여지가 있다.

### 스프링 OSIV: 비즈니스 계층 트랜잭션
![OSIV_SPRING](https://i.imgur.com/OxibUm8.png)
- `비즈니스 계층`에서 `트랜잭션`을 사용하는 OSIV
- 뷰 렌더링 시점의 지연 로딩을 허용하면서도 일관성 있는 트랜잭션 경계를 유지하는 합리적인 절충안으로 서블릿 필터에서 Session 을 오픈하되 트랜잭션 경계는 애플리케이션 레이어 범위로 한정하는 것이다.
- Spring 프레임워크에서는 `FlushMode` 와 `ConnectionReleaseMode` 의 조정을 통해 과거 OSIV 모델의 단점을 보완할 `OpenSessionInViewFliter`와 `OpenSessionInViewInterceptor`를 제공한다.
- 자세한 내용은 아래 내용을 참조하도록 하자
  1. 클라이언트의 요청 시, 서블릿 필터/인터셉터에서 영속성 컨텍스트를 생성한다. 단, 트랜잭션은 시작하지 않음
  2. 도메인 계층에서 트랜잭션을 시작할 때, 1번에서 생성한 영속성 컨텍스트를 사용하여 트랜잭션을 시작
  3. 도메인 계층의 서비스가 종료되면서 트랜잭션이 커밋하고 영속성 컨텍스트를 플러쉬한다. 트랜잭션은 종료가 되지만 영속성 컨텍스트를 종료하지 않는다.
  4. 영속성 컨텍스트가 도메인 레이어가 아닌 프레젠테이션 레이어에서도 유지됨에 따라, 반환하는 엔티티는 영속 상태를 유지한다.
  5. 필터/인터셉터로 돌아와서 영속성 컨텍스트를 종료한다. 이때는 영속성 컨텍스트를 플러쉬하지 않는다.

#### 트랜잭션 없는 읽기
- 트랜잭션 없이 영속성 컨텍스트를 플러쉬하게 되면 `javax.persistence.TransactionRequiredException` 예외가 발생
- 변경은 반드시 트랜잭션 내에서 이뤄져야 하는데, 조회의 경우 트랜잭션 없이도 가능하다. 이것을 바로 `트랜잭션 없이 읽기(Nontransactional reads)`라고 한다.
- **프록시 객체를 초기화하는 지연 로딩 역시 조회이므로 트랜잭션 없이 읽기가 가능하다.**
- 결국 스프링 OSIV를 이용하게 되면 도메인 계층에서만 트랜잭션을 이용하여 변경이 가능하고, 이 밖의 레이어인 프레젠테이션 레이어에서는 엔티티를 변경한다고 하여도 영속성 컨텍스트를 플러쉬하지 않기 때문에 변경이 불가능하고 오직 읽기만 가능하게 되는 것이다. 

#### 스프링 OSIV 사용 시 주의점
- 서비스 호출 후 컨트롤러에서 반환하는 엔티티가 있다고 가정해보자. 
이미 종료한 트랜잭션에서 반환한 엔티티이며 OSIV를 사용하고 있기 때문에 여전히 영속 상태를 유지하게 될 것이다. 요구사항에 의해 엔티티를 일부 값을 수정하며 바로 뷰를 반환하면 OSIV를 사용하기 때문에 문제가 전혀 없다. 
하지만, **바로 뷰로 데이터를 반환하지 않고 또 다른 서비스 메서드를 호출하여 트랜잭션을 시작할 경우 문제가 발생하게 된다.** 
왜냐하면, 스프링 OSIV에 의하여 영속성 컨텍스트를 살아 있는 상태를 유지하기 때문에, 이전에 변경한 값이 새로 시작한 트랜잭션 커밋에 의해, 영속성 컨텍스트를 플러쉬하게 되는데 플러쉬하는 시점에 이전에 변경한 엔티티의 변경사항이 그대로 실제 데이터베이스에 반영되기 때문이다.
```puml
actor User as U
participant MemberController as A
participant MemberService as B
participant MemberRepository as C
participant AnotherService as D
autonumber
U -> A: HTTP 요청
A -> B: Member 조회 서비스 메서드 실행\n - 트랜잭션 시작
activate B
B <-> C: Member 엔티티 조회 후 반환
B -> A: Member 엔티티 반환\n - Transaction Commit 그리고 영속성 컨텍스트 플러쉬
deactivate B
A -> A: Member 엔티티 수정\n - member.setName("XXX")
alt 뷰를 반환하지 않고 별도의 트랜잭션을 시작하는 경우
	autonumber 6
	A -> D: 별도 서비스 메서드 실행\n - 트랜잭션 시작
	activate D
	D -> A: 메서드 반환\n - 트랜잭션 커밋 그리고 영속성 컨텍스트 플러쉬\n: 5번에서 member.setName("XXX")를 실행한 내용이 \n영속성 컨텍스트의 변경감지에 의하여 반영 그리고 \n트랜잭션울 커밋하고 영속성 컨텍스트가 플러쉬되어 \n실제 데이터베이스에 변경을 반영
	deactivate D	
else 
end
A -> U: 뷰에 맞는 데이터 반환
```
- 위와 같은 문제는 같은 영속성 컨텍스트를 여러 트랜잭션에서 공유하기 때문에 발생하는 문제로 해결하는 단순한 방법은 **트랜잭션이 있는 비즈니스 로직을 모두 호출하고 나서 엔티티를 변경하면 쉽게 해결된다.** 
다시 말해, **선 트랜잭션 후 변경으로 요약할 수 있다.**

### OSIV를 사용하는 것이 만능이 아니다.
- 객체 그래프의 뎁스가 깊어진다면 OSIV를 사용했을 때, 성능적으로 신경써야 할 부분도 많아진다.
- 도메인의 요구사항 단순 엔티티만을 반환하여 끝나는 경우는 생각보다 드물다. 특히 통계 성격의 데이터를 조회해야 하는 경우가 대표적인데, 이럴 경우 차리리 JPQL을 사용하여 데이터를 조회하고 이를 DTO 객체로 바인딩하여 반환하는 것이 생각보다 쉬운 해결책일 수도 있다. 
- 너무 복잡하거나 DB 종속적인 연산을 사용해야 할 경우도 생길 수 있는데, 이럴 경우 하이버네이트의 `@SubSelect`를 사용하여 별도로 조회 전용 도메인 객체를 만들어서 해결하는 방법도 존재한다. 물론 DB 종속적인 연산을 사용하게 됨에 따라 추후 DB 변경에 대한 대응이 어려워질 수 있는 부분도 분명 존재하지만, 일반적으로 사용하고 있는 데이터베이스를 변경하는 작업은 쉽게 일어나지도 않을 뿐더러 완벽하게 어플리케이션 레이어에서 변경을 쉽게 커버할 수 있는 경우 더 드물다고 생각한다. 

